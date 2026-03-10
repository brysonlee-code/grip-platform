/**
 * NFI Engine
 * G.R.I.P. Platform — computes, smooths, and tracks the Neuroplastic Fitness Index
 * @module nfi/nfi-engine
 */

import { ema, clamp, mean } from '../utils/math-utils.js';
import { NFI_WEIGHTS, NFI_UPDATE_INTERVAL, EMA_ALPHA } from '../config/constants.js';
import {
    calcNeuralEfficiency,
    calcFocusStability,
    calcVocalCalm,
    calcResponseQuality
} from './nfi-components.js';

/**
 * @typedef {object} NFIComponents
 * @property {number} neuralEfficiency - Neural efficiency sub-score (0-100).
 * @property {number} focusStability   - Focus stability sub-score (0-100).
 * @property {number} vocalCalm        - Vocal calm sub-score (0-100).
 * @property {number} responseQuality  - Response quality sub-score (0-100).
 */

/**
 * @typedef {object} NFIResult
 * @property {number}        composite  - EMA-smoothed composite NFI (0-100).
 * @property {NFIComponents} components - Individual sub-scores.
 * @property {number}        raw        - Unsmoothed weighted composite.
 * @property {number}        smoothed   - EMA-smoothed composite (same as composite).
 * @property {number}        timestamp  - Unix timestamp of computation.
 */

/**
 * @typedef {object} NFIHistoryEntry
 * @property {number} nfi       - Smoothed NFI value at this point.
 * @property {number} timestamp - Unix timestamp.
 */

/**
 * Core NFI computation engine.
 * Computes the Neuroplastic Fitness Index from biometric and session data,
 * applies exponential moving average smoothing, maintains history,
 * and provides trend analysis.
 */
export class NFIEngine {
    /**
     * Create an NFI engine instance.
     * @param {object}  [options]          - Configuration overrides.
     * @param {object}  [options.weights]  - Component weight overrides (must sum to 1.0).
     * @param {number}  [options.alpha]    - EMA smoothing factor override (0-1).
     * @param {number}  [options.interval] - Auto-compute interval in ms.
     */
    constructor(options = {}) {
        /** @type {{ neural: number, focus: number, vocal: number, response: number }} */
        this._weights = Object.assign({}, NFI_WEIGHTS, options.weights || {});

        /** @type {number} EMA smoothing factor */
        this._alpha = options.alpha ?? EMA_ALPHA;

        /** @type {number} Auto-compute interval in ms */
        this._interval = options.interval ?? NFI_UPDATE_INTERVAL;

        /** @type {number|null} Current smoothed NFI */
        this._currentNFI = null;

        /** @type {NFIResult|null} Most recent full result */
        this._latestResult = null;

        /** @type {NFIHistoryEntry[]} Full session history */
        this._history = [];

        /** @type {Function[]} Update listeners */
        this._listeners = [];

        /** @type {number|null} setInterval ID for auto-compute */
        this._intervalId = null;

        /** @type {object|null} Latest biometric snapshot provided via update() */
        this._latestBiometrics = null;

        /** @type {object|null} Latest session data provided via update() */
        this._latestSessionData = null;
    }

    /**
     * Begin automatic NFI computation at the configured interval.
     * Each tick re-computes using the most recent data supplied via update().
     */
    start() {
        if (this._intervalId !== null) return;
        this._intervalId = setInterval(() => {
            if (this._latestBiometrics || this._latestSessionData) {
                this.computeNFI(this._latestBiometrics, this._latestSessionData);
            }
        }, this._interval);
    }

    /**
     * Stop automatic NFI computation.
     */
    stop() {
        if (this._intervalId !== null) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    }

    /**
     * Supply the latest biometric and session data and trigger a computation.
     * @param {object} biometricSnapshot - Current biometric readings.
     * @param {object} sessionData       - Current session state.
     * @returns {NFIResult} The newly computed NFI result.
     */
    update(biometricSnapshot, sessionData) {
        this._latestBiometrics = biometricSnapshot;
        this._latestSessionData = sessionData;
        return this.computeNFI(biometricSnapshot, sessionData);
    }

