/**
 * Medical Scenario Engine
 * G.R.I.P. Platform — generates complete medical scenarios for sessions.
 * @module scenario/medical/medical-scenarios
 */

import { CONDITIONS_DB, getConditionById, getConditionsByDifficulty, getConditionsByCategory } from './conditions-db.js';
import { SYMPTOMS_DB, getSymptomsByCondition } from './symptoms-db.js';
import { generatePatient } from './patient-generator.js';
import { getRandomStem } from '../scenario-templates.js';
import { randomChoice, shuffle, randomInt } from '../../utils/random.js';

let scenarioCounter = 0;

export class MedicalScenarioEngine {
    constructor() {
        this._seenThisSession = new Set();
    }

    /**
     * Generate a complete scenario at the given difficulty.
     * @param {number} difficulty - 1–10
     * @param {string[]} seenConditions - condition IDs already seen this session
     * @returns {Object} Complete scenario object
     */
    generateScenario(difficulty, seenConditions = []) {
        scenarioCounter++;
        const seenSet = new Set([...seenConditions, ...this._seenThisSession]);

        // Pick a condition appropriate for this difficulty, not yet seen
        const candidates = getConditionsByDifficulty(difficulty)
            .filter(c => !seenSet.has(c.id));

        // Fallback: if no unseen candidates, allow repeats
        const pool = candidates.length > 0 ? candidates : getConditionsByDifficulty(difficulty);
        const condition = randomChoice(pool);
        if (!condition) return this._fallbackScenario(difficulty);

        this._seenThisSession.add(condition.id);

        // Generate patient presentation
        const patient = generatePatient(condition.id, difficulty);

        // Choose question type
        const questionTypes = ['diagnosis', 'management', 'investigation'];
        const weights = difficulty <= 4 ? [0.6, 0.2, 0.2] : difficulty <= 7 ? [0.35, 0.35, 0.3] : [0.25, 0.4, 0.35];
        const type = weightedPick(questionTypes, weights);

        // Generate stem
        const stem = getRandomStem(type);

        // Generate answer options
        const { options, correctIndex } = this._generateOptions(condition, type, difficulty);

        // Time limit based on difficulty
        const timeLimit = difficulty <= 3 ? 45000 : difficulty <= 6 ? 35000 : difficulty <= 8 ? 25000 : 20000;

        // Generate explanation
        const explanation = this._generateExplanation(condition, type, options[correctIndex]);

        return {
            id: `med-${scenarioCounter}`,
            conditionId: condition.id,
            difficulty,
            type,
            patient,
            patientInfo: {
                age: String(patient.age),
                sex: patient.sex,
                chiefComplaint: patient.chiefComplaint,
                history: patient.history,
            },
            vitalSigns: patient.vitalSigns ? {
                hr: String(patient.vitalSigns.hr),
                bp: `${patient.vitalSigns.bp?.systolic || 120}/${patient.vitalSigns.bp?.diastolic || 80}`,
                temp: `${patient.vitalSigns.temp || 37.0}°C`,
                rr: String(patient.vitalSigns.rr || 16),
                spo2: `${patient.vitalSigns.spo2 || 98}%`,
            } : { hr: '80', bp: '120/80', temp: '37.0°C', rr: '16', spo2: '98%' },
            stem,
            options: options.map((text, i) => ({ text, isCorrect: i === correctIndex })),
            correctIndex,
            explanation,
            timeLimit,
        };
    }

    /**
     * Generate 4 answer options with 1 correct and 3 distractors.
     */
    _generateOptions(condition, type, difficulty) {
        if (type === 'diagnosis') {
            return this._generateDiagnosisOptions(condition, difficulty);
        } else if (type === 'management') {
            return this._generateManagementOptions(condition, difficulty);
        } else {
            return this._generateInvestigationOptions(condition, difficulty);
        }
    }

    _generateDiagnosisOptions(condition, difficulty) {
        const correct = condition.name;
        const distractors = [];

        // Pull from differential diagnoses
        if (condition.differentialDiagnoses) {
            for (const ddId of condition.differentialDiagnoses) {
                const dd = getConditionById(ddId);
                if (dd && dd.name !== correct) distractors.push(dd.name);
                if (distractors.length >= 5) break;
            }
        }

        // Fill from same category if needed
        if (distractors.length < 3) {
            const sameCat = getConditionsByCategory(condition.category)
                .filter(c => c.name !== correct && !distractors.includes(c.name));
            for (const c of sameCat) {
                distractors.push(c.name);
                if (distractors.length >= 5) break;
            }
        }

        // Fill from any conditions if still needed
        if (distractors.length < 3) {
            for (const c of CONDITIONS_DB) {
                if (c.name !== correct && !distractors.includes(c.name)) {
                    distractors.push(c.name);
                    if (distractors.length >= 5) break;
                }
            }
        }

        // At higher difficulty, pick closer distractors (earlier in the list)
        const picked = difficulty >= 7 ? distractors.slice(0, 3) : shuffle([...distractors]).slice(0, 3);

        const options = [correct, ...picked];
        const shuffled = shuffle([...options]);
        const correctIndex = shuffled.indexOf(correct);

        return { options: shuffled, correctIndex };
    }

