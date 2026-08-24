'use client';

import React, { useState } from 'react';
import {
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Upload,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Copy,
  Printer,
  BookmarkPlus,
  Info,
  ShieldAlert,
  Flame,
  User,
  HeartPulse,
  Eye,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { SymptomInput, SymptomAnalysisResult, RiskLevel } from '@/lib/types';
import { generateFallbackSymptomAnalysis } from '@/lib/fallbackData';

interface SymptomAnalyzerProps {
  onLogSymptomToDiary?: (symptomName: string, severity: number, notes: string) => void;
}

const BODY_SYSTEMS = [
  { id: 'Head & Neurological', label: 'Head & Neuro', icon: '🧠', common: ['Headache / Migraine', 'Dizziness / Vertigo', 'Brain Fog', 'Confusion', 'Vision Blur'] },
  { id: 'Chest & Respiratory', label: 'Chest & Lungs', icon: '🫁', common: ['Dry Cough', 'Productive Cough', 'Shortness of Breath', 'Chest Tightness', 'Wheezing'] },
  { id: 'Cardiovascular', label: 'Heart & Circulation', icon: '❤️', common: ['Chest Pressure / Squeezing', 'Heart Palpitations', 'Rapid Pulse', 'Cold Extremities', 'Swollen Ankles'] },
  { id: 'Abdomen & Gastrointestinal', label: 'Stomach & GI', icon: '🩺', common: ['Abdominal Pain / Cramps', 'Nausea / Vomiting', 'Acid Reflux / Heartburn', 'Bloating', 'Diarrhea'] },
  { id: 'Musculoskeletal & Joints', label: 'Joints & Muscles', icon: '🦴', common: ['Lower Back Pain', 'Joint Stiffness / Swelling', 'Muscle Aches / Myalgia', 'Neck Pain', 'Reduced Mobility'] },
  { id: 'Skin & Dermatology', label: 'Skin & Rashes', icon: '🩹', common: ['Itchy Rash / Hives', 'Skin Redness / Erythema', 'Unexplained Lesion / Bump', 'Dry Peeling Skin', 'Localized Swelling'] },
  { id: 'ENT & Throat', label: 'Throat, Ears & Nose', icon: '👂', common: ['Sore Throat', 'Nasal Congestion', 'Ear Fullness / Pain', 'Sinus Pressure', 'Loss of Taste/Smell'] },
  { id: 'General & Systemic', label: 'Whole Body / General', icon: '🌡️', common: ['Fever / Chills', 'Extreme Fatigue', 'Unexplained Weight Loss', 'Night Sweats', 'Body Weakness'] },
];

const PRE_EXISTING_OPTIONS = [
  'Hypertension (High BP)',
  'Type 2 Diabetes',
  'Asthma / COPD',
  'Coronary Artery Disease',
  'Acid Reflux (GERD)',
  'Thyroid Disorder',
  'Autoimmune Condition',
  'Chronic Kidney Disease',
  'Allergies / Hay Fever',
];

export default function SymptomAnalyzer({ onLogSymptomToDiary }: SymptomAnalyzerProps) {
  const [step, setStep] = useState<number>(1);
  const [customSymptomInput, setCustomSymptomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  const [analysisResult, setAnalysisResult] = useState<SymptomAnalysisResult | null>(null);
  const [copiedDoctorQuestions, setCopiedDoctorQuestions] = useState(false);
  const [loggedToDiarySuccess, setLoggedToDiarySuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState<SymptomInput>({
    ageGroup: 'adult',
    gender: 'Prefer not to say',
    duration: '1-3days',
    severity: 3,
    bodySystem: 'Head & Neurological',
    primarySymptoms: [],
    additionalNotes: '',
    preExistingConditions: [],
    imageBase64: undefined,
    imageMimeType: undefined,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleToggleSymptom = (symptom: string) => {
    setFormData((prev) => {
      const exists = prev.primarySymptoms.includes(symptom);
      return {
        ...prev,
        primarySymptoms: exists
          ? prev.primarySymptoms.filter((s) => s !== symptom)
          : [...prev.primarySymptoms, symptom],
      };
    });
  };

  const handleAddCustomSymptom = () => {
    if (!customSymptomInput.trim()) return;
    const trimmed = customSymptomInput.trim();
    if (!formData.primarySymptoms.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        primarySymptoms: [...prev.primarySymptoms, trimmed],
      }));
    }
    setCustomSymptomInput('');
  };

  const handleTogglePreExisting = (cond: string) => {
    setFormData((prev) => {
      const exists = prev.preExistingConditions.includes(cond);
      return {
        ...prev,
        preExistingConditions: exists
          ? prev.preExistingConditions.filter((c) => c !== cond)
          : [...prev.preExistingConditions, cond],
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      const base64Data = dataUrl.split(',')[1];
      setFormData((prev) => ({
        ...prev,
        imageBase64: base64Data,
        imageMimeType: file.type || 'image/jpeg',
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      imageBase64: undefined,
      imageMimeType: undefined,
    }));
  };

  const handleExecuteAnalysis = async () => {
    if (formData.primarySymptoms.length === 0) {
      alert('Please select or enter at least one symptom.');
      return;
    }

    setLoading(true);
    setAnalysisStage('Stratifying clinical risk level...');

    try {
      setTimeout(() => setAnalysisStage('Evaluating differential cause probabilities...'), 500);
      setTimeout(() => setAnalysisStage('Scanning contraindications & red flags...'), 1000);
      setTimeout(() => setAnalysisStage('Formulating tailored doctor discussion questions...'), 1500);

      const res = await fetch('/api/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Analysis service returned an error status');
      }

      const data = (await res.json()) as SymptomAnalysisResult;
      setAnalysisResult(data);
      setStep(4);
    } catch (err) {
      console.warn('Network or service exception during symptom analysis, utilizing local clinical fallback:', err);
      const fallback = generateFallbackSymptomAnalysis(formData);
      setAnalysisResult(fallback);
      setStep(4);
    } finally {
      setLoading(false);
      setAnalysisStage('');
    }
  };

  const handleCopyQuestions = () => {
    if (!analysisResult) return;
    const text = `Questions for my doctor regarding my symptoms:\n` +
      analysisResult.doctorDiscussionQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedDoctorQuestions(true);
    setTimeout(() => setCopiedDoctorQuestions(false), 2500);
  };

  const handleSaveToDiary = () => {
    if (!onLogSymptomToDiary || !analysisResult) return;
    const primaryName = formData.primarySymptoms.join(', ');
    const note = `[Risk: ${analysisResult.riskLevel} (${analysisResult.riskScore}/100)] ${analysisResult.summary}`;
    onLogSymptomToDiary(primaryName, formData.severity, note);
    setLoggedToDiarySuccess(true);
    setTimeout(() => setLoggedToDiarySuccess(false), 3000);
  };

  // Severity color helper
  const getSeverityLabel = (val: number) => {
    if (val <= 3) return { label: 'Mild (Noticeable, but easily manageable)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (val <= 6) return { label: 'Moderate (Interfering with daily routine)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (val <= 8) return { label: 'Severe (Significant distress / limited function)', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { label: 'Critical / Emergency (Debilitating / Acute crisis)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  // Risk badge colors
  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'Low':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          pill: 'bg-emerald-600 text-white',
          desc: 'Low Acuity — Typical for self-limiting or mild conditions.',
          ring: 'text-emerald-500',
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          pill: 'bg-amber-500 text-white',
          desc: 'Moderate Acuity — Outpatient consultation advised within 24-48h.',
          ring: 'text-amber-500',
        };
      case 'High':
        return {
          bg: 'bg-orange-50 border-orange-200 text-orange-950',
          pill: 'bg-orange-600 text-white',
          desc: 'High Acuity — Urgent medical evaluation strongly recommended today.',
          ring: 'text-orange-500',
        };
      case 'Critical':
        return {
          bg: 'bg-rose-50 border-rose-300 text-rose-950',
          pill: 'bg-rose-600 text-white animate-pulse',
          desc: 'Critical Emergency — Seek immediate emergency hospital care (911).',
          ring: 'text-rose-600',
        };
    }
  };

  return (
    <div id="symptom-risk-analyzer-section" className="space-y-8">
      {/* Header & Quick Presets Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Symptom Checker & Health Assessment</h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Assessment
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-3xl">
                Step-by-step guided check to assess symptom severity, possible causes, and when to seek care.
              </p>
            </div>
          </div>
        </div>

        {/* Multi-step progress indicator */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            {[
              { num: 1, label: 'Age & Severity' },
              { num: 2, label: 'Body Area & Symptoms' },
              { num: 3, label: 'History & Photo' },
              { num: 4, label: 'Assessment Results' },
            ].map((s) => (
              <button
                key={s.num}
                onClick={() => {
                  if (s.num < step || (s.num === 4 && analysisResult)) {
                    setStep(s.num);
                  }
                }}
                disabled={s.num > step && !analysisResult}
                className={`flex flex-col items-center group transition-all duration-200 ease-in-out ${
                  step === s.num
                    ? 'text-blue-600 font-bold'
                    : s.num < step
                    ? 'text-emerald-600'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ease-in-out ${
                    step === s.num
                      ? 'bg-blue-600 text-white shadow-xs ring-4 ring-blue-100'
                      : s.num < step
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {s.num < step ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-[11px] mt-2 text-center hidden sm:block max-w-[110px] leading-tight font-medium">
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STEP 1: Demographics & Severity */}
      {step === 1 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Step 1: Patient Age, Duration & Severity
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Helps calibrate recommendations to the appropriate age and symptom timeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Age Group */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Age Group
              </label>
              <select
                id="select-age-group"
                value={formData.ageGroup}
                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="infant">Infant (0 - 1 years)</option>
                <option value="child">Child (2 - 12 years)</option>
                <option value="teen">Teen (13 - 17 years)</option>
                <option value="adult">Adult (18 - 64 years)</option>
                <option value="senior">Senior (65+ years)</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                How Long Have You Had Symptoms?
              </label>
              <select
                id="select-duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="hours">Just started today (a few hours ago)</option>
                <option value="1-3days">1 to 3 days</option>
                <option value="1week">4 to 7 days</option>
                <option value="2+weeks">2 to 4 weeks</option>
                <option value="chronic">More than 1 month</option>
              </select>
            </div>
          </div>

          {/* Severity Slider */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Severity / Pain Level (1 - 10)
              </label>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {formData.severity} / 10
              </span>
            </div>

            {/* Visual Slider */}
            <input
              id="slider-severity"
              type="range"
              min="1"
              max="10"
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-md appearance-none cursor-pointer accent-blue-600"
            />

            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
              <span>1 - Mild</span>
              <span>5 - Moderate</span>
              <span>8 - Severe</span>
              <span>10 - Emergency</span>
            </div>

            {/* Severity explanation badge */}
            <div className={`mt-3 p-2.5 rounded-md border text-xs font-medium ${getSeverityLabel(formData.severity).color}`}>
              {getSeverityLabel(formData.severity).label}
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-6 border-t border-slate-100">
            <button
              id="step-1-next"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center gap-2 transition-all duration-200 ease-in-out shadow-xs"
            >
              <span>Next: Choose Symptoms</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Symptoms & Body Area */}
      {step === 2 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Step 2: Body Area & Symptoms
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select the affected body area, click applicable symptoms, or type custom symptoms.
            </p>
          </div>

          {/* Body System Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Primary Body Area
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BODY_SYSTEMS.map((sys) => {
                const isSelected = formData.bodySystem === sys.id;
                return (
                  <button
                    key={sys.id}
                    onClick={() => setFormData({ ...formData, bodySystem: sys.id })}
                    className={`p-4 rounded-lg border text-left transition-all duration-200 ease-in-out ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xl mb-1.5">{sys.icon}</div>
                    <div className="text-xs font-semibold leading-tight">{sys.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symptom Tag Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Common Symptoms for {formData.bodySystem}
            </label>
            <div className="flex flex-wrap gap-2.5">
              {BODY_SYSTEMS.find((s) => s.id === formData.bodySystem)?.common.map((symptom) => {
                const isSelected = formData.primarySymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    onClick={() => handleToggleSymptom(symptom)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ease-in-out ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />}
                    {symptom}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Symptom Add */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Add Another Symptom
            </label>
            <div className="flex gap-2.5">
              <input
                id="input-custom-symptom"
                type="text"
                value={customSymptomInput}
                onChange={(e) => setCustomSymptomInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSymptom()}
                placeholder="e.g. Sharp ache on right side, tingling in fingers..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              />
              <button
                id="btn-add-custom-symptom"
                onClick={handleAddCustomSymptom}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Currently Selected Badges */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
              Selected Symptoms ({formData.primarySymptoms.length}):
            </span>
            {formData.primarySymptoms.length === 0 ? (
              <p className="text-xs text-amber-700 font-medium">Please select at least one symptom to continue.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.primarySymptoms.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-900 rounded-md text-xs font-medium"
                  >
                    {s}
                    <button
                      onClick={() => handleToggleSymptom(s)}
                      className="hover:text-rose-600 transition-colors"
                      title="Remove symptom"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Step 2 Actions */}
          <div className="flex justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              id="step-2-next"
              disabled={formData.primarySymptoms.length === 0}
              onClick={() => setStep(3)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center gap-2 transition-all duration-200 ease-in-out shadow-xs"
            >
              <span>Next: History & Photo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Medical History, Notes & Photo Upload */}
      {step === 3 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Step 3: Medical History & Photo (Optional)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Add any chronic conditions, relevant notes, or an optional photo of visible symptoms (e.g. a rash or swelling).
            </p>
          </div>

          {/* Pre-existing Conditions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Existing Health Conditions (Optional)
            </label>
            <div className="flex flex-wrap gap-2.5">
              {PRE_EXISTING_OPTIONS.map((cond) => {
                const isSelected = formData.preExistingConditions.includes(cond);
                return (
                  <button
                    key={cond}
                    onClick={() => handleTogglePreExisting(cond)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ease-in-out ${
                      isSelected
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-emerald-400" />}
                    {cond}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Additional Details or Notes (Optional)
            </label>
            <textarea
              id="input-symptom-notes"
              rows={3}
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              placeholder="e.g. Started after eating, worse when bending over, no known drug allergies..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed transition-all duration-200"
            />
          </div>

          {/* Image Upload for Skin / Rash / Eye redness / Swelling */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Attach a Photo of the Symptom (Optional)
            </label>
            <p className="text-xs text-slate-500 mb-2.5">
              Helpful for skin rashes, swelling, insect bites, or eye redness.
            </p>

            {imagePreview ? (
              <div className="relative inline-block border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Symptom photo attachment"
                  className="max-h-48 max-w-full object-cover rounded-lg"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-md transition-colors"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="symptom-image-upload"
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-slate-600 group"
              >
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mb-2 transition-colors" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                  Click to select photo or drag and drop
                </span>
                <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB</span>
                <input
                  id="symptom-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Run Analysis CTA */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              id="run-symptom-analysis-btn"
              disabled={loading}
              onClick={handleExecuteAnalysis}
              className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs flex items-center gap-2 transition-all duration-200 ease-in-out"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{analysisStage || 'Analyzing Symptoms...'}</span>
                </>
              ) : (
                <>
                  <Stethoscope className="w-4 h-4" />
                  <span>Analyze Symptoms</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Analysis Results Display */}
      {step === 4 && analysisResult && (
        <div className="space-y-8">
          {/* Top Triage Action Banner */}
          <div
            className={`rounded-lg border p-6 sm:p-8 shadow-sm transition-all duration-200 ease-in-out ${
              getRiskBadge(analysisResult.riskLevel).bg
            }`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4 sm:gap-5">
                {/* Visual Risk Gauge Disc */}
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={getRiskBadge(analysisResult.riskLevel).ring}
                      strokeDasharray={`${analysisResult.riskScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-bold leading-none">{analysisResult.riskScore}</span>
                    <span className="text-[9px] text-slate-500 font-medium">/ 100</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded ${
                        getRiskBadge(analysisResult.riskLevel).pill
                      }`}
                    >
                      {analysisResult.riskLevel.toUpperCase()} RISK
                    </span>
                    <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Recommended Action: {analysisResult.timeframeToAct}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">
                    {analysisResult.triageRecommendation}
                  </h3>
                  <p className="text-xs sm:text-sm mt-2 opacity-90 leading-relaxed max-w-2xl">
                    {analysisResult.summary}
                  </p>
                </div>
              </div>

              {/* Action Buttons: New Screen & Save to Diary */}
              <div className="flex flex-row md:flex-col gap-2.5 self-stretch md:self-auto shrink-0">
                <button
                  id="save-to-diary-btn"
                  onClick={handleSaveToDiary}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 ease-in-out shadow-xs"
                >
                  <BookmarkPlus className="w-4 h-4 text-blue-400" />
                  <span>{loggedToDiarySuccess ? 'Saved to Diary!' : 'Save to Health Log'}</span>
                </button>
                <button
                  id="new-screening-btn"
                  onClick={() => setStep(1)}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 ease-in-out shadow-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>New Check</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid: Differential Causes & Red Flags */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Differential Causes */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-blue-600" />
                      Possible Causes to Discuss with Your Doctor
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ranked by symptom match and reported timeline.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                    Specialty: {analysisResult.suggestedSpecialty}
                  </span>
                </div>

                <div className="space-y-4">
                  {analysisResult.possibleCauses.map((cause, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-bold text-slate-900 text-sm sm:text-base">{cause.name}</div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                              cause.likelihood === 'High'
                                ? 'bg-indigo-100 text-indigo-800'
                                : cause.likelihood === 'Medium'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {cause.likelihood} match
                          </span>
                          <span className="text-xs font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {cause.urgency}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{cause.overview}</p>
                      {cause.keySymptomsMatch && cause.keySymptomsMatch.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200">
                          <span className="text-[10px] font-bold uppercase text-slate-400">Matching symptoms:</span>
                          {cause.keySymptomsMatch.map((m, i) => (
                            <span
                              key={i}
                              className="text-xs bg-white text-slate-700 px-2.5 py-0.5 rounded border border-slate-200 font-medium"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Supportive Home Care Guidance */}
              <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Helpful Self-Care Steps While Monitoring
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysisResult.homeCareAdvice.map((advice, i) => (
                    <div key={i} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{advice}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Red Flags & Doctor Questions */}
            <div className="space-y-6">
              {/* Red Flags Card */}
              <div className="bg-rose-50/80 rounded-lg border border-rose-200 p-6 space-y-4">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm sm:text-base">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span>Emergency Warning Signs</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  If you develop any of the following symptoms, seek immediate emergency medical care:
                </p>
                <div className="space-y-2.5">
                  {analysisResult.redFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-lg border border-rose-200 text-xs text-rose-950 font-medium flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions for Doctor */}
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    Questions to Ask Your Doctor
                  </h4>
                  <button
                    id="copy-doctor-questions-btn"
                    onClick={handleCopyQuestions}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 p-1 transition-colors"
                    title="Copy questions to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedDoctorQuestions ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="space-y-2.5">
                  {analysisResult.doctorDiscussionQuestions.map((q, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed flex gap-2.5">
                      <span className="font-bold text-blue-600">{idx + 1}.</span>
                      <span className="leading-relaxed">{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
