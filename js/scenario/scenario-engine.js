/**
 * Scenario Engine
 * G.R.I.P. Platform — facade over domain-specific scenario generators.
 * @module scenario/scenario-engine
 */

import { MedicalScenarioEngine } from './medical/medical-scenarios.js';

export class ScenarioEngine {
    constructor(domain = 'medical') {
        this._domain = domain;
        this._engines = {
            medical: new MedicalScenarioEngine(),
        };
    }

    generateScenario(difficulty, seenConditions = []) {
        const engine = this._engines[this._domain];
        if (!engine) {
            throw new Error(`Unknown scenario domain: ${this._domain}`);
        }
        return engine.generateScenario(difficulty, seenConditions);
    }

    getDomains() {
        return Object.keys(this._engines);
    }

    setDomain(domain) {
        if (!this._engines[domain]) {
            throw new Error(`Unknown scenario domain: ${domain}`);
        }
        this._domain = domain;
    }
}
