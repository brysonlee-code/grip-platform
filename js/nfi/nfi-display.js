/**
 * NFI Display
 * G.R.I.P. Platform — animated SVG circular gauge for the Neuroplastic Fitness Index
 * @module nfi/nfi-display
 */

import { clamp, lerp } from '../utils/math-utils.js';

/**
 * Map an NFI value (0-100) to a color string.
 * @param {number} value - NFI value in [0, 100].
 * @returns {string} CSS color string.
 */
function nfiColor(value) {
    if (value < 30) return '#ff3b3b';       // red — low
    if (value < 50) return '#ffbf00';       // yellow — moderate
    if (value < 70) return '#00e5ff';       // cyan — good
    return '#b0ffff';                        // bright cyan/white — excellent
}

/**
 * Trend symbol and color.
 * @param {'rising'|'falling'|'stable'} trend
 * @returns {{ symbol: string, color: string }}
 */
function trendIndicator(trend) {
    switch (trend) {
        case 'rising':  return { symbol: '\u2191', color: '#00ff88' }; // ↑ green
        case 'falling': return { symbol: '\u2193', color: '#ff3b3b' }; // ↓ red
        default:        return { symbol: '\u2192', color: '#aaaaaa' }; // → grey
    }
}

/** SVG namespace */
const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * NFIDisplay renders an animated SVG circular meter with sub-score bars.
 *
 * Gauge arc sweeps 270 degrees from 7 o'clock (225 deg) to 5 o'clock (135 deg, going clockwise).
 * Center shows the NFI number, label, and trend arrow.
 * Below the gauge, four horizontal bars show individual component scores.
 */
export class NFIDisplay {
    /**
     * @param {HTMLElement} container - DOM element to render into.
     * @param {object} [options]
     * @param {number} [options.size=240]   - Gauge diameter in pixels.
     * @param {number} [options.barWidth=16] - Arc stroke width.
     */
    constructor(container, options = {}) {
        if (!container) throw new Error('NFIDisplay requires a container element');

        /** @type {HTMLElement} */
        this._container = container;

        /** @type {number} */
        this._size = options.size || 240;

        /** @type {number} */
        this._barWidth = options.barWidth || 16;

        /** @type {number} Current displayed NFI value (for animation) */
        this._displayedValue = 0;

        /** @type {number} Target NFI value to animate toward */
        this._targetValue = 0;

        /** @type {number|null} requestAnimationFrame ID */
        this._rafId = null;

        /** @type {boolean} Whether the breathing animation is active */
        this._breathing = false;

        /** @type {number|null} Breathing animation interval ID */
        this._breathingIntervalId = null;

        /** @type {boolean} Whether the flow pulse is active */
        this._pulsing = false;

        this._build();
    }

    // ───────────────────────────────────────────────
    //  SVG Construction
    // ───────────────────────────────────────────────

