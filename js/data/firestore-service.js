/**
 * Firestore Service
 * G.R.I.P. Platform — data access layer for Firestore CRUD operations
 * @module data/firestore-service
 */

import {
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    orderBy,
    limit,
    writeBatch,
    Timestamp,
    addDoc,
    updateDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { db } from '../config/firebase-config.js';

/**
 * Centralized Firestore data service.
 * Handles all reads and writes for sessions, user profiles, and NFI history.
 * All methods handle errors gracefully and return null on not-found.
 */
export class FirestoreService {

    /**
     * Save a session document to Firestore.
     * @param {string} userId    - The authenticated user's UID.
     * @param {Object} sessionData - Session data to persist.
     * @returns {Promise<string|null>} The session document ID, or null on error.
     */
    async saveSession(userId, sessionData) {
        try {
            const sessionsRef = collection(db, 'users', userId, 'sessions');
            const enriched = {
                ...sessionData,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            // Use provided sessionId or auto-generate
            if (sessionData.sessionId) {
                const docRef = doc(sessionsRef, sessionData.sessionId);
                await setDoc(docRef, enriched);
                return sessionData.sessionId;
            }

            const docRef = await addDoc(sessionsRef, enriched);
            return docRef.id;
        } catch (err) {
            console.error('[FirestoreService] saveSession error:', err);
            return null;
        }
    }

    /**
     * Fetch recent sessions for a user, ordered by date descending.
     * @param {string} userId      - The authenticated user's UID.
     * @param {number} [limitCount=10] - Maximum number of sessions to return.
     * @returns {Promise<Object[]>} Array of session documents (empty on error).
     */
    async getSessions(userId, limitCount = 10) {
        try {
            const sessionsRef = collection(db, 'users', userId, 'sessions');
            const q = query(
                sessionsRef,
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (err) {
            console.error('[FirestoreService] getSessions error:', err);
            return [];
        }
    }

    /**
     * Fetch a single session by ID.
     * @param {string} userId    - The authenticated user's UID.
     * @param {string} sessionId - The session document ID.
     * @returns {Promise<Object|null>} Session data or null if not found.
     */
    async getSession(userId, sessionId) {
        try {
            const docRef = doc(db, 'users', userId, 'sessions', sessionId);
            const snapshot = await getDoc(docRef);
            if (!snapshot.exists()) return null;
            return { id: snapshot.id, ...snapshot.data() };
        } catch (err) {
            console.error('[FirestoreService] getSession error:', err);
            return null;
        }
    }

    /**
     * Save or update a user profile document.
     * @param {string} userId      - The authenticated user's UID.
     * @param {Object} profileData - Profile fields to persist.
     * @returns {Promise<boolean>} True on success, false on error.
     */
    async saveUserProfile(userId, profileData) {
        try {
            const docRef = doc(db, 'users', userId);
            const enriched = {
                ...profileData,
                updatedAt: Timestamp.now()
            };
            await setDoc(docRef, enriched, { merge: true });
            return true;
        } catch (err) {
            console.error('[FirestoreService] saveUserProfile error:', err);
            return false;
        }
    }

    /**
     * Fetch a user profile document.
     * @param {string} userId - The authenticated user's UID.
     * @returns {Promise<Object|null>} Profile data or null if not found.
     */
    async getUserProfile(userId) {
        try {
            const docRef = doc(db, 'users', userId);
            const snapshot = await getDoc(docRef);
            if (!snapshot.exists()) return null;
            return { id: snapshot.id, ...snapshot.data() };
        } catch (err) {
            console.error('[FirestoreService] getUserProfile error:', err);
            return null;
        }
    }

    /**
     * Append an NFI value to the user's NFI history sub-collection.
     * @param {string} userId    - The authenticated user's UID.
     * @param {number} nfiValue  - The NFI score to record.
     * @param {number} timestamp - Unix timestamp in milliseconds.
     * @returns {Promise<boolean>} True on success, false on error.
     */
    async updateNFIHistory(userId, nfiValue, timestamp) {
        try {
            const historyRef = collection(db, 'users', userId, 'nfiHistory');
            await addDoc(historyRef, {
                nfi: nfiValue,
                timestamp: Timestamp.fromMillis(timestamp),
                createdAt: Timestamp.now()
            });
            return true;
        } catch (err) {
            console.error('[FirestoreService] updateNFIHistory error:', err);
            return false;
        }
    }

    /**
     * Execute a batch of write operations atomically.
     * Each operation should be an object with:
     *   { type: 'set'|'update'|'delete', path: string[], data?: Object }
     *
     * @param {Object[]} operations - Array of batch operation descriptors.
     * @returns {Promise<boolean>} True on success, false on error.
     */
    async batchWrite(operations) {
        try {
            const batch = writeBatch(db);

            for (const op of operations) {
                const docRef = doc(db, ...op.path);
                const enriched = op.data
                    ? { ...op.data, updatedAt: Timestamp.now() }
                    : null;

                switch (op.type) {
                    case 'set':
                        batch.set(docRef, enriched, { merge: true });
                        break;
                    case 'update':
                        batch.update(docRef, enriched);
                        break;
                    case 'delete':
                        batch.delete(docRef);
                        break;
                    default:
                        console.warn(`[FirestoreService] Unknown batch operation type: ${op.type}`);
                }
            }

            await batch.commit();
            return true;
        } catch (err) {
            console.error('[FirestoreService] batchWrite error:', err);
            return false;
        }
    }
}
