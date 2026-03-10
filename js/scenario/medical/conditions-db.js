/**
 * Medical Conditions Database
 * G.R.I.P. Platform — comprehensive database of 50+ medical conditions
 * with vitals, labs, demographics, and atypical variants
 * @module scenario/medical/conditions-db
 */

/**
 * @typedef {Object} TypicalVitals
 * @property {[number,number]} hr - Heart rate range [min, max] bpm
 * @property {[number,number]} bp_sys - Systolic BP range [min, max] mmHg
 * @property {[number,number]} bp_dia - Diastolic BP range [min, max] mmHg
 * @property {[number,number]} temp - Temperature range [min, max] °C
 * @property {[number,number]} rr - Respiratory rate range [min, max] breaths/min
 * @property {[number,number]} spo2 - SpO2 range [min, max] %
 */

/**
 * @typedef {Object} LabResult
 * @property {string} test - Lab test name
 * @property {string} value - Expected value or range
 * @property {string} unit - Unit of measurement
 * @property {boolean} abnormal - Whether the result is abnormal
 */

/**
 * @typedef {Object} AtypicalVariant
 * @property {string} description - Description of the atypical presentation
 * @property {string[]} modifiedSymptoms - Symptoms that differ from typical
 * @property {number} probability - Probability of this variant (0-1)
 */

/**
 * @typedef {Object} Condition
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string[]} typicalSymptoms
 * @property {string[]} differentialDiagnoses
 * @property {TypicalVitals} typicalVitals
 * @property {LabResult[]} typicalLabs
 * @property {AtypicalVariant[]} atypicalVariants
 * @property {{ ageRange: [number,number], sexPredilection: string|null, riskFactors: string[] }} demographics
 * @property {'emergent'|'urgent'|'semi-urgent'|'routine'} urgency
 * @property {[number,number]} difficulty
 */

