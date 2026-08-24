'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Heart } from 'lucide-react';

export default function InteractiveBreathing() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [technique, setTechnique] = useState<'4-7-8' | 'Box'>('4-7-8');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Technique timing:
  // 4-7-8: Inhale 4s, Hold 7s, Exhale 8s
  // Box: Inhale 4s, Hold 4s, Exhale 4s, Rest 4s

  const playBeep = React.useCallback((freq: number) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Transition phase
        if (technique === '4-7-8') {
          if (phase === 'Inhale') {
            setPhase('Hold');
            playBeep(440);
            return 7;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            playBeep(330);
            return 8;
          } else {
            setPhase('Inhale');
            setCompletedCycles((c) => c + 1);
            playBeep(523);
            return 4;
          }
        } else {
          // Box breathing
          if (phase === 'Inhale') {
            setPhase('Hold');
            playBeep(440);
            return 4;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            playBeep(330);
            return 4;
          } else if (phase === 'Exhale') {
            setPhase('Rest');
            playBeep(300);
            return 4;
          } else {
            setPhase('Inhale');
            setCompletedCycles((c) => c + 1);
            playBeep(523);
            return 4;
          }
        }
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase, technique, soundEnabled, playBeep]);

  const handleToggle = () => {
    if (!isActive) {
      setPhase('Inhale');
      setSecondsLeft(4);
      playBeep(523);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('Inhale');
    setSecondsLeft(4);
    setCompletedCycles(0);
  };

  // Get animation ring scale
  const getScaleClass = () => {
    if (!isActive) return 'scale-100';
    if (phase === 'Inhale') return 'scale-125 transition-transform duration-[4000ms] ease-out';
    if (phase === 'Hold') return 'scale-125';
    if (phase === 'Exhale') return 'scale-90 transition-transform duration-[8000ms] ease-in-out';
    return 'scale-90';
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'Inhale':
        return 'Slowly breathe in deeply through your nose, filling your belly...';
      case 'Hold':
        return 'Gently hold your breath. Relax your shoulders and jaw...';
      case 'Exhale':
        return 'Slowly whoosh the air out through parted lips...';
      case 'Rest':
        return 'Pause and rest calmly before the next breath...';
    }
  };

  return (
    <div id="interactive-breathing-tool" className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-sm transition-all duration-200 ease-in-out">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <Wind className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Guided Breathing & Stress Relief</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-2xl">
            Paced rhythmic breathing helps lower resting heart rate, ease muscle tension, and calm acute stress.
          </p>
        </div>

        {/* Technique toggle & sound */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex bg-slate-100 p-1.5 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
            <button
              id="breathing-478-toggle"
              onClick={() => {
                setTechnique('4-7-8');
                handleReset();
              }}
              className={`px-3.5 py-1.5 rounded-md transition-all duration-200 ease-in-out ${
                technique === '4-7-8' ? 'bg-white shadow-xs text-blue-900 font-bold' : 'hover:text-slate-900'
              }`}
            >
              4-7-8 Relax
            </button>
            <button
              id="breathing-box-toggle"
              onClick={() => {
                setTechnique('Box');
                handleReset();
              }}
              className={`px-3.5 py-1.5 rounded-md transition-all duration-200 ease-in-out ${
                technique === 'Box' ? 'bg-white shadow-xs text-blue-900 font-bold' : 'hover:text-slate-900'
              }`}
            >
              Box (4-4-4-4)
            </button>
          </div>

          <button
            id="toggle-breathing-sound"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-xs font-medium transition-all duration-200 ease-in-out ${
              soundEnabled
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
            title={soundEnabled ? 'Mute tone chimes' : 'Enable audio tone cues'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Breathing Circle Stage */}
      <div className="py-12 sm:py-16 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Breathing Visualizer Rings */}
        <div className="relative flex items-center justify-center">
          {/* Outermost Ring */}
          <div
            className={`w-60 h-60 sm:w-72 sm:h-72 rounded-full border-2 border-dashed ${
              phase === 'Inhale'
                ? 'border-blue-400'
                : phase === 'Hold'
                ? 'border-indigo-400'
                : 'border-emerald-400'
            } flex items-center justify-center transition-all ${getScaleClass()}`}
          >
            {/* Middle Filled Disc */}
            <div
              className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center text-white shadow-sm transition-all duration-700 ${
                phase === 'Inhale'
                  ? 'bg-blue-600'
                  : phase === 'Hold'
                  ? 'bg-indigo-700'
                  : phase === 'Exhale'
                  ? 'bg-emerald-600'
                  : 'bg-slate-700'
              }`}
            >
              <span className="text-[11px] uppercase font-bold tracking-widest opacity-90 mb-1">
                {phase}
              </span>
              <span className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums">
                {secondsLeft}s
              </span>
              <span className="text-[11px] opacity-80 mt-1.5 font-medium">
                {technique} Pattern
              </span>
            </div>
          </div>
        </div>

        {/* Phase Instruction */}
        <div className="mt-8 text-center max-w-md mx-auto space-y-2">
          <p className="text-sm sm:text-base font-semibold text-slate-800 transition-all duration-200">
            {isActive ? getPhaseInstruction() : 'Select "Start Breathing" to begin.'}
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <span>Completed cycles: <strong className="text-slate-800 font-bold">{completedCycles}</strong></span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            id="start-pause-breathing"
            onClick={handleToggle}
            className={`px-6 py-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all duration-200 ease-in-out shadow-xs ${
              isActive
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Start Breathing
              </>
            )}
          </button>

          <button
            id="reset-breathing"
            onClick={handleReset}
            className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all duration-200 ease-in-out"
            title="Reset Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Educational info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-6 border-t border-slate-100 text-xs text-slate-600">
        <div className="bg-slate-50/80 p-5 rounded-lg border border-slate-200 space-y-1.5">
          <span className="font-bold text-slate-800 block flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-600" /> Why 4-7-8 Breathing Helps
          </span>
          <p className="leading-relaxed">
            Extended exhalations stimulate the vagus nerve, which slows your heart rate, relaxes tight muscles, and helps ease feelings of panic or anxiety.
          </p>
        </div>
        <div className="bg-slate-50/80 p-5 rounded-lg border border-slate-200 space-y-1.5">
          <span className="font-bold text-slate-800 block flex items-center gap-2">
            <Wind className="w-4 h-4 text-blue-600" /> Box Breathing Practice
          </span>
          <p className="leading-relaxed">
            Equal four-second counts for inhaling, holding, exhaling, and resting help restore focus and steady your breathing during stressful moments.
          </p>
        </div>
      </div>
    </div>
  );
}
