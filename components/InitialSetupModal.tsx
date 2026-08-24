'use client';

import React, { useState } from 'react';
import {
  Heart,
  Activity,
  Moon,
  Zap,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { VitalRecord } from '@/lib/types';

interface InitialSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: Omit<VitalRecord, 'id' | 'timestamp'>) => void;
  onSkip: () => void;
}

export default function InitialSetupModal({
  isOpen,
  onClose,
  onSave,
  onSkip,
}: InitialSetupModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [heartRate, setHeartRate] = useState('');
  const [systolicBP, setSystolicBP] = useState('');
  const [diastolicBP, setDiastolicBP] = useState('');
  const [spo2, setSpo2] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [painLevel, setPainLevel] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hrVal = heartRate.trim() !== '' ? Number(heartRate) : null;
    const sysVal = systolicBP.trim() !== '' ? Number(systolicBP) : null;
    const diaVal = diastolicBP.trim() !== '' ? Number(diastolicBP) : null;
    const o2Val = spo2.trim() !== '' ? Number(spo2) : null;
    const sleepVal = sleepHours.trim() !== '' ? Number(sleepHours) : null;
    const painVal = painLevel.trim() !== '' ? Number(painLevel) : null;

    onSave({
      date: date || new Date().toISOString().split('T')[0],
      heartRate: hrVal,
      systolicBP: sysVal,
      diastolicBP: diaVal,
      spo2: o2Val,
      sleepHours: sleepVal,
      painLevel: painVal,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div
      id="initial-setup-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="initial-setup-modal-container"
        className="bg-white rounded-lg max-w-lg w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6 my-8 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Initial Health Metrics Setup
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Set up your baseline values to personalize your dashboard.
              </p>
            </div>
          </div>
          <button
            id="close-initial-setup-modal"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Guidance Banner */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Optional Baseline Entry</span>
          </div>
          <p className="leading-relaxed">
            All fields below are completely optional. If you don&apos;t know or don&apos;t want to enter some values right now, you can leave them blank and they will simply show as <strong>N/A</strong> on your dashboard.
          </p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Record Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Heart Rate */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> Resting HR (BPM)
              </label>
              <input
                id="input-setup-hr"
                type="number"
                min="30"
                max="240"
                placeholder="e.g. 72 (or leave empty)"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:font-sans placeholder:text-slate-400"
              />
            </div>

            {/* Oxygen SpO2 */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-500" /> Oxygen SpO2 (%)
              </label>
              <input
                id="input-setup-spo2"
                type="number"
                min="70"
                max="100"
                placeholder="e.g. 98 (or leave empty)"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:font-sans placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Blood Pressure */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-600" /> Blood Pressure (mmHg)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  id="input-setup-systolic"
                  type="number"
                  min="60"
                  max="250"
                  placeholder="Systolic (e.g. 120)"
                  value={systolicBP}
                  onChange={(e) => setSystolicBP(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:font-sans placeholder:text-slate-400"
                />
              </div>
              <div>
                <input
                  id="input-setup-diastolic"
                  type="number"
                  min="40"
                  max="150"
                  placeholder="Diastolic (e.g. 80)"
                  value={diastolicBP}
                  onChange={(e) => setDiastolicBP(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:font-sans placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sleep */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-500" /> Sleep (Hours)
              </label>
              <input
                id="input-setup-sleep"
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="e.g. 7.5 (or leave empty)"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:font-sans placeholder:text-slate-400"
              />
            </div>

            {/* Pain Scale */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Pain Scale (0 - 10)
              </label>
              <input
                id="input-setup-pain"
                type="number"
                min="0"
                max="10"
                placeholder="0 - 10 (or leave empty)"
                value={painLevel}
                onChange={(e) => setPainLevel(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:font-sans placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Personal Notes (Optional)
            </label>
            <input
              id="input-setup-notes"
              type="text"
              placeholder="e.g. Initial baseline setup"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              id="btn-skip-setup"
              type="button"
              onClick={onSkip}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors text-center"
            >
              Skip for Now (Show N/A)
            </button>
            <button
              id="btn-save-setup"
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-all duration-200 ease-in-out shadow-xs text-center"
            >
              Save Baseline Values
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
