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
