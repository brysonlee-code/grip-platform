/**
 * Application Entry Point
 * G.R.I.P. Platform — main bootstrap and auth state management
 * @module app
 */

import { auth } from './config/firebase-config.js';
import { onAuthChange, signOut } from './auth/auth-controller.js';
import { router, navigate } from './router.js';

/* ---- Shared application state ---- */
export const appState = {
  user: null,
  userId: null,
  isAuthenticated: false,
  currentRoute: null,
};

/* ---- DOM references ---- */
const header    = document.getElementById('app-header');
const userEmail = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');

/* ---- Auth state listener ---- */
onAuthChange((user) => {
  appState.user = user;
  appState.userId = user ? user.uid : null;
  appState.isAuthenticated = !!user;

  if (user) {
    header.classList.remove('hidden');
    userEmail.textContent = user.email;

    const hash = window.location.hash;
    if (!hash || hash === '#/login' || hash === '#/signup') {
      navigate('#/dashboard');
    } else {
      navigate(hash);
    }
  } else {
    header.classList.add('hidden');
    userEmail.textContent = '';
    navigate('#/login');
  }
});

/* ---- Logout handler ---- */
logoutBtn.addEventListener('click', async () => {
  try {
    await signOut();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

/* ---- Toast helper (globally available) ---- */
export function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.addEventListener('transitionend', () => toast.remove());
  }, duration);
}

/* ---- Initialize router ---- */
router.init();
