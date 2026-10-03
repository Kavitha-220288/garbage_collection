'use client';

import React from 'react';
import { DataOrigin } from '@/lib/utils';
import { Database, Sparkles, Activity } from 'lucide-react';

interface OriginBadgeProps {
  origin: DataOrigin;
  confidence?: number; // e.g. 0.94 for 94%
  showConfidence?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function OriginBadge({
  origin,
  confidence,
  showConfidence = true,
  size = 'sm',
  className = '',
}: OriginBadgeProps) {
  const config = {
    REAL: {
      label: 'REAL DATA',
      bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      icon: Database,
    },
    SIMULATED: {
      label: 'SIMULATED',
      bg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
      icon: Activity,
    },
    PREDICTED: {
      label: 'AI PREDICTED',
      bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
      icon: Sparkles,
    },
  }[origin];

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-semibold' : 'px-2.5 py-1 text-xs font-bold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${sizeClasses} ${config.bg} ${className}`}
      title={`Data Origin: ${origin}${confidence ? ` | Confidence: ${Math.round(confidence * 100)}%` : ''}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{config.label}</span>
      {showConfidence && confidence !== undefined && origin === 'PREDICTED' && (
        <span className="ml-0.5 opacity-80">({Math.round(confidence * 100)}%)</span>
      )}
    </span>
  );
}
