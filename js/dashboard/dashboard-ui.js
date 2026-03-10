/**
 * Dashboard UI
 * G.R.I.P. Platform — renders the main dashboard view with stats, chart, and session list
 * @module dashboard/dashboard-ui
 */

import { DashboardController } from './dashboard-controller.js';
import { NFIHistoryChart } from './nfi-history-chart.js';
import {
    createElement,
    renderStatCard,
    renderLoadingSkeleton
} from '../ui/components.js';
import { navigate } from '../router.js';
import { formatNFI, formatDate, formatPercent, formatDuration } from '../utils/format.js';

/**
 * Render the full dashboard page into the given container.
 * Shows loading skeletons while data is being fetched, then populates
 * stat cards, NFI history chart, start button, and recent sessions list.
 *
 * @param {HTMLElement} container - The DOM element to render into.
 * @returns {Promise<Function>} Cleanup function for the router to call on navigation.
 */
export async function renderDashboardPage(container) {
    /** @type {NFIHistoryChart|null} */
    let chart = null;

    /** @type {ResizeObserver|null} */
    let resizeObserver = null;

    // Build the page skeleton
    const page = createElement('div', { className: 'dashboard-page' });

    // Welcome header
    const header = createElement('div', { className: 'dashboard-header' }, [
        createElement('h1', { className: 'dashboard-title' }, ['Dashboard']),
        createElement('p', {
            className: 'dashboard-subtitle',
            id: 'dashboard-welcome'
        }, ['Loading your data...'])
    ]);
    page.appendChild(header);

    // Stat cards row (show skeletons initially)
    const statsRow = createElement('div', { className: 'stats-row' });
    for (let i = 0; i < 4; i++) {
        const skeleton = createElement('div', { className: 'stat-card' }, [
            renderLoadingSkeleton('60%', '14px'),
            renderLoadingSkeleton('80%', '32px')
        ]);
        statsRow.appendChild(skeleton);
    }
    page.appendChild(statsRow);

    // NFI History chart section
    const chartSection = createElement('div', { className: 'chart-section' }, [
        createElement('h2', { className: 'section-title' }, ['NFI History']),
        createElement('div', { className: 'chart-container' }, [
            createElement('canvas', { id: 'nfi-history-canvas', width: '800', height: '300' })
        ])
    ]);
    page.appendChild(chartSection);

    // Start New Session button
    const startBtn = createElement('button', {
        className: 'btn-start-session',
        onclick: () => navigate('#/calibration')
    }, ['Start New Session']);
    page.appendChild(startBtn);

    // Recent sessions section
    const sessionsSection = createElement('div', { className: 'sessions-section' }, [
        createElement('h2', { className: 'section-title' }, ['Recent Sessions']),
        createElement('div', { className: 'sessions-list', id: 'recent-sessions-list' }, [
            renderLoadingSkeleton('100%', '60px'),
            renderLoadingSkeleton('100%', '60px'),
            renderLoadingSkeleton('100%', '60px')
        ])
    ]);
    page.appendChild(sessionsSection);

    // Inject page styles
    _injectDashboardStyles();

    container.appendChild(page);

    // Load data
    try {
        // Get userId from appState
        const { appState } = await import('../app.js');
        const userId = appState.userId;

        if (!userId) {
            navigate('#/login');
            return () => {};
        }

        const controller = new DashboardController(userId);
        await controller.loadData();

        // Update welcome text
        const welcomeEl = document.getElementById('dashboard-welcome');
        const name = controller.getDisplayName();
        if (welcomeEl) {
            welcomeEl.textContent = name
                ? `Welcome back, ${name}. Here is your progress.`
                : 'Welcome back. Here is your progress.';
        }

        // Render stat cards
        const stats = controller.getStats();
        statsRow.innerHTML = '';
        statsRow.appendChild(renderStatCard('Sessions', String(stats.sessionsCompleted)));
        statsRow.appendChild(renderStatCard('Avg NFI', formatNFI(stats.averageNFI)));
        statsRow.appendChild(renderStatCard('Best NFI', formatNFI(stats.bestNFI)));
        statsRow.appendChild(renderStatCard('Streak', `${stats.streak} day${stats.streak !== 1 ? 's' : ''}`));

        // Render NFI chart
        const canvas = document.getElementById('nfi-history-canvas');
        if (canvas) {
            chart = new NFIHistoryChart(canvas);
            const historyData = controller.getNFIHistory();
            chart.render(historyData);

            // Handle resize
            resizeObserver = new ResizeObserver(() => {
                chart.resize();
                chart.render(historyData);
            });
            resizeObserver.observe(canvas.parentElement);
        }

        // Render recent sessions
        const sessionsList = document.getElementById('recent-sessions-list');
        if (sessionsList) {
            const sessions = controller.getRecentSessions();
            sessionsList.innerHTML = '';

            if (sessions.length === 0) {
                sessionsList.appendChild(
                    createElement('p', { className: 'no-sessions-text' }, [
                        'No sessions yet. Start your first session to see your progress here.'
                    ])
                );
            } else {
                for (const session of sessions) {
                    sessionsList.appendChild(_renderSessionRow(session));
                }
            }
        }

    } catch (err) {
        console.error('[DashboardUI] Failed to load dashboard data:', err);
        const welcomeEl = document.getElementById('dashboard-welcome');
        if (welcomeEl) {
            welcomeEl.textContent = 'Failed to load dashboard data. Please try refreshing.';
        }
    }

    // Return cleanup function
    return function cleanup() {
        if (chart) {
            chart.destroy();
            chart = null;
        }
        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
        }
    };
}