    _generateManagementOptions(condition, difficulty) {
        const managementMap = {
            'emergent': [
                'Immediate surgical intervention', 'IV thrombolytics', 'Emergent intubation',
                'Chest tube insertion', 'IV epinephrine', 'Emergent decompression',
                'Cardiac catheterization', 'Massive transfusion protocol',
            ],
            'urgent': [
                'IV antibiotics', 'IV fluids and electrolyte correction', 'Anticoagulation therapy',
                'Urgent surgical consultation', 'IV corticosteroids', 'Blood transfusion',
                'NPO and nasogastric decompression', 'IV insulin drip',
            ],
            'routine': [
                'Oral antibiotics', 'Lifestyle modifications and follow-up', 'Outpatient referral',
                'Physical therapy', 'Medication adjustment', 'Watchful waiting with serial exams',
                'Dietary counseling', 'Stress management and reassurance',
            ],
        };

        const urgency = condition.urgency || 'urgent';
        const correctPool = managementMap[urgency] || managementMap['urgent'];
        const correct = randomChoice(correctPool);

        // Distractors from other urgency levels
        const allManagement = [...managementMap.emergent, ...managementMap.urgent, ...managementMap.routine]
            .filter(m => m !== correct);
        const distractors = shuffle(allManagement).slice(0, 3);

        const options = shuffle([correct, ...distractors]);
        const correctIndex = options.indexOf(correct);
        return { options, correctIndex };
    }

    _generateInvestigationOptions(condition, difficulty) {
        const investigationsByCategory = {
            cardiovascular: ['ECG', 'Troponin levels', 'Echocardiogram', 'CT angiography', 'Chest X-ray', 'BNP level', 'Cardiac MRI', 'Stress test'],
            respiratory: ['Chest X-ray', 'CT chest', 'Pulmonary function tests', 'ABG', 'D-dimer', 'Sputum culture', 'Bronchoscopy', 'V/Q scan'],
            neurological: ['CT head', 'MRI brain', 'Lumbar puncture', 'EEG', 'Nerve conduction studies', 'CT angiography head/neck', 'Carotid ultrasound', 'MRA'],
            gastrointestinal: ['CT abdomen/pelvis', 'Abdominal ultrasound', 'Upper endoscopy', 'Lipase level', 'Liver function tests', 'HIDA scan', 'Colonoscopy', 'KUB X-ray'],
            endocrine: ['Blood glucose', 'HbA1c', 'TSH', 'Serum cortisol', 'Basic metabolic panel', 'Urinary catecholamines', 'Free T4', 'ACTH stimulation test'],
            infectious: ['Blood cultures', 'CBC with differential', 'Procalcitonin', 'Urinalysis', 'Lactate level', 'CRP', 'Wound culture', 'CSF analysis'],
            renal: ['BMP/Creatinine', 'Urinalysis', 'Renal ultrasound', 'CT abdomen without contrast', 'Urine culture', 'GFR calculation', '24-hour urine protein', 'Renal biopsy'],
            musculoskeletal: ['Compartment pressure measurement', 'MRI of affected area', 'Joint aspiration', 'X-ray', 'ESR/CRP', 'Blood cultures', 'Bone scan', 'CT with contrast'],
            hematologic: ['CBC with smear', 'PT/INR/PTT', 'Fibrinogen', 'D-dimer', 'LDH', 'Haptoglobin', 'Hemoglobin electrophoresis', 'Peripheral blood smear'],
            psychiatric: ['Serum drug levels', 'CK level', 'Core temperature', 'Comprehensive metabolic panel', 'Urine drug screen', 'TSH', 'CT head', 'Serotonin level'],
        };

        const catInvestigations = investigationsByCategory[condition.category] || investigationsByCategory['infectious'];
        const correct = randomChoice(catInvestigations.slice(0, 3)); // Most relevant are first

        // Distractors from other categories
        const otherCats = Object.keys(investigationsByCategory).filter(c => c !== condition.category);
        const distractorPool = [];
        for (const cat of otherCats) {
            distractorPool.push(...investigationsByCategory[cat]);
        }
        const distractors = shuffle(distractorPool.filter(i => i !== correct)).slice(0, 3);

        const options = shuffle([correct, ...distractors]);
        const correctIndex = options.indexOf(correct);
        return { options, correctIndex };
    }

    _generateExplanation(condition, type, correctAnswer) {
        if (type === 'diagnosis') {
            return `${condition.name} is the correct diagnosis based on the clinical presentation. Key features include the combination of symptoms and vital sign abnormalities characteristic of this condition.`;
        } else if (type === 'management') {
            return `For ${condition.name}, the most appropriate management is "${correctAnswer}" given the urgency (${condition.urgency || 'urgent'}) and clinical stability of the patient.`;
        } else {
            return `The most helpful investigation for suspected ${condition.name} is "${correctAnswer}" as it provides the most diagnostic information in this clinical context.`;
        }
    }

    _fallbackScenario(difficulty) {
        return {
            id: `med-fallback-${scenarioCounter}`,
            conditionId: 'generic',
            difficulty,
            type: 'diagnosis',
            patient: { name: 'John Smith', age: 55, sex: 'Male', chiefComplaint: 'Chest pain for 2 hours', history: 'HTN, DM, Hyperlipidemia' },
            patientInfo: { age: '55', sex: 'Male', chiefComplaint: 'Chest pain for 2 hours', history: 'HTN, DM, Hyperlipidemia' },
            vitalSigns: { hr: '95', bp: '150/90', temp: '37.0°C', rr: '20', spo2: '96%' },
            stem: 'What is the most likely diagnosis?',
            options: [
                { text: 'Acute Myocardial Infarction', isCorrect: true },
                { text: 'Gastroesophageal Reflux', isCorrect: false },
                { text: 'Costochondritis', isCorrect: false },
                { text: 'Pulmonary Embolism', isCorrect: false },
            ],
            correctIndex: 0,
            explanation: 'Given the risk factors and presentation, acute MI is most likely.',
            timeLimit: 35000,
        };
    }
}

/**
 * Weighted random pick from an array.
 */
function weightedPick(items, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r <= 0) return items[i];
    }
    return items[items.length - 1];
}
