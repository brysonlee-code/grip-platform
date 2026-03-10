/**
 * Firebase Configuration
 * G.R.I.P. Platform — Firebase SDK initialization
 * @module config/firebase-config
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

/**
 * Firebase project configuration.
 * Replace placeholder values with your actual Firebase project credentials.
 * @type {Object}
 */
export const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
    measurementId: 'YOUR_MEASUREMENT_ID'
};

/** @type {import('firebase/app').FirebaseApp} */
export const app = initializeApp(firebaseConfig);

/** @type {import('firebase/auth').Auth} */
export const auth = getAuth(app);

/** @type {import('firebase/firestore').Firestore} */
export const db = getFirestore(app);