/**
 * Render a single session row in the recent sessions list.
 * @param {Object} session - Session summary object.
 * @returns {HTMLElement} The session row element.
 * @private
 */
function _renderSessionRow(session) {
    const dateStr = formatDate(session.date);
    const nfiStr = formatNFI(session.finalNfi);
    const accuracyStr = formatPercent(session.accuracy);
    const durationStr = formatDuration(session.duration);

    return createElement('div', { className: 'session-row' }, [
        createElement('div', { className: 'session-row-date' }, [dateStr]),
        createElement('div', { className: 'session-row-stats' }, [
            createElement('span', { className: 'session-stat' }, [`NFI: ${nfiStr}`]),
            createElement('span', { className: 'session-stat' }, [`Acc: ${accuracyStr}`]),
            createElement('span', { className: 'session-stat' }, [durationStr]),
            createElement('span', { className: 'session-stat' }, [
                `${session.scenariosCompleted} scenarios`
            ])
        ])
    ]);
}

/**
 * Inject dashboard-specific styles into the document head (idempotent).
 * @private
 */
function _injectDashboardStyles() {
    if (document.getElementById('grip-dashboard-style')) return;

    const style = document.createElement('style');
    style.id = 'grip-dashboard-style';
    style.textContent = `
        .dashboard-page {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }

        .dashboard-header {
            margin-bottom: 2rem;
        }

        .dashboard-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #fff;
            margin: 0 0 0.5rem 0;
        }

        .dashboard-subtitle {
            color: #a0a0b8;
            font-size: 0.95rem;
            margin: 0;
        }

        .stats-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .chart-section {
            margin-bottom: 2rem;
        }

        .section-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #fff;
            margin: 0 0 1rem 0;
        }

        .chart-container {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 12px;
            padding: 1rem;
            overflow: hidden;
        }

        .chart-container canvas {
            width: 100%;
            height: 300px;
            display: block;
        }

        .btn-start-session {
            display: block;
            width: 100%;
            max-width: 400px;
            margin: 0 auto 2rem auto;
            padding: 1rem 2rem;
            font-size: 1.1rem;
            font-weight: 700;
            color: #0a0a1a;
            background: #00e5ff;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            box-shadow: 0 0 20px rgba(0, 229, 255, 0.3), 0 0 40px rgba(0, 229, 255, 0.15);
            transition: box-shadow 0.3s ease, transform 0.15s ease;
        }

        .btn-start-session:hover {
            box-shadow: 0 0 30px rgba(0, 229, 255, 0.5), 0 0 60px rgba(0, 229, 255, 0.25);
            transform: translateY(-1px);
        }

        .btn-start-session:active {
            transform: translateY(0);
        }

        .sessions-section {
            margin-bottom: 2rem;
        }

        .sessions-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .session-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 8px;
            padding: 0.875rem 1rem;
            transition: border-color 0.2s ease;
        }

        .session-row:hover {
            border-color: rgba(0, 229, 255, 0.2);
        }

        .session-row-date {
            color: #fff;
            font-weight: 600;
            font-size: 0.9rem;
            min-width: 120px;
        }

        .session-row-stats {
            display: flex;
            gap: 1.25rem;
            flex-wrap: wrap;
        }

        .session-stat {
            color: #a0a0b8;
            font-size: 0.8rem;
            font-family: 'JetBrains Mono', monospace;
        }

        .no-sessions-text {
            color: #5a5a72;
            font-size: 0.9rem;
            text-align: center;
            padding: 2rem;
        }
    `;
    document.head.appendChild(style);
}