    /**
     * Build the full SVG structure and component bar UI.
     * @private
     */
    _build() {
        // Wrapper
        this._wrapper = document.createElement('div');
        this._wrapper.className = 'nfi-display';
        this._wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:12px;';

        // SVG element
        const svg = document.createElementNS(SVG_NS, 'svg');
        const totalSize = this._size + 20; // padding for glow
        svg.setAttribute('width', totalSize);
        svg.setAttribute('height', totalSize);
        svg.setAttribute('viewBox', `0 0 ${totalSize} ${totalSize}`);
        svg.style.overflow = 'visible';
        this._svg = svg;

        // Defs: glow filter
        const defs = document.createElementNS(SVG_NS, 'defs');
        const filter = document.createElementNS(SVG_NS, 'filter');
        filter.setAttribute('id', 'nfi-glow');
        filter.setAttribute('x', '-50%');
        filter.setAttribute('y', '-50%');
        filter.setAttribute('width', '200%');
        filter.setAttribute('height', '200%');

        const blur = document.createElementNS(SVG_NS, 'feGaussianBlur');
        blur.setAttribute('stdDeviation', '4');
        blur.setAttribute('result', 'blur');
        filter.appendChild(blur);

        const merge = document.createElementNS(SVG_NS, 'feMerge');
        const mergeBlur = document.createElementNS(SVG_NS, 'feMergeNode');
        mergeBlur.setAttribute('in', 'blur');
        merge.appendChild(mergeBlur);
        const mergeOrig = document.createElementNS(SVG_NS, 'feMergeNode');
        mergeOrig.setAttribute('in', 'SourceGraphic');
        merge.appendChild(mergeOrig);
        filter.appendChild(merge);
        defs.appendChild(filter);
        svg.appendChild(defs);

        // Arc parameters
        const cx = totalSize / 2;
        const cy = totalSize / 2;
        const radius = (this._size - this._barWidth) / 2;

        // Background arc (full 270 degrees, dark)
        this._bgArc = this._createArc(cx, cy, radius, 0, 270, '#1a2a3a', this._barWidth);
        this._bgArc.style.opacity = '0.4';
        svg.appendChild(this._bgArc);

        // Value arc (animated, cyan with glow)
        this._valueArc = this._createArc(cx, cy, radius, 0, 0, '#00e5ff', this._barWidth);
        this._valueArc.setAttribute('filter', 'url(#nfi-glow)');
        this._valueArc.style.transition = 'none'; // we animate manually
        svg.appendChild(this._valueArc);

        // Center text group
        const textGroup = document.createElementNS(SVG_NS, 'g');

        // Large NFI number
        this._numberText = document.createElementNS(SVG_NS, 'text');
        this._numberText.setAttribute('x', cx);
        this._numberText.setAttribute('y', cy - 8);
        this._numberText.setAttribute('text-anchor', 'middle');
        this._numberText.setAttribute('dominant-baseline', 'central');
        this._numberText.setAttribute('font-family', '"SF Mono", "Fira Code", "Consolas", monospace');
        this._numberText.setAttribute('font-size', '42');
        this._numberText.setAttribute('font-weight', 'bold');
        this._numberText.setAttribute('fill', '#00e5ff');
        this._numberText.textContent = '0';
        textGroup.appendChild(this._numberText);

        // "NFI" label
        this._labelText = document.createElementNS(SVG_NS, 'text');
        this._labelText.setAttribute('x', cx);
        this._labelText.setAttribute('y', cy + 22);
        this._labelText.setAttribute('text-anchor', 'middle');
        this._labelText.setAttribute('dominant-baseline', 'central');
        this._labelText.setAttribute('font-family', 'sans-serif');
        this._labelText.setAttribute('font-size', '13');
        this._labelText.setAttribute('font-weight', '600');
        this._labelText.setAttribute('fill', '#7799aa');
        this._labelText.setAttribute('letter-spacing', '3');
        this._labelText.textContent = 'NFI';
        textGroup.appendChild(this._labelText);

        // Trend arrow
        this._trendText = document.createElementNS(SVG_NS, 'text');
        this._trendText.setAttribute('x', cx);
        this._trendText.setAttribute('y', cy + 42);
        this._trendText.setAttribute('text-anchor', 'middle');
        this._trendText.setAttribute('dominant-baseline', 'central');
        this._trendText.setAttribute('font-size', '20');
        this._trendText.setAttribute('fill', '#aaaaaa');
        this._trendText.textContent = '\u2192'; // →
        textGroup.appendChild(this._trendText);

        svg.appendChild(textGroup);
        this._wrapper.appendChild(svg);

        // ── Component sub-score bars ──
        this._barsContainer = document.createElement('div');
        this._barsContainer.className = 'nfi-bars';
        this._barsContainer.style.cssText = 'display:flex;flex-direction:column;gap:6px;width:100%;max-width:220px;';

        const barLabels = ['Neural', 'Focus', 'Vocal', 'Response'];
        const barKeys = ['neuralEfficiency', 'focusStability', 'vocalCalm', 'responseQuality'];
        this._bars = {};

        for (let i = 0; i < barLabels.length; i++) {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;gap:8px;';

            const label = document.createElement('span');
            label.style.cssText = 'font-size:11px;color:#7799aa;width:56px;text-align:right;font-family:sans-serif;';
            label.textContent = barLabels[i];
            row.appendChild(label);

            const track = document.createElement('div');
            track.style.cssText = 'flex:1;height:6px;background:#1a2a3a;border-radius:3px;overflow:hidden;';

            const fill = document.createElement('div');
            fill.style.cssText = 'height:100%;width:0%;border-radius:3px;transition:width 0.4s ease, background-color 0.4s ease;background:#00e5ff;';
            track.appendChild(fill);
            row.appendChild(track);

            this._barsContainer.appendChild(row);
            this._bars[barKeys[i]] = fill;
        }

        this._wrapper.appendChild(this._barsContainer);
        this._container.appendChild(this._wrapper);

        // Store geometry for arc updates
        this._cx = cx;
        this._cy = cy;
        this._radius = radius;
    }

