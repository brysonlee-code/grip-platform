/**
 * Formatting Utilities
 * G.R.I.P. Platform — display formatting for numbers, times, and dates
 * @module utils/format
 */

/**
 * Format an NFI value to one decimal place.
 * @param {number} value - Raw NFI score (0-100).
 * @returns {string} Formatted string, e.g. "73.2".
 */
export function formatNFI(value) {
    return value.toFixed(1);
}

/**
 * Format milliseconds as m:ss elapsed time.
 * @param {number} ms - Duration in milliseconds.
 * @returns {string} Formatted string, e.g. "2:45".
 */
export function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format a timestamp or Date as a readable date string.
 * @param {number|Date} timestamp - Unix timestamp in ms or Date object.
 * @returns {string} Formatted string, e.g. "Mar 9, 2026".
 */
export function formatDate(timestamp) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Format a 0-1 ratio as a percentage string.
 * @param {number} value - Value between 0 and 1.
 * @returns {string} Formatted string, e.g. "87%".
 */
export function formatPercent(value) {
    return `${Math.round(value * 100)}%`;
}

/**
 * Format milliseconds as a human-readable duration.
 * @param {number} ms - Duration in milliseconds.
 * @returns {string} Formatted string, e.g. "12m 30s".
 */
export function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}
