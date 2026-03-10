/**
 * Authentication Controller
 * G.R.I.P. Platform — Firebase Auth wrapper with Firestore profile creation
 * @module auth/auth-controller
 */

import { auth, db } from '../config/firebase-config.js';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

import {
  doc,
  setDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

/**
 * Create a new user account and initialize their Firestore profile.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function signUp(email, password) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    // Create initial user profile document
    await setDoc(doc(db, 'users', credential.user.uid), {
      email: credential.user.email,
      createdAt: serverTimestamp(),
      sessionsCompleted: 0,
      lastCalibration: null,
      baselineNFI: null,
      settings: {
        difficulty: 5,
        scenarioPreferences: [],
      },
    });

    return credential;
  } catch (err) {
    throw new Error(mapAuthError(err.code));
  }
}

/**
 * Sign in an existing user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function signIn(email, password) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    throw new Error(mapAuthError(err.code));
  }
}

/**
 * Sign out the current user.
 * @returns {Promise<void>}
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    throw new Error('Sign-out failed. Please try again.');
  }
}

/**
 * Get the currently signed-in user (synchronous snapshot).
 * @returns {import('firebase/auth').User | null}
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Subscribe to authentication state changes.
 * @param {(user: import('firebase/auth').User | null) => void} callback
 * @returns {import('firebase/auth').Unsubscribe}
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/* ---- Error code → human-readable message mapping ---- */
function mapAuthError(code) {
  const messages = {
    'auth/email-already-in-use':    'An account with this email already exists.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/operation-not-allowed':   'Email/password sign-in is not enabled. Contact support.',
    'auth/weak-password':           'Password must be at least 6 characters.',
    'auth/user-disabled':           'This account has been disabled.',
    'auth/user-not-found':          'No account found with this email.',
    'auth/wrong-password':          'Incorrect password. Please try again.',
    'auth/invalid-credential':      'Invalid credentials. Please check your email and password.',
    'auth/too-many-requests':       'Too many failed attempts. Please wait and try again.',
    'auth/network-request-failed':  'Network error. Check your connection and try again.',
  };
  return messages[code] || `Authentication error (${code}). Please try again.`;
}
