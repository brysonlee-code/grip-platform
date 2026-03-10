/**
 * EEG Simulator
 * G.R.I.P. Platform — generates realistic EEG signals using superimposed sine waves
 * with pink noise and cognitive load modulation.
 * @module biometrics/eeg-simulator
 */

import { gaussian } from '../utils/math-utils.js';
import { randomBetween } from '../utils/random.js';
import { clamp, lerp, ema } from '../utils/math-utils.js';

const TWO_PI = 2 * Math.PI;

/**
 * Conceptual sample rate for the EEG signal in Hz.
 * Actual generation occurs at ~60fps with interpolation.
 * @type {number}
 */
const SAMPLE_RATE = 256;

/**
 * Number of bins in the power spectrum output.
 * Covers 0-64 Hz at 0.5 Hz resolution.
 * @type {number}
 */
const SPECTRUM_BINS = 128;

/**
 * Default parameters for each EEG frequency band.
 * Amplitudes are in arbitrary microvolts-like units.
 */
const BAND_DEFAULTS = {
    delta: { freqMin: 0.5, freqMax: 4, baseAmplitude: 20, phase: 0 },
    theta: { freqMin: 4, freqMax: 8, baseAmplitude: 15, phase: 0 },
    alpha: { freqMin: 8, freqMax: 13, baseAmplitude: 30, phase: 0 },
    beta:  { freqMin: 13, freqMax: 30, baseAmplitude: 10, phase: 0 },
    gamma: { freqMin: 30, freqMax: 50, baseAmplitude: 5, phase: 0 },
};

/**
 * Number of sub-frequencies to superimpose within each band
 * for a richer, more realistic signal.
 * @type {number}
 */
const HARMONICS_PER_BAND = 4;

/**
 * Simulates multi-channel EEG data using superimposed sine waves across five
 * canonical frequency bands (delta, theta, alpha, beta, gamma), modulated by
 * a cognitive load parameter and overlaid with pink (1/f) noise.
 */
export class EEGSimulator {

    /**
     * Create a new EEG simulator with default band parameters.
     */
    constructor() {
        /** @type {number} Current cognitive load level in [0, 1]. */
        this._cognitiveLoad = 0.3;

        /** @type {number} Smoothed cognitive load for gradual transitions. */
        this._smoothedLoad = 0.3;

        /** @type {number} Smoothing factor for cognitive load EMA. */
        this._loadSmoothing = 0.02;

        /** @type {Object} Band state objects keyed by band name. */
        this._bands = {};

        /** @type {number} Running time accumulator in seconds. */
        this._time = 0;

        /** @type {number[]} Pink noise filter state (Voss-McCartney rows). */
        this._pinkNoiseState = new Array(16).fill(0);

        /** @type {number} Pink noise running total. */
        this._pinkNoiseRunning = 0;

        /** @type {number} Pink noise sample counter. */
        this._pinkNoiseIndex = 0;

        /** @type {number} Last computed raw sample (for interpolation). */
        this._lastRawSample = 0;

        /** @type {Object} Last computed band contributions. */
        this._lastBands = { delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0 };

        /** @type {number[]} Cached power spectrum array. */
        this._powerSpectrum = new Float64Array(SPECTRUM_BINS);

        this._initializeBands();
    }

    /**
     * Initialize the sub-frequency components for each band.
     * Each band gets several sinusoidal components spread across its range.
     * @private
     */
    _initializeBands() {
        const bandNames = Object.keys(BAND_DEFAULTS);
        for (const name of bandNames) {
            const def = BAND_DEFAULTS[name];
            const components = [];
            for (let i = 0; i < HARMONICS_PER_BAND; i++) {
                const freq = randomBetween(def.freqMin, def.freqMax);
                const phase = randomBetween(0, TWO_PI);
                // Amplitude slightly varied per component
                const ampScale = randomBetween(0.6, 1.0);
                components.push({ freq, phase, ampScale });
            }
            this._bands[name] = {
                baseAmplitude: def.baseAmplitude,
                freqMin: def.freqMin,
                freqMax: def.freqMax,
                components,
                // Slow drift parameters — the band amplitudes wander slightly over time
                driftPhase: randomBetween(0, TWO_PI),
                driftFreq: randomBetween(0.02, 0.08), // very slow oscillation
            };
        }
    }

