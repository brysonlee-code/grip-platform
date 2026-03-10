/**
 * Session and Scenario Timers
 * G.R.I.P. Platform — provides count-up/count-down timers for session and scenario pacing
 * @module session/timer
 */

/**
 * General-purpose session timer. Supports both count-up (no duration) and
 * count-down (duration provided) modes with pause/resume capability.
 */
export class SessionTimer {

    /**
     * @param {function({ elapsed: number, remaining: number|null }): void} [onTick]
     *   Called every second with elapsed and remaining (null if counting up).
     */
    constructor(onTick) {
        /** @type {Function|null} */
        this._onTick = onTick || null;

        /** @type {number|null} Duration in ms, or null for count-up mode. */
        this._duration = null;

        /** @type {number} Accumulated elapsed time in ms before current run segment. */
        this._accumulated = 0;

        /** @type {number|null} Timestamp when the current run segment started. */
        this._runStart = null;

        /** @type {number|null} Interval ID for the tick loop. */
        this._intervalId = null;

        /** @type {boolean} */
        this._running = false;

        /** @type {boolean} */
        this._paused = false;
    }

    /**
     * Start the timer.
     * @param {number} [durationMs] - If provided, timer counts down from this value.
     *   Otherwise it counts up indefinitely.
     */
    start(durationMs) {
        this.stop();
        this._duration = durationMs != null ? durationMs : null;
        this._accumulated = 0;
        this._runStart = Date.now();
        this._running = true;
        this._paused = false;
        this._startTicking();
    }

    /**
     * Pause the timer, preserving elapsed time.
     */
    pause() {
        if (!this._running || this._paused) return;
        this._accumulated += Date.now() - this._runStart;
        this._runStart = null;
        this._paused = true;
        this._stopTicking();
    }

    /**
     * Resume the timer after a pause.
     */
    resume() {
        if (!this._running || !this._paused) return;
        this._runStart = Date.now();
        this._paused = false;
        this._startTicking();
    }

    /**
     * Stop the timer and return the total elapsed time.
     * @returns {number} Total elapsed time in milliseconds.
     */
    stop() {
        const elapsed = this.getElapsed();
        this._stopTicking();
        this._running = false;
        this._paused = false;
        this._runStart = null;
        return elapsed;
    }

    /**
     * Get the total elapsed time in milliseconds.
     * @returns {number}
     */
    getElapsed() {
        if (!this._running) return this._accumulated;
        if (this._paused) return this._accumulated;
        return this._accumulated + (Date.now() - this._runStart);
    }

    /**
     * Reset the timer to its initial state.
     */
    reset() {
        this.stop();
        this._accumulated = 0;
        this._duration = null;
    }

    /**
     * Start the tick interval.
     * @private
     */
    _startTicking() {
        if (this._intervalId != null) return;
        this._intervalId = setInterval(() => {
            this._tick();
        }, 1000);
    }

    /**
     * Stop the tick interval.
     * @private
     */
    _stopTicking() {
        if (this._intervalId != null) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    }

    /**
     * Emit a tick event.
     * @private
     */
    _tick() {
        const elapsed = this.getElapsed();
        let remaining = null;

        if (this._duration != null) {
            remaining = Math.max(0, this._duration - elapsed);
            // Auto-stop when countdown reaches zero
            if (remaining <= 0) {
                this.stop();
            }
        }

        if (this._onTick) {
            this._onTick({ elapsed, remaining });
        }
    }
}

/**
 * Scenario-specific countdown timer with progress tracking and expiry callback.
 */
export class ScenarioTimer {

    /**
     * @param {function({ remaining: number, progress: number }): void} [onTick]
     *   Called every 100ms with remaining time and progress (0 = start, 1 = expired).
     * @param {function(): void} [onExpire] - Called once when time runs out.
     */
    constructor(onTick, onExpire) {
        /** @type {Function|null} */
        this._onTick = onTick || null;

        /** @type {Function|null} */
        this._onExpire = onExpire || null;

        /** @type {number} Time limit in ms. */
        this._timeLimit = 0;

        /** @type {number|null} Timestamp when started. */
        this._startTime = null;

        /** @type {number|null} Interval ID. */
        this._intervalId = null;

        /** @type {boolean} */
        this._expired = false;

        /** @type {boolean} */
        this._running = false;
    }

    /**
     * Start the scenario countdown.
     * @param {number} timeLimitMs - Total time allowed in milliseconds.
     */
    start(timeLimitMs) {
        this.stop();
        this._timeLimit = timeLimitMs;
        this._startTime = Date.now();
        this._expired = false;
        this._running = true;

        // Tick at 100ms for smooth progress bar updates
        this._intervalId = setInterval(() => {
            this._tick();
        }, 100);
    }

    /**
     * Get remaining time in milliseconds.
     * @returns {number}
     */
    getRemaining() {
        if (!this._running || this._startTime == null) return this._timeLimit;
        const elapsed = Date.now() - this._startTime;
        return Math.max(0, this._timeLimit - elapsed);
    }

    /**
     * Get progress as a fraction from 0 (just started) to 1 (time expired).
     * @returns {number}
     */
    getProgress() {
        if (!this._running || this._startTime == null || this._timeLimit <= 0) return 0;
        const elapsed = Date.now() - this._startTime;
        return Math.min(1, elapsed / this._timeLimit);
    }

    /**
     * Stop the timer.
     */
    stop() {
        if (this._intervalId != null) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
        this._running = false;
    }

    /**
     * Internal tick handler.
     * @private
     */
    _tick() {
        const remaining = this.getRemaining();
        const progress = this.getProgress();

        if (this._onTick) {
            this._onTick({ remaining, progress });
        }

        if (remaining <= 0 && !this._expired) {
            this._expired = true;
            this.stop();
            if (this._onExpire) {
                this._onExpire();
            }
        }
    }
}
