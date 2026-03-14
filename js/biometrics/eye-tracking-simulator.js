/**
 * Eye Tracking Simulator
 * G.R.I.P. Platform — simulates realistic eye movement with fixation/saccade
 * state machine, blinks, pupil dilation, and cognitive load modulation.
 * @module biometrics/eye-tracking-simulator
 */

import { gaussian } from '../utils/math-utils.js';
import { lognormalRandom, randomBetween } from '../utils/random.js';
import { clamp, lerp, ema } from '../utils/math-utils.js';

/**
 * Eye movement states.
 * @enum {string}
 */
const State = {
    FIXATION: 'fixation',
    SACCADE:  'saccade',
    BLINK:    'blink',
};

/**
 * Fixation duration lognormal parameters.
 * The mean fixation duration is ~300ms; lognormal mu/sigma are in log-space.
 * mean = exp(mu + sigma^2/2) => mu ~ 5.62, sigma ~ 0.47 for mean ~300ms, std ~150ms
 */
const FIXATION_MU = 5.62;
const FIXATION_SIGMA = 0.47;

/**
 * Saccade duration range in milliseconds.
 */
const SACCADE_DURATION_MIN = 30;
const SACCADE_DURATION_MAX = 80;

/**
 * Blink parameters.
 */
const BLINK_DURATION_MIN = 150;
const BLINK_DURATION_MAX = 400;
const BLINK_RATE_BASELINE = 17; // blinks per minute

/**
 * Pupil dilation parameters in millimeters.
 */
const PUPIL_BASELINE_MIN = 3.0;
const PUPIL_BASELINE_MAX = 5.0;
const PUPIL_LOAD_INCREASE = 1.5;

/**
 * Focus zone: central 40% of canvas is considered the "focus zone."
 */
const FOCUS_ZONE_RATIO = 0.4;

/**
 * Simulates realistic eye tracking data including fixations, saccades, blinks,
 * pupil dilation, and derived metrics. A finite state machine cycles through
 * FIXATION, SACCADE, and BLINK states with parameters modulated by cognitive load.
 */
export class EyeTrackingSimulator {

