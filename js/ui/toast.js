/**
 * Toast Notification System
 * G.R.I.P. Platform — stackable, auto-dismissing toast messages
 * @module ui/toast
 */

import { createElement } from './components.js';

/** @type {HTMLElement|null} Toast container element */
let container = null;

/**
 * Ensure the toast container and styles exist in the DOM.
 * @returns {HTMLElement} The toast container.
 */
function ensureContainer() {
    if (container && document.body.contains(container)) return container;

    // Inject styles
    if (!document.getElementById('grip-toast-style')) {
        const style = document.createElement('style');
        style.id = 'grip-toast-style';
        style.textContent = `
            .grip-toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9500;
                display: flex;
                flex-direction: column;
                gap: 8px;
                pointer-events: none;
            }
            .grip-toast {
                pointer-events: auto;
                min-width: 280px;
                max-width: 420px;
                padding: 14px 18px 10px;
                border-radius: 8px;
                color: #fff;
                font-size: 0.9rem;
                font-weight: 500;
                background: var(--surface-primary, #1a1a2e);
                border-left: 4px solid;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
                transform: translateX(120%);
                opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
            }
            .grip-toast.show {
                transform: translateX(0);
                opacity: 1;
            }
            .grip-toast.hide {
                transform: translateX(120%);
                opacity: 0;
            }
            .grip-toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                border-radius: 0 0 0 8px;
                transition: width linear;
            }
            .grip-toast-close {
                position: absolute;
                top: 8px;
                right: 10px;
                background: none;
                border: none;
                color: rgba(255,255,255,0.5);
                font-size: 1rem;
                cursor: pointer;
                line-height: 1;
                padding: 2px 4px;
            }
            .grip-toast-close:hover {
                color: #fff;
            }
        `;
        document.head.appendChild(style);
    }

    container = createElement('div', { className: 'grip-toast-container' });
    document.body.appendChild(container);
    return container;
}

/**
 * Color palette for each toast type.
 * @type {Object<string, string>}
 */
const TYPE_COLORS = {
    info: '#00e5ff',
    success: '#00e676',
    warning: '#ffd600',
    error: '#ff1744'
};

/**
 * Display a toast notification.
 *
 * @param {string}  message                - The message to display.
 * @param {'info'|'success'|'warning'|'error'} [type='info'] - Toast type.
 * @param {number}  [duration=3000]        - Auto-dismiss time in milliseconds.
 * @returns {HTMLElement} The toast element (can be used to dismiss early).
 */
export function showToast(message, type = 'info', duration = 3000) {
    const host = ensureContainer();
    const color = TYPE_COLORS[type] || TYPE_COLORS.info;

    const progressBar = createElement('div', {
        className: 'grip-toast-progress',
        style: {
            width: '100%',
            backgroundColor: color
        }
    });

    const closeBtn = createElement('button', {
        className: 'grip-toast-close',
        'aria-label': 'Close notification'
    }, ['\u00D7']);

    const toast = createElement('div', {
        className: 'grip-toast',
        style: {
            borderLeftColor: color,
            position: 'relative',
            overflow: 'hidden'
        }
    }, [
        createElement('span', {}, [message]),
        closeBtn,
        progressBar
    ]);

    // Dismiss helper
    let dismissed = false;
    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    };

    closeBtn.addEventListener('click', dismiss);

    host.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
        // Start the progress bar countdown
        progressBar.style.transitionDuration = `${duration}ms`;
        requestAnimationFrame(() => {
            progressBar.style.width = '0%';
        });
    });

    // Auto-dismiss
    const timerId = setTimeout(dismiss, duration);

    // Pause on hover
    toast.addEventListener('mouseenter', () => {
        clearTimeout(timerId);
        progressBar.style.transitionPlayState = 'paused';
    });

    toast.addEventListener('mouseleave', () => {
        // Resume with remaining time approximated by bar width
        const remaining = (parseFloat(getComputedStyle(progressBar).width) /
            parseFloat(getComputedStyle(toast).width)) * duration;
        progressBar.style.transitionPlayState = 'running';
        setTimeout(dismiss, Math.max(remaining, 500));
    });

    return toast;
}
