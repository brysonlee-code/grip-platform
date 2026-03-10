/**
 * Response Handler
 * G.R.I.P. Platform — records, tracks, and summarizes user responses to scenarios
 * @module session/response-handler
 */

import { mean } from '../utils/math-utils.js';

/**
 * @typedef {Object} Response
 * @property {string}  scenarioId    - Identifier of the scenario answered.
 * @property {number}  selectedIndex - The index the user chose (0-3), or -1 if timed out.
 * @property {number}  correctIndex  - The correct answer index.
 * @property {boolean} correct       - Whether the user answered correctly.
 * @property {number}  responseTime  - Time taken to respond in milliseconds.
 * @property {number}  difficulty    - Difficulty level when the scenario was presented.
 * @property {number}  timestamp     - Unix timestamp when the response was recorded.
 */

/**
 * Rolling window size for recent performance metrics.
 * @type {number}
 */
const ROLLING_WINDOW = 5;

/**
 * Processes, records, and summarizes responses throughout a session.
 */
export class ResponseHandler {

    constructor() {
        /** @type {Response[]} */
        this._responses = [];

        /** @type {number} Current consecutive correct streak. */
        this._streak = 0;

        /** @type {number} Best streak achieved during the session. */
        this._bestStreak = 0;
    }

    /**
     * Record a single response.
     * @param {string} scenarioId    - Scenario identifier.
     * @param {number} selectedIndex - User's chosen answer index (0-3) or -1 for timeout.
     * @param {number} correctIndex  - The correct answer index.
     * @param {number} responseTime  - Response time in milliseconds.
     * @param {number} difficulty    - Difficulty level at time of response.
     */
    recordResponse(scenarioId, selectedIndex, correctIndex, responseTime, difficulty) {
        const correct = selectedIndex === correctIndex && selectedIndex !== -1;

        const response = {
            scenarioId,
            selectedIndex,
            correctIndex,
            correct,
            responseTime,
            difficulty,
            timestamp: Date.now(),
        };

        this._responses.push(response);

        // Update streak tracking
        if (correct) {
            this._streak++;
            if (this._streak > this._bestStreak) {
                this._bestStreak = this._streak;
            }
        } else {
            this._streak = 0;
        }
    }

    /**
     * Get rolling accuracy over the last ROLLING_WINDOW questions.
     * @returns {number} Accuracy as a fraction (0-1). Returns 0 if no responses.
     */
    getAccuracy() {
        if (this._responses.length === 0) return 0;

        const recent = this._responses.slice(-ROLLING_WINDOW);
        let correctCount = 0;
        for (const r of recent) {
            if (r.correct) correctCount++;
        }
        return correctCount / recent.length;
    }

    /**
     * Get the average response time over the last ROLLING_WINDOW questions.
     * @returns {number} Average response time in ms. Returns 0 if no responses.
     */
    getAverageResponseTime() {
        if (this._responses.length === 0) return 0;

        const recent = this._responses.slice(-ROLLING_WINDOW);
        const times = recent.map(r => r.responseTime);
        return mean(times);
    }

    /**
     * Get the current consecutive correct answer streak.
     * @returns {number}
     */
    getStreak() {
        return this._streak;
    }

    /**
     * Get all recorded responses.
     * @returns {Response[]}
     */
    getAllResponses() {
        return [...this._responses];
    }

    /**
     * Compute a performance summary for the entire session.
     * @returns {{ totalCorrect: number, totalIncorrect: number, avgTime: number, accuracy: number, bestStreak: number }}
     */
    getPerformanceSummary() {
        let totalCorrect = 0;
        let totalIncorrect = 0;
        const times = [];

        for (const r of this._responses) {
            if (r.correct) {
                totalCorrect++;
            } else {
                totalIncorrect++;
            }
            times.push(r.responseTime);
        }

        const total = totalCorrect + totalIncorrect;
        return {
            totalCorrect,
            totalIncorrect,
            avgTime: mean(times),
            accuracy: total > 0 ? totalCorrect / total : 0,
            bestStreak: this._bestStreak,
        };
    }

    /**
     * Reset all response data.
     */
    reset() {
        this._responses = [];
        this._streak = 0;
        this._bestStreak = 0;
    }
}
