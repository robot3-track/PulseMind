'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import SymptomAnalyzer from '@/components/SymptomAnalyzer';
import LabDecoder from '@/components/LabDecoder';
import VitalsTracker from '@/components/VitalsTracker';
import InteractiveBreathing from '@/components/InteractiveBreathing';
import EmergencyGuideModal from '@/components/EmergencyGuideModal';
import InitialSetupModal from '@/components/InitialSetupModal';
import Footer from '@/components/Footer';
import { VitalRecord, SymptomLogEntry, DailyHabit } from '@/lib/types';
import {
  INITIAL_VITALS_DATA,
  INITIAL_SYMPTOM_LOGS,
  INITIAL_DAILY_HABITS,
} from '@/lib/fallbackData';
import {
  Stethoscope,
  FileText,
  Activity,
  Wind,
  AlertOctagon,
  Sparkles,
  ShieldCheck,
  HeartPulse,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'symptoms' | 'lab' | 'vitals' | 'breathing'>('symptoms');
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [initialSetupOpen, setInitialSetupOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hasCompletedSetup = localStorage.getItem('pulsemind_setup_completed');
      return !hasCompletedSetup;
    }
    return false;
  });

  // Persistent States
  const [vitals, setVitals] = useState<VitalRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulsemind_vitals');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_VITALS_DATA;
  });

  const [symptomLogs, setSymptomLogs] = useState<SymptomLogEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulsemind_symptom_logs');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_SYMPTOM_LOGS;
  });

  const [habits, setHabits] = useState<DailyHabit[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulsemind_habits');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_DAILY_HABITS;
  });

  // Save to LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulsemind_vitals', JSON.stringify(vitals));
    }
  }, [vitals]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulsemind_symptom_logs', JSON.stringify(symptomLogs));
    }
  }, [symptomLogs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulsemind_habits', JSON.stringify(habits));
    }
  }, [habits]);

  // Vitals Handler
  const handleAddVital = (newV: Omit<VitalRecord, 'id' | 'timestamp'>) => {
    const entry: VitalRecord = {
      ...newV,
      id: `v-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setVitals((prev) => [...prev, entry]);
  };

  // Setup Modal Handlers
  const handleSaveInitialSetup = (values: Omit<VitalRecord, 'id' | 'timestamp'>) => {
    const entry: VitalRecord = {
      ...values,
      id: `v-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setVitals((prev) => [...prev, entry]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulsemind_setup_completed', 'true');
    }
    setInitialSetupOpen(false);
  };

  const handleSkipInitialSetup = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulsemind_setup_completed', 'true');
    }
    setInitialSetupOpen(false);
  };

  // Symptom Log Handler
  const handleAddSymptomLog = (newLog: Omit<SymptomLogEntry, 'id' | 'timestamp'>) => {
    const entry: SymptomLogEntry = {
      ...newLog,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setSymptomLogs((prev) => [entry, ...prev]);
  };

  const handleDeleteSymptomLog = (id: string) => {
    setSymptomLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleToggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  const handleLogSymptomFromAnalyzer = (symptomName: string, severity: number, notes: string) => {
    handleAddSymptomLog({
      symptomName,
      severity,
      notes,
      triggers: 'Logged from Symptom Risk Analyzer',
      tags: ['AI Screening', 'Clinical Intake'],
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col antialiased">
      {/* Permanent Medical Compliance Notice */}
      <DisclaimerBanner />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenEmergency={() => setEmergencyModalOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Hub Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Symptoms */}
          <button
            id="hub-tab-symptoms"
            onClick={() => setActiveTab('symptoms')}
            className={`p-5 rounded-lg border text-left transition-all duration-200 ease-in-out relative overflow-hidden ${
              activeTab === 'symptoms'
                ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-600'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors duration-200 ${
                  activeTab === 'symptoms'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Step 1
              </span>
            </div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">Symptom Checker</h2>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">
              Check symptoms & possible causes
            </p>
          </button>

          {/* Card 2: Lab Decoder */}
          <button
            id="hub-tab-lab"
            onClick={() => setActiveTab('lab')}
            className={`p-5 rounded-lg border text-left transition-all duration-200 ease-in-out relative overflow-hidden ${
              activeTab === 'lab'
                ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-600'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors duration-200 ${
                  activeTab === 'lab'
                    ? 'bg-blue-600 text-white'
                    : 'bg-indigo-50 text-indigo-700'
                }`}
              >
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Step 2
              </span>
            </div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">Lab & Notes Explainer</h2>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">
              Plain-language test results
            </p>
          </button>

          {/* Card 3: Vitals */}
          <button
            id="hub-tab-vitals"
            onClick={() => setActiveTab('vitals')}
            className={`p-5 rounded-lg border text-left transition-all duration-200 ease-in-out relative overflow-hidden ${
              activeTab === 'vitals'
                ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-600'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors duration-200 ${
                  activeTab === 'vitals'
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Step 3
              </span>
            </div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">Daily Vitals & Log</h2>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">
              Track vitals and symptoms
            </p>
          </button>

          {/* Card 4: Breathing */}
          <button
            id="hub-tab-breathing"
            onClick={() => setActiveTab('breathing')}
            className={`p-5 rounded-lg border text-left transition-all duration-200 ease-in-out relative overflow-hidden ${
              activeTab === 'breathing'
                ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-600'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors duration-200 ${
                  activeTab === 'breathing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-teal-50 text-teal-700'
                }`}
              >
                <Wind className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Relax
              </span>
            </div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">Guided Breathing</h2>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">
              4-7-8 and box breathing
            </p>
          </button>
        </div>

        {/* Tab View Container */}
        <section aria-label="Main Health Tool Workspace" className="transition-all duration-200 ease-in-out">
          {activeTab === 'symptoms' && (
            <SymptomAnalyzer onLogSymptomToDiary={handleLogSymptomFromAnalyzer} />
          )}

          {activeTab === 'lab' && <LabDecoder />}

          {activeTab === 'vitals' && (
            <VitalsTracker
              vitals={vitals}
              symptomLogs={symptomLogs}
              habits={habits}
              onAddVital={handleAddVital}
              onAddSymptomLog={handleAddSymptomLog}
              onDeleteSymptomLog={handleDeleteSymptomLog}
              onToggleHabit={handleToggleHabit}
              onOpenInitialSetup={() => setInitialSetupOpen(true)}
            />
          )}

          {activeTab === 'breathing' && <InteractiveBreathing />}
        </section>
      </main>

      {/* Initial Baseline Values Setup Modal */}
      <InitialSetupModal
        isOpen={initialSetupOpen}
        onClose={() => setInitialSetupOpen(false)}
        onSave={handleSaveInitialSetup}
        onSkip={handleSkipInitialSetup}
      />

      {/* Emergency Guidance Modal */}
      <EmergencyGuideModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />

      {/* Footer */}
      <Footer onOpenEmergency={() => setEmergencyModalOpen(true)} />
    </div>
  );
}
