/**
 * Session Controller
 * G.R.I.P. Platform — master orchestrator for the closed-loop session lifecycle.
 * Wires biometrics → NFI → difficulty → scenario selection into a continuous feedback loop.
 * @module session/session-controller
 */

import { SessionState, SessionStates } from './session-state.js';
import { SessionTimer, ScenarioTimer } from './timer.js';
import { ResponseHandler } from './response-handler.js';
import { renderScenario, renderReactionTest } from './scenario-renderer.js';
import { DifficultyController } from '../scenario/difficulty-controller.js';
import { EEGSimulator } from '../biometrics/eeg-simulator.js';
import { BiometricEngine } from '../biometrics/biometric-engine.js';
import { BiometricVisualizer } from '../biometrics/biometric-visualizer.js';
import { NFIDisplay } from '../nfi/nfi-display.js';
import { ScenarioEngine } from '../scenario/scenario-engine.js';
import { navigate } from '../router.js';
import { formatTime } from '../utils/format.js';
import {
    NFI_UPDATE_INTERVAL,
    DIFFICULTY_CHECK_INTERVAL,
    MAX_SCENARIOS_PER_SESSION,
    SESSION_FLUSH_INTERVAL,
} from '../config/constants.js';
import { clamp, ema } from '../utils/math-utils.js';

/**
 * Duration of the breather screen in milliseconds.
 * @type {number}
 */
const BREATHER_DURATION = 10000;

/**
 * Master controller that orchestrates the entire G.R.I.P. session loop:
 * calibration → scenario presentation → biometric monitoring → NFI computation →
 * difficulty adjustment → next scenario, until the session completes.
 */
export class SessionController {

    constructor() {
        /** @type {SessionState} */
        this._sessionState = new SessionState();

        /** @type {EEGSimulator} */
        this._eegSimulator = new EEGSimulator();

        /** @type {DifficultyController} */
        this._difficultyController = new DifficultyController();

        /** @type {ResponseHandler} */
        this._responseHandler = new ResponseHandler();

        /** @type {SessionTimer} */
        this._sessionTimer = new SessionTimer((tick) => {
            this._sessionState.update({ elapsedTime: tick.elapsed });
        });

        /** @type {ScenarioTimer|null} */
        this._scenarioTimer = null;

        /** @type {number|null} NFI update interval ID. */
        this._nfiIntervalId = null;

        /** @type {number|null} Difficulty check interval ID. */
        this._difficultyIntervalId = null;

        /** @type {number|null} Data flush interval ID. */
        this._flushIntervalId = null;

        /** @type {number|null} Biometric animation frame ID. */
        this._biometricFrameId = null;

        /** @type {number} Current NFI composite value (0-100). */
        this._currentNfi = 75;

        /** @type {number} Smoothed NFI value. */
        this._smoothedNfi = 75;

        /** @type {number} Previous NFI for trend detection. */
        this._prevNfi = 75;

        /** @type {number} NFI trend direction (-1, 0, 1). */
        this._nfiTrend = 0;

        /** @type {number} Current cognitive load estimate (0-1). */
        this._cognitiveLoad = 0.3;

        /** @type {Object|null} Current scenario object. */
        this._currentScenario = null;

        /** @type {number} Current scenario index (0-based). */
        this._scenarioIndex = 0;

        /** @type {number} Total scenarios for this session. */
        this._totalScenarios = MAX_SCENARIOS_PER_SESSION;

        /** @type {Object[]} NFI history for results. */
        this._nfiHistory = [];

        /** @type {Object[]} Biometric sample history. */
        this._biometricHistory = [];

        /** @type {HTMLElement|null} Cached scenario container reference. */
        this._scenarioContainer = null;

        /** @type {boolean} Whether the session is currently in a breather pause. */
        this._inBreather = false;

        /** @type {number[]} Reaction time test results (ms). */
        this._reactionTimes = [];

        /** @type {Set<number>} Scenario indices that are reaction time tests (0-based). */
        this._reactionTestSlots = new Set([2, 5]); // positions 3 and 6 out of 8
    }

