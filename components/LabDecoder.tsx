'use client';

import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Upload,
  X,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { LabDecodeResult, LabDecodeItem } from '@/lib/types';
import { SAMPLE_LAB_PRESETS, generateFallbackLabDecode } from '@/lib/fallbackData';

export default function LabDecoder() {
  const [rawText, setRawText] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [decodeResult, setDecodeResult] = useState<LabDecodeResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [copiedQuestions, setCopiedQuestions] = useState(false);
  const [speakingTerm, setSpeakingTerm] = useState<string | null>(null);

  const handleSelectPreset = (preset: { id: string; label: string; preview: string; rawText: string }) => {
    setSelectedPresetId(preset.id);
    setRawText(preset.rawText);
    setImagePreview(null);
    setImageBase64(undefined);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      const base64Data = dataUrl.split(',')[1];
      setImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageBase64(undefined);
  };

  const handleExecuteDecode = async () => {
    if (!rawText.trim() && !imageBase64) {
      alert('Please enter or paste your lab report text, or upload an image.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/decode-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: rawText.trim(),
          imageBase64: imageBase64,
          imageMimeType: 'image/jpeg',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to decode lab report');
      }

      const data = (await res.json()) as LabDecodeResult;
      setDecodeResult(data);
    } catch (err) {
      console.error(err);
      const fallback = generateFallbackLabDecode(rawText);
      setDecodeResult(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakTerm = (item: LabDecodeItem) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (speakingTerm === item.term) {
      window.speechSynthesis.cancel();
      setSpeakingTerm(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `${item.term}. Meaning: ${item.plainEnglishMeaning}`
    );
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingTerm(null);
    utterance.onerror = () => setSpeakingTerm(null);

    setSpeakingTerm(item.term);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyQuestions = () => {
    if (!decodeResult) return;
    const text =
      `Questions for my doctor regarding my lab report (${decodeResult.reportTitle}):\n` +
      decodeResult.questionsForDoctor.map((q, i) => `${i + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 2500);
  };

  const getStatusBadge = (status: LabDecodeItem['status']) => {
    switch (status) {
      case 'Normal':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
          text: 'Normal Range',
        };
      case 'Elevated':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: TrendingUp,
          text: 'Elevated / High',
        };
      case 'Low':
        return {
          bg: 'bg-sky-100 text-sky-800 border-sky-200',
          icon: TrendingDown,
          text: 'Below Range',
        };
      case 'Abnormal':
      case 'Critical':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: AlertCircle,
          text: 'Requires Attention',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: BookOpen,
          text: 'Informational',
        };
    }
  };

  return (
    <div id="lab-decoder-section" className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Lab Report & Medical Note Explainer</h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Plain Language
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-3xl">
                Paste blood work, test values, or doctor notes to get clear, plain-language summaries and helpful analogies.
              </p>
            </div>
          </div>
        </div>

        {/* 1-Click Sample Lab Presets (if configured) */}
        {SAMPLE_LAB_PRESETS.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Sample test reports:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {SAMPLE_LAB_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    id={`lab-preset-${preset.id}`}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-4 rounded-lg border text-left transition-all duration-200 ease-in-out ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1.5 flex items-center justify-between">
                      <span>{preset.label}</span>
                      {isSelected && <Zap className="w-3.5 h-3.5 text-blue-600 fill-current" />}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {preset.preview}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Paste Lab Results, Clinical Notes, or Imaging Findings
          </label>
          <button
            onClick={() => setRawText('')}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            Clear Text
          </button>
        </div>

        <textarea
          id="lab-raw-text-input"
          rows={5}
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            setSelectedPresetId('');
          }}
          placeholder="Paste lab text here (e.g. eGFR 58 mL/min, Total Cholesterol 228 mg/dL, HDL 42 mg/dL...)"
          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-4 text-xs sm:text-sm font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed transition-all duration-200"
        />

        {/* Optional Document Photo Upload */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          {imagePreview ? (
            <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Uploaded lab doc"
                className="w-12 h-12 object-cover rounded-md"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">Document Attached</span>
                <span className="text-slate-400 text-[11px]">Ready for explanation</span>
              </div>
              <button
                onClick={handleRemoveImage}
                className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors ml-2"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="lab-document-upload"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors duration-200"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Attach Lab Result Image or Scan (Optional)</span>
              <input
                id="lab-document-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}

          <button
            id="btn-decode-lab"
            disabled={loading || (!rawText.trim() && !imageBase64)}
            onClick={handleExecuteDecode}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs flex items-center gap-2 transition-all duration-200 ease-in-out"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Explaining Report...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Explain in Plain English</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Decoded Report */}
      {decodeResult && (
        <div className="space-y-8">
          {/* Plain English Summary Card */}
          <div className="bg-slate-900 text-white rounded-lg p-6 sm:p-8 shadow-sm border border-slate-800">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Summary</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {decodeResult.reportTitle}
            </h2>

            {/* Plain English Analogy Box */}
            <div className="mt-5 p-5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs sm:text-sm leading-relaxed text-slate-200">
              <span className="font-bold text-white block mb-1">
                Everyday Analogy:
              </span>
              {decodeResult.gradeLevelExplanation}
            </div>

            {/* Key Takeaways Bullets */}
            <div className="mt-6 space-y-3">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
                Key Findings:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {decodeResult.keyTakeaways.map((takeaway, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-slate-800/50 border border-slate-700 text-xs text-slate-200 flex items-start gap-2.5"
                  >
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decoded Items Dictionary Table */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  Medical Terms & Test Values
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click the speaker button to hear the pronunciation and plain definition aloud.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md">
                {decodeResult.decodedItems.length} Terms
              </span>
            </div>

            <div className="space-y-4">
              {decodeResult.decodedItems.map((item, idx) => {
                const badge = getStatusBadge(item.status);
                const BadgeIcon = badge.icon;
                const isSpeaking = speakingTerm === item.term;

                return (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleSpeakTerm(item)}
                          className={`p-2 rounded-md border transition-all duration-200 ease-in-out ${
                            isSpeaking
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                          title={isSpeaking ? 'Stop audio' : 'Listen to pronunciation'}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{item.term}</h4>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {item.patientValue && (
                          <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-800">
                            Result: {item.patientValue}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded border ${badge.bg}`}
                        >
                          <BadgeIcon className="w-3.5 h-3.5" />
                          {badge.text}
                        </span>
                      </div>
                    </div>

                    {/* Original vs Plain Meaning */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Original Text:
                        </span>
                        <p className="font-mono text-slate-700 leading-relaxed">{item.originalText}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100">
                        <span className="text-[10px] font-bold uppercase text-blue-700 block mb-1">
                          Plain Meaning:
                        </span>
                        <p className="text-blue-950 font-medium leading-relaxed">
                          {item.plainEnglishMeaning}
                        </p>
                      </div>
                    </div>

                    {/* Clinical Significance Note */}
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                      <span className="font-semibold text-slate-700">Context:</span>
                      <span>{item.clinicalSignificance}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Grid: Questions for Doctor & Lifestyle Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Questions to ask doctor */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  Questions to Ask Your Doctor
                </h4>
                <button
                  id="copy-lab-questions-btn"
                  onClick={handleCopyQuestions}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 p-1 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedQuestions ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="space-y-2.5">
                {decodeResult.questionsForDoctor.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed flex gap-2.5"
                  >
                    <span className="font-bold text-blue-600">{idx + 1}.</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lifestyle & Next Steps */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Recommended Next Steps
              </h4>
              <div className="space-y-2.5">
                {decodeResult.lifestyleOrNextSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
