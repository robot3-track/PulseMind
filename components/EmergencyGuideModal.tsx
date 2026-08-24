'use client';

import React from 'react';
import {
  AlertOctagon,
  PhoneCall,
  X,
  MapPin,
  HeartPulse,
  Flame,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface EmergencyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyGuideModal({ isOpen, onClose }: EmergencyGuideModalProps) {
  if (!isOpen) return null;

  const redFlags = [
    {
      title: 'Crushing Chest Pain / Angina',
      desc: 'Pressure, fullness, squeezing, or pain in the center of the chest radiating to left arm, neck, jaw, or back.',
      action: 'Call 911 immediately — Do NOT drive yourself.',
    },
    {
      title: 'FAST Stroke Symptoms',
      desc: 'Facial drooping, Arm weakness, Slurred speech, or Sudden vision loss/confusion.',
      action: 'Time is critical: Call 911 for immediate thrombectomy/tPA evaluation.',
    },
    {
      title: 'Severe Respiratory Distress',
      desc: 'Inability to speak in full sentences, blue/gray lips or nail beds, high-pitched stridor.',
      action: 'Seek emergency oxygen support right away.',
    },
    {
      title: 'Sudden "Thunderclap" Headache',
      desc: 'The worst headache of your life that peaks in seconds, especially with neck stiffness or fever.',
      action: 'Rule out subarachnoid hemorrhage or meningitis immediately.',
    },
    {
      title: 'Severe Allergic Reaction (Anaphylaxis)',
      desc: 'Swelling of throat, tongue, or lips with hives, dizziness, or vomiting.',
      action: 'Administer Epinephrine auto-injector (EpiPen) and call 911.',
    },
    {
      title: 'Acute Uncontrolled Bleeding or Major Trauma',
      desc: 'Spurting blood that will not stop after 5 minutes of direct pressure, or deep penetrations.',
      action: 'Apply tourniquet / firm pressure and summon EMS.',
    },
  ];

  const triageLevels = [
    {
      type: 'Emergency Dept (ER)',
      badge: 'Immediate (24/7)',
      color: 'border-rose-500 bg-rose-50/50 text-rose-950',
      tagColor: 'bg-rose-600 text-white',
      examples: 'Chest pain, stroke signs, severe burns, compound fractures, suicidal crisis, heavy bleeding, poison ingestion.',
    },
    {
      type: 'Urgent Care Clinic',
      badge: 'Same-day (1-4 hours)',
      color: 'border-amber-400 bg-amber-50/50 text-amber-950',
      tagColor: 'bg-amber-500 text-white',
      examples: 'Sprains, minor cuts needing stitches, mild asthma flares, moderate fever, simple bone breaks (fingers/toes), UTI symptoms.',
    },
    {
      type: 'Primary Care / Telehealth',
      badge: '1-3 days',
      color: 'border-sky-400 bg-sky-50/50 text-sky-950',
      tagColor: 'bg-sky-600 text-white',
      examples: 'Chronic disease management, routine lab check-ups, mild skin rashes, prescription refills, mild seasonal allergies.',
    },
  ];

  return (
    <div
      id="emergency-guide-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="emergency-guide-modal-container"
        className="bg-white rounded-lg max-w-2xl w-full shadow-xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-rose-700 p-6 sm:p-8 text-white flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/15 rounded-lg text-white">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Emergency & Urgent Care Guide</h2>
              <p className="text-rose-100 text-xs sm:text-sm mt-1 leading-relaxed">
                Immediate steps for critical symptoms and helpline contacts
              </p>
            </div>
          </div>
          <button
            id="close-emergency-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800">
          {/* Quick Dial Helplines */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              id="emergency-call-911"
              href="tel:911"
              className="flex items-center justify-between p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all duration-200 ease-in-out text-xs sm:text-sm font-semibold shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4" />
                <div>
                  <div className="font-bold text-sm">Call 911</div>
                  <div className="text-[11px] text-rose-100 font-normal">Emergency Services</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-200" />
            </a>

            <a
              id="emergency-call-988"
              href="tel:988"
              className="flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-all duration-200 ease-in-out text-xs sm:text-sm font-semibold shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <HeartPulse className="w-4 h-4 text-rose-400" />
                <div>
                  <div className="font-bold text-sm">Call 988</div>
                  <div className="text-[11px] text-slate-300 font-normal">Crisis Helpline</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>

            <a
              id="emergency-call-poison"
              href="tel:18002221222"
              className="flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-all duration-200 ease-in-out text-xs sm:text-sm font-semibold shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-bold text-sm">Poison Control</div>
                  <div className="text-[11px] text-slate-300 font-normal">1-800-222-1222</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* Critical Red Flags */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                Emergency Symptoms (Go to Nearest Emergency Room)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {redFlags.map((flag, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-rose-200 bg-rose-50/50 space-y-1.5"
                >
                  <div className="font-semibold text-rose-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                    {flag.title}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{flag.desc}</p>
                  <div className="mt-2 text-[11px] font-medium text-rose-800 bg-white px-2.5 py-1 rounded border border-rose-200 inline-block">
                    {flag.action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Triage Decision Matrix */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                Care Guide: Where to Go
              </h3>
            </div>
            <div className="space-y-2.5">
              {triageLevels.map((lvl, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${lvl.color} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${lvl.tagColor}`}>
                        {lvl.badge}
                      </span>
                      <span className="font-bold text-xs sm:text-sm">{lvl.type}</span>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed">{lvl.examples}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hospital locator action */}
          <div className="p-4 sm:p-5 rounded-lg bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="p-2.5 rounded-lg bg-white/10 shrink-0 hidden sm:block">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm">Find Nearby Emergency Care or Urgent Care</h4>
                <p className="text-xs text-slate-300 mt-0.5">Open map to view open emergency facilities nearby.</p>
              </div>
            </div>
            <a
              id="open-maps-emergency"
              href="https://www.google.com/maps/search/emergency+room+near+me"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shrink-0 shadow-xs"
            >
              <span>Find Nearby ER</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            id="dismiss-emergency-modal"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
