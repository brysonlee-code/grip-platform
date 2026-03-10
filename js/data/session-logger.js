/**
 * Session Logger
 * G.R.I.P. Platform — zero-data-loss session event logging with localStorage backup
 * @module data/session-logger
 */

import { FirestoreService } from './firestore-service.js';

/**
 * Valid event types that the logger recognizes.
 * @type {Set<string>}
 */
const VALID_EVENT_TYPES = new Set([
    'scenario_start',
    'response',
    'nfi_update',
    'difficulty_change',
    'breather',
    'session_end'
]);

/**
 * Auto-flush interval in milliseconds.
 * @type {number}
 */
const AUTO_FLUSH_INTERVAL = 5000;

/**
 * Prefix for localStorage backup keys.
 * @type {string}
 */
const STORAGE_PREFIX = 'grip_session_';

/**
 * Zero-data-loss session logger.
 * Buffers events in memory with a localStorage mirror so that no data is lost
 * even if the browser tab closes unexpectedly. Periodically flushes buffered
 * events to Firestore.
 */
export class SessionLogger {

    /**
     * @param {string} userId    - The authenticated user's UID.
     * @param {string} sessionId - Unique identifier for this session.
     */
    constructor(userId, sessionId) {
        /** @type {string} */
        this._userId = userId;

        /** @type {string} */
        this._sessionId = sessionId;

        /** @type {string} localStorage key for backup */
        this._storageKey = `${STORAGE_PREFIX}${sessionId}`;

        /** @type {Object[]} In-memory event buffer */
        this._buffer = [];

        /** @type {FirestoreService} */
        this._firestoreService = new FirestoreService();

        /** @type {number|null} Auto-flush interval ID */
        this._flushIntervalId = null;

        /** @type {boolean} Whether a flush is currently in progress */
        this._flushing = false;

        /** @type {number} Total events logged this session */
        this._totalEventsLogged = 0;

        /** @type {number} Session start timestamp */
        this._sessionStartTime = Date.now();

        // Restore any previously buffered events from localStorage
        this._restoreFromStorage();
    }

    /**
     * Log a session event to the buffer and localStorage backup.
     * @param {string} type - One of the VALID_EVENT_TYPES.
     * @param {Object} [data={}] - Arbitrary event payload.
     */
    logEvent(type, data = {}) {
        if (!VALID_EVENT_TYPES.has(type)) {
            console.warn(`[SessionLogger] Unknown event type: ${type}`);
        }

        const event = {
            type,
            data,
            timestamp: Date.now(),
            index: this._totalEventsLogged++
        };

        this._buffer.push(event);
        this._persistToStorage();
    }

    /**
     * Start the automatic flush cycle (every 5 seconds).
     */
    startAutoFlush() {
        if (this._flushIntervalId !== null) return;

        this._flushIntervalId = setInterval(() => {
            this.flush();
        }, AUTO_FLUSH_INTERVAL);
    }

    /**
     * Flush the current buffer to Firestore.
     * On success, clears the localStorage backup.
     * On failure, events remain in the buffer for the next attempt.
     * @returns {Promise<boolean>} True if flush succeeded.
     */
    async flush() {
        if (this._flushing || this._buffer.length === 0) return true;

        this._flushing = true;

        // Snapshot the buffer so new events during flush are preserved
        const eventsToFlush = [...this._buffer];
        const flushCount = eventsToFlush.length;

        try {
            const sessionData = {
                sessionId: this._sessionId,
                userId: this._userId,
                events: eventsToFlush,
                eventCount: flushCount,
                flushedAt: Date.now()
            };

            const result = await this._firestoreService.saveSession(
                this._userId,
                sessionData
            );

            if (result) {
                // Remove only the events that were successfully flushed
                this._buffer.splice(0, flushCount);
                this._persistToStorage();

                // Clear localStorage if buffer is now empty
                if (this._buffer.length === 0) {
                    this._clearStorage();
                }

                this._flushing = false;
                return true;
            }

            this._flushing = false;
            return false;
        } catch (err) {
            console.error('[SessionLogger] flush error:', err);
            this._flushing = false;
            return false;
        }
    }