    /**
     * Set the cognitive load level. The simulator smoothly transitions to
     * the new level over subsequent frames.
     * @param {number} level - Cognitive load in [0, 1].
     */
    setCognitiveLoad(level) {
        this._cognitiveLoad = clamp(level, 0, 1);
    }

    /**
     * Compute the effective amplitude multiplier for a given band based on
     * the current smoothed cognitive load.
     * @param {string} bandName - One of: delta, theta, alpha, beta, gamma.
     * @returns {number} Multiplier applied to the band's base amplitude.
     * @private
     */
    _getLoadMultiplier(bandName) {
        const load = this._smoothedLoad;
        switch (bandName) {
            case 'delta':
                // Delta stays relatively constant; slightly higher when relaxed
                return lerp(1.1, 0.8, load);
            case 'theta':
                // Theta peaks at moderate load (meditative attention)
                // Bell curve centered around load=0.3
                return 0.7 + 0.6 * Math.exp(-Math.pow((load - 0.3) / 0.25, 2));
            case 'alpha':
                // Alpha dominant when relaxed, suppressed under high load
                return lerp(1.5, 0.3, load);
            case 'beta':
                // Beta increases substantially with cognitive load
                return lerp(0.5, 2.2, load);
            case 'gamma':
                // Gamma increases modestly with high cognitive load
                return lerp(0.6, 1.6, load);
            default:
                return 1.0;
        }
    }

    /**
     * Generate a single pink noise sample using the Voss-McCartney algorithm.
     * Pink noise has a 1/f power spectral density, matching the spectral
     * characteristics of real EEG background noise.
     * @returns {number} A noise sample roughly in [-1, 1].
     * @private
     */
    _nextPinkNoiseSample() {
        const index = this._pinkNoiseIndex;
        this._pinkNoiseIndex++;

        // Determine which rows to update based on trailing zeros of the counter
        let k = index;
        let numZeros = 0;
        if (k === 0) {
            numZeros = this._pinkNoiseState.length;
        } else {
            while ((k & 1) === 0) {
                numZeros++;
                k >>= 1;
            }
        }

        // Update the identified rows
        const rows = Math.min(numZeros, this._pinkNoiseState.length);
        for (let i = 0; i < rows; i++) {
            this._pinkNoiseRunning -= this._pinkNoiseState[i];
            this._pinkNoiseState[i] = randomBetween(-1, 1);
            this._pinkNoiseRunning += this._pinkNoiseState[i];
        }

        // Add white noise component and normalize
        const white = randomBetween(-1, 1);
        return (this._pinkNoiseRunning + white) / (this._pinkNoiseState.length + 1);
    }

    /**
     * Compute the contribution of a single band at the current time.
     * @param {string} bandName - Band identifier.
     * @returns {number} Summed signal value for this band.
     * @private
     */
    _computeBand(bandName) {
        const band = this._bands[bandName];
        const multiplier = this._getLoadMultiplier(bandName);
        const amplitude = band.baseAmplitude * multiplier;

        // Apply slow drift to amplitude (simulates natural fluctuations)
        const drift = 1.0 + 0.15 * Math.sin(TWO_PI * band.driftFreq * this._time + band.driftPhase);
        const effectiveAmplitude = amplitude * drift;

        let value = 0;
        for (const comp of band.components) {
            value += comp.ampScale * effectiveAmplitude *
                Math.sin(TWO_PI * comp.freq * this._time + comp.phase);
        }
        // Average across components to keep amplitude in expected range
        return value / HARMONICS_PER_BAND;
    }

