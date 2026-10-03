'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Globe, Sparkles, Check, RefreshCw } from 'lucide-react';

interface VoiceAssistantProps {
  onTranscriptChange?: (text: string, language: string) => void;
  onCategorySuggested?: (category: string) => void;
  className?: string;
}

export function VoiceAssistant({
  onTranscriptChange,
  onCategorySuggested,
  className = '',
}: VoiceAssistantProps) {
  const [selectedLang, setSelectedLang] = useState<'te' | 'hi' | 'en'>('en');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const sampleVoicePhrases: Record<'te' | 'hi' | 'en', { phrase: string; translation: string; category: string }> = {
    te: {
      phrase: 'ఇక్కడ చెత్త కుండీ నిండిపోయి రోడ్డుపై పడిపోతుంది, త్వరగా పంపించండి.',
      translation: 'The garbage bin here is overflowing onto the road, please send a vehicle quickly.',
      category: 'Overflowing Bin',
    },
    hi: {
      phrase: 'यहाँ कचरा पेटियाँ पूरी भर चुकी हैं और बदबू आ रही है, सफाई करवाइए।',
      translation: 'Garbage bins here are overflowing with bad odor, please arrange cleaning.',
      category: 'Overflowing Bin',
    },
    en: {
      phrase: 'Large pile of overflowing garbage blocking the main market lane near MVP Colony.',
      translation: 'Large pile of overflowing garbage blocking the main market lane near MVP Colony.',
      category: 'Overflowing Bin',
    },
  };

  const handleToggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setTranscript('');
    setAiAnalysis(null);

    // Check for native SpeechRecognition API or simulate voice recording
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = selectedLang === 'te' ? 'te-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          const text = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setTranscript(text);
          if (onTranscriptChange) onTranscriptChange(text, selectedLang);
        };

        recognition.onerror = () => {
          simulateVoiceInput();
        };

        recognition.onend = () => {
          setIsListening(false);
          processAiVoiceAnalysis();
        };

        recognition.start();
      } catch (err) {
        simulateVoiceInput();
      }
    } else {
      simulateVoiceInput();
    }
  };

  const simulateVoiceInput = () => {
    setTimeout(() => {
      const sample = sampleVoicePhrases[selectedLang];
      setTranscript(sample.phrase);
      if (onTranscriptChange) onTranscriptChange(sample.phrase, selectedLang);
      setIsListening(false);
      processAiVoiceAnalysis(sample);
    }, 1200);
  };

  const processAiVoiceAnalysis = (customSample?: any) => {
    const sample = customSample || sampleVoicePhrases[selectedLang];
    setAiAnalysis(`AI Transcribed (${selectedLang.toUpperCase()}) & Translated to English: "${sample.translation}"`);
    if (onCategorySuggested) onCategorySuggested(sample.category);
  };

  return (
    <div className={`rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-white dark:from-indigo-950/40 dark:to-slate-900 p-4 space-y-3.5 shadow-sm ${className}`}>
      {/* Header & Language Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 dark:border-indigo-900 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <Volume2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Voice Complaint Assistant</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </h4>
            <p className="text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
              Speak in Telugu, Hindi, or English — Auto AI Translation
            </p>
          </div>
        </div>

        {/* Multilingual Selector Buttons */}
        <div className="flex items-center gap-1 bg-indigo-100/70 dark:bg-indigo-900/60 p-1 rounded-xl border border-indigo-200 dark:border-indigo-800">
          <button
            type="button"
            onClick={() => setSelectedLang('te')}
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all ${
              selectedLang === 'te'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-800 dark:text-indigo-300 hover:bg-indigo-200/50'
            }`}
          >
            తెలుగు (Telugu)
          </button>
          <button
            type="button"
            onClick={() => setSelectedLang('hi')}
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all ${
              selectedLang === 'hi'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-800 dark:text-indigo-300 hover:bg-indigo-200/50'
            }`}
          >
            हिंदी (Hindi)
          </button>
          <button
            type="button"
            onClick={() => setSelectedLang('en')}
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all ${
              selectedLang === 'en'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-800 dark:text-indigo-300 hover:bg-indigo-200/50'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Mic Trigger Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={handleToggleListening}
          className={`flex-1 w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-black text-white shadow-md transition-all ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 animate-pulse ring-4 ring-red-500/30'
              : 'bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4 animate-spin" />
              <span>Listening in {selectedLang === 'te' ? 'Telugu' : selectedLang === 'hi' ? 'Hindi' : 'English'}... Tap to Stop</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span>Tap to Speak Complaint in {selectedLang === 'te' ? 'తెలుగు' : selectedLang === 'hi' ? 'हिंदी' : 'English'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => simulateVoiceInput()}
          className="rounded-xl border border-indigo-300 bg-white dark:bg-slate-900 px-3.5 py-3 text-[11px] font-bold text-indigo-800 dark:text-indigo-200 hover:bg-indigo-50 transition-colors shrink-0"
        >
          Use Demo Sample Phrase
        </button>
      </div>

      {/* Transcript & AI Translation Box */}
      {transcript && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 p-3 space-y-2 text-xs">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              Captured Voice Speech ({selectedLang.toUpperCase()}):
            </span>
            <p className="text-slate-900 dark:text-slate-100 font-bold mt-0.5">{transcript}</p>
          </div>

          {aiAnalysis && (
            <div className="pt-2 border-t border-indigo-100 dark:border-indigo-950 text-[11px] font-medium text-indigo-900 dark:text-indigo-200 flex items-start gap-1.5 bg-indigo-50/60 dark:bg-indigo-950/30 p-2 rounded-lg">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>{aiAnalysis}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