    /**
     * Scan localStorage for unflushed session data from previous sessions.
     * Returns an array of recovered session buffers.
     * @returns {Object[]} Array of { sessionId, events } objects.
     */
    static recoverUnflushed() {
        const recovered = [];

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(STORAGE_PREFIX)) {
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (parsed && parsed.events && parsed.events.length > 0) {
                            recovered.push({
                                sessionId: parsed.sessionId,
                                userId: parsed.userId,
                                events: parsed.events,
                                storageKey: key
                            });
                        }
                    }
                }
            }
        } catch (err) {
            console.error('[SessionLogger] recoverUnflushed error:', err);
        }

        return recovered;
    }

    /**
     * Get an aggregated summary of the current session based on logged events.
     * @returns {Object} Session summary with counts and timing info.
     */
    getSessionSummary() {
        const events = this._buffer;

        const summary = {
            sessionId: this._sessionId,
            totalEvents: this._totalEventsLogged,
            bufferedEvents: events.length,
            sessionDuration: Date.now() - this._sessionStartTime,
            eventCounts: {},
            firstEventTime: events.length > 0 ? events[0].timestamp : null,
            lastEventTime: events.length > 0 ? events[events.length - 1].timestamp : null
        };

        // Count events by type
        for (const event of events) {
            summary.eventCounts[event.type] = (summary.eventCounts[event.type] || 0) + 1;
        }

        // Extract response stats if available
        const responses = events.filter(e => e.type === 'response');
        if (responses.length > 0) {
            const correct = responses.filter(e => e.data.correct).length;
            summary.responsesTotal = responses.length;
            summary.responsesCorrect = correct;
            summary.accuracy = responses.length > 0 ? correct / responses.length : 0;
        }

        // Extract latest NFI if available
        const nfiUpdates = events.filter(e => e.type === 'nfi_update');
        if (nfiUpdates.length > 0) {
            summary.latestNFI = nfiUpdates[nfiUpdates.length - 1].data.nfi;
        }

        return summary;
    }

    /**
     * Stop auto-flush and clean up resources.
     * Performs a final flush attempt before destroying.
     */
    async destroy() {
        // Stop auto-flush
        if (this._flushIntervalId !== null) {
            clearInterval(this._flushIntervalId);
            this._flushIntervalId = null;
        }

        // Final flush attempt
        await this.flush();
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /**
     * Persist the current buffer to localStorage as a backup.
     * @private
     */
    _persistToStorage() {
        try {
            const payload = {
                sessionId: this._sessionId,
                userId: this._userId,
                events: this._buffer,
                lastUpdated: Date.now()
            };
            localStorage.setItem(this._storageKey, JSON.stringify(payload));
        } catch (err) {
            // localStorage may be full or disabled — log but don't throw
            console.warn('[SessionLogger] localStorage write failed:', err);
        }
    }

    /**
     * Restore buffered events from localStorage (e.g. after page reload).
     * @private
     */
    _restoreFromStorage() {
        try {
            const raw = localStorage.getItem(this._storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && Array.isArray(parsed.events) && parsed.events.length > 0) {
                    this._buffer = parsed.events;
                    this._totalEventsLogged = parsed.events.length;
                    console.info(`[SessionLogger] Restored ${parsed.events.length} events from localStorage`);
                }
            }
        } catch (err) {
            console.warn('[SessionLogger] localStorage restore failed:', err);
        }
    }

    /**
     * Clear the localStorage backup for this session.
     * @private
     */
    _clearStorage() {
        try {
            localStorage.removeItem(this._storageKey);
        } catch (err) {
            console.warn('[SessionLogger] localStorage clear failed:', err);
        }
    }
}
