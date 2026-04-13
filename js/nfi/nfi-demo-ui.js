/**
 * NFI Equation Demo UI
 * G.R.I.P. Platform — animated NFI equation walkthrough (Part 2 of Live Demo)
 * @module nfi/nfi-demo-ui
 */

import { createElement } from '../ui/components.js';
import { navigate } from '../router.js';

/* ---- Simulation constants ---- */
const NFI_WEIGHTS = { neural: 0.35, focus: 0.25, vocal: 0.15, response: 0.25 };

/**
 * Pre-scripted 38-second simulated rehab session.
 * Each phase drives the animated biometric values.
 */
const PHASES = [
  { name: 'Calibrating',       duration: 4000, vocal: 0.5, gaze: 0.5, tremor: 0.8, rt: 650, mei: 0.02, beta: 0.10 },
  { name: 'Baseline',          duration: 6000, vocal: 0.6, gaze: 0.6, tremor: 0.7, rt: 580, mei: 0.04, beta: 0.15 },
  { name: 'Active Training',   duration: 8000, vocal: 0.75, gaze: 0.78, tremor: 0.5, rt: 480, mei: 0.08, beta: 0.35 },
  { name: 'Peak Performance',  duration: 8000, vocal: 0.88, gaze: 0.92, tremor: 0.3, rt: 380, mei: 0.14, beta: 0.55 },
  { name: 'Fatigue Onset',     duration: 6000, vocal: 0.7, gaze: 0.7, tremor: 0.55, rt: 520, mei: 0.06, beta: 0.30 },
  { name: 'Recovery',          duration: 6000, vocal: 0.82, gaze: 0.85, tremor: 0.35, rt: 410, mei: 0.11, beta: 0.48 },
];

const TOTAL_DURATION = PHASES.reduce((s, p) => s + p.duration, 0);

/**
 * Render the NFI equation demo page.
 * @param {HTMLElement} container
 * @returns {Function} Cleanup function.
 */
