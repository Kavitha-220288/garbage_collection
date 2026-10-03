'use client';

import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';

export type LanguageCode = 'en' | 'hi' | 'te';

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const [lang, setLang] = useState<LanguageCode>('en');
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  ];

  const current = languages.find((l) => l.code === lang) || languages[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors focus:outline-hidden"
        title="Change Language"
        aria-label="Language Selector"
      >
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-semibold uppercase">{current.code}</span>
        <span className="hidden sm:inline text-muted-foreground">({current.native})</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-40 rounded-xl border border-border bg-card p-1 shadow-lg animate-in fade-in zoom-in-95">
            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Select Language
            </div>
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code as LanguageCode);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors ${
                  lang === l.code
                    ? 'bg-primary/10 font-semibold text-primary dark:bg-primary/20'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <span>{l.name} ({l.native})</span>
                {lang === l.code && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
