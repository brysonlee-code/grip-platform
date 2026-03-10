/**
 * Calibration Controller
 * G.R.I.P. Platform — orchestrates the 18-second biometric calibration sequence
 * @module calibration/calibration-controller
 */

import { CALIBRATION_DURATION } from '../config/constants.js';
import { mean, standardDeviation } from '../utils/math-utils.js';

/**
 * Calibration phase definitions.
 * Each phase has a name, start/end time (seconds), and descriptive label.
 * @type {Array<{id: string, label: string, startSec: number, endSec: number}>}
 */
const PHASES = [
    { id: 'neural',    label: 'Initializing Neural Interface...',   startSec: 0,  endSec: 3  },
    { id: 'eye',       label: 'Calibrating Eye Tracking...',        startSec: 3,  endSec: 7  },
    { id: 'voice',     label: 'Analyzing Vocal Patterns...',        startSec: 7,  endSec: 11 },
    { id: 'baseline',  label: 'Establishing Baseline...',           startSec: 11, endSec: 14 },
    { id: 'complete',  label: 'Calibration Complete',               startSec: 14, endSec: 18 },
];

/**
 * CalibrationController manages the calibration sequence, collecting baseline
 * biometric data and emitting phase/progress events.
 */
export class CalibrationController {
    /**
     * @param {Object} biometricEngine — the BiometricEngine instance providing sample()
     */
    constructor(biometricEngine) {
        this._engine = biometricEngine;
        this._aborted = false;
        this._running = false;
        this._rafId = null;
        this._startTime = 0;
        this._currentPhaseIndex = -1;
        this._baseline = null;

        // Baseline collection buffers
        this._baselineSamples = {
            eegAmplitudes: [],
            bandPowers: { delta: [], theta: [], alpha: [], beta: [], gamma: [] },
            gazeX: [],
            gazeY: [],
            fixationDurations: [],
            blinkRates: [],
            jitter: [],
            shimmer: [],
            hnr: [],
            f0: [],
            prosody: [],
        };

        // Event listeners
        this._listeners = {
            'phase-change': [],
            'progress': [],
            'complete': [],
            'tick': [],
        };
    }

    /**
     * Register an event listener.
     * @param {'phase-change'|'progress'|'complete'|'tick'} event
     * @param {Function} callback
     */
    on(event, callback) {
        if (this._listeners[event]) {
            this._listeners[event].push(callback);
        }
    }

    /**
     * Remove an event listener.
     * @param {string} event
     * @param {Function} callback
     */
    off(event, callback) {
        if (this._listeners[event]) {
            this._listeners[event] = this._listeners[event].filter(fn => fn !== callback);
        }
    }

    /**
     * Emit an event to all registered listeners.
     * @param {string} event
     * @param {*} data
     */
    _emit(event, data) {
        if (this._listeners[event]) {
            for (const fn of this._listeners[event]) {
                try { fn(data); } catch (e) { console.warn('[CalibrationController] listener error:', e); }
            }
        }
    }

    /**
     * Start the calibration sequence.
     * @returns {Promise<Object>} Resolves with baseline data when calibration completes.
     */
    start() {
        if (this._running) {
            return Promise.reject(new Error('Calibration already running'));
        }

        this._aborted = false;
        this._running = true;
        this._currentPhaseIndex = -1;
        this._baseline = null;
        this._startTime = performance.now();

        // Reset baseline samples
        this._baselineSamples.eegAmplitudes = [];
        for (const key of Object.keys(this._baselineSamples.bandPowers)) {
            this._baselineSamples.bandPowers[key] = [];
        }
        this._baselineSamples.gazeX = [];
        this._baselineSamples.gazeY = [];
        this._baselineSamples.fixationDurations = [];
        this._baselineSamples.blinkRates = [];
        this._baselineSamples.jitter = [];
        this._baselineSamples.shimmer = [];
        this._baselineSamples.hnr = [];
        this._baselineSamples.f0 = [];
        this._baselineSamples.prosody = [];

        return new Promise((resolve, reject) => {
            const tick = () => {
                if (this._aborted) {
                    this._running = false;
                    reject(new Error('Calibration aborted'));
                    return;
                }

                const elapsed = performance.now() - this._startTime;
                const elapsedSec = elapsed / 1000;
                const totalDuration = CALIBRATION_DURATION / 1000; // 18s
                const progress = Math.min(elapsedSec / totalDuration, 1);

                // Determine current phase
                let phaseIndex = PHASES.length - 1;
                for (let i = 0; i < PHASES.length; i++) {
                    if (elapsedSec < PHASES[i].endSec) {
                        phaseIndex = i;
                        break;
                    }
                }

                // Emit phase change
                if (phaseIndex !== this._currentPhaseIndex) {
                    this._currentPhaseIndex = phaseIndex;
                    const phase = PHASES[phaseIndex];
                    this._emit('phase-change', {
                        phaseIndex,
                        phaseId: phase.id,
                        label: phase.label,
                        totalPhases: PHASES.length,
                    });
                }

                // Sample biometric engine and collect data
                const snapshot = this._sampleEngine(elapsedSec);

                // Emit progress
                this._emit('progress', { progress, elapsedSec, totalDuration });

                // Emit tick with snapshot for visualizer
                this._emit('tick', {
                    snapshot,
                    elapsedSec,
                    phaseId: PHASES[phaseIndex].id,
                });

                // Collect baseline during baseline + complete phases (11-18s)
                if (elapsedSec >= 11 && elapsedSec < 18) {
                    this._collectBaseline(snapshot);
                }

                // Check completion
                if (elapsedSec >= totalDuration) {
                    this._running = false;
                    this._baseline = this._computeBaseline();
                    this._emit('complete', this._baseline);
                    resolve(this._baseline);
                    return;
                }

                this._rafId = requestAnimationFrame(tick);
            };

            this._rafId = requestAnimationFrame(tick);
        });
    }

