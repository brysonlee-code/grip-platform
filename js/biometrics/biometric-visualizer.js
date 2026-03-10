/**
 * Biometric Visualizer
 * G.R.I.P. Platform — real-time Canvas rendering of EEG, Eye Tracking, and Voice data
 * @module biometrics/biometric-visualizer
 */

import { clamp, lerp, normalize } from '../utils/math-utils.js';

/* ---- Color constants ---- */
const CYAN         = '#00F0FF';
const CYAN_DIM     = 'rgba(0, 240, 255, 0.35)';
const CYAN_GLOW    = 'rgba(0, 240, 255, 0.6)';
const BG_DARK      = '#0D0D15';
const GRID_COLOR   = '#1a1a2e';
const TEXT_PRIMARY  = '#E0E0E0';
const TEXT_MUTED    = '#555570';
const TEXT_DIM      = '#8888AA';
const GREEN         = '#00FF88';
const YELLOW        = '#FFB800';
const RED           = '#FF4060';
const FONT_MONO     = '"JetBrains Mono", "Fira Code", monospace';

/* ---- EEG band config ---- */
const EEG_BANDS = [
    { key: 'delta', label: '\u03B4', color: '#6366f1' },
    { key: 'theta', label: '\u03B8', color: '#8b5cf6' },
    { key: 'alpha', label: '\u03B1', color: '#00F0FF' },
    { key: 'beta',  label: '\u03B2', color: '#22d3ee' },
    { key: 'gamma', label: '\u03B3', color: '#f472b6' },
];

/* ---- Voice metric config ---- */
const VOICE_METRICS = [
    { key: 'jitter',   label: 'Jitter',   unit: '%',  min: 0, max: 5,   normalMax: 1.5,  warnMax: 3.0 },
    { key: 'shimmer',  label: 'Shimmer',  unit: '%',  min: 0, max: 10,  normalMax: 3.0,  warnMax: 6.0 },
    { key: 'hnr',      label: 'HNR',      unit: 'dB', min: 0, max: 30,  normalMax: 25,   warnMax: 15, invert: true },
    { key: 'f0',       label: 'F0',       unit: 'Hz', min: 50, max: 300, normalMax: 180, warnMax: 220 },
    { key: 'prosody',  label: 'Prosody',  unit: '',   min: 0, max: 1,   normalMax: 0.7,  warnMax: 0.4, invert: true },
];

/**
 * BiometricVisualizer renders three Canvas panels showing real-time biometric data.
 * - EEG oscilloscope waveform with band power bars
 * - Eye tracking gaze heatmap with trail and metrics
 * - Voice biomarker bar meters with stress index
 */
export class BiometricVisualizer {
    /**
     * @param {HTMLElement} container — parent element to hold the three canvases
     */
    constructor(container) {
        this._container = container;
        this._destroyed = false;
        this._rafId = null;

        /* ---- Create wrapper ---- */
        this._wrapper = document.createElement('div');
        this._wrapper.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 8px;
            width: 100%;
            height: 100%;
            min-height: 300px;
        `;
        container.appendChild(this._wrapper);

        /* ---- Create three canvas panels ---- */
        this._eegCanvas   = this._createCanvas('eeg-panel');
        this._eyeCanvas   = this._createCanvas('eye-panel');
        this._voiceCanvas = this._createCanvas('voice-panel');

        // EEG spans full top row
        this._eegCanvas.style.gridColumn = '1 / -1';

        this._wrapper.appendChild(this._eegCanvas);
        this._wrapper.appendChild(this._eyeCanvas);
        this._wrapper.appendChild(this._voiceCanvas);

        this._eegCtx   = this._eegCanvas.getContext('2d');
        this._eyeCtx   = this._eyeCanvas.getContext('2d');
        this._voiceCtx = this._voiceCanvas.getContext('2d');

        /* ---- Internal state ---- */
        // EEG waveform buffer (scrolling)
        this._eegBuffer = new Float32Array(512);
        this._eegWriteIndex = 0;
        this._bandPowers = { delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0 };

        // Eye tracking trail
        this._gazeTrail = []; // { x, y, t }
        this._gazeTrailMax = 50;
        this._gazePoint = null; // { x, y }
        this._fixating = false;
        this._blinking = false;
        this._eyeMetrics = { fixationCount: 0, avgFixationDuration: 0, blinkRate: 0 };

        // Voice bar animated values (for smooth transitions)
        this._voiceAnimated = {};
        for (const m of VOICE_METRICS) {
            this._voiceAnimated[m.key] = 0;
        }
        this._voiceStressIndex = 0;
        this._voiceStressAnimated = 0;

        /* ---- Initial resize ---- */
        this.resize();

        /* ---- Resize observer ---- */
        this._resizeObserver = new ResizeObserver(() => this.resize());
        this._resizeObserver.observe(container);
    }

    /**
     * Create a canvas element with appropriate styling.
     * @param {string} id
     * @returns {HTMLCanvasElement}
     */
    _createCanvas(id) {
        const canvas = document.createElement('canvas');
        canvas.id = id;
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
            border-radius: 6px;
            background: ${BG_DARK};
            display: block;
        `;
        return canvas;
    }