    /**
     * Start a new session. Runs calibration, then enters the active loop.
     * @param {Object}      [options]
     * @param {HTMLElement}  [options.container]      - DOM element for scenario rendering.
     * @param {number}       [options.totalScenarios] - Number of scenarios (default: MAX_SCENARIOS_PER_SESSION).
     * @param {Function}     [options.onCalibrate]    - Async calibration routine (replaces default).
     * @param {Function}     [options.getScenario]    - Function(difficulty) => scenario object.
     * @param {Function}     [options.onComplete]     - Called when session finishes.
     * @param {Function}     [options.onNfiUpdate]    - Called on each NFI recalculation.
     * @param {Function}     [options.onBiometricFrame] - Called on each biometric sample frame.
     */
    async startSession(options = {}) {
        this._scenarioContainer = options.container || document.getElementById('scenario-container');
        this._totalScenarios = options.totalScenarios ?? MAX_SCENARIOS_PER_SESSION;
        this._getScenarioFn = options.getScenario || null;
        this._onCompleteFn = options.onComplete || null;
        this._onNfiUpdateFn = options.onNfiUpdate || null;
        this._onBiometricFrameFn = options.onBiometricFrame || null;

        this._sessionState.update({ totalScenarios: this._totalScenarios });

        // Step 1: Transition to CALIBRATING
        this._sessionState.transition(SessionStates.CALIBRATING);

        // Step 2: Run calibration
        if (options.onCalibrate) {
            await options.onCalibrate();
        } else {
            await this._runDefaultCalibration();
        }

        // Step 3: Transition to ACTIVE
        this._sessionState.transition(SessionStates.ACTIVE);

        // Step 4: Start engines
        this._startBiometricEngine();
        this._startNfiEngine();
        this._startDifficultyEngine();
        this._startDataFlush();
        this._sessionTimer.start();

        // Step 5: Load and present the first scenario
        await this.nextScenario();
    }

    /**
     * Handle a user's response to the current scenario.
     * @param {number} answerIndex - The selected answer index (0-3) or -1 for timeout.
     */
    handleResponse(answerIndex) {
        if (!this._currentScenario) return;

        const scenario = this._currentScenario;
        const responseTime = this._scenarioTimer ? this._scenarioTimer.getRemaining() : 0;
        const actualResponseTime = scenario.timeLimit - (this._scenarioTimer ? this._scenarioTimer.getRemaining() : 0);

        // Record the response
        this._responseHandler.recordResponse(
            scenario.id,
            answerIndex,
            scenario.correctIndex,
            actualResponseTime,
            this._difficultyController.getDifficulty()
        );

        // Update cognitive load based on correctness
        const correct = answerIndex === scenario.correctIndex && answerIndex !== -1;
        if (correct) {
            // Correct answer: slightly lower cognitive load
            this._cognitiveLoad = clamp(this._cognitiveLoad - 0.05, 0.1, 0.9);
        } else {
            // Incorrect: increase cognitive load
            this._cognitiveLoad = clamp(this._cognitiveLoad + 0.1, 0.1, 0.9);
        }
        this._eegSimulator.setCognitiveLoad(this._cognitiveLoad);

        // Advance to next scenario or complete
        this._scenarioIndex++;
        this._sessionState.update({ scenarioIndex: this._scenarioIndex });

        if (this._scenarioIndex >= this._totalScenarios) {
            this.endSession();
        } else {
            this.nextScenario();
        }
    }

