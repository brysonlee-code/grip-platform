/**
 * UI Component Helpers
 * G.R.I.P. Platform — reusable DOM element factories
 * @module ui/components
 */

/**
 * Create a DOM element with attributes and children.
 * @param {string}                          tag      - HTML tag name.
 * @param {Object<string, string|boolean>}  [attrs]  - Attribute key/value pairs.
 *        Use "className" for the class attribute. Event listeners can be passed
 *        as on* keys (e.g. "onclick").
 * @param {(string|Node)[]}                 [children] - Text strings or child nodes.
 * @returns {HTMLElement} The constructed element.
 */
export function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);

    for (const [key, value] of Object.entries(attrs)) {
        if (key === 'className') {
            el.className = /** @type {string} */ (value);
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(el.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            el.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (typeof value === 'boolean') {
            if (value) el.setAttribute(key, '');
        } else {
            el.setAttribute(key, /** @type {string} */ (value));
        }
    }

    for (const child of children) {
        if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            el.appendChild(child);
        }
    }

    return el;
}

/**
 * Render a metric stat card with label, value, and optional trend indicator.
 * @param {string}       label - Display label (e.g. "NFI Score").
 * @param {string}       value - Formatted value string.
 * @param {'up'|'down'|'flat'|null} [trend=null] - Trend direction.
 * @returns {HTMLElement} The stat card element.
 */
export function renderStatCard(label, value, trend = null) {
    const trendSymbol = trend === 'up' ? '\u25B2' : trend === 'down' ? '\u25BC' : '';
    const trendClass = trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-flat';

    const card = createElement('div', { className: 'stat-card' }, [
        createElement('span', { className: 'stat-label' }, [label]),
        createElement('div', { className: 'stat-value-row' }, [
            createElement('span', { className: 'stat-value' }, [value]),
            ...(trend ? [createElement('span', { className: `stat-trend ${trendClass}` }, [trendSymbol])] : [])
        ])
    ]);

    return card;
}

/**
 * Render a horizontal progress bar.
 * @param {number} value - Current value.
 * @param {number} max   - Maximum value.
 * @param {string} [color='var(--accent-cyan)'] - CSS color for the fill.
 * @returns {HTMLElement} The progress bar container element.
 */
export function renderProgressBar(value, max, color = 'var(--accent-cyan)') {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

    const track = createElement('div', {
        className: 'progress-bar-track',
        style: {
            width: '100%',
            height: '8px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: '4px',
            overflow: 'hidden'
        }
    }, [
        createElement('div', {
            className: 'progress-bar-fill',
            style: {
                width: `${pct}%`,
                height: '100%',
                backgroundColor: color,
                borderRadius: '4px',
                transition: 'width 0.3s ease'
            }
        })
    ]);

    return track;
}

/**
 * Render a small badge / tag element.
 * @param {string} text - Badge label.
 * @param {'info'|'success'|'warning'|'error'} [type='info'] - Visual type.
 * @returns {HTMLElement} The badge element.
 */
export function renderBadge(text, type = 'info') {
    const colorMap = {
        info: 'var(--accent-cyan, #00e5ff)',
        success: 'var(--accent-green, #00e676)',
        warning: 'var(--accent-yellow, #ffd600)',
        error: 'var(--accent-red, #ff1744)'
    };

    const color = colorMap[type] || colorMap.info;

    return createElement('span', {
        className: `badge badge-${type}`,
        style: {
            display: 'inline-block',
            padding: '2px 10px',
            fontSize: '0.75rem',
            fontWeight: '600',
            borderRadius: '12px',
            color: color,
            border: `1px solid ${color}`,
            backgroundColor: 'rgba(0,0,0,0.3)'
        }
    }, [text]);
}

/**
 * Render a loading skeleton placeholder.
 * @param {string} [width='100%']  - CSS width.
 * @param {string} [height='20px'] - CSS height.
 * @returns {HTMLElement} The skeleton element with a shimmer animation.
 */
export function renderLoadingSkeleton(width = '100%', height = '20px') {
    const skeleton = createElement('div', {
        className: 'loading-skeleton',
        style: {
            width,
            height,
            borderRadius: '4px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-shimmer 1.5s ease-in-out infinite'
        }
    });

    // Inject keyframes if not already present
    if (!document.getElementById('grip-skeleton-style')) {
        const style = document.createElement('style');
        style.id = 'grip-skeleton-style';
        style.textContent = `
            @keyframes skeleton-shimmer {
                0%   { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `;
        document.head.appendChild(style);
    }

    return skeleton;
}