    /**
     * Handle container resize — update canvas dimensions to match CSS layout.
     */
    resize() {
        if (this._destroyed) return;
        const dpr = window.devicePixelRatio || 1;

        for (const canvas of [this._eegCanvas, this._eyeCanvas, this._voiceCanvas]) {
            const rect = canvas.getBoundingClientRect();
            canvas.width  = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);
            const ctx = canvas.getContext('2d');
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
    }

    /**
     * Update the visualizer with a new biometric snapshot. Called each frame.
     * @param {Object} snapshot
     * @param {Object} [snapshot.eeg]
     * @param {number} [snapshot.eeg.amplitude] — current EEG amplitude (-1 to 1)
     * @param {Object} [snapshot.eeg.bandPowers] — { delta, theta, alpha, beta, gamma } (0-1)
     * @param {Object} [snapshot.eye]
     * @param {number} [snapshot.eye.gazeX] — normalized gaze X (0-1)
     * @param {number} [snapshot.eye.gazeY] — normalized gaze Y (0-1)
     * @param {boolean} [snapshot.eye.fixating]
     * @param {boolean} [snapshot.eye.blinking]
     * @param {number} [snapshot.eye.fixationCount]
     * @param {number} [snapshot.eye.avgFixationDuration] — ms
     * @param {number} [snapshot.eye.blinkRate] — blinks/min
     * @param {Object} [snapshot.voice]
     * @param {number} [snapshot.voice.jitter]
     * @param {number} [snapshot.voice.shimmer]
     * @param {number} [snapshot.voice.hnr]
     * @param {number} [snapshot.voice.f0]
     * @param {number} [snapshot.voice.prosody]
     * @param {number} [snapshot.voice.stressIndex] — 0-100
     */
    update(snapshot) {
        if (this._destroyed) return;

        const now = performance.now();

        /* ---- Ingest EEG data ---- */
        if (snapshot?.eeg) {
            const amp = snapshot.eeg.amplitude ?? 0;
            this._eegBuffer[this._eegWriteIndex % this._eegBuffer.length] = amp;
            this._eegWriteIndex++;

            if (snapshot.eeg.bandPowers) {
                for (const band of EEG_BANDS) {
                    const target = snapshot.eeg.bandPowers[band.key] ?? 0;
                    this._bandPowers[band.key] = lerp(this._bandPowers[band.key], target, 0.15);
                }
            }
        }

        /* ---- Ingest eye tracking data ---- */
        if (snapshot?.eye) {
            this._blinking = !!snapshot.eye.blinking;
            this._fixating = !!snapshot.eye.fixating;

            if (!this._blinking && snapshot.eye.gazeX != null && snapshot.eye.gazeY != null) {
                this._gazePoint = { x: snapshot.eye.gazeX, y: snapshot.eye.gazeY };
                this._gazeTrail.push({ x: snapshot.eye.gazeX, y: snapshot.eye.gazeY, t: now });
                if (this._gazeTrail.length > this._gazeTrailMax) {
                    this._gazeTrail.shift();
                }
            }

            this._eyeMetrics.fixationCount = snapshot.eye.fixationCount ?? this._eyeMetrics.fixationCount;
            this._eyeMetrics.avgFixationDuration = snapshot.eye.avgFixationDuration ?? this._eyeMetrics.avgFixationDuration;
            this._eyeMetrics.blinkRate = snapshot.eye.blinkRate ?? this._eyeMetrics.blinkRate;
        }

        /* ---- Ingest voice data ---- */
        if (snapshot?.voice) {
            for (const m of VOICE_METRICS) {
                const target = snapshot.voice[m.key] ?? 0;
                this._voiceAnimated[m.key] = lerp(this._voiceAnimated[m.key], target, 0.12);
            }
            this._voiceStressIndex = snapshot.voice.stressIndex ?? this._voiceStressIndex;
            this._voiceStressAnimated = lerp(this._voiceStressAnimated, this._voiceStressIndex, 0.1);
        }

        /* ---- Draw all panels ---- */
        this._drawEEG();
        this._drawEye(now);
        this._drawVoice();
    }

