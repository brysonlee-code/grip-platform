/**
 * Platform Constants
 * G.R.I.P. Platform — global configuration constants
 * @module config/constants
 */

/**
 * NFI (Neural Focus Index) component weights.
 * Must sum to 1.0.
 * @type {{ neural: number, focus: number, vocal: number, response: number }}
 */
export const NFI_WEIGHTS = {
    neural: 0.35,
    focus: 0.25,
    vocal: 0.15,
    response: 0.25
};

/** @type {number} NFI recalculation interval in milliseconds */
export const NFI_UPDATE_INTERVAL = 500;

/** @type {number} Adaptive difficulty check interval in milliseconds */
export const DIFFICULTY_CHECK_INTERVAL = 10000;

/** @type {number} Session data flush interval in milliseconds */
export const SESSION_FLUSH_INTERVAL = 5000;

/** @type {number} Exponential moving average smoothing factor (0-1) */
export const EMA_ALPHA = 0.3;

/** @type {number} Biometric sampling rate in frames per second */
export const BIOMETRIC_SAMPLE_RATE = 60;

/** @type {number} Calibration phase duration in milliseconds */
export const CALIBRATION_DURATION = 18000;

/** @type {number} Maximum number of items (scenarios + RT tests + vocal prompts) per session */
export const MAX_SCENARIOS_PER_SESSION = 10;

/** @type {number} Minimum difficulty level */
export const DIFFICULTY_MIN = 1;

/** @type {number} Maximum difficulty level */
export const DIFFICULTY_MAX = 10;

/** @type {number} Default starting difficulty for new sessions */
export const STARTING_DIFFICULTY = 5;

/**
 * Duration in milliseconds of sustained NFI decline before fatigue is flagged.
 * 90 seconds.
 * @type {number}
 */
export const FATIGUE_THRESHOLD = 90000;

/**
 * Difficulty level range as a frozen tuple.
 * @type {[number, number]}
 */
export const DIFFICULTY_RANGE = Object.freeze([DIFFICULTY_MIN, DIFFICULTY_MAX]);
