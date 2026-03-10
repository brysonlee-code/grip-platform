/**
 * Voice Biomarker Simulator
 * G.R.I.P. Platform — simulates voice stress analysis metrics without actual audio,
 * modeling jitter, shimmer, fundamental frequency, and other vocal biomarkers
 * that respond to cognitive load.
 * @module biometrics/voice-simulator
 */

import { gaussian } from '../utils/math-utils.js';
import { randomBetween } from '../utils/random.js';
import { clamp, lerp, ema } from '../utils/math-utils.js';

/**
 * Baseline ranges for voice metrics.
 * Each metric has a relaxed baseline and a stressed ceiling.
 */
const METRICS_CONFIG = {
    jitter: {
        baselineMin: 0.5,   // % cycle-to-cycle frequency variation
        baselineMax: 1.0,
        stressMin: 2.0,
        stressMax: 3.0,
        unit: '%',
    },
    shimmer: {
        baselineMin: 2.0,   // % cycle-to-cycle amplitude variation
        baselineMax: 4.0,
        stressMin: 6.0,
        stressMax: 8.0,
        unit: '%',
    },
    f0: {
        baselineMin: 100,   // Hz fundamental frequency (using gender-neutral range)
        baselineMax: 150,
        stressMin: 130,
        stressMax: 180,
        unit: 'Hz',
    },
    hnr: {
        baselineMin: 20,    // dB harmonics-to-noise ratio (higher = cleaner voice)
        baselineMax: 25,
        stressMin: 10,      // stress *lowers* HNR
        stressMax: 15,
        unit: 'dB',
    },
    speechRate: {
        baselineMin: 120,   // words per minute
        baselineMax: 150,
        stressMin: 160,
        stressMax: 180,
        unit: 'wpm',
    },
    pauseRatio: {
        baselineMin: 0.2,   // fraction of time spent in pauses
        baselineMax: 0.3,
        stressMin: 0.08,    // stress *decreases* pause ratio
        stressMax: 0.15,
        unit: 'ratio',
    },
    prosodyVariation: {
        baselineMin: 0.5,   // 0-1 scale of pitch/rhythm variation
        baselineMax: 0.7,
        stressMin: 0.15,    // stress → flat/monotone
        stressMax: 0.3,
        unit: 'index',
    },
};

/**
 * Smoothing factor for metric evolution (lower = smoother, more gradual changes).
 * @type {number}
 */
const METRIC_SMOOTHING = 0.008;

/**
 * Smoothing factor for cognitive load tracking.
 * @type {number}
 */
const LOAD_SMOOTHING = 0.015;

/**
 * Random walk magnitude per second for each metric (as a fraction of its range).
 * @type {number}
 */
const RANDOM_WALK_SCALE = 0.12;

/**
 * Simulates voice biomarker data as would be extracted from speech analysis.
 * Models jitter, shimmer, fundamental frequency (F0), harmonics-to-noise ratio (HNR),
 * speech rate, pause ratio, and prosody variation, all modulated by cognitive load.
 *
 * Values evolve smoothly via exponential moving averages and small random walks,
 * preventing abrupt jumps in the simulated data.
 */
export class VoiceSimulator {

    /**
     * Create a new voice simulator with baseline metric values.
     */
    constructor() {
        /** @type {number} Target cognitive load in [0, 1]. */
        this._cognitiveLoad = 0.3;

        /** @type {number} Smoothed cognitive load. */
        this._smoothedLoad = 0.3;

        /** @type {Object<string, number>} Current metric values. */
        this._metrics = {};

        /** @type {Object<string, number>} Individual baselines (sampled once). */
        this._baselines = {};

        /** @type {Object<string, number>} Random walk offsets per metric. */
        this._walkOffsets = {};

        /** @type {Object<string, number>} Slow drift phases per metric. */
        this._driftPhases = {};

        /** @type {number} Accumulated time in seconds. */
        this._time = 0;

        this._initializeMetrics();
    }

    /**
     * Sample individual baselines and set initial metric values.
     * Each person has slightly different baseline voice characteristics,
     * so we pick random values within the baseline ranges.
     * @private
     */
    _initializeMetrics() {
        for (const [name, config] of Object.entries(METRICS_CONFIG)) {
            // Pick a personal baseline within the baseline range
            this._baselines[name] = randomBetween(config.baselineMin, config.baselineMax);
            // Start at baseline
            this._metrics[name] = this._baselines[name];
            // Random walk offset starts at zero
            this._walkOffsets[name] = 0;
            // Unique slow drift phase
            this._driftPhases[name] = randomBetween(0, 2 * Math.PI);
        }
    }

