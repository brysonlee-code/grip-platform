/**
 * Firebase Configuration — Demo Mode
 * G.R.I.P. Platform — provides mock Firebase objects for local testing.
 * Replace with real Firebase config when deploying to production.
 * @module config/firebase-config
 */

/**
 * DEMO MODE — set to true to bypass Firebase entirely.
 * Uses localStorage for persistence and a mock user for auth.
 */
export const DEMO_MODE = true;

// ───────────────────────────────────────────────────────────────────
// Mock Firestore (localStorage-backed)
// ───────────────────────────────────────────────────────────────────

class MockTimestamp {
    constructor(ms) { this._ms = ms; }
    toDate() { return new Date(this._ms); }
    toMillis() { return this._ms; }
    static now() { return new MockTimestamp(Date.now()); }
    static fromMillis(ms) { return new MockTimestamp(ms); }
}

class MockDocSnapshot {
    constructor(id, data) {
        this._id = id;
        this._data = data;
    }
    exists() { return this._data !== null; }
    get id() { return this._id; }
    data() { return this._data; }
}

class MockQuerySnapshot {
    constructor(docs) { this.docs = docs; }
}

/**
 * localStorage-backed mock Firestore.
 * Stores all data under the 'grip_demo_db' key as a flat JSON object.
 */
class MockFirestore {
    _getStore() {
        try {
            return JSON.parse(localStorage.getItem('grip_demo_db') || '{}');
        } catch { return {}; }
    }
    _setStore(store) {
        localStorage.setItem('grip_demo_db', JSON.stringify(store));
    }
    _pathKey(segments) { return segments.join('/'); }

    async getDoc(path) {
        const store = this._getStore();
        const key = this._pathKey(path);
        const data = store[key] || null;
        return new MockDocSnapshot(path[path.length - 1], data);
    }

    async setDoc(path, data, options = {}) {
        const store = this._getStore();
        const key = this._pathKey(path);
        if (options.merge && store[key]) {
            store[key] = { ...store[key], ...data };
        } else {
            store[key] = { ...data };
        }
        this._setStore(store);
    }

    async addDoc(collectionPath, data) {
        const id = 'doc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        const path = [...collectionPath, id];
        await this.setDoc(path, data);
        return { id };
    }

    async getDocs(collectionPath, queryOpts = {}) {
        const store = this._getStore();
        const prefix = this._pathKey(collectionPath) + '/';
        const docs = [];
        for (const [key, val] of Object.entries(store)) {
            if (key.startsWith(prefix) && !key.slice(prefix.length).includes('/')) {
                const docId = key.slice(prefix.length);
                docs.push(new MockDocSnapshot(docId, val));
            }
        }
        // Sort by createdAt descending
        docs.sort((a, b) => {
            const aT = a.data()?.createdAt?._ms || 0;
            const bT = b.data()?.createdAt?._ms || 0;
            return bT - aT;
        });
        const lim = queryOpts.limit || 100;
        return new MockQuerySnapshot(docs.slice(0, lim));
    }

    async updateDoc(path, data) {
        return this.setDoc(path, data, { merge: true });
    }

    async batchWrite(operations) {
        for (const op of operations) {
            if (op.type === 'set') await this.setDoc(op.path, op.data, { merge: true });
            else if (op.type === 'update') await this.updateDoc(op.path, op.data);
            else if (op.type === 'delete') {
                const store = this._getStore();
                delete store[this._pathKey(op.path)];
                this._setStore(store);
            }
        }
    }
}

const mockDb = new MockFirestore();

// ───────────────────────────────────────────────────────────────────
// Mock Auth
// ───────────────────────────────────────────────────────────────────

const DEMO_USER = {
    uid: 'demo-user-001',
    email: 'demo@grip.dev',
    displayName: 'Demo User',
};

class MockAuth {
    constructor() {
        this.currentUser = null;
        this._listeners = [];
    }
    onAuthStateChanged(callback) {
        this._listeners.push(callback);
        // Auto-login the demo user after a tick
        setTimeout(() => this._signIn(), 50);
        return () => {
            this._listeners = this._listeners.filter(l => l !== callback);
        };
    }
    _signIn() {
        this.currentUser = DEMO_USER;
        for (const cb of this._listeners) cb(DEMO_USER);
    }
    _signOut() {
        this.currentUser = null;
        for (const cb of this._listeners) cb(null);
    }
}

const mockAuth = new MockAuth();

// ───────────────────────────────────────────────────────────────────
// Exports — same shape as real Firebase so all imports work
// ───────────────────────────────────────────────────────────────────

export const app = {};
export const auth = mockAuth;
export const db = mockDb;
export { MockTimestamp as Timestamp };