export function renderNFIDemoPage(container) {
  _injectDemoStyles();

  const page = createElement('div', { className: 'nfi-demo-page' });

  // Title
  page.appendChild(createElement('h1', { className: 'nfi-demo-title' }, ['NFI Equation Analysis']));
  page.appendChild(createElement('p', { className: 'nfi-demo-subtitle' }, [
    'Real-time Neuroplastic Fitness Index computation'
  ]));

  // Equation display
  const eqSection = createElement('div', { className: 'nfi-demo-equation' });
  eqSection.innerHTML = `
    <div class="eq-line">
      <span class="eq-label">NFI</span>
      <span class="eq-operator">=</span>
      <span class="eq-bracket">[</span>
      <span class="eq-term" id="eq-vocal">Vocal</span>
      <span class="eq-operator">&times;</span>
      <span class="eq-term" id="eq-gaze">Gaze</span>
      <span class="eq-bracket">]</span>
      <span class="eq-operator">/</span>
      <span class="eq-bracket">[</span>
      <span class="eq-term" id="eq-tremor">Tremor</span>
      <span class="eq-operator">&times;</span>
      <span class="eq-term" id="eq-rt">RT</span>
      <span class="eq-bracket">]</span>
      <span class="eq-operator">&times;</span>
      <span class="eq-bracket">(</span>
      <span class="eq-term" id="eq-entropy">S<sub>e</sub></span>
      <span class="eq-operator">/</span>
      <span class="eq-term" id="eq-power">P<sub>t</sub></span>
      <span class="eq-bracket">)</span>
    </div>
  `;
  page.appendChild(eqSection);

  // Phase indicator
  const phaseEl = createElement('div', { className: 'nfi-demo-phase' }, ['Initializing...']);
  phaseEl.id = 'nfi-demo-phase';
  page.appendChild(phaseEl);

  // Live values grid
  const valuesGrid = createElement('div', { className: 'nfi-demo-values' });
  const metrics = [
    { id: 'v-vocal',   label: 'Vocal Quality' },
    { id: 'v-gaze',    label: 'Gaze Accuracy' },
    { id: 'v-tremor',  label: 'Tremor' },
    { id: 'v-rt',      label: 'Reaction Time' },
    { id: 'v-mei',     label: 'MEI (Se/Pt)' },
    { id: 'v-beta',    label: 'Beta Suppress' },
  ];
  for (const m of metrics) {
    const card = createElement('div', { className: 'nfi-value-card' }, [
      createElement('div', { className: 'nfi-value-number', id: m.id }, ['--']),
      createElement('div', { className: 'nfi-value-label' }, [m.label]),
    ]);
    valuesGrid.appendChild(card);
  }
  page.appendChild(valuesGrid);

  // NFI Score big display
  const scoreSection = createElement('div', { className: 'nfi-demo-score-section' });
  const scoreBig = createElement('div', { className: 'nfi-demo-score', id: 'nfi-score-big' }, ['0']);
  const scoreLabel = createElement('div', { className: 'nfi-demo-score-label' }, ['Composite NFI']);
  scoreSection.appendChild(scoreBig);
  scoreSection.appendChild(scoreLabel);
  page.appendChild(scoreSection);

  // NFI component bars
  const barsSection = createElement('div', { className: 'nfi-demo-bars' });
  const barDefs = [
    { id: 'bar-neural',   label: 'Neural Efficiency', weight: '35%' },
    { id: 'bar-focus',    label: 'Focus Stability',   weight: '25%' },
    { id: 'bar-vocal',    label: 'Vocal Calm',        weight: '15%' },
    { id: 'bar-response', label: 'Response Quality',  weight: '25%' },
  ];
  for (const b of barDefs) {
    const row = createElement('div', { className: 'nfi-bar-row' }, [
      createElement('div', { className: 'nfi-bar-info' }, [
        createElement('span', {}, [`${b.label} (${b.weight})`]),
        createElement('span', { className: 'nfi-bar-val', id: `${b.id}-val` }, ['0']),
      ]),
      createElement('div', { className: 'nfi-bar-track' }, [
        createElement('div', { className: 'nfi-bar-fill', id: `${b.id}-fill` }),
      ]),
    ]);
    barsSection.appendChild(row);
  }
  page.appendChild(barsSection);

  // Progress bar
  const progressWrap = createElement('div', { className: 'nfi-demo-progress-wrap' }, [
    createElement('div', { className: 'nfi-demo-progress-bar', id: 'nfi-demo-progress' }),
  ]);
  page.appendChild(progressWrap);

  // Buttons
  const btnRow = createElement('div', { className: 'nfi-demo-btn-row' });
  const restartBtn = createElement('button', {
    className: 'btn-nfi-demo-action',
    onclick: () => { stopSim(); startSim(); }
  }, ['Restart']);
  const backBtn = createElement('button', {
    className: 'btn-nfi-demo-secondary',
    onclick: () => navigate('#/results')
  }, ['Back to Results']);
  const dashBtn = createElement('button', {
    className: 'btn-nfi-demo-secondary',
    onclick: () => navigate('#/dashboard')
  }, ['Dashboard']);
  btnRow.appendChild(restartBtn);
  btnRow.appendChild(backBtn);
  btnRow.appendChild(dashBtn);
  page.appendChild(btnRow);

  container.appendChild(page);

  // ── Simulation engine ──
  let animFrame = null;
  let startTime = null;
  let running = false;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  function getPhaseValues(elapsed) {
    let acc = 0;
    for (let i = 0; i < PHASES.length; i++) {
      const p = PHASES[i];
      if (elapsed < acc + p.duration) {
        const next = PHASES[Math.min(i + 1, PHASES.length - 1)];
        const t = clamp01((elapsed - acc) / p.duration);
        const smooth = t * t * (3 - 2 * t); // smoothstep
        return {
          phase: p.name,
          vocal:  lerp(p.vocal, next.vocal, smooth),
          gaze:   lerp(p.gaze, next.gaze, smooth),
          tremor: lerp(p.tremor, next.tremor, smooth),
          rt:     lerp(p.rt, next.rt, smooth),
          mei:    lerp(p.mei, next.mei, smooth),
          beta:   lerp(p.beta, next.beta, smooth),
          progress: (acc + elapsed - acc) / TOTAL_DURATION,
        };
      }
      acc += p.duration;
    }
    const last = PHASES[PHASES.length - 1];
    return { phase: last.name, ...last, progress: 1 };
  }

  function computeNFI(v) {
    const multimodalRatio = (v.vocal * v.gaze) / Math.max(v.tremor * (v.rt / 1000), 1e-6);
    const nfiRaw = multimodalRatio * v.mei;
    // Normalize: sigmoid centered around typical raw (~0.03)
    const ratio = nfiRaw / 0.03;
    let score = 100 / (1 + Math.exp(-2.5 * (ratio - 1)));
    // Blend with beta suppression bonus
    score = score * 0.75 + (v.beta * 100) * 0.25;
    return Math.max(0, Math.min(100, score));
  }

  function barColor(val) {
    if (val >= 70) return 'var(--accent-green, #00e676)';
    if (val >= 45) return 'var(--accent-cyan, #00e5ff)';
    if (val >= 25) return 'var(--accent-yellow, #ffd600)';
    return 'var(--accent-red, #ff1744)';
  }

  function tick(ts) {
    if (!running) return;
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;

    if (elapsed >= TOTAL_DURATION) {
      running = false;
      const finalPhase = document.getElementById('nfi-demo-phase');
      if (finalPhase) finalPhase.textContent = 'Session Complete';
      return;
    }

    const v = getPhaseValues(elapsed);
    const nfi = computeNFI(v);

    // Update equation term highlights
    highlightTerm('eq-vocal', v.vocal, 0.7);
    highlightTerm('eq-gaze', v.gaze, 0.7);
    highlightTerm('eq-tremor', v.tremor, 0.5, true);
    highlightTerm('eq-rt', v.rt / 1000, 0.5, true);
    highlightTerm('eq-entropy', v.mei * 10, 0.5);
    highlightTerm('eq-power', 1, 0.5);

    // Update live values
    setText('v-vocal',  v.vocal.toFixed(2));
    setText('v-gaze',   v.gaze.toFixed(2));
    setText('v-tremor', v.tremor.toFixed(2));
    setText('v-rt',     `${Math.round(v.rt)}ms`);
    setText('v-mei',    v.mei.toFixed(4));
    setText('v-beta',   `${(v.beta * 100).toFixed(0)}%`);

    // Update phase
    setText('nfi-demo-phase', v.phase);

    // Update score
    const scoreEl = document.getElementById('nfi-score-big');
    if (scoreEl) {
      scoreEl.textContent = Math.round(nfi);
      scoreEl.style.color = nfi >= 60 ? '#00e676' : nfi >= 40 ? '#00e5ff' : '#ff9100';
      scoreEl.style.textShadow = `0 0 30px ${nfi >= 60 ? 'rgba(0,230,118,0.5)' : nfi >= 40 ? 'rgba(0,229,255,0.4)' : 'rgba(255,145,0,0.4)'}`;
    }

    // Sub-score bars (simulated from components)
    const neuralScore = Math.min(100, nfi * 1.05 + (v.beta * 15));
    const focusScore = Math.min(100, nfi * 0.9 + (1 - v.tremor) * 20);
    const vocalScore = Math.min(100, v.vocal * 100);
    const responseScore = Math.min(100, Math.max(0, 100 - (v.rt - 300) / 4));

    updateBar('bar-neural', neuralScore);
    updateBar('bar-focus', focusScore);
    updateBar('bar-vocal', vocalScore);
    updateBar('bar-response', responseScore);

    // Progress
    const progressEl = document.getElementById('nfi-demo-progress');
    if (progressEl) progressEl.style.width = `${(elapsed / TOTAL_DURATION) * 100}%`;

    animFrame = requestAnimationFrame(tick);
  }

  function highlightTerm(id, value, threshold, invert = false) {
    const el = document.getElementById(id);
    if (!el) return;
    const good = invert ? value < threshold : value > threshold;
    el.style.color = good ? '#00e676' : '#ff9100';
    el.style.textShadow = good ? '0 0 8px rgba(0,230,118,0.6)' : '0 0 8px rgba(255,145,0,0.5)';
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function updateBar(id, value) {
    const fill = document.getElementById(`${id}-fill`);
    const val = document.getElementById(`${id}-val`);
    if (fill) {
      fill.style.width = `${Math.round(value)}%`;
      fill.style.background = barColor(value);
    }
    if (val) val.textContent = Math.round(value);
  }

  function startSim() {
    startTime = null;
    running = true;
    animFrame = requestAnimationFrame(tick);
  }

  function stopSim() {
    running = false;
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
  }

  // Auto-start
  startSim();

  return function cleanup() {
    stopSim();
  };
}


/**
 * Inject NFI demo styles (idempotent).
 * @private
 */
function _injectDemoStyles() {
  if (document.getElementById('grip-nfi-demo-style')) return;
  const style = document.createElement('style');
  style.id = 'grip-nfi-demo-style';
  style.textContent = `
    .nfi-demo-page {
      max-width: 740px;
      margin: 0 auto;
      padding: 2rem 1rem;
      text-align: center;
    }

    .nfi-demo-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #fff;
      margin: 0 0 0.5rem 0;
    }

    .nfi-demo-subtitle {
      color: #a0a0b8;
      font-size: 0.9rem;
      margin: 0 0 2rem 0;
    }

    /* ── Equation display ── */
    .nfi-demo-equation {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
      overflow-x: auto;
    }

    .eq-line {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.4rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.1rem;
    }

    .eq-label {
      font-weight: 700;
      color: #00e5ff;
      font-size: 1.3rem;
    }

    .eq-operator {
      color: #666;
      font-weight: 400;
    }

    .eq-bracket {
      color: #555;
      font-size: 1.3rem;
    }

    .eq-term {
      color: #a0a0b8;
      transition: color 0.3s, text-shadow 0.3s;
      font-weight: 500;
    }

    /* ── Phase indicator ── */
    .nfi-demo-phase {
      font-size: 0.85rem;
      font-weight: 600;
      color: #00e5ff;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 1.5rem;
    }

    /* ── Values grid ── */
    .nfi-demo-values {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 500px) {
      .nfi-demo-values {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .nfi-value-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      padding: 0.75rem 0.5rem;
    }

    .nfi-value-number {
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.25rem;
      font-weight: 600;
      color: #fff;
    }

    .nfi-value-label {
      font-size: 0.7rem;
      color: #a0a0b8;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-top: 0.25rem;
    }

    /* ── Big NFI score ── */
    .nfi-demo-score-section {
      margin-bottom: 2rem;
    }

    .nfi-demo-score {
      font-size: 4.5rem;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
      color: #00e5ff;
      line-height: 1;
      transition: color 0.4s, text-shadow 0.4s;
      text-shadow: 0 0 30px rgba(0,229,255,0.4);
    }

    .nfi-demo-score-label {
      font-size: 0.8rem;
      color: #a0a0b8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 0.5rem;
    }

    /* ── Component bars ── */
    .nfi-demo-bars {
      text-align: left;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .nfi-bar-row {
      margin-bottom: 0.75rem;
    }

    .nfi-bar-row:last-child {
      margin-bottom: 0;
    }

    .nfi-bar-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #a0a0b8;
      margin-bottom: 0.3rem;
    }

    .nfi-bar-val {
      font-family: 'JetBrains Mono', monospace;
      color: #fff;
    }

    .nfi-bar-track {
      height: 6px;
      background: rgba(255,255,255,0.06);
      border-radius: 3px;
      overflow: hidden;
    }

    .nfi-bar-fill {
      height: 100%;
      width: 0%;
      border-radius: 3px;
      background: #00e5ff;
      transition: width 0.3s ease, background 0.3s ease;
    }

    /* ── Progress ── */
    .nfi-demo-progress-wrap {
      height: 4px;
      background: rgba(255,255,255,0.06);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 2rem;
    }

    .nfi-demo-progress-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #00e5ff, #00e676);
      transition: width 0.2s linear;
    }

    /* ── Buttons ── */
    .nfi-demo-btn-row {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-nfi-demo-action {
      padding: 0.75rem 2rem;
      font-size: 0.95rem;
      font-weight: 600;
      color: #111;
      background: #00e5ff;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      transition: background 0.2s, box-shadow 0.2s;
    }

    .btn-nfi-demo-action:hover {
      background: #33ebff;
      box-shadow: 0 0 20px rgba(0,229,255,0.3);
    }

    .btn-nfi-demo-secondary {
      padding: 0.75rem 1.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: #00e5ff;
      background: transparent;
      border: 2px solid rgba(0,229,255,0.3);
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }

    .btn-nfi-demo-secondary:hover {
      background: rgba(0,229,255,0.08);
      border-color: #00e5ff;
    }
  `;
  document.head.appendChild(style);
}
