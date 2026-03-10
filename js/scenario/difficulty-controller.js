/**
 * Difficulty Controller
 * G.R.I.P. Platform — closed-loop adaptive difficulty adjustment based on
 * biometric signals, NFI trends, and performance metrics.
 * @module scenario/difficulty-controller
 */

import { clamp } from '../utils/math-utils.js';
import {
    DIFFICULTY_MIN,
    DIFFICULTY_MAX,
    STARTING_DIFFICULTY,
    FATIGUE_THRESHOLD,
} from '../config/constants.js';

/**
 * @typedef {Object} DifficultyResult
 * @property {number} difficulty  - The new difficulty level (1-10).
 * @property {number} adjustment  - The change applied (-2 to +2).
 * @property {string} reason      - Human-readable explanation.
 * @property {'increase'|'decrease'|'hold'|'breather'} action - The action taken.
 */

/**
 * @typedef {Object} DifficultyHistoryEntry
 * @property {number} difficulty - Difficulty level at that point.
 * @property {number} timestamp  - Unix timestamp.
 * @property {string} reason     - Reason for the adjustment.
 */

/**
 * Manages adaptive difficulty throughout a session. Evaluates biometric data,
 * NFI trends, and response accuracy to dynamically adjust scenario difficulty.
 */
export class DifficultyController {

    /**
     * @param {Object}  [options]
     * @param {number}  [options.startingDifficulty] - Initial difficulty level (default from constants).
     * @param {number}  [options.min]                - Minimum difficulty (default 1).
     * @param {number}  [options.max]                - Maximum difficulty (default 10).
     */
    constructor(options = {}) {
        /** @type {number} */
        this._difficulty = options.startingDifficulty ?? STARTING_DIFFICULTY;

        /** @type {number} */
        this._min = options.min ?? DIFFICULTY_MIN;

        /** @type {number} */
        this._max = options.max ?? DIFFICULTY_MAX;

        /** @type {DifficultyHistoryEntry[]} */
        this._history = [];

        /** @type {Function[]} */
        this._listeners = [];

        /** @type {number|null} Timestamp when NFI decline was first detected. */
        this._declineStartTime = null;

        /** @type {number|null} Previous NFI value for trend detection. */
        this._prevNfi = null;

        /** @type {number} Count of consecutive NFI decline observations. */
        this._declineCount = 0;

        /** @type {boolean} Whether a breather was recently injected. */
        this._breatherPending = false;

        // Record initial state
        this._recordHistory('Session start');
    }

