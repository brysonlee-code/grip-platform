/**
 * Calibration UI
 * G.R.I.P. Platform — renders the theatrical calibration screen.
 * @module calibration/calibration-ui
 */

import { CalibrationController } from './calibration-controller.js';
import { BiometricEngine } from '../biometrics/biometric-engine.js';
import { BiometricVisualizer } from '../biometrics/biometric-visualizer.js';
import { navigate } from '../router.js';

let _cleanup = null;

/**
 * Render the calibration page with theatrical stream-activation sequence.
 * @param {HTMLElement} container
 * @returns {Function} Cleanup function
 */
export function renderCalibrationPage(container) {
    // Build layout
    container.innerHTML = `
        <div class="calibration-screen">
            <div class="calibration-streams">
                <div class="stream-indicator" id="stream-eeg">
                    <span class="stream-dot"></span>
                    <span class="stream-label">EEG</span>
                    <span class="stream-status">OFFLINE</span>
                </div>
                <div class="stream-indicator" id="stream-eye">
                    <span class="stream-dot"></span>
                    <span class="stream-label">GAZE</span>
                    <span class="stream-status">OFFLINE</span>
                </div>
                <div class="stream-indicator" id="stream-voice">
                    <span class="stream-dot"></span>
                    <span class="stream-label">VOICE</span>
                    <span class="stream-status">OFFLINE</span>
                </div>
            </div>

            <div class="calibration-visualizer" id="calibration-visualizer">
                <div class="scan-line"></div>
            </div>

            <div class="calibration-phase" id="calibration-phase">
                <span class="phase-text" id="phase-text">Initializing...</span>
            </div>

            <div class="calibration-progress">
                <div class="calibration-progress-bar" id="calibration-progress-bar"></div>
            </div>

            <button class="calibration-skip" id="calibration-skip">Skip Calibration</button>
        </div>
    `;

    // Initialize biometric engine + visualizer
    const biometricEngine = new BiometricEngine();
    const vizContainer = document.getElementById('calibration-visualizer');
    const biometricVisualizer = new BiometricVisualizer(vizContainer);

    // DOM refs
    const streamEEG = document.getElementById('stream-eeg');
    const streamEye = document.getElementById('stream-eye');
    const streamVoice = document.getElementById('stream-voice');
    const phaseText = document.getElementById('phase-text');
    const progressBar = document.getElementById('calibration-progress-bar');
    const skipBtn = document.getElementById('calibration-skip');

    let aborted = false;
    let calibrationController = new CalibrationController(biometricEngine);

    // Wire biometric updates to visualizer
    biometricEngine.onUpdate((snapshot) => {
        if (!aborted) biometricVisualizer.update(snapshot);
    });

    // Typing effect for phase text
    function setPhaseText(text) {
        phaseText.textContent = '';
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length && !aborted) {
                phaseText.textContent += text[i];
                i++;
            } else {
                clearInterval(interval);
            }
        }, 30);
    }

    // Update stream indicator
    function setStreamStatus(el, status) {
        const statusEl = el.querySelector('.stream-status');
        const dotEl = el.querySelector('.stream-dot');
        statusEl.textContent = status;
        el.classList.remove('offline', 'connecting', 'online');
        if (status === 'OFFLINE') {
            el.classList.add('offline');
        } else if (status === 'CONNECTING...') {
            el.classList.add('connecting');
        } else if (status === 'ONLINE') {
            el.classList.add('online');
        }
    }

    // Run calibration sequence
    async function runCalibration() {
        biometricEngine.start();

        // Phase 1: EEG (0-3s)
        setPhaseText('Initializing Neural Interface...');
        setStreamStatus(streamEEG, 'CONNECTING...');
        progressBar.style.width = '0%';

        await wait(1500);
        if (aborted) return;
        setStreamStatus(streamEEG, 'ONLINE');
        progressBar.style.width = '17%';

        await wait(1500);
        if (aborted) return;
        progressBar.style.width = '22%';

        // Phase 2: Eye Tracking (3-7s)
        setPhaseText('Calibrating Eye Tracking...');
        setStreamStatus(streamEye, 'CONNECTING...');
        progressBar.style.width = '28%';

        await wait(2000);
        if (aborted) return;
        setStreamStatus(streamEye, 'ONLINE');
        progressBar.style.width = '44%';

        await wait(2000);
        if (aborted) return;
        progressBar.style.width = '50%';

        // Phase 3: Voice (7-11s)
        setPhaseText('Analyzing Vocal Patterns...');
        setStreamStatus(streamVoice, 'CONNECTING...');
        progressBar.style.width = '55%';

        await wait(2000);
        if (aborted) return;
        setStreamStatus(streamVoice, 'ONLINE');
        progressBar.style.width = '67%';

        await wait(2000);
        if (aborted) return;
        progressBar.style.width = '72%';

        // Phase 4: Baseline (11-14s)
        setPhaseText('Establishing Baseline...');
        progressBar.style.width = '78%';

        await wait(3000);
        if (aborted) return;
        progressBar.style.width = '92%';

        // Phase 5: Complete (14-18s)
        setPhaseText('Calibration Complete');
        progressBar.style.width = '100%';

        await wait(1500);
        if (aborted) return;

        // Navigate to session
        cleanup();
        navigate('#/session');
    }

    // Skip button
    skipBtn.addEventListener('click', () => {
        cleanup();
        navigate('#/session');
    });

    // Start
    runCalibration();

    // Cleanup function
    function cleanup() {
        aborted = true;
        biometricEngine.stop();
        biometricVisualizer.destroy();
    }

    _cleanup = cleanup;
    return cleanup;
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
