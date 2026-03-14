/**
 * Patient Generator
 * G.R.I.P. Platform — generates realistic patient presentations for medical scenarios
 * @module scenario/medical/patient-generator
 */

import { getConditionById, CONDITIONS_DB } from './conditions-db.js';
import { SYMPTOMS_DB } from './symptoms-db.js';
import { generateVitals, generateLabs } from './vitals-generator.js';
import { randomChoice, randomInt, randomBetween, shuffle } from '../../utils/random.js';

// ═══════════════════════════════════════════════════════════════
// Name Pools — diverse, multicultural
// ═══════════════════════════════════════════════════════════════

const FIRST_NAMES_MALE = [
    'James', 'Marcus', 'Carlos', 'Hiroshi', 'David', 'Mohammed', 'Robert',
    'Wei', 'Samuel', 'Andrei', 'Thomas', 'Kwame', 'Patrick', 'Raj',
    'Antonio', 'Yusuf', 'Daniel', 'Sergei', 'Lucas', 'Ibrahim',
    'Nathaniel', 'Javier', 'Viktor', 'Kofi', 'Amir', 'Owen',
    'Terrence', 'Giovanni', 'Hassan', 'Chen',
];

const FIRST_NAMES_FEMALE = [
    'Maria', 'Aisha', 'Sarah', 'Yuki', 'Priya', 'Elena', 'Grace',
    'Fatima', 'Jessica', 'Mei', 'Rachel', 'Amara', 'Sophie', 'Olga',
    'Carmen', 'Nadia', 'Emily', 'Chioma', 'Hana', 'Leila',
    'Margaret', 'Valentina', 'Khadija', 'Ingrid', 'Rosa', 'Deborah',
    'Aaliyah', 'Beatrice', 'Sunita', 'Lin',
];

const LAST_NAMES = [
    'Johnson', 'Williams', 'Rodriguez', 'Nakamura', 'Patel', 'Kim', 'Chen',
    'Okafor', 'Martinez', 'Petrov', 'Singh', 'Al-Hassan', 'Thompson',
    'Garcia', 'Osei', 'Ivanova', 'Fernandez', 'Nguyen', 'Dubois',
    'Okamoto', 'Larsson', 'Mwangi', 'Santos', 'Volkov', 'Hoffman',
    'Mensah', 'Park', 'Dubey', 'Morales', 'Fischer', 'Kowalski',
    'Ibrahim', 'Tanaka', 'Reyes', 'Eze', 'Johansson', 'Takahashi',
    'Brown', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Lee', 'Clark',
    'Wright', 'Robinson', 'Walker', 'Young', 'Allen', 'Scott', 'Hill',
];

// ═══════════════════════════════════════════════════════════════
// Chief Complaint Templates
// ═══════════════════════════════════════════════════════════════