    /**
     * Load and render the next scenario or reaction time test at the current difficulty level.
     */
    async nextScenario() {
        const state = this._sessionState.getState();
        if (state !== SessionStates.ACTIVE) return;

        // Check if this slot is a reaction time test
        if (this._reactionTestSlots.has(this._scenarioIndex)) {
            await this._runReactionTest();
            return;
        }

        const difficulty = this._difficultyController.getDifficulty();
        this._sessionState.update({ difficulty });

        // Obtain the next scenario (with error fallback)
        let scenario;
        try {
            if (this._getScenarioFn) {
                scenario = this._getScenarioFn(difficulty);
            } else {
                scenario = this._generatePlaceholderScenario(difficulty);
            }
        } catch (err) {
            console.error('[SessionController] Scenario generation failed:', err);
            scenario = this._generatePlaceholderScenario(difficulty);
        }

        if (!scenario) {
            console.error('[SessionController] No scenario returned, using placeholder');
            scenario = this._generatePlaceholderScenario(difficulty);
        }

        // Normalize options: ensure they are plain strings for the renderer
        if (scenario.options && scenario.options.length > 0 && typeof scenario.options[0] === 'object') {
            const correctIdx = scenario.correctIndex;
            scenario.options = scenario.options.map(o => o.text || String(o));
        }

        this._currentScenario = scenario;

        // Render the scenario and wait for user response
        if (this._scenarioContainer) {
            try {
                const result = await renderScenario(
                    this._scenarioContainer,
                    scenario,
                    this._scenarioIndex + 1,
                    this._totalScenarios
                );
                this.handleResponse(result.selectedIndex);
            } catch (err) {
                console.error('[SessionController] Scenario render failed:', err);
                // Auto-advance on render failure
                this.handleResponse(-1);
            }
        }
    }

    /**
     * Run a reaction time test at the current scenario slot.
     * Records the result and advances.
     * @private
     */
    async _runReactionTest() {
        if (!this._scenarioContainer) return;

        // Set a dummy scenario so handleResponse doesn't bail
        this._currentScenario = {
            id: `rt-test-${this._scenarioIndex + 1}`,
            type: 'reaction-time',
            correctIndex: 0,
            timeLimit: 0,
        };

        try {
            const result = await renderReactionTest(
                this._scenarioContainer,
                this._scenarioIndex + 1,
                this._totalScenarios
            );

            // Store reaction time
            this._reactionTimes.push(result.reactionTime);

            // Record as a response (selectedIndex 0 = clicked, -1 = timeout)
            this._responseHandler.recordResponse(
                this._currentScenario.id,
                result.selectedIndex,
                0, // correctIndex is always 0 (clicked = correct)
                result.reactionTime,
                this._difficultyController.getDifficulty()
            );

            // Advance to next item
            this._scenarioIndex++;
            this._sessionState.update({ scenarioIndex: this._scenarioIndex });

            if (this._scenarioIndex >= this._totalScenarios) {
                this.endSession();
            } else {
                this.nextScenario();
            }
        } catch (err) {
            console.error('[SessionController] Reaction test failed:', err);
            this._scenarioIndex++;
            this._sessionState.update({ scenarioIndex: this._scenarioIndex });
            if (this._scenarioIndex >= this._totalScenarios) {
                this.endSession();
            } else {
                this.nextScenario();
            }
        }
    }

    /**
     * Pause the session.
     */
    pauseSession() {
        const state = this._sessionState.getState();
        if (state !== SessionStates.ACTIVE) return;

        this._sessionState.transition(SessionStates.PAUSED);
        this._sessionTimer.pause();
        this._stopEngines();
    }

    /**
     * Resume the session after a pause.
     */
    resumeSession() {
        const state = this._sessionState.getState();
        if (state !== SessionStates.PAUSED) return;

        this._sessionState.transition(SessionStates.ACTIVE);
        this._sessionTimer.resume();
        this._startBiometricEngine();
        this._startNfiEngine();
        this._startDifficultyEngine();
        this._startDataFlush();
    }

    /**
     * End the session. Stops all engines, computes results, navigates to results page.
     */
    endSession() {
        // Stop all engines
        this._stopEngines();
        this._sessionTimer.stop();
        if (this._scenarioTimer) {
            this._scenarioTimer.stop();
        }

        // Transition to COMPLETING
        this._sessionState.transition(SessionStates.COMPLETING);

        // Compute final results
        const sessionData = this.getSessionData();

        // Flush final data
        this._flushData();

        // Transition to COMPLETE
        this._sessionState.transition(SessionStates.COMPLETE);

        // Notify completion handler
        if (this._onCompleteFn) {
            this._onCompleteFn(sessionData);
        }
    }

