import { SymptomInput, SymptomAnalysisResult, LabDecodeResult } from './types';

export function generateFallbackSymptomAnalysis(input: SymptomInput): SymptomAnalysisResult {
  const symptomsArray = Array.isArray(input?.primarySymptoms) ? input.primarySymptoms : [];
  const symptomsLower = symptomsArray.map(s => String(s).toLowerCase()).join(' ') + ' ' + (input?.additionalNotes || '').toLowerCase();
  const severity = typeof input?.severity === 'number' ? input.severity : 3;
  const isHighSeverity = severity >= 8;
  const isModerateSeverity = severity >= 5 && severity < 8;

  // Check critical emergencies
  const hasChestPain = symptomsLower.includes('chest pain') || symptomsLower.includes('pressure in chest') || symptomsLower.includes('left arm pain');
  const hasSevereBreathing = symptomsLower.includes('difficulty breathing') || symptomsLower.includes('shortness of breath') || symptomsLower.includes('gasping');
  const hasNeuroDeficit = symptomsLower.includes('slurred speech') || symptomsLower.includes('facial drooping') || symptomsLower.includes('sudden numbness');

  if (hasChestPain || (hasSevereBreathing && isHighSeverity) || hasNeuroDeficit) {
    return {
      riskLevel: 'Critical',
      riskScore: 92,
      summary: 'Your reported combination of acute cardiopulmonary or neurological symptoms represents a high-priority clinical concern requiring immediate emergency triage.',
      triageRecommendation: 'Seek Immediate Emergency Medical Care (Call 911 or visit Nearest Emergency Room).',
      timeframeToAct: 'Immediately (within 15-30 minutes)',
      possibleCauses: [
        {
          name: 'Acute Coronary Syndrome / Ischemia',
          likelihood: 'High',
          overview: 'Compromised myocardial blood supply presenting with angina, chest pressure, or referred discomfort.',
          urgency: 'Emergency',
          keySymptomsMatch: ['Chest discomfort', 'Shortness of breath', 'High acute severity'],
        },
        {
          name: 'Pulmonary Embolism or Acute Bronchospasm',
          likelihood: 'Medium',
          overview: 'Vascular or airway compromise causing rapid ventilation-perfusion mismatch and acute dyspnea.',
          urgency: 'Emergency',
          keySymptomsMatch: ['Breathing difficulty', 'Elevated distress'],
        },
      ],
      redFlags: [
        'Crushing chest pressure radiating to left jaw, shoulder, or back',
        'Severe shortness of breath when resting',
        'Sudden loss of consciousness, cold sweats, or cyanosis (blue lips)',
      ],
      homeCareAdvice: [
        'Do not drive yourself to the hospital; have paramedics transport you.',
        'Sit upright in a comfortable position and loosen tight clothing.',
        'Chew an uncoated 325mg aspirin if advised by emergency dispatchers (and not allergic).',
      ],
      doctorDiscussionQuestions: [
        'What did the emergency 12-lead EKG and high-sensitivity Troponin markers reveal?',
        'Do I need immediate coronary angiography or advanced cardiopulmonary imaging?',
      ],
      suggestedSpecialty: 'Emergency Medicine / Interventional Cardiology',
      sourceType: 'fallback-clinical-rules',
    };
  }

  // Moderate / Common categories
  if (symptomsLower.includes('fever') || symptomsLower.includes('cough') || symptomsLower.includes('sore throat') || symptomsLower.includes('congestion')) {
    return {
      riskLevel: isModerateSeverity ? 'Moderate' : 'Low',
      riskScore: isModerateSeverity ? 55 : 32,
      summary: 'Symptoms strongly point towards an upper respiratory tract infection (viral vs. bacterial etiology) or seasonal tracheobronchitis.',
      triageRecommendation: isModerateSeverity
        ? 'Schedule a primary care or urgent care evaluation within 24-48 hours if fever persists > 3 days.'
        : 'Supportive home care with active monitoring over 3-5 days.',
      timeframeToAct: isModerateSeverity ? 'Within 24 to 48 hours' : 'Monitor over 3-5 days',
      possibleCauses: [
        {
          name: 'Acute Viral Upper Respiratory Infection (Common Cold / Rhinovirus)',
          likelihood: 'High',
          overview: 'Self-limiting viral inflammatory cascade affecting the nasopharynx, larynx, and upper bronchial tree.',
          urgency: 'Routine',
          keySymptomsMatch: ['Cough', 'Throat irritation', 'Congestion'],
        },
        {
          name: 'Influenza or COVID-19 Syndrome',
          likelihood: 'Medium',
          overview: 'Systemic viral illness characterized by sudden chills, myalgias (body aches), dry cough, and fatigue.',
          urgency: 'Prompt',
          keySymptomsMatch: ['Fever', 'Fatigue', 'Cough'],
        },
        {
          name: 'Streptococcal Pharyngitis or Acute Sinusitis',
          likelihood: 'Low',
          overview: 'Secondary bacterial infection that may benefit from rapid antigen testing and targeted antimicrobial therapy.',
          urgency: 'Prompt',
          keySymptomsMatch: ['Severe localized sore throat', 'Prolonged congestion'],
        },
      ],
      redFlags: [
        'Fever exceeding 103°F (39.4°C) unresponsive to antipyretics',
        'Stridor (high-pitched wheezing) or inability to swallow saliva',
        'Symptoms worsening significantly after temporary improvement ("double sickening")',
      ],
      homeCareAdvice: [
        'Maintain oral hydration (2.5-3.0 liters daily of electrolyte-rich liquids or warm broth).',
        'Use warm saline gargles (1/2 tsp salt in 8 oz warm water) 3-4 times daily.',
        'Utilize cool-mist humidification and elevation of the head of bed during sleep.',
      ],
      doctorDiscussionQuestions: [
        'Would a rapid COVID-19, Flu A/B, or Strep swab test clarify my diagnosis?',
        'At what point should I be concerned about secondary bacterial bronchitis or pneumonia?',
      ],
      suggestedSpecialty: 'Family Medicine / Primary Care',
      sourceType: 'fallback-clinical-rules',
    };
  }

  // Gastrointestinal
  if (symptomsLower.includes('stomach') || symptomsLower.includes('abdominal') || symptomsLower.includes('nausea') || symptomsLower.includes('diarrhea') || symptomsLower.includes('acid')) {
    return {
      riskLevel: isHighSeverity ? 'High' : 'Moderate',
      riskScore: isHighSeverity ? 72 : 48,
      summary: 'Gastrointestinal presentation consistent with acute gastroenteritis, functional dyspepsia, or localized mucosal irritation.',
      triageRecommendation: isHighSeverity
        ? 'Consult an urgent care physician today to evaluate abdominal tenderness and hydration status.'
        : 'Implement dietary resting (BRAT protocol) and monitor for 24-48 hours.',
      timeframeToAct: isHighSeverity ? 'Within 12 hours' : 'Within 48 hours',
      possibleCauses: [
        {
          name: 'Acute Viral Gastroenteritis ("Stomach Flu")',
          likelihood: 'High',
          overview: 'Inflammation of gastrointestinal lining leading to transient nausea, cramping, and altered bowel motility.',
          urgency: 'Routine',
          keySymptomsMatch: ['Nausea', 'Abdominal discomfort', 'Bowel changes'],
        },
        {
          name: 'Gastroesophageal Reflux Disease (GERD) / Gastritis',
          likelihood: 'Medium',
          overview: 'Acid hypersecretion and lower esophageal sphincter transient relaxation causing epigastric burn.',
          urgency: 'Routine',
          keySymptomsMatch: ['Stomach burning', 'Acid sensation', 'Postprandial fullness'],
        },
      ],
      redFlags: [
        'Severe, sharp pain focalized in right lower abdomen (appendicitis sign)',
        'Coffee-ground emesis (vomit) or black tarry stools (melena)',
        'Inability to tolerate oral fluids for over 18-24 hours with signs of dehydration',
      ],
      homeCareAdvice: [
        'Transition to clear fluids and oral rehydration salts before reintroducing bland solids.',
        'Avoid NSAIDs (ibuprofen, naproxen) which can exacerbate gastric mucosal irritation.',
        'Eat small, frequent low-fat meals and avoid lying down within 3 hours of eating.',
      ],
      doctorDiscussionQuestions: [
        'Could this be related to H. pylori infection or food intolerance?',
        'Do I need a prescription-strength proton pump inhibitor (PPI) or antispasmodic?',
      ],
      suggestedSpecialty: 'Gastroenterology / Internal Medicine',
      sourceType: 'fallback-clinical-rules',
    };
  }

  // General default fallback
  return {
    riskLevel: isHighSeverity ? 'High' : isModerateSeverity ? 'Moderate' : 'Low',
    riskScore: isHighSeverity ? 68 : isModerateSeverity ? 45 : 22,
    summary: `Based on your reported ${input.primarySymptoms.join(', ')} with a severity rating of ${severity}/10 over ${input.duration}, your symptom profile suggests localized inflammation or mild physiological strain.`,
    triageRecommendation: isHighSeverity
      ? 'Prompt clinical evaluation recommended within 24 hours to prevent symptom escalation.'
      : 'Conservative monitoring with supportive lifestyle adjustments over the next 48-72 hours.',
    timeframeToAct: isHighSeverity ? 'Within 24 hours' : '2 to 4 days',
    possibleCauses: [
      {
        name: 'Localized Musculoskeletal or Inflammatory Strain',
        likelihood: 'High',
        overview: 'Tissue irritation resulting from repetitive biomechanical stress, postural load, or minor trauma.',
        urgency: 'Routine',
        keySymptomsMatch: input.primarySymptoms.slice(0, 2),
      },
      {
        name: 'Systemic Fatigue / Immune Stress Response',
        likelihood: 'Medium',
        overview: 'Secondary somatic manifestation of disrupted circadian rhythm, mild viral reaction, or metabolic stress.',
        urgency: 'Routine',
        keySymptomsMatch: input.primarySymptoms.slice(0, 1),
      },
    ],
    redFlags: [
      'Rapid onset of unrelenting severe pain (≥ 9/10)',
      'Unexplained high fever accompanied by stiff neck or confusion',
      'Loss of bowel/bladder control or sudden progressive muscle weakness',
    ],
    homeCareAdvice: [
      'Ensure 7-9 hours of restorative sleep to optimize cellular repair.',
      'Maintain adequate hydration and balanced nutritional intake.',
      'Record symptom trajectory twice daily in the PulseMind tracker.',
    ],
    doctorDiscussionQuestions: [
      'What specific diagnostic blood panels or physical exams are recommended for these persistent symptoms?',
      'Are there non-pharmacological therapies or ergonomic adjustments that could help?',
    ],
    suggestedSpecialty: 'General Practice / Internal Medicine',
    sourceType: 'fallback-clinical-rules',
  };
}