const COMPLAINT_TEMPLATES = {
    cardiovascular: [
        '{patient} presents with {duration} of {primary_symptom}',
        '{patient} was brought in by EMS with {primary_symptom} that began {duration} ago',
        '{patient} reports {primary_symptom} that started {onset} while {activity}',
    ],
    respiratory: [
        '{patient} presents with worsening {primary_symptom} over the past {duration}',
        '{patient} reports {duration} of {primary_symptom} and {secondary_symptom}',
        '{patient} was brought in with acute {primary_symptom} that began {duration} ago',
    ],
    neurological: [
        '{patient} presents with sudden onset {primary_symptom} noticed {duration} ago',
        '{patient} was found with {primary_symptom} by family members {duration} ago',
        '{patient} reports {primary_symptom} that started {onset}',
    ],
    gastrointestinal: [
        '{patient} presents with {duration} of {primary_symptom}',
        '{patient} reports {primary_symptom} that started {duration} ago and has been getting worse',
        '{patient} was brought in with {primary_symptom} and {secondary_symptom}',
    ],
    endocrine: [
        '{patient} presents with {primary_symptom} and {secondary_symptom}',
        '{patient} was brought in by EMS with {primary_symptom} that developed over {duration}',
        '{patient} reports progressive {primary_symptom} over the past {duration}',
    ],
    infectious: [
        '{patient} presents with {duration} of {primary_symptom} and {secondary_symptom}',
        '{patient} reports {primary_symptom} that started {duration} ago',
        '{patient} was brought in with worsening {primary_symptom}',
    ],
    renal: [
        '{patient} presents with {primary_symptom} that began {duration} ago',
        '{patient} reports {duration} of {primary_symptom}',
        '{patient} was referred with {primary_symptom} and abnormal lab values',
    ],
    musculoskeletal: [
        '{patient} presents with {primary_symptom} in the {location} following {mechanism}',
        '{patient} reports {duration} of worsening {primary_symptom}',
        '{patient} was brought in with severe {primary_symptom}',
    ],
    psychiatric: [
        '{patient} was brought in by EMS with {primary_symptom} and {secondary_symptom}',
        '{patient} presents with {primary_symptom} that developed over the past {duration}',
        '{patient} reports progressive {primary_symptom}',
    ],
    hematologic: [
        '{patient} presents with {primary_symptom} and {secondary_symptom}',
        '{patient} was referred from clinic for {primary_symptom}',
        '{patient} reports {duration} of {primary_symptom}',
    ],
};

const DURATIONS_ACUTE = ['30 minutes', '1 hour', '2 hours', '3 hours', '4 hours', '6 hours'];
const DURATIONS_SUBACUTE = ['12 hours', '1 day', '2 days', '3 days', '5 days'];
const DURATIONS_CHRONIC = ['1 week', '2 weeks', '3 weeks', '1 month', '6 weeks'];

const ONSETS = ['suddenly', 'gradually', 'acutely', 'while at rest', 'upon awakening'];
const ACTIVITIES = ['at rest', 'watching television', 'climbing stairs', 'at work', 'sleeping', 'eating dinner', 'exercising'];
const LOCATIONS = ['right leg', 'left leg', 'right arm', 'left arm', 'lower back', 'right knee', 'left hip'];
const MECHANISMS = ['a fall', 'a motor vehicle accident', 'heavy lifting', 'repetitive strain', 'a sports injury'];

// ═══════════════════════════════════════════════════════════════
// Medication and allergy pools
// ═══════════════════════════════════════════════════════════════

const COMMON_MEDICATIONS = [
    'Lisinopril 10mg daily', 'Metformin 500mg BID', 'Amlodipine 5mg daily',
    'Atorvastatin 40mg daily', 'Metoprolol 25mg BID', 'Omeprazole 20mg daily',
    'Levothyroxine 75mcg daily', 'Aspirin 81mg daily', 'Hydrochlorothiazide 25mg daily',
    'Sertraline 50mg daily', 'Albuterol inhaler PRN', 'Losartan 50mg daily',
    'Gabapentin 300mg TID', 'Prednisone 5mg daily', 'Warfarin 5mg daily',
    'Furosemide 40mg daily', 'Insulin glargine 20 units at bedtime',
    'Clopidogrel 75mg daily', 'Fluticasone inhaler BID', 'Acetaminophen 500mg PRN',
];

const ALLERGIES = [
    'No known drug allergies', 'Penicillin (rash)', 'Sulfa drugs (hives)',
    'Iodine contrast (anaphylaxis)', 'Codeine (nausea)', 'Morphine (itching)',
    'NSAIDs (GI bleeding)', 'Latex (contact dermatitis)', 'ACE inhibitors (angioedema)',
    'Cephalosporins (rash)', 'Fluoroquinolones (tendon pain)',
];