    /**
     * Sample the biometric engine, applying calibration-phase-specific behavior.
     * During early phases, streams come online progressively.
     * @param {number} elapsedSec
     * @returns {Object} biometric snapshot
     */
    _sampleEngine(elapsedSec) {
        // Get raw sample from engine
        let raw;
        if (this._engine && typeof this._engine.sample === 'function') {
            raw = this._engine.sample();
        } else {
            raw = this._generateFallbackSample(elapsedSec);
        }

        const snapshot = { eeg: null, eye: null, voice: null };
        const phase = PHASES[this._currentPhaseIndex];

        // Phase 0 (0-3s): EEG comes online — transition from noise to signal
        if (elapsedSec >= 0 && raw?.eeg) {
            const signalStrength = Math.min(elapsedSec / 3, 1);
            const noise = (Math.random() - 0.5) * 2 * (1 - signalStrength);
            snapshot.eeg = {
                amplitude: raw.eeg.amplitude * signalStrength + noise * (1 - signalStrength * 0.7),
                bandPowers: {},
            };
            if (raw.eeg.bandPowers) {
                for (const key of Object.keys(raw.eeg.bandPowers)) {
                    snapshot.eeg.bandPowers[key] = raw.eeg.bandPowers[key] * signalStrength;
                }
            }
        }

        // Phase 1 (3-7s): Eye tracking comes online
        if (elapsedSec >= 3 && raw?.eye) {
            const eyeStrength = Math.min((elapsedSec - 3) / 2, 1);
            snapshot.eye = {
                gazeX: raw.eye.gazeX ?? 0.5,
                gazeY: raw.eye.gazeY ?? 0.5,
                fixating: raw.eye.fixating ?? false,
                blinking: raw.eye.blinking ?? false,
                fixationCount: Math.floor((raw.eye.fixationCount ?? 0) * eyeStrength),
                avgFixationDuration: (raw.eye.avgFixationDuration ?? 200) * eyeStrength,
                blinkRate: (raw.eye.blinkRate ?? 15) * eyeStrength,
            };
        }

        // Phase 2 (7-11s): Voice comes online
        if (elapsedSec >= 7 && raw?.voice) {
            const voiceStrength = Math.min((elapsedSec - 7) / 2, 1);
            snapshot.voice = {
                jitter: (raw.voice.jitter ?? 0.5) * voiceStrength,
                shimmer: (raw.voice.shimmer ?? 1.5) * voiceStrength,
                hnr: (raw.voice.hnr ?? 20) * voiceStrength,
                f0: 80 + ((raw.voice.f0 ?? 120) - 80) * voiceStrength,
                prosody: (raw.voice.prosody ?? 0.6) * voiceStrength,
                stressIndex: (raw.voice.stressIndex ?? 30) * voiceStrength,
            };
        }

        return snapshot;
    }

