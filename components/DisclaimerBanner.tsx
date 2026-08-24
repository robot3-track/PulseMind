'use client';

import React, { useState } from 'react';
import { AlertTriangle, Info, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export default function DisclaimerBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside id="medical-disclaimer-banner" aria-label="Medical Disclaimer" className="bg-slate-900 text-slate-200 border-b border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-medium text-slate-300 truncate sm:whitespace-normal">
              <span className="font-semibold text-amber-400">Important Notice:</span> PulseMind is an educational health assistant and does not provide formal medical diagnosis or treatment.
            </p>
          </div>

          <button
            id="toggle-disclaimer-details"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors shrink-0 px-2 py-0.5 rounded hover:bg-slate-800"
          >
            <span>{expanded ? 'Less' : 'Learn more'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {expanded && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-800 text-xs text-slate-400 space-y-2 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div className="bg-slate-800/80 p-2.5 rounded-md border border-slate-700/60 flex gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block mb-0.5">Educational Support</span>
                  Risk estimates and explanations are designed to help you prepare for discussions with your licensed healthcare provider.
                </div>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-md border border-slate-700/60 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block mb-0.5">Emergency Symptoms</span>
                  If experiencing severe chest pain, sudden numbness or weakness, severe shortness of breath, or heavy bleeding, call 911 immediately.
                </div>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-md border border-slate-700/60 flex gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block mb-0.5">Privacy First</span>
                  Your entered health information is kept private in your browser session and is not stored on public servers.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