    /* ================================================================
     *  EEG Panel — oscilloscope-style scrolling waveform
     * ================================================================ */
    _drawEEG() {
        const canvas = this._eegCanvas;
        const ctx = this._eegCtx;
        const w = canvas.getBoundingClientRect().width;
        const h = canvas.getBoundingClientRect().height;

        if (w === 0 || h === 0) return;

        ctx.clearRect(0, 0, w, h);

        /* ---- Background ---- */
        ctx.fillStyle = BG_DARK;
        ctx.fillRect(0, 0, w, h);

        /* ---- Grid lines ---- */
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 0.5;
        const gridSpacingX = 40;
        const gridSpacingY = 30;
        ctx.beginPath();
        for (let x = gridSpacingX; x < w - 80; x += gridSpacingX) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
        }
        for (let y = gridSpacingY; y < h; y += gridSpacingY) {
            ctx.moveTo(0, y);
            ctx.lineTo(w - 80, y);
        }
        ctx.stroke();

        /* ---- Center line ---- */
        ctx.strokeStyle = 'rgba(26, 26, 46, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w - 80, h / 2);
        ctx.stroke();

        /* ---- Waveform ---- */
        const bufLen = this._eegBuffer.length;
        const plotWidth = w - 90;
        const samples = Math.min(bufLen, Math.floor(plotWidth));
        const startIdx = this._eegWriteIndex - samples;
        const midY = h / 2;
        const ampScale = h * 0.4;

        // Glow effect
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = CYAN_GLOW;
        ctx.strokeStyle = CYAN;
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();

