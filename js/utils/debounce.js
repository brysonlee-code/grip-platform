/**
 * Debounce & Throttle Utilities
 * G.R.I.P. Platform — rate-limiting helpers for events and rendering
 * @module utils/debounce
 */

/**
 * Create a debounced version of a function.
 * The function will only execute after `delay` ms have elapsed
 * since the last invocation.
 * @template {Function} T
 * @param {T}      fn    - The function to debounce.
 * @param {number} delay - Debounce delay in milliseconds.
 * @returns {T & { cancel: () => void }} Debounced function with a cancel method.
 */
export function debounce(fn, delay) {
    let timerId = null;

    /** @type {any} */
    const debounced = function (...args) {
        if (timerId !== null) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            timerId = null;
            fn.apply(this, args);
        }, delay);
    };

    debounced.cancel = function () {
        if (timerId !== null) {
            clearTimeout(timerId);
            timerId = null;
        }
    };

    return debounced;
}

/**
 * Create a throttled version of a function.
 * Guarantees the function executes at most once every `delay` ms.
 * Uses a trailing-edge call so the last invocation is never lost.
 * @template {Function} T
 * @param {T}      fn    - The function to throttle.
 * @param {number} delay - Minimum interval in milliseconds.
 * @returns {T & { cancel: () => void }} Throttled function with a cancel method.
 */
export function throttle(fn, delay) {
    let lastCall = 0;
    let timerId = null;

    /** @type {any} */
    const throttled = function (...args) {
        const now = Date.now();
        const remaining = delay - (now - lastCall);

        if (remaining <= 0) {
            // Enough time has passed — execute immediately
            if (timerId !== null) {
                clearTimeout(timerId);
                timerId = null;
            }
            lastCall = now;
            fn.apply(this, args);
        } else if (timerId === null) {
            // Schedule a trailing-edge call
            timerId = setTimeout(() => {
                lastCall = Date.now();
                timerId = null;
                fn.apply(this, args);
            }, remaining);
        }
    };

    throttled.cancel = function () {
        if (timerId !== null) {
            clearTimeout(timerId);
            timerId = null;
        }
    };

    return throttled;
}

/**
 * Create a requestAnimationFrame-based throttle.
 * Ideal for visual/canvas updates — ensures the function runs
 * at most once per animation frame (~16ms at 60fps).
 * @template {Function} T
 * @param {T} fn - The function to throttle.
 * @returns {T & { cancel: () => void }} RAF-throttled function with a cancel method.
 */
export function rafThrottle(fn) {
    let frameId = null;
    let lastArgs = null;
    let lastThis = null;

    /** @type {any} */
    const throttled = function (...args) {
        lastArgs = args;
        lastThis = this;

        if (frameId === null) {
            frameId = requestAnimationFrame(() => {
                frameId = null;
                fn.apply(lastThis, lastArgs);
                lastArgs = null;
                lastThis = null;
            });
        }
    };

    throttled.cancel = function () {
        if (frameId !== null) {
            cancelAnimationFrame(frameId);
            frameId = null;
            lastArgs = null;
            lastThis = null;
        }
    };

    return throttled;
}
