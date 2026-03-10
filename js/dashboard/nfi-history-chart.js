/**
 * NFI History Chart
 * G.R.I.P. Platform — canvas-based line chart for NFI score over time
 * @module dashboard/nfi-history-chart
 */

import { THEME, drawGlowLine, drawGlowCircle } from '../ui/theme.js';

/**
 * Padding around the chart area in pixels.
 * @type {{ top: number, right: number, bottom: number, left: number }}
 */
const PADDING = { top: 20, right: 20, bottom: 40, left: 50 };

/**
 * Reference lines drawn at these NFI values.
 * @type {number[]}
 */
const REFERENCE_LINES = [25, 50, 75];

/**
 * Canvas-based line chart that renders NFI history data as a glowing cyan line
 * with gradient fill, data point dots, and reference grid lines.
 */
export class NFIHistoryChart {

    /**
     * @param {HTMLCanvasElement} canvas - The canvas element to draw on.
     */
    constructor(canvas) {
        /** @type {HTMLCanvasElement} */
        this._canvas = canvas;

        /** @type {CanvasRenderingContext2D} */
        this._ctx = canvas.getContext('2d');

        /** @type {{ date: number, nfi: number }[]} Cached data points */
        this._dataPoints = [];

        // Set initial size
        this._updateCanvasSize();
    }

    /**
     * Render the chart with the given data points.
     * @param {{ date: number, nfi: number }[]} dataPoints - Array of { date, nfi } values.
     */
    render(dataPoints) {
        this._dataPoints = dataPoints || [];
        this._updateCanvasSize();
        this._draw();
    }

    /**
     * Handle canvas resize. Redraws with current data.
     */
    resize() {
        this._updateCanvasSize();
        this._draw();
    }

    /**
     * Clean up resources.
     */
    destroy() {
        this._dataPoints = [];
        this._canvas = null;
        this._ctx = null;
    }

    // -----------------------------------------------------------------------
    // Private drawing methods
    // -----------------------------------------------------------------------

    /**
     * Update the canvas internal dimensions to match its CSS layout size.
     * @private
     */
    _updateCanvasSize() {
        if (!this._canvas) return;

        const rect = this._canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this._canvas.width = rect.width * dpr;
        this._canvas.height = rect.height * dpr;
        this._ctx.scale(dpr, dpr);

        this._width = rect.width;
        this._height = rect.height;
    }

    /**
     * Main draw routine.
     * @private
     */
    _draw() {
        if (!this._ctx) return;

        const ctx = this._ctx;
        const w = this._width;
        const h = this._height;

        // Clear canvas
        ctx.clearRect(0, 0, w, h);

        // Draw dark background
        ctx.fillStyle = THEME.bgPrimary;
        ctx.fillRect(0, 0, w, h);

        // Chart area dimensions
        const chartX = PADDING.left;
        const chartY = PADDING.top;
        const chartW = w - PADDING.left - PADDING.right;
        const chartH = h - PADDING.top - PADDING.bottom;

        // Draw grid and reference lines
        this._drawGrid(ctx, chartX, chartY, chartW, chartH);

        // If no data, show empty state message
        if (this._dataPoints.length === 0) {
            ctx.fillStyle = THEME.textMuted;
            ctx.font = '14px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('No NFI data yet', w / 2, h / 2);
            return;
        }

        // Map data points to pixel coordinates
        const points = this._mapDataToPixels(chartX, chartY, chartW, chartH);

        // Draw gradient fill below line
        this._drawGradientFill(ctx, points, chartY, chartH);

        // Draw the glowing line
        drawGlowLine(ctx, points, THEME.accentCyan, 2, 12);

        // Draw data point dots
        for (const point of points) {
            drawGlowCircle(ctx, point.x, point.y, 3, THEME.accentCyan, 8);
        }

        // Draw axis labels
        this._drawLabels(ctx, chartX, chartY, chartW, chartH);
    }