        for (let i = 0; i < samples; i++) {
            const idx = ((startIdx + i) % bufLen + bufLen) % bufLen;
            const val = this._eegBuffer[idx];
            const x = (i / samples) * plotWidth;
            const y = midY - val * ampScale;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Second pass: brighter core line (no shadow)
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.9)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let i = 0; i < samples; i++) {
            const idx = ((startIdx + i) % bufLen + bufLen) % bufLen;
            const val = this._eegBuffer[idx];
            const x = (i / samples) * plotWidth;
            const y = midY - val * ampScale;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();

        /* ---- Band power bars (right side) ---- */
        const barAreaX = w - 75;
        const barWidth = 50;
        const barHeight = 8;
        const barGap = 4;
        const bandsStartY = h / 2 - ((EEG_BANDS.length * (barHeight + barGap)) / 2);

        for (let i = 0; i < EEG_BANDS.length; i++) {
            const band = EEG_BANDS[i];
            const power = clamp(this._bandPowers[band.key], 0, 1);
            const y = bandsStartY + i * (barHeight + barGap);

            // Label
            ctx.fillStyle = TEXT_DIM;
            ctx.font = `10px ${FONT_MONO}`;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(band.label, barAreaX - 4, y + barHeight / 2);

            // Background track
            ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.fillRect(barAreaX, y, barWidth, barHeight);

            // Fill
            ctx.fillStyle = band.color;
            ctx.fillRect(barAreaX, y, barWidth * power, barHeight);
        }

        /* ---- Panel label ---- */
        ctx.fillStyle = TEXT_MUTED;
        ctx.font = `11px ${FONT_MONO}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('EEG \u2014 Neural Activity', 10, 8);
    }

    /* ================================================================
     *  Eye Tracking Panel — gaze heatmap with trail
     * ================================================================ */
    _drawEye(now) {
        const canvas = this._eyeCanvas;
        const ctx = this._eyeCtx;
        const w = canvas.getBoundingClientRect().width;
        const h = canvas.getBoundingClientRect().height;

        if (w === 0 || h === 0) return;

        ctx.clearRect(0, 0, w, h);

        /* ---- Background ---- */
        ctx.fillStyle = BG_DARK;
        ctx.fillRect(0, 0, w, h);

        /* ---- Screen area representation ---- */
        const pad = 20;
        const screenX = pad;
        const screenY = 28;
        const screenW = w - pad * 2;
        const screenH = h - 28 - pad;

        ctx.fillStyle = '#0a0a12';
        ctx.fillRect(screenX, screenY, screenW, screenH);
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX, screenY, screenW, screenH);

        /* ---- Focus zone (center dashed rectangle) ---- */
        const fzW = screenW * 0.3;
        const fzH = screenH * 0.3;
        const fzX = screenX + (screenW - fzW) / 2;
        const fzY = screenY + (screenH - fzH) / 2;

        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(fzX, fzY, fzW, fzH);
        ctx.setLineDash([]);
        ctx.restore();

        /* ---- Gaze trail (fading dots) ---- */
        for (let i = 0; i < this._gazeTrail.length; i++) {
            const pt = this._gazeTrail[i];
            const age = (now - pt.t) / 1000; // seconds
            const opacity = clamp(1 - age / 3, 0.02, 0.6);
            const trailFraction = i / this._gazeTrail.length;
            const radius = 2 + trailFraction * 2;

            const px = screenX + pt.x * screenW;
            const py = screenY + pt.y * screenH;

            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 240, 255, ${opacity * trailFraction})`;
            ctx.fill();
        }

        /* ---- Current gaze point ---- */
        if (this._gazePoint && !this._blinking) {
            const gx = screenX + this._gazePoint.x * screenW;
            const gy = screenY + this._gazePoint.y * screenH;
            const dotRadius = this._fixating ? 8 : 5;

            // Outer glow
            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = CYAN_GLOW;
            ctx.beginPath();
            ctx.arc(gx, gy, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = CYAN;
            ctx.fill();
            ctx.restore();

            // Inner bright core
            ctx.beginPath();
            ctx.arc(gx, gy, dotRadius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            // Fixation ring
            if (this._fixating) {
                ctx.beginPath();
                ctx.arc(gx, gy, dotRadius + 4, 0, Math.PI * 2);
                ctx.strokeStyle = CYAN_DIM;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        /* ---- Metrics overlay ---- */
        const metricsY = h - 14;
        ctx.fillStyle = TEXT_DIM;
        ctx.font = `10px ${FONT_MONO}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';

        const fixCount = this._eyeMetrics.fixationCount;
        const avgDur   = this._eyeMetrics.avgFixationDuration.toFixed(0);
        const blinkR   = this._eyeMetrics.blinkRate.toFixed(1);

        ctx.fillText(`FIX: ${fixCount}`, pad, metricsY);
        ctx.fillText(`DUR: ${avgDur}ms`, pad + 70, metricsY);
        ctx.fillText(`BLK: ${blinkR}/m`, pad + 155, metricsY);

        /* ---- Panel label ---- */
        ctx.fillStyle = TEXT_MUTED;
        ctx.font = `11px ${FONT_MONO}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('GAZE \u2014 Eye Tracking', 10, 8);
    }

    /* ================================================================
     *  Voice Panel — horizontal bar meters with stress index
     * ================================================================ */
    _drawVoice() {
        const canvas = this._voiceCanvas;
        const ctx = this._voiceCtx;
        const w = canvas.getBoundingClientRect().width;
        const h = canvas.getBoundingClientRect().height;

        if (w === 0 || h === 0) return;

        ctx.clearRect(0, 0, w, h);

        /* ---- Background ---- */
        ctx.fillStyle = BG_DARK;
        ctx.fillRect(0, 0, w, h);

        /* ---- Bar metrics ---- */
        const barPadLeft = 70;
        const barPadRight = 20;
        const barAreaTop = 30;
        const barAreaBottom = h - 40;
        const barCount = VOICE_METRICS.length;
        const totalBarSpace = barAreaBottom - barAreaTop;
        const barHeight = Math.min(14, (totalBarSpace / barCount) * 0.55);
        const barGap = (totalBarSpace - barHeight * barCount) / (barCount + 1);
        const barWidth = w - barPadLeft - barPadRight;

        for (let i = 0; i < VOICE_METRICS.length; i++) {
            const m = VOICE_METRICS[i];
            const animVal = this._voiceAnimated[m.key];
            const y = barAreaTop + barGap + i * (barHeight + barGap);

            // Normalize value to 0-1 for bar fill
            const normVal = clamp((animVal - m.min) / (m.max - m.min), 0, 1);

            // Determine color zone
            let fillColor;
            if (m.invert) {
                // For inverted metrics (HNR, prosody): higher is better
                const normNormal = (m.normalMax - m.min) / (m.max - m.min);
                const normWarn   = (m.warnMax - m.min) / (m.max - m.min);
                if (normVal >= normNormal) {
                    fillColor = GREEN;
                } else if (normVal >= normWarn) {
                    fillColor = YELLOW;
                } else {
                    fillColor = RED;
                }
            } else {
                // Normal: lower is better (jitter, shimmer, f0)
                const normNormal = (m.normalMax - m.min) / (m.max - m.min);
                const normWarn   = (m.warnMax - m.min) / (m.max - m.min);
                if (normVal <= normNormal) {
                    fillColor = GREEN;
                } else if (normVal <= normWarn) {
                    fillColor = YELLOW;
                } else {
                    fillColor = RED;
                }
            }

            // Label
            ctx.fillStyle = TEXT_DIM;
            ctx.font = `10px ${FONT_MONO}`;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(m.label, barPadLeft - 8, y + barHeight / 2);

            // Background track
            ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.fillRect(barPadLeft, y, barWidth, barHeight);

            // Normal range indicator (subtle green zone)
            const normalEndNorm = m.invert
                ? clamp((m.normalMax - m.min) / (m.max - m.min), 0, 1)
                : clamp((m.normalMax - m.min) / (m.max - m.min), 0, 1);
            if (m.invert) {
                // Green zone is from normalMax to max
                ctx.fillStyle = 'rgba(0, 255, 136, 0.06)';
                ctx.fillRect(barPadLeft + normalEndNorm * barWidth, y, (1 - normalEndNorm) * barWidth, barHeight);
            } else {
                // Green zone is from 0 to normalMax
                ctx.fillStyle = 'rgba(0, 255, 136, 0.06)';
                ctx.fillRect(barPadLeft, y, normalEndNorm * barWidth, barHeight);
            }

            // Fill bar
            ctx.save();
            ctx.shadowBlur = 4;
            ctx.shadowColor = fillColor === GREEN ? 'rgba(0,255,136,0.3)'
                            : fillColor === YELLOW ? 'rgba(255,184,0,0.3)'
                            : 'rgba(255,64,96,0.3)';
            ctx.fillStyle = fillColor;
            ctx.fillRect(barPadLeft, y, barWidth * normVal, barHeight);
            ctx.restore();

            // Value text
            const displayVal = animVal < 10 ? animVal.toFixed(2) : animVal.toFixed(1);
            ctx.fillStyle = TEXT_PRIMARY;
            ctx.font = `10px ${FONT_MONO}`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${displayVal}${m.unit}`, barPadLeft + barWidth + 4, y + barHeight / 2);
        }

        /* ---- Voice Stress Index ---- */
        const stressVal = this._voiceStressAnimated;
        const stressColor = stressVal < 35 ? GREEN : stressVal < 65 ? YELLOW : RED;

        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = stressColor === GREEN ? 'rgba(0,255,136,0.4)'
                        : stressColor === YELLOW ? 'rgba(255,184,0,0.4)'
                        : 'rgba(255,64,96,0.4)';
        ctx.fillStyle = stressColor;
        ctx.font = `bold 18px ${FONT_MONO}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(stressVal.toFixed(0), w / 2, h - 6);
        ctx.restore();

        ctx.fillStyle = TEXT_MUTED;
        ctx.font = `9px ${FONT_MONO}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('VOICE STRESS INDEX', w / 2, h - 26);

        /* ---- Panel label ---- */
        ctx.fillStyle = TEXT_MUTED;
        ctx.font = `11px ${FONT_MONO}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('VOICE \u2014 Vocal Biomarkers', 10, 8);
    }

    /**
     * Tear down the visualizer, remove canvases, stop observers.
     */
    destroy() {
        this._destroyed = true;
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
        if (this._wrapper && this._wrapper.parentNode) {
            this._wrapper.parentNode.removeChild(this._wrapper);
        }
        this._eegCanvas = null;
        this._eyeCanvas = null;
        this._voiceCanvas = null;
        this._eegCtx = null;
        this._eyeCtx = null;
        this._voiceCtx = null;
    }
}
