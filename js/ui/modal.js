/**
 * Modal Dialog System
 * G.R.I.P. Platform — promise-based modal dialogs
 * @module ui/modal
 */

import { createElement } from './components.js';

/** @type {HTMLElement|null} Currently active modal overlay */
let activeOverlay = null;

/**
 * Inject modal base styles into the document (once).
 */
function ensureStyles() {
    if (document.getElementById('grip-modal-style')) return;
    const style = document.createElement('style');
    style.id = 'grip-modal-style';
    style.textContent = `
        .grip-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 9000;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        .grip-modal-overlay.active {
            opacity: 1;
        }
        .grip-modal {
            background: var(--surface-primary, #1a1a2e);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 28px 32px;
            min-width: 340px;
            max-width: 520px;
            width: 90vw;
            color: var(--text-primary, #ffffff);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            transform: translateY(12px) scale(0.97);
            transition: transform 0.2s ease;
        }
        .grip-modal-overlay.active .grip-modal {
            transform: translateY(0) scale(1);
        }
        .grip-modal-title {
            font-size: 1.25rem;
            font-weight: 700;
            margin: 0 0 12px 0;
        }
        .grip-modal-body {
            font-size: 0.95rem;
            line-height: 1.5;
            color: var(--text-secondary, #a0a0b8);
            margin-bottom: 24px;
        }
        .grip-modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        .grip-modal-btn {
            padding: 8px 20px;
            border: none;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s ease;
        }
        .grip-modal-btn.primary {
            background: var(--accent-cyan, #00e5ff);
            color: #000;
        }
        .grip-modal-btn.primary:hover {
            background: #33ebff;
        }
        .grip-modal-btn.secondary {
            background: rgba(255, 255, 255, 0.08);
            color: var(--text-primary, #fff);
        }
        .grip-modal-btn.secondary:hover {
            background: rgba(255, 255, 255, 0.14);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Display a modal dialog and return a promise that resolves
 * with the label of the action button the user clicked.
 *
 * @param {string}  title   - Modal title text.
 * @param {string|Node}  content - Body content (string or DOM node).
 * @param {{ label: string, type?: 'primary'|'secondary' }[]} [actions]
 *        Array of action buttons. Defaults to a single "OK" primary button.
 * @returns {Promise<string>} Resolves with the clicked action label.
 */
export function showModal(title, content, actions = [{ label: 'OK', type: 'primary' }]) {
    ensureStyles();
    closeModal();

    return new Promise((resolve) => {
        const bodyContent = typeof content === 'string'
            ? createElement('p', {}, [content])
            : content;

        const actionButtons = actions.map((action) => {
            const btn = createElement('button', {
                className: `grip-modal-btn ${action.type || 'secondary'}`,
                onclick: () => {
                    closeModal();
                    resolve(action.label);
                }
            }, [action.label]);
            return btn;
        });

        const modal = createElement('div', { className: 'grip-modal' }, [
            createElement('h2', { className: 'grip-modal-title' }, [title]),
            createElement('div', { className: 'grip-modal-body' }, [bodyContent]),
            createElement('div', { className: 'grip-modal-actions' }, actionButtons)
        ]);

        const overlay = createElement('div', { className: 'grip-modal-overlay' }, [modal]);

        // Close on overlay click (outside modal)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
                resolve('');
            }
        });

        // Close on Escape key
        const onKeydown = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', onKeydown);
                closeModal();
                resolve('');
            }
        };
        document.addEventListener('keydown', onKeydown);

        activeOverlay = overlay;
        document.body.appendChild(overlay);

        // Trigger enter animation on next frame
        requestAnimationFrame(() => overlay.classList.add('active'));
    });
}

/**
 * Close the currently open modal (if any).
 */
export function closeModal() {
    if (!activeOverlay) return;
    activeOverlay.classList.remove('active');
    const el = activeOverlay;
    activeOverlay = null;
    // Wait for transition before removing from DOM
    setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
    }, 200);
}

/**
 * Show a confirmation dialog with Cancel / Confirm buttons.
 * @param {string} title   - Dialog title.
 * @param {string} message - Body message text.
 * @returns {Promise<boolean>} True if the user clicked Confirm.
 */
export async function confirmModal(title, message) {
    const result = await showModal(title, message, [
        { label: 'Cancel', type: 'secondary' },
        { label: 'Confirm', type: 'primary' }
    ]);
    return result === 'Confirm';
}
