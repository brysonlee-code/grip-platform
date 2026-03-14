/**
 * Authentication Controller
 * G.R.I.P. Platform — Firebase Auth wrapper with demo mode support
 * @module auth/auth-controller
 */

import { auth, DEMO_MODE } from '../config/firebase-config.js';

// ───────────────────────────────────────────────────────────────────
// Demo Mode — localStorage-backed auth
// ───────────────────────────────────────────────────────────────────

if (DEMO_MODE) {
    // All functions below handle demo mode via the mock auth object.
    // No Firebase SDK imports needed.
}

// ───────────────────────────────────────────────────────────────────
// Dynamic Firebase imports (only when NOT in demo mode)
// ───────────────────────────────────────────────────────────────────

let firebaseAuth = null;
let firebaseFirestore = null;

async function loadFirebaseModules() {
    if (DEMO_MODE) return;
    if (!firebaseAuth) {
        firebaseAuth = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
    }
    if (!firebaseFirestore) {
        firebaseFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    }
}

/**
 * Create a new user account.
 * In demo mode, immediately signs in the demo user.
 */
export async function signUp(email, password) {
    if (DEMO_MODE) {
        auth._signIn();
        return { user: auth.currentUser };
    }

    await loadFirebaseModules();
    try {
        const credential = await firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
        const { doc, setDoc, serverTimestamp } = firebaseFirestore;
        const { db } = await import('../config/firebase-config.js');
        await setDoc(doc(db, 'users', credential.user.uid), {
            email: credential.user.email,
            createdAt: serverTimestamp(),
            sessionsCompleted: 0,
            lastCalibration: null,
            baselineNFI: null,
            settings: { difficulty: 5, scenarioPreferences: [] },
        });
        return credential;
    } catch (err) {
        throw new Error(mapAuthError(err.code));
    }
}

/**
 * Sign in an existing user.
 * In demo mode, immediately signs in the demo user.
 */
export async function signIn(email, password) {
    if (DEMO_MODE) {
        auth._signIn();
        return { user: auth.currentUser };
    }

    await loadFirebaseModules();
    try {
        return await firebaseAuth.signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        throw new Error(mapAuthError(err.code));
    }
}

/**
 * Sign out the current user.
 */
export async function signOut() {
    if (DEMO_MODE) {
        auth._signOut();
        return;
    }

    await loadFirebaseModules();
    try {
        await firebaseAuth.signOut(auth);
    } catch (err) {
        throw new Error('Sign-out failed. Please try again.');
    }
}

/**
 * Get the currently signed-in user (synchronous snapshot).
 */
export function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Subscribe to authentication state changes.
 */
export function onAuthChange(callback) {
    if (DEMO_MODE) {
        return auth.onAuthStateChanged(callback);
    }
    // For real Firebase, dynamically import
    import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js').then(mod => {
        mod.onAuthStateChanged(auth, callback);
    });
    return () => {};
}

/* ---- Error code mapping ---- */
function mapAuthError(code) {
    const messages = {
        'auth/email-already-in-use':    "Looks like you already have an account. Try signing in instead.",
        'auth/invalid-email':           "That email doesn't look quite right. Mind double-checking?",
        'auth/operation-not-allowed':   "Email sign-in isn't set up yet. We're working on it.",
        'auth/weak-password':           "That password is a little short. Try at least 6 characters.",
        'auth/user-disabled':           "This account has been paused. Reach out to us if that's unexpected.",
        'auth/user-not-found':          "We don't recognize that email. Want to create an account instead?",
        'auth/wrong-password':          "That password didn't match. Give it another try.",
        'auth/invalid-credential':      "Something's off with those credentials. Try again?",
        'auth/too-many-requests':       "Whoa, slow down. Too many attempts — take a breather and try again in a minute.",
        'auth/network-request-failed':  "Looks like you're offline. Check your connection and try again.",
    };
    return messages[code] || `Something went wrong on our end. Try again in a moment.`;
}