    /**
     * Draw the background grid and reference lines.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x - Chart area left edge.
     * @param {number} y - Chart area top edge.
     * @param {number} w - Chart area width.
     * @param {number} h - Chart area height.
     * @private
     */
    _drawGrid(ctx, x, y, w, h) {
        ctx.save();
        ctx.strokeStyle = THEME.surfacePrimary;
        ctx.lineWidth = 1;

        // Horizontal reference lines at 25, 50, 75
        for (const refValue of REFERENCE_LINES) {
            const refY = y + h - (refValue / 100) * h;

            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.moveTo(x, refY);
            ctx.lineTo(x + w, refY);
            ctx.stroke();

            // Label
            ctx.setLineDash([]);
            ctx.fillStyle = THEME.textMuted;
            ctx.font = '11px "JetBrains Mono", monospace';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(refValue), x - 8, refY);
        }

        // Y-axis labels at 0 and 100
        ctx.fillStyle = THEME.textMuted;
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('0', x - 8, y + h);
        ctx.fillText('100', x - 8, y);

        // Y-axis line
        ctx.setLineDash([]);
        ctx.strokeStyle = THEME.surfacePrimary;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + h);
        ctx.stroke();

        // X-axis line
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Map data points to pixel coordinates within the chart area.
     * @param {number} x - Chart area left edge.
     * @param {number} y - Chart area top edge.
     * @param {number} w - Chart area width.
     * @param {number} h - Chart area height.
     * @returns {{ x: number, y: number, date: number, nfi: number }[]}
     * @private
     */
    _mapDataToPixels(x, y, w, h) {
        const data = this._dataPoints;
        if (data.length === 0) return [];

        const minDate = data[0].date;
        const maxDate = data[data.length - 1].date;
        const dateRange = maxDate - minDate || 1;

        return data.map(d => ({
            x: x + ((d.date - minDate) / dateRange) * w,
            y: y + h - (Math.min(Math.max(d.nfi, 0), 100) / 100) * h,
            date: d.date,
            nfi: d.nfi
        }));
    }

    /**
     * Draw a gradient fill below the line (cyan to transparent).
     * @param {CanvasRenderingContext2D} ctx
     * @param {{ x: number, y: number }[]} points - Pixel-mapped data points.
     * @param {number} chartY - Chart area top edge.
     * @param {number} chartH - Chart area height.
     * @private
     */
    _drawGradientFill(ctx, points, chartY, chartH) {
        if (points.length < 2) return;

        const bottomY = chartY + chartH;

        const gradient = ctx.createLinearGradient(0, chartY, 0, bottomY);
        gradient.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
        gradient.addColorStop(0.5, 'rgba(0, 229, 255, 0.08)');
        gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[0].x, bottomY);

        for (const point of points) {
            ctx.lineTo(point.x, point.y);
        }

        ctx.lineTo(points[points.length - 1].x, bottomY);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
    }

    /**
     * Draw X-axis date labels.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x - Chart area left edge.
     * @param {number} y - Chart area top edge.
     * @param {number} w - Chart area width.
     * @param {number} h - Chart area height.
     * @private
     */
    _drawLabels(ctx, x, y, w, h) {
        const data = this._dataPoints;
        if (data.length === 0) return;

        ctx.save();
        ctx.fillStyle = THEME.textMuted;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const labelY = y + h + 10;

        // Show up to 6 evenly spaced date labels
        const maxLabels = Math.min(6, data.length);
        const step = Math.max(1, Math.floor(data.length / maxLabels));

        const minDate = data[0].date;
        const maxDate = data[data.length - 1].date;
        const dateRange = maxDate - minDate || 1;

        for (let i = 0; i < data.length; i += step) {
            const d = data[i];
            const px = x + ((d.date - minDate) / dateRange) * w;
            const dateObj = new Date(d.date);
            const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            ctx.fillText(label, px, labelY);
        }

        // Always show last label
        if (data.length > 1) {
            const last = data[data.length - 1];
            const px = x + w;
            const dateObj = new Date(last.date);
            const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            ctx.fillText(label, px, labelY);
        }

        ctx.restore();
    }
}