const SOCIAL_HISTORY_TEMPLATES = [
    { smoking: 'Never smoker', alcohol: 'Social drinker (1-2 drinks/week)', drugs: 'Denies illicit drug use' },
    { smoking: '20 pack-year smoking history, quit 5 years ago', alcohol: 'Rare alcohol use', drugs: 'Denies illicit drug use' },
    { smoking: 'Current smoker, 1 pack/day for 30 years', alcohol: '2-3 beers daily', drugs: 'Denies illicit drug use' },
    { smoking: 'Never smoker', alcohol: 'Denies alcohol use', drugs: 'Denies illicit drug use' },
    { smoking: 'Former smoker, quit 10 years ago', alcohol: '1 glass of wine with dinner', drugs: 'Denies illicit drug use' },
    { smoking: 'Never smoker', alcohol: 'Heavy drinker (6+ drinks daily)', drugs: 'History of IV drug use, currently in recovery' },
    { smoking: 'Current smoker, half pack/day', alcohol: 'Occasional alcohol use', drugs: 'Marijuana use' },
    { smoking: 'Never smoker', alcohol: 'Denies alcohol use', drugs: 'Denies illicit drug use' },
];

// ═══════════════════════════════════════════════════════════════
// Past Medical History
// ═══════════════════════════════════════════════════════════════

const PMH_BY_RISK = {
    'Hypertension': 'Hypertension (diagnosed 8 years ago)',
    'Diabetes': 'Type 2 Diabetes Mellitus (diagnosed 5 years ago, on oral medications)',
    'Smoking': 'Chronic tobacco use',
    'Hyperlipidemia': 'Hyperlipidemia',
    'Obesity': 'Obesity (BMI 34)',
    'COPD': 'COPD (GOLD stage II)',
    'Coronary artery disease': 'Coronary artery disease (prior stent placement)',
    'Atrial fibrillation': 'Atrial fibrillation (on anticoagulation)',
    'Heart failure': 'Heart failure with reduced ejection fraction (EF 35%)',
    'Alcohol use': 'Alcohol use disorder',
    'IV drug use': 'History of IV drug use',
    'Prior stroke/TIA': 'Prior TIA (2 years ago)',
    'HIV': 'HIV (on antiretroviral therapy, CD4 count 450)',
    'Malignancy': 'History of colon cancer (in remission)',
    'CKD': 'Chronic kidney disease stage III',
    'Immunosuppression': 'On immunosuppressive therapy for organ transplant',
    'Sickle cell disease': 'Sickle cell disease (HbSS genotype)',
    'Autoimmune diseases': 'Systemic lupus erythematosus',
};

/**
 * Generate a complete patient presentation for a given condition.
 *
 * @param {string} conditionId - The condition ID from CONDITIONS_DB.
 * @param {number} difficulty  - Difficulty level (1-10). Higher difficulty reduces
 *                                symptom clarity, introduces atypical features, and
 *                                adds misleading information.
 * @returns {Object} Patient object with all clinical details.
 */