    /**
     * Generate a fallback biometric sample when no engine is connected.
     * Produces plausible simulated data for all three streams.
     * @param {number} elapsedSec
     * @returns {Object}
     */
    _generateFallbackSample(elapsedSec) {
        const t = elapsedSec;

        // EEG: composite sine wave simulating neural oscillations
        const eegAmplitude =
            0.3 * Math.sin(t * 2 * Math.PI * 10)  +  // alpha ~10Hz
            0.15 * Math.sin(t * 2 * Math.PI * 4)  +  // theta ~4Hz
            0.1 * Math.sin(t * 2 * Math.PI * 20)  +  // beta ~20Hz
            0.05 * Math.sin(t * 2 * Math.PI * 1.5) + // delta ~1.5Hz
            0.08 * Math.sin(t * 2 * Math.PI * 40)  + // gamma ~40Hz
            (Math.random() - 0.5) * 0.15;             // noise

        const bandPowers = {
            delta: 0.25 + Math.sin(t * 0.3) * 0.1 + Math.random() * 0.05,
            theta: 0.30 + Math.sin(t * 0.5) * 0.08 + Math.random() * 0.05,
            alpha: 0.55 + Math.sin(t * 0.7) * 0.12 + Math.random() * 0.05,
            beta:  0.35 + Math.sin(t * 0.4) * 0.1 + Math.random() * 0.05,
            gamma: 0.15 + Math.sin(t * 0.6) * 0.06 + Math.random() * 0.03,
        };

        // Eye tracking: gentle saccades around center
        const gazeX = 0.5 + 0.15 * Math.sin(t * 0.8) + 0.05 * Math.sin(t * 2.3) + (Math.random() - 0.5) * 0.02;
        const gazeY = 0.5 + 0.1 * Math.cos(t * 0.6) + 0.04 * Math.cos(t * 1.7) + (Math.random() - 0.5) * 0.02;
        const fixating = Math.sin(t * 1.2) > 0.3;
        const blinking = Math.random() < 0.015; // ~1 blink/s at 60fps

        // Voice: calm baseline values
        const jitter  = 0.6 + Math.sin(t * 0.4) * 0.2 + Math.random() * 0.1;
        const shimmer = 1.8 + Math.sin(t * 0.3) * 0.4 + Math.random() * 0.2;
        const hnr     = 22 + Math.sin(t * 0.5) * 2 + Math.random() * 1;
        const f0      = 125 + Math.sin(t * 0.35) * 10 + Math.random() * 5;
        const prosody = 0.65 + Math.sin(t * 0.25) * 0.1 + Math.random() * 0.05;

        return {
            eeg: { amplitude: eegAmplitude, bandPowers },
            eye: {
                gazeX, gazeY, fixating, blinking,
                fixationCount: Math.floor(t * 1.5),
                avgFixationDuration: 220 + Math.sin(t * 0.2) * 40,
                blinkRate: 14 + Math.sin(t * 0.15) * 3,
            },
            voice: {
                jitter, shimmer, hnr, f0, prosody,
                stressIndex: 25 + Math.sin(t * 0.3) * 8 + Math.random() * 3,
            },
        };
    }

    /**
     * Collect baseline samples from a snapshot.
     * @param {Object} snapshot
     */
    _collectBaseline(snapshot) {
        if (snapshot.eeg) {
            this._baselineSamples.eegAmplitudes.push(Math.abs(snapshot.eeg.amplitude));
            if (snapshot.eeg.bandPowers) {
                for (const key of Object.keys(snapshot.eeg.bandPowers)) {
                    if (this._baselineSamples.bandPowers[key]) {
                        this._baselineSamples.bandPowers[key].push(snapshot.eeg.bandPowers[key]);
                    }
                }
            }
        }
        if (snapshot.eye) {
            this._baselineSamples.gazeX.push(snapshot.eye.gazeX);
            this._baselineSamples.gazeY.push(snapshot.eye.gazeY);
            if (snapshot.eye.avgFixationDuration > 0) {
                this._baselineSamples.fixationDurations.push(snapshot.eye.avgFixationDuration);
            }
            if (snapshot.eye.blinkRate > 0) {
                this._baselineSamples.blinkRates.push(snapshot.eye.blinkRate);
            }
        }
        if (snapshot.voice) {
            this._baselineSamples.jitter.push(snapshot.voice.jitter);
            this._baselineSamples.shimmer.push(snapshot.voice.shimmer);
            this._baselineSamples.hnr.push(snapshot.voice.hnr);
            this._baselineSamples.f0.push(snapshot.voice.f0);
            this._baselineSamples.prosody.push(snapshot.voice.prosody);
        }
    }

    /**
     * Compute baseline metrics from collected samples.
     * @returns {Object} baseline object with means and standard deviations
     */
    _computeBaseline() {
        const s = this._baselineSamples;

        return {
            timestamp: Date.now(),
            eeg: {
                meanAmplitude: mean(s.eegAmplitudes),
                sdAmplitude: standardDeviation(s.eegAmplitudes),
                bandPowers: {
                    delta: mean(s.bandPowers.delta),
                    theta: mean(s.bandPowers.theta),
                    alpha: mean(s.bandPowers.alpha),
                    beta:  mean(s.bandPowers.beta),
                    gamma: mean(s.bandPowers.gamma),
                },
            },
            eye: {
                gazeDispersion: standardDeviation(s.gazeX) + standardDeviation(s.gazeY),
                meanFixationDuration: mean(s.fixationDurations),
                sdFixationDuration: standardDeviation(s.fixationDurations),
                meanBlinkRate: mean(s.blinkRates),
            },
            voice: {
                meanJitter: mean(s.jitter),
                meanShimmer: mean(s.shimmer),
                meanHNR: mean(s.hnr),
                meanF0: mean(s.f0),
                sdF0: standardDeviation(s.f0),
                meanProsody: mean(s.prosody),
            },
            sampleCount: s.eegAmplitudes.length,
        };
    }

    /**
     * Get the computed baseline (available after calibration completes).
     * @returns {Object|null}
     */
    getBaseline() {
        return this._baseline;
    }

    /**
     * Abort the calibration sequence.
     */
    abort() {
        this._aborted = true;
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        this._running = false;
    }

    /**
     * Whether calibration is currently running.
     * @returns {boolean}
     */
    get isRunning() {
        return this._running;
    }
}