    /**
     * Create a new eye tracking simulator.
     * @param {number} canvasWidth  - Width of the display area in pixels.
     * @param {number} canvasHeight - Height of the display area in pixels.
     */
    constructor(canvasWidth, canvasHeight) {
        /** @type {number} Display width. */
        this._width = canvasWidth;

        /** @type {number} Display height. */
        this._height = canvasHeight;

        /** @type {number} Current gaze X coordinate. */
        this._x = canvasWidth / 2;

        /** @type {number} Current gaze Y coordinate. */
        this._y = canvasHeight / 2;

        /** @type {string} Current state of the eye movement state machine. */
        this._state = State.FIXATION;

        /** @type {number} Time remaining in the current state (ms). */
        this._stateTimer = 0;

        /** @type {number} Total duration of the current state (ms). */
        this._stateDuration = 0;

        /** @type {number} Cognitive load target in [0, 1]. */
        this._cognitiveLoad = 0.3;

        /** @type {number} Smoothed cognitive load. */
        this._smoothedLoad = 0.3;

        /** @type {number} EMA smoothing factor. */
        this._loadSmoothing = 0.02;

        // Saccade trajectory
        /** @type {number} Saccade start X. */
        this._saccadeStartX = 0;
        /** @type {number} Saccade start Y. */
        this._saccadeStartY = 0;
        /** @type {number} Saccade target X. */
        this._saccadeTargetX = 0;
        /** @type {number} Saccade target Y. */
        this._saccadeTargetY = 0;

        /** @type {number} Saccade velocity in pixels/second (most recent). */
        this._saccadeVelocity = 0;

        // Fixation center for microsaccades
        /** @type {number} Center X of current fixation. */
        this._fixationCenterX = this._x;
        /** @type {number} Center Y of current fixation. */
        this._fixationCenterY = this._y;

        // Pupil
        /** @type {number} Baseline pupil diameter in mm. */
        this._pupilBaseline = randomBetween(PUPIL_BASELINE_MIN, PUPIL_BASELINE_MAX);
        /** @type {number} Current pupil diameter in mm. */
        this._pupilDilation = this._pupilBaseline;
        /** @type {number} Smoothed pupil diameter. */
        this._smoothedPupil = this._pupilBaseline;

        // Blink scheduling
        /** @type {number} Time until next blink in ms. */
        this._nextBlinkIn = this._scheduleNextBlink();

        // Metrics accumulators
        /** @type {number} Total elapsed time in ms. */
        this._totalTime = 0;
        /** @type {number[]} Array of fixation durations (ms) for averaging. */
        this._fixationDurations = [];
        /** @type {number} Number of completed fixations. */
        this._fixationCount = 0;
        /** @type {number} Number of completed saccades. */
        this._saccadeCount = 0;
        /** @type {number} Number of completed blinks. */
        this._blinkCount = 0;
        /** @type {number} Total scanpath distance in pixels. */
        this._scanPathLength = 0;
        /** @type {number} Time spent gazing inside the focus zone (ms). */
        this._focusZoneTime = 0;
        /** @type {number} Previous gaze X (for scanpath). */
        this._prevX = this._x;
        /** @type {number} Previous gaze Y (for scanpath). */
        this._prevY = this._y;

        // Enhanced metrics
        /** @type {number[]} Saccade velocities (px/s) for stats. */
        this._saccadeVelocities = [];
        /** @type {number[]} Pupil dilation samples for trend analysis. */
        this._pupilHistory = [];
        /** @type {number} Max pupil samples to keep. */
        this._pupilHistoryMax = 300;
        /** @type {number[][]} Heatmap grid (10x10 bins) counting gaze time per region. */
        this._heatmap = Array.from({ length: 10 }, () => new Float32Array(10));
        /** @type {number[]} Blink durations (ms). */
        this._blinkDurations = [];
        /** @type {number} Sum of squared fixation durations for variance. */
        this._fixDurationSqSum = 0;

        // Start in a fixation
        this._enterFixation();
    }

    /**
     * Compute the interval until the next blink based on baseline rate
     * and cognitive load.
     * @returns {number} Time in ms until next blink.
     * @private
     */
    _scheduleNextBlink() {
        // Higher cognitive load increases blink rate
        const rate = BLINK_RATE_BASELINE + this._smoothedLoad * 8; // up to 25/min
        const meanInterval = 60000 / rate; // ms between blinks
        // Add randomness via lognormal (log-space mu from ms mean)
        const mu = Math.log(meanInterval) - 0.25; // slight left skew
        return clamp(lognormalRandom(mu, 0.5), 1000, 15000);
    }

    /**
     * Enter the FIXATION state with a duration sampled from a lognormal distribution.
     * @private
     */
    _enterFixation() {
        this._state = State.FIXATION;

        // Cognitive load shortens fixations
        const loadFactor = lerp(1.2, 0.6, this._smoothedLoad);
        const duration = lognormalRandom(FIXATION_MU, FIXATION_SIGMA) * loadFactor;
        this._stateDuration = clamp(duration, 100, 2000);
        this._stateTimer = this._stateDuration;

        this._fixationCenterX = this._x;
        this._fixationCenterY = this._y;
    }