export function generatePatient(conditionId, difficulty = 5) {
    const condition = getConditionById(conditionId);
    if (!condition) {
        throw new Error(`Unknown condition ID: ${conditionId}`);
    }

    // ---- Demographics ----
    const age = randomInt(condition.demographics.ageRange[0], condition.demographics.ageRange[1]);
    const sex = determineSex(condition.demographics.sexPredilection);
    const name = generateName(sex);
    const demographics = { age, sex };

    // ---- Severity scaling based on difficulty ----
    // Higher difficulty can mean either very severe or very subtle presentations
    const isAtypical = difficulty >= 7 && Math.random() < 0.4;
    const severity = isAtypical
        ? randomBetween(0.5, 0.8) // atypical cases tend to be subtler
        : randomBetween(0.7, 1.0 + (difficulty / 20));

    // ---- Symptoms ----
    let symptoms;
    let usedVariant = null;
    if (isAtypical && condition.atypicalVariants.length > 0) {
        usedVariant = randomChoice(condition.atypicalVariants);
        symptoms = [...usedVariant.modifiedSymptoms];
        // Mix in some typical symptoms
        const typicalToAdd = Math.max(1, Math.floor((10 - difficulty) / 3));
        const shuffledTypical = shuffle([...condition.typicalSymptoms]);
        for (let i = 0; i < Math.min(typicalToAdd, shuffledTypical.length); i++) {
            if (!symptoms.includes(shuffledTypical[i])) {
                symptoms.push(shuffledTypical[i]);
            }
        }
    } else {
        // Standard presentation
        const numSymptoms = Math.max(2, condition.typicalSymptoms.length - Math.floor(difficulty / 3));
        const shuffled = shuffle([...condition.typicalSymptoms]);
        symptoms = shuffled.slice(0, numSymptoms);
    }

    // ---- Add misleading symptoms for higher difficulty ----
    const misleadingCount = Math.floor(difficulty / 4);
    if (misleadingCount > 0) {
        const misleading = getMisleadingSymptoms(condition, misleadingCount);
        symptoms.push(...misleading);
    }

    // Shuffle final symptom list so the most diagnostic symptom is not always first
    if (difficulty >= 5) {
        shuffle(symptoms);
    }

    // ---- Vital signs ----
    const vitalSigns = generateVitals(condition, severity, demographics);

    // ---- Labs ----
    const labs = generateLabs(condition);

    // ---- Chief complaint ----
    const chiefComplaint = generateChiefComplaint(condition, symptoms, name, age, sex);

    // ---- Medical history ----
    const medications = generateMedications(condition, age);
    const allergies = randomChoice(ALLERGIES);
    const socialHistory = randomChoice(SOCIAL_HISTORY_TEMPLATES);
    const pastMedicalHistory = generatePMH(condition);

    // ---- History of present illness ----
    const history = generateHPI(condition, symptoms, name, age, sex, severity, usedVariant);

    return {
        name,
        age,
        sex,
        chiefComplaint,
        history,
        pastMedicalHistory,
        medications,
        allergies,
        socialHistory,
        vitalSigns,
        symptoms,
        labs,
        _conditionId: conditionId,
        _isAtypical: isAtypical,
        _variant: usedVariant?.description ?? null,
    };
}

// ═══════════════════════════════════════════════════════════════
// Internal Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Determine sex based on predilection.
 * @param {string|null} predilection
 * @returns {'male'|'female'}
 */
function determineSex(predilection) {
    if (predilection === 'male') return Math.random() < 0.7 ? 'male' : 'female';
    if (predilection === 'female') return Math.random() < 0.7 ? 'female' : 'male';
    return Math.random() < 0.5 ? 'male' : 'female';
}

/**
 * Generate a patient name.
 * @param {'male'|'female'} sex
 * @returns {string}
 */
function generateName(sex) {
    const first = sex === 'male' ? randomChoice(FIRST_NAMES_MALE) : randomChoice(FIRST_NAMES_FEMALE);
    const last = randomChoice(LAST_NAMES);
    return `${first} ${last}`;
}

/**
 * Generate a chief complaint string.
 */
function generateChiefComplaint(condition, symptoms, name, age, sex) {
    const templates = COMPLAINT_TEMPLATES[condition.category] || COMPLAINT_TEMPLATES.infectious;
    let template = randomChoice(templates);

    const pronoun = sex === 'male' ? 'Mr.' : 'Ms.';
    const lastName = name.split(' ').pop();
    const patient = `${age}-year-old ${sex} (${pronoun} ${lastName})`;
    const primarySymptom = symptoms[0]?.toLowerCase() ?? 'symptoms';
    const secondarySymptom = symptoms.length > 1 ? symptoms[1].toLowerCase() : 'associated symptoms';

    let duration;
    if (condition.urgency === 'emergent') {
        duration = randomChoice(DURATIONS_ACUTE);
    } else if (condition.urgency === 'urgent') {
        duration = randomChoice(DURATIONS_SUBACUTE);
    } else {
        duration = randomChoice(DURATIONS_CHRONIC);
    }

    template = template
        .replace('{patient}', patient)
        .replace('{primary_symptom}', primarySymptom)
        .replace('{secondary_symptom}', secondarySymptom)
        .replace('{duration}', duration)
        .replace('{onset}', randomChoice(ONSETS))
        .replace('{activity}', randomChoice(ACTIVITIES))
        .replace('{location}', randomChoice(LOCATIONS))
        .replace('{mechanism}', randomChoice(MECHANISMS));

    return template;
}