export function generateFallbackLabDecode(rawText: string): LabDecodeResult {
  const textLower = rawText.toLowerCase();

  return {
    reportTitle: 'Diagnostic Lab Summary & Plain Language Analysis',
    gradeLevelExplanation: 'We reviewed your test numbers and converted complex clinical terminology into everyday English. Think of your lab report like a car maintenance checklist where each fluid level or sensor is tested to see if it is running smoothly.',
    overallSummary: 'Your lab report was analyzed to evaluate key biomarker values against standard clinical reference intervals. Review any out-of-range parameters directly with your medical provider.',
    keyTakeaways: [
      'Report processed and broken down into plain-language terminology.',
      'Identified biomarkers requiring targeted discussion during your next clinical appointment.',
      'Always confirm abnormal findings with your physician before altering medications or supplements.',
    ],
    decodedItems: [
      {
        term: 'Reported Lab Parameters',
        originalText: rawText.slice(0, 140) + (rawText.length > 140 ? '...' : ''),
        plainEnglishMeaning: 'Biochemical and physiological markers analyzed from your submitted laboratory results.',
        status: 'Informational',
        referenceRange: 'See laboratory reference column',
        patientValue: 'Recorded',
        clinicalSignificance: 'Provides clinical context for your health provider to track long-term health metrics.',
      },
    ],
    questionsForDoctor: [
      'Do any of these test results require a follow-up confirmation or repeat draw in 3-6 months?',
      'Are there specific lifestyle, hydration, or dietary adjustments recommended based on these values?',
      'Should we modify any current prescriptions or supplements in light of these findings?',
    ],
    lifestyleOrNextSteps: [
      'Maintain consistent daily hydration and balanced nutrition.',
      'Bring a printed or digital copy of this analysis to your scheduled provider consultation.',
      'Record your ongoing symptoms and daily vitals in PulseMind to monitor progress over time.',
    ],
    sourceType: 'fallback-clinical-rules',
  };
}

export const SAMPLE_LAB_PRESETS: { id: string; label: string; preview: string; rawText: string }[] = [];

export const INITIAL_VITALS_DATA: import('./types').VitalRecord[] = [];

export const INITIAL_SYMPTOM_LOGS: import('./types').SymptomLogEntry[] = [];

export const INITIAL_DAILY_HABITS: import('./types').DailyHabit[] = [
  { id: 'h-1', title: 'Target 2.5L Water Hydration', category: 'hydration', completed: false, target: '2500 ml' },
  { id: 'h-2', title: 'Morning Blood Pressure & Heart Rate Check', category: 'vitals', completed: false, target: '1 Reading' },
  { id: 'h-3', title: 'Daily Prescribed Supplements / Multivitamin', category: 'medication', completed: false, target: '1 Dose' },
  { id: 'h-4', title: '20-Minute Posture & Mobility Walk', category: 'mobility', completed: false, target: '20 Mins' },
  { id: 'h-5', title: '4-7-8 Parasympathetic Breathing Session', category: 'mental', completed: false, target: '5 Mins' },
];
