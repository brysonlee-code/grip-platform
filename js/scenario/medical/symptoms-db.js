// symptoms-db.js — Comprehensive medical symptoms database for G.R.I.P. platform
// ES Module — 200+ symptoms across all major body systems

export const SYMPTOMS_DB = [
    // ═══════════════════════════════════════════════════════════════
    // CARDIOVASCULAR (20 symptoms)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'sym_001',
        name: 'Chest Pain',
        category: 'cardiovascular',
        description: 'Substernal pressure or sharp pain in the chest, may radiate to arm, jaw, or back',
        associatedConditions: ['myocardial_infarction', 'angina', 'pulmonary_embolism', 'costochondritis', 'gerd', 'pneumothorax', 'aortic_dissection', 'pericarditis'],
        severity: 'severe',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_002',
        name: 'Palpitations',
        category: 'cardiovascular',
        description: 'Sensation of rapid, fluttering, or pounding heartbeat',
        associatedConditions: ['atrial_fibrillation', 'svt', 'anxiety', 'hyperthyroidism', 'anemia', 'pheochromocytoma'],
        severity: 'moderate',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_003',
        name: 'Peripheral Edema',
        category: 'cardiovascular',
        description: 'Swelling of the lower extremities due to fluid accumulation',
        associatedConditions: ['chf', 'dvt', 'nephrotic_syndrome', 'liver_cirrhosis', 'venous_insufficiency'],
        severity: 'moderate',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_004',
        name: 'Syncope',
        category: 'cardiovascular',
        description: 'Transient loss of consciousness with spontaneous recovery',
        associatedConditions: ['vasovagal', 'arrhythmia', 'aortic_stenosis', 'pulmonary_embolism', 'orthostatic_hypotension', 'seizure'],
        severity: 'severe',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_005',
        name: 'Orthopnea',
        category: 'cardiovascular',
        description: 'Difficulty breathing when lying flat, relieved by sitting upright',
        associatedConditions: ['chf', 'copd', 'asthma', 'obesity'],
        severity: 'moderate',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_006',
        name: 'Paroxysmal Nocturnal Dyspnea',
        category: 'cardiovascular',
        description: 'Sudden awakening from sleep with severe shortness of breath',
        associatedConditions: ['chf', 'asthma', 'copd'],
        severity: 'severe',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_007',
        name: 'Claudication',
        category: 'cardiovascular',
        description: 'Cramping leg pain with exertion that resolves with rest',
        associatedConditions: ['peripheral_artery_disease', 'spinal_stenosis'],
        severity: 'moderate',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_008',
        name: 'Jugular Venous Distension',
        category: 'cardiovascular',
        description: 'Visible distension of the jugular veins in the neck',
        associatedConditions: ['chf', 'cardiac_tamponade', 'tension_pneumothorax', 'pulmonary_embolism', 'constrictive_pericarditis'],
        severity: 'severe',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_009',
        name: 'Diaphoresis',
        category: 'cardiovascular',
        description: 'Profuse sweating unrelated to ambient temperature or exertion',
        associatedConditions: ['myocardial_infarction', 'hypoglycemia', 'sepsis', 'pheochromocytoma', 'thyroid_storm', 'anxiety'],
        severity: 'moderate',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_010',
        name: 'Cyanosis',
        category: 'cardiovascular',
        description: 'Bluish discoloration of the skin and mucous membranes',
        associatedConditions: ['chf', 'pulmonary_embolism', 'pneumothorax', 'copd', 'methemoglobinemia'],
        severity: 'severe',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_011',
        name: 'Heart Murmur',
        category: 'cardiovascular',
        description: 'Abnormal heart sound heard on auscultation',
        associatedConditions: ['endocarditis', 'valvular_disease', 'chf', 'anemia'],
        severity: 'moderate',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_012',
        name: 'Chest Tightness',
        category: 'cardiovascular',
        description: 'Sensation of constriction or squeezing in the chest',
        associatedConditions: ['angina', 'myocardial_infarction', 'asthma', 'anxiety', 'gerd'],
        severity: 'moderate',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_013',
        name: 'Presyncope',
        category: 'cardiovascular',
        description: 'Lightheadedness or near-fainting sensation without full loss of consciousness',
        associatedConditions: ['orthostatic_hypotension', 'arrhythmia', 'anemia', 'dehydration', 'vasovagal'],
        severity: 'moderate',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_014',
        name: 'S3 Gallop',
        category: 'cardiovascular',
        description: 'Third heart sound heard in early diastole, indicating volume overload',
        associatedConditions: ['chf', 'mitral_regurgitation'],
        severity: 'moderate',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_015',
        name: 'Unilateral Leg Swelling',
        category: 'cardiovascular',
        description: 'Asymmetric swelling of one leg with warmth and tenderness',
        associatedConditions: ['dvt', 'cellulitis', 'lymphedema', 'baker_cyst_rupture'],
        severity: 'moderate',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_016',
        name: 'Tearing Chest Pain',
        category: 'cardiovascular',
        description: 'Sudden, severe tearing or ripping sensation in the chest radiating to the back',
        associatedConditions: ['aortic_dissection', 'myocardial_infarction', 'pulmonary_embolism'],
        severity: 'severe',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_017',
        name: 'Exertional Dyspnea',
        category: 'cardiovascular',
        description: 'Shortness of breath that worsens with physical activity',
        associatedConditions: ['chf', 'angina', 'anemia', 'copd', 'pulmonary_hypertension'],
        severity: 'moderate',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_018',
        name: 'Cold Extremities',
        category: 'cardiovascular',
        description: 'Persistently cold hands and feet indicating poor peripheral perfusion',
        associatedConditions: ['peripheral_artery_disease', 'raynaud', 'chf', 'shock'],
        severity: 'mild',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_019',
        name: 'Blood Pressure Asymmetry',
        category: 'cardiovascular',
        description: 'Greater than 20 mmHg difference in systolic BP between arms',
        associatedConditions: ['aortic_dissection', 'subclavian_steal', 'coarctation_of_aorta'],
        severity: 'severe',
        bodySystem: 'cardiovascular'
    },
    {
        id: 'sym_020',
        name: 'Irregular Pulse',
        category: 'cardiovascular',
        description: 'Irregularly irregular or regularly irregular heartbeat on palpation',
        associatedConditions: ['atrial_fibrillation', 'premature_ventricular_contractions', 'atrial_flutter', 'heart_block'],
        severity: 'moderate',
        bodySystem: 'cardiovascular'
    },

    // ═══════════════════════════════════════════════════════════════
    // RESPIRATORY (20 symptoms)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'sym_021',
        name: 'Dyspnea',
        category: 'respiratory',
        description: 'Subjective sensation of difficulty breathing or air hunger',
        associatedConditions: ['pneumonia', 'asthma', 'copd', 'pulmonary_embolism', 'chf', 'pneumothorax', 'anemia'],
        severity: 'severe',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_022',
        name: 'Productive Cough',
        category: 'respiratory',
        description: 'Cough producing sputum or phlegm, may be purulent, bloody, or frothy',
        associatedConditions: ['pneumonia', 'copd', 'bronchitis', 'tuberculosis', 'lung_cancer', 'chf'],
        severity: 'moderate',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_023',
        name: 'Dry Cough',
        category: 'respiratory',
        description: 'Non-productive cough without sputum production',
        associatedConditions: ['asthma', 'ace_inhibitor_cough', 'gerd', 'viral_uri', 'interstitial_lung_disease', 'pulmonary_embolism'],
        severity: 'mild',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_024',
        name: 'Hemoptysis',
        category: 'respiratory',
        description: 'Coughing up blood or blood-tinged sputum',
        associatedConditions: ['lung_cancer', 'tuberculosis', 'pulmonary_embolism', 'bronchiectasis', 'pneumonia', 'goodpasture'],
        severity: 'severe',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_025',
        name: 'Wheezing',
        category: 'respiratory',
        description: 'High-pitched whistling sound during breathing, especially expiration',
        associatedConditions: ['asthma', 'copd', 'anaphylaxis', 'foreign_body', 'chf'],
        severity: 'moderate',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_026',
        name: 'Stridor',
        category: 'respiratory',
        description: 'High-pitched inspiratory sound indicating upper airway obstruction',
        associatedConditions: ['croup', 'epiglottitis', 'anaphylaxis', 'foreign_body', 'laryngeal_edema'],
        severity: 'severe',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_027',
        name: 'Pleuritic Chest Pain',
        category: 'respiratory',
        description: 'Sharp chest pain that worsens with inspiration or coughing',
        associatedConditions: ['pulmonary_embolism', 'pneumonia', 'pneumothorax', 'pleurisy', 'pericarditis'],
        severity: 'moderate',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_028',
        name: 'Tachypnea',
        category: 'respiratory',
        description: 'Respiratory rate greater than 20 breaths per minute in adults',
        associatedConditions: ['pneumonia', 'pulmonary_embolism', 'sepsis', 'dka', 'anxiety', 'asthma'],
        severity: 'moderate',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_029',
        name: 'Decreased Breath Sounds',
        category: 'respiratory',
        description: 'Diminished or absent breath sounds on auscultation of one or both lungs',
        associatedConditions: ['pneumothorax', 'pleural_effusion', 'copd', 'atelectasis'],
        severity: 'severe',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_030',
        name: 'Crackles (Rales)',
        category: 'respiratory',
        description: 'Discontinuous popping sounds heard during inspiration',
        associatedConditions: ['pneumonia', 'chf', 'pulmonary_fibrosis', 'atelectasis'],
        severity: 'moderate',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_031',
        name: 'Night Sweats',
        category: 'respiratory',
        description: 'Drenching sweats during sleep requiring change of bed linens',
        associatedConditions: ['tuberculosis', 'lymphoma', 'endocarditis', 'hiv', 'brucellosis'],
        severity: 'moderate',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_032',
        name: 'Sputum Production',
        category: 'respiratory',
        description: 'Expectoration of mucus, may be clear, yellow, green, or rust-colored',
        associatedConditions: ['pneumonia', 'copd', 'bronchitis', 'bronchiectasis', 'lung_abscess'],
        severity: 'mild',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_033',
        name: 'Accessory Muscle Use',
        category: 'respiratory',
        description: 'Use of neck and intercostal muscles to assist breathing',
        associatedConditions: ['asthma', 'copd', 'pneumothorax', 'anaphylaxis', 'respiratory_failure'],
        severity: 'severe',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_034',
        name: 'Barrel Chest',
        category: 'respiratory',
        description: 'Increased anteroposterior diameter of the chest',
        associatedConditions: ['copd', 'emphysema'],
        severity: 'mild',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_035',
        name: 'Tripod Positioning',
        category: 'respiratory',
        description: 'Patient leaning forward with hands on knees to ease breathing',
        associatedConditions: ['copd', 'asthma', 'chf', 'epiglottitis'],
        severity: 'moderate',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_036',
        name: 'Chest Wall Tenderness',
        category: 'respiratory',
        description: 'Pain on palpation of the chest wall',
        associatedConditions: ['costochondritis', 'rib_fracture', 'herpes_zoster'],
        severity: 'mild',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_037',
        name: 'Subcutaneous Emphysema',
        category: 'respiratory',
        description: 'Crackling sensation under the skin from air in subcutaneous tissue',
        associatedConditions: ['pneumothorax', 'pneumomediastinum', 'esophageal_rupture'],
        severity: 'severe',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_038',
        name: 'Chronic Cough',
        category: 'respiratory',
        description: 'Persistent cough lasting more than 8 weeks',
        associatedConditions: ['asthma', 'gerd', 'postnasal_drip', 'copd', 'lung_cancer', 'ace_inhibitor_cough'],
        severity: 'mild',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_039',
        name: 'Hypoxemia',
        category: 'respiratory',
        description: 'Abnormally low oxygen level in the blood (SpO2 < 90%)',
        associatedConditions: ['pneumonia', 'pulmonary_embolism', 'copd', 'ards', 'pneumothorax'],
        severity: 'severe',
        bodySystem: 'respiratory'
    },
    {
        id: 'sym_040',
        name: 'Weight Loss with Cough',
        category: 'respiratory',
        description: 'Unintentional weight loss accompanied by chronic cough',
        associatedConditions: ['lung_cancer', 'tuberculosis', 'lymphoma', 'hiv'],
        severity: 'moderate',
        bodySystem: 'respiratory'
    },

    // ═══════════════════════════════════════════════════════════════
    // NEUROLOGICAL (20 symptoms)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'sym_041',
        name: 'Headache',
        category: 'neurological',
        description: 'Pain in any region of the head, varying in location, intensity, and character',
        associatedConditions: ['migraine', 'tension_headache', 'meningitis', 'subarachnoid_hemorrhage', 'brain_tumor', 'temporal_arteritis'],
        severity: 'moderate',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_042',
        name: 'Unilateral Weakness',
        category: 'neurological',
        description: 'Weakness or paralysis affecting one side of the body',
        associatedConditions: ['stroke', 'tia', 'brain_tumor', 'todd_paralysis', 'ms'],
        severity: 'severe',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_043',
        name: 'Altered Mental Status',
        category: 'neurological',
        description: 'Change in cognitive function including confusion, lethargy, or agitation',
        associatedConditions: ['stroke', 'meningitis', 'sepsis', 'dka', 'hepatic_encephalopathy', 'hypoglycemia', 'drug_intoxication'],
        severity: 'severe',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_044',
        name: 'Seizure',
        category: 'neurological',
        description: 'Involuntary rhythmic movements due to abnormal electrical brain activity',
        associatedConditions: ['epilepsy', 'meningitis', 'brain_tumor', 'hypoglycemia', 'eclampsia', 'drug_withdrawal'],
        severity: 'severe',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_045',
        name: 'Neck Stiffness',
        category: 'neurological',
        description: 'Resistance to passive flexion of the neck (nuchal rigidity)',
        associatedConditions: ['meningitis', 'subarachnoid_hemorrhage', 'cervical_spondylosis'],
        severity: 'severe',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_046',
        name: 'Photophobia',
        category: 'neurological',
        description: 'Abnormal sensitivity or discomfort from light exposure',
        associatedConditions: ['meningitis', 'migraine', 'subarachnoid_hemorrhage', 'uveitis'],
        severity: 'moderate',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_047',
        name: 'Aphasia',
        category: 'neurological',
        description: 'Impaired ability to produce or comprehend language',
        associatedConditions: ['stroke', 'tia', 'brain_tumor', 'brain_abscess'],
        severity: 'severe',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_048',
        name: 'Facial Droop',
        category: 'neurological',
        description: 'Asymmetric weakness of the facial muscles',
        associatedConditions: ['stroke', 'tia', 'bells_palsy', 'brain_tumor'],
        severity: 'severe',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_049',
        name: 'Numbness and Tingling',
        category: 'neurological',
        description: 'Paresthesia or loss of sensation in extremities or focal areas',
        associatedConditions: ['stroke', 'ms', 'guillain_barre', 'diabetic_neuropathy', 'carpal_tunnel', 'tia'],
        severity: 'moderate',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_050',
        name: 'Visual Disturbances',
        category: 'neurological',
        description: 'Changes in vision including blurring, double vision, or visual field defects',
        associatedConditions: ['stroke', 'migraine', 'ms', 'brain_tumor', 'temporal_arteritis', 'glaucoma'],
        severity: 'moderate',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_051',
        name: 'Dizziness',
        category: 'neurological',
        description: 'Sensation of unsteadiness, lightheadedness, or the room spinning',
        associatedConditions: ['bppv', 'meniere', 'stroke', 'vestibular_neuritis', 'orthostatic_hypotension', 'anemia'],
        severity: 'moderate',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_052',
        name: 'Vertigo',
        category: 'neurological',
        description: 'Illusion of rotational movement of self or environment',
        associatedConditions: ['bppv', 'meniere', 'vestibular_neuritis', 'stroke', 'acoustic_neuroma'],
        severity: 'moderate',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_053',
        name: 'Tremor',
        category: 'neurological',
        description: 'Involuntary rhythmic oscillating movement of a body part',
        associatedConditions: ['parkinson', 'essential_tremor', 'hyperthyroidism', 'drug_withdrawal', 'cerebellar_disease'],
        severity: 'mild',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_054',
        name: 'Ataxia',
        category: 'neurological',
        description: 'Lack of voluntary coordination of muscle movements, unsteady gait',
        associatedConditions: ['cerebellar_stroke', 'ms', 'alcohol_intoxication', 'guillain_barre', 'wernicke_encephalopathy'],
        severity: 'moderate',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_055',
        name: 'Ascending Weakness',
        category: 'neurological',
        description: 'Progressive weakness starting in the legs and moving upward',
        associatedConditions: ['guillain_barre', 'transverse_myelitis', 'spinal_cord_compression'],
        severity: 'severe',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_056',
        name: 'Thunderclap Headache',
        category: 'neurological',
        description: 'Sudden, severe headache reaching maximum intensity within seconds',
        associatedConditions: ['subarachnoid_hemorrhage', 'cerebral_venous_thrombosis', 'pituitary_apoplexy'],
        severity: 'severe',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_057',
        name: 'Papilledema',
        category: 'neurological',
        description: 'Optic disc swelling due to increased intracranial pressure',
        associatedConditions: ['brain_tumor', 'idiopathic_intracranial_hypertension', 'meningitis', 'cerebral_venous_thrombosis'],
        severity: 'severe',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_058',
        name: 'Memory Loss',
        category: 'neurological',
        description: 'Difficulty forming new memories or recalling recent events',
        associatedConditions: ['dementia', 'stroke', 'brain_tumor', 'wernicke_encephalopathy', 'normal_pressure_hydrocephalus'],
        severity: 'moderate',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_059',
        name: 'Dysarthria',
        category: 'neurological',
        description: 'Slurred or difficult-to-understand speech due to motor dysfunction',
        associatedConditions: ['stroke', 'tia', 'ms', 'als', 'drug_intoxication'],
        severity: 'moderate',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_060',
        name: 'Areflexia',
        category: 'neurological',
        description: 'Absence of deep tendon reflexes',
        associatedConditions: ['guillain_barre', 'spinal_shock', 'peripheral_neuropathy', 'cauda_equina'],
        severity: 'severe',
        bodySystem: 'neurological'
    },

    // ═══════════════════════════════════════════════════════════════
    // GASTROINTESTINAL (20 symptoms)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'sym_061',
        name: 'Abdominal Pain',
        category: 'gastrointestinal',
        description: 'Pain or discomfort anywhere in the abdomen',
        associatedConditions: ['appendicitis', 'cholecystitis', 'pancreatitis', 'bowel_obstruction', 'peptic_ulcer', 'diverticulitis', 'aaa'],
        severity: 'moderate',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_062',
        name: 'Nausea and Vomiting',
        category: 'gastrointestinal',
        description: 'Sensation of stomach upset with or without emesis',
        associatedConditions: ['appendicitis', 'bowel_obstruction', 'pancreatitis', 'dka', 'myocardial_infarction', 'meningitis', 'pregnancy'],
        severity: 'moderate',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_063',
        name: 'Hematemesis',
        category: 'gastrointestinal',
        description: 'Vomiting of blood, either bright red or coffee-ground appearance',
        associatedConditions: ['gi_bleed_upper', 'peptic_ulcer', 'esophageal_varices', 'mallory_weiss', 'gastric_cancer'],
        severity: 'severe',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_064',
        name: 'Melena',
        category: 'gastrointestinal',
        description: 'Black, tarry, foul-smelling stools indicating upper GI bleeding',
        associatedConditions: ['gi_bleed_upper', 'peptic_ulcer', 'esophageal_varices', 'gastric_cancer'],
        severity: 'severe',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_065',
        name: 'Hematochezia',
        category: 'gastrointestinal',
        description: 'Bright red blood per rectum indicating lower GI bleeding',
        associatedConditions: ['gi_bleed_lower', 'diverticulosis', 'hemorrhoids', 'colorectal_cancer', 'inflammatory_bowel_disease'],
        severity: 'severe',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_066',
        name: 'Diarrhea',
        category: 'gastrointestinal',
        description: 'Frequent loose or watery stools',
        associatedConditions: ['gastroenteritis', 'inflammatory_bowel_disease', 'c_diff', 'celiac', 'hyperthyroidism', 'carcinoid'],
        severity: 'mild',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_067',
        name: 'Constipation',
        category: 'gastrointestinal',
        description: 'Infrequent or difficult passage of stool',
        associatedConditions: ['bowel_obstruction', 'hypothyroidism', 'colorectal_cancer', 'opioid_use', 'hypercalcemia'],
        severity: 'mild',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_068',
        name: 'Jaundice',
        category: 'gastrointestinal',
        description: 'Yellowing of the skin and sclera from elevated bilirubin',
        associatedConditions: ['hepatitis', 'choledocholithiasis', 'pancreatic_cancer', 'liver_cirrhosis', 'hemolytic_anemia', 'gilberts'],
        severity: 'moderate',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_069',
        name: 'Right Upper Quadrant Pain',
        category: 'gastrointestinal',
        description: 'Pain localized to the right upper quadrant of the abdomen',
        associatedConditions: ['cholecystitis', 'choledocholithiasis', 'hepatitis', 'liver_abscess', 'budd_chiari'],
        severity: 'moderate',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_070',
        name: 'Right Lower Quadrant Pain',
        category: 'gastrointestinal',
        description: 'Pain localized to the right lower quadrant of the abdomen',
        associatedConditions: ['appendicitis', 'ovarian_torsion', 'ectopic_pregnancy', 'mesenteric_lymphadenitis', 'crohn'],
        severity: 'moderate',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_071',
        name: 'Epigastric Pain',
        category: 'gastrointestinal',
        description: 'Pain in the upper central area of the abdomen',
        associatedConditions: ['pancreatitis', 'peptic_ulcer', 'gerd', 'myocardial_infarction', 'aortic_dissection'],
        severity: 'moderate',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_072',
        name: 'Abdominal Distension',
        category: 'gastrointestinal',
        description: 'Visible enlargement or bloating of the abdomen',
        associatedConditions: ['bowel_obstruction', 'ascites', 'ileus', 'ovarian_cancer'],
        severity: 'moderate',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_073',
        name: 'Absent Bowel Sounds',
        category: 'gastrointestinal',
        description: 'No bowel sounds heard on auscultation indicating ileus',
        associatedConditions: ['bowel_obstruction', 'peritonitis', 'postoperative_ileus', 'mesenteric_ischemia'],
        severity: 'severe',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_074',
        name: 'Dysphagia',
        category: 'gastrointestinal',
        description: 'Difficulty swallowing solids and/or liquids',
        associatedConditions: ['esophageal_cancer', 'stroke', 'achalasia', 'esophageal_stricture', 'gerd'],
        severity: 'moderate',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_075',
        name: 'Murphy Sign Positive',
        category: 'gastrointestinal',
        description: 'Inspiratory arrest during palpation of the right subcostal area',
        associatedConditions: ['cholecystitis'],
        severity: 'moderate',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_076',
        name: 'Rebound Tenderness',
        category: 'gastrointestinal',
        description: 'Pain that worsens upon sudden release of pressure during palpation',
        associatedConditions: ['appendicitis', 'peritonitis', 'diverticulitis', 'perforated_viscus'],
        severity: 'severe',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_077',
        name: 'Ascites',
        category: 'gastrointestinal',
        description: 'Accumulation of fluid in the peritoneal cavity',
        associatedConditions: ['liver_cirrhosis', 'chf', 'nephrotic_syndrome', 'ovarian_cancer', 'peritoneal_carcinomatosis'],
        severity: 'moderate',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_078',
        name: 'Anorexia',
        category: 'gastrointestinal',
        description: 'Loss of appetite or desire to eat',
        associatedConditions: ['appendicitis', 'hepatitis', 'cancer', 'depression', 'addison_crisis'],
        severity: 'mild',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_079',
        name: 'Guarding',
        category: 'gastrointestinal',
        description: 'Involuntary contraction of abdominal muscles on palpation',
        associatedConditions: ['appendicitis', 'peritonitis', 'pancreatitis', 'perforated_viscus'],
        severity: 'severe',
        bodySystem: 'gastrointestinal'
    },
    {
        id: 'sym_080',
        name: 'Borborygmi',
        category: 'gastrointestinal',
        description: 'High-pitched, hyperactive bowel sounds (tinkling)',
        associatedConditions: ['bowel_obstruction', 'gastroenteritis', 'early_obstruction'],
        severity: 'moderate',
        bodySystem: 'gastrointestinal'
    },

    // ═══════════════════════════════════════════════════════════════
    // MUSCULOSKELETAL (15 symptoms)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'sym_081',
        name: 'Joint Pain',
        category: 'musculoskeletal',
        description: 'Pain in one or more joints with or without swelling',
        associatedConditions: ['septic_arthritis', 'gout', 'rheumatoid_arthritis', 'osteoarthritis', 'reactive_arthritis'],
        severity: 'moderate',
        bodySystem: 'musculoskeletal'
    },
    {
        id: 'sym_082',
        name: 'Joint Swelling',
        category: 'musculoskeletal',
        description: 'Visible enlargement and effusion of a joint',
        associatedConditions: ['septic_arthritis', 'gout', 'rheumatoid_arthritis', 'hemarthrosis', 'pseudogout'],
        severity: 'moderate',
        bodySystem: 'musculoskeletal'
    },
    {
        id: 'sym_083',
        name: 'Back Pain',
        category: 'musculoskeletal',
        description: 'Pain in the lumbar, thoracic, or cervical spine',
        associatedConditions: ['disc_herniation', 'spinal_stenosis', 'cauda_equina', 'osteomyelitis', 'vertebral_fracture', 'aortic_dissection', 'kidney_stone'],
        severity: 'moderate',
        bodySystem: 'musculoskeletal'
    },
    {
        id: 'sym_084',
        name: 'Limb Pain Out of Proportion',
        category: 'musculoskeletal',
        description: 'Severe pain in an extremity disproportionate to physical findings',
        associatedConditions: ['compartment_syndrome', 'necrotizing_fasciitis', 'mesenteric_ischemia'],
        severity: 'severe',
        bodySystem: 'musculoskeletal'
    },
    {
        id: 'sym_085',
        name: 'Muscle Weakness',
        category: 'musculoskeletal',
        description: 'Decreased strength in one or more muscle groups',
        associatedConditions: ['guillain_barre', 'ms', 'myasthenia_gravis', 'polymyositis', 'rhabdomyolysis', 'hypokalemia'],
        severity: 'moderate',
        bodySystem: 'musculoskeletal'
    },
    {
        id: 'sym_086',
        name: 'Muscle Rigidity',
        category: 'musculoskeletal',
        description: 'Sustained involuntary muscle stiffness or spasm',
        associatedConditions: ['neuroleptic_malignant_syndrome', 'serotonin_syndrome', 'tetanus', 'malignant_hyperthermia'],
        severity: 'severe',
        bodySystem: 'musculoskeletal'
    },
    {
        id: 'sym_087',
        name: 'Hot Swollen Joint',
        category: 'musculoskeletal',
        description: 'Erythematous, warm, swollen joint with restricted range of motion',
        associatedConditions: ['septic_arthritis', 'gout', 'pseudogout', 'reactive_arthritis'],
        severity: 'severe',
        bodySystem: 'musculoskeletal'
    },
    {
        id: 'sym_088',
        name: 'Tense Compartment',
        category: 'musculoskeletal',
        description: 'Firm, tense, and painful muscle compartment on palpation',
        associatedConditions: ['compartment_syndrome'],
        severity: 'severe',
        bodySystem: 'musculoskeletal'
    },
    {
        id: 'sym_089',
        name: 'Pain with Passive Stretch',
        category: 'musculoskeletal',
        description: 'Severe pain elicited by passive movement of muscles in affected compartment',
        associatedConditions: ['compartment_syndrome', 'septic_arthritis', 'fracture'],
        severity: 'severe',
        bodySystem: 'musculoskeletal'
    },
    {
        id: 'sym_090',
        name: 'Saddle Anesthesia',
        category: 'musculoskeletal',
        description: 'Loss of sensation in the perineal region',
        associatedConditions: ['cauda_equina'],
        severity: 'severe',
        bodySystem: 'musculoskeletal'
    },
    {
        id: 'sym_091',
        name: 'Urinary Retention',
        category: 'musculoskeletal',
        description: 'Inability to voluntarily empty the bladder',
        associatedConditions: ['cauda_equina', 'bph', 'spinal_cord_compression', 'ms', 'anticholinergic_toxicity'],
        severity: 'severe',
        bodySystem: 'musculoskeletal'
    },
    {
        id: 'sym_092',
        name: 'Bone Pain',
        category: 'musculoskeletal',
        description: 'Deep, aching pain localized to bone, often worse at night',
        associatedConditions: ['osteomyelitis', 'bone_metastasis', 'sickle_cell_crisis', 'leukemia', 'multiple_myeloma'],
        severity: 'moderate',
        bodySystem: 'musculoskeletal'
    },
    {
        id: 'sym_093',
        name: 'Morning Stiffness',
        category: 'musculoskeletal',
        description: 'Joint stiffness worse in the morning lasting more than 30 minutes',
        associatedConditions: ['rheumatoid_arthritis', 'polymyalgia_rheumatica', 'ankylosing_spondylitis'],
        severity: 'mild',
        bodySystem: 'musculoskeletal'
    },
    {
        id: 'sym_094',
        name: 'Myalgia',
        category: 'musculoskeletal',
        description: 'Generalized muscle aches and pain',
        associatedConditions: ['influenza', 'rhabdomyolysis', 'fibromyalgia', 'polymyositis', 'statin_myopathy'],
        severity: 'mild',
        bodySystem: 'musculoskeletal'
    },
    {
        id: 'sym_095',
        name: 'Dark Urine (Tea-colored)',
        category: 'musculoskeletal',
        description: 'Dark brown or tea-colored urine suggesting myoglobinuria',
        associatedConditions: ['rhabdomyolysis', 'hemolytic_anemia', 'hepatitis'],
        severity: 'severe',
        bodySystem: 'musculoskeletal'
    },

    // ═══════════════════════════════════════════════════════════════
    // ENDOCRINE (15 symptoms)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'sym_096',
        name: 'Polyuria',
        category: 'endocrine',
        description: 'Excessive urination, often more than 3 liters per day',
        associatedConditions: ['dka', 'diabetes_mellitus', 'diabetes_insipidus', 'hypercalcemia'],
        severity: 'moderate',
        bodySystem: 'endocrine'
    },
    {
        id: 'sym_097',
        name: 'Polydipsia',
        category: 'endocrine',
        description: 'Excessive thirst leading to large volume fluid intake',
        associatedConditions: ['dka', 'diabetes_mellitus', 'diabetes_insipidus', 'hypercalcemia'],
        severity: 'moderate',
        bodySystem: 'endocrine'
    },
    {
        id: 'sym_098',
        name: 'Kussmaul Breathing',
        category: 'endocrine',
        description: 'Deep, labored, rapid breathing pattern typical of metabolic acidosis',
        associatedConditions: ['dka', 'uremia', 'metabolic_acidosis'],
        severity: 'severe',
        bodySystem: 'endocrine'
    },
    {
        id: 'sym_099',
        name: 'Fruity Breath Odor',
        category: 'endocrine',
        description: 'Sweet, fruity acetone smell on the breath',
        associatedConditions: ['dka'],
        severity: 'severe',
        bodySystem: 'endocrine'
    },
    {
        id: 'sym_100',
        name: 'Heat Intolerance',
        category: 'endocrine',
        description: 'Inability to tolerate warm environments with excessive sweating',
        associatedConditions: ['hyperthyroidism', 'thyroid_storm', 'pheochromocytoma'],
        severity: 'moderate',
        bodySystem: 'endocrine'
    },
    {
        id: 'sym_101',
        name: 'Weight Loss (Unintentional)',
        category: 'endocrine',
        description: 'Loss of more than 5% body weight without trying over 6-12 months',
        associatedConditions: ['hyperthyroidism', 'diabetes_mellitus', 'cancer', 'addison', 'hiv', 'tuberculosis'],
        severity: 'moderate',
        bodySystem: 'endocrine'
    },
    {
        id: 'sym_102',
        name: 'Hyperpigmentation',
        category: 'endocrine',
        description: 'Darkening of skin especially in creases, scars, and buccal mucosa',
        associatedConditions: ['addison', 'nelson_syndrome', 'hemochromatosis'],
        severity: 'mild',
        bodySystem: 'endocrine'
    },
    {
        id: 'sym_103',
        name: 'Tremulousness and Anxiety',
        category: 'endocrine',
        description: 'Fine tremor with feelings of nervousness and agitation',
        associatedConditions: ['hyperthyroidism', 'thyroid_storm', 'pheochromocytoma', 'hypoglycemia', 'anxiety'],
        severity: 'moderate',
        bodySystem: 'endocrine'
    },
    {
        id: 'sym_104',
        name: 'Cold Intolerance',
        category: 'endocrine',
        description: 'Inability to tolerate cold environments with low body temperature',
        associatedConditions: ['hypothyroidism', 'anemia', 'malnutrition'],
        severity: 'mild',
        bodySystem: 'endocrine'
    },
    {
        id: 'sym_105',
        name: 'Exophthalmos',
        category: 'endocrine',
        description: 'Protrusion of the eyeballs, often bilateral',
        associatedConditions: ['graves_disease', 'thyroid_storm'],
        severity: 'moderate',
        bodySystem: 'endocrine'
    },
    {
        id: 'sym_106',
        name: 'Hypoglycemic Symptoms',
        category: 'endocrine',
        description: 'Shakiness, sweating, confusion, tachycardia from low blood glucose',
        associatedConditions: ['hypoglycemia', 'insulinoma', 'addison_crisis', 'sepsis'],
        severity: 'severe',
        bodySystem: 'endocrine'
    },
    {
        id: 'sym_107',
        name: 'Goiter',
        category: 'endocrine',
        description: 'Visible enlargement of the thyroid gland',
        associatedConditions: ['graves_disease', 'hashimoto', 'thyroid_cancer', 'iodine_deficiency'],
        severity: 'mild',
        bodySystem: 'endocrine'
    },
    {
        id: 'sym_108',
        name: 'Episodic Hypertension',
        category: 'endocrine',
        description: 'Sudden severe elevations in blood pressure with headache, sweating, palpitations',
        associatedConditions: ['pheochromocytoma'],
        severity: 'severe',
        bodySystem: 'endocrine'
    },
    {
        id: 'sym_109',
        name: 'Fatigue',
        category: 'endocrine',
        description: 'Persistent tiredness and lack of energy not relieved by rest',
        associatedConditions: ['hypothyroidism', 'addison', 'diabetes_mellitus', 'anemia', 'depression', 'chf'],
        severity: 'mild',
        bodySystem: 'endocrine'
    },
    {
        id: 'sym_110',
        name: 'Orthostatic Hypotension',
        category: 'endocrine',
        description: 'Drop in blood pressure of >20/10 mmHg on standing',
        associatedConditions: ['addison_crisis', 'dehydration', 'autonomic_neuropathy', 'hypovolemia'],
        severity: 'moderate',
        bodySystem: 'endocrine'
    },

    // ═══════════════════════════════════════════════════════════════
    // DERMATOLOGICAL (15 symptoms)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'sym_111',
        name: 'Rash',
        category: 'dermatological',
        description: 'Generalized or localized skin eruption of varying morphology',
        associatedConditions: ['cellulitis', 'drug_reaction', 'meningococcemia', 'sle', 'stevens_johnson', 'measles'],
        severity: 'moderate',
        bodySystem: 'dermatological'
    },
    {
        id: 'sym_112',
        name: 'Petechiae',
        category: 'dermatological',
        description: 'Small, non-blanching pinpoint red spots from capillary bleeding',
        associatedConditions: ['ttp', 'dic', 'meningococcemia', 'itp', 'leukemia', 'endocarditis'],
        severity: 'severe',
        bodySystem: 'dermatological'
    },
    {
        id: 'sym_113',
        name: 'Purpura',
        category: 'dermatological',
        description: 'Larger non-blanching purple discoloration from bleeding under the skin',
        associatedConditions: ['ttp', 'dic', 'henoch_schonlein', 'vasculitis', 'warfarin_overdose'],
        severity: 'severe',
        bodySystem: 'dermatological'
    },
    {
        id: 'sym_114',
        name: 'Erythema',
        category: 'dermatological',
        description: 'Redness of the skin or mucous membranes',
        associatedConditions: ['cellulitis', 'erysipelas', 'drug_reaction', 'sunburn', 'necrotizing_fasciitis'],
        severity: 'mild',
        bodySystem: 'dermatological'
    },
    {
        id: 'sym_115',
        name: 'Skin Necrosis',
        category: 'dermatological',
        description: 'Dark, discolored areas of dead skin tissue',
        associatedConditions: ['necrotizing_fasciitis', 'warfarin_necrosis', 'calciphylaxis', 'dic'],
        severity: 'severe',
        bodySystem: 'dermatological'
    },
    {
        id: 'sym_116',
        name: 'Urticaria',
        category: 'dermatological',
        description: 'Raised, itchy, erythematous wheals on the skin (hives)',
        associatedConditions: ['allergic_reaction', 'anaphylaxis', 'drug_reaction', 'autoimmune'],
        severity: 'moderate',
        bodySystem: 'dermatological'
    },
    {
        id: 'sym_117',
        name: 'Malar Rash',
        category: 'dermatological',
        description: 'Butterfly-shaped rash across the cheeks and bridge of the nose',
        associatedConditions: ['sle', 'rosacea', 'dermatomyositis'],
        severity: 'moderate',
        bodySystem: 'dermatological'
    },
    {
        id: 'sym_118',
        name: 'Target Lesions',
        category: 'dermatological',
        description: 'Concentric ring-shaped skin lesions resembling a target',
        associatedConditions: ['erythema_multiforme', 'stevens_johnson'],
        severity: 'moderate',
        bodySystem: 'dermatological'
    },
    {
        id: 'sym_119',
        name: 'Vesicular Rash',
        category: 'dermatological',
        description: 'Fluid-filled blisters on the skin in a dermatomal or diffuse distribution',
        associatedConditions: ['herpes_zoster', 'varicella', 'herpes_simplex', 'pemphigus'],
        severity: 'moderate',
        bodySystem: 'dermatological'
    },
    {
        id: 'sym_120',
        name: 'Janeway Lesions',
        category: 'dermatological',
        description: 'Non-tender erythematous macules on the palms and soles',
        associatedConditions: ['endocarditis'],
        severity: 'moderate',
        bodySystem: 'dermatological'
    },
    {
        id: 'sym_121',
        name: 'Osler Nodes',
        category: 'dermatological',
        description: 'Painful, raised lesions on the fingers and toes',
        associatedConditions: ['endocarditis'],
        severity: 'moderate',
        bodySystem: 'dermatological'
    },
    {
        id: 'sym_122',
        name: 'Splinter Hemorrhages',
        category: 'dermatological',
        description: 'Linear reddish-brown streaks under the fingernails',
        associatedConditions: ['endocarditis', 'vasculitis', 'trauma'],
        severity: 'mild',
        bodySystem: 'dermatological'
    },
    {
        id: 'sym_123',
        name: 'Erythema Migrans',
        category: 'dermatological',
        description: 'Expanding circular rash with central clearing (bullseye)',
        associatedConditions: ['lyme_disease'],
        severity: 'moderate',
        bodySystem: 'dermatological'
    },
    {
        id: 'sym_124',
        name: 'Skin Warmth and Erythema',
        category: 'dermatological',
        description: 'Localized area of warmth and redness with poorly defined borders',
        associatedConditions: ['cellulitis', 'abscess', 'dvt', 'septic_arthritis'],
        severity: 'moderate',
        bodySystem: 'dermatological'
    },
    {
        id: 'sym_125',
        name: 'Diffuse Erythroderma',
        category: 'dermatological',
        description: 'Widespread redness and scaling affecting more than 90% of body surface',
        associatedConditions: ['drug_reaction', 'psoriasis', 'lymphoma', 'stevens_johnson'],
        severity: 'severe',
        bodySystem: 'dermatological'
    },

    // ═══════════════════════════════════════════════════════════════
    // PSYCHIATRIC (15 symptoms)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'sym_126',
        name: 'Agitation',
        category: 'psychiatric',
        description: 'Excessive restlessness with purposeless motor activity',
        associatedConditions: ['serotonin_syndrome', 'neuroleptic_malignant_syndrome', 'delirium', 'drug_intoxication', 'thyroid_storm'],
        severity: 'moderate',
        bodySystem: 'psychiatric'
    },
    {
        id: 'sym_127',
        name: 'Clonus',
        category: 'psychiatric',
        description: 'Involuntary rhythmic muscular contractions, especially at the ankles',
        associatedConditions: ['serotonin_syndrome', 'upper_motor_neuron_lesion'],
        severity: 'moderate',
        bodySystem: 'psychiatric'
    },
    {
        id: 'sym_128',
        name: 'Hyperthermia',
        category: 'psychiatric',
        description: 'Dangerously elevated body temperature above 40C/104F not due to infection',
        associatedConditions: ['neuroleptic_malignant_syndrome', 'serotonin_syndrome', 'malignant_hyperthermia', 'thyroid_storm', 'heat_stroke'],
        severity: 'severe',
        bodySystem: 'psychiatric'
    },
    {
        id: 'sym_129',
        name: 'Lead Pipe Rigidity',
        category: 'psychiatric',
        description: 'Constant resistance to passive movement throughout the range of motion',
        associatedConditions: ['neuroleptic_malignant_syndrome', 'parkinson'],
        severity: 'severe',
        bodySystem: 'psychiatric'
    },
    {
        id: 'sym_130',
        name: 'Dilated Pupils',
        category: 'psychiatric',
        description: 'Bilateral pupil dilation (mydriasis)',
        associatedConditions: ['serotonin_syndrome', 'sympathomimetic_toxicity', 'anticholinergic_toxicity', 'brain_death'],
        severity: 'moderate',
        bodySystem: 'psychiatric'
    },
    {
        id: 'sym_131',
        name: 'Confusion',
        category: 'psychiatric',
        description: 'Disorientation to person, place, time, or situation',
        associatedConditions: ['delirium', 'meningitis', 'hypoglycemia', 'stroke', 'sepsis', 'hepatic_encephalopathy', 'dka'],
        severity: 'moderate',
        bodySystem: 'psychiatric'
    },
    {
        id: 'sym_132',
        name: 'Hallucinations',
        category: 'psychiatric',
        description: 'Perceiving things that are not present (visual, auditory, or tactile)',
        associatedConditions: ['delirium', 'drug_withdrawal', 'psychosis', 'lewy_body_dementia', 'anticholinergic_toxicity'],
        severity: 'moderate',
        bodySystem: 'psychiatric'
    },
    {
        id: 'sym_133',
        name: 'Suicidal Ideation',
        category: 'psychiatric',
        description: 'Thoughts of ending one\'s own life, with or without a plan',
        associatedConditions: ['major_depression', 'bipolar', 'ptsd', 'substance_abuse'],
        severity: 'severe',
        bodySystem: 'psychiatric'
    },
    {
        id: 'sym_134',
        name: 'Psychomotor Retardation',
        category: 'psychiatric',
        description: 'Visible slowing of physical and emotional reactions',
        associatedConditions: ['major_depression', 'hypothyroidism', 'parkinson', 'catatonia'],
        severity: 'moderate',
        bodySystem: 'psychiatric'
    },
    {
        id: 'sym_135',
        name: 'Mutism',
        category: 'psychiatric',
        description: 'Absence or near-absence of speech despite apparent ability',
        associatedConditions: ['catatonia', 'severe_depression', 'stroke'],
        severity: 'severe',
        bodySystem: 'psychiatric'
    },
    {
        id: 'sym_136',
        name: 'Hyperreflexia',
        category: 'psychiatric',
        description: 'Exaggerated deep tendon reflexes',
        associatedConditions: ['serotonin_syndrome', 'upper_motor_neuron_lesion', 'hyperthyroidism', 'hypocalcemia'],
        severity: 'moderate',
        bodySystem: 'psychiatric'
    },
    {
        id: 'sym_137',
        name: 'Autonomic Instability',
        category: 'psychiatric',
        description: 'Fluctuating vital signs with tachycardia, labile BP, and diaphoresis',
        associatedConditions: ['neuroleptic_malignant_syndrome', 'serotonin_syndrome', 'pheochromocytoma', 'autonomic_dysreflexia'],
        severity: 'severe',
        bodySystem: 'psychiatric'
    },
    {
        id: 'sym_138',
        name: 'Disorganized Thinking',
        category: 'psychiatric',
        description: 'Incoherent thought processes with tangential or illogical speech',
        associatedConditions: ['psychosis', 'delirium', 'mania', 'schizophrenia'],
        severity: 'moderate',
        bodySystem: 'psychiatric'
    },
    {
        id: 'sym_139',
        name: 'Insomnia',
        category: 'psychiatric',
        description: 'Persistent difficulty initiating or maintaining sleep',
        associatedConditions: ['anxiety', 'depression', 'mania', 'hyperthyroidism', 'substance_abuse'],
        severity: 'mild',
        bodySystem: 'psychiatric'
    },
    {
        id: 'sym_140',
        name: 'Depressed Mood',
        category: 'psychiatric',
        description: 'Persistent feelings of sadness, emptiness, or hopelessness',
        associatedConditions: ['major_depression', 'bipolar', 'hypothyroidism', 'addison', 'chronic_illness'],
        severity: 'moderate',
        bodySystem: 'psychiatric'
    },

    // ═══════════════════════════════════════════════════════════════
    // RENAL (15 symptoms)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'sym_141',
        name: 'Oliguria',
        category: 'renal',
        description: 'Urine output less than 400 mL per day',
        associatedConditions: ['acute_kidney_injury', 'hypovolemia', 'urinary_obstruction', 'hepatorenal_syndrome'],
        severity: 'severe',
        bodySystem: 'renal'
    },
    {
        id: 'sym_142',
        name: 'Anuria',
        category: 'renal',
        description: 'Urine output less than 100 mL per day',
        associatedConditions: ['acute_kidney_injury', 'bilateral_ureteral_obstruction', 'renal_artery_occlusion'],
        severity: 'severe',
        bodySystem: 'renal'
    },
    {
        id: 'sym_143',
        name: 'Flank Pain',
        category: 'renal',
        description: 'Pain in the area between the ribs and hip on one or both sides',
        associatedConditions: ['nephrolithiasis', 'pyelonephritis', 'renal_infarction', 'perinephric_abscess'],
        severity: 'moderate',
        bodySystem: 'renal'
    },
    {
        id: 'sym_144',
        name: 'Hematuria',
        category: 'renal',
        description: 'Blood in the urine, either visible (gross) or microscopic',
        associatedConditions: ['nephrolithiasis', 'uti', 'glomerulonephritis', 'bladder_cancer', 'iga_nephropathy', 'pyelonephritis'],
        severity: 'moderate',
        bodySystem: 'renal'
    },
    {
        id: 'sym_145',
        name: 'Dysuria',
        category: 'renal',
        description: 'Pain or burning sensation during urination',
        associatedConditions: ['uti', 'urethritis', 'prostatitis', 'nephrolithiasis', 'std'],
        severity: 'mild',
        bodySystem: 'renal'
    },
    {
        id: 'sym_146',
        name: 'Urinary Frequency',
        category: 'renal',
        description: 'Need to urinate more often than normal',
        associatedConditions: ['uti', 'diabetes_mellitus', 'bph', 'overactive_bladder', 'prostatitis'],
        severity: 'mild',
        bodySystem: 'renal'
    },
    {
        id: 'sym_147',
        name: 'Costovertebral Angle Tenderness',
        category: 'renal',
        description: 'Pain elicited by percussion over the costovertebral angle',
        associatedConditions: ['pyelonephritis', 'nephrolithiasis', 'perinephric_abscess'],
        severity: 'moderate',
        bodySystem: 'renal'
    },
    {
        id: 'sym_148',
        name: 'Foamy Urine',
        category: 'renal',
        description: 'Persistent foam in the urine suggesting significant proteinuria',
        associatedConditions: ['nephrotic_syndrome', 'diabetic_nephropathy', 'glomerulonephritis'],
        severity: 'moderate',
        bodySystem: 'renal'
    },
    {
        id: 'sym_149',
        name: 'Colicky Flank Pain',
        category: 'renal',
        description: 'Severe, intermittent, cramping flank pain radiating to the groin',
        associatedConditions: ['nephrolithiasis', 'ureteral_obstruction'],
        severity: 'severe',
        bodySystem: 'renal'
    },
    {
        id: 'sym_150',
        name: 'Uremic Frost',
        category: 'renal',
        description: 'White crystalline deposit on the skin from severe uremia',
        associatedConditions: ['end_stage_renal_disease', 'severe_aki'],
        severity: 'severe',
        bodySystem: 'renal'
    },
    {
        id: 'sym_151',
        name: 'Periorbital Edema',
        category: 'renal',
        description: 'Swelling around the eyes, especially on waking',
        associatedConditions: ['nephrotic_syndrome', 'glomerulonephritis', 'hypothyroidism', 'allergic_reaction'],
        severity: 'moderate',
        bodySystem: 'renal'
    },
    {
        id: 'sym_152',
        name: 'Asterixis',
        category: 'renal',
        description: 'Flapping tremor of the outstretched hands',
        associatedConditions: ['hepatic_encephalopathy', 'uremia', 'hypercapnia'],
        severity: 'moderate',
        bodySystem: 'renal'
    },
    {
        id: 'sym_153',
        name: 'Uremic Pericarditis',
        category: 'renal',
        description: 'Pericardial friction rub in setting of severe renal failure',
        associatedConditions: ['end_stage_renal_disease', 'severe_aki'],
        severity: 'severe',
        bodySystem: 'renal'
    },
    {
        id: 'sym_154',
        name: 'Pruritus (Uremic)',
        category: 'renal',
        description: 'Intense generalized itching in the context of renal failure',
        associatedConditions: ['chronic_kidney_disease', 'end_stage_renal_disease'],
        severity: 'moderate',
        bodySystem: 'renal'
    },
    {
        id: 'sym_155',
        name: 'Suprapubic Pain',
        category: 'renal',
        description: 'Pain or tenderness in the lower midline abdomen above the pubic bone',
        associatedConditions: ['uti', 'urinary_retention', 'bladder_stones'],
        severity: 'mild',
        bodySystem: 'renal'
    },

    // ═══════════════════════════════════════════════════════════════
    // HEMATOLOGICAL (15 symptoms)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'sym_156',
        name: 'Pallor',
        category: 'hematological',
        description: 'Abnormally pale skin and mucous membranes',
        associatedConditions: ['anemia', 'shock', 'gi_bleed', 'leukemia', 'iron_deficiency'],
        severity: 'moderate',
        bodySystem: 'hematological'
    },
    {
        id: 'sym_157',
        name: 'Easy Bruising',
        category: 'hematological',
        description: 'Formation of bruises with minimal or no apparent trauma',
        associatedConditions: ['dic', 'ttp', 'itp', 'leukemia', 'liver_disease', 'von_willebrand'],
        severity: 'moderate',
        bodySystem: 'hematological'
    },
    {
        id: 'sym_158',
        name: 'Bleeding Gums',
        category: 'hematological',
        description: 'Spontaneous bleeding from the gingiva',
        associatedConditions: ['dic', 'leukemia', 'itp', 'vitamin_c_deficiency', 'warfarin_overdose'],
        severity: 'moderate',
        bodySystem: 'hematological'
    },
    {
        id: 'sym_159',
        name: 'Splenomegaly',
        category: 'hematological',
        description: 'Enlargement of the spleen on palpation',
        associatedConditions: ['leukemia', 'lymphoma', 'sickle_cell_crisis', 'mononucleosis', 'portal_hypertension', 'malaria'],
        severity: 'moderate',
        bodySystem: 'hematological'
    },
    {
        id: 'sym_160',
        name: 'Lymphadenopathy',
        category: 'hematological',
        description: 'Enlarged lymph nodes, either localized or generalized',
        associatedConditions: ['lymphoma', 'leukemia', 'hiv', 'mononucleosis', 'tuberculosis', 'metastatic_cancer'],
        severity: 'moderate',
        bodySystem: 'hematological'
    },
    {
        id: 'sym_161',
        name: 'Bone Pain (Sickle Cell)',
        category: 'hematological',
        description: 'Severe deep bone pain from vaso-occlusive crisis',
        associatedConditions: ['sickle_cell_crisis', 'leukemia', 'multiple_myeloma'],
        severity: 'severe',
        bodySystem: 'hematological'
    },
    {
        id: 'sym_162',
        name: 'Mucosal Bleeding',
        category: 'hematological',
        description: 'Bleeding from mucosal surfaces including epistaxis and oral cavity',
        associatedConditions: ['dic', 'ttp', 'itp', 'leukemia', 'coagulopathy'],
        severity: 'moderate',
        bodySystem: 'hematological'
    },
    {
        id: 'sym_163',
        name: 'Microangiopathic Hemolytic Signs',
        category: 'hematological',
        description: 'Signs of red cell fragmentation: schistocytes, elevated LDH, low haptoglobin',
        associatedConditions: ['ttp', 'dic', 'hus', 'hellp'],
        severity: 'severe',
        bodySystem: 'hematological'
    },
    {
        id: 'sym_164',
        name: 'Scleral Icterus',
        category: 'hematological',
        description: 'Yellowing of the whites of the eyes from elevated indirect bilirubin',
        associatedConditions: ['hemolytic_anemia', 'sickle_cell_crisis', 'gilbert', 'hepatitis'],
        severity: 'moderate',
        bodySystem: 'hematological'
    },
    {
        id: 'sym_165',
        name: 'Epistaxis',
        category: 'hematological',
        description: 'Spontaneous bleeding from the nose',
        associatedConditions: ['thrombocytopenia', 'dic', 'von_willebrand', 'hypertension', 'warfarin_overdose'],
        severity: 'mild',
        bodySystem: 'hematological'
    },
    {
        id: 'sym_166',
        name: 'Priapism',
        category: 'hematological',
        description: 'Persistent, painful erection unrelated to sexual stimulation',
        associatedConditions: ['sickle_cell_crisis', 'leukemia', 'medication_side_effect'],
        severity: 'severe',
        bodySystem: 'hematological'
    },
    {
        id: 'sym_167',
        name: 'Acute Chest Syndrome Signs',
        category: 'hematological',
        description: 'Fever, chest pain, and new pulmonary infiltrate in sickle cell patient',
        associatedConditions: ['sickle_cell_crisis'],
        severity: 'severe',
        bodySystem: 'hematological'
    },
    {
        id: 'sym_168',
        name: 'Thrombocytopenia Signs',
        category: 'hematological',
        description: 'Petechiae, purpura, and mucosal bleeding from low platelet count',
        associatedConditions: ['ttp', 'dic', 'itp', 'hus', 'leukemia', 'aplastic_anemia'],
        severity: 'severe',
        bodySystem: 'hematological'
    },
    {
        id: 'sym_169',
        name: 'Pancytopenia Signs',
        category: 'hematological',
        description: 'Combination of anemia, leukopenia, and thrombocytopenia symptoms',
        associatedConditions: ['aplastic_anemia', 'leukemia', 'myelodysplastic', 'b12_deficiency'],
        severity: 'severe',
        bodySystem: 'hematological'
    },
    {
        id: 'sym_170',
        name: 'Venous Thrombosis Symptoms',
        category: 'hematological',
        description: 'Pain, swelling, warmth, and erythema in affected extremity',
        associatedConditions: ['dvt', 'antiphospholipid', 'factor_v_leiden', 'cancer'],
        severity: 'moderate',
        bodySystem: 'hematological'
    },

    // ═══════════════════════════════════════════════════════════════
    // INFECTIOUS DISEASE (15 symptoms)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'sym_171',
        name: 'Fever',
        category: 'infectious',
        description: 'Elevated body temperature above 38.0C (100.4F)',
        associatedConditions: ['sepsis', 'pneumonia', 'uti', 'meningitis', 'endocarditis', 'cellulitis', 'appendicitis', 'abscess'],
        severity: 'moderate',
        bodySystem: 'infectious'
    },
    {
        id: 'sym_172',
        name: 'Rigors',
        category: 'infectious',
        description: 'Severe shaking chills with teeth chattering, often preceding fever spikes',
        associatedConditions: ['sepsis', 'bacteremia', 'malaria', 'pyelonephritis', 'endocarditis', 'abscess'],
        severity: 'moderate',
        bodySystem: 'infectious'
    },
    {
        id: 'sym_173',
        name: 'Tachycardia with Fever',
        category: 'infectious',
        description: 'Elevated heart rate associated with febrile illness',
        associatedConditions: ['sepsis', 'pneumonia', 'uti', 'endocarditis', 'meningitis'],
        severity: 'moderate',
        bodySystem: 'infectious'
    },
    {
        id: 'sym_174',
        name: 'Hypotension',
        category: 'infectious',
        description: 'Abnormally low blood pressure (systolic <90 mmHg)',
        associatedConditions: ['sepsis', 'anaphylaxis', 'hemorrhagic_shock', 'cardiogenic_shock', 'addison_crisis'],
        severity: 'severe',
        bodySystem: 'infectious'
    },
    {
        id: 'sym_175',
        name: 'Wound Erythema',
        category: 'infectious',
        description: 'Redness, warmth, and swelling around a wound or skin break',
        associatedConditions: ['cellulitis', 'wound_infection', 'necrotizing_fasciitis', 'abscess'],
        severity: 'moderate',
        bodySystem: 'infectious'
    },
    {
        id: 'sym_176',
        name: 'Purulent Drainage',
        category: 'infectious',
        description: 'Discharge of pus from a wound, abscess, or body cavity',
        associatedConditions: ['abscess', 'cellulitis', 'osteomyelitis', 'septic_arthritis', 'wound_infection'],
        severity: 'moderate',
        bodySystem: 'infectious'
    },
    {
        id: 'sym_177',
        name: 'Sepsis Signs',
        category: 'infectious',
        description: 'Systemic inflammatory response: fever/hypothermia, tachycardia, tachypnea, altered mental status',
        associatedConditions: ['sepsis'],
        severity: 'severe',
        bodySystem: 'infectious'
    },
    {
        id: 'sym_178',
        name: 'Meningeal Signs',
        category: 'infectious',
        description: 'Positive Kernig and Brudzinski signs with neck stiffness',
        associatedConditions: ['meningitis', 'subarachnoid_hemorrhage'],
        severity: 'severe',
        bodySystem: 'infectious'
    },
    {
        id: 'sym_179',
        name: 'High Spiking Fever',
        category: 'infectious',
        description: 'Temperature above 39.5C (103F) with rapid onset',
        associatedConditions: ['sepsis', 'endocarditis', 'abscess', 'malaria', 'drug_fever'],
        severity: 'severe',
        bodySystem: 'infectious'
    },
    {
        id: 'sym_180',
        name: 'Crepitus over Skin',
        category: 'infectious',
        description: 'Palpable crackling in subcutaneous tissue from gas-producing organisms',
        associatedConditions: ['necrotizing_fasciitis', 'gas_gangrene'],
        severity: 'severe',
        bodySystem: 'infectious'
    },
    {
        id: 'sym_181',
        name: 'Rapidly Spreading Erythema',
        category: 'infectious',
        description: 'Erythema expanding beyond marked boundaries over hours',
        associatedConditions: ['cellulitis', 'necrotizing_fasciitis', 'erysipelas'],
        severity: 'severe',
        bodySystem: 'infectious'
    },
    {
        id: 'sym_182',
        name: 'Positive Blood Cultures',
        category: 'infectious',
        description: 'Growth of pathogenic organisms from blood cultures',
        associatedConditions: ['sepsis', 'endocarditis', 'bacteremia', 'line_infection'],
        severity: 'severe',
        bodySystem: 'infectious'
    },
    {
        id: 'sym_183',
        name: 'Productive Sputum with Fever',
        category: 'infectious',
        description: 'Purulent sputum production with accompanying fever',
        associatedConditions: ['pneumonia', 'lung_abscess', 'bronchitis', 'tuberculosis'],
        severity: 'moderate',
        bodySystem: 'infectious'
    },
    {
        id: 'sym_184',
        name: 'Toxic Appearance',
        category: 'infectious',
        description: 'Ill-appearing patient with lethargy, poor perfusion, and signs of systemic toxicity',
        associatedConditions: ['sepsis', 'meningitis', 'necrotizing_fasciitis', 'toxic_shock'],
        severity: 'severe',
        bodySystem: 'infectious'
    },
    {
        id: 'sym_185',
        name: 'Warm Flushed Skin',
        category: 'infectious',
        description: 'Warm, pink skin with bounding pulses in early distributive shock',
        associatedConditions: ['sepsis', 'anaphylaxis', 'thyroid_storm'],
        severity: 'moderate',
        bodySystem: 'infectious'
    },

    // ═══════════════════════════════════════════════════════════════
    // OPHTHALMOLOGIC (10 symptoms)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'sym_186',
        name: 'Sudden Vision Loss',
        category: 'ophthalmologic',
        description: 'Abrupt painless or painful loss of vision in one or both eyes',
        associatedConditions: ['retinal_artery_occlusion', 'retinal_detachment', 'temporal_arteritis', 'optic_neuritis', 'stroke'],
        severity: 'severe',
        bodySystem: 'ophthalmologic'
    },
    {
        id: 'sym_187',
        name: 'Eye Pain',
        category: 'ophthalmologic',
        description: 'Pain in or around the eye, may be sharp or deep aching',
        associatedConditions: ['acute_glaucoma', 'uveitis', 'optic_neuritis', 'corneal_abrasion', 'orbital_cellulitis'],
        severity: 'moderate',
        bodySystem: 'ophthalmologic'
    },
    {
        id: 'sym_188',
        name: 'Red Eye',
        category: 'ophthalmologic',
        description: 'Conjunctival injection or hemorrhage visible on inspection',
        associatedConditions: ['conjunctivitis', 'acute_glaucoma', 'uveitis', 'subconjunctival_hemorrhage', 'corneal_abrasion'],
        severity: 'mild',
        bodySystem: 'ophthalmologic'
    },
    {
        id: 'sym_189',
        name: 'Fixed Dilated Pupil',
        category: 'ophthalmologic',
        description: 'Unilateral mid-dilated pupil unreactive to light',
        associatedConditions: ['acute_glaucoma', 'third_nerve_palsy', 'brain_herniation', 'trauma'],
        severity: 'severe',
        bodySystem: 'ophthalmologic'
    },
    {
        id: 'sym_190',
        name: 'Visual Field Defect',
        category: 'ophthalmologic',
        description: 'Loss of vision in a portion of the visual field',
        associatedConditions: ['stroke', 'brain_tumor', 'retinal_detachment', 'glaucoma', 'optic_neuritis'],
        severity: 'moderate',
        bodySystem: 'ophthalmologic'
    },
    {
        id: 'sym_191',
        name: 'Diplopia',
        category: 'ophthalmologic',
        description: 'Double vision, either monocular or binocular',
        associatedConditions: ['stroke', 'ms', 'myasthenia_gravis', 'third_nerve_palsy', 'orbital_tumor'],
        severity: 'moderate',
        bodySystem: 'ophthalmologic'
    },
    {
        id: 'sym_192',
        name: 'Proptosis',
        category: 'ophthalmologic',
        description: 'Unilateral forward displacement of the eye',
        associatedConditions: ['orbital_cellulitis', 'graves_disease', 'orbital_tumor', 'cavernous_sinus_thrombosis'],
        severity: 'moderate',
        bodySystem: 'ophthalmologic'
    },
    {
        id: 'sym_193',
        name: 'Amaurosis Fugax',
        category: 'ophthalmologic',
        description: 'Transient monocular vision loss described as a curtain coming down',
        associatedConditions: ['tia', 'carotid_artery_disease', 'temporal_arteritis'],
        severity: 'severe',
        bodySystem: 'ophthalmologic'
    },
    {
        id: 'sym_194',
        name: 'Floaters and Flashes',
        category: 'ophthalmologic',
        description: 'New onset of floating spots or light flashes in vision',
        associatedConditions: ['retinal_detachment', 'vitreous_detachment', 'retinal_tear'],
        severity: 'moderate',
        bodySystem: 'ophthalmologic'
    },
    {
        id: 'sym_195',
        name: 'Halos Around Lights',
        category: 'ophthalmologic',
        description: 'Seeing colored rings or halos around light sources',
        associatedConditions: ['acute_glaucoma', 'cataracts', 'corneal_edema'],
        severity: 'moderate',
        bodySystem: 'ophthalmologic'
    },

    // ═══════════════════════════════════════════════════════════════
    // ENT (15 symptoms)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'sym_196',
        name: 'Sore Throat',
        category: 'ENT',
        description: 'Pain or irritation in the throat, especially with swallowing',
        associatedConditions: ['pharyngitis', 'peritonsillar_abscess', 'epiglottitis', 'mononucleosis', 'gerd'],
        severity: 'mild',
        bodySystem: 'ENT'
    },
    {
        id: 'sym_197',
        name: 'Trismus',
        category: 'ENT',
        description: 'Inability to open the mouth fully due to muscle spasm',
        associatedConditions: ['peritonsillar_abscess', 'tetanus', 'tmj_disorder', 'submandibular_abscess'],
        severity: 'moderate',
        bodySystem: 'ENT'
    },
    {
        id: 'sym_198',
        name: 'Drooling',
        category: 'ENT',
        description: 'Inability to manage oral secretions, saliva dripping from mouth',
        associatedConditions: ['epiglottitis', 'peritonsillar_abscess', 'stroke', 'retropharyngeal_abscess'],
        severity: 'severe',
        bodySystem: 'ENT'
    },
    {
        id: 'sym_199',
        name: 'Muffled Voice (Hot Potato Voice)',
        category: 'ENT',
        description: 'Thick, muffled quality to the voice as if speaking with a full mouth',
        associatedConditions: ['peritonsillar_abscess', 'epiglottitis', 'retropharyngeal_abscess'],
        severity: 'moderate',
        bodySystem: 'ENT'
    },
    {
        id: 'sym_200',
        name: 'Hearing Loss',
        category: 'ENT',
        description: 'Decreased ability to hear, may be unilateral or bilateral',
        associatedConditions: ['otitis_media', 'meniere', 'acoustic_neuroma', 'cerumen_impaction', 'cholesteatoma'],
        severity: 'moderate',
        bodySystem: 'ENT'
    },
    {
        id: 'sym_201',
        name: 'Tinnitus',
        category: 'ENT',
        description: 'Perception of ringing, buzzing, or humming in the ears',
        associatedConditions: ['meniere', 'acoustic_neuroma', 'noise_exposure', 'ototoxicity', 'tmj_disorder'],
        severity: 'mild',
        bodySystem: 'ENT'
    },
    {
        id: 'sym_202',
        name: 'Ear Pain (Otalgia)',
        category: 'ENT',
        description: 'Pain in or around the ear',
        associatedConditions: ['otitis_media', 'otitis_externa', 'mastoiditis', 'referred_pain_from_pharynx'],
        severity: 'moderate',
        bodySystem: 'ENT'
    },
    {
        id: 'sym_203',
        name: 'Nasal Congestion',
        category: 'ENT',
        description: 'Blockage or stuffiness in the nasal passages',
        associatedConditions: ['sinusitis', 'viral_uri', 'allergic_rhinitis', 'nasal_polyps'],
        severity: 'mild',
        bodySystem: 'ENT'
    },
    {
        id: 'sym_204',
        name: 'Facial Pain and Pressure',
        category: 'ENT',
        description: 'Pain and fullness over the sinuses, especially forehead and cheeks',
        associatedConditions: ['sinusitis', 'dental_abscess', 'trigeminal_neuralgia', 'temporal_arteritis'],
        severity: 'moderate',
        bodySystem: 'ENT'
    },
    {
        id: 'sym_205',
        name: 'Hoarseness',
        category: 'ENT',
        description: 'Change in voice quality to a rough or breathy sound',
        associatedConditions: ['laryngitis', 'vocal_cord_paralysis', 'laryngeal_cancer', 'gerd', 'thyroid_cancer'],
        severity: 'mild',
        bodySystem: 'ENT'
    },
    {
        id: 'sym_206',
        name: 'Uvular Deviation',
        category: 'ENT',
        description: 'Displacement of the uvula to one side on oral exam',
        associatedConditions: ['peritonsillar_abscess'],
        severity: 'moderate',
        bodySystem: 'ENT'
    },
    {
        id: 'sym_207',
        name: 'Nystagmus',
        category: 'ENT',
        description: 'Involuntary rhythmic oscillation of the eyes',
        associatedConditions: ['bppv', 'meniere', 'vestibular_neuritis', 'cerebellar_stroke', 'ms'],
        severity: 'moderate',
        bodySystem: 'ENT'
    },
    {
        id: 'sym_208',
        name: 'Postnasal Drip',
        category: 'ENT',
        description: 'Sensation of mucus draining from the nose into the throat',
        associatedConditions: ['sinusitis', 'allergic_rhinitis', 'viral_uri'],
        severity: 'mild',
        bodySystem: 'ENT'
    },
    {
        id: 'sym_209',
        name: 'Neck Mass',
        category: 'ENT',
        description: 'Palpable mass or swelling in the neck',
        associatedConditions: ['lymphoma', 'thyroid_cancer', 'reactive_lymphadenopathy', 'branchial_cleft_cyst', 'metastatic_cancer'],
        severity: 'moderate',
        bodySystem: 'ENT'
    },
    {
        id: 'sym_210',
        name: 'Anosmia',
        category: 'ENT',
        description: 'Loss of the sense of smell',
        associatedConditions: ['viral_uri', 'nasal_polyps', 'brain_tumor', 'parkinson', 'head_trauma'],
        severity: 'mild',
        bodySystem: 'ENT'
    },

    // ═══════════════════════════════════════════════════════════════
    // ADDITIONAL GENERAL/SYSTEMIC (5 symptoms)
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'sym_211',
        name: 'Malaise',
        category: 'infectious',
        description: 'General feeling of discomfort, illness, or unease',
        associatedConditions: ['sepsis', 'influenza', 'hepatitis', 'mononucleosis', 'endocarditis', 'cancer'],
        severity: 'mild',
        bodySystem: 'infectious'
    },
    {
        id: 'sym_212',
        name: 'Chills',
        category: 'infectious',
        description: 'Sensation of cold with shivering, often accompanying fever',
        associatedConditions: ['sepsis', 'pneumonia', 'pyelonephritis', 'malaria', 'endocarditis'],
        severity: 'moderate',
        bodySystem: 'infectious'
    },
    {
        id: 'sym_213',
        name: 'Weight Gain',
        category: 'endocrine',
        description: 'Unintentional increase in body weight over weeks to months',
        associatedConditions: ['hypothyroidism', 'cushing', 'chf', 'nephrotic_syndrome', 'polycystic_ovary'],
        severity: 'mild',
        bodySystem: 'endocrine'
    },
    {
        id: 'sym_214',
        name: 'Generalized Weakness',
        category: 'neurological',
        description: 'Subjective feeling of decreased strength affecting the entire body',
        associatedConditions: ['anemia', 'hypothyroidism', 'addison', 'myasthenia_gravis', 'electrolyte_imbalance', 'sepsis'],
        severity: 'moderate',
        bodySystem: 'neurological'
    },
    {
        id: 'sym_215',
        name: 'Dehydration Signs',
        category: 'renal',
        description: 'Dry mucous membranes, decreased skin turgor, sunken eyes',
        associatedConditions: ['dka', 'gastroenteritis', 'addison_crisis', 'heat_stroke', 'hypovolemic_shock'],
        severity: 'moderate',
        bodySystem: 'renal'
    }
];


// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all symptoms associated with a given condition ID.
 * Searches the associatedConditions array of each symptom.
 * @param {string} conditionId - The condition identifier to search for
 * @returns {object[]} Array of matching symptom objects
 */
export function getSymptomsByCondition(conditionId) {
    return SYMPTOMS_DB.filter(symptom =>
        symptom.associatedConditions.includes(conditionId)
    );
}

/**
 * Get all symptoms belonging to a given category.
 * @param {string} category - The category to filter by (e.g., 'cardiovascular', 'respiratory')
 * @returns {object[]} Array of matching symptom objects
 */
export function getSymptomsByCategory(category) {
    return SYMPTOMS_DB.filter(symptom =>
        symptom.category.toLowerCase() === category.toLowerCase()
    );
}

/**
 * Get a random selection of symptoms, optionally filtered by category.
 * Uses Fisher-Yates shuffle for unbiased selection.
 * @param {number} count - Number of random symptoms to return
 * @param {string} [category] - Optional category to filter by
 * @returns {object[]} Array of randomly selected symptom objects
 */
export function getRandomSymptoms(count, category) {
    let pool = category
        ? SYMPTOMS_DB.filter(s => s.category.toLowerCase() === category.toLowerCase())
        : [...SYMPTOMS_DB];

    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return pool.slice(0, Math.min(count, pool.length));
}

/**
 * Get all symptoms at or above a given severity level.
 * @param {string} minSeverity - Minimum severity: 'mild', 'moderate', or 'severe'
 * @returns {object[]} Array of matching symptom objects
 */
export function getSymptomsBySeverity(minSeverity) {
    const severityOrder = { mild: 1, moderate: 2, severe: 3 };
    const minLevel = severityOrder[minSeverity] || 1;
    return SYMPTOMS_DB.filter(symptom =>
        (severityOrder[symptom.severity] || 0) >= minLevel
    );
}

/**
 * Look up a single symptom by its ID.
 * @param {string} id - The symptom ID (e.g., 'sym_001')
 * @returns {object|undefined} The matching symptom object or undefined
 */
export function getSymptomById(id) {
    return SYMPTOMS_DB.find(symptom => symptom.id === id);
}