    /**
     * Get all accumulated session data for the results page.
     * @returns {Object} Comprehensive session data object.
     */
    getSessionData() {
        const stateData = this._sessionState.getData();
        const performance = this._responseHandler.getPerformanceSummary();
        const responses = this._responseHandler.getAllResponses();
        const difficultyHistory = this._difficultyController.getHistory();

        return {
            state: stateData,
            performance,
            responses,
            difficultyHistory,
            nfiHistory: [...this._nfiHistory],
            biometricHistory: [...this._biometricHistory],
            reactionTimes: [...this._reactionTimes],
            finalNfi: this._smoothedNfi,
            finalDifficulty: this._difficultyController.getDifficulty(),
            totalTime: this._sessionTimer.getElapsed(),
        };
    }

    /**
     * Destroy all resources held by the controller.
     */
    cleanup() {
        this._stopEngines();
        this._sessionTimer.reset();
        if (this._scenarioTimer) {
            this._scenarioTimer.stop();
        }
        this._eegSimulator.reset();
        this._difficultyController.reset();
        this._responseHandler.reset();
        this._sessionState.reset();

        this._nfiHistory = [];
        this._biometricHistory = [];
        this._reactionTimes = [];
        this._currentScenario = null;
        this._scenarioIndex = 0;
        this._scenarioContainer = null;
        this._inBreather = false;
    }

    // -----------------------------------------------------------------------
    // Private engine management
    // -----------------------------------------------------------------------

    /**
     * Start the biometric sampling engine (runs via requestAnimationFrame).
     * @private
     */
    _startBiometricEngine() {
        if (this._biometricFrameId != null) return;

        const loop = (timestamp) => {
            const seconds = timestamp / 1000;
            const sample = this._eegSimulator.getSample(seconds);
            const bandPowers = this._eegSimulator.getBandPowers();

            // Store sample
            this._biometricHistory.push({
                timestamp: Date.now(),
                raw: sample.raw,
                bands: sample.bands,
                bandPowers,
            });

            // Keep history bounded (last 1000 samples)
            if (this._biometricHistory.length > 1000) {
                this._biometricHistory.shift();
            }

            if (this._onBiometricFrameFn) {
                this._onBiometricFrameFn(sample, bandPowers);
            }

            this._biometricFrameId = requestAnimationFrame(loop);
        };

        this._biometricFrameId = requestAnimationFrame(loop);
    }

    /**
     * Start the NFI computation engine (updates every 500ms).
     * @private
     */
    _startNfiEngine() {
        if (this._nfiIntervalId != null) return;

        this._nfiIntervalId = setInterval(() => {
            this._computeNfi();
        }, NFI_UPDATE_INTERVAL);
    }

    /**
     * Start the difficulty adjustment engine (checks every 10s).
     * @private
     */
    _startDifficultyEngine() {
        if (this._difficultyIntervalId != null) return;

        this._difficultyIntervalId = setInterval(() => {
            this._evaluateDifficulty();
        }, DIFFICULTY_CHECK_INTERVAL);
    }

    /**
     * Start periodic data flush.
     * @private
     */
    _startDataFlush() {
        if (this._flushIntervalId != null) return;

        this._flushIntervalId = setInterval(() => {
            this._flushData();
        }, SESSION_FLUSH_INTERVAL);
    }

    /**
     * Stop all running engines.
     * @private
     */
    _stopEngines() {
        if (this._biometricFrameId != null) {
            cancelAnimationFrame(this._biometricFrameId);
            this._biometricFrameId = null;
        }

        if (this._nfiIntervalId != null) {
            clearInterval(this._nfiIntervalId);
            this._nfiIntervalId = null;
        }

        if (this._difficultyIntervalId != null) {
            clearInterval(this._difficultyIntervalId);
            this._difficultyIntervalId = null;
        }

        if (this._flushIntervalId != null) {
            clearInterval(this._flushIntervalId);
            this._flushIntervalId = null;
        }
    }