    /**
     * Enter the SACCADE state toward a new gaze target.
     * @private
     */
    _enterSaccade() {
        this._state = State.SACCADE;

        this._saccadeStartX = this._x;
        this._saccadeStartY = this._y;

        // Pick a target location. Under high load, targets are more erratic
        // (wider spread across canvas); under low load, they cluster near center.
        const spreadFactor = lerp(0.25, 0.45, this._smoothedLoad);
        const centerBias = lerp(0.7, 0.3, this._smoothedLoad);

        // Blend between center-biased and random target
        const randX = randomBetween(
            this._width * (0.5 - spreadFactor),
            this._width * (0.5 + spreadFactor)
        );
        const randY = randomBetween(
            this._height * (0.5 - spreadFactor),
            this._height * (0.5 + spreadFactor)
        );
        this._saccadeTargetX = lerp(randX, this._width / 2, centerBias) + gaussian(0, 10);
        this._saccadeTargetY = lerp(randY, this._height / 2, centerBias) + gaussian(0, 10);

        // Clamp to canvas bounds with margin
        this._saccadeTargetX = clamp(this._saccadeTargetX, 20, this._width - 20);
        this._saccadeTargetY = clamp(this._saccadeTargetY, 20, this._height - 20);

        // Saccade duration proportional to distance (with noise)
        const dx = this._saccadeTargetX - this._saccadeStartX;
        const dy = this._saccadeTargetY - this._saccadeStartY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Empirical: ~2ms per degree of visual angle; approximate 1 degree ~ 30px
        const baseDuration = (distance / 30) * 2 + SACCADE_DURATION_MIN;
        this._stateDuration = clamp(baseDuration + gaussian(0, 5), SACCADE_DURATION_MIN, SACCADE_DURATION_MAX);
        this._stateTimer = this._stateDuration;

        this._saccadeVelocity = distance / (this._stateDuration / 1000);
    }

    /**
     * Enter the BLINK state.
     * @private
     */
    _enterBlink() {
        this._state = State.BLINK;
        this._stateDuration = randomBetween(BLINK_DURATION_MIN, BLINK_DURATION_MAX);
        this._stateTimer = this._stateDuration;
    }

    /**
     * Set the cognitive load level. The simulator smoothly transitions.
     * @param {number} level - Cognitive load in [0, 1].
     */
    setCognitiveLoad(level) {
        this._cognitiveLoad = clamp(level, 0, 1);
    }

    /**
     * Advance the state machine by the given time delta.
     * @param {number} deltaTime - Elapsed time in seconds since last update.
     */
    update(deltaTime) {
        const dtMs = deltaTime * 1000;
        this._totalTime += dtMs;

        // Smooth the cognitive load
        this._smoothedLoad = ema(this._cognitiveLoad, this._smoothedLoad, this._loadSmoothing);

        // Update pupil dilation
        const targetPupil = this._pupilBaseline + PUPIL_LOAD_INCREASE * this._smoothedLoad
            + gaussian(0, 0.05); // tiny jitter
        this._smoothedPupil = ema(targetPupil, this._smoothedPupil, 0.03);
        this._pupilDilation = clamp(this._smoothedPupil, 2.0, 8.0);

        // Count down blink timer (interrupts any state)
        this._nextBlinkIn -= dtMs;
        if (this._nextBlinkIn <= 0 && this._state !== State.BLINK) {
            // Finish current state early and blink
            if (this._state === State.FIXATION) {
                this._fixationDurations.push(this._stateDuration - this._stateTimer);
                this._fixationCount++;
            }
            this._enterBlink();
            this._nextBlinkIn = this._scheduleNextBlink();
        }

        // Advance state timer
        this._stateTimer -= dtMs;

        switch (this._state) {
            case State.FIXATION:
                this._updateFixation(dtMs);
                if (this._stateTimer <= 0) {
                    this._fixationDurations.push(this._stateDuration);
                    this._fixDurationSqSum += this._stateDuration * this._stateDuration;
                    this._fixationCount++;
                    this._enterSaccade();
                }
                break;

            case State.SACCADE:
                this._updateSaccade();
                if (this._stateTimer <= 0) {
                    this._saccadeCount++;
                    this._saccadeVelocities.push(this._saccadeVelocity);
                    this._x = this._saccadeTargetX;
                    this._y = this._saccadeTargetY;
                    this._enterFixation();
                }
                break;

            case State.BLINK:
                // During blink, gaze position stays at last known location
                if (this._stateTimer <= 0) {
                    this._blinkDurations.push(this._stateDuration);
                    this._blinkCount++;
                    this._enterFixation();
                }
                break;
        }

        // Track scanpath distance
        const dx = this._x - this._prevX;
        const dy = this._y - this._prevY;
        this._scanPathLength += Math.sqrt(dx * dx + dy * dy);
        this._prevX = this._x;
        this._prevY = this._y;

        // Track focus zone time
        if (this._isInFocusZone(this._x, this._y) && this._state !== State.BLINK) {
            this._focusZoneTime += dtMs;
        }

        // Update heatmap (10x10 grid)
        if (this._state !== State.BLINK) {
            const hx = clamp(Math.floor((this._x / this._width) * 10), 0, 9);
            const hy = clamp(Math.floor((this._y / this._height) * 10), 0, 9);
            this._heatmap[hy][hx] += dtMs;
        }

        // Record pupil dilation history
        this._pupilHistory.push(this._pupilDilation);
        if (this._pupilHistory.length > this._pupilHistoryMax) {
            this._pupilHistory.shift();
        }
    }