    /**
     * Compute an approximate power spectrum from current band amplitudes.
     * Each band's power is distributed across its frequency range as a
     * Gaussian envelope in the spectrum array.
     * @private
     */
    _computePowerSpectrum() {
        // Clear the spectrum
        this._powerSpectrum.fill(0);

        const hzPerBin = (SAMPLE_RATE / 2) / SPECTRUM_BINS; // Nyquist / bins

        for (const bandName of Object.keys(this._bands)) {
            const band = this._bands[bandName];
            const multiplier = this._getLoadMultiplier(bandName);
            const power = Math.pow(band.baseAmplitude * multiplier, 2);
            const centerFreq = (band.freqMin + band.freqMax) / 2;
            const bandwidth = (band.freqMax - band.freqMin) / 2;

            // Distribute power as a Gaussian centered on the band's center frequency
            for (let bin = 0; bin < SPECTRUM_BINS; bin++) {
                const binFreq = bin * hzPerBin;
                const dist = (binFreq - centerFreq) / Math.max(bandwidth, 0.5);
                const contribution = power * Math.exp(-0.5 * dist * dist);
                this._powerSpectrum[bin] += contribution;
            }
        }

        // Add 1/f noise floor to the spectrum
        for (let bin = 1; bin < SPECTRUM_BINS; bin++) {
            const freq = bin * hzPerBin;
            this._powerSpectrum[bin] += 5.0 / freq;
        }
        // DC bin gets a small constant
        this._powerSpectrum[0] += 2.0;
    }

    /**
     * Generate a sample at the given timestamp. The simulator tracks its own
     * internal time but uses the provided timestamp for frame-to-frame delta
     * calculation when called at display refresh rate.
     * @param {number} timestamp - Current time in seconds.
     * @returns {{ raw: number, bands: { delta: number, theta: number, alpha: number, beta: number, gamma: number }, powerSpectrum: number[] }}
     */
    getSample(timestamp) {
        this._time = timestamp;

        // Smoothly approach target cognitive load
        this._smoothedLoad = ema(this._cognitiveLoad, this._smoothedLoad, this._loadSmoothing);

        // Compute each band's contribution
        const bands = {
            delta: this._computeBand('delta'),
            theta: this._computeBand('theta'),
            alpha: this._computeBand('alpha'),
            beta: this._computeBand('beta'),
            gamma: this._computeBand('gamma'),
        };

        // Sum all bands
        let raw = bands.delta + bands.theta + bands.alpha + bands.beta + bands.gamma;

        // Add pink noise scaled to a reasonable level
        const noiseAmplitude = 3.0 + this._smoothedLoad * 2.0;
        raw += this._nextPinkNoiseSample() * noiseAmplitude;

        // Add very small white noise (sensor noise)
        raw += gaussian(0, 0.5);

        this._lastRawSample = raw;
        this._lastBands = { ...bands };

        // Update power spectrum
        this._computePowerSpectrum();

        return {
            raw,
            bands,
            powerSpectrum: Array.from(this._powerSpectrum),
        };
    }

    /**
     * Return the current power (squared amplitude) in each frequency band.
     * Power values are smoothed estimates based on the load-adjusted amplitudes
     * and slow drift modulation.
     * @returns {{ delta: number, theta: number, alpha: number, beta: number, gamma: number }}
     */
    getBandPowers() {
        const powers = {};
        for (const bandName of Object.keys(this._bands)) {
            const band = this._bands[bandName];
            const multiplier = this._getLoadMultiplier(bandName);
            const drift = 1.0 + 0.15 * Math.sin(TWO_PI * band.driftFreq * this._time + band.driftPhase);
            const effectiveAmp = band.baseAmplitude * multiplier * drift;
            // Power is proportional to amplitude squared (RMS of sine = amp / sqrt(2))
            powers[bandName] = (effectiveAmp * effectiveAmp) / 2;
        }
        return powers;
    }

    /**
     * Reset the simulator to its initial state with fresh random components.
     */
    reset() {
        this._time = 0;
        this._cognitiveLoad = 0.3;
        this._smoothedLoad = 0.3;
        this._lastRawSample = 0;
        this._lastBands = { delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0 };
        this._pinkNoiseState.fill(0);
        this._pinkNoiseRunning = 0;
        this._pinkNoiseIndex = 0;
        this._powerSpectrum.fill(0);
        this._initializeBands();
    }
}