/**
 * Generate a detailed HPI narrative.
 */
function generateHPI(condition, symptoms, name, age, sex, severity, variant) {
    const pronoun = sex === 'male' ? 'He' : 'She';
    const possessive = sex === 'male' ? 'His' : 'Her';
    const lastName = name.split(' ').pop();

    let duration;
    if (condition.urgency === 'emergent') {
        duration = randomChoice(DURATIONS_ACUTE);
    } else if (condition.urgency === 'urgent') {
        duration = randomChoice(DURATIONS_SUBACUTE);
    } else {
        duration = randomChoice(DURATIONS_CHRONIC);
    }

    const lines = [];

    // Opening
    lines.push(`${pronoun} reports that symptoms began approximately ${duration} ago.`);

    // Primary symptoms
    if (symptoms.length > 0) {
        const primary = symptoms[0];
        lines.push(`The chief concern is ${primary.toLowerCase()}.`);
    }

    // Additional symptoms
    if (symptoms.length > 1) {
        const additional = symptoms.slice(1, 4).map(s => s.toLowerCase());
        if (additional.length === 1) {
            lines.push(`${pronoun} also reports ${additional[0]}.`);
        } else {
            const last = additional.pop();
            lines.push(`${pronoun} also reports ${additional.join(', ')}, and ${last}.`);
        }
    }

    // Severity description
    if (severity > 1.2) {
        lines.push(`${pronoun} describes the symptoms as severe and progressively worsening.`);
    } else if (severity < 0.7) {
        lines.push(`${pronoun} describes the symptoms as mild but persistent.`);
    } else {
        lines.push(`${pronoun} rates the severity as moderate.`);
    }

    // Pertinent negatives (important for clinical reasoning)
    const negatives = getPertinentNegatives(condition);
    if (negatives.length > 0) {
        lines.push(`${pronoun} denies ${negatives.join(', ')}.`);
    }

    // Risk factors
    const relevantRFs = condition.demographics.riskFactors.slice(0, 3);
    if (relevantRFs.length > 0) {
        const rfStr = relevantRFs.map(r => r.toLowerCase()).join(', ');
        lines.push(`${possessive} medical history is notable for ${rfStr}.`);
    }

    // Atypical variant note (subtle clue)
    if (variant) {
        lines.push(`Of note, the presentation is somewhat atypical for this clinical picture.`);
    }

    return lines.join(' ');
}

/**
 * Get pertinent negatives for a condition.
 * @param {Object} condition
 * @returns {string[]}
 */
function getPertinentNegatives(condition) {
    const negMap = {
        cardiovascular: ['recent trauma', 'hemoptysis', 'focal neurological deficits'],
        respiratory: ['chest pain at rest', 'unilateral leg swelling', 'hematemesis'],
        neurological: ['chest pain', 'productive cough', 'abdominal pain'],
        gastrointestinal: ['chest pain', 'dyspnea at rest', 'focal weakness'],
        endocrine: ['focal neurological deficits', 'hemoptysis', 'joint swelling'],
        infectious: ['recent travel', 'recent surgery', 'hemoptysis'],
        renal: ['chest pain', 'hemoptysis', 'neurological deficits'],
        musculoskeletal: ['chest pain', 'dyspnea', 'abdominal pain'],
        psychiatric: ['head trauma', 'focal weakness', 'hemoptysis'],
        hematologic: ['recent surgery', 'focal neurological deficits', 'chest pain'],
    };

    const negs = negMap[condition.category] || ['chest pain', 'dyspnea', 'focal weakness'];
    const count = randomInt(1, Math.min(3, negs.length));
    return shuffle([...negs]).slice(0, count);
}

