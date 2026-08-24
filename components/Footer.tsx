'use client';

import React from 'react';
import { ShieldCheck, Heart, AlertOctagon, PhoneCall } from 'lucide-react';

interface FooterProps {
  onOpenEmergency: () => void;
}

export default function Footer({ onOpenEmergency }: FooterProps) {
  return (
    <footer id="app-footer" className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Top bar with quick emergency callout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
              <Heart className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <span className="text-slate-200 font-bold text-sm block">PulseMind Health Assistant</span>
              <span className="text-[11px] text-slate-500">Symptom Assessment, Lab Explainer & Health Tracking</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenEmergency}
              className="px-3 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>Emergency Help Guide</span>
            </button>
          </div>
        </div>

        {/* Permanent Required Medical Disclaimer */}
        <div className="p-3.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 text-xs leading-relaxed space-y-1.5">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Important Medical Disclaimer</span>
          </div>
          <p>
            This application is an educational resource and does not provide medical diagnoses or treatment plans. Always consult a qualified medical professional for personal health concerns. If you are experiencing a life-threatening medical emergency, call 911 or visit your nearest emergency department immediately.
          </p>
        </div>

        {/* Bottom meta */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 pt-2 text-center sm:text-left">
          <div>
            &copy; {new Date().getFullYear()} PulseMind. Designed for clear health communication.
          </div>
          <div className="flex items-center gap-4">
            <span>Private browser session</span>
            <span>No data stored on external servers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