    /**
     * Compute the current NFI (Neural Focus Index) from biometric data
     * and response quality metrics.
     * @private
     */
    _computeNfi() {
        const bandPowers = this._eegSimulator.getBandPowers();

        // Neural component: based on beta/alpha ratio (engagement)
        const betaAlphaRatio = bandPowers.alpha > 0 ? bandPowers.beta / bandPowers.alpha : 1;
        const neuralScore = clamp(betaAlphaRatio * 30, 0, 100);

        // Focus component: theta/beta ratio inversely correlates with focus
        const thetaBetaRatio = bandPowers.beta > 0 ? bandPowers.theta / bandPowers.beta : 1;
        const focusScore = clamp((1 - thetaBetaRatio * 0.5) * 100, 0, 100);

        // Response quality component
        const accuracy = this._responseHandler.getAccuracy();
        const avgResponseTime = this._responseHandler.getAverageResponseTime();
        const responseScore = clamp(accuracy * 70 + Math.max(0, (30000 - avgResponseTime) / 300), 0, 100);

        // Composite NFI (simplified weighting — full version would use NFI_WEIGHTS)
        const rawNfi = neuralScore * 0.35 + focusScore * 0.25 + responseScore * 0.25 + 15;

        // Smooth the NFI
        this._prevNfi = this._smoothedNfi;
        this._smoothedNfi = ema(rawNfi, this._smoothedNfi, 0.2);
        this._currentNfi = Math.round(this._smoothedNfi);

        // Determine trend
        const delta = this._smoothedNfi - this._prevNfi;
        if (delta > 0.5) {
            this._nfiTrend = 1;
        } else if (delta < -0.5) {
            this._nfiTrend = -1;
        } else {
            this._nfiTrend = 0;
        }

        // Record to history
        this._nfiHistory.push({
            timestamp: Date.now(),
            nfi: this._currentNfi,
            neuralScore: Math.round(neuralScore),
            focusScore: Math.round(focusScore),
            responseScore: Math.round(responseScore),
            betaAlphaRatio: Math.round(betaAlphaRatio * 100) / 100,
            trend: this._nfiTrend,
        });

        if (this._onNfiUpdateFn) {
            this._onNfiUpdateFn({
                nfi: this._currentNfi,
                neuralScore,
                focusScore,
                responseScore,
                betaAlphaRatio,
                trend: this._nfiTrend,
            });
        }
    }

    /**
     * Evaluate and adjust difficulty based on current metrics.
     * Handles breather injection when fatigue is detected.
     * @private
     */
    _evaluateDifficulty() {
        if (this._inBreather) return;

        const bandPowers = this._eegSimulator.getBandPowers();
        const betaAlphaRatio = bandPowers.alpha > 0 ? bandPowers.beta / bandPowers.alpha : 1;

        const nfiData = {
            nfi: this._currentNfi,
            betaAlphaRatio,
            trend: this._nfiTrend,
        };

        const sessionData = {
            accuracy: this._responseHandler.getAccuracy(),
            elapsed: this._sessionTimer.getElapsed(),
        };

        const result = this._difficultyController.evaluate(nfiData, sessionData);

        // Update session state with new difficulty
        this._sessionState.update({ difficulty: result.difficulty });

        // Adjust cognitive load influence on biometrics
        this._adjustCognitiveLoad(result);

        // Handle breather action
        if (result.action === 'breather') {
            this._injectBreather();
        }
    }

    /**
     * Adjust the EEG simulator's cognitive load based on difficulty changes.
     * @param {Object} result - DifficultyResult from the controller.
     * @private
     */
    _adjustCognitiveLoad(result) {
        // Map difficulty (1-10) to a cognitive load influence (0.1-0.8)
        const difficultyNormalized = (result.difficulty - 1) / 9;
        const targetLoad = 0.1 + difficultyNormalized * 0.7;
        this._cognitiveLoad = ema(targetLoad, this._cognitiveLoad, 0.15);
        this._eegSimulator.setCognitiveLoad(this._cognitiveLoad);
    }

