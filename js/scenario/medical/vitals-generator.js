/**
 * Vitals & Lab Generator
 * G.R.I.P. Platform — generates realistic vital signs and lab results
 * based on medical conditions, severity, and patient demographics
 * @module scenario/medical/vitals-generator
 */

import { randomBetween, randomInt } from '../../utils/random.js';

/**
 * Normal vital sign reference ranges.
 * @type {Object<string, {min: number, max: number, unit: string}>}
 */
const NORMAL_RANGES = {
    hr:       { min: 60, max: 100, unit: 'bpm' },
    bp_sys:   { min: 90, max: 140, unit: 'mmHg' },
    bp_dia:   { min: 60, max: 90,  unit: 'mmHg' },
    temp:     { min: 36.1, max: 37.2, unit: '°C' },
    rr:       { min: 12, max: 20, unit: 'breaths/min' },
    spo2:     { min: 95, max: 100, unit: '%' },
    painScale:{ min: 0, max: 10, unit: '/10' },
};

/**
 * Generate realistic vital signs for a given medical condition.
 * Applies severity scaling and demographic-based adjustments.
 *
 * @param {Object} condition - The condition object from CONDITIONS_DB.
 * @param {number} severity  - Severity multiplier (0.5 = mild, 1.0 = typical, 1.5 = severe).
 * @param {Object} demographics - Patient demographics.
 * @param {number} demographics.age - Patient age.
 * @param {string} demographics.sex - Patient sex ('male' or 'female').
 * @returns {{ hr: number, bp: { systolic: number, diastolic: number }, temp: number, rr: number, spo2: number, painScale: number }}
 */
export function generateVitals(condition, severity = 1.0, demographics = {}) {
    const v = condition.typicalVitals;
    const age = demographics.age ?? 50;
    const sex = demographics.sex ?? 'male';

    // Helper: generate a vital within the condition's range, biased by severity
    // Severity > 1 pushes values toward the more abnormal end
    const genVital = (range, normalRange, invertedAbnormal = false) => {
        const [lo, hi] = range;
        const mid = (lo + hi) / 2;
        const halfSpan = (hi - lo) / 2;

        // Severity shifts toward the extreme end of the condition range
        let base;
        if (invertedAbnormal) {
            // For spo2: lower is more abnormal
            base = mid - halfSpan * (severity - 1) * 0.5;
        } else {
            // For most vitals: higher is more abnormal (HR, RR, temp)
            base = mid + halfSpan * (severity - 1) * 0.3;
        }

        // Add noise
        const noise = randomBetween(-halfSpan * 0.3, halfSpan * 0.3);
        return base + noise;
    };

    // Heart rate — elderly tend to have lower maximal HR responses
    let hr = genVital(v.hr, NORMAL_RANGES.hr);
    if (age > 70) hr = Math.max(hr * 0.9, v.hr[0]);
    if (sex === 'female') hr += randomBetween(-2, 5);
    hr = Math.round(hr);

    // Blood pressure
    let sysBP = genVital(v.bp_sys, NORMAL_RANGES.bp_sys);
    let diaBP = genVital(v.bp_dia, NORMAL_RANGES.bp_dia);
    // Elderly tend to have higher systolic, wider pulse pressure
    if (age > 65) {
        sysBP += randomBetween(5, 15);
        diaBP -= randomBetween(0, 5);
    }
    sysBP = Math.round(sysBP);
    diaBP = Math.round(diaBP);
    // Ensure diastolic < systolic
    if (diaBP >= sysBP) diaBP = sysBP - randomInt(15, 30);

    // Temperature
    let temp = genVital(v.temp, NORMAL_RANGES.temp);
    temp = Math.round(temp * 10) / 10;

    // Respiratory rate
    let rr = genVital(v.rr, NORMAL_RANGES.rr);
    rr = Math.round(rr);

    // SpO2 — lower values are more abnormal
    let spo2 = genVital(v.spo2, NORMAL_RANGES.spo2, true);
    spo2 = Math.round(Math.min(100, Math.max(70, spo2)));

    // Pain scale — derived from urgency and severity
    let painScale;
    switch (condition.urgency) {
        case 'emergent':    painScale = randomInt(5, 10); break;
        case 'urgent':      painScale = randomInt(4, 8);  break;
        case 'semi-urgent': painScale = randomInt(2, 6);  break;
        default:            painScale = randomInt(0, 4);   break;
    }
    painScale = Math.round(painScale * severity);
    painScale = Math.min(10, Math.max(0, painScale));

    return {
        hr,
        bp: { systolic: sysBP, diastolic: diaBP },
        temp,
        rr,
        spo2,
        painScale,
    };
}

/**
 * Generate lab results for a given condition. Each lab has a realistic value
 * generated within the condition's expected range, with normal/abnormal flagging.
 *
 * @param {Object} condition - The condition object from CONDITIONS_DB.
 * @returns {Array<{ test: string, value: string, unit: string, abnormal: boolean }>}
 */
export function generateLabs(condition) {
    if (!condition.typicalLabs || condition.typicalLabs.length === 0) {
        return [];
    }

    return condition.typicalLabs.map(lab => {
        let generatedValue = lab.value;

        // Try to generate a numeric value from range strings like "2.5-50" or ">0.5"
        const rangeMatch = lab.value.match(/^(\d+\.?\d*)\s*-\s*(\d+\.?\d*)$/);
        const gtMatch = lab.value.match(/^>\s*(\d+\.?\d*)$/);
        const ltMatch = lab.value.match(/^<\s*(\d+\.?\d*)$/);

        if (rangeMatch) {
            const lo = parseFloat(rangeMatch[1]);
            const hi = parseFloat(rangeMatch[2]);
            const val = randomBetween(lo, hi);
            generatedValue = val < 10 ? val.toFixed(2) : val.toFixed(1);
        } else if (gtMatch) {
            const threshold = parseFloat(gtMatch[1]);
            const val = threshold * randomBetween(1.2, 3.5);
            generatedValue = val < 10 ? val.toFixed(2) : val.toFixed(1);
        } else if (ltMatch) {
            const threshold = parseFloat(ltMatch[1]);
            const val = threshold * randomBetween(0.2, 0.8);
            generatedValue = val < 10 ? val.toFixed(2) : val.toFixed(1);
        }

        return {
            test: lab.test,
            value: String(generatedValue),
            unit: lab.unit,
            abnormal: lab.abnormal,
        };
    });
}

/**
 * Format vital signs into human-readable display strings.
 *
 * @param {{ hr: number, bp: { systolic: number, diastolic: number }, temp: number, rr: number, spo2: number, painScale: number }} vitals
 * @returns {{ hr: string, bp: string, temp: string, rr: string, spo2: string, painScale: string }}
 */
export function formatVitals(vitals) {
    return {
        hr: `${vitals.hr} bpm`,
        bp: `${vitals.bp.systolic}/${vitals.bp.diastolic} mmHg`,
        temp: `${vitals.temp.toFixed(1)} °C`,
        rr: `${vitals.rr} breaths/min`,
        spo2: `${vitals.spo2}%`,
        painScale: `${vitals.painScale}/10`,
    };
}

/**
 * Determine if a vital sign value is abnormal.
 *
 * @param {'hr'|'bp_sys'|'bp_dia'|'temp'|'rr'|'spo2'} vital - The vital sign type.
 * @param {number} value - The measured value.
 * @returns {boolean} True if the value falls outside the normal reference range.
 */
export function isVitalAbnormal(vital, value) {
    const range = NORMAL_RANGES[vital];
    if (!range) return false;
    return value < range.min || value > range.max;
}
