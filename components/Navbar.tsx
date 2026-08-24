'use client';

import React, { useState } from 'react';
import {
  Activity,
  Stethoscope,
  FileText,
  LineChart,
  Wind,
  AlertOctagon,
  Menu,
  X,
  Heart,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'symptoms' | 'lab' | 'vitals' | 'breathing';
  onSelectTab: (tab: 'symptoms' | 'lab' | 'vitals' | 'breathing') => void;
  onOpenEmergency: () => void;
}

export default function Navbar({ activeTab, onSelectTab, onOpenEmergency }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'symptoms' as const,
      label: 'Symptom Checker',
      shortLabel: 'Symptom Checker',
      icon: Stethoscope,
      description: 'Step-by-step health assessment',
    },
    {
      id: 'lab' as const,
      label: 'Lab & Records Explainer',
      shortLabel: 'Lab Explainer',
      icon: FileText,
      description: 'Plain-language test results & notes',
    },
    {
      id: 'vitals' as const,
      label: 'Daily Vitals & Symptom Log',
      shortLabel: 'Vitals & Log',
      icon: LineChart,
      description: 'Track vitals and symptoms over time',
    },
    {
      id: 'breathing' as const,
      label: 'Guided Breathing',
      shortLabel: 'Breathing',
      icon: Wind,
      description: '4-7-8 and box breathing for stress relief',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('symptoms')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
                <Activity className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                    PulseMind
                  </span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 tracking-wider">
                    Health
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium -mt-0.5 hidden sm:block">
                  Symptom Assessment & Medical Record Explainer
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span>{item.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: Emergency Red Flag Button & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="emergency-top-button"
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Emergency Help</span>
              <span className="sm:hidden">Emergency</span>
            </button>

            {/* Mobile menu hamburger */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-1 shadow-md">
          <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider px-2 mb-1">
            Health Tools
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-md text-left transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-blue-950 font-bold border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{item.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