    /**
     * Inject a breather screen when fatigue is detected.
     * Shows a calming display for BREATHER_DURATION ms, then resumes.
     * @private
     */
    _injectBreather() {
        this._inBreather = true;

        // Pause scenario timer
        if (this._scenarioTimer) {
            this._scenarioTimer.stop();
        }

        // Render breather UI
        if (this._scenarioContainer) {
            this._scenarioContainer.innerHTML = '';

            const breatherEl = document.createElement('div');
            breatherEl.className = 'breather-screen';

            const title = document.createElement('h2');
            title.className = 'breather-title';
            title.textContent = 'Take a Moment';

            const message = document.createElement('p');
            message.className = 'breather-message';
            message.textContent = 'Fatigue detected. Take a few deep breaths and relax before continuing.';

            const countdown = document.createElement('div');
            countdown.className = 'breather-countdown';
            let secondsLeft = BREATHER_DURATION / 1000;
            countdown.textContent = `Resuming in ${secondsLeft}s`;

            breatherEl.appendChild(title);
            breatherEl.appendChild(message);
            breatherEl.appendChild(countdown);
            this._scenarioContainer.appendChild(breatherEl);

            // Countdown display
            const countdownInterval = setInterval(() => {
                secondsLeft--;
                if (secondsLeft > 0) {
                    countdown.textContent = `Resuming in ${secondsLeft}s`;
                } else {
                    countdown.textContent = 'Resuming...';
                    clearInterval(countdownInterval);
                }
            }, 1000);
        }

        // After breather duration, resume
        setTimeout(() => {
            this._inBreather = false;

            // Lower cognitive load for re-entry
            this._cognitiveLoad = clamp(this._cognitiveLoad - 0.2, 0.1, 0.9);
            this._eegSimulator.setCognitiveLoad(this._cognitiveLoad);

            // Load next scenario
            this.nextScenario();
        }, BREATHER_DURATION);
    }

    /**
     * Flush accumulated data (e.g. to persistent storage or analytics).
     * @private
     */
    _flushData() {
        // Data is already maintained in memory arrays.
        // This hook exists for future integration with Firebase or IndexedDB.
        // For now, trim overly long histories.
        if (this._nfiHistory.length > 2000) {
            this._nfiHistory = this._nfiHistory.slice(-1000);
        }
        if (this._biometricHistory.length > 2000) {
            this._biometricHistory = this._biometricHistory.slice(-1000);
        }
    }

    /**
     * Run a default calibration routine (placeholder for CalibrationController).
     * Waits for calibration duration to simulate the process.
     * @returns {Promise<void>}
     * @private
     */
    _runDefaultCalibration() {
        return new Promise((resolve) => {
            // Simulate calibration phase — will be replaced by CalibrationController
            const CALIBRATION_TIME = 3000; // Shortened default; real calibration uses CALIBRATION_DURATION
            setTimeout(resolve, CALIBRATION_TIME);
        });
    }

    /**
     * Generate a placeholder scenario when no ScenarioEngine is provided.
     * @param {number} difficulty - Current difficulty level.
     * @returns {Object} A scenario object.
     * @private
     */
    _generatePlaceholderScenario(difficulty) {
        const id = `scenario-${this._scenarioIndex + 1}-d${difficulty}`;
        return {
            id,
            type: 'general',
            difficulty,
            stem: `Clinical question at difficulty level ${difficulty}. What is the most appropriate next step?`,
            patientInfo: {
                age: '45',
                sex: 'Male',
                chiefComplaint: 'Chest pain',
                history: 'Hypertension, Type 2 DM',
            },
            vitalSigns: {
                hr: '92',
                bp: '145/90',
                temp: '37.1C',
                rr: '18',
                spo2: '97%',
            },
            options: [
                'Option A — Placeholder',
                'Option B — Placeholder',
                'Option C — Placeholder',
                'Option D — Placeholder',
            ],
            correctIndex: 0,
            timeLimit: Math.max(15000, 45000 - difficulty * 3000),
        };
    }
}