    /**
     * Compute the full NFI from a biometric snapshot and session data.
     * Applies component weights, EMA smoothing, records history, and notifies listeners.
     *
     * @param {object} biometricSnapshot - Current biometric readings.
     * @param {object} sessionData       - Current session state.
     * @returns {NFIResult} Full computation result.
     */
    computeNFI(biometricSnapshot, sessionData) {
        const now = Date.now();

        // Compute individual component sub-scores
        const neuralEfficiency = calcNeuralEfficiency(biometricSnapshot, sessionData);
        const focusStability = calcFocusStability(biometricSnapshot);
        const vocalCalm = calcVocalCalm(biometricSnapshot);
        const responseQuality = calcResponseQuality(sessionData);

        const components = { neuralEfficiency, focusStability, vocalCalm, responseQuality };

        // Weighted raw composite
        const raw = clamp(
            this._weights.neural * neuralEfficiency +
            this._weights.focus * focusStability +
            this._weights.vocal * vocalCalm +
            this._weights.response * responseQuality,
            0,
            100
        );

        // EMA smoothing
        const smoothed = this._currentNFI === null
            ? raw
            : ema(raw, this._currentNFI, this._alpha);

        this._currentNFI = smoothed;

        const result = {
            composite: smoothed,
            components,
            raw,
            smoothed,
            timestamp: now
        };

        this._latestResult = result;

        // Record in history
        this._history.push({ nfi: smoothed, timestamp: now });

        // Notify listeners
        for (const callback of this._listeners) {
            try {
                callback(result);
            } catch (err) {
                console.error('[NFIEngine] Listener error:', err);
            }
        }

        return result;
    }

    /**
     * Get the current smoothed NFI value.
     * @returns {number|null} Current NFI, or null if not yet computed.
     */
    getNFI() {
        return this._currentNFI;
    }

    /**
     * Get the most recent full NFI result.
     * @returns {NFIResult|null} Latest result, or null if not yet computed.
     */
    getLatestResult() {
        return this._latestResult;
    }

    /**
     * Get the full NFI history for this session.
     * @returns {NFIHistoryEntry[]} Array of { nfi, timestamp } entries.
     */
    getHistory() {
        return this._history.slice();
    }

    /**
     * Compute the NFI trend over a time window using linear regression.
     * Returns 'rising', 'falling', or 'stable' based on the slope.
     *
     * Slope thresholds: above +0.5 points/sec = rising, below -0.5 = falling.
     *
     * @param {number} [windowMs=30000] - Time window in milliseconds to analyze (default 30s).
     * @returns {'rising'|'falling'|'stable'} Trend direction.
     */
    getTrend(windowMs = 30000) {
        if (this._history.length < 2) return 'stable';

        const now = Date.now();
        const cutoff = now - windowMs;

        // Gather data points within the window
        const points = [];
        for (let i = this._history.length - 1; i >= 0; i--) {
            const entry = this._history[i];
            if (entry.timestamp < cutoff) break;
            points.push(entry);
        }

        if (points.length < 2) return 'stable';

        // Linear regression: slope of NFI over time
        // Convert timestamps to seconds relative to the first point
        const t0 = points[points.length - 1].timestamp;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        const n = points.length;

        for (const p of points) {
            const x = (p.timestamp - t0) / 1000; // seconds
            const y = p.nfi;
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }

        const denominator = n * sumX2 - sumX * sumX;
        if (denominator === 0) return 'stable';

        const slope = (n * sumXY - sumX * sumY) / denominator; // points per second

        // Threshold: +/-0.5 points per second
        if (slope > 0.5) return 'rising';
        if (slope < -0.5) return 'falling';
        return 'stable';
    }

    /**
     * Register a callback to be invoked on each NFI update.
     * @param {function(NFIResult): void} callback - Listener function.
     * @returns {function(): void} Unsubscribe function.
     */
    onUpdate(callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('onUpdate callback must be a function');
        }
        this._listeners.push(callback);

        // Return unsubscribe function
        return () => {
            const idx = this._listeners.indexOf(callback);
            if (idx !== -1) this._listeners.splice(idx, 1);
        };
    }

    /**
     * Reset the engine to its initial state.
     * Clears history, current value, and listeners. Does not stop the interval.
     */
    reset() {
        this._currentNFI = null;
        this._latestResult = null;
        this._history = [];
        this._listeners = [];
        this._latestBiometrics = null;
        this._latestSessionData = null;
    }
}