    /**
     * Apply microsaccade jitter during fixation.
     * @param {number} dtMs - Delta time in milliseconds.
     * @private
     */
    _updateFixation(dtMs) {
        // Microsaccades: small jitter around the fixation center
        const jitterScale = 1.5 + this._smoothedLoad * 1.0; // more jitter under load
        this._x = this._fixationCenterX + gaussian(0, jitterScale);
        this._y = this._fixationCenterY + gaussian(0, jitterScale);

        // Slow drift during fixation
        const driftSpeed = 0.002; // pixels per ms
        this._fixationCenterX += gaussian(0, driftSpeed * dtMs);
        this._fixationCenterY += gaussian(0, driftSpeed * dtMs);

        // Keep fixation center on-screen
        this._fixationCenterX = clamp(this._fixationCenterX, 10, this._width - 10);
        this._fixationCenterY = clamp(this._fixationCenterY, 10, this._height - 10);
    }

    /**
     * Interpolate gaze position along the saccade trajectory using a
     * sigmoidal (ease-in-out) profile typical of real saccades.
     * @private
     */
    _updateSaccade() {
        const progress = 1.0 - (this._stateTimer / this._stateDuration);
        // Sigmoidal velocity profile: fast in middle, slower at start/end
        const t = 0.5 - 0.5 * Math.cos(Math.PI * clamp(progress, 0, 1));

        this._x = lerp(this._saccadeStartX, this._saccadeTargetX, t);
        this._y = lerp(this._saccadeStartY, this._saccadeTargetY, t);
    }

    /**
     * Check whether a point falls within the central focus zone.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @returns {boolean}
     * @private
     */
    _isInFocusZone(x, y) {
        const margin = (1 - FOCUS_ZONE_RATIO) / 2;
        return (
            x >= this._width * margin &&
            x <= this._width * (1 - margin) &&
            y >= this._height * margin &&
            y <= this._height * (1 - margin)
        );
    }

    /**
     * Return the current eye tracking state.
     * @returns {{ x: number, y: number, state: string, pupilDilation: number, fixationDuration: number, saccadeVelocity: number }}
     */
    getState() {
        // Current fixation duration is elapsed time in fixation state
        let currentFixDuration = 0;
        if (this._state === State.FIXATION) {
            currentFixDuration = this._stateDuration - this._stateTimer;
        }

        return {
            x: this._x,
            y: this._y,
            state: this._state,
            pupilDilation: this._pupilDilation,
            fixationDuration: currentFixDuration,
            saccadeVelocity: this._saccadeVelocity,
        };
    }

