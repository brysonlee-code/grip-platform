/**
 * Biometric Engine
 * G.R.I.P. Platform — orchestrates all biometric simulators (EEG, eye tracking,
 * voice) and provides a unified API for the session controller.
 * @module biometrics/biometric-engine
 */

import { EEGSimulator } from './eeg-simulator.js';
import { EyeTrackingSimulator } from './eye-tracking-simulator.js';
import { VoiceSimulator } from './voice-simulator.js';
import { clamp, normalize } from '../utils/math-utils.js';

/**
 * Default canvas dimensions for eye tracking if none are provided.
 */
const DEFAULT_CANVAS_WIDTH = 1280;
const DEFAULT_CANVAS_HEIGHT = 720;

/**
 * Orchestrates the EEG, eye tracking, and voice biometric simulators.
 * Manages frame timing, propagates cognitive load to all sub-simulators,
 * and exposes a clean snapshot API for downstream consumers such as
 * the session controller and NFI calculator.
 */
export class BiometricEngine {

    /**
     * Create a new biometric engine with all three simulators.
     * @param {Object} [options] - Configuration options.
     * @param {number} [options.canvasWidth=1280]  - Eye tracking canvas width.
     * @param {number} [options.canvasHeight=720]  - Eye tracking canvas height.
     */
    constructor(options = {}) {
        const canvasWidth = options.canvasWidth || DEFAULT_CANVAS_WIDTH;
        const canvasHeight = options.canvasHeight || DEFAULT_CANVAS_HEIGHT;

        /** @type {EEGSimulator} EEG signal simulator. */
        this._eeg = new EEGSimulator();

        /** @type {EyeTrackingSimulator} Eye tracking simulator. */
        this._eyeTracking = new EyeTrackingSimulator(canvasWidth, canvasHeight);

        /** @type {VoiceSimulator} Voice biomarker simulator. */
        this._voice = new VoiceSimulator();

        /** @type {number|null} requestAnimationFrame ID. */
        this._rafId = null;

        /** @type {boolean} Whether the engine is currently running. */
        this._running = false;

        /** @type {boolean} Whether the engine is paused. */
        this._paused = false;

        /** @type {number} Timestamp of the previous frame (ms), from performance.now(). */
        this._lastFrameTime = 0;

        /** @type {number} Accumulated simulation time in seconds. */
        this._elapsedTime = 0;

        /** @type {number} Current cognitive load level [0, 1]. */
        this._cognitiveLoad = 0.3;

        /** @type {Function[]} Registered per-frame update callbacks. */
        this._listeners = [];

        /** @type {Object|null} Most recent snapshot cached for getSnapshot(). */
        this._lastSnapshot = null;

        // Bind the frame loop to this instance
        this._frameLoop = this._frameLoop.bind(this);
    }

    /**
     * Start the update loop at display refresh rate (~60fps).
     * If already running, this is a no-op.
     */
    start() {
        if (this._running) return;

        this._running = true;
        this._paused = false;
        this._lastFrameTime = performance.now();
        this._rafId = requestAnimationFrame(this._frameLoop);
    }

    /**
     * Stop the update loop and cancel any pending animation frame.
     */
    stop() {
        this._running = false;
        this._paused = false;
        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    /**
     * Pause the simulation. Time stops advancing but the engine remains
     * in a started state. Call resume() to continue.
     */
    pause() {
        if (!this._running) return;
        this._paused = true;
    }

    /**
     * Resume a paused simulation. Resets the frame timestamp to avoid
     * a large delta-time jump.
     */
    resume() {
        if (!this._running || !this._paused) return;
        this._paused = false;
        this._lastFrameTime = performance.now();
    }

    /**
     * Set the cognitive load level and propagate it to all simulators.
     * @param {number} level - Cognitive load in [0, 1].
     */
    setCognitiveLoad(level) {
        this._cognitiveLoad = clamp(level, 0, 1);
        this._eeg.setCognitiveLoad(this._cognitiveLoad);
        this._eyeTracking.setCognitiveLoad(this._cognitiveLoad);
        this._voice.setCognitiveLoad(this._cognitiveLoad);
    }

    /**
     * The main animation frame callback. Computes delta time, updates all
     * simulators, builds a snapshot, and notifies listeners.
     * @param {DOMHighResTimeStamp} now - Current timestamp from requestAnimationFrame.
     * @private
     */
    _frameLoop(now) {
        if (!this._running) return;

        // Schedule next frame first to maintain loop
        this._rafId = requestAnimationFrame(this._frameLoop);

        if (this._paused) return;

        // Compute delta time in seconds, clamped to avoid spiral of death
        const rawDelta = (now - this._lastFrameTime) / 1000;
        const deltaTime = Math.min(rawDelta, 0.1); // cap at 100ms
        this._lastFrameTime = now;
        this._elapsedTime += deltaTime;

        // Update all simulators
        const eegSample = this._eeg.getSample(this._elapsedTime);
        this._eyeTracking.update(deltaTime);
        this._voice.update(deltaTime);

        // Build snapshot
        const snapshot = {
            eeg: {
                raw: eegSample.raw,
                bands: eegSample.bands,
                powerSpectrum: eegSample.powerSpectrum,
                bandPowers: this._eeg.getBandPowers(),
            },
            eyeTracking: {
                ...this._eyeTracking.getState(),
                metrics: this._eyeTracking.getMetrics(),
                heatmap: this._eyeTracking.getHeatmap(),
            },
            voice: {
                ...this._voice.getMetrics(),
                stressIndex: this._voice.getStressIndex(),
            },
            timestamp: this._elapsedTime,
            deltaTime,
            cognitiveLoad: this._cognitiveLoad,
        };

        this._lastSnapshot = snapshot;

        // Notify all listeners
        for (let i = 0; i < this._listeners.length; i++) {
            try {
                this._listeners[i](snapshot);
            } catch (err) {
                console.error('[BiometricEngine] Listener error:', err);
            }
        }
    }

    /**
     * Return the most recent biometric snapshot. If the engine has not yet
     * produced a frame, generates one on demand.
     * @returns {{ eeg: Object, eyeTracking: Object, voice: Object, timestamp: number }}
     */
    getSnapshot() {
        if (this._lastSnapshot) {
            return this._lastSnapshot;
        }

        // Generate an initial snapshot if none exists yet
        const eegSample = this._eeg.getSample(0);
        return {
            eeg: {
                raw: eegSample.raw,
                bands: eegSample.bands,
                powerSpectrum: eegSample.powerSpectrum,
                bandPowers: this._eeg.getBandPowers(),
            },
            eyeTracking: {
                ...this._eyeTracking.getState(),
                metrics: this._eyeTracking.getMetrics(),
            },
            voice: {
                ...this._voice.getMetrics(),
                stressIndex: this._voice.getStressIndex(),
            },
            timestamp: 0,
            deltaTime: 0,
            cognitiveLoad: this._cognitiveLoad,
        };
    }

    /**
     * Register a callback that will be invoked on every frame with the
     * current biometric snapshot.
     * @param {Function} callback - Function receiving a snapshot object.
     * @returns {Function} An unsubscribe function that removes the listener.
     */
    onUpdate(callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('onUpdate expects a function');
        }
        this._listeners.push(callback);

        // Return an unsubscribe function
        return () => {
            const index = this._listeners.indexOf(callback);
            if (index !== -1) {
                this._listeners.splice(index, 1);
            }
        };
    }