    /**
     * Create an SVG arc path element.
     * The arc starts at 225 degrees (7 o'clock) and sweeps clockwise.
     *
     * @param {number} cx     - Center x.
     * @param {number} cy     - Center y.
     * @param {number} r      - Radius.
     * @param {number} startDeg - Offset from arc start in degrees (for partial arcs).
     * @param {number} sweepDeg - Sweep angle in degrees (max 270).
     * @param {string} color  - Stroke color.
     * @param {number} width  - Stroke width.
     * @returns {SVGPathElement}
     * @private
     */
    _createArc(cx, cy, r, startDeg, sweepDeg, color, width) {
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', this._arcPath(cx, cy, r, sweepDeg));
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', width);
        path.setAttribute('stroke-linecap', 'round');
        return path;
    }

    /**
     * Generate an SVG arc path string.
     * Arc origin is at 225 degrees (7 o'clock) sweeping clockwise.
     *
     * @param {number} cx       - Center x.
     * @param {number} cy       - Center y.
     * @param {number} r        - Radius.
     * @param {number} sweepDeg - Sweep angle in degrees [0, 270].
     * @returns {string} SVG path "d" attribute value.
     * @private
     */
    _arcPath(cx, cy, r, sweepDeg) {
        if (sweepDeg <= 0) {
            // Zero-length arc: just a point (invisible)
            const startRad = (225 * Math.PI) / 180;
            const sx = cx + r * Math.cos(startRad);
            const sy = cy + r * Math.sin(startRad);
            return `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${sx} ${sy}`;
        }

        const startAngle = 225; // 7 o'clock
        const endAngle = startAngle + sweepDeg;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const sx = cx + r * Math.cos(startRad);
        const sy = cy + r * Math.sin(startRad);
        const ex = cx + r * Math.cos(endRad);
        const ey = cy + r * Math.sin(endRad);

        const largeArcFlag = sweepDeg > 180 ? 1 : 0;

        return `M ${sx} ${sy} A ${r} ${r} 0 ${largeArcFlag} 1 ${ex} ${ey}`;
    }

    // ───────────────────────────────────────────────
    //  Public API
    // ───────────────────────────────────────────────

    /**
     * Update the display with new NFI data.
     * Animates the gauge arc, number counter, trend arrow, and component bars.
     *
     * @param {object} nfiData
     * @param {number} nfiData.composite - Smoothed NFI value (0-100).
     * @param {object} nfiData.components - Sub-score components.
     * @param {number} nfiData.components.neuralEfficiency
     * @param {number} nfiData.components.focusStability
     * @param {number} nfiData.components.vocalCalm
     * @param {number} nfiData.components.responseQuality
     * @param {'rising'|'falling'|'stable'} [nfiData.trend='stable'] - Current trend.
     */
    update(nfiData) {
        if (!nfiData) return;

        const { composite = 0, components = {}, trend = 'stable' } = nfiData;

        this._targetValue = clamp(composite, 0, 100);

        // Start the animation loop if not already running
        if (this._rafId === null) {
            this._animate();
        }

        // Update trend indicator
        const { symbol, color } = trendIndicator(trend);
        this._trendText.textContent = symbol;
        this._trendText.setAttribute('fill', color);

        // Update component bars
        for (const [key, fill] of Object.entries(this._bars)) {
            const value = clamp(components[key] ?? 0, 0, 100);
            fill.style.width = `${value}%`;
            fill.style.backgroundColor = nfiColor(value);
        }

        // Manage flow-state pulse (70-85 range)
        const inFlowState = composite >= 70 && composite <= 85;
        if (inFlowState && !this._pulsing) {
            this._startPulse();
        } else if (!inFlowState && this._pulsing) {
            this._stopPulse();
        }
    }

