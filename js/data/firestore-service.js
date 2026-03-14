/**
 * Firestore Service
 * G.R.I.P. Platform — data access layer with demo mode support
 * @module data/firestore-service
 */

import { db, DEMO_MODE, Timestamp } from '../config/firebase-config.js';

/**
 * Centralized data service.
 * In demo mode, uses the localStorage-backed mock Firestore.
 * In production, uses real Firebase Firestore.
 */
export class FirestoreService {

    async saveSession(userId, sessionData) {
        try {
            const path = ['users', userId, 'sessions'];
            const enriched = {
                ...sessionData,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            if (sessionData.sessionId) {
                await db.setDoc([...path, sessionData.sessionId], enriched);
                return sessionData.sessionId;
            }

            const ref = await db.addDoc(path, enriched);
            return ref.id;
        } catch (err) {
            console.error('[FirestoreService] saveSession error:', err);
            return null;
        }
    }

    async getSessions(userId, limitCount = 10) {
        try {
            const path = ['users', userId, 'sessions'];
            const snapshot = await db.getDocs(path, { limit: limitCount });
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (err) {
            console.error('[FirestoreService] getSessions error:', err);
            return [];
        }
    }

    async getSession(userId, sessionId) {
        try {
            const path = ['users', userId, 'sessions', sessionId];
            const snapshot = await db.getDoc(path);
            if (!snapshot.exists()) return null;
            return { id: snapshot.id, ...snapshot.data() };
        } catch (err) {
            console.error('[FirestoreService] getSession error:', err);
            return null;
        }
    }

    async saveUserProfile(userId, profileData) {
        try {
            const path = ['users', userId];
            const enriched = {
                ...profileData,
                updatedAt: Timestamp.now()
            };
            await db.setDoc(path, enriched, { merge: true });
            return true;
        } catch (err) {
            console.error('[FirestoreService] saveUserProfile error:', err);
            return false;
        }
    }

    async getUserProfile(userId) {
        try {
            const path = ['users', userId];
            const snapshot = await db.getDoc(path);
            if (!snapshot.exists()) return null;
            return { id: snapshot.id, ...snapshot.data() };
        } catch (err) {
            console.error('[FirestoreService] getUserProfile error:', err);
            return null;
        }
    }

    async updateNFIHistory(userId, nfiValue, timestamp) {
        try {
            const path = ['users', userId, 'nfiHistory'];
            await db.addDoc(path, {
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

    async batchWrite(operations) {
        try {
            await db.batchWrite(operations);
            return true;
        } catch (err) {
            console.error('[FirestoreService] batchWrite error:', err);
            return false;
        }
    }
}
