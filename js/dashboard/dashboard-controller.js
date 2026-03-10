/**
 * Dashboard Controller
 * G.R.I.P. Platform — data loading and aggregation for the dashboard view
 * @module dashboard/dashboard-controller
 */

import { UserProfile } from '../data/user-profile.js';
import { FirestoreService } from '../data/firestore-service.js';

/**
 * Fetches and organizes all data needed by the dashboard UI:
 * user profile stats, recent sessions, and NFI history for charting.
 */
export class DashboardController {

    /**
     * @param {string} userId - The authenticated user's UID.
     */
    constructor(userId) {
        /** @type {string} */
        this._userId = userId;

        /** @type {UserProfile} */
        this._profile = new UserProfile(userId);

        /** @type {FirestoreService} */
        this._firestoreService = new FirestoreService();

        /** @type {Object[]} Cached recent sessions */
        this._recentSessions = [];

        /** @type {boolean} Whether data has been loaded */
        this._loaded = false;
    }

    /**
     * Load all dashboard data: user profile and recent sessions.
     * @returns {Promise<void>}
     */
    async loadData() {
        const [profileData, sessions] = await Promise.all([
            this._profile.load(),
            this._firestoreService.getSessions(this._userId, 10)
        ]);

        this._recentSessions = sessions;
        this._loaded = true;
    }

    /**
     * Get aggregated stats for the stat cards.
     * @returns {{
     *   sessionsCompleted: number,
     *   averageNFI: number,
     *   bestNFI: number,
     *   streak: number,
     *   totalScenarios: number
     * }}
     */
    getStats() {
        const data = this._profile.getData();
        return {
            sessionsCompleted: data.sessionsCompleted,
            averageNFI: Math.round(data.averageNFI * 10) / 10,
            bestNFI: Math.round(data.bestNFI * 10) / 10,
            streak: data.currentStreak,
            totalScenarios: data.totalScenariosAnswered
        };
    }

    /**
     * Get the list of recent sessions (up to 10).
     * Each session includes id, date, NFI, scenarios completed, etc.
     * @returns {Object[]} Array of session summary objects.
     */
    getRecentSessions() {
        return this._recentSessions.map(session => ({
            id: session.id,
            date: session.createdAt?.toDate?.() || new Date(session.createdAt),
            finalNfi: session.performance?.finalNfi ?? session.finalNfi ?? 0,
            scenariosCompleted: session.performance?.totalResponses ?? session.scenariosCompleted ?? 0,
            accuracy: session.performance?.accuracy ?? session.accuracy ?? 0,
            duration: session.totalTime ?? session.duration ?? 0
        }));
    }

    /**
     * Get NFI history data points for the chart.
     * @param {number} [days=30] - Number of days to look back.
     * @returns {{ date: number, nfi: number }[]} Array of { date, nfi } data points.
     */
    getNFIHistory(days = 30) {
        return this._profile.getNFITrend(days);
    }

    /**
     * Get the user's display name.
     * @returns {string} Display name or empty string.
     */
    getDisplayName() {
        return this._profile.getData().displayName || '';
    }

    /**
     * Get the streak info.
     * @returns {{ current: number, best: number, lastDate: number|null }}
     */
    getStreakInfo() {
        return this._profile.getStreakInfo();
    }

    /**
     * Check if data has been loaded.
     * @returns {boolean}
     */
    isLoaded() {
        return this._loaded;
    }
}