export const CONDITIONS_DB = [
    // ═══════════════════════════════════════════════════════════════
    // CARDIOVASCULAR
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'myocardial_infarction',
        name: 'Acute Myocardial Infarction',
        category: 'cardiovascular',
        typicalSymptoms: [
            'Crushing substernal chest pain radiating to left arm and jaw',
            'Diaphoresis',
            'Nausea and vomiting',
            'Shortness of breath',
            'Anxiety and sense of impending doom',
        ],
        differentialDiagnoses: ['angina', 'pulmonary_embolism', 'aortic_dissection', 'pericarditis', 'costochondritis', 'gerd'],
        typicalVitals: {
            hr: [90, 130],
            bp_sys: [90, 160],
            bp_dia: [60, 100],
            temp: [36.5, 37.5],
            rr: [18, 28],
            spo2: [90, 97],
        },
        typicalLabs: [
            { test: 'Troponin I', value: '2.5-50', unit: 'ng/mL', abnormal: true },
            { test: 'CK-MB', value: '25-200', unit: 'U/L', abnormal: true },
            { test: 'BNP', value: '300-1500', unit: 'pg/mL', abnormal: true },
            { test: 'D-dimer', value: '<0.5', unit: 'mg/L', abnormal: false },
            { test: 'ECG', value: 'ST elevation / depression', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Silent MI — no chest pain, presents with dyspnea and fatigue (common in diabetics and elderly)',
                modifiedSymptoms: ['Fatigue', 'Dyspnea on exertion', 'Epigastric discomfort', 'Dizziness'],
                probability: 0.25,
            },
            {
                description: 'Atypical MI — presents primarily with jaw pain and indigestion',
                modifiedSymptoms: ['Jaw pain', 'Epigastric burning', 'Nausea', 'Mild dyspnea'],
                probability: 0.15,
            },
        ],
        demographics: {
            ageRange: [40, 85],
            sexPredilection: 'male',
            riskFactors: ['Hypertension', 'Diabetes', 'Smoking', 'Hyperlipidemia', 'Family history of CAD', 'Obesity'],
        },
        urgency: 'emergent',
        difficulty: [3, 7],
    },
    {
        id: 'angina',
        name: 'Unstable Angina',
        category: 'cardiovascular',
        typicalSymptoms: [
            'Chest pressure or tightness with exertion or at rest',
            'Pain radiating to left arm or jaw',
            'Shortness of breath',
            'Diaphoresis',
        ],
        differentialDiagnoses: ['myocardial_infarction', 'gerd', 'costochondritis', 'anxiety', 'pericarditis'],
        typicalVitals: {
            hr: [70, 110],
            bp_sys: [130, 180],
            bp_dia: [80, 110],
            temp: [36.5, 37.2],
            rr: [14, 22],
            spo2: [94, 99],
        },
        typicalLabs: [
            { test: 'Troponin I', value: '<0.04', unit: 'ng/mL', abnormal: false },
            { test: 'CK-MB', value: '<25', unit: 'U/L', abnormal: false },
            { test: 'ECG', value: 'ST depression / T-wave inversion', unit: '', abnormal: true },
            { test: 'Lipid panel', value: 'LDL >130', unit: 'mg/dL', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Prinzmetal angina — chest pain at rest, especially early morning, with transient ST elevation',
                modifiedSymptoms: ['Chest pain at rest in early morning', 'Transient ST elevation', 'Syncope'],
                probability: 0.1,
            },
        ],
        demographics: {
            ageRange: [45, 80],
            sexPredilection: 'male',
            riskFactors: ['Hypertension', 'Smoking', 'Diabetes', 'Hyperlipidemia'],
        },
        urgency: 'emergent',
        difficulty: [3, 6],
    },
    {
        id: 'pulmonary_embolism',
        name: 'Pulmonary Embolism',
        category: 'cardiovascular',
        typicalSymptoms: [
            'Sudden onset pleuritic chest pain',
            'Acute dyspnea',
            'Tachycardia',
            'Hemoptysis',
            'Unilateral leg swelling',
        ],
        differentialDiagnoses: ['pneumothorax', 'myocardial_infarction', 'pneumonia', 'aortic_dissection', 'chf'],
        typicalVitals: {
            hr: [100, 140],
            bp_sys: [80, 130],
            bp_dia: [50, 90],
            temp: [36.8, 38.2],
            rr: [22, 36],
            spo2: [82, 94],
        },
        typicalLabs: [
            { test: 'D-dimer', value: '>0.5', unit: 'mg/L', abnormal: true },
            { test: 'Troponin I', value: '0.04-0.5', unit: 'ng/mL', abnormal: true },
            { test: 'BNP', value: '100-500', unit: 'pg/mL', abnormal: true },
            { test: 'ABG', value: 'Respiratory alkalosis, hypoxemia', unit: '', abnormal: true },
            { test: 'CT angiography', value: 'Filling defect in pulmonary arteries', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Saddle PE — presents with syncope and hemodynamic instability without chest pain',
                modifiedSymptoms: ['Syncope', 'Severe hypotension', 'Tachycardia', 'Altered mental status'],
                probability: 0.1,
            },
        ],
        demographics: {
            ageRange: [25, 80],
            sexPredilection: null,
            riskFactors: ['Recent surgery', 'Immobilization', 'Oral contraceptives', 'Malignancy', 'DVT history', 'Obesity'],
        },
        urgency: 'emergent',
        difficulty: [4, 8],
    },
    {
        id: 'dvt',
        name: 'Deep Vein Thrombosis',
        category: 'cardiovascular',
        typicalSymptoms: [
            'Unilateral leg swelling',
            'Calf pain and tenderness',
            'Warmth over affected area',
            'Erythema of affected limb',
            'Positive Homan sign',
        ],
        differentialDiagnoses: ['cellulitis', 'baker_cyst_rupture', 'muscle_strain', 'lymphedema', 'superficial_thrombophlebitis'],
        typicalVitals: {
            hr: [70, 100],
            bp_sys: [110, 140],
            bp_dia: [70, 90],
            temp: [36.5, 37.8],
            rr: [12, 20],
            spo2: [95, 99],
        },
        typicalLabs: [
            { test: 'D-dimer', value: '>0.5', unit: 'mg/L', abnormal: true },
            { test: 'Duplex ultrasound', value: 'Non-compressible vein', unit: '', abnormal: true },
            { test: 'CBC', value: 'Normal or mild leukocytosis', unit: '', abnormal: false },
        ],
        atypicalVariants: [
            {
                description: 'Upper extremity DVT — associated with central lines or thoracic outlet syndrome',
                modifiedSymptoms: ['Arm swelling', 'Arm pain', 'Neck swelling', 'Dilated collateral veins on chest'],
                probability: 0.1,
            },
        ],
        demographics: {
            ageRange: [20, 80],
            sexPredilection: null,
            riskFactors: ['Recent surgery', 'Immobilization', 'Malignancy', 'Oral contraceptives', 'Thrombophilia'],
        },
        urgency: 'urgent',
        difficulty: [2, 5],
    },
    {
        id: 'aortic_dissection',
        name: 'Aortic Dissection',
        category: 'cardiovascular',
        typicalSymptoms: [
            'Sudden tearing chest pain radiating to the back',
            'Unequal blood pressure in both arms',
            'Diaphoresis',
            'Syncope',
            'Pulse deficit',
        ],
        differentialDiagnoses: ['myocardial_infarction', 'pulmonary_embolism', 'pericarditis', 'musculoskeletal_pain', 'pancreatitis'],
        typicalVitals: {
            hr: [80, 130],
            bp_sys: [160, 220],
            bp_dia: [90, 130],
            temp: [36.5, 37.5],
            rr: [18, 28],
            spo2: [90, 98],
        },
        typicalLabs: [
            { test: 'D-dimer', value: '>0.5', unit: 'mg/L', abnormal: true },
            { test: 'CT angiography', value: 'Intimal flap with false lumen', unit: '', abnormal: true },
            { test: 'Troponin I', value: 'Normal or mildly elevated', unit: 'ng/mL', abnormal: false },
            { test: 'CBC', value: 'Possible anemia if hemorrhage', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Type B dissection — presents with abdominal or back pain without chest symptoms',
                modifiedSymptoms: ['Severe back pain', 'Abdominal pain', 'Lower extremity ischemia', 'Renal failure'],
                probability: 0.2,
            },
        ],
        demographics: {
            ageRange: [40, 80],
            sexPredilection: 'male',
            riskFactors: ['Hypertension', 'Marfan syndrome', 'Bicuspid aortic valve', 'Cocaine use', 'Turner syndrome'],
        },
        urgency: 'emergent',
        difficulty: [5, 9],
    },
    {
        id: 'chf',
        name: 'Congestive Heart Failure (Acute Exacerbation)',
        category: 'cardiovascular',
        typicalSymptoms: [
            'Progressive dyspnea on exertion',
            'Orthopnea',
            'Paroxysmal nocturnal dyspnea',
            'Bilateral lower extremity edema',
            'Jugular venous distension',
            'Crackles on lung auscultation',
        ],
        differentialDiagnoses: ['pneumonia', 'copd_exacerbation', 'pulmonary_embolism', 'asthma', 'renal_failure'],
        typicalVitals: {
            hr: [90, 130],
            bp_sys: [100, 180],
            bp_dia: [60, 110],
            temp: [36.3, 37.5],
            rr: [20, 32],
            spo2: [85, 95],
        },
        typicalLabs: [
            { test: 'BNP', value: '>400', unit: 'pg/mL', abnormal: true },
            { test: 'Chest X-ray', value: 'Pulmonary edema, cardiomegaly', unit: '', abnormal: true },
            { test: 'Creatinine', value: '1.2-3.0', unit: 'mg/dL', abnormal: true },
            { test: 'Troponin I', value: 'Normal or mildly elevated', unit: 'ng/mL', abnormal: false },
        ],
        atypicalVariants: [
            {
                description: 'Right-sided heart failure — presents primarily with hepatomegaly, ascites, and peripheral edema without pulmonary congestion',
                modifiedSymptoms: ['Hepatomegaly', 'Ascites', 'Peripheral edema', 'Fatigue', 'Anorexia'],
                probability: 0.15,
            },
        ],
        demographics: {
            ageRange: [50, 90],
            sexPredilection: null,
            riskFactors: ['Coronary artery disease', 'Hypertension', 'Diabetes', 'Valvular disease', 'Alcohol use'],
        },
        urgency: 'emergent',
        difficulty: [3, 6],
    },
    {
        id: 'atrial_fibrillation',
        name: 'Atrial Fibrillation with Rapid Ventricular Response',
        category: 'cardiovascular',
        typicalSymptoms: [
            'Palpitations',
            'Irregularly irregular pulse',
            'Dyspnea',
            'Lightheadedness',
            'Fatigue',
            'Chest discomfort',
        ],
        differentialDiagnoses: ['svt', 'atrial_flutter', 'multifocal_atrial_tachycardia', 'anxiety', 'hyperthyroidism'],
        typicalVitals: {
            hr: [110, 180],
            bp_sys: [90, 160],
            bp_dia: [60, 100],
            temp: [36.5, 37.5],
            rr: [16, 26],
            spo2: [92, 99],
        },
        typicalLabs: [
            { test: 'ECG', value: 'Absent P waves, irregularly irregular QRS', unit: '', abnormal: true },
            { test: 'TSH', value: '0.1-4.0', unit: 'mIU/L', abnormal: false },
            { test: 'Electrolytes', value: 'May show hypokalemia or hypomagnesemia', unit: '', abnormal: true },
            { test: 'BNP', value: '100-500', unit: 'pg/mL', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Asymptomatic AF — discovered incidentally on ECG or detected via stroke workup',
                modifiedSymptoms: ['Incidental finding', 'Mild fatigue', 'Reduced exercise tolerance'],
                probability: 0.2,
            },
        ],
        demographics: {
            ageRange: [55, 90],
            sexPredilection: 'male',
            riskFactors: ['Hypertension', 'Valvular disease', 'Heart failure', 'Obesity', 'Sleep apnea', 'Alcohol use'],
        },
        urgency: 'urgent',
        difficulty: [3, 6],
    },
    {
        id: 'endocarditis',
        name: 'Infective Endocarditis',
        category: 'cardiovascular',
        typicalSymptoms: [
            'Fever and chills',
            'New or changing heart murmur',
            'Janeway lesions on palms and soles',
            'Osler nodes on fingers',
            'Splinter hemorrhages in nails',
            'Fatigue and malaise',
        ],
        differentialDiagnoses: ['rheumatic_fever', 'sle', 'atrial_myxoma', 'bacteremia', 'fever_of_unknown_origin'],
        typicalVitals: {
            hr: [90, 120],
            bp_sys: [100, 140],
            bp_dia: [60, 90],
            temp: [38.5, 40.5],
            rr: [16, 24],
            spo2: [93, 99],
        },
        typicalLabs: [
            { test: 'Blood cultures', value: 'Positive (Staph aureus, Streptococci)', unit: '', abnormal: true },
            { test: 'ESR', value: '>30', unit: 'mm/hr', abnormal: true },
            { test: 'CRP', value: '>10', unit: 'mg/L', abnormal: true },
            { test: 'Echocardiogram', value: 'Vegetations on valves', unit: '', abnormal: true },
            { test: 'CBC', value: 'Leukocytosis, anemia', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Subacute endocarditis — insidious onset with low-grade fever, weight loss, and nonspecific symptoms over weeks',
                modifiedSymptoms: ['Low-grade fever', 'Weight loss', 'Night sweats', 'Arthralgias', 'Splenomegaly'],
                probability: 0.3,
            },
        ],
        demographics: {
            ageRange: [25, 75],
            sexPredilection: 'male',
            riskFactors: ['IV drug use', 'Prosthetic heart valve', 'Structural heart disease', 'Poor dentition', 'Immunosuppression'],
        },
        urgency: 'urgent',
        difficulty: [5, 9],
    },

    // ═══════════════════════════════════════════════════════════════
    // RESPIRATORY
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'pneumonia',
        name: 'Community-Acquired Pneumonia',
        category: 'respiratory',
        typicalSymptoms: [
            'Productive cough with purulent sputum',
            'Fever and chills',
            'Pleuritic chest pain',
            'Dyspnea',
            'Crackles on auscultation',
        ],
        differentialDiagnoses: ['chf', 'pulmonary_embolism', 'lung_cancer', 'tuberculosis', 'copd_exacerbation'],
        typicalVitals: {
            hr: [90, 120],
            bp_sys: [100, 140],
            bp_dia: [60, 90],
            temp: [38.5, 40.5],
            rr: [20, 32],
            spo2: [88, 95],
        },
        typicalLabs: [
            { test: 'WBC', value: '12000-25000', unit: '/uL', abnormal: true },
            { test: 'CRP', value: '>50', unit: 'mg/L', abnormal: true },
            { test: 'Procalcitonin', value: '>0.25', unit: 'ng/mL', abnormal: true },
            { test: 'Chest X-ray', value: 'Lobar consolidation', unit: '', abnormal: true },
            { test: 'Sputum culture', value: 'Strep pneumoniae / H. influenzae', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Atypical pneumonia — dry cough, low-grade fever, extrapulmonary symptoms (Mycoplasma)',
                modifiedSymptoms: ['Dry cough', 'Low-grade fever', 'Headache', 'Myalgias', 'Pharyngitis'],
                probability: 0.3,
            },
        ],
        demographics: {
            ageRange: [18, 90],
            sexPredilection: null,
            riskFactors: ['COPD', 'Smoking', 'Immunosuppression', 'Advanced age', 'Alcoholism'],
        },
        urgency: 'urgent',
        difficulty: [2, 5],
    },
    {
        id: 'copd_exacerbation',
        name: 'COPD Exacerbation',
        category: 'respiratory',
        typicalSymptoms: [
            'Increased dyspnea beyond day-to-day variation',
            'Increased sputum volume and purulence',
            'Worsening cough',
            'Wheezing',
            'Accessory muscle use',
        ],
        differentialDiagnoses: ['pneumonia', 'chf', 'pneumothorax', 'pulmonary_embolism', 'asthma'],
        typicalVitals: {
            hr: [90, 120],
            bp_sys: [130, 170],
            bp_dia: [80, 100],
            temp: [36.5, 38.5],
            rr: [22, 36],
            spo2: [82, 92],
        },
        typicalLabs: [
            { test: 'ABG', value: 'pH 7.25-7.35, PaCO2 50-80 mmHg', unit: '', abnormal: true },
            { test: 'WBC', value: '10000-18000', unit: '/uL', abnormal: true },
            { test: 'Chest X-ray', value: 'Hyperinflation, flattened diaphragms', unit: '', abnormal: true },
            { test: 'BNP', value: '<100', unit: 'pg/mL', abnormal: false },
        ],
        atypicalVariants: [
            {
                description: 'COPD with cor pulmonale — right heart failure with peripheral edema mimicking CHF',
                modifiedSymptoms: ['Peripheral edema', 'Hepatomegaly', 'JVD', 'Severe dyspnea', 'Cyanosis'],
                probability: 0.15,
            },
        ],
        demographics: {
            ageRange: [50, 85],
            sexPredilection: null,
            riskFactors: ['Smoking history', 'Occupational dust exposure', 'Alpha-1 antitrypsin deficiency'],
        },
        urgency: 'urgent',
        difficulty: [2, 5],
    },
    {
        id: 'asthma_exacerbation',
        name: 'Acute Asthma Exacerbation',
        category: 'respiratory',
        typicalSymptoms: [
            'Wheezing',
            'Dyspnea',
            'Chest tightness',
            'Cough, worse at night',
            'Prolonged expiratory phase',
        ],
        differentialDiagnoses: ['copd_exacerbation', 'chf', 'vocal_cord_dysfunction', 'anaphylaxis', 'foreign_body'],
        typicalVitals: {
            hr: [100, 130],
            bp_sys: [120, 160],
            bp_dia: [70, 100],
            temp: [36.5, 37.5],
            rr: [22, 36],
            spo2: [88, 96],
        },
        typicalLabs: [
            { test: 'Peak flow', value: '<60% predicted', unit: 'L/min', abnormal: true },
            { test: 'ABG', value: 'Respiratory alkalosis early, acidosis late', unit: '', abnormal: true },
            { test: 'Chest X-ray', value: 'Hyperinflation, rule out pneumothorax', unit: '', abnormal: false },
        ],
        atypicalVariants: [
            {
                description: 'Near-fatal asthma — silent chest with minimal wheezing due to critical airflow limitation',
                modifiedSymptoms: ['Silent chest', 'Altered mental status', 'Severe respiratory distress', 'Cyanosis', 'Bradycardia'],
                probability: 0.05,
            },
        ],
        demographics: {
            ageRange: [5, 60],
            sexPredilection: null,
            riskFactors: ['Atopy', 'Family history', 'Environmental allergens', 'Viral URI', 'Exercise', 'Cold air'],
        },
        urgency: 'urgent',
        difficulty: [2, 5],
    },
    {
        id: 'pneumothorax',
        name: 'Tension Pneumothorax',
        category: 'respiratory',
        typicalSymptoms: [
            'Sudden severe chest pain',
            'Acute dyspnea',
            'Absent breath sounds on affected side',
            'Tracheal deviation to contralateral side',
            'Hypotension',
            'Distended neck veins',
        ],
        differentialDiagnoses: ['pulmonary_embolism', 'myocardial_infarction', 'hemothorax', 'cardiac_tamponade', 'asthma_exacerbation'],
        typicalVitals: {
            hr: [110, 150],
            bp_sys: [60, 100],
            bp_dia: [40, 70],
            temp: [36.5, 37.5],
            rr: [24, 40],
            spo2: [75, 90],
        },
        typicalLabs: [
            { test: 'Chest X-ray', value: 'Absent lung markings, mediastinal shift', unit: '', abnormal: true },
            { test: 'ABG', value: 'Hypoxemia, respiratory acidosis', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Simple pneumothorax — smaller, with mild symptoms and stable vitals',
                modifiedSymptoms: ['Mild pleuritic chest pain', 'Mild dyspnea', 'Decreased breath sounds'],
                probability: 0.4,
            },
        ],
        demographics: {
            ageRange: [18, 70],
            sexPredilection: 'male',
            riskFactors: ['Tall thin body habitus', 'COPD', 'Trauma', 'Mechanical ventilation', 'Marfan syndrome'],
        },
        urgency: 'emergent',
        difficulty: [4, 8],
    },
    {
        id: 'lung_cancer',
        name: 'Lung Cancer',
        category: 'respiratory',
        typicalSymptoms: [
            'Persistent cough lasting >3 weeks',
            'Hemoptysis',
            'Unintentional weight loss',
            'Chest pain',
            'Hoarseness',
            'Recurrent pneumonia',
        ],
        differentialDiagnoses: ['tuberculosis', 'pneumonia', 'copd_exacerbation', 'sarcoidosis', 'metastatic_disease'],
        typicalVitals: {
            hr: [70, 100],
            bp_sys: [110, 140],
            bp_dia: [70, 90],
            temp: [36.5, 37.8],
            rr: [14, 24],
            spo2: [90, 98],
        },
        typicalLabs: [
            { test: 'Chest X-ray', value: 'Pulmonary mass or nodule', unit: '', abnormal: true },
            { test: 'CT chest', value: 'Spiculated mass with lymphadenopathy', unit: '', abnormal: true },
            { test: 'CBC', value: 'Possible anemia', unit: '', abnormal: true },
            { test: 'Calcium', value: 'May be elevated (paraneoplastic)', unit: 'mg/dL', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Pancoast tumor — shoulder pain, Horner syndrome, no respiratory symptoms initially',
                modifiedSymptoms: ['Shoulder pain', 'Ptosis', 'Miosis', 'Anhidrosis', 'Arm weakness'],
                probability: 0.08,
            },
        ],
        demographics: {
            ageRange: [50, 85],
            sexPredilection: null,
            riskFactors: ['Smoking', 'Asbestos exposure', 'Radon exposure', 'Family history', 'Previous lung disease'],
        },
        urgency: 'semi-urgent',
        difficulty: [4, 8],
    },
    {
        id: 'tuberculosis',
        name: 'Pulmonary Tuberculosis',
        category: 'respiratory',
        typicalSymptoms: [
            'Chronic cough >3 weeks',
            'Hemoptysis',
            'Night sweats',
            'Unintentional weight loss',
            'Low-grade fever',
            'Fatigue',
        ],
        differentialDiagnoses: ['lung_cancer', 'pneumonia', 'sarcoidosis', 'nontuberculous_mycobacteria', 'fungal_infection'],
        typicalVitals: {
            hr: [70, 100],
            bp_sys: [100, 130],
            bp_dia: [60, 85],
            temp: [37.2, 38.5],
            rr: [16, 24],
            spo2: [92, 98],
        },
        typicalLabs: [
            { test: 'AFB smear', value: 'Positive', unit: '', abnormal: true },
            { test: 'TB culture', value: 'M. tuberculosis', unit: '', abnormal: true },
            { test: 'Chest X-ray', value: 'Upper lobe cavitation, infiltrates', unit: '', abnormal: true },
            { test: 'PPD/IGRA', value: 'Positive', unit: '', abnormal: true },
            { test: 'ESR', value: '>40', unit: 'mm/hr', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Miliary TB — disseminated disease with diffuse miliary pattern, more systemic symptoms',
                modifiedSymptoms: ['High fever', 'Hepatosplenomegaly', 'Pancytopenia', 'Multiorgan involvement'],
                probability: 0.1,
            },
        ],
        demographics: {
            ageRange: [18, 80],
            sexPredilection: null,
            riskFactors: ['HIV', 'Immigration from endemic area', 'Homelessness', 'Incarceration', 'Immunosuppression'],
        },
        urgency: 'urgent',
        difficulty: [4, 8],
    },

    // ═══════════════════════════════════════════════════════════════
    // NEUROLOGICAL
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'stroke',
        name: 'Acute Ischemic Stroke',
        category: 'neurological',
        typicalSymptoms: [
            'Sudden unilateral facial droop',
            'Arm or leg weakness on one side',
            'Slurred speech or aphasia',
            'Sudden severe headache',
            'Visual field deficits',
            'Ataxia and loss of coordination',
        ],
        differentialDiagnoses: ['tia', 'hemorrhagic_stroke', 'seizure', 'migraine_with_aura', 'hypoglycemia', 'brain_tumor'],
        typicalVitals: {
            hr: [70, 110],
            bp_sys: [150, 220],
            bp_dia: [90, 130],
            temp: [36.5, 37.8],
            rr: [14, 22],
            spo2: [93, 99],
        },
        typicalLabs: [
            { test: 'CT head', value: 'Hypodense area in vascular territory (may be normal early)', unit: '', abnormal: true },
            { test: 'Glucose', value: '>60', unit: 'mg/dL', abnormal: false },
            { test: 'INR/PT', value: 'Baseline', unit: '', abnormal: false },
            { test: 'CBC', value: 'Normal', unit: '', abnormal: false },
            { test: 'CT angiography', value: 'Large vessel occlusion', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Posterior circulation stroke — vertigo, diplopia, dysphagia, ataxia without classic hemiplegia',
                modifiedSymptoms: ['Vertigo', 'Diplopia', 'Dysphagia', 'Ataxia', 'Nystagmus'],
                probability: 0.2,
            },
        ],
        demographics: {
            ageRange: [50, 90],
            sexPredilection: 'male',
            riskFactors: ['Hypertension', 'Atrial fibrillation', 'Diabetes', 'Smoking', 'Hyperlipidemia', 'Prior stroke/TIA'],
        },
        urgency: 'emergent',
        difficulty: [3, 7],
    },
    {
        id: 'tia',
        name: 'Transient Ischemic Attack',
        category: 'neurological',
        typicalSymptoms: [
            'Transient unilateral weakness',
            'Transient speech difficulty',
            'Transient visual loss (amaurosis fugax)',
            'Symptoms resolve within 1 hour',
            'No residual deficits on exam',
        ],
        differentialDiagnoses: ['stroke', 'migraine_with_aura', 'seizure', 'hypoglycemia', 'peripheral_vertigo'],
        typicalVitals: {
            hr: [70, 100],
            bp_sys: [130, 180],
            bp_dia: [80, 110],
            temp: [36.5, 37.2],
            rr: [12, 20],
            spo2: [95, 99],
        },
        typicalLabs: [
            { test: 'CT head', value: 'Normal', unit: '', abnormal: false },
            { test: 'MRI DWI', value: 'May show restricted diffusion', unit: '', abnormal: true },
            { test: 'Carotid ultrasound', value: 'Possible stenosis', unit: '', abnormal: true },
            { test: 'ECG', value: 'Check for atrial fibrillation', unit: '', abnormal: false },
        ],
        atypicalVariants: [
            {
                description: 'Crescendo TIAs — multiple episodes in 24-48 hours, high risk for stroke',
                modifiedSymptoms: ['Recurrent transient deficits', 'Increasing frequency', 'Variable symptoms'],
                probability: 0.1,
            },
        ],
        demographics: {
            ageRange: [50, 85],
            sexPredilection: 'male',
            riskFactors: ['Hypertension', 'Atrial fibrillation', 'Carotid stenosis', 'Diabetes', 'Prior TIA'],
        },
        urgency: 'urgent',
        difficulty: [4, 7],
    },
    {
        id: 'meningitis',
        name: 'Bacterial Meningitis',
        category: 'neurological',
        typicalSymptoms: [
            'Severe headache',
            'Neck stiffness (nuchal rigidity)',
            'High fever',
            'Photophobia',
            'Altered mental status',
            'Positive Kernig and Brudzinski signs',
            'Petechial rash (meningococcal)',
        ],
        differentialDiagnoses: ['viral_meningitis', 'subarachnoid_hemorrhage', 'encephalitis', 'brain_abscess', 'migraine'],
        typicalVitals: {
            hr: [100, 130],
            bp_sys: [90, 140],
            bp_dia: [60, 90],
            temp: [39.0, 41.0],
            rr: [18, 28],
            spo2: [92, 99],
        },
        typicalLabs: [
            { test: 'CSF WBC', value: '>1000', unit: '/uL', abnormal: true },
            { test: 'CSF protein', value: '>100', unit: 'mg/dL', abnormal: true },
            { test: 'CSF glucose', value: '<40', unit: 'mg/dL', abnormal: true },
            { test: 'CSF Gram stain', value: 'Organisms seen', unit: '', abnormal: true },
            { test: 'Blood cultures', value: 'Positive', unit: '', abnormal: true },
            { test: 'WBC', value: '15000-30000', unit: '/uL', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Meningitis in elderly — may present without fever or nuchal rigidity, with confusion and lethargy only',
                modifiedSymptoms: ['Confusion', 'Lethargy', 'Low-grade or no fever', 'Subtle neck stiffness'],
                probability: 0.2,
            },
        ],
        demographics: {
            ageRange: [1, 80],
            sexPredilection: null,
            riskFactors: ['Immunosuppression', 'Splenectomy', 'Close living quarters', 'Cochlear implants', 'CSF leak'],
        },
        urgency: 'emergent',
        difficulty: [3, 7],
    },
    {
        id: 'seizure',
        name: 'New-Onset Seizure',
        category: 'neurological',
        typicalSymptoms: [
            'Witnessed tonic-clonic activity',
            'Loss of consciousness',
            'Postictal confusion',
            'Tongue biting',
            'Urinary incontinence',
            'Preceding aura (some patients)',
        ],
        differentialDiagnoses: ['syncope', 'pseudoseizure', 'hypoglycemia', 'stroke', 'arrhythmia', 'drug_withdrawal'],
        typicalVitals: {
            hr: [90, 130],
            bp_sys: [140, 200],
            bp_dia: [80, 120],
            temp: [37.0, 38.5],
            rr: [16, 28],
            spo2: [88, 97],
        },
        typicalLabs: [
            { test: 'Glucose', value: '>60', unit: 'mg/dL', abnormal: false },
            { test: 'Electrolytes', value: 'Check Na, Ca, Mg', unit: '', abnormal: false },
            { test: 'Prolactin', value: 'Elevated if true seizure', unit: 'ng/mL', abnormal: true },
            { test: 'CT head', value: 'Rule out mass, hemorrhage', unit: '', abnormal: false },
            { test: 'Lactic acid', value: 'Elevated', unit: 'mmol/L', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Non-convulsive status epilepticus — prolonged altered mental status without obvious motor convulsions',
                modifiedSymptoms: ['Prolonged confusion', 'Subtle eye deviation', 'Unresponsiveness', 'Automatisms'],
                probability: 0.1,
            },
        ],
        demographics: {
            ageRange: [5, 80],
            sexPredilection: null,
            riskFactors: ['Brain tumor', 'Prior head trauma', 'Stroke history', 'Alcohol withdrawal', 'Drug use', 'Family history of epilepsy'],
        },
        urgency: 'emergent',
        difficulty: [3, 6],
    },
    {
        id: 'migraine',
        name: 'Migraine with Aura',
        category: 'neurological',
        typicalSymptoms: [
            'Unilateral throbbing headache',
            'Visual aura (scintillating scotoma)',
            'Photophobia and phonophobia',
            'Nausea and vomiting',
            'Symptoms worsen with activity',
        ],
        differentialDiagnoses: ['tia', 'stroke', 'subarachnoid_hemorrhage', 'cluster_headache', 'brain_tumor', 'meningitis'],
        typicalVitals: {
            hr: [60, 90],
            bp_sys: [110, 140],
            bp_dia: [70, 90],
            temp: [36.5, 37.2],
            rr: [12, 18],
            spo2: [97, 100],
        },
        typicalLabs: [
            { test: 'CT head', value: 'Normal', unit: '', abnormal: false },
            { test: 'ESR', value: 'Normal', unit: 'mm/hr', abnormal: false },
            { test: 'CBC', value: 'Normal', unit: '', abnormal: false },
        ],
        atypicalVariants: [
            {
                description: 'Hemiplegic migraine — transient hemiplegia mimicking stroke',
                modifiedSymptoms: ['Unilateral motor weakness', 'Aphasia', 'Visual disturbance', 'Headache follows weakness'],
                probability: 0.05,
            },
        ],
        demographics: {
            ageRange: [15, 55],
            sexPredilection: 'female',
            riskFactors: ['Family history', 'Hormonal changes', 'Stress', 'Sleep disturbance', 'Certain foods'],
        },
        urgency: 'semi-urgent',
        difficulty: [2, 5],
    },
    {
        id: 'multiple_sclerosis',
        name: 'Multiple Sclerosis (Acute Relapse)',
        category: 'neurological',
        typicalSymptoms: [
            'Optic neuritis (painful vision loss)',
            'Limb weakness or numbness',
            'Lhermitte sign (electric sensation with neck flexion)',
            'Urinary urgency or retention',
            'Fatigue',
            'Diplopia',
        ],
        differentialDiagnoses: ['neuromyelitis_optica', 'vitamin_b12_deficiency', 'sle', 'sarcoidosis', 'brain_tumor', 'stroke'],
        typicalVitals: {
            hr: [60, 90],
            bp_sys: [110, 130],
            bp_dia: [70, 85],
            temp: [36.5, 37.2],
            rr: [12, 18],
            spo2: [97, 100],
        },
        typicalLabs: [
            { test: 'MRI brain', value: 'Periventricular white matter lesions', unit: '', abnormal: true },
            { test: 'MRI spine', value: 'Demyelinating lesions', unit: '', abnormal: true },
            { test: 'CSF', value: 'Oligoclonal bands, elevated IgG index', unit: '', abnormal: true },
            { test: 'VEP', value: 'Delayed P100 latency', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Primary progressive MS — gradual onset spastic paraparesis without clear relapses',
                modifiedSymptoms: ['Progressive leg weakness', 'Gait difficulty', 'Bladder dysfunction', 'No clear relapses'],
                probability: 0.15,
            },
        ],
        demographics: {
            ageRange: [20, 50],
            sexPredilection: 'female',
            riskFactors: ['Northern latitude', 'Family history', 'Vitamin D deficiency', 'EBV infection', 'Smoking'],
        },
        urgency: 'semi-urgent',
        difficulty: [5, 9],
    },
    {
        id: 'guillain_barre',
        name: 'Guillain-Barre Syndrome',
        category: 'neurological',
        typicalSymptoms: [
            'Ascending bilateral weakness starting in legs',
            'Areflexia or hyporeflexia',
            'Paresthesias in extremities',
            'Back pain',
            'Facial weakness (bilateral)',
            'Autonomic dysfunction',
        ],
        differentialDiagnoses: ['transverse_myelitis', 'myasthenia_gravis', 'botulism', 'spinal_cord_compression', 'poliomyelitis'],
        typicalVitals: {
            hr: [50, 120],
            bp_sys: [90, 180],
            bp_dia: [60, 110],
            temp: [36.5, 37.5],
            rr: [12, 24],
            spo2: [92, 99],
        },
        typicalLabs: [
            { test: 'CSF', value: 'Albuminocytologic dissociation (high protein, normal WBC)', unit: '', abnormal: true },
            { test: 'Nerve conduction studies', value: 'Demyelinating pattern', unit: '', abnormal: true },
            { test: 'FVC', value: '<20 mL/kg indicates need for intubation', unit: 'mL/kg', abnormal: true },
            { test: 'Anti-ganglioside antibodies', value: 'May be positive', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Miller Fisher variant — ophthalmoplegia, ataxia, and areflexia without significant limb weakness',
                modifiedSymptoms: ['Ophthalmoplegia', 'Ataxia', 'Areflexia', 'Minimal limb weakness'],
                probability: 0.1,
            },
        ],
        demographics: {
            ageRange: [20, 70],
            sexPredilection: 'male',
            riskFactors: ['Recent GI or respiratory infection', 'Campylobacter jejuni infection', 'Recent surgery', 'Vaccination (rare)'],
        },
        urgency: 'urgent',
        difficulty: [5, 9],
    },

    // ═══════════════════════════════════════════════════════════════
    // GASTROINTESTINAL
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'appendicitis',
        name: 'Acute Appendicitis',
        category: 'gastrointestinal',
        typicalSymptoms: [
            'Periumbilical pain migrating to right lower quadrant',
            'Anorexia',
            'Nausea and vomiting',
            'Rebound tenderness at McBurney point',
            'Low-grade fever',
            'Positive psoas and obturator signs',
        ],
        differentialDiagnoses: ['mesenteric_lymphadenitis', 'ectopic_pregnancy', 'ovarian_torsion', 'crohn_disease', 'diverticulitis', 'ureterolithiasis'],
        typicalVitals: {
            hr: [80, 110],
            bp_sys: [110, 140],
            bp_dia: [70, 90],
            temp: [37.5, 39.0],
            rr: [14, 22],
            spo2: [96, 99],
        },
        typicalLabs: [
            { test: 'WBC', value: '11000-18000', unit: '/uL', abnormal: true },
            { test: 'CRP', value: '>10', unit: 'mg/L', abnormal: true },
            { test: 'CT abdomen', value: 'Dilated appendix >6mm, periappendiceal fat stranding', unit: '', abnormal: true },
            { test: 'Urinalysis', value: 'Normal (rules out UTI)', unit: '', abnormal: false },
        ],
        atypicalVariants: [
            {
                description: 'Retrocecal appendicitis — pain in flank or back, minimal peritoneal signs',
                modifiedSymptoms: ['Right flank pain', 'Psoas sign positive', 'Minimal abdominal tenderness', 'Diarrhea'],
                probability: 0.15,
            },
        ],
        demographics: {
            ageRange: [10, 40],
            sexPredilection: 'male',
            riskFactors: ['Family history', 'Low-fiber diet'],
        },
        urgency: 'emergent',
        difficulty: [2, 5],
    },
    {
        id: 'bowel_obstruction',
        name: 'Small Bowel Obstruction',
        category: 'gastrointestinal',
        typicalSymptoms: [
            'Colicky abdominal pain',
            'Abdominal distension',
            'Nausea and vomiting (bilious)',
            'Obstipation (inability to pass gas or stool)',
            'High-pitched bowel sounds',
        ],
        differentialDiagnoses: ['ileus', 'large_bowel_obstruction', 'volvulus', 'mesenteric_ischemia', 'pancreatitis'],
        typicalVitals: {
            hr: [90, 120],
            bp_sys: [90, 140],
            bp_dia: [60, 90],
            temp: [36.5, 38.0],
            rr: [16, 24],
            spo2: [95, 99],
        },
        typicalLabs: [
            { test: 'Abdominal X-ray', value: 'Air-fluid levels, dilated bowel loops', unit: '', abnormal: true },
            { test: 'CT abdomen', value: 'Transition point identified', unit: '', abnormal: true },
            { test: 'Electrolytes', value: 'Hypokalemia, metabolic alkalosis', unit: '', abnormal: true },
            { test: 'Lactic acid', value: 'Elevated if strangulation', unit: 'mmol/L', abnormal: true },
            { test: 'WBC', value: '10000-18000', unit: '/uL', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Closed-loop obstruction — rapid progression to ischemia with severe constant pain',
                modifiedSymptoms: ['Severe constant pain', 'Rapid deterioration', 'Hemodynamic instability', 'Peritoneal signs'],
                probability: 0.1,
            },
        ],
        demographics: {
            ageRange: [30, 85],
            sexPredilection: null,
            riskFactors: ['Prior abdominal surgery (adhesions)', 'Hernia', 'Malignancy', 'Crohn disease'],
        },
        urgency: 'emergent',
        difficulty: [3, 7],
    },
    {
        id: 'pancreatitis',
        name: 'Acute Pancreatitis',
        category: 'gastrointestinal',
        typicalSymptoms: [
            'Severe epigastric pain radiating to the back',
            'Nausea and vomiting',
            'Pain worse after eating',
            'Pain relieved by leaning forward',
            'Abdominal tenderness and guarding',
        ],
        differentialDiagnoses: ['cholecystitis', 'peptic_ulcer_perforation', 'mesenteric_ischemia', 'myocardial_infarction', 'aortic_dissection'],
        typicalVitals: {
            hr: [90, 120],
            bp_sys: [90, 140],
            bp_dia: [60, 90],
            temp: [37.0, 39.0],
            rr: [18, 26],
            spo2: [93, 99],
        },
        typicalLabs: [
            { test: 'Lipase', value: '>300', unit: 'U/L', abnormal: true },
            { test: 'Amylase', value: '>200', unit: 'U/L', abnormal: true },
            { test: 'WBC', value: '12000-20000', unit: '/uL', abnormal: true },
            { test: 'Calcium', value: '<8.0 if severe', unit: 'mg/dL', abnormal: true },
            { test: 'CT abdomen', value: 'Pancreatic edema, peripancreatic fluid', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Necrotizing pancreatitis — hemorrhagic signs (Cullen/Grey Turner sign), multiorgan failure',
                modifiedSymptoms: ['Periumbilical ecchymosis (Cullen sign)', 'Flank ecchymosis (Grey Turner sign)', 'Shock', 'ARDS'],
                probability: 0.1,
            },
        ],
        demographics: {
            ageRange: [30, 70],
            sexPredilection: null,
            riskFactors: ['Gallstones', 'Alcohol use', 'Hypertriglyceridemia', 'ERCP', 'Medications (valproic acid, azathioprine)'],
        },
        urgency: 'urgent',
        difficulty: [3, 6],
    },
    {
        id: 'cholecystitis',
        name: 'Acute Cholecystitis',
        category: 'gastrointestinal',
        typicalSymptoms: [
            'Right upper quadrant pain',
            'Pain radiating to right shoulder or scapula',
            'Nausea and vomiting',
            'Fever',
            'Positive Murphy sign',
        ],
        differentialDiagnoses: ['choledocholithiasis', 'hepatitis', 'pancreatitis', 'peptic_ulcer', 'right_lower_lobe_pneumonia'],
        typicalVitals: {
            hr: [80, 110],
            bp_sys: [110, 150],
            bp_dia: [70, 95],
            temp: [37.8, 39.5],
            rr: [14, 22],
            spo2: [96, 99],
        },
        typicalLabs: [
            { test: 'WBC', value: '12000-18000', unit: '/uL', abnormal: true },
            { test: 'ALT', value: '50-150', unit: 'U/L', abnormal: true },
            { test: 'AST', value: '50-120', unit: 'U/L', abnormal: true },
            { test: 'Bilirubin', value: '1.5-4.0', unit: 'mg/dL', abnormal: true },
            { test: 'Ultrasound', value: 'Gallstones, gallbladder wall thickening, pericholecystic fluid', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Acalculous cholecystitis — no gallstones, occurs in critically ill patients',
                modifiedSymptoms: ['RUQ pain', 'Fever', 'Leukocytosis', 'No stones on imaging'],
                probability: 0.1,
            },
        ],
        demographics: {
            ageRange: [30, 70],
            sexPredilection: 'female',
            riskFactors: ['Female sex', 'Obesity', 'Multiparity', 'Rapid weight loss', 'Age >40', 'Family history'],
        },
        urgency: 'urgent',
        difficulty: [2, 5],
    },
    {
        id: 'gi_bleed',
        name: 'Upper Gastrointestinal Bleed',
        category: 'gastrointestinal',
        typicalSymptoms: [
            'Hematemesis (coffee-ground or bright red)',
            'Melena (black tarry stools)',
            'Epigastric pain',
            'Lightheadedness and weakness',
            'Tachycardia',
            'Orthostatic hypotension',
        ],
        differentialDiagnoses: ['lower_gi_bleed', 'peptic_ulcer_perforation', 'esophageal_varices', 'mallory_weiss_tear', 'aortoenteric_fistula'],
        typicalVitals: {
            hr: [100, 140],
            bp_sys: [70, 110],
            bp_dia: [40, 70],
            temp: [36.3, 37.5],
            rr: [16, 26],
            spo2: [92, 99],
        },
        typicalLabs: [
            { test: 'Hemoglobin', value: '5.0-10.0', unit: 'g/dL', abnormal: true },
            { test: 'BUN', value: '>40', unit: 'mg/dL', abnormal: true },
            { test: 'BUN/Creatinine ratio', value: '>30', unit: '', abnormal: true },
            { test: 'INR', value: 'May be elevated', unit: '', abnormal: true },
            { test: 'Type and screen', value: 'For transfusion', unit: '', abnormal: false },
        ],
        atypicalVariants: [
            {
                description: 'Chronic slow GI bleed — presents with fatigue and iron-deficiency anemia without overt bleeding',
                modifiedSymptoms: ['Fatigue', 'Pallor', 'Exertional dyspnea', 'Iron-deficiency anemia', 'Occult blood positive stool'],
                probability: 0.2,
            },
        ],
        demographics: {
            ageRange: [30, 85],
            sexPredilection: 'male',
            riskFactors: ['NSAID use', 'H. pylori', 'Alcohol use', 'Cirrhosis', 'Anticoagulant use', 'Prior GI bleed'],
        },
        urgency: 'emergent',
        difficulty: [3, 7],
    },
    {
        id: 'hepatitis',
        name: 'Acute Viral Hepatitis',
        category: 'gastrointestinal',
        typicalSymptoms: [
            'Jaundice',
            'Right upper quadrant pain',
            'Fatigue and malaise',
            'Nausea and anorexia',
            'Dark urine',
            'Clay-colored stools',
        ],
        differentialDiagnoses: ['cholecystitis', 'choledocholithiasis', 'drug_induced_hepatitis', 'alcoholic_hepatitis', 'autoimmune_hepatitis', 'pancreatic_cancer'],
        typicalVitals: {
            hr: [60, 90],
            bp_sys: [100, 130],
            bp_dia: [60, 85],
            temp: [37.0, 38.5],
            rr: [12, 20],
            spo2: [96, 99],
        },
        typicalLabs: [
            { test: 'ALT', value: '500-5000', unit: 'U/L', abnormal: true },
            { test: 'AST', value: '400-3000', unit: 'U/L', abnormal: true },
            { test: 'Total bilirubin', value: '3-20', unit: 'mg/dL', abnormal: true },
            { test: 'Alkaline phosphatase', value: '100-300', unit: 'U/L', abnormal: true },
            { test: 'Hepatitis panel', value: 'Positive serology', unit: '', abnormal: true },
            { test: 'INR', value: 'May be prolonged if severe', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Fulminant hepatitis — rapid progression to hepatic encephalopathy and coagulopathy',
                modifiedSymptoms: ['Confusion', 'Asterixis', 'Coagulopathy', 'Ascites', 'Cerebral edema'],
                probability: 0.05,
            },
        ],
        demographics: {
            ageRange: [15, 65],
            sexPredilection: null,
            riskFactors: ['IV drug use', 'Travel to endemic areas', 'Contaminated food/water', 'Sexual contact', 'Blood transfusion'],
        },
        urgency: 'semi-urgent',
        difficulty: [3, 6],
    },

    // ═══════════════════════════════════════════════════════════════
    // ENDOCRINE
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'dka',
        name: 'Diabetic Ketoacidosis',
        category: 'endocrine',
        typicalSymptoms: [
            'Polyuria and polydipsia',
            'Nausea and vomiting',
            'Abdominal pain',
            'Kussmaul breathing (deep rapid respirations)',
            'Fruity breath odor',
            'Altered mental status',
            'Dehydration',
        ],
        differentialDiagnoses: ['hhs', 'alcoholic_ketoacidosis', 'starvation_ketosis', 'lactic_acidosis', 'toxic_ingestion'],
        typicalVitals: {
            hr: [100, 140],
            bp_sys: [80, 120],
            bp_dia: [50, 80],
            temp: [36.0, 37.5],
            rr: [24, 40],
            spo2: [94, 99],
        },
        typicalLabs: [
            { test: 'Glucose', value: '300-800', unit: 'mg/dL', abnormal: true },
            { test: 'pH', value: '<7.30', unit: '', abnormal: true },
            { test: 'Bicarbonate', value: '<18', unit: 'mEq/L', abnormal: true },
            { test: 'Anion gap', value: '>12', unit: 'mEq/L', abnormal: true },
            { test: 'Serum ketones', value: 'Positive', unit: '', abnormal: true },
            { test: 'Potassium', value: 'Initially normal or high, drops with treatment', unit: 'mEq/L', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Euglycemic DKA — ketoacidosis with glucose <250 mg/dL, associated with SGLT2 inhibitors',
                modifiedSymptoms: ['Nausea', 'Vomiting', 'Metabolic acidosis', 'Near-normal glucose', 'Ketonemia'],
                probability: 0.1,
            },
        ],
        demographics: {
            ageRange: [15, 65],
            sexPredilection: null,
            riskFactors: ['Type 1 diabetes', 'Insulin non-compliance', 'Infection', 'New-onset diabetes', 'SGLT2 inhibitors'],
        },
        urgency: 'emergent',
        difficulty: [3, 7],
    },
    {
        id: 'thyroid_storm',
        name: 'Thyroid Storm',
        category: 'endocrine',
        typicalSymptoms: [
            'High fever (>40°C)',
            'Tachycardia disproportionate to fever',
            'Agitation and altered mental status',
            'Tremor',
            'Profuse diaphoresis',
            'Nausea, vomiting, diarrhea',
            'Possible heart failure or arrhythmia',
        ],
        differentialDiagnoses: ['sepsis', 'pheochromocytoma', 'neuroleptic_malignant_syndrome', 'serotonin_syndrome', 'sympathomimetic_toxicity'],
        typicalVitals: {
            hr: [140, 200],
            bp_sys: [140, 200],
            bp_dia: [60, 100],
            temp: [39.5, 41.5],
            rr: [22, 36],
            spo2: [90, 98],
        },
        typicalLabs: [
            { test: 'TSH', value: '<0.01', unit: 'mIU/L', abnormal: true },
            { test: 'Free T4', value: '>5.0', unit: 'ng/dL', abnormal: true },
            { test: 'Free T3', value: '>10', unit: 'pg/mL', abnormal: true },
            { test: 'Glucose', value: 'Elevated', unit: 'mg/dL', abnormal: true },
            { test: 'LFTs', value: 'Elevated AST/ALT', unit: '', abnormal: true },
            { test: 'Calcium', value: 'May be elevated', unit: 'mg/dL', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Apathetic thyroid storm — elderly patient with lethargy, weakness, and cardiac failure instead of agitation',
                modifiedSymptoms: ['Apathy', 'Weakness', 'Weight loss', 'Heart failure', 'Atrial fibrillation'],
                probability: 0.15,
            },
        ],
        demographics: {
            ageRange: [20, 70],
            sexPredilection: 'female',
            riskFactors: ['Graves disease', 'Infection as trigger', 'Surgery', 'Iodine load', 'Thyroid medication non-compliance'],
        },
        urgency: 'emergent',
        difficulty: [6, 10],
    },
    {
        id: 'addisonian_crisis',
        name: 'Adrenal (Addisonian) Crisis',
        category: 'endocrine',
        typicalSymptoms: [
            'Severe hypotension refractory to fluids',
            'Profound weakness and fatigue',
            'Nausea, vomiting, and abdominal pain',
            'Altered mental status',
            'Hyperpigmentation of skin and mucosa',
        ],
        differentialDiagnoses: ['sepsis', 'hypovolemic_shock', 'myocardial_infarction', 'anaphylaxis', 'hypothyroidism'],
        typicalVitals: {
            hr: [100, 140],
            bp_sys: [60, 90],
            bp_dia: [30, 60],
            temp: [35.5, 37.5],
            rr: [16, 26],
            spo2: [92, 99],
        },
        typicalLabs: [
            { test: 'Cortisol', value: '<3', unit: 'mcg/dL', abnormal: true },
            { test: 'ACTH', value: '>100 (primary)', unit: 'pg/mL', abnormal: true },
            { test: 'Sodium', value: '<130', unit: 'mEq/L', abnormal: true },
            { test: 'Potassium', value: '>5.5', unit: 'mEq/L', abnormal: true },
            { test: 'Glucose', value: '<70', unit: 'mg/dL', abnormal: true },
            { test: 'Calcium', value: 'May be elevated', unit: 'mg/dL', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Secondary adrenal crisis — no hyperpigmentation, no hyperkalemia, caused by abrupt steroid withdrawal',
                modifiedSymptoms: ['Hypotension', 'Fatigue', 'Hyponatremia', 'Normal potassium', 'Normal skin color'],
                probability: 0.3,
            },
        ],
        demographics: {
            ageRange: [20, 70],
            sexPredilection: 'female',
            riskFactors: ['Known adrenal insufficiency', 'Chronic steroid use', 'Autoimmune disease', 'Infection as trigger', 'Surgery'],
        },
        urgency: 'emergent',
        difficulty: [6, 10],
    },
    {
        id: 'hypoglycemia',
        name: 'Severe Hypoglycemia',
        category: 'endocrine',
        typicalSymptoms: [
            'Diaphoresis',
            'Tremor',
            'Palpitations',
            'Confusion and altered mental status',
            'Hunger',
            'Weakness',
            'Seizures (severe)',
        ],
        differentialDiagnoses: ['stroke', 'seizure', 'alcohol_intoxication', 'drug_overdose', 'syncope'],
        typicalVitals: {
            hr: [90, 130],
            bp_sys: [100, 160],
            bp_dia: [60, 100],
            temp: [36.0, 37.5],
            rr: [16, 24],
            spo2: [95, 99],
        },
        typicalLabs: [
            { test: 'Glucose', value: '<54', unit: 'mg/dL', abnormal: true },
            { test: 'C-peptide', value: 'Depends on etiology', unit: 'ng/mL', abnormal: true },
            { test: 'Insulin level', value: 'Depends on etiology', unit: 'uIU/mL', abnormal: true },
            { test: 'BMP', value: 'Check for renal/hepatic causes', unit: '', abnormal: false },
        ],
        atypicalVariants: [
            {
                description: 'Hypoglycemia unawareness — no adrenergic symptoms, presents with neuroglycopenic symptoms only',
                modifiedSymptoms: ['Confusion without warning', 'Behavioral changes', 'Sudden loss of consciousness', 'No diaphoresis'],
                probability: 0.2,
            },
        ],
        demographics: {
            ageRange: [20, 85],
            sexPredilection: null,
            riskFactors: ['Insulin use', 'Sulfonylurea use', 'Alcohol use', 'Renal insufficiency', 'Sepsis', 'Adrenal insufficiency'],
        },
        urgency: 'emergent',
        difficulty: [2, 5],
    },
    {
        id: 'pheochromocytoma',
        name: 'Pheochromocytoma Crisis',
        category: 'endocrine',
        typicalSymptoms: [
            'Episodic severe hypertension',
            'Severe headache',
            'Profuse diaphoresis',
            'Palpitations',
            'Anxiety and pallor',
            'Tremor',
        ],
        differentialDiagnoses: ['hypertensive_emergency', 'thyroid_storm', 'panic_disorder', 'drug_toxicity', 'carcinoid_syndrome'],
        typicalVitals: {
            hr: [110, 160],
            bp_sys: [180, 280],
            bp_dia: [110, 160],
            temp: [36.5, 38.0],
            rr: [18, 28],
            spo2: [94, 99],
        },
        typicalLabs: [
            { test: 'Plasma metanephrines', value: 'Markedly elevated', unit: 'pg/mL', abnormal: true },
            { test: '24h urine catecholamines', value: 'Elevated', unit: 'mcg/24h', abnormal: true },
            { test: 'CT/MRI abdomen', value: 'Adrenal mass', unit: '', abnormal: true },
            { test: 'Glucose', value: 'May be elevated', unit: 'mg/dL', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Incidental pheochromocytoma — discovered during imaging, with only mild or no symptoms',
                modifiedSymptoms: ['Mild headache', 'Occasional palpitations', 'Incidental adrenal mass'],
                probability: 0.15,
            },
        ],
        demographics: {
            ageRange: [20, 60],
            sexPredilection: null,
            riskFactors: ['MEN2 syndrome', 'Von Hippel-Lindau', 'Neurofibromatosis type 1', 'Family history', 'SDH mutations'],
        },
        urgency: 'emergent',
        difficulty: [7, 10],
    },

    // ═══════════════════════════════════════════════════════════════
    // INFECTIOUS
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'sepsis',
        name: 'Sepsis / Septic Shock',
        category: 'infectious',
        typicalSymptoms: [
            'Fever or hypothermia',
            'Tachycardia',
            'Tachypnea',
            'Altered mental status',
            'Hypotension (if septic shock)',
            'Warm flushed skin (early) or cool mottled skin (late)',
        ],
        differentialDiagnoses: ['cardiogenic_shock', 'anaphylaxis', 'adrenal_crisis', 'pulmonary_embolism', 'pancreatitis'],
        typicalVitals: {
            hr: [100, 150],
            bp_sys: [60, 100],
            bp_dia: [30, 60],
            temp: [35.0, 40.5],
            rr: [22, 38],
            spo2: [85, 96],
        },
        typicalLabs: [
            { test: 'WBC', value: '>12000 or <4000', unit: '/uL', abnormal: true },
            { test: 'Lactic acid', value: '>2.0', unit: 'mmol/L', abnormal: true },
            { test: 'Procalcitonin', value: '>0.5', unit: 'ng/mL', abnormal: true },
            { test: 'Blood cultures', value: 'Positive', unit: '', abnormal: true },
            { test: 'Creatinine', value: 'Elevated', unit: 'mg/dL', abnormal: true },
            { test: 'Platelets', value: '<150000', unit: '/uL', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Cryptic sepsis — normal blood pressure but elevated lactate, subtle presentation in elderly',
                modifiedSymptoms: ['Subtle confusion', 'Tachycardia', 'Normal temperature', 'Elevated lactate', 'Normal BP'],
                probability: 0.2,
            },
        ],
        demographics: {
            ageRange: [18, 90],
            sexPredilection: null,
            riskFactors: ['Advanced age', 'Immunosuppression', 'Diabetes', 'Malignancy', 'Recent surgery', 'Indwelling catheters'],
        },
        urgency: 'emergent',
        difficulty: [4, 8],
    },
    {
        id: 'cellulitis',
        name: 'Cellulitis',
        category: 'infectious',
        typicalSymptoms: [
            'Expanding area of erythema',
            'Warmth over affected area',
            'Tenderness and pain',
            'Edema',
            'Fever',
            'Possible lymphangitic streaking',
        ],
        differentialDiagnoses: ['dvt', 'necrotizing_fasciitis', 'abscess', 'contact_dermatitis', 'gout', 'erysipelas'],
        typicalVitals: {
            hr: [70, 100],
            bp_sys: [110, 140],
            bp_dia: [70, 90],
            temp: [37.5, 39.5],
            rr: [14, 20],
            spo2: [96, 99],
        },
        typicalLabs: [
            { test: 'WBC', value: '10000-18000', unit: '/uL', abnormal: true },
            { test: 'CRP', value: '>20', unit: 'mg/L', abnormal: true },
            { test: 'Blood cultures', value: 'Usually negative in uncomplicated', unit: '', abnormal: false },
        ],
        atypicalVariants: [
            {
                description: 'Necrotizing fasciitis — rapidly spreading, pain disproportionate to exam, crepitus, systemic toxicity',
                modifiedSymptoms: ['Pain out of proportion', 'Crepitus', 'Bullae', 'Dusky skin', 'Rapid spread', 'Sepsis'],
                probability: 0.05,
            },
        ],
        demographics: {
            ageRange: [18, 80],
            sexPredilection: null,
            riskFactors: ['Diabetes', 'Peripheral vascular disease', 'Skin break/wound', 'Obesity', 'Immunosuppression', 'Lymphedema'],
        },
        urgency: 'semi-urgent',
        difficulty: [1, 4],
    },
    {
        id: 'uti',
        name: 'Urinary Tract Infection (Complicated)',
        category: 'infectious',
        typicalSymptoms: [
            'Dysuria',
            'Urinary frequency and urgency',
            'Suprapubic pain',
            'Fever and chills (pyelonephritis)',
            'Flank pain (pyelonephritis)',
            'Cloudy or foul-smelling urine',
        ],
        differentialDiagnoses: ['pyelonephritis', 'nephrolithiasis', 'vaginitis', 'urethritis', 'interstitial_cystitis', 'prostatitis'],
        typicalVitals: {
            hr: [80, 110],
            bp_sys: [100, 140],
            bp_dia: [60, 90],
            temp: [37.5, 39.5],
            rr: [14, 22],
            spo2: [96, 99],
        },
        typicalLabs: [
            { test: 'Urinalysis', value: 'Positive leukocyte esterase, nitrites, WBC', unit: '', abnormal: true },
            { test: 'Urine culture', value: '>100,000 CFU/mL', unit: '', abnormal: true },
            { test: 'WBC', value: '10000-16000', unit: '/uL', abnormal: true },
            { test: 'Creatinine', value: 'May be elevated if obstruction', unit: 'mg/dL', abnormal: false },
        ],
        atypicalVariants: [
            {
                description: 'UTI in elderly — confusion or altered mental status as the primary symptom without urinary complaints',
                modifiedSymptoms: ['New confusion', 'Agitation', 'Falls', 'Decreased appetite', 'Incontinence'],
                probability: 0.25,
            },
        ],
        demographics: {
            ageRange: [18, 90],
            sexPredilection: 'female',
            riskFactors: ['Female sex', 'Sexual activity', 'Catheter use', 'Diabetes', 'Urinary obstruction', 'Pregnancy'],
        },
        urgency: 'semi-urgent',
        difficulty: [1, 4],
    },

    // ═══════════════════════════════════════════════════════════════
    // RENAL
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'aki',
        name: 'Acute Kidney Injury',
        category: 'renal',
        typicalSymptoms: [
            'Decreased urine output (oliguria)',
            'Peripheral edema',
            'Fatigue',
            'Nausea',
            'Confusion (uremic encephalopathy)',
            'Dyspnea (fluid overload)',
        ],
        differentialDiagnoses: ['chronic_kidney_disease', 'chf', 'hepatorenal_syndrome', 'urinary_obstruction', 'nephrotic_syndrome'],
        typicalVitals: {
            hr: [80, 110],
            bp_sys: [130, 190],
            bp_dia: [80, 120],
            temp: [36.5, 37.5],
            rr: [16, 26],
            spo2: [90, 98],
        },
        typicalLabs: [
            { test: 'Creatinine', value: '>2.0 (or >1.5x baseline)', unit: 'mg/dL', abnormal: true },
            { test: 'BUN', value: '>40', unit: 'mg/dL', abnormal: true },
            { test: 'Potassium', value: '>5.5', unit: 'mEq/L', abnormal: true },
            { test: 'Bicarbonate', value: '<20', unit: 'mEq/L', abnormal: true },
            { test: 'Urine sodium', value: 'Depends on etiology', unit: 'mEq/L', abnormal: true },
            { test: 'Urinalysis', value: 'Muddy brown casts (ATN)', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Non-oliguric AKI — rising creatinine with maintained urine output, easily missed',
                modifiedSymptoms: ['Normal urine output', 'Rising creatinine', 'Fatigue', 'Subtle edema'],
                probability: 0.3,
            },
        ],
        demographics: {
            ageRange: [30, 85],
            sexPredilection: null,
            riskFactors: ['CKD', 'Diabetes', 'Hypertension', 'Nephrotoxic drugs', 'Sepsis', 'Dehydration', 'Contrast dye'],
        },
        urgency: 'urgent',
        difficulty: [4, 8],
    },
    {
        id: 'nephrolithiasis',
        name: 'Nephrolithiasis (Renal Colic)',
        category: 'renal',
        typicalSymptoms: [
            'Severe colicky flank pain radiating to groin',
            'Hematuria',
            'Nausea and vomiting',
            'Restlessness (unable to find comfortable position)',
            'Urinary urgency and frequency',
        ],
        differentialDiagnoses: ['appendicitis', 'pyelonephritis', 'aortic_aneurysm', 'ovarian_torsion', 'ectopic_pregnancy'],
        typicalVitals: {
            hr: [80, 120],
            bp_sys: [130, 180],
            bp_dia: [80, 110],
            temp: [36.5, 37.5],
            rr: [16, 24],
            spo2: [96, 99],
        },
        typicalLabs: [
            { test: 'Urinalysis', value: 'Hematuria (RBCs)', unit: '', abnormal: true },
            { test: 'CT abdomen (non-contrast)', value: 'Stone identified', unit: '', abnormal: true },
            { test: 'BMP', value: 'Check calcium, uric acid', unit: '', abnormal: false },
            { test: 'WBC', value: 'Normal (elevated suggests infection)', unit: '/uL', abnormal: false },
        ],
        atypicalVariants: [
            {
                description: 'Staghorn calculus — large stone filling renal pelvis, may present with dull chronic pain and recurrent UTIs',
                modifiedSymptoms: ['Dull flank ache', 'Recurrent UTIs', 'Microscopic hematuria', 'Mild symptoms'],
                probability: 0.1,
            },
        ],
        demographics: {
            ageRange: [20, 60],
            sexPredilection: 'male',
            riskFactors: ['Dehydration', 'High-protein diet', 'Family history', 'Obesity', 'Gout', 'Hyperparathyroidism'],
        },
        urgency: 'urgent',
        difficulty: [2, 5],
    },
    {
        id: 'pyelonephritis',
        name: 'Acute Pyelonephritis',
        category: 'renal',
        typicalSymptoms: [
            'Flank pain and costovertebral angle tenderness',
            'High fever and chills',
            'Dysuria and urinary frequency',
            'Nausea and vomiting',
            'Malaise',
        ],
        differentialDiagnoses: ['nephrolithiasis', 'appendicitis', 'cholecystitis', 'lower_lobe_pneumonia', 'muscle_strain'],
        typicalVitals: {
            hr: [90, 120],
            bp_sys: [100, 140],
            bp_dia: [60, 90],
            temp: [38.5, 40.5],
            rr: [16, 24],
            spo2: [95, 99],
        },
        typicalLabs: [
            { test: 'Urinalysis', value: 'WBC casts, bacteria, positive LE and nitrites', unit: '', abnormal: true },
            { test: 'Urine culture', value: '>100,000 CFU/mL', unit: '', abnormal: true },
            { test: 'WBC', value: '12000-25000', unit: '/uL', abnormal: true },
            { test: 'CRP', value: '>50', unit: 'mg/L', abnormal: true },
            { test: 'Blood cultures', value: 'May be positive', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Emphysematous pyelonephritis — gas-forming infection, more common in diabetics, rapid sepsis',
                modifiedSymptoms: ['Severe sepsis', 'Crepitus in flank', 'Rapid deterioration', 'Hemodynamic instability'],
                probability: 0.05,
            },
        ],
        demographics: {
            ageRange: [18, 75],
            sexPredilection: 'female',
            riskFactors: ['Female sex', 'Diabetes', 'Urinary obstruction', 'Vesicoureteral reflux', 'Pregnancy', 'Catheter use'],
        },
        urgency: 'urgent',
        difficulty: [2, 5],
    },

    // ═══════════════════════════════════════════════════════════════
    // MUSCULOSKELETAL
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'compartment_syndrome',
        name: 'Acute Compartment Syndrome',
        category: 'musculoskeletal',
        typicalSymptoms: [
            'Pain out of proportion to injury (5 Ps)',
            'Pain with passive stretch of involved muscles',
            'Tense swollen compartment',
            'Paresthesias',
            'Pallor (late finding)',
            'Pulselessness (very late, ominous)',
        ],
        differentialDiagnoses: ['dvt', 'fracture', 'muscle_strain', 'peripheral_artery_disease', 'necrotizing_fasciitis'],
        typicalVitals: {
            hr: [80, 120],
            bp_sys: [120, 160],
            bp_dia: [70, 100],
            temp: [36.5, 37.8],
            rr: [14, 24],
            spo2: [95, 99],
        },
        typicalLabs: [
            { test: 'Compartment pressure', value: '>30 mmHg or within 30 of diastolic', unit: 'mmHg', abnormal: true },
            { test: 'CK', value: '>1000', unit: 'U/L', abnormal: true },
            { test: 'Myoglobin', value: 'Elevated', unit: 'ng/mL', abnormal: true },
            { test: 'BMP', value: 'Check potassium, creatinine', unit: '', abnormal: false },
        ],
        atypicalVariants: [
            {
                description: 'Chronic exertional compartment syndrome — exercise-induced pain that resolves with rest, no acute emergency',
                modifiedSymptoms: ['Exercise-induced leg pain', 'Resolves with rest', 'Recurrent episodes', 'Normal exam at rest'],
                probability: 0.15,
            },
        ],
        demographics: {
            ageRange: [15, 60],
            sexPredilection: 'male',
            riskFactors: ['Tibial fracture', 'Crush injury', 'Burns', 'Tight cast', 'Vascular injury', 'Anticoagulation'],
        },
        urgency: 'emergent',
        difficulty: [5, 9],
    },
    {
        id: 'osteomyelitis',
        name: 'Acute Osteomyelitis',
        category: 'musculoskeletal',
        typicalSymptoms: [
            'Localized bone pain and tenderness',
            'Fever',
            'Warmth and swelling over affected bone',
            'Refusal to bear weight (children)',
            'Limited range of motion',
        ],
        differentialDiagnoses: ['cellulitis', 'septic_arthritis', 'fracture', 'bone_tumor', 'gout'],
        typicalVitals: {
            hr: [80, 110],
            bp_sys: [100, 140],
            bp_dia: [60, 90],
            temp: [38.0, 40.0],
            rr: [14, 22],
            spo2: [96, 99],
        },
        typicalLabs: [
            { test: 'WBC', value: '12000-20000', unit: '/uL', abnormal: true },
            { test: 'ESR', value: '>40', unit: 'mm/hr', abnormal: true },
            { test: 'CRP', value: '>30', unit: 'mg/L', abnormal: true },
            { test: 'Blood cultures', value: 'Positive in 50%', unit: '', abnormal: true },
            { test: 'MRI', value: 'Bone marrow edema, periosteal enhancement', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Chronic osteomyelitis — indolent course with draining sinus tract and intermittent flares',
                modifiedSymptoms: ['Draining sinus tract', 'Chronic pain', 'Low-grade fever', 'Intermittent flares'],
                probability: 0.2,
            },
        ],
        demographics: {
            ageRange: [5, 70],
            sexPredilection: 'male',
            riskFactors: ['Diabetes', 'Sickle cell disease', 'IV drug use', 'Trauma', 'Orthopedic hardware', 'Peripheral vascular disease'],
        },
        urgency: 'urgent',
        difficulty: [4, 7],
    },
    {
        id: 'septic_arthritis',
        name: 'Septic Arthritis',
        category: 'musculoskeletal',
        typicalSymptoms: [
            'Acute monoarticular joint pain (usually knee)',
            'Joint swelling and effusion',
            'Warmth and erythema over joint',
            'Severe pain with any range of motion',
            'Fever',
            'Inability to bear weight',
        ],
        differentialDiagnoses: ['gout', 'pseudogout', 'rheumatoid_arthritis_flare', 'reactive_arthritis', 'osteomyelitis', 'trauma'],
        typicalVitals: {
            hr: [85, 115],
            bp_sys: [100, 140],
            bp_dia: [60, 90],
            temp: [38.0, 40.0],
            rr: [14, 22],
            spo2: [96, 99],
        },
        typicalLabs: [
            { test: 'Synovial WBC', value: '>50000', unit: '/uL', abnormal: true },
            { test: 'Synovial culture', value: 'Positive (Staph aureus most common)', unit: '', abnormal: true },
            { test: 'Synovial crystals', value: 'Negative (rules out gout)', unit: '', abnormal: false },
            { test: 'WBC', value: '12000-20000', unit: '/uL', abnormal: true },
            { test: 'ESR/CRP', value: 'Elevated', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Gonococcal septic arthritis — migratory polyarthralgia progressing to monoarthritis with dermatitis',
                modifiedSymptoms: ['Migratory polyarthralgia', 'Tenosynovitis', 'Skin pustules', 'Urethral discharge'],
                probability: 0.15,
            },
        ],
        demographics: {
            ageRange: [18, 80],
            sexPredilection: null,
            riskFactors: ['Prosthetic joint', 'RA', 'Diabetes', 'IV drug use', 'Immunosuppression', 'Skin infection'],
        },
        urgency: 'emergent',
        difficulty: [4, 7],
    },

    // ═══════════════════════════════════════════════════════════════
    // PSYCHIATRIC
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'serotonin_syndrome',
        name: 'Serotonin Syndrome',
        category: 'psychiatric',
        typicalSymptoms: [
            'Agitation and altered mental status',
            'Hyperthermia',
            'Clonus (especially ocular and lower extremity)',
            'Hyperreflexia',
            'Diaphoresis',
            'Diarrhea',
            'Tremor and muscle rigidity',
        ],
        differentialDiagnoses: ['neuroleptic_malignant_syndrome', 'malignant_hyperthermia', 'anticholinergic_toxicity', 'thyroid_storm', 'meningitis'],
        typicalVitals: {
            hr: [100, 140],
            bp_sys: [140, 200],
            bp_dia: [80, 120],
            temp: [38.5, 41.0],
            rr: [20, 32],
            spo2: [92, 99],
        },
        typicalLabs: [
            { test: 'CK', value: '>1000', unit: 'U/L', abnormal: true },
            { test: 'WBC', value: '10000-18000', unit: '/uL', abnormal: true },
            { test: 'BMP', value: 'Metabolic acidosis possible', unit: '', abnormal: true },
            { test: 'LFTs', value: 'May be elevated', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Mild serotonin toxicity — tremor, diarrhea, and mild tachycardia only, without hyperthermia',
                modifiedSymptoms: ['Tremor', 'Diarrhea', 'Mild tachycardia', 'Mydriasis', 'Anxiety'],
                probability: 0.3,
            },
        ],
        demographics: {
            ageRange: [18, 75],
            sexPredilection: null,
            riskFactors: ['SSRI use', 'MAOI + serotonergic drug', 'Tramadol', 'Linezolid', 'St Johns Wort', 'Drug interactions'],
        },
        urgency: 'emergent',
        difficulty: [5, 9],
    },
    {
        id: 'nms',
        name: 'Neuroleptic Malignant Syndrome',
        category: 'psychiatric',
        typicalSymptoms: [
            'High fever',
            'Severe muscle rigidity (lead-pipe)',
            'Altered mental status',
            'Autonomic instability (labile BP, tachycardia, diaphoresis)',
            'Tremor',
        ],
        differentialDiagnoses: ['serotonin_syndrome', 'malignant_hyperthermia', 'lethal_catatonia', 'heat_stroke', 'meningitis', 'thyroid_storm'],
        typicalVitals: {
            hr: [100, 150],
            bp_sys: [90, 200],
            bp_dia: [60, 130],
            temp: [39.0, 42.0],
            rr: [20, 34],
            spo2: [88, 97],
        },
        typicalLabs: [
            { test: 'CK', value: '>10000', unit: 'U/L', abnormal: true },
            { test: 'WBC', value: '12000-30000', unit: '/uL', abnormal: true },
            { test: 'LFTs', value: 'Elevated', unit: '', abnormal: true },
            { test: 'Iron', value: 'Low', unit: 'mcg/dL', abnormal: true },
            { test: 'Myoglobin', value: 'Elevated', unit: 'ng/mL', abnormal: true },
            { test: 'Creatinine', value: 'Elevated (rhabdomyolysis)', unit: 'mg/dL', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'NMS from antiemetics — onset from metoclopramide or prochlorperazine, lower severity',
                modifiedSymptoms: ['Moderate rigidity', 'Low-grade fever', 'Confusion', 'Dystonia', 'Mild autonomic changes'],
                probability: 0.1,
            },
        ],
        demographics: {
            ageRange: [18, 70],
            sexPredilection: 'male',
            riskFactors: ['Recent neuroleptic initiation or dose increase', 'Dehydration', 'Agitation', 'IM injection route', 'Prior NMS episode'],
        },
        urgency: 'emergent',
        difficulty: [6, 10],
    },

    // ═══════════════════════════════════════════════════════════════
    // HEMATOLOGIC
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'ttp',
        name: 'Thrombotic Thrombocytopenic Purpura',
        category: 'hematologic',
        typicalSymptoms: [
            'Microangiopathic hemolytic anemia (fatigue, pallor, jaundice)',
            'Thrombocytopenia (petechiae, purpura, bleeding)',
            'Neurological symptoms (confusion, headache, seizures)',
            'Renal impairment',
            'Fever',
        ],
        differentialDiagnoses: ['hus', 'dic', 'itp', 'sle', 'hellp_syndrome', 'evan_syndrome'],
        typicalVitals: {
            hr: [90, 120],
            bp_sys: [100, 150],
            bp_dia: [60, 95],
            temp: [37.5, 39.5],
            rr: [14, 22],
            spo2: [94, 99],
        },
        typicalLabs: [
            { test: 'Platelets', value: '<30000', unit: '/uL', abnormal: true },
            { test: 'Peripheral smear', value: 'Schistocytes', unit: '', abnormal: true },
            { test: 'LDH', value: '>600', unit: 'U/L', abnormal: true },
            { test: 'Haptoglobin', value: '<10', unit: 'mg/dL', abnormal: true },
            { test: 'Indirect bilirubin', value: 'Elevated', unit: 'mg/dL', abnormal: true },
            { test: 'ADAMTS13', value: '<10%', unit: '', abnormal: true },
            { test: 'Coombs test', value: 'Negative', unit: '', abnormal: false },
        ],
        atypicalVariants: [
            {
                description: 'Incomplete TTP — only anemia and thrombocytopenia without neurological symptoms',
                modifiedSymptoms: ['Fatigue', 'Petechiae', 'Jaundice', 'No neurological symptoms'],
                probability: 0.2,
            },
        ],
        demographics: {
            ageRange: [20, 60],
            sexPredilection: 'female',
            riskFactors: ['Autoimmune diseases', 'Pregnancy', 'HIV', 'Medications (ticlopidine, clopidogrel, quinine)'],
        },
        urgency: 'emergent',
        difficulty: [7, 10],
    },
    {
        id: 'dic',
        name: 'Disseminated Intravascular Coagulation',
        category: 'hematologic',
        typicalSymptoms: [
            'Bleeding from multiple sites (IV sites, surgical wounds)',
            'Petechiae and purpura',
            'Organ dysfunction',
            'Symptoms of underlying cause (sepsis, trauma)',
            'Oozing from venipuncture sites',
        ],
        differentialDiagnoses: ['ttp', 'liver_failure', 'vitamin_k_deficiency', 'itp', 'heparin_induced_thrombocytopenia'],
        typicalVitals: {
            hr: [100, 140],
            bp_sys: [70, 120],
            bp_dia: [40, 80],
            temp: [36.0, 40.0],
            rr: [18, 30],
            spo2: [88, 97],
        },
        typicalLabs: [
            { test: 'Platelets', value: '<100000', unit: '/uL', abnormal: true },
            { test: 'PT/INR', value: 'Prolonged', unit: '', abnormal: true },
            { test: 'PTT', value: 'Prolonged', unit: 'seconds', abnormal: true },
            { test: 'Fibrinogen', value: '<150', unit: 'mg/dL', abnormal: true },
            { test: 'D-dimer', value: '>10', unit: 'mg/L', abnormal: true },
            { test: 'Peripheral smear', value: 'Schistocytes', unit: '', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Chronic compensated DIC — mild lab abnormalities, thrombotic predominance over bleeding',
                modifiedSymptoms: ['DVT or PE', 'Mild lab abnormalities', 'Chronic underlying disease', 'Minimal bleeding'],
                probability: 0.2,
            },
        ],
        demographics: {
            ageRange: [18, 85],
            sexPredilection: null,
            riskFactors: ['Sepsis', 'Trauma', 'Malignancy', 'Obstetric complications', 'Transfusion reaction', 'Burns'],
        },
        urgency: 'emergent',
        difficulty: [6, 10],
    },
    {
        id: 'sickle_cell_crisis',
        name: 'Sickle Cell Vaso-Occlusive Crisis',
        category: 'hematologic',
        typicalSymptoms: [
            'Severe pain (back, chest, extremities, abdomen)',
            'Tenderness over affected areas',
            'Low-grade fever',
            'Tachycardia',
            'Possible jaundice',
            'History of sickle cell disease',
        ],
        differentialDiagnoses: ['acute_chest_syndrome', 'osteomyelitis', 'avascular_necrosis', 'splenic_sequestration', 'aplastic_crisis'],
        typicalVitals: {
            hr: [90, 130],
            bp_sys: [100, 140],
            bp_dia: [60, 90],
            temp: [37.0, 39.0],
            rr: [16, 26],
            spo2: [88, 97],
        },
        typicalLabs: [
            { test: 'Hemoglobin', value: '6-9', unit: 'g/dL', abnormal: true },
            { test: 'Reticulocyte count', value: '>3%', unit: '', abnormal: true },
            { test: 'LDH', value: '>250', unit: 'U/L', abnormal: true },
            { test: 'Indirect bilirubin', value: 'Elevated', unit: 'mg/dL', abnormal: true },
            { test: 'WBC', value: 'May be elevated', unit: '/uL', abnormal: true },
        ],
        atypicalVariants: [
            {
                description: 'Acute chest syndrome — fever, chest pain, new pulmonary infiltrate, can rapidly progress to respiratory failure',
                modifiedSymptoms: ['Chest pain', 'Fever', 'Cough', 'Hypoxia', 'New lung infiltrate'],
                probability: 0.15,
            },
        ],
        demographics: {
            ageRange: [5, 50],
            sexPredilection: null,
            riskFactors: ['Sickle cell disease (HbSS)', 'Dehydration', 'Infection', 'Cold exposure', 'Hypoxia', 'Stress'],
        },
        urgency: 'urgent',
        difficulty: [3, 7],
    },
];

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Get a condition by its unique ID.
 * @param {string} id - The condition ID.
 * @returns {Condition|undefined}
 */
export function getConditionById(id) {
    return CONDITIONS_DB.find(c => c.id === id);
}

/**
 * Get all conditions whose difficulty range overlaps the given level.
 * @param {number} level - Difficulty level (1-10).
 * @returns {Condition[]}
 */
export function getConditionsByDifficulty(level) {
    return CONDITIONS_DB.filter(c => level >= c.difficulty[0] && level <= c.difficulty[1]);
}

/**
 * Get all conditions in a specific category.
 * @param {string} category - Category name (e.g., 'cardiovascular', 'respiratory').
 * @returns {Condition[]}
 */
export function getConditionsByCategory(category) {
    return CONDITIONS_DB.filter(c => c.category === category);
}
