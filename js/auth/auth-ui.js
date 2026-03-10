/**
 * Authentication UI
 * G.R.I.P. Platform — login and signup page renderers
 * @module auth/auth-ui
 */

import { signIn, signUp } from './auth-controller.js';
import { navigate } from '../router.js';
import { showToast } from '../app.js';

/* ============================================================
   Shared helpers
   ============================================================ */

/** Simple email regex — catches the obvious mistakes */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Create a styled form field with label, input, and inline error slot.
 * @returns {{ wrapper: HTMLDivElement, input: HTMLInputElement, error: HTMLSpanElement }}
 */
function createField(id, label, type = 'text', autocomplete = '') {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field';

  const lbl = document.createElement('label');
  lbl.htmlFor = id;
  lbl.textContent = label;

  const input = document.createElement('input');
  input.type = type;
  input.id = id;
  input.name = id;
  input.className = 'input';
  if (autocomplete) input.autocomplete = autocomplete;

  const error = document.createElement('span');
  error.className = 'field-error';

  wrapper.append(lbl, input, error);
  return { wrapper, input, error };
}

/**
 * Set or clear an inline field error.
 */
function setFieldError(errorEl, message) {
  errorEl.textContent = message || '';
}

/**
 * Set the submit button into a loading state (or restore it).
 */
function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait...' : btn.dataset.label;
}

/* ============================================================
   Login Page
   ============================================================ */

/**
 * Render the login page into the given container.
 * @param {HTMLElement} container
 */
export function renderLoginPage(container) {
  const card = document.createElement('div');
  card.className = 'auth-card';

  card.innerHTML = `
    <div class="auth-brand">
      <h1 class="auth-logo">G.R.I.P.</h1>
      <p class="auth-tagline">Neuroplastic Fitness Platform</p>
    </div>
    <h2 class="auth-title">Sign In</h2>
  `;

  const form = document.createElement('form');
  form.className = 'auth-form';
  form.noValidate = true;

  const email = createField('login-email', 'Email', 'email', 'email');
  const password = createField('login-password', 'Password', 'password', 'current-password');

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary btn-full';
  submitBtn.textContent = 'Sign In';
  submitBtn.dataset.label = 'Sign In';

  form.append(email.wrapper, password.wrapper, submitBtn);

  const footer = document.createElement('p');
  footer.className = 'auth-footer';
  footer.innerHTML = `Don't have an account? <a href="#/signup" class="auth-link">Create one</a>`;

  card.append(form, footer);

  // Center the card
  const wrapper = document.createElement('div');
  wrapper.className = 'auth-page';
  wrapper.appendChild(card);
  container.appendChild(wrapper);

  /* ---- Form submission ---- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;

    // Validate email
    const emailVal = email.input.value.trim();
    if (!emailVal) {
      setFieldError(email.error, 'Email is required.');
      valid = false;
    } else if (!EMAIL_RE.test(emailVal)) {
      setFieldError(email.error, 'Enter a valid email address.');
      valid = false;
    } else {
      setFieldError(email.error, '');
    }

    // Validate password
    const passVal = password.input.value;
    if (!passVal) {
      setFieldError(password.error, 'Password is required.');
      valid = false;
    } else if (passVal.length < 6) {
      setFieldError(password.error, 'Password must be at least 6 characters.');
      valid = false;
    } else {
      setFieldError(password.error, '');
    }

    if (!valid) return;

    setLoading(submitBtn, true);
    try {
      await signIn(emailVal, passVal);
      // Auth state listener in app.js handles redirect
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(submitBtn, false);
    }
  });
}

/* ============================================================
   Signup Page
   ============================================================ */

/**
 * Render the signup page into the given container.
 * @param {HTMLElement} container
 */
export function renderSignupPage(container) {
  const card = document.createElement('div');
  card.className = 'auth-card';

  card.innerHTML = `
    <div class="auth-brand">
      <h1 class="auth-logo">G.R.I.P.</h1>
      <p class="auth-tagline">Neuroplastic Fitness Platform</p>
    </div>
    <h2 class="auth-title">Create Account</h2>
  `;

  const form = document.createElement('form');
  form.className = 'auth-form';
  form.noValidate = true;

  const email    = createField('signup-email', 'Email', 'email', 'email');
  const password = createField('signup-password', 'Password', 'password', 'new-password');
  const confirm  = createField('signup-confirm', 'Confirm Password', 'password', 'new-password');

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary btn-full';
  submitBtn.textContent = 'Create Account';
  submitBtn.dataset.label = 'Create Account';

  form.append(email.wrapper, password.wrapper, confirm.wrapper, submitBtn);

  const footer = document.createElement('p');
  footer.className = 'auth-footer';
  footer.innerHTML = `Already have an account? <a href="#/login" class="auth-link">Sign in</a>`;

  card.append(form, footer);

  const wrapper = document.createElement('div');
  wrapper.className = 'auth-page';
  wrapper.appendChild(card);
  container.appendChild(wrapper);

  /* ---- Form submission ---- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;

    // Validate email
    const emailVal = email.input.value.trim();
    if (!emailVal) {
      setFieldError(email.error, 'Email is required.');
      valid = false;
    } else if (!EMAIL_RE.test(emailVal)) {
      setFieldError(email.error, 'Enter a valid email address.');
      valid = false;
    } else {
      setFieldError(email.error, '');
    }

    // Validate password
    const passVal = password.input.value;
    if (!passVal) {
      setFieldError(password.error, 'Password is required.');
      valid = false;
    } else if (passVal.length < 6) {
      setFieldError(password.error, 'Password must be at least 6 characters.');
      valid = false;
    } else {
      setFieldError(password.error, '');
    }

    // Validate confirm password
    const confirmVal = confirm.input.value;
    if (!confirmVal) {
      setFieldError(confirm.error, 'Please confirm your password.');
      valid = false;
    } else if (confirmVal !== passVal) {
      setFieldError(confirm.error, 'Passwords do not match.');
      valid = false;
    } else {
      setFieldError(confirm.error, '');
    }

    if (!valid) return;

    setLoading(submitBtn, true);
    try {
      await signUp(emailVal, passVal);
      // Auth state listener in app.js handles redirect
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(submitBtn, false);
    }
  });
}
