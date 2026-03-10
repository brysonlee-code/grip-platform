/**
 * Scenario Renderer
 * G.R.I.P. Platform — renders clinical scenario cards and captures user responses
 * @module session/scenario-renderer
 */

/**
 * @typedef {Object} Scenario
 * @property {string}   id           - Unique scenario identifier.
 * @property {string}   type         - Scenario category (e.g. 'cardiac', 'respiratory').
 * @property {number}   difficulty   - Difficulty level (1-10).
 * @property {string}   stem         - The clinical question text.
 * @property {Object}   patientInfo  - Patient demographics and presentation.
 * @property {string}   patientInfo.age          - Patient age.
 * @property {string}   patientInfo.sex          - Patient sex.
 * @property {string}   patientInfo.chiefComplaint - Primary complaint.
 * @property {string}   patientInfo.history      - Relevant medical history.
 * @property {Object}   vitalSigns   - Current vital sign readings.
 * @property {string}   vitalSigns.hr   - Heart rate.
 * @property {string}   vitalSigns.bp   - Blood pressure.
 * @property {string}   vitalSigns.temp - Temperature.
 * @property {string}   vitalSigns.rr   - Respiratory rate.
 * @property {string}   vitalSigns.spo2 - Oxygen saturation.
 * @property {string[]} options      - Array of 4 answer option strings.
 * @property {number}   correctIndex - Index of the correct answer (0-3).
 * @property {number}   timeLimit    - Time limit in milliseconds.
 */

/** Option label letters. */
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

/** Feedback display duration in milliseconds. */
const FEEDBACK_DELAY = 800;

/**
 * Render a scenario card into a container and return a promise that resolves
 * when the user selects an answer or time expires.
 *
 * @param {HTMLElement} container       - DOM element to render into.
 * @param {Scenario}    scenario        - The scenario data to display.
 * @param {number}      scenarioNumber  - Current scenario number (1-based).
 * @param {number}      totalScenarios  - Total scenarios in the session.
 * @returns {Promise<{ selectedIndex: number, responseTime: number }>}
 *   Resolves with the selected answer index (-1 if timed out) and response time in ms.
 */
export function renderScenario(container, scenario, scenarioNumber, totalScenarios) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        let resolved = false;
        let timerIntervalId = null;

        // Clear container
        container.innerHTML = '';

        // --- Build the card ---
        const card = document.createElement('div');
        card.className = 'scenario-card';

        // Timer bar at top
        const timerBar = document.createElement('div');
        timerBar.className = 'scenario-timer-bar';
        const timerFill = document.createElement('div');
        timerFill.className = 'scenario-timer-fill';
        timerBar.appendChild(timerFill);
        card.appendChild(timerBar);

        // Scenario number / total
        const header = document.createElement('div');
        header.className = 'scenario-header';
        header.textContent = `Question ${scenarioNumber} of ${totalScenarios}`;
        card.appendChild(header);

        // Patient info card
        const patientCard = _buildPatientInfo(scenario.patientInfo);
        card.appendChild(patientCard);

        // Vital signs grid
        const vitalsGrid = _buildVitalSigns(scenario.vitalSigns);
        card.appendChild(vitalsGrid);

        // Question stem
        const stemEl = document.createElement('div');
        stemEl.className = 'scenario-stem';
        stemEl.textContent = scenario.stem;
        card.appendChild(stemEl);

        // Answer option buttons
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'scenario-options';
        const buttons = [];

        for (let i = 0; i < scenario.options.length; i++) {
            const btn = document.createElement('button');
            btn.className = 'scenario-option-btn';
            btn.type = 'button';
            btn.dataset.index = String(i);

            const label = document.createElement('span');
            label.className = 'option-label';
            label.textContent = OPTION_LABELS[i];

            const text = document.createElement('span');
            text.className = 'option-text';
            text.textContent = scenario.options[i];

            btn.appendChild(label);
            btn.appendChild(text);

            btn.addEventListener('click', () => {
                handleSelection(i);
            });

            buttons.push(btn);
            optionsContainer.appendChild(btn);
        }

        card.appendChild(optionsContainer);
        container.appendChild(card);

        // --- Timer countdown ---
        if (scenario.timeLimit > 0) {
            timerIntervalId = setInterval(() => {
                if (resolved) return;
                const elapsed = Date.now() - startTime;
                const progress = Math.min(1, elapsed / scenario.timeLimit);
                const remaining = 1 - progress;

                // Shrink the fill bar
                timerFill.style.width = `${remaining * 100}%`;

                // Turn red when less than 20% time remaining
                if (remaining < 0.2) {
                    timerFill.classList.add('timer-critical');
                }

                // Time expired
                if (progress >= 1) {
                    handleSelection(-1);
                }
            }, 100);
        }

        /**
         * Handle an answer selection or timeout.
         * @param {number} index - Selected answer index, or -1 for timeout.
         */
        function handleSelection(index) {
            if (resolved) return;
            resolved = true;

            const responseTime = Date.now() - startTime;

            // Stop the timer bar
            if (timerIntervalId != null) {
                clearInterval(timerIntervalId);
                timerIntervalId = null;
            }

            // Disable all buttons
            for (const btn of buttons) {
                btn.disabled = true;
                btn.classList.add('option-disabled');
            }

            // Show feedback
            if (index >= 0 && index < buttons.length) {
                if (index === scenario.correctIndex) {
                    buttons[index].classList.add('option-correct');
                } else {
                    buttons[index].classList.add('option-incorrect');
                    // Also highlight the correct answer
                    buttons[scenario.correctIndex].classList.add('option-correct');
                }
            } else {
                // Timeout — highlight correct answer
                buttons[scenario.correctIndex].classList.add('option-correct');
            }

            // Brief delay before resolving so the user sees feedback
            setTimeout(() => {
                resolve({ selectedIndex: index, responseTime });
            }, FEEDBACK_DELAY);
        }
    });
}

