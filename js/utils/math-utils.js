/**
 * Math Utilities
 * G.R.I.P. Platform — numeric and statistical helper functions
 * @module utils/math-utils
 */

/**
 * Compute exponential moving average.
 * @param {number} current  - The newest data point.
 * @param {number} previous - The previous EMA value.
 * @param {number} alpha    - Smoothing factor (0-1). Higher = more weight on current.
 * @returns {number} The updated EMA value.
 */
export function ema(current, previous, alpha) {
    return alpha * current + (1 - alpha) * previous;
}

/**
 * Clamp a value to an inclusive range.
 * @param {number} value - The value to clamp.
 * @param {number} min   - Lower bound.
 * @param {number} max   - Upper bound.
 * @returns {number} The clamped value.
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values.
 * @param {number} a - Start value.
 * @param {number} b - End value.
 * @param {number} t - Interpolation factor (0-1).
 * @returns {number} Interpolated value.
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Normalize a value from an arbitrary range to 0-1.
 * @param {number} value - The value to normalize.
 * @param {number} min   - Range minimum.
 * @param {number} max   - Range maximum.
 * @returns {number} Normalized value in [0, 1].
 */
export function normalize(value, min, max) {
    if (max === min) return 0;
    return clamp((value - min) / (max - min), 0, 1);
}

/**
 * Compute the arithmetic mean of an array.
 * @param {number[]} array - Numeric array.
 * @returns {number} The mean, or 0 for an empty array.
 */
export function mean(array) {
    if (array.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum / array.length;
}

/**
 * Compute the population standard deviation of an array.
 * @param {number[]} array - Numeric array.
 * @returns {number} Standard deviation, or 0 for arrays with fewer than 2 elements.
 */
export function standardDeviation(array) {
    if (array.length < 2) return 0;
    const avg = mean(array);
    let sumSqDiff = 0;
    for (let i = 0; i < array.length; i++) {
        const diff = array[i] - avg;
        sumSqDiff += diff * diff;
    }
    return Math.sqrt(sumSqDiff / array.length);
}

/**
 * Generate a random number from a normal (Gaussian) distribution
 * using the Box-Muller transform.
 * @param {number} mu     - Mean of the distribution.
 * @param {number} stddev - Standard deviation of the distribution.
 * @returns {number} A random sample from N(mu, stddev^2).
 */
export function gaussian(mu, stddev) {
    let u1 = 0;
    let u2 = 0;
    // Avoid log(0)
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mu + z * stddev;
}

/**
 * Compute a simple moving average over a sliding window.
 * @param {number[]} array  - Source data.
 * @param {number}   window - Window size.
 * @returns {number[]} Array of moving averages (length = array.length - window + 1).
 */
export function movingAverage(array, window) {
    if (window <= 0 || array.length < window) return [];
    const result = [];
    let windowSum = 0;
    for (let i = 0; i < window; i++) {
        windowSum += array[i];
    }
    result.push(windowSum / window);
    for (let i = window; i < array.length; i++) {
        windowSum += array[i] - array[i - window];
        result.push(windowSum / window);
    }
    return result;
}
