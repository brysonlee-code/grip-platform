/**
 * User Profile
 * G.R.I.P. Platform — persistent user profile with session stats and streak tracking
 * @module data/user-profile
 */

import { FirestoreService } from './firestore-service.js';

/**
 * Default profile shape for new users.
 * @returns {Object} A fresh default profile object.
 */
function createDefaultProfile() {
    return {
        displayName: '',
        sessionsCompleted: 0,
        totalScenariosAnswered: 0,
        averageNFI: 0,
        bestNFI: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastSessionDate: null,
        nfiHistory: [],
        createdAt: Date.now()
    };
}

/**
 * Milliseconds in one calendar day.
 * @type {number}
 */
const ONE_DAY_MS = 86400000;

/**
 * Manages a user's persistent profile, including lifetime stats,
 * NFI history tracking, and daily streak computation.
 */
export class UserProfile {

    /**
     * @param {string} userId - The authenticated user's UID.
     */
    constructor(userId) {
        /** @type {string} */
        this._userId = userId;

        /** @type {Object} */
        this._data = createDefaultProfile();

        /** @type {FirestoreService} */
        this._firestoreService = new FirestoreService();

        /** @type {boolean} Whether profile has been loaded from Firestore */
        this._loaded = false;
    }

    /**
     * Load the profile from Firestore. If no profile exists, creates a default
     * and persists it.
     * @returns {Promise<Object>} The loaded (or newly created) profile data.
     */
    async load() {
        const existing = await this._firestoreService.getUserProfile(this._userId);

        if (existing) {
            // Merge with defaults so any newly added fields are present
            this._data = { ...createDefaultProfile(), ...existing };
            this._loaded = true;
        } else {
            // First-time user — persist the default profile
            this._data = createDefaultProfile();
            await this._firestoreService.saveUserProfile(this._userId, this._data);
            this._loaded = true;
        }

        return this._data;
    }

    /**
     * Save the current profile state to Firestore.
     * @returns {Promise<boolean>} True on success.
     */
    async save() {
        return this._firestoreService.saveUserProfile(this._userId, this._data);
    }

    /**
     * Get the current profile data.
     * @returns {Object} The profile data object.
     */
    getData() {
        return { ...this._data };
    }

    /**
     * Update the profile after a completed session.
     * Increments counters, updates averages, records NFI, and manages streaks.
     *
     * @param {Object} sessionResults - Results from the completed session.
     * @param {number} sessionResults.finalNfi          - Final NFI score for the session.
     * @param {number} sessionResults.scenariosCompleted - Number of scenarios answered.
     * @param {number} sessionResults.timestamp          - Session completion timestamp (ms).
     * @returns {Promise<boolean>} True if save succeeded.
     */
    async updateAfterSession(sessionResults) {
        const { finalNfi, scenariosCompleted, timestamp } = sessionResults;
        const now = timestamp || Date.now();

        // Update session count
        this._data.sessionsCompleted += 1;

        // Update total scenarios answered
        this._data.totalScenariosAnswered += scenariosCompleted || 0;

        // Recalculate average NFI (running average)
        const prevTotal = this._data.averageNFI * (this._data.sessionsCompleted - 1);
        this._data.averageNFI = (prevTotal + finalNfi) / this._data.sessionsCompleted;

        // Update best NFI
        if (finalNfi > this._data.bestNFI) {
            this._data.bestNFI = finalNfi;
        }

        // Update streak
        this._updateStreak(now);

        // Append to NFI history
        this._data.nfiHistory.push({
            nfi: finalNfi,
            date: now
        });

        // Cap NFI history to last 365 entries
        if (this._data.nfiHistory.length > 365) {
            this._data.nfiHistory = this._data.nfiHistory.slice(-365);
        }

        // Record last session date
        this._data.lastSessionDate = now;

        // Persist to Firestore
        return this.save();
    }

    /**
     * Get streak information.
     * @returns {{ current: number, best: number, lastDate: number|null }}
     */
    getStreakInfo() {
        return {
            current: this._data.currentStreak,
            best: this._data.bestStreak,
            lastDate: this._data.lastSessionDate
        };
    }

    /**
     * Get NFI trend data over the last N days.
     * Aggregates multiple sessions per day into a daily average.
     *
     * @param {number} [days=30] - Number of days to look back.
     * @returns {{ date: number, nfi: number }[]} Array of daily NFI data points.
     */
    getNFITrend(days = 30) {
        const cutoff = Date.now() - days * ONE_DAY_MS;
        const history = this._data.nfiHistory.filter(h => h.date >= cutoff);

        if (history.length === 0) return [];

        // Group by calendar day
        const dailyMap = new Map();

        for (const entry of history) {
            const dayKey = new Date(entry.date).toDateString();
            if (!dailyMap.has(dayKey)) {
                dailyMap.set(dayKey, { total: 0, count: 0, date: entry.date });
            }
            const bucket = dailyMap.get(dayKey);
            bucket.total += entry.nfi;
            bucket.count += 1;
        }

        // Convert to sorted array of daily averages
        const trend = [];
        for (const [, bucket] of dailyMap) {
            trend.push({
                date: bucket.date,
                nfi: Math.round((bucket.total / bucket.count) * 10) / 10
            });
        }

        trend.sort((a, b) => a.date - b.date);
        return trend;
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /**
     * Update the daily streak based on the given timestamp.
     * A streak continues if the previous session was on the previous calendar day
     * or the same day. Otherwise it resets to 1.
     *
     * @param {number} now - Current timestamp in milliseconds.
     * @private
     */
    _updateStreak(now) {
        if (!this._data.lastSessionDate) {
            // First ever session
            this._data.currentStreak = 1;
            this._data.bestStreak = Math.max(this._data.bestStreak, 1);
            return;
        }

        const lastDate = new Date(this._data.lastSessionDate);
        const currentDate = new Date(now);

        // Normalize to start of day
        const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
        const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

        const diffDays = Math.round((currentDay - lastDay) / ONE_DAY_MS);

        if (diffDays === 0) {
            // Same day — streak stays the same (already counted)
        } else if (diffDays === 1) {
            // Consecutive day — increment streak
            this._data.currentStreak += 1;
        } else {
            // Gap of 2+ days — reset streak
            this._data.currentStreak = 1;
        }

        // Update best streak
        this._data.bestStreak = Math.max(this._data.bestStreak, this._data.currentStreak);
    }
}