    /**
     * Evaluate current biometric and performance data and adjust difficulty.
     * Called periodically (every ~10 seconds).
     *
     * @param {Object} nfiData - NFI engine data.
     * @param {number} nfiData.nfi           - Current NFI composite value (0-100).
     * @param {number} nfiData.betaAlphaRatio - EEG beta/alpha power ratio.
     * @param {number} [nfiData.trend]       - NFI trend direction (-1 declining, 0 stable, 1 rising).
     * @param {Object} sessionData - Session performance data.
     * @param {number} sessionData.accuracy  - Rolling accuracy (0-1).
     * @param {number} [sessionData.elapsed] - Elapsed session time in ms.
     * @returns {DifficultyResult}
     */
    evaluate(nfiData, sessionData) {
        const { betaAlphaRatio, nfi } = nfiData;
        const { accuracy } = sessionData;
        const now = Date.now();

        // If returning from a breather, resume at difficulty - 1
        if (this._breatherPending) {
            this._breatherPending = false;
            const adjustment = -1;
            this._applyAdjustment(adjustment);
            const result = this._buildResult(adjustment, 'Resuming after breather at reduced difficulty', 'decrease');
            return result;
        }

        // --- Track NFI decline for fatigue detection ---
        let nfiDeclining = false;
        if (this._prevNfi != null) {
            if (nfi < this._prevNfi - 1) {
                // NFI is declining
                if (this._declineStartTime == null) {
                    this._declineStartTime = now;
                }
                this._declineCount++;
                nfiDeclining = true;
            } else if (nfi >= this._prevNfi) {
                // NFI recovered — reset decline tracking
                this._declineStartTime = null;
                this._declineCount = 0;
            }
        }
        this._prevNfi = nfi;

        // --- Rule 3: Fatigue — sustained NFI decline for > 90 seconds ---
        if (
            nfiDeclining &&
            this._declineStartTime != null &&
            (now - this._declineStartTime) > FATIGUE_THRESHOLD
        ) {
            const adjustment = -2;
            this._applyAdjustment(adjustment);
            this._breatherPending = true;
            this._declineStartTime = null;
            this._declineCount = 0;
            const result = this._buildResult(adjustment, 'Fatigue detected: sustained NFI decline >90s', 'breather');
            return result;
        }

        // --- Rule 4: Flow state — moderate load + rising NFI ---
        const nfiTrend = nfiData.trend ?? 0;
        if (betaAlphaRatio >= 1.5 && betaAlphaRatio <= 2.5 && nfiTrend > 0) {
            const result = this._buildResult(0, 'Flow state: moderate cognitive load with rising NFI', 'hold');
            return result;
        }

        // --- Rule 1: High load + low accuracy → decrease ---
        if (betaAlphaRatio > 2.5 && accuracy < 0.5) {
            const adjustment = -1;
            this._applyAdjustment(adjustment);
            const result = this._buildResult(adjustment, 'High cognitive load with low accuracy', 'decrease');
            return result;
        }

        // --- Rule 2: Low load + high accuracy → increase ---
        if (betaAlphaRatio < 1.5 && accuracy > 0.8) {
            const adjustment = 1;
            this._applyAdjustment(adjustment);
            const result = this._buildResult(adjustment, 'Low cognitive load with high accuracy', 'increase');
            return result;
        }

        // --- Rule 5: No change ---
        const result = this._buildResult(0, 'Metrics within acceptable range', 'hold');
        return result;
    }

    /**
     * Get the current difficulty level.
     * @returns {number} Difficulty (1-10).
     */
    getDifficulty() {
        return this._difficulty;
    }

    /**
     * Get the full adjustment history.
     * @returns {DifficultyHistoryEntry[]}
     */
    getHistory() {
        return [...this._history];
    }

    /**
     * Register a callback for difficulty adjustments.
     * @param {function(DifficultyResult): void} callback
     */
    onAdjust(callback) {
        if (typeof callback === 'function') {
            this._listeners.push(callback);
        }
    }

    /**
     * Reset the controller to its initial state.
     */
    reset() {
        this._difficulty = STARTING_DIFFICULTY;
        this._history = [];
        this._listeners = [];
        this._declineStartTime = null;
        this._prevNfi = null;
        this._declineCount = 0;
        this._breatherPending = false;
    }

    /**
     * Apply an adjustment to the current difficulty, clamping to valid range.
     * Enforces the rule that difficulty never jumps more than 2 levels at once.
     * @param {number} adjustment - The raw adjustment value.
     * @private
     */
    _applyAdjustment(adjustment) {
        // Clamp the adjustment itself to [-2, +2]
        const clamped = clamp(adjustment, -2, 2);
        this._difficulty = clamp(this._difficulty + clamped, this._min, this._max);
    }

    /**
     * Build a result object, record history, and notify listeners.
     * @param {number} adjustment
     * @param {string} reason
     * @param {'increase'|'decrease'|'hold'|'breather'} action
     * @returns {DifficultyResult}
     * @private
     */
    _buildResult(adjustment, reason, action) {
        this._recordHistory(reason);

        const result = {
            difficulty: this._difficulty,
            adjustment,
            reason,
            action,
        };

        for (const listener of this._listeners) {
            try {
                listener(result);
            } catch (err) {
                console.error('[DifficultyController] Listener error:', err);
            }
        }

        return result;
    }

    /**
     * Record the current state in history.
     * @param {string} reason
     * @private
     */
    _recordHistory(reason) {
        this._history.push({
            difficulty: this._difficulty,
            timestamp: Date.now(),
            reason,
        });
    }
}