    /**
     * Compute aggregate metrics suitable for NFI (Neural Fidelity Index) calculation.
     * Combines key indicators from all three biometric streams into a normalized
     * summary object.
     * @returns {Object} Aggregate metrics for NFI computation.
     */
    getAggregateMetrics() {
        const bandPowers = this._eeg.getBandPowers();
        const eyeMetrics = this._eyeTracking.getMetrics();
        const eyeState = this._eyeTracking.getState();
        const voiceMetrics = this._voice.getMetrics();
        const voiceStress = this._voice.getStressIndex();

        // EEG-derived metrics
        const totalPower = bandPowers.delta + bandPowers.theta +
            bandPowers.alpha + bandPowers.beta + bandPowers.gamma;
        const betaAlphaRatio = bandPowers.alpha > 0
            ? bandPowers.beta / bandPowers.alpha
            : 0;
        const thetaBetaRatio = bandPowers.beta > 0
            ? bandPowers.theta / bandPowers.beta
            : 0;
        const gammaFraction = totalPower > 0
            ? bandPowers.gamma / totalPower
            : 0;

        // Engagement index: beta / (alpha + theta)
        const engagementIndex = (bandPowers.alpha + bandPowers.theta) > 0
            ? bandPowers.beta / (bandPowers.alpha + bandPowers.theta)
            : 0;

        // Eye tracking derived metrics
        const focusScore = clamp(eyeMetrics.focusZoneRatio, 0, 1);
        const fixationStability = eyeMetrics.avgFixationDuration > 0
            ? normalize(eyeMetrics.avgFixationDuration, 100, 600)
            : 0.5;
        const pupilLoadIndex = normalize(eyeState.pupilDilation, 3.0, 6.5);

        return {
            // EEG
            bandPowers,
            betaAlphaRatio,
            thetaBetaRatio,
            gammaFraction,
            engagementIndex: clamp(normalize(engagementIndex, 0, 3), 0, 1),

            // Eye tracking
            focusScore,
            fixationStability,
            pupilLoadIndex,
            blinkRate: eyeMetrics.blinkRate,
            scanPathLength: eyeMetrics.scanPathLength,

            // Voice
            voiceStressIndex: voiceStress,
            jitter: voiceMetrics.jitter,
            shimmer: voiceMetrics.shimmer,
            f0: voiceMetrics.f0,
            hnr: voiceMetrics.hnr,
            speechRate: voiceMetrics.speechRate,
            prosodyVariation: voiceMetrics.prosodyVariation,

            // Meta
            timestamp: this._elapsedTime,
            cognitiveLoad: this._cognitiveLoad,
        };
    }

    /**
     * Reset all simulators and internal state. The engine is stopped.
     */
    reset() {
        this.stop();
        this._eeg.reset();
        this._eyeTracking.reset();
        this._voice.reset();
        this._elapsedTime = 0;
        this._lastFrameTime = 0;
        this._cognitiveLoad = 0.3;
        this._lastSnapshot = null;
        // Listeners are preserved across reset
    }

    /**
     * Check whether the engine is currently running.
     * @returns {boolean}
     */
    get isRunning() {
        return this._running;
    }

    /**
     * Check whether the engine is currently paused.
     * @returns {boolean}
     */
    get isPaused() {
        return this._paused;
    }

    /**
     * Get the total elapsed simulation time in seconds.
     * @returns {number}
     */
    get elapsedTime() {
        return this._elapsedTime;
    }
}
