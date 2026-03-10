/**
 * NFI Sub-Score Calculators
 * G.R.I.P. Platform — individual component calculators for the Neuroplastic Fitness Index
 * @module nfi/nfi-components
 */

import { clamp, normalize } from '../utils/math-utils.js';

/**
 * Calculate Neural Efficiency sub-score.
 * Measures cognitive efficiency as the ratio of accuracy to cognitive load.
 * Higher accuracy with lower cognitive load yields a higher score.
 *
 * Weight in composite NFI: 0.35
 *
 * @param {object} biometrics - Biometric snapshot.
 * @param {number} biometrics.eegBetaPower  - EEG beta band power (13-30 Hz).
 * @param {number} biometrics.eegAlphaPower - EEG alpha band power (8-12 Hz).
 * @param {object} session - Session data.
 * @param {number} session.correctAnswers - Number of correct answers in recent window.
 * @param {number} session.totalAnswers   - Total answers in recent window.
 * @returns {number} Neural efficiency score in [0, 100].
 */
export function calcNeuralEfficiency(biometrics, session) {
    const { eegBetaPower = 0, eegAlphaPower = 1 } = biometrics || {};
    const { correctAnswers = 0, totalAnswers = 0 } = session || {};

    // Avoid division by zero for alpha power
    const alphaSafe = Math.max(eegAlphaPower, 0.001);

    // Cognitive load: beta/alpha ratio. Higher ratio = more cognitive load.
    const cognitiveLoad = eegBetaPower / alphaSafe;

    // Accuracy: proportion of correct answers in the recent window
    const accuracy = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;

    // Avoid division by zero for cognitive load
    const loadSafe = Math.max(cognitiveLoad, 0.001);

    // Neural efficiency: accuracy per unit of cognitive load
    // Scaled so that a ratio of 1.0 maps to 50, and 2.0 maps to 100
    const ratio = accuracy / loadSafe;
    return clamp(ratio * 50, 0, 100);
}

/**
 * Calculate Focus Stability sub-score.
 * Derived from eye-tracking metrics: fixation duration, time in focus zone, and blink rate.
 *
 * Weight in composite NFI: 0.25
 *
 * @param {object} biometrics - Biometric snapshot.
 * @param {number} biometrics.avgFixationDuration - Average fixation duration in ms (100-600 range).
 * @param {number} biometrics.percentTimeInZone   - Proportion of time gaze is in the focus zone (0-1).
 * @param {number} biometrics.blinkRate           - Blinks per minute (10-30 range).
 * @returns {number} Focus stability score in [0, 100].
 */
export function calcFocusStability(biometrics) {
    const {
        avgFixationDuration = 200,
        percentTimeInZone = 0.5,
        blinkRate = 15
    } = biometrics || {};

    // Fixation score: longer fixations indicate better focus (100ms=0, 600ms=1)
    const fixationScore = normalize(avgFixationDuration, 100, 600) * 100;

    // Focus zone score: proportion of time gaze is in the designated focus zone
    const focusZoneScore = clamp(percentTimeInZone, 0, 1) * 100;

    // Blink score: lower blink rate indicates better focus (inverted; 10=best, 30=worst)
    const blinkScore = (1 - normalize(blinkRate, 10, 30)) * 100;

    // Weighted combination
    return clamp(
        0.4 * fixationScore + 0.4 * focusZoneScore + 0.2 * blinkScore,
        0,
        100
    );
}

/**
 * Calculate Vocal Calm sub-score.
 * Derived from voice analysis metrics: jitter, shimmer, and harmonics-to-noise ratio.
 * Low jitter, low shimmer, and high HNR indicate a calm, stable voice.
 *
 * Weight in composite NFI: 0.15
 *
 * @param {object} biometrics - Biometric snapshot.
 * @param {number} biometrics.jitter  - Vocal jitter percentage (0.5-3.0 range).
 * @param {number} biometrics.shimmer - Vocal shimmer percentage (2-8 range).
 * @param {number} biometrics.hnr     - Harmonics-to-noise ratio in dB (10-25 range).
 * @returns {number} Vocal calm score in [0, 100].
 */
export function calcVocalCalm(biometrics) {
    const {
        jitter = 1.0,
        shimmer = 4.0,
        hnr = 18
    } = biometrics || {};

    // Jitter score: lower jitter = calmer voice (inverted; 0.5=best, 3.0=worst)
    const jitterScore = (1 - normalize(jitter, 0.5, 3.0)) * 100;

    // Shimmer score: lower shimmer = calmer voice (inverted; 2=best, 8=worst)
    const shimmerScore = (1 - normalize(shimmer, 2, 8)) * 100;

    // HNR score: higher HNR = cleaner vocal signal (10=worst, 25=best)
    const hnrScore = normalize(hnr, 10, 25) * 100;

    // Weighted combination
    return clamp(
        0.3 * jitterScore + 0.3 * shimmerScore + 0.4 * hnrScore,
        0,
        100
    );
}

/**
 * Calculate Response Quality sub-score.
 * Based on rolling accuracy over the last 5 questions and average response time.
 * Penalizes responses that are too fast (likely guessing) or too slow.
 *
 * Weight in composite NFI: 0.25
 *
 * @param {object} session - Session data.
 * @param {number} session.rollingAccuracy  - Accuracy over last 5 questions (0-1).
 * @param {number} session.avgResponseTime  - Average response time in ms (2000-30000 range).
 * @returns {number} Response quality score in [0, 100].
 */
export function calcResponseQuality(session) {
    const {
        rollingAccuracy = 0.5,
        avgResponseTime = 10000
    } = session || {};

    // Accuracy score: direct proportion of rolling accuracy
    const accuracyScore = clamp(rollingAccuracy, 0, 1) * 100;

    // Time score: faster is better within the valid range (inverted; 2000ms=best, 30000ms=worst)
    let timeScore = (1 - normalize(avgResponseTime, 2000, 30000)) * 100;

    // Penalize responses that are too fast — likely guessing
    if (avgResponseTime < 2000) {
        timeScore *= 0.5;
    }

    // Weighted combination
    return clamp(
        0.6 * accuracyScore + 0.4 * timeScore,
        0,
        100
    );
}
