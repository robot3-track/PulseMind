export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface SymptomInput {
  ageGroup: 'infant' | 'child' | 'teen' | 'adult' | 'senior';
  gender?: string;
  duration: 'hours' | '1-3days' | '1week' | '2+weeks' | 'chronic';
  severity: number; // 1 to 10
  bodySystem: string;
  primarySymptoms: string[];
  additionalNotes: string;
  preExistingConditions: string[];
  imageBase64?: string;
  imageMimeType?: string;
}

export interface PossibleCause {
  name: string;
  likelihood: 'High' | 'Medium' | 'Low';
  overview: string;
  urgency: 'Routine' | 'Prompt' | 'Urgent' | 'Emergency';
  keySymptomsMatch: string[];
}

export interface SymptomAnalysisResult {
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100
  summary: string;
  triageRecommendation: string;
  timeframeToAct: string;
  possibleCauses: PossibleCause[];
  redFlags: string[];
  homeCareAdvice: string[];
  doctorDiscussionQuestions: string[];
  suggestedSpecialty: string;
  sourceType: 'gemini-live' | 'fallback-clinical-rules';
}

export interface LabDecodeItem {
  term: string;
  originalText: string;
  plainEnglishMeaning: string;
  status: 'Normal' | 'Elevated' | 'Low' | 'Abnormal' | 'Critical' | 'Informational';
  referenceRange?: string;
  patientValue?: string;
  clinicalSignificance: string;
}

export interface LabDecodeResult {
  reportTitle: string;
  gradeLevelExplanation: string;
  overallSummary: string;
  keyTakeaways: string[];
  decodedItems: LabDecodeItem[];
  questionsForDoctor: string[];
  lifestyleOrNextSteps: string[];
  sourceType: 'gemini-live' | 'fallback-clinical-rules';
}

export interface VitalRecord {
  id: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  heartRate?: number | null; // bpm
  systolicBP?: number | null; // mmHg
  diastolicBP?: number | null; // mmHg
  spo2?: number | null; // %
  sleepHours?: number | null; // hours
  painLevel?: number | null; // 0-10
  notes?: string;
}

export interface SymptomLogEntry {
  id: string;
  timestamp: string;
  symptomName: string;
  severity: number; // 1-10
  triggers?: string;
  notes?: string;
  tags: string[];
}

export interface DailyHabit {
  id: string;
  title: string;
  category: 'hydration' | 'medication' | 'mobility' | 'mental' | 'vitals';
  completed: boolean;
  target: string;
}
