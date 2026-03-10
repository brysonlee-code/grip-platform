/**
 * Random Number Utilities
 * G.R.I.P. Platform — deterministic and weighted random helpers
 * @module utils/random
 */

/**
 * Create a seeded pseudo-random number generator (Mulberry32).
 * Produces deterministic sequences for reproducible simulations.
 * @param {number} seed - Integer seed value.
 * @returns {() => number} A function that returns the next random number in [0, 1).
 */
export function seededRandom(seed) {
    let s = seed | 0;
    return function () {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Return a random floating-point number in [min, max).
 * @param {number} min - Lower bound (inclusive).
 * @param {number} max - Upper bound (exclusive).
 * @returns {number}
 */
export function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Return a random integer in [min, max] (inclusive on both ends).
 * @param {number} min - Lower bound.
 * @param {number} max - Upper bound.
 * @returns {number}
 */
export function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random element from an array.
 * @template T
 * @param {T[]} array - Source array (must not be empty).
 * @returns {T} A randomly selected element.
 */
export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array in place using the Fisher-Yates algorithm.
 * @template T
 * @param {T[]} array - The array to shuffle.
 * @returns {T[]} The same array, shuffled.
 */
export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
    return array;
}

/**
 * Select an item using weighted probabilities.
 * Weights do not need to sum to 1 — they are normalized internally.
 * @template T
 * @param {T[]}      items   - The candidate items.
 * @param {number[]}  weights - Corresponding positive weights.
 * @returns {T} The selected item.
 */
export function weightedChoice(items, weights) {
    let totalWeight = 0;
    for (let i = 0; i < weights.length; i++) {
        totalWeight += weights[i];
    }
    let r = Math.random() * totalWeight;
    for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r <= 0) return items[i];
    }
    // Fallback for floating-point edge cases
    return items[items.length - 1];
}

/**
 * Generate a random number from a log-normal distribution.
 * Useful for modeling eye-tracking fixation durations and reaction times.
 * @param {number} mu    - Mean of the underlying normal distribution (log-space).
 * @param {number} sigma - Std deviation of the underlying normal distribution (log-space).
 * @returns {number} A positive random sample from LogNormal(mu, sigma^2).
 */
export function lognormalRandom(mu, sigma) {
    // Box-Muller transform for the underlying normal variate
    let u1 = 0;
    let u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return Math.exp(mu + sigma * z);
}
