/**
 * Scenario Question Templates
 * G.R.I.P. Platform — question stem templates for different clinical question types
 * @module scenario/scenario-templates
 */

import { randomChoice } from '../utils/random.js';

/**
 * Diagnosis question stems — ask the trainee to identify the condition.
 * @type {string[]}
 */
export const DIAGNOSIS_STEMS = [
    'What is the most likely diagnosis?',
    'Based on the clinical presentation, which diagnosis is most consistent with these findings?',
    'Which of the following conditions best explains this patient\'s presentation?',
    'What is the most probable diagnosis given the history and examination findings?',
    'Which diagnosis should be highest on the differential for this patient?',
    'The clinical picture is most consistent with which of the following diagnoses?',
    'Given the presenting symptoms and vital signs, what is the most likely diagnosis?',
    'Which condition would best account for this patient\'s symptoms and laboratory findings?',
    'What is the most likely underlying etiology?',
    'Based on the history of present illness and physical examination, the most likely diagnosis is:',
    'This clinical presentation is most characteristic of which condition?',
    'Which of the following diagnoses best unifies this patient\'s presenting complaints?',
];

/**
 * Management question stems — ask the trainee about the next therapeutic step.
 * @type {string[]}
 */
export const MANAGEMENT_STEMS = [
    'What is the most appropriate next step in management?',
    'Which of the following is the best initial treatment for this patient?',
    'What should be the first priority in managing this patient?',
    'Which management approach is most appropriate at this time?',
    'What is the most critical intervention for this patient?',
    'Given the severity of the presentation, what is the most appropriate immediate management?',
    'Which therapeutic intervention should be initiated first?',
    'What is the recommended first-line treatment for this condition?',
    'The most appropriate initial management of this patient includes:',
    'Which of the following management strategies is most appropriate?',
    'After stabilizing the patient, what is the most important next step in management?',
    'What is the definitive treatment for this patient\'s condition?',
];

/**
 * Investigation question stems — ask the trainee which test to order.
 * @type {string[]}
 */
export const INVESTIGATION_STEMS = [
    'Which diagnostic test would be most helpful in confirming the diagnosis?',
    'What is the most appropriate initial investigation?',
    'Which of the following tests should be ordered first?',
    'What investigation would be most useful in establishing the diagnosis?',
    'Which diagnostic study is most likely to confirm the suspected diagnosis?',
    'What is the gold standard diagnostic test for this condition?',
    'Which laboratory or imaging study should be ordered next?',
    'To confirm your clinical suspicion, which test is most appropriate?',
    'What is the single most informative diagnostic test for this presentation?',
    'Which of the following investigations would provide the most diagnostic value?',
    'The most appropriate next diagnostic step is:',
    'Which test would best differentiate between the leading diagnoses on the differential?',
];

/**
 * Get a random question stem for the given question type.
 *
 * @param {'diagnosis'|'management'|'investigation'} type - The question type.
 * @returns {string} A randomly selected question stem.
 */
export function getRandomStem(type) {
    switch (type) {
        case 'diagnosis':
            return randomChoice(DIAGNOSIS_STEMS);
        case 'management':
            return randomChoice(MANAGEMENT_STEMS);
        case 'investigation':
            return randomChoice(INVESTIGATION_STEMS);
        default:
            return randomChoice(DIAGNOSIS_STEMS);
    }
}
