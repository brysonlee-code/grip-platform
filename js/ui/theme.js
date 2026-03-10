/**
 * Theme Constants & Canvas Drawing Helpers
 * G.R.I.P. Platform — centralized design tokens and glow rendering utilities
 * @module ui/theme
 */

/**
 * Theme color tokens, mirroring CSS custom properties.
 * @type {Object<string, string>}
 */
export const THEME = Object.freeze({
    // Backgrounds
    bgPrimary: '#0a0a1a',
    bgSecondary: '#12122a',
    surfacePrimary: '#1a1a2e',
    surfaceHover: '#22223a',

    // Accent colors
    accentCyan: '#00e5ff',
    accentGreen: '#00e676',
    accentYellow: '#ffd600',
    accentRed: '#ff1744',
    accentPurple: '#d500f9',
    accentBlue: '#2979ff',

    // Text
    textPrimary: '#ffffff',
    textSecondary: '#a0a0b8',
    textMuted: '#5a5a72',

    // Borders
    borderSubtle: 'rgba(255, 255, 255, 0.06)',
    borderActive: 'rgba(0, 229, 255, 0.3)',

    // Shadows & glows
    glowCyan: 'rgba(0, 229, 255, 0.35)',
    glowGreen: 'rgba(0, 230, 118, 0.35)',
    glowRed: 'rgba(255, 23, 68, 0.35)'
});

/**
 * Look up a theme color by shorthand name.
 * Falls back to returning the name as-is (useful when a raw CSS value is passed).
 * @param {string} name - Key from the THEME object (e.g. "accentCyan") or a CSS color string.
 * @returns {string} The resolved color value.
 */
export function getThemeColor(name) {
    return THEME[name] || name;
}

/**
 * Draw a glowing line through a series of points on a canvas.
 * Renders a blurred "glow" layer behind a crisp foreground stroke.
 *
 * @param {CanvasRenderingContext2D} ctx    - Canvas 2D context.
 * @param {{ x: number, y: number }[]} points - Array of {x, y} coordinates.
 * @param {string} [color='#00e5ff']         - Stroke color.
 * @param {number} [lineWidth=2]             - Foreground line width.
 * @param {number} [glowRadius=10]           - Blur radius for the glow layer.
 */
export function drawGlowLine(ctx, points, color = THEME.accentCyan, lineWidth = 2, glowRadius = 10) {
    if (points.length < 2) return;

    const drawPath = () => {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
    };

    // Glow layer
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = glowRadius;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth + 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.5;
    drawPath();
    ctx.stroke();
    ctx.restore();

    // Foreground layer
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.globalAlpha = 1;
    drawPath();
    ctx.stroke();
    ctx.restore();
}

/**
 * Draw a glowing circle on a canvas.
 *
 * @param {CanvasRenderingContext2D} ctx   - Canvas 2D context.
 * @param {number} x                      - Center X coordinate.
 * @param {number} y                      - Center Y coordinate.
 * @param {number} r                      - Radius in pixels.
 * @param {string} [color='#00e5ff']      - Fill/glow color.
 * @param {number} [glowRadius=12]        - Blur radius for the glow layer.
 */
export function drawGlowCircle(ctx, x, y, r, color = THEME.accentCyan, glowRadius = 12) {
    // Glow layer
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = glowRadius;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Solid core
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}
