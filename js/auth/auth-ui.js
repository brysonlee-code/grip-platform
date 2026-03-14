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

/** Rotating welcome messages for login */
const WELCOME_BACK = [
  "Welcome back. Your brain data missed you.",
  "Good to see you again. Ready to train?",
  "Welcome back. Let's pick up where you left off.",
  "Hey again. Your neural baseline is waiting.",
];

/** Rotating prompts for signup */
const JOIN_PROMPTS = [
  "Your brain is unique. Let's measure it.",
  "Every mind is different. Let's map yours.",
  "The journey to understanding your brain starts here.",
  "You're about to see your mind like never before.",
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Create a styled form field with label, input, and inline error slot.
 * @returns {{ wrapper: HTMLDivElement, input: HTMLInputElement, error: HTMLSpanElement }}
 */
function createField(id, label, type = 'text', autocomplete = '', placeholder = '') {
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
  if (placeholder) input.placeholder = placeholder;

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
  btn.textContent = loading ? 'One moment...' : btn.dataset.label;
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

  const greeting = randomFrom(WELCOME_BACK);

  card.innerHTML = `
    <div class="auth-brand">
      <h1 class="auth-logo">G.R.I.P.</h1>
      <p class="auth-tagline">Neuroplastic Fitness Platform</p>
    </div>
    <h2 class="auth-title">Welcome Back</h2>
    <p class="auth-subtitle">${greeting}</p>
  `;

  const form = document.createElement('form');
  form.className = 'auth-form';
  form.noValidate = true;

  const email = createField('login-email', 'Email', 'email', 'email', 'you@example.com');
  const password = createField('login-password', 'Password', 'password', 'current-password', 'Your password');

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary btn-full';
  submitBtn.textContent = "Let's Go";
  submitBtn.dataset.label = "Let's Go";

  form.append(email.wrapper, password.wrapper, submitBtn);

  const footer = document.createElement('p');
  footer.className = 'auth-footer';
  footer.innerHTML = `First time here? <a href="#/signup" class="auth-link">Join us</a>`;

  card.append(form, footer);

  // Center the card
  const wrapper = document.createElement('div');
  wrapper.className = 'auth-page';
  wrapper.appendChild(card);
  container.appendChild(wrapper);

  // Autofocus email
  requestAnimationFrame(() => email.input.focus());

  /* ---- Form submission ---- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;

    // Validate email
    const emailVal = email.input.value.trim();
    if (!emailVal) {
      setFieldError(email.error, "We need your email to find your account.");
      valid = false;
    } else if (!EMAIL_RE.test(emailVal)) {
      setFieldError(email.error, "That doesn't look quite right. Check the format?");
      valid = false;
    } else {
      setFieldError(email.error, '');
    }

    // Validate password
    const passVal = password.input.value;
    if (!passVal) {
      setFieldError(password.error, "Don't forget your password.");
      valid = false;
    } else if (passVal.length < 6) {
      setFieldError(password.error, 'Passwords are at least 6 characters.');
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

  const prompt = randomFrom(JOIN_PROMPTS);

  card.innerHTML = `
    <div class="auth-brand">
      <h1 class="auth-logo">G.R.I.P.</h1>
      <p class="auth-tagline">Neuroplastic Fitness Platform</p>
    </div>
    <h2 class="auth-title">Create Your Profile</h2>
    <p class="auth-subtitle">${prompt}</p>
  `;

  const form = document.createElement('form');
  form.className = 'auth-form';
  form.noValidate = true;

  const email    = createField('signup-email', 'Email', 'email', 'email', 'you@example.com');
  const password = createField('signup-password', 'Create a password', 'password', 'new-password', 'At least 6 characters');
  const confirm  = createField('signup-confirm', 'Confirm password', 'password', 'new-password', 'Type it again');

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary btn-full';
  submitBtn.textContent = "I'm Ready";
  submitBtn.dataset.label = "I'm Ready";

  form.append(email.wrapper, password.wrapper, confirm.wrapper, submitBtn);

  const footer = document.createElement('p');
  footer.className = 'auth-footer';
  footer.innerHTML = `Already have an account? <a href="#/login" class="auth-link">Welcome back</a>`;

  card.append(form, footer);

  const wrapper = document.createElement('div');
  wrapper.className = 'auth-page';
  wrapper.appendChild(card);
  container.appendChild(wrapper);

  // Autofocus email
  requestAnimationFrame(() => email.input.focus());

  /* ---- Form submission ---- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;

    // Validate email
    const emailVal = email.input.value.trim();
    if (!emailVal) {
      setFieldError(email.error, "We'll need an email to keep your data safe.");
      valid = false;
    } else if (!EMAIL_RE.test(emailVal)) {
      setFieldError(email.error, "Hmm, that doesn't look like an email address.");
      valid = false;
    } else {
      setFieldError(email.error, '');
    }

    // Validate password
    const passVal = password.input.value;
    if (!passVal) {
      setFieldError(password.error, "Pick something you'll remember.");
      valid = false;
    } else if (passVal.length < 6) {
      setFieldError(password.error, "A little longer — 6 characters minimum.");
      valid = false;
    } else {
      setFieldError(password.error, '');
    }

    // Validate confirm password
    const confirmVal = confirm.input.value;
    if (!confirmVal) {
      setFieldError(confirm.error, "Just to make sure — type it one more time.");
      valid = false;
    } else if (confirmVal !== passVal) {
      setFieldError(confirm.error, "Those don't match. Try again?");
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
