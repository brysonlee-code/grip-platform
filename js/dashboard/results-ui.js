/**
 * Results UI
 * G.R.I.P. Platform — renders the post-session results page with score breakdown
 * @module dashboard/results-ui
 */

import {
    createElement,
    renderStatCard,
    renderProgressBar,
    renderBadge
} from '../ui/components.js';
import { navigate } from '../router.js';
import { formatNFI, formatTime, formatPercent, formatDuration } from '../utils/format.js';

/**
 * Determine a letter grade from an NFI score.
 * @param {number} nfi - NFI score (0-100).
 * @returns {{ letter: string, color: string }}
 */
function getGrade(nfi) {
    if (nfi >= 80) return { letter: 'A', color: '#00e676' };
    if (nfi >= 65) return { letter: 'B', color: '#00e5ff' };
    if (nfi >= 50) return { letter: 'C', color: '#ffd600' };
    if (nfi >= 35) return { letter: 'D', color: '#ff9100' };
    return { letter: 'F', color: '#ff1744' };
}

/**
 * Color for an NFI component bar based on its value.
 * @param {number} value - Component score (0-100).
 * @returns {string} CSS color string.
 */
function getComponentColor(value) {
    if (value >= 70) return 'var(--accent-green, #00e676)';
    if (value >= 45) return 'var(--accent-cyan, #00e5ff)';
    if (value >= 25) return 'var(--accent-yellow, #ffd600)';
    return 'var(--accent-red, #ff1744)';
}

/**
 * Render the full results page into the given container.
 * Session data is retrieved from sessionStorage (stored by the session controller
 * upon completion).
 *
 * @param {HTMLElement} container - The DOM element to render into.
 * @returns {Function} Cleanup function for the router.
 */
export function renderResultsPage(container) {
    // Retrieve session data from sessionStorage
    let sessionData;
    try {
        const raw = sessionStorage.getItem('grip_session_results');
        sessionData = raw ? JSON.parse(raw) : null;
    } catch (err) {
        console.error('[ResultsUI] Failed to parse session results:', err);
        sessionData = null;
    }

    if (!sessionData) {
        container.appendChild(
            createElement('div', { className: 'results-page' }, [
                createElement('h1', { className: 'results-title' }, ['No Session Data']),
                createElement('p', { className: 'results-subtitle' }, [
                    'No session results were found. Complete a session to see your results here.'
                ]),
                createElement('button', {
                    className: 'btn-return-dashboard',
                    onclick: () => navigate('#/dashboard')
                }, ['Return to Dashboard'])
            ])
        );
        _injectResultsStyles();
        return function cleanup() {};
    }

    const page = createElement('div', { className: 'results-page' });

    // Session Complete header
    const finalNfi = sessionData.finalNfi ?? sessionData.performance?.finalNfi ?? 0;
    const grade = getGrade(finalNfi);

    page.appendChild(
        createElement('h1', { className: 'results-title' }, ['Session Complete'])
    );

    // Large NFI score with letter grade
    const scoreSection = createElement('div', { className: 'results-score-section' });

    const nfiDisplay = createElement('div', { className: 'results-nfi-display' }, [
        createElement('span', { className: 'results-nfi-value' }, [formatNFI(finalNfi)]),
        createElement('span', { className: 'results-nfi-label' }, ['NFI Score'])
    ]);
    scoreSection.appendChild(nfiDisplay);

    const gradeDisplay = createElement('div', {
        className: 'results-grade',
        style: { color: grade.color, borderColor: grade.color }
    }, [grade.letter]);
    scoreSection.appendChild(gradeDisplay);

    page.appendChild(scoreSection);

    // NFI component breakdown (4 horizontal bars)
    const performance = sessionData.performance || {};
    const nfiHistory = sessionData.nfiHistory || [];

    // Extract component scores from the last NFI history entry if available
    const lastNfiEntry = nfiHistory.length > 0 ? nfiHistory[nfiHistory.length - 1] : {};
    const components = [
        { label: 'Neural Efficiency', value: lastNfiEntry.neuralScore ?? Math.round(finalNfi * 0.9) },
        { label: 'Focus Stability', value: lastNfiEntry.focusScore ?? Math.round(finalNfi * 0.85) },
        { label: 'Vocal Calm', value: Math.round(finalNfi * 0.8) },
        { label: 'Response Quality', value: lastNfiEntry.responseScore ?? Math.round(finalNfi * 0.95) }
    ];

    const breakdownSection = createElement('div', { className: 'results-breakdown' }, [
        createElement('h2', { className: 'results-section-title' }, ['NFI Breakdown'])
    ]);

    for (const comp of components) {
        const row = createElement('div', { className: 'breakdown-row' }, [
            createElement('div', { className: 'breakdown-label' }, [
                createElement('span', {}, [comp.label]),
                createElement('span', { className: 'breakdown-value' }, [String(Math.round(comp.value))])
            ]),
            renderProgressBar(comp.value, 100, getComponentColor(comp.value))
        ]);
        breakdownSection.appendChild(row);
    }

    page.appendChild(breakdownSection);

    // Stats row
    const accuracy = performance.accuracy ?? 0;
    const avgResponseTime = performance.averageResponseTime ?? 0;
    const totalResponses = performance.totalResponses ?? sessionData.state?.scenarioIndex ?? 0;
    const totalTime = sessionData.totalTime ?? 0;

    const statsSection = createElement('div', { className: 'results-stats' }, [
        renderStatCard('Accuracy', formatPercent(accuracy)),
        renderStatCard('Avg Response', formatTime(avgResponseTime)),
        renderStatCard('Scenarios', String(totalResponses)),
        renderStatCard('Duration', formatDuration(totalTime))
    ]);
    page.appendChild(statsSection);

    // Per-scenario results list
    const responses = sessionData.responses || [];
    if (responses.length > 0) {
        const scenarioListSection = createElement('div', { className: 'results-scenario-list' }, [
            createElement('h2', { className: 'results-section-title' }, ['Scenario Details'])
        ]);

        for (let i = 0; i < responses.length; i++) {
            const resp = responses[i];
            const correct = resp.correct;
            const icon = correct ? '\u2713' : '\u2717';
            const iconClass = correct ? 'scenario-icon-correct' : 'scenario-icon-incorrect';

            const row = createElement('div', { className: 'scenario-result-row' }, [
                createElement('span', { className: `scenario-icon ${iconClass}` }, [icon]),
                createElement('span', { className: 'scenario-number' }, [`#${i + 1}`]),
                createElement('span', { className: 'scenario-time' }, [formatTime(resp.responseTime || 0)]),
                renderBadge(`Lv ${resp.difficulty || '?'}`, correct ? 'success' : 'error')
            ]);
            scenarioListSection.appendChild(row);
        }

        page.appendChild(scenarioListSection);
    }

    // Return to Dashboard button
    const returnBtn = createElement('button', {
        className: 'btn-return-dashboard',
        onclick: () => navigate('#/dashboard')
    }, ['Return to Dashboard']);
    page.appendChild(returnBtn);

    _injectResultsStyles();
    container.appendChild(page);

    // Cleanup
    return function cleanup() {
        // Clear session results from sessionStorage
        sessionStorage.removeItem('grip_session_results');
    };
}