/**
 * Build the patient information card element.
 * @param {Object} patientInfo
 * @returns {HTMLElement}
 * @private
 */
function _buildPatientInfo(patientInfo) {
    const wrapper = document.createElement('div');
    wrapper.className = 'patient-info-card';

    const title = document.createElement('div');
    title.className = 'patient-info-title';
    title.textContent = 'Patient Information';
    wrapper.appendChild(title);

    const fields = [
        { label: 'Age', value: patientInfo.age },
        { label: 'Sex', value: patientInfo.sex },
        { label: 'Chief Complaint', value: patientInfo.chiefComplaint },
        { label: 'History', value: patientInfo.history },
    ];

    for (const field of fields) {
        const row = document.createElement('div');
        row.className = 'patient-info-row';

        const lbl = document.createElement('span');
        lbl.className = 'patient-info-label';
        lbl.textContent = field.label + ':';

        const val = document.createElement('span');
        val.className = 'patient-info-value';
        val.textContent = field.value || 'N/A';

        row.appendChild(lbl);
        row.appendChild(val);
        wrapper.appendChild(row);
    }

    return wrapper;
}

/**
 * Build the vital signs grid element.
 * @param {Object} vitalSigns
 * @returns {HTMLElement}
 * @private
 */
function _buildVitalSigns(vitalSigns) {
    const wrapper = document.createElement('div');
    wrapper.className = 'vitals-grid';

    const title = document.createElement('div');
    title.className = 'vitals-title';
    title.textContent = 'Vital Signs';
    wrapper.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'vitals-values';

    const signs = [
        { label: 'HR',   value: vitalSigns.hr,   unit: 'bpm' },
        { label: 'BP',   value: vitalSigns.bp,   unit: 'mmHg' },
        { label: 'Temp', value: vitalSigns.temp,  unit: '' },
        { label: 'RR',   value: vitalSigns.rr,   unit: '/min' },
        { label: 'SpO2', value: vitalSigns.spo2,  unit: '' },
    ];

    for (const sign of signs) {
        const cell = document.createElement('div');
        cell.className = 'vital-cell';

        const lbl = document.createElement('div');
        lbl.className = 'vital-label';
        lbl.textContent = sign.label;

        const val = document.createElement('div');
        val.className = 'vital-value';
        val.textContent = sign.unit ? `${sign.value} ${sign.unit}` : sign.value;

        cell.appendChild(lbl);
        cell.appendChild(val);
        grid.appendChild(cell);
    }

    wrapper.appendChild(grid);
    return wrapper;
}
