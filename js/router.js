/**
 * Hash-based SPA Router
 * G.R.I.P. Platform — client-side routing with lazy-loaded views and route guards
 * @module router
 */

import { appState } from './app.js';

/* ---- Route definitions ---- */
const routes = {
  '#/login': {
    title: 'Login',
    requiresAuth: false,
    load: () => import('./auth/auth-ui.js').then(m => m.renderLoginPage),
  },
  '#/signup': {
    title: 'Sign Up',
    requiresAuth: false,
    load: () => import('./auth/auth-ui.js').then(m => m.renderSignupPage),
  },
  '#/dashboard': {
    title: 'Dashboard',
    requiresAuth: true,
    load: () => import('./dashboard/dashboard-ui.js').then(m => m.renderDashboardPage),
  },
  '#/calibration': {
    title: 'Calibration',
    requiresAuth: true,
    load: () => import('./calibration/calibration-ui.js').then(m => m.renderCalibrationPage),
  },
  '#/session': {
    title: 'Session',
    requiresAuth: true,
    load: () => import('./session/session-controller.js').then(m => m.renderSessionPage),
  },
  '#/results': {
    title: 'Results',
    requiresAuth: true,
    load: () => import('./dashboard/results-ui.js').then(m => m.renderResultsPage),
  },
  '#/nfi-demo': {
    title: 'NFI Analysis',
    requiresAuth: true,
    load: () => import('./nfi/nfi-demo-ui.js').then(m => m.renderNFIDemoPage),
  },
};

/* ---- Currently active cleanup function (if any) ---- */
let activeCleanup = null;

/**
 * Navigate to a given hash route.
 * Updates window.location.hash which triggers the hashchange handler.
 * @param {string} route — e.g. '#/dashboard'
 */
export function navigate(route) {
  if (window.location.hash === route) {
    // Hash didn't change, so hashchange won't fire — resolve manually
    resolveRoute(route);
  } else {
    window.location.hash = route;
  }
}

/**
 * Resolve a route: enforce guards, lazy-load the renderer, and mount it.
 * @param {string} hash
 */
async function resolveRoute(hash) {
  const route = routes[hash];

  // Unknown route — fall back to default
  if (!route) {
    navigate(appState.isAuthenticated ? '#/dashboard' : '#/login');
    return;
  }

  // Route guard: redirect unauthenticated users away from protected routes
  if (route.requiresAuth && !appState.isAuthenticated) {
    navigate('#/login');
    return;
  }

  // If authenticated and hitting an auth page, redirect to dashboard
  if (!route.requiresAuth && appState.isAuthenticated && (hash === '#/login' || hash === '#/signup')) {
    navigate('#/dashboard');
    return;
  }

  // Run cleanup from previous page (if any)
  if (typeof activeCleanup === 'function') {
    try {
      activeCleanup();
    } catch (e) {
      console.warn('[router] cleanup error:', e);
    }
    activeCleanup = null;
  }

  // Clear existing content
  const container = document.getElementById('app-content');
  container.innerHTML = '';

  // Update tracked route
  appState.currentRoute = hash;

  // Update document title
  document.title = `${route.title} — G.R.I.P.`;

  try {
    // Lazy-load the render function
    const renderFn = await route.load();

    // Call renderer — it may return a cleanup function
    const cleanup = await renderFn(container);
    if (typeof cleanup === 'function') {
      activeCleanup = cleanup;
    }
  } catch (err) {
    console.error(`[router] Failed to load route ${hash}:`, err);
    container.innerHTML = `
      <div class="route-error">
        <h2>Failed to load page</h2>
        <p>${err.message}</p>
      </div>
    `;
  }
}

/* ---- Router object ---- */
export const router = {
  /**
   * Initialize the router — attach hashchange listener and resolve the
   * current hash (or default).
   */
  init() {
    window.addEventListener('hashchange', () => {
      resolveRoute(window.location.hash);
    });

    // Resolve whatever hash is in the URL right now (or fall back)
    const initial = window.location.hash || (appState.isAuthenticated ? '#/dashboard' : '#/login');
    if (!window.location.hash) {
      window.location.hash = initial;
    } else {
      resolveRoute(initial);
    }
  },

  /** Expose the route table for testing / extension */
  routes,
};