/**
 * Inject results-specific styles into the document head (idempotent).
 * @private
 */
function _injectResultsStyles() {
    if (document.getElementById('grip-results-style')) return;

    const style = document.createElement('style');
    style.id = 'grip-results-style';
    style.textContent = `
        .results-page {
            max-width: 700px;
            margin: 0 auto;
            padding: 2rem 1rem;
            text-align: center;
        }

        .results-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #fff;
            margin: 0 0 2rem 0;
        }

        .results-subtitle {
            color: #a0a0b8;
            margin-bottom: 2rem;
        }

        .results-score-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 2.5rem;
        }

        .results-nfi-display {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .results-nfi-value {
            font-size: 3.5rem;
            font-weight: 800;
            color: #00e5ff;
            font-family: 'JetBrains Mono', monospace;
            text-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
            line-height: 1;
        }

        .results-nfi-label {
            font-size: 0.85rem;
            color: #a0a0b8;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 0.5rem;
        }

        .results-grade {
            font-size: 4rem;
            font-weight: 900;
            font-family: 'JetBrains Mono', monospace;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid;
            border-radius: 50%;
            text-shadow: 0 0 15px currentColor;
        }

        .results-breakdown {
            text-align: left;
            margin-bottom: 2rem;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 12px;
            padding: 1.25rem;
        }

        .results-section-title {
            font-size: 1rem;
            font-weight: 600;
            color: #fff;
            margin: 0 0 1rem 0;
            text-align: left;
        }

        .breakdown-row {
            margin-bottom: 0.75rem;
        }

        .breakdown-row:last-child {
            margin-bottom: 0;
        }

        .breakdown-label {
            display: flex;
            justify-content: space-between;
            color: #a0a0b8;
            font-size: 0.8rem;
            margin-bottom: 0.35rem;
        }

        .breakdown-value {
            font-family: 'JetBrains Mono', monospace;
            color: #fff;
        }

        .results-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
            text-align: left;
        }

        .results-scenario-list {
            text-align: left;
            margin-bottom: 2rem;
        }

        .scenario-result-row {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.625rem 0.75rem;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 8px;
            margin-bottom: 0.5rem;
        }

        .scenario-icon {
            font-size: 1.1rem;
            font-weight: 700;
            width: 24px;
            text-align: center;
        }

        .scenario-icon-correct {
            color: #00e676;
        }

        .scenario-icon-incorrect {
            color: #ff1744;
        }

        .scenario-number {
            color: #a0a0b8;
            font-size: 0.85rem;
            font-family: 'JetBrains Mono', monospace;
            min-width: 30px;
        }

        .scenario-time {
            color: #a0a0b8;
            font-size: 0.8rem;
            font-family: 'JetBrains Mono', monospace;
            flex: 1;
        }

        .btn-return-dashboard {
            display: inline-block;
            padding: 0.875rem 2rem;
            font-size: 1rem;
            font-weight: 600;
            color: #00e5ff;
            background: transparent;
            border: 2px solid #00e5ff;
            border-radius: 12px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
        }

        .btn-return-dashboard:hover {
            background: rgba(0, 229, 255, 0.1);
            box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);
        }
    `;
    document.head.appendChild(style);
}
