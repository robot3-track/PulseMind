'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Moon,
  Zap,
  Plus,
  Calendar,
  Clock,
  Trash2,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Filter,
  Sparkles,
  Smile,
  Meh,
  Frown,
  Check,
  ChevronRight,
} from 'lucide-react';
import { VitalRecord, SymptomLogEntry, DailyHabit } from '@/lib/types';
import {
  INITIAL_VITALS_DATA,
  INITIAL_SYMPTOM_LOGS,
  INITIAL_DAILY_HABITS,
} from '@/lib/fallbackData';

interface VitalsTrackerProps {
  vitals: VitalRecord[];
  symptomLogs: SymptomLogEntry[];
  habits: DailyHabit[];
  onAddVital: (vital: Omit<VitalRecord, 'id' | 'timestamp'>) => void;
  onAddSymptomLog: (log: Omit<SymptomLogEntry, 'id' | 'timestamp'>) => void;
  onDeleteSymptomLog: (id: string) => void;
  onToggleHabit: (id: string) => void;
  onOpenInitialSetup?: () => void;
}

export default function VitalsTracker({
  vitals,
  symptomLogs,
  habits,
  onAddVital,
  onAddSymptomLog,
  onDeleteSymptomLog,
  onToggleHabit,
  onOpenInitialSetup,
}: VitalsTrackerProps) {
  const [activeMetric, setActiveMetric] = useState<'heartRate' | 'bp' | 'sleep' | 'pain'>('heartRate');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);

  // Form states for new entry - start empty without fake sample numbers
  const [newVital, setNewVital] = useState({
    date: new Date().toISOString().split('T')[0],
    heartRate: '',
    systolicBP: '',
    diastolicBP: '',
    spo2: '',
    sleepHours: '',
    painLevel: '',
    notes: '',
  });

  const [newLog, setNewLog] = useState({
    symptomName: '',
    severity: 3,
    triggers: '',
    notes: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  // Latest stats - strictly from real user vitals
  const latestVital = vitals.length > 0 ? vitals[vitals.length - 1] : null;

  const handleCreateVital = (e: React.FormEvent) => {
    e.preventDefault();
    onAddVital({
      date: newVital.date || new Date().toISOString().split('T')[0],
      heartRate: newVital.heartRate !== '' ? Number(newVital.heartRate) : null,
      systolicBP: newVital.systolicBP !== '' ? Number(newVital.systolicBP) : null,
      diastolicBP: newVital.diastolicBP !== '' ? Number(newVital.diastolicBP) : null,
      spo2: newVital.spo2 !== '' ? Number(newVital.spo2) : null,
      sleepHours: newVital.sleepHours !== '' ? Number(newVital.sleepHours) : null,
      painLevel: newVital.painLevel !== '' ? Number(newVital.painLevel) : null,
      notes: newVital.notes.trim() || undefined,
    });
    setNewVital({
      date: new Date().toISOString().split('T')[0],
      heartRate: '',
      systolicBP: '',
      diastolicBP: '',
      spo2: '',
      sleepHours: '',
      painLevel: '',
      notes: '',
    });
    setShowVitalModal(false);
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.symptomName.trim()) return;
    onAddSymptomLog({
      symptomName: newLog.symptomName.trim(),
      severity: Number(newLog.severity),
      triggers: newLog.triggers.trim() || undefined,
      notes: newLog.notes.trim() || undefined,
      tags: newLog.tags.length > 0 ? newLog.tags : ['General'],
    });
    setNewLog({ symptomName: '', severity: 3, triggers: '', notes: '', tags: [] });
    setShowSymptomModal(false);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!newLog.tags.includes(tagInput.trim())) {
      setNewLog({ ...newLog, tags: [...newLog.tags, tagInput.trim()] });
    }
    setTagInput('');
  };

  // Habits completion percentage
  const completedHabitsCount = habits.filter((h) => h.completed).length;
  const habitPercentage = habits.length > 0 ? Math.round((completedHabitsCount / habits.length) * 100) : 0;

  // SVG Chart Dimensions
  const chartHeight = 180;
  const chartWidth = 580;
  const padding = 35;

  // Chart data extraction based on active metric
  const getChartValues = () => {
    const dataSlice = vitals.slice(-7);
    switch (activeMetric) {
      case 'heartRate': {
        const validPoints = dataSlice.filter((d) => d.heartRate != null && !isNaN(Number(d.heartRate)));
        return {
          label: 'Resting Heart Rate (BPM)',
          target: '60 - 100 BPM Normal Zone',
          color: '#0284c7', // Sky-600
          points: validPoints.map((d, i) => ({
            x: padding + (i * (chartWidth - padding * 2)) / Math.max(validPoints.length - 1, 1),
            y: chartHeight - padding - ((Number(d.heartRate) - 50) / 60) * (chartHeight - padding * 2),
            value: `${d.heartRate} bpm`,
            date: d.date.slice(5),
          })),
        };
      }
      case 'bp': {
        const validPoints = dataSlice.filter((d) => d.systolicBP != null && !isNaN(Number(d.systolicBP)));
        return {
          label: 'Systolic Blood Pressure (mmHg)',
          target: '< 120 mmHg Optimal',
          color: '#e11d48', // Rose-600
          points: validPoints.map((d, i) => ({
            x: padding + (i * (chartWidth - padding * 2)) / Math.max(validPoints.length - 1, 1),
            y: chartHeight - padding - ((Number(d.systolicBP) - 90) / 70) * (chartHeight - padding * 2),
            value: d.diastolicBP != null ? `${d.systolicBP}/${d.diastolicBP} mmHg` : `${d.systolicBP} mmHg`,
            date: d.date.slice(5),
          })),
        };
      }
      case 'sleep': {
        const validPoints = dataSlice.filter((d) => d.sleepHours != null && !isNaN(Number(d.sleepHours)));
        return {
          label: 'Sleep Duration (Hours)',
          target: '7 - 9 Hours Target',
          color: '#6366f1', // Indigo-500
          points: validPoints.map((d, i) => ({
            x: padding + (i * (chartWidth - padding * 2)) / Math.max(validPoints.length - 1, 1),
            y: chartHeight - padding - ((Number(d.sleepHours) - 4) / 8) * (chartHeight - padding * 2),
            value: `${d.sleepHours} hrs`,
            date: d.date.slice(5),
          })),
        };
      }
      case 'pain': {
        const validPoints = dataSlice.filter((d) => d.painLevel != null && !isNaN(Number(d.painLevel)));
        return {
          label: 'Subjective Pain Index (0 - 10)',
          target: '0 - 2 Manageable',
          color: '#f59e0b', // Amber-500
          points: validPoints.map((d, i) => ({
            x: padding + (i * (chartWidth - padding * 2)) / Math.max(validPoints.length - 1, 1),
            y: chartHeight - padding - (Number(d.painLevel) / 10) * (chartHeight - padding * 2),
            value: `${d.painLevel}/10`,
            date: d.date.slice(5),
          })),
        };
      }
    }
  };

  const chartMeta = getChartValues();

  // Create SVG path string
  const pathD = chartMeta.points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div id="vitals-dashboard-section" className="space-y-8">
      {/* Top Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Health Metrics & Symptom Log</h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Tracker
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-3xl">
                Track your personal heart rate, blood pressure, sleep, and symptoms. Any unentered metrics display as N/A.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            {onOpenInitialSetup && (
              <button
                id="btn-open-initial-setup"
                onClick={onOpenInitialSetup}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Baseline Setup</span>
              </button>
            )}
            <button
              id="btn-open-vital-modal"
              onClick={() => setShowVitalModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-200 ease-in-out shadow-xs"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Add Vitals</span>
            </button>
            <button
              id="btn-open-symptom-modal"
              onClick={() => setShowSymptomModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-200 ease-in-out shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Log Symptom</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Vitals Cards with N/A support */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          {/* Card 1: Heart Rate */}
          <div
            onClick={() => setActiveMetric('heartRate')}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ease-in-out ${
              activeMetric === 'heartRate'
                ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" /> Resting HR
              </span>
              {latestVital?.heartRate != null ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  latestVital.heartRate < 60
                    ? 'text-amber-700 bg-amber-100'
                    : latestVital.heartRate > 100
                    ? 'text-rose-700 bg-rose-100'
                    : 'text-emerald-700 bg-emerald-100'
                }`}>
                  {latestVital.heartRate < 60 ? 'Low' : latestVital.heartRate > 100 ? 'Elevated' : 'Normal'}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  N/A
                </span>
              )}
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {latestVital?.heartRate != null ? (
                <>
                  {latestVital.heartRate}{' '}
                  <span className="text-xs font-normal text-slate-500">bpm</span>
                </>
              ) : (
                <span className="text-slate-400 font-semibold">N/A</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Normal: 60 - 100 bpm</p>
          </div>

          {/* Card 2: Blood Pressure */}
          <div
            onClick={() => setActiveMetric('bp')}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ease-in-out ${
              activeMetric === 'bp'
                ? 'border-rose-500 bg-rose-50/70 shadow-xs ring-1 ring-rose-500'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-rose-600" /> Blood Pressure
              </span>
              {latestVital?.systolicBP != null && latestVital?.diastolicBP != null ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  latestVital.systolicBP >= 140 || latestVital.diastolicBP >= 90
                    ? 'text-rose-700 bg-rose-100'
                    : latestVital.systolicBP >= 120 || latestVital.diastolicBP >= 80
                    ? 'text-amber-700 bg-amber-100'
                    : 'text-emerald-700 bg-emerald-100'
                }`}>
                  {latestVital.systolicBP >= 140 || latestVital.diastolicBP >= 90
                    ? 'High'
                    : latestVital.systolicBP >= 120 || latestVital.diastolicBP >= 80
                    ? 'Elevated'
                    : 'Optimal'}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  N/A
                </span>
              )}
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {latestVital?.systolicBP != null && latestVital?.diastolicBP != null ? (
                <>
                  {latestVital.systolicBP}/{latestVital.diastolicBP}{' '}
                  <span className="text-xs font-normal text-slate-500">mmHg</span>
                </>
              ) : latestVital?.systolicBP != null ? (
                <>
                  {latestVital.systolicBP}/--{' '}
                  <span className="text-xs font-normal text-slate-500">mmHg</span>
                </>
              ) : latestVital?.diastolicBP != null ? (
                <>
                  --/{latestVital.diastolicBP}{' '}
                  <span className="text-xs font-normal text-slate-500">mmHg</span>
                </>
              ) : (
                <span className="text-slate-400 font-semibold">N/A</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Normal: &lt; 120/80 mmHg</p>
          </div>

          {/* Card 3: Sleep */}
          <div
            onClick={() => setActiveMetric('sleep')}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ease-in-out ${
              activeMetric === 'sleep'
                ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-blue-600" /> Sleep Duration
              </span>
              {latestVital?.sleepHours != null ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  latestVital.sleepHours >= 7
                    ? 'text-emerald-700 bg-emerald-100'
                    : 'text-amber-700 bg-amber-100'
                }`}>
                  {latestVital.sleepHours >= 7 ? 'Good' : 'Below Target'}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  N/A
                </span>
              )}
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {latestVital?.sleepHours != null ? (
                <>
                  {latestVital.sleepHours}{' '}
                  <span className="text-xs font-normal text-slate-500">hours</span>
                </>
              ) : (
                <span className="text-slate-400 font-semibold">N/A</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Goal: 7.0 - 9.0 hrs</p>
          </div>

          {/* Card 4: Pain Scale */}
          <div
            onClick={() => setActiveMetric('pain')}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ease-in-out ${
              activeMetric === 'pain'
                ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-500'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Pain Level
              </span>
              {latestVital?.painLevel != null ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  latestVital.painLevel <= 2
                    ? 'text-emerald-700 bg-emerald-100'
                    : latestVital.painLevel <= 5
                    ? 'text-amber-700 bg-amber-100'
                    : 'text-rose-700 bg-rose-100'
                }`}>
                  {latestVital.painLevel <= 2 ? 'Mild' : latestVital.painLevel <= 5 ? 'Moderate' : 'Severe'}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  N/A
                </span>
              )}
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {latestVital?.painLevel != null ? (
                <>
                  {latestVital.painLevel}{' '}
                  <span className="text-xs font-normal text-slate-500">/ 10</span>
                </>
              ) : (
                <span className="text-slate-400 font-semibold">N/A</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Target: &le; 2</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Vitals Chart & Daily Recovery Habit Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Vitals Visualizer */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {chartMeta.label}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{chartMeta.target}</p>
            </div>

            {/* Time range selector */}
            <div className="flex bg-slate-100 p-1.5 rounded-lg text-xs font-semibold text-slate-700 self-start sm:self-auto border border-slate-200">
              {(['7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-md transition-all duration-200 ease-in-out ${
                    timeRange === r ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive SVG Chart Container */}
          <div className="w-full overflow-x-auto py-2">
            {chartMeta.points.length === 0 ? (
              <div className="w-full h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <Activity className="w-8 h-8 text-slate-300 mb-2" />
                <div className="font-bold text-slate-700 text-xs sm:text-sm">No {chartMeta.label} recorded yet</div>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  Values you record will be plotted here to track your health trends over time.
                </p>
                <button
                  onClick={() => setShowVitalModal(true)}
                  className="mt-3 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log {chartMeta.label.split(' ')[0]}</span>
                </button>
              </div>
            ) : (
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-48 select-none"
              >
                {/* Horizontal Grid lines */}
                <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#cbd5e1" strokeWidth="1" />

                {/* Data Area Fill */}
                {chartMeta.points.length > 1 && (
                  <path
                    d={`${pathD} L ${chartMeta.points[chartMeta.points.length - 1].x} ${chartHeight - padding} L ${chartMeta.points[0].x} ${chartHeight - padding} Z`}
                    fill={chartMeta.color}
                    fillOpacity="0.1"
                  />
                )}

                {/* Data Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={chartMeta.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {chartMeta.points.map((p, i) => (
                  <g key={i} className="group cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="#ffffff"
                      stroke={chartMeta.color}
                      strokeWidth="2"
                      className="transition-transform group-hover:scale-125"
                    />
                    {/* Tooltip text */}
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {p.value}
                    </text>
                    {/* Date label at bottom */}
                    <text
                      x={p.x}
                      y={chartHeight - 12}
                      textAnchor="middle"
                      className="text-[9px] font-medium fill-slate-400"
                    >
                      {p.date}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartMeta.color }} />
              {chartMeta.points.length > 0 ? 'Hover over points to see recorded values.' : 'No data points recorded yet.'}
            </span>
            <span className="font-semibold text-slate-700">{chartMeta.points.length} Logged {chartMeta.points.length === 1 ? 'Reading' : 'Readings'}</span>
          </div>
        </div>

        {/* Right 1 Col: Daily Recovery Habits & Streak */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Daily Habits
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Simple daily routines</p>
            </div>

            {/* Circular Progress Indicator */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900">{habitPercentage}%</div>
                <div className="text-[10px] text-slate-400 font-medium">Done</div>
              </div>
            </div>
          </div>

          {/* Habit Items */}
          <div className="space-y-2.5">
            {habits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => onToggleHabit(habit.id)}
                className={`w-full p-3 rounded-lg border text-left flex items-center justify-between gap-3 transition-all duration-200 ease-in-out ${
                  habit.completed
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                      habit.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {habit.completed && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-xs font-medium truncate ${habit.completed ? 'line-through opacity-75' : ''}`}>
                    {habit.title}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 shrink-0 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {habit.target}
                </span>
              </button>
            ))}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="leading-relaxed">Consistent habits support long-term recovery and well-being.</span>
          </div>
        </div>
      </div>

      {/* Symptom Journal & History */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Symptom Log History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record of symptom changes, severity ratings, and potential triggers.
            </p>
          </div>

          <button
            onClick={() => setShowSymptomModal(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>

        {/* Symptoms Timeline List */}
        {symptomLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No symptoms recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {symptomLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      log.severity >= 7
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : log.severity >= 4
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {log.severity}
                    <span className="text-[9px] font-normal">/10</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{log.symptomName}</h4>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleDateString()} at{' '}
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {log.notes && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.notes}</p>
                    )}

                    {log.triggers && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        <strong className="text-slate-500">Triggers:</strong> {log.triggers}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <div className="flex gap-1.5 flex-wrap">
                    {log.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium bg-white text-slate-600 px-2.5 py-1 rounded border border-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => onDeleteSymptomLog(log.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal 1: Add New Vitals Entry */}
      {showVitalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Record Vitals</h3>
              <button
                onClick={() => setShowVitalModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateVital} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Date</label>
                <input
                  type="date"
                  value={newVital.date}
                  onChange={(e) => setNewVital({ ...newVital, date: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    min="30"
                    max="220"
                    placeholder="e.g. 72 (optional)"
                    value={newVital.heartRate}
                    onChange={(e) => setNewVital({ ...newVital, heartRate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:font-sans placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Oxygen SpO2 (%)</label>
                  <input
                    type="number"
                    min="70"
                    max="100"
                    placeholder="e.g. 98 (optional)"
                    value={newVital.spo2}
                    onChange={(e) => setNewVital({ ...newVital, spo2: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:font-sans placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    min="60"
                    max="240"
                    placeholder="e.g. 120 (optional)"
                    value={newVital.systolicBP}
                    onChange={(e) => setNewVital({ ...newVital, systolicBP: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:font-sans placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    min="40"
                    max="140"
                    placeholder="e.g. 80 (optional)"
                    value={newVital.diastolicBP}
                    onChange={(e) => setNewVital({ ...newVital, diastolicBP: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:font-sans placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Sleep (Hours)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="24"
                    placeholder="e.g. 7.5 (optional)"
                    value={newVital.sleepHours}
                    onChange={(e) => setNewVital({ ...newVital, sleepHours: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:font-sans placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Pain Scale (0 - 10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="0 - 10 (optional)"
                    value={newVital.painLevel}
                    onChange={(e) => setNewVital({ ...newVital, painLevel: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:font-sans placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Notes / Context</label>
                <input
                  type="text"
                  placeholder="e.g. Morning baseline checkup..."
                  value={newVital.notes}
                  onChange={(e) => setNewVital({ ...newVital, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVitalModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all duration-200 ease-in-out shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add New Symptom Log Entry */}
      {showSymptomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Log a Symptom</h3>
              <button
                onClick={() => setShowSymptomModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Symptom</label>
                <input
                  type="text"
                  placeholder="e.g. Tension headache, knee ache, acid reflux..."
                  value={newLog.symptomName}
                  onChange={(e) => setNewLog({ ...newLog, symptomName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1.5">
                  <span>Severity Level</span>
                  <span>{newLog.severity} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newLog.severity}
                  onChange={(e) => setNewLog({ ...newLog, severity: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-md appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Potential Triggers (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Lack of sleep, bright sunlight, physical exertion..."
                  value={newLog.triggers}
                  onChange={(e) => setNewLog({ ...newLog, triggers: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Notes & Actions Taken</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Drank a glass of water, rested in dark room..."
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Stress, Food, Sleep"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {newLog.tags.map((t, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSymptomModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 ease-in-out shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