/**
 * Get misleading symptoms from differential diagnoses.
 * @param {Object} condition
 * @param {number} count
 * @returns {string[]}
 */
function getMisleadingSymptoms(condition, count) {
    const misleading = [];
    const diffIds = (condition.differentialDiagnoses || []).slice(0, 4);

    for (const diffId of diffIds) {
        const diffCondition = getConditionById(diffId);
        if (diffCondition && diffCondition.typicalSymptoms.length > 0) {
            // Pick a symptom from the differential that is NOT in the current condition
            const unique = diffCondition.typicalSymptoms.filter(
                s => !condition.typicalSymptoms.includes(s)
            );
            if (unique.length > 0) {
                misleading.push(randomChoice(unique));
            }
        }
    }

    // Also try to pick from the SYMPTOMS_DB for extra red herrings
    if (misleading.length < count) {
        const catSymptoms = SYMPTOMS_DB.filter(
            s => s.category !== condition.category && s.severity !== 'severe'
        );
        while (misleading.length < count && catSymptoms.length > 0) {
            const idx = randomInt(0, catSymptoms.length - 1);
            const sym = catSymptoms.splice(idx, 1)[0];
            misleading.push(`Mild ${sym.name.toLowerCase()}`);
        }
    }

    return shuffle(misleading).slice(0, count);
}

/**
 * Generate relevant medications based on condition risk factors and age.
 * @param {Object} condition
 * @param {number} age
 * @returns {string[]}
 */
function generateMedications(condition, age) {
    const meds = [];
    const riskFactors = condition.demographics.riskFactors;

    // Add medications related to risk factors
    if (riskFactors.includes('Hypertension')) meds.push(randomChoice(['Lisinopril 10mg daily', 'Amlodipine 5mg daily', 'Losartan 50mg daily']));
    if (riskFactors.includes('Diabetes')) meds.push(randomChoice(['Metformin 500mg BID', 'Insulin glargine 20 units at bedtime']));
    if (riskFactors.includes('Hyperlipidemia') || age > 55) meds.push('Atorvastatin 40mg daily');
    if (riskFactors.includes('COPD') || riskFactors.includes('Asthma')) meds.push('Albuterol inhaler PRN');
    if (riskFactors.includes('Coronary artery disease')) meds.push('Aspirin 81mg daily');
    if (riskFactors.includes('Atrial fibrillation')) meds.push(randomChoice(['Warfarin 5mg daily', 'Apixaban 5mg BID']));
    if (riskFactors.includes('Heart failure')) meds.push('Furosemide 40mg daily');

    // Add 0-2 random extras for realism
    const extraCount = randomInt(0, 2);
    const availableExtras = COMMON_MEDICATIONS.filter(m => !meds.includes(m));
    for (let i = 0; i < extraCount && availableExtras.length > 0; i++) {
        const idx = randomInt(0, availableExtras.length - 1);
        meds.push(availableExtras.splice(idx, 1)[0]);
    }

    return meds.length > 0 ? meds : ['No current medications'];
}

/**
 * Generate past medical history from condition risk factors.
 * @param {Object} condition
 * @returns {string[]}
 */
function generatePMH(condition) {
    const pmh = [];
    const riskFactors = condition.demographics.riskFactors;

    for (const rf of riskFactors) {
        if (PMH_BY_RISK[rf] && Math.random() < 0.6) {
            pmh.push(PMH_BY_RISK[rf]);
        }
    }

    return pmh.length > 0 ? pmh : ['No significant past medical history'];
}
