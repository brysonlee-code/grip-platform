/**
 * Scenario Renderer
 * G.R.I.P. Platform — renders clinical scenario cards and captures user responses
 * @module session/scenario-renderer
 */

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const FEEDBACK_DELAY = 800;

// Inject styles once
let _stylesInjected = false;
function _injectStyles() {
    if (_stylesInjected) return;
    _stylesInjected = true;
    const style = document.createElement('style');
    style.id = 'grip-scenario-styles';
    style.textContent = `
        .scenario-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            overflow: hidden;
            animation: scenarioFadeIn 0.3s ease;
        }
        @keyframes scenarioFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .scenario-timer-bar {
            height: 3px;
            background: rgba(255,255,255,0.06);
            position: relative;
        }
        .scenario-timer-fill {
            height: 100%;
            background: #00e5ff;
            width: 100%;
            transition: width 0.1s linear;
            box-shadow: 0 0 8px rgba(0,229,255,0.4);
        }
        .timer-critical {
            background: #ff4060 !important;
            box-shadow: 0 0 8px rgba(255,64,96,0.5) !important;
        }

        .scenario-header {
            padding: 0.75rem 1.25rem;
            font-size: 0.75rem;
            font-weight: 600;
            color: #8888aa;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .patient-info-card {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .patient-info-title {
            font-size: 0.7rem;
            font-weight: 700;
            color: #00e5ff;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.5rem;
        }
        .patient-info-row {
            display: flex;
            gap: 0.5rem;
            padding: 0.2rem 0;
            font-size: 0.85rem;
        }
        .patient-info-label {
            color: #8888aa;
            min-width: 110px;
            font-weight: 500;
        }
        .patient-info-value {
            color: #e0e0e0;
        }

        .vitals-grid {
            padding: 0.75rem 1.25rem;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .vitals-title {
            font-size: 0.7rem;
            font-weight: 700;
            color: #00e5ff;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.5rem;
        }
        .vitals-values {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 0.5rem;
        }
        .vital-cell {
            text-align: center;
            padding: 0.4rem;
            background: rgba(255,255,255,0.03);
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .vital-label {
            font-size: 0.65rem;
            font-weight: 600;
            color: #8888aa;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.15rem;
        }
        .vital-value {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
            font-weight: 500;
            color: #e0e0e0;
        }

        .scenario-stem {
            padding: 1rem 1.25rem;
            font-size: 0.95rem;
            font-weight: 500;
            color: #ffffff;
            line-height: 1.5;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .scenario-options {
            padding: 0.75rem 1.25rem 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .scenario-option-btn {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            width: 100%;
            padding: 0.75rem 1rem;
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.15s ease;
            text-align: left;
        }
        .scenario-option-btn:hover:not(.option-disabled) {
            border-color: rgba(0,229,255,0.3);
            background: rgba(0,229,255,0.05);
        }
        .option-label {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 6px;
            background: rgba(255,255,255,0.06);
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
            font-weight: 700;
            color: #8888aa;
            flex-shrink: 0;
        }
        .option-text {
            font-size: 0.85rem;
            color: #d0d0e0;
            line-height: 1.4;
        }
        .option-disabled {
            pointer-events: none;
            opacity: 0.7;
        }
        .option-correct {
            border-color: #00ff88 !important;
            background: rgba(0,255,136,0.08) !important;
        }
        .option-correct .option-label {
            background: #00ff88;
            color: #0a0a1a;
        }
        .option-incorrect {
            border-color: #ff4060 !important;
            background: rgba(255,64,96,0.08) !important;
        }
        .option-incorrect .option-label {
            background: #ff4060;
            color: #fff;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Render a scenario card and return a promise that resolves on user selection.
 */
export function renderScenario(container, scenario, scenarioNumber, totalScenarios) {
    _injectStyles();

    return new Promise((resolve) => {
        const startTime = Date.now();
        let resolved = false;
        let timerIntervalId = null;

        container.innerHTML = '';

        const card = document.createElement('div');
        card.className = 'scenario-card';

        // Timer bar
        const timerBar = document.createElement('div');
        timerBar.className = 'scenario-timer-bar';
        const timerFill = document.createElement('div');
        timerFill.className = 'scenario-timer-fill';
        timerBar.appendChild(timerFill);
        card.appendChild(timerBar);

        // Header
        const header = document.createElement('div');
        header.className = 'scenario-header';
        header.textContent = `Question ${scenarioNumber} of ${totalScenarios}`;
        card.appendChild(header);

        // Patient info
        card.appendChild(_buildPatientInfo(scenario.patientInfo));

        // Vitals
        card.appendChild(_buildVitalSigns(scenario.vitalSigns));

        // Question stem
        const stemEl = document.createElement('div');
        stemEl.className = 'scenario-stem';
        stemEl.textContent = scenario.stem;
        card.appendChild(stemEl);

        // Options
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'scenario-options';
        const buttons = [];

        const opts = scenario.options || [];
        for (let i = 0; i < opts.length; i++) {
            const btn = document.createElement('button');
            btn.className = 'scenario-option-btn';
            btn.type = 'button';

            const label = document.createElement('span');
            label.className = 'option-label';
            label.textContent = OPTION_LABELS[i] || String(i + 1);

            const text = document.createElement('span');
            text.className = 'option-text';
            const opt = opts[i];
            text.textContent = typeof opt === 'string' ? opt : (opt?.text || String(opt));

            btn.appendChild(label);
            btn.appendChild(text);
            btn.addEventListener('click', () => handleSelection(i));

            buttons.push(btn);
            optionsContainer.appendChild(btn);
        }

        card.appendChild(optionsContainer);
        container.appendChild(card);

        // Timer countdown
        if (scenario.timeLimit > 0) {
            timerIntervalId = setInterval(() => {
                if (resolved) return;
                const elapsed = Date.now() - startTime;
                const progress = Math.min(1, elapsed / scenario.timeLimit);
                timerFill.style.width = `${(1 - progress) * 100}%`;
                if (progress > 0.8) timerFill.classList.add('timer-critical');
                if (progress >= 1) handleSelection(-1);
            }, 100);
        }

        function handleSelection(index) {
            if (resolved) return;
            resolved = true;
            const responseTime = Date.now() - startTime;

            if (timerIntervalId != null) {
                clearInterval(timerIntervalId);
                timerIntervalId = null;
            }

            for (const btn of buttons) {
                btn.disabled = true;
                btn.classList.add('option-disabled');
            }

            if (index >= 0 && index < buttons.length) {
                if (index === scenario.correctIndex) {
                    buttons[index].classList.add('option-correct');
                } else {
                    buttons[index].classList.add('option-incorrect');
                    if (scenario.correctIndex >= 0 && scenario.correctIndex < buttons.length) {
                        buttons[scenario.correctIndex].classList.add('option-correct');
                    }
                }
            } else if (scenario.correctIndex >= 0 && scenario.correctIndex < buttons.length) {
                buttons[scenario.correctIndex].classList.add('option-correct');
            }

            setTimeout(() => {
                resolve({ selectedIndex: index, responseTime });
            }, FEEDBACK_DELAY);
        }
    });
}

function _buildPatientInfo(info) {
    const wrapper = document.createElement('div');
    wrapper.className = 'patient-info-card';

    const title = document.createElement('div');
    title.className = 'patient-info-title';
    title.textContent = 'Patient Information';
    wrapper.appendChild(title);

    const fields = [
        { label: 'Age', value: info?.age },
        { label: 'Sex', value: info?.sex },
        { label: 'Chief Complaint', value: info?.chiefComplaint },
        { label: 'History', value: info?.history },
    ];

    for (const f of fields) {
        const row = document.createElement('div');
        row.className = 'patient-info-row';
        const lbl = document.createElement('span');
        lbl.className = 'patient-info-label';
        lbl.textContent = f.label + ':';
        const val = document.createElement('span');
        val.className = 'patient-info-value';
        val.textContent = f.value || 'N/A';
        row.appendChild(lbl);
        row.appendChild(val);
        wrapper.appendChild(row);
    }
    return wrapper;
}

/**
 * Render a reaction time test card. Shows a target after a random delay;
 * user clicks/taps the target as fast as possible.
 * @param {HTMLElement} container - DOM element to render into.
 * @param {number} testNumber - Current item number in the session.
 * @param {number} totalItems - Total items in the session.
 * @returns {Promise<{selectedIndex: number, responseTime: number, reactionTime: number}>}
 */
export function renderReactionTest(container, testNumber, totalItems) {
    _injectStyles();
    _injectReactionStyles();

    return new Promise((resolve) => {
        let resolved = false;
        container.innerHTML = '';

        const card = document.createElement('div');
        card.className = 'scenario-card';

        // Header
        const header = document.createElement('div');
        header.className = 'scenario-header';
        header.textContent = `Reaction Test — ${testNumber} of ${totalItems}`;
        card.appendChild(header);

        // Instructions
        const instructions = document.createElement('div');
        instructions.className = 'rt-instructions';
        instructions.innerHTML = `
            <h3 style="margin:0 0 0.5rem; color:#00e5ff; font-size:1rem;">Reaction Time Test</h3>
            <p style="margin:0; color:#b0b0cc; font-size:0.85rem;">
                When the target appears, click it as fast as you can.
                <br>Stay focused on the center of the screen.
            </p>
        `;
        card.appendChild(instructions);

        // Target area
        const arena = document.createElement('div');
        arena.className = 'rt-arena';

        const waiting = document.createElement('div');
        waiting.className = 'rt-waiting';
        waiting.textContent = 'Wait for the target...';
        arena.appendChild(waiting);

        const target = document.createElement('button');
        target.className = 'rt-target';
        target.type = 'button';
        target.textContent = 'CLICK!';
        target.style.display = 'none';
        arena.appendChild(target);

        card.appendChild(arena);
        container.appendChild(card);

        // Show target after random delay (1.5–4 seconds)
        const delay = 1500 + Math.random() * 2500;
        let targetShownAt = 0;
        let tooEarly = false;

        // Detect early clicks
        arena.addEventListener('click', (e) => {
            if (resolved) return;
            if (targetShownAt === 0 && !tooEarly) {
                tooEarly = true;
                waiting.textContent = 'Too early! Wait for the target...';
                waiting.style.color = '#ff4060';
                setTimeout(() => {
                    if (!resolved) {
                        tooEarly = false;
                        waiting.textContent = 'Wait for the target...';
                        waiting.style.color = '#8888aa';
                    }
                }, 1000);
            }
        });

        const showTimer = setTimeout(() => {
            if (resolved) return;
            waiting.style.display = 'none';
            target.style.display = 'flex';
            targetShownAt = performance.now();

            target.addEventListener('click', () => {
                if (resolved) return;
                resolved = true;
                const reactionTime = performance.now() - targetShownAt;

                // Show result
                target.disabled = true;
                target.textContent = `${Math.round(reactionTime)} ms`;
                target.classList.add('rt-target--clicked');

                const label = document.createElement('div');
                label.className = 'rt-result-label';
                if (reactionTime < 250) {
                    label.textContent = 'Excellent';
                    label.style.color = '#00ff88';
                } else if (reactionTime < 400) {
                    label.textContent = 'Good';
                    label.style.color = '#00e5ff';
                } else {
                    label.textContent = 'Average';
                    label.style.color = '#ffaa00';
                }
                arena.appendChild(label);

                setTimeout(() => {
                    resolve({
                        selectedIndex: 0,
                        responseTime: reactionTime,
                        reactionTime,
                        isReactionTest: true,
                    });
                }, FEEDBACK_DELAY);
            });

            // Auto-timeout after 5 seconds
            setTimeout(() => {
                if (resolved) return;
                resolved = true;
                target.disabled = true;
                target.textContent = 'Timeout';
                target.classList.add('rt-target--timeout');
                setTimeout(() => {
                    resolve({
                        selectedIndex: -1,
                        responseTime: 5000,
                        reactionTime: 5000,
                        isReactionTest: true,
                    });
                }, FEEDBACK_DELAY);
            }, 5000);
        }, delay);

        // Cleanup timer if container is cleared externally
        const observer = new MutationObserver(() => {
            if (!container.contains(card)) {
                clearTimeout(showTimer);
                observer.disconnect();
            }
        });
        observer.observe(container, { childList: true });
    });
}

let _reactionStylesInjected = false;
function _injectReactionStyles() {
    if (_reactionStylesInjected) return;
    _reactionStylesInjected = true;
    const style = document.createElement('style');
    style.id = 'grip-reaction-styles';
    style.textContent = `
        .rt-instructions {
            padding: 1.25rem;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            text-align: center;
        }
        .rt-arena {
            position: relative;
            height: 280px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1.25rem;
            border-radius: 10px;
            background: rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.05);
            cursor: default;
            user-select: none;
        }
        .rt-waiting {
            font-size: 1rem;
            color: #8888aa;
            font-weight: 500;
            transition: color 0.2s;
        }
        .rt-target {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: radial-gradient(circle, #00e5ff 0%, #0088cc 100%);
            border: 3px solid rgba(0,229,255,0.6);
            color: #fff;
            font-size: 1.1rem;
            font-weight: 700;
            font-family: 'JetBrains Mono', monospace;
            cursor: pointer;
            box-shadow: 0 0 30px rgba(0,229,255,0.4), 0 0 60px rgba(0,229,255,0.15);
            animation: rtPulse 0.8s ease-in-out infinite alternate;
            transition: all 0.15s ease;
        }
        .rt-target:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 0 40px rgba(0,229,255,0.6);
        }
        .rt-target:active:not(:disabled) {
            transform: scale(0.95);
        }
        @keyframes rtPulse {
            from { box-shadow: 0 0 30px rgba(0,229,255,0.4); }
            to { box-shadow: 0 0 50px rgba(0,229,255,0.6), 0 0 80px rgba(0,229,255,0.2); }
        }
        .rt-target--clicked {
            background: radial-gradient(circle, #00ff88 0%, #00cc66 100%) !important;
            border-color: #00ff88 !important;
            box-shadow: 0 0 30px rgba(0,255,136,0.5) !important;
            animation: none !important;
            font-size: 1.3rem;
        }
        .rt-target--timeout {
            background: radial-gradient(circle, #ff4060 0%, #cc2244 100%) !important;
            border-color: #ff4060 !important;
            box-shadow: 0 0 30px rgba(255,64,96,0.5) !important;
            animation: none !important;
        }
        .rt-result-label {
            position: absolute;
            bottom: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            letter-spacing: 0.05em;
        }
    `;
    document.head.appendChild(style);
}

function _buildVitalSigns(vitals) {
    const wrapper = document.createElement('div');
    wrapper.className = 'vitals-grid';

    const title = document.createElement('div');
    title.className = 'vitals-title';
    title.textContent = 'Vital Signs';
    wrapper.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'vitals-values';

    const signs = [
        { label: 'HR', value: vitals?.hr, unit: 'bpm' },
        { label: 'BP', value: vitals?.bp, unit: 'mmHg' },
        { label: 'Temp', value: vitals?.temp, unit: '' },
        { label: 'RR', value: vitals?.rr, unit: '/min' },
        { label: 'SpO2', value: vitals?.spo2, unit: '' },
    ];

    for (const s of signs) {
        const cell = document.createElement('div');
        cell.className = 'vital-cell';
        const lbl = document.createElement('div');
        lbl.className = 'vital-label';
        lbl.textContent = s.label;
        const val = document.createElement('div');
        val.className = 'vital-value';
        val.textContent = s.unit ? `${s.value} ${s.unit}` : (s.value || '—');
        cell.appendChild(lbl);
        cell.appendChild(val);
        grid.appendChild(cell);
    }

    wrapper.appendChild(grid);
    return wrapper;
}