    /**
     * Compute the target value for a metric given the current smoothed load.
     * For metrics that increase with stress (jitter, shimmer, f0, speechRate),
     * target moves from baseline toward stress ceiling.
     * For metrics that decrease with stress (hnr, pauseRatio, prosodyVariation),
     * target moves from baseline toward stress floor.
     * @param {string} name - Metric name.
     * @returns {number} Target metric value.
     * @private
     */
    _computeTarget(name) {
        const config = METRICS_CONFIG[name];
        const load = this._smoothedLoad;
        const baseline = this._baselines[name];

        // Determine whether stress increases or decreases this metric
        const stressCenter = (config.stressMin + config.stressMax) / 2;
        const baselineCenter = (config.baselineMin + config.baselineMax) / 2;
        const stressIncreases = stressCenter > baselineCenter;

        let target;
        if (stressIncreases) {
            // Metric goes up with load (jitter, shimmer, f0, speechRate)
            const stressValue = lerp(config.stressMin, config.stressMax, load);
            target = lerp(baseline, stressValue, load);
        } else {
            // Metric goes down with load (hnr, pauseRatio, prosodyVariation)
            const stressValue = lerp(config.stressMax, config.stressMin, load);
            target = lerp(baseline, stressValue, load);
        }

        return target;
    }

    /**
     * Set the cognitive load level. The simulator smoothly transitions.
     * @param {number} level - Cognitive load in [0, 1].
     */
    setCognitiveLoad(level) {
        this._cognitiveLoad = clamp(level, 0, 1);
    }

    /**
     * Advance the simulation by the given time delta. Metrics evolve smoothly
     * toward their load-dependent targets with added random walk variation.
     * @param {number} deltaTime - Elapsed time in seconds since last update.
     */
    update(deltaTime) {
        this._time += deltaTime;

        // Smooth cognitive load
        this._smoothedLoad = ema(this._cognitiveLoad, this._smoothedLoad, LOAD_SMOOTHING);

        for (const [name, config] of Object.entries(METRICS_CONFIG)) {
            // Compute the load-driven target
            const target = this._computeTarget(name);

            // Advance random walk (mean-reverting Ornstein-Uhlenbeck process)
            const range = Math.max(config.baselineMax - config.baselineMin, 1);
            const walkStep = gaussian(0, RANDOM_WALK_SCALE * range * Math.sqrt(deltaTime));
            this._walkOffsets[name] += walkStep;
            // Mean-revert the walk to prevent unbounded drift
            this._walkOffsets[name] *= Math.exp(-0.5 * deltaTime);

            // Add slow sinusoidal drift (natural breathing/fatigue cycles)
            const drift = range * 0.08 * Math.sin(
                2 * Math.PI * 0.05 * this._time + this._driftPhases[name]
            );

            // Combine target, random walk, and drift
            const rawTarget = target + this._walkOffsets[name] + drift;

            // Smooth toward the combined target
            this._metrics[name] = ema(rawTarget, this._metrics[name], METRIC_SMOOTHING);

            // Clamp to physically plausible range
            const absMin = Math.min(config.baselineMin, config.stressMin) * 0.5;
            const absMax = Math.max(config.baselineMax, config.stressMax) * 1.3;
            this._metrics[name] = clamp(this._metrics[name], absMin, absMax);
        }
    }

    /**
     * Return the current voice biomarker metrics.
     * @returns {{ jitter: number, shimmer: number, f0: number, hnr: number, speechRate: number, pauseRatio: number, prosodyVariation: number }}
     */
    getMetrics() {
        return { ...this._metrics };
    }

    /**
     * Compute a composite voice stress index from 0 (completely relaxed)
     * to 1 (maximum stress). Combines normalized deviations across all metrics.
     * @returns {number} Stress index in [0, 1].
     */
    getStressIndex() {
        let totalWeight = 0;
        let weightedStress = 0;

        const weights = {
            jitter: 1.5,
            shimmer: 1.2,
            f0: 1.0,
            hnr: 1.8,
            speechRate: 0.8,
            pauseRatio: 0.7,
            prosodyVariation: 1.3,
        };

        for (const [name, config] of Object.entries(METRICS_CONFIG)) {
            const value = this._metrics[name];
            const baseline = this._baselines[name];
            const stressCenter = (config.stressMin + config.stressMax) / 2;
            const baselineCenter = (config.baselineMin + config.baselineMax) / 2;
            const stressIncreases = stressCenter > baselineCenter;

            let stressContribution;
            if (stressIncreases) {
                // Higher value = more stress
                const range = config.stressMax - config.baselineMin;
                stressContribution = range > 0
                    ? clamp((value - config.baselineMin) / range, 0, 1)
                    : 0;
            } else {
                // Lower value = more stress
                const range = config.baselineMax - config.stressMin;
                stressContribution = range > 0
                    ? clamp((config.baselineMax - value) / range, 0, 1)
                    : 0;
            }

            const w = weights[name] || 1.0;
            weightedStress += stressContribution * w;
            totalWeight += w;
        }

        return totalWeight > 0 ? clamp(weightedStress / totalWeight, 0, 1) : 0;
    }

    /**
     * Reset the simulator to its initial state with fresh baselines.
     */
    reset() {
        this._cognitiveLoad = 0.3;
        this._smoothedLoad = 0.3;
        this._time = 0;
        this._initializeMetrics();
    }
}
