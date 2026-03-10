/**
 * Session State Machine
 * G.R.I.P. Platform — manages session lifecycle states with validated transitions
 * @module session/session-state
 */

/**
 * Valid session states.
 * @enum {string}
 */
export const SessionStates = Object.freeze({
    IDLE:        'IDLE',
    CALIBRATING: 'CALIBRATING',
    ACTIVE:      'ACTIVE',
    PAUSED:      'PAUSED',
    COMPLETING:  'COMPLETING',
    COMPLETE:    'COMPLETE',
});

/**
 * Map of valid transitions from each state.
 * Every state may also transition to IDLE (reset).
 * @type {Record<string, string[]>}
 */
const VALID_TRANSITIONS = Object.freeze({
    [SessionStates.IDLE]:        [SessionStates.CALIBRATING],
    [SessionStates.CALIBRATING]: [SessionStates.ACTIVE],
    [SessionStates.ACTIVE]:      [SessionStates.PAUSED, SessionStates.COMPLETING],
    [SessionStates.PAUSED]:      [SessionStates.ACTIVE, SessionStates.COMPLETING],
    [SessionStates.COMPLETING]:  [SessionStates.COMPLETE],
    [SessionStates.COMPLETE]:    [],
});

/**
 * Manages the session lifecycle as a finite state machine.
 * Enforces valid transitions and notifies listeners on state changes.
 */
export class SessionState {

    constructor() {
        /** @type {string} */
        this._state = SessionStates.IDLE;

        /** @type {Function[]} */
        this._listeners = [];

        /** @type {number|null} */
        this._startTime = null;

        /** @type {number} */
        this._scenarioIndex = 0;

        /** @type {number} */
        this._totalScenarios = 0;

        /** @type {number} */
        this._difficulty = 5;

        /** @type {number} */
        this._elapsedTime = 0;
    }

    /**
     * Attempt a state transition. Throws if the transition is not valid.
     * Any state may transition to IDLE (reset).
     * @param {string} newState - The target state.
     * @throws {Error} If the transition is not allowed.
     */
    transition(newState) {
        if (!Object.values(SessionStates).includes(newState)) {
            throw new Error(`Invalid state: ${newState}`);
        }

        // Any state can transition to IDLE (reset)
        if (newState === SessionStates.IDLE) {
            const previousState = this._state;
            this._state = SessionStates.IDLE;
            this._emitChange(previousState, SessionStates.IDLE);
            return;
        }

        const allowed = VALID_TRANSITIONS[this._state];
        if (!allowed || !allowed.includes(newState)) {
            throw new Error(
                `Invalid transition: ${this._state} → ${newState}. ` +
                `Allowed from ${this._state}: [${(allowed || []).join(', ')}]`
            );
        }

        const previousState = this._state;
        this._state = newState;

        // Track start time when leaving IDLE
        if (previousState === SessionStates.IDLE && newState === SessionStates.CALIBRATING) {
            this._startTime = Date.now();
        }

        this._emitChange(previousState, newState);
    }

    /**
     * Get the current state string.
     * @returns {string}
     */
    getState() {
        return this._state;
    }

    /**
     * Register a callback for state changes.
     * @param {function(string, string): void} callback - Called with (previousState, newState).
     */
    onStateChange(callback) {
        if (typeof callback === 'function') {
            this._listeners.push(callback);
        }
    }

    /**
     * Get a snapshot of all session-level data.
     * @returns {{ state: string, startTime: number|null, scenarioIndex: number, totalScenarios: number, difficulty: number, elapsedTime: number }}
     */
    getData() {
        return {
            state: this._state,
            startTime: this._startTime,
            scenarioIndex: this._scenarioIndex,
            totalScenarios: this._totalScenarios,
            difficulty: this._difficulty,
            elapsedTime: this._elapsedTime,
        };
    }

    /**
     * Update mutable session data fields.
     * @param {Object} updates - Partial data object with fields to update.
     */
    update(updates) {
        if (updates.scenarioIndex !== undefined)  this._scenarioIndex = updates.scenarioIndex;
        if (updates.totalScenarios !== undefined) this._totalScenarios = updates.totalScenarios;
        if (updates.difficulty !== undefined)     this._difficulty = updates.difficulty;
        if (updates.elapsedTime !== undefined)    this._elapsedTime = updates.elapsedTime;
    }

    /**
     * Reset the state machine and all tracked data back to initial values.
     */
    reset() {
        const previousState = this._state;
        this._state = SessionStates.IDLE;
        this._startTime = null;
        this._scenarioIndex = 0;
        this._totalScenarios = 0;
        this._difficulty = 5;
        this._elapsedTime = 0;
        this._listeners = [];

        if (previousState !== SessionStates.IDLE) {
            // No listeners to notify since we cleared them, but keep the pattern
        }
    }

    /**
     * Emit a state change event to all registered listeners.
     * @param {string} previousState
     * @param {string} newState
     * @private
     */
    _emitChange(previousState, newState) {
        for (const listener of this._listeners) {
            try {
                listener(previousState, newState);
            } catch (err) {
                console.error('[SessionState] Listener error:', err);
            }
        }
    }
}