    /**
     * Return aggregate eye tracking metrics accumulated since the last reset.
     * Includes enhanced metrics: saccade velocity stats, pupil dilation trend,
     * fixation duration variability, heatmap, and blink duration.
     */
    getMetrics() {
        const avgFixation = this._fixationDurations.length > 0
            ? this._fixationDurations.reduce((a, b) => a + b, 0) / this._fixationDurations.length
            : 0;

        const elapsedMinutes = this._totalTime / 60000;
        const blinkRate = elapsedMinutes > 0 ? this._blinkCount / elapsedMinutes : 0;

        const focusZoneRatio = this._totalTime > 0
            ? this._focusZoneTime / this._totalTime
            : 0;

        // Saccade velocity stats
        let avgSaccadeVelocity = 0;
        let peakSaccadeVelocity = 0;
        if (this._saccadeVelocities.length > 0) {
            avgSaccadeVelocity = this._saccadeVelocities.reduce((a, b) => a + b, 0) / this._saccadeVelocities.length;
            peakSaccadeVelocity = Math.max(...this._saccadeVelocities);
        }

        // Fixation duration variability (std dev)
        let fixationDurationStd = 0;
        if (this._fixationDurations.length > 1) {
            const variance = (this._fixDurationSqSum / this._fixationDurations.length) - (avgFixation * avgFixation);
            fixationDurationStd = Math.sqrt(Math.max(0, variance));
        }

        // Pupil dilation trend (slope over recent samples)
        let pupilTrend = 0;
        let avgPupilDilation = this._pupilBaseline;
        if (this._pupilHistory.length > 10) {
            avgPupilDilation = this._pupilHistory.reduce((a, b) => a + b, 0) / this._pupilHistory.length;
            // Simple linear trend: compare first half vs second half mean
            const mid = Math.floor(this._pupilHistory.length / 2);
            const firstHalf = this._pupilHistory.slice(0, mid);
            const secondHalf = this._pupilHistory.slice(mid);
            const firstMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
            pupilTrend = secondMean - firstMean; // positive = dilating (increasing load)
        }

        // Average blink duration
        const avgBlinkDuration = this._blinkDurations.length > 0
            ? this._blinkDurations.reduce((a, b) => a + b, 0) / this._blinkDurations.length
            : 0;

        return {
            // Core metrics
            avgFixationDuration: avgFixation,
            fixationCount: this._fixationCount,
            saccadeCount: this._saccadeCount,
            blinkRate,
            scanPathLength: this._scanPathLength,
            focusZoneRatio,
            // Enhanced metrics
            avgSaccadeVelocity,
            peakSaccadeVelocity,
            fixationDurationStd,
            avgPupilDilation,
            pupilTrend,
            avgBlinkDuration,
            blinkCount: this._blinkCount,
        };
    }

    /**
     * Return the gaze heatmap as a 10×10 grid of accumulated dwell time (ms).
     * @returns {number[][]}
     */
    getHeatmap() {
        return this._heatmap.map(row => Array.from(row));
    }

    /**
     * Reset the simulator to its initial state.
     */
    reset() {
        this._x = this._width / 2;
        this._y = this._height / 2;
        this._prevX = this._x;
        this._prevY = this._y;
        this._state = State.FIXATION;
        this._cognitiveLoad = 0.3;
        this._smoothedLoad = 0.3;
        this._pupilBaseline = randomBetween(PUPIL_BASELINE_MIN, PUPIL_BASELINE_MAX);
        this._pupilDilation = this._pupilBaseline;
        this._smoothedPupil = this._pupilBaseline;
        this._saccadeVelocity = 0;
        this._totalTime = 0;
        this._fixationDurations = [];
        this._fixationCount = 0;
        this._saccadeCount = 0;
        this._blinkCount = 0;
        this._scanPathLength = 0;
        this._focusZoneTime = 0;
        this._saccadeVelocities = [];
        this._pupilHistory = [];
        this._heatmap = Array.from({ length: 10 }, () => new Float32Array(10));
        this._blinkDurations = [];
        this._fixDurationSqSum = 0;
        this._nextBlinkIn = this._scheduleNextBlink();
        this._enterFixation();
    }
}