// ───────────────────────────────────────────────────────────────────
// Session Page Renderer — entry point for router
// ───────────────────────────────────────────────────────────────────

/**
 * Render the full session page and start the session loop.
 * Called by the router when navigating to #/session.
 * @param {HTMLElement} container - The #app-content element.
 * @returns {Function} Cleanup function for router to call on navigation away.
 */
export function renderSessionPage(container) {
    // Build session layout — scenario left, biometrics right, both visible
    container.innerHTML = `
        <div style="padding: 0.75rem; height: 100vh; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box;">
            <div style="display: flex; align-items: center; gap: 1.5rem; padding: 0.5rem 0.25rem; margin-bottom: 0.5rem; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #8888aa; flex-shrink: 0;">
                <span id="session-timer" style="font-size: 1.1rem; color: #00e5ff; font-weight: 600;">00:00</span>
                <span id="scenario-counter" style="color: #d0d0e0;">0 / 8</span>
                <span style="display: flex; align-items: center; gap: 0.4rem;">
                    <span>Difficulty</span>
                    <span id="difficulty-value" style="color: #00e5ff; font-weight: 600;">5</span>
                </span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; flex: 1; min-height: 0;">
                <div id="scenario-container" style="overflow-y: auto; padding-right: 0.25rem;"></div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem; min-height: 0;">
                    <div id="biometric-panels" style="flex: 1; min-height: 0;"></div>
                    <div id="nfi-gauge-container" style="flex-shrink: 0;"></div>
                </div>
            </div>
        </div>
    `;

    // Initialize components
    const scenarioEngine = new ScenarioEngine('medical');
    const biometricEngine = new BiometricEngine();
    const biometricVisualizer = new BiometricVisualizer(document.getElementById('biometric-panels'));
    const nfiDisplay = new NFIDisplay(document.getElementById('nfi-gauge-container'));
    const controller = new SessionController();
    const seenConditions = [];

    // Wire biometric visualizer updates — map BiometricEngine snapshot format
    // to the format BiometricVisualizer expects
    const EEG_RAW_SCALE = 80;       // max expected raw amplitude for normalization
    const EEG_POWER_SCALE = 500;    // max expected band power for normalization
    biometricEngine.onUpdate((snapshot) => {
        const eyeState = snapshot.eyeTracking || {};
        const eyeMetrics = eyeState.metrics || {};
        // Normalize band powers from raw (amplitude^2/2) to 0-1 range
        const rawPowers = snapshot.eeg?.bandPowers || {};
        const normPowers = {};
        for (const key of ['delta', 'theta', 'alpha', 'beta', 'gamma']) {
            normPowers[key] = clamp((rawPowers[key] || 0) / EEG_POWER_SCALE, 0, 1);
        }
        const mapped = {
            eeg: {
                amplitude: clamp((snapshot.eeg?.raw ?? 0) / EEG_RAW_SCALE, -1, 1),
                bandPowers: normPowers,
            },
            eye: {
                gazeX: eyeState.x != null ? clamp(eyeState.x / 1280, 0, 1) : 0.5,
                gazeY: eyeState.y != null ? clamp(eyeState.y / 720, 0, 1) : 0.5,
                fixating: eyeState.state === 'fixation',
                blinking: eyeState.state === 'blink',
                fixationCount: eyeMetrics.fixationCount ?? 0,
                avgFixationDuration: eyeMetrics.avgFixationDuration ?? 0,
                blinkRate: eyeMetrics.blinkRate ?? 0,
                pupilDilation: eyeState.pupilDilation ?? 4.0,
                avgSaccadeVelocity: eyeMetrics.avgSaccadeVelocity ?? 0,
                peakSaccadeVelocity: eyeMetrics.peakSaccadeVelocity ?? 0,
                fixationDurationStd: eyeMetrics.fixationDurationStd ?? 0,
                pupilTrend: eyeMetrics.pupilTrend ?? 0,
                focusZoneRatio: eyeMetrics.focusZoneRatio ?? 0,
                scanPathLength: eyeMetrics.scanPathLength ?? 0,
            },
            voice: {
                jitter: snapshot.voice?.jitter ?? 0,
                shimmer: snapshot.voice?.shimmer ?? 0,
                hnr: snapshot.voice?.hnr ?? 0,
                f0: snapshot.voice?.f0 ?? 0,
                prosody: snapshot.voice?.prosodyVariation ?? 0,
                stressIndex: (snapshot.voice?.stressIndex ?? 0) * 100,
            },
        };
        biometricVisualizer.update(mapped);
    });

    // Session timer display
    const timerEl = document.getElementById('session-timer');
    const counterEl = document.getElementById('scenario-counter');
    const difficultyEl = document.getElementById('difficulty-value');

    // Connect cognitive load: when the session controller adjusts load,
    // propagate it to the full BiometricEngine (all 3 simulators)
    const origAdjust = controller._adjustCognitiveLoad.bind(controller);
    controller._adjustCognitiveLoad = function(result) {
        origAdjust(result);
        biometricEngine.setCognitiveLoad(controller._cognitiveLoad);
    };

    // Also wire the handleResponse cognitive load changes
    const origHandle = controller.handleResponse.bind(controller);
    controller.handleResponse = function(answerIndex) {
        origHandle(answerIndex);
        biometricEngine.setCognitiveLoad(controller._cognitiveLoad);
    };

    // Start the session
    controller.startSession({
        container: document.getElementById('scenario-container'),
        getScenario: (difficulty) => {
            try {
                const scenario = scenarioEngine.generateScenario(difficulty, seenConditions);
                if (scenario && scenario.conditionId) {
                    seenConditions.push(scenario.conditionId);
                }
                return scenario;
            } catch (err) {
                console.error('[Session] Medical scenario generation failed:', err);
                // Show the error in the scenario container for debugging
                const sc = document.getElementById('scenario-container');
                if (sc) {
                    const errDiv = document.createElement('div');
                    errDiv.style.cssText = 'color:#ff4060;padding:1rem;font-size:0.8rem;font-family:monospace;';
                    errDiv.textContent = `Scenario error: ${err.message}`;
                    sc.appendChild(errDiv);
                }
                return null;
            }
        },
        onNfiUpdate: (data) => {
            // Compute vocal calm from live biometric engine data
            const voiceSnap = biometricEngine.getSnapshot()?.voice;
            const vocalCalm = voiceSnap
                ? clamp(Math.round((1 - (voiceSnap.stressIndex || 0)) * 100), 0, 100)
                : 65;
            nfiDisplay.update({
                composite: data.nfi,
                components: {
                    neuralEfficiency: data.neuralScore,
                    focusStability: data.focusScore,
                    vocalCalm,
                    responseQuality: data.responseScore,
                },
                trend: data.trend > 0 ? 'rising' : data.trend < 0 ? 'falling' : 'stable',
            });

            // Update header
            if (timerEl) timerEl.textContent = formatTime(controller._sessionTimer.getElapsed());
            if (counterEl) counterEl.textContent = `${controller._scenarioIndex} / ${controller._totalScenarios}`;
            if (difficultyEl) difficultyEl.textContent = controller._difficultyController.getDifficulty();
        },
        onBiometricFrame: () => {},
        onComplete: (sessionData) => {
            // Store results for the results page
            try {
                sessionStorage.setItem('grip_session_results', JSON.stringify(sessionData));
            } catch (e) {
                console.warn('Could not save session results to sessionStorage:', e);
            }
            navigate('#/results');
        },
    });

    // Start biometrics at a moderate cognitive load for visually interesting demo data
    biometricEngine.setCognitiveLoad(0.4);
    biometricEngine.start();

    // Return cleanup function
    return () => {
        controller.cleanup();
        biometricEngine.stop();
        biometricVisualizer.destroy();
        nfiDisplay.destroy();
    };
}