    /**
     * Activate a special breathing animation overlay.
     * Used when fatigue is detected and a breather is recommended.
     */
    showBreathing() {
        if (this._breathing) return;
        this._breathing = true;

        // Create a pulsing overlay circle
        const overlay = document.createElementNS(SVG_NS, 'circle');
        overlay.setAttribute('cx', this._cx);
        overlay.setAttribute('cy', this._cy);
        overlay.setAttribute('r', this._radius * 0.6);
        overlay.setAttribute('fill', 'none');
        overlay.setAttribute('stroke', '#00e5ff');
        overlay.setAttribute('stroke-width', '2');
        overlay.setAttribute('opacity', '0.3');
        overlay.id = 'nfi-breathing-overlay';
        this._svg.appendChild(overlay);

        let expanding = true;
        let currentR = this._radius * 0.4;
        const minR = this._radius * 0.4;
        const maxR = this._radius * 0.75;
        const step = 0.4;

        this._breathingIntervalId = setInterval(() => {
            if (expanding) {
                currentR += step;
                if (currentR >= maxR) expanding = false;
            } else {
                currentR -= step;
                if (currentR <= minR) expanding = true;
            }
            overlay.setAttribute('r', currentR);
            const opacity = lerp(0.1, 0.35, (currentR - minR) / (maxR - minR));
            overlay.setAttribute('opacity', opacity);
        }, 16); // ~60fps
    }

    /**
     * Stop the breathing animation.
     * @private
     */
    _stopBreathing() {
        this._breathing = false;
        if (this._breathingIntervalId !== null) {
            clearInterval(this._breathingIntervalId);
            this._breathingIntervalId = null;
        }
        const overlay = this._svg.querySelector('#nfi-breathing-overlay');
        if (overlay) overlay.remove();
    }

    /**
     * Clean up all DOM elements and animations.
     */
    destroy() {
        this._stopBreathing();
        this._stopPulse();
        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        if (this._wrapper && this._wrapper.parentNode) {
            this._wrapper.parentNode.removeChild(this._wrapper);
        }
    }

    // ───────────────────────────────────────────────
    //  Animation internals
    // ───────────────────────────────────────────────

    /**
     * Main animation loop. Smoothly interpolates the displayed value toward the target.
     * Updates the arc, number, and colors each frame.
     * @private
     */
    _animate() {
        const diff = this._targetValue - this._displayedValue;

        // Lerp toward target
        if (Math.abs(diff) < 0.3) {
            this._displayedValue = this._targetValue;
        } else {
            this._displayedValue += diff * 0.12;
        }

        // Update arc sweep (270 degrees max)
        const sweepDeg = (this._displayedValue / 100) * 270;
        this._valueArc.setAttribute(
            'd',
            this._arcPath(this._cx, this._cy, this._radius, sweepDeg)
        );

        // Update arc color
        const color = nfiColor(this._displayedValue);
        this._valueArc.setAttribute('stroke', color);

        // Update number display
        this._numberText.textContent = Math.round(this._displayedValue);
        this._numberText.setAttribute('fill', color);

        // Continue animation if not settled
        if (Math.abs(this._targetValue - this._displayedValue) > 0.1) {
            this._rafId = requestAnimationFrame(() => this._animate());
        } else {
            this._rafId = null;
        }
    }

    /**
     * Start a subtle pulse animation for the flow-state range (70-85).
     * The arc glow oscillates in opacity.
     * @private
     */
    _startPulse() {
        if (this._pulsing) return;
        this._pulsing = true;

        // Use a CSS animation on the value arc for a subtle pulse
        this._valueArc.style.animation = 'nfi-pulse 2s ease-in-out infinite';

        // Inject the keyframes if not already present
        if (!document.getElementById('nfi-pulse-style')) {
            const style = document.createElement('style');
            style.id = 'nfi-pulse-style';
            style.textContent = `
                @keyframes nfi-pulse {
                    0%, 100% { opacity: 1; filter: url(#nfi-glow); }
                    50% { opacity: 0.7; filter: url(#nfi-glow) brightness(1.3); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Stop the flow-state pulse animation.
     * @private
     */
    _stopPulse() {
        this._pulsing = false;
        this._valueArc.style.animation = '';
    }
}
