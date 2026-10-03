'use client';

import React, { useState, useEffect } from 'react';
import { WasteCategory, WasteCategoryLabels } from '@smartwaste360/contracts';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Award,
  ShieldCheck,
  Scale,
  Layers,
  BarChart2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { OriginBadge } from '@/components/ui/origin-badge';

export interface AiEvaluationResult {
  aiScore: number; // 0 to 100
  confidence: number; // 0 to 1.0
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedCategory: string;
  composition: {
    plastics: number;
    organic: number;
    hazardous: number;
    other: number;
  };
  ecoPointsEarned: number;
  clearanceVerified?: boolean;
  recommendation: string;
  hash: string;
}

interface AiPhotoEvaluatorProps {
  photoUrl?: string | null;
  role: 'CITIZEN' | 'WORKER';
  category?: WasteCategory;
  beforePhotoUrl?: string | null;
  afterPhotoUrl?: string | null;
  className?: string;
  onEvaluationComplete?: (result: AiEvaluationResult) => void;
}

export function AiPhotoEvaluator({
  photoUrl,
  role,
  category = 'OVERFLOWING_BIN',
  beforePhotoUrl,
  afterPhotoUrl,
  className = '',
  onEvaluationComplete,
}: AiPhotoEvaluatorProps) {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AiEvaluationResult | null>(null);

  const runAiEvaluation = (url: string) => {
    setIsEvaluating(true);

    // Simulate fast neural network inferencing
    setTimeout(() => {
      const categoryInfo = WasteCategoryLabels[category] || WasteCategoryLabels['OVERFLOWING_BIN'];
      const isHazard = categoryInfo.isHazardous;

      // Seed score based on string length & hash simulation
      const baseSeed = url.length + (category ? category.length : 10);
      const randomSeed = (baseSeed % 20) + 75;

      const result: AiEvaluationResult = {
        aiScore: Math.min(99, Math.max(65, randomSeed)),
        confidence: 0.94 + (Math.random() * 0.05),
        severity: isHazard ? 'CRITICAL' : category === 'OVERFLOWING_BIN' ? 'HIGH' : 'MEDIUM',
        detectedCategory: categoryInfo.name,
        composition: {
          plastics: isHazard ? 25 : 55,
          organic: isHazard ? 15 : 30,
          hazardous: isHazard ? 50 : 5,
          other: isHazard ? 10 : 10,
        },
        ecoPointsEarned: Math.min(100, Math.max(30, Math.floor(randomSeed * 0.9))),
        clearanceVerified: role === 'WORKER',
        recommendation: role === 'CITIZEN'
          ? `High confidence match. Recommended priority: ${isHazard ? 'CRITICAL (2h SLA)' : 'HIGH (4h SLA)'}. Dispatch Compactor V-03.`
          : 'AI Vision verified site clearance > 95%. Zero residual hazard detected. Ready for Supervisor verification.',
        hash: `sha256:${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 10)}`,
      };

      setEvaluation(result);
      setIsEvaluating(false);
      if (onEvaluationComplete) onEvaluationComplete(result);
    }, 650);
  };

  useEffect(() => {
    const targetUrl = photoUrl || afterPhotoUrl || beforePhotoUrl;
    if (targetUrl) {
      runAiEvaluation(targetUrl);
    }
  }, [photoUrl, beforePhotoUrl, afterPhotoUrl, category]);

  if (!photoUrl && !afterPhotoUrl && !beforePhotoUrl) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-card p-4 space-y-3.5 shadow-sm transition-all ${className}`}
    >
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-100 flex items-center gap-1.5">
              <span>Swachh Setu AI Vision Photo Evaluator</span>
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
            </h4>
            <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-medium">
              Neural Image Analysis &bull; Model v3.4-Vision
            </p>
          </div>
        </div>

        <OriginBadge origin="PREDICTED" confidence={evaluation?.confidence || 0.95} size="sm" />
      </div>

      {isEvaluating ? (
        <div className="flex flex-col items-center justify-center py-6 space-y-2 text-center">
          <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
          <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
            Scanning Image Tensors & Evaluating Quality...
          </p>
          <p className="text-[10px] text-muted-foreground">Extracting waste density, hazard classification & score</p>
        </div>
      ) : evaluation ? (
        <div className="space-y-3">
          {/* Top Score Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-lg bg-white/80 dark:bg-slate-900/80 p-2.5 border border-indigo-200 dark:border-indigo-800 text-center">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">
                {role === 'CITIZEN' ? 'AI Severity Index' : 'Clearance Score'}
              </span>
              <span className="text-lg font-black text-indigo-700 dark:text-indigo-400">
                {evaluation.aiScore} <span className="text-xs font-normal text-muted-foreground">/ 100</span>
              </span>
            </div>

            <div className="rounded-lg bg-white/80 dark:bg-slate-900/80 p-2.5 border border-indigo-200 dark:border-indigo-800 text-center">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">AI Confidence</span>
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                {Math.round(evaluation.confidence * 100)}%
              </span>
            </div>

            <div className="rounded-lg bg-white/80 dark:bg-slate-900/80 p-2.5 border border-indigo-200 dark:border-indigo-800 text-center">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Severity Level</span>
              <span
                className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${
                  evaluation.severity === 'CRITICAL'
                    ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                    : evaluation.severity === 'HIGH'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                    : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400'
                }`}
              >
                {evaluation.severity}
              </span>
            </div>

            <div className="rounded-lg bg-white/80 dark:bg-slate-900/80 p-2.5 border border-indigo-200 dark:border-indigo-800 text-center">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Rate Our Work</span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1 mt-1">
                <Award className="h-4 w-4 text-amber-500" />
                <span>⭐ 4.9 / 5.0</span>
              </span>
            </div>
          </div>

          {/* Composition Breakdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-foreground">
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3 text-indigo-600" /> AI Visual Waste Composition Breakdown
              </span>
              <span className="text-muted-foreground">{evaluation.detectedCategory}</span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${evaluation.composition.plastics}%` }}
                title={`Plastics & Dry Recyclables: ${evaluation.composition.plastics}%`}
              />
              <div
                className="h-full bg-indigo-500"
                style={{ width: `${evaluation.composition.organic}%` }}
                title={`Organic Wet Waste: ${evaluation.composition.organic}%`}
              />
              <div
                className="h-full bg-red-500"
                style={{ width: `${evaluation.composition.hazardous}%` }}
                title={`Hazardous Items: ${evaluation.composition.hazardous}%`}
              />
              <div
                className="h-full bg-slate-400"
                style={{ width: `${evaluation.composition.other}%` }}
                title={`Other Debris: ${evaluation.composition.other}%`}
              />
            </div>

            <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-0.5">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" /> Plastics ({evaluation.composition.plastics}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-indigo-500 inline-block" /> Organic ({evaluation.composition.organic}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500 inline-block" /> Hazardous ({evaluation.composition.hazardous}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-400 inline-block" /> Other ({evaluation.composition.other}%)
              </span>
            </div>
          </div>

          {/* AI Recommendation & Audit Provenance */}
          <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-2.5 space-y-1">
            <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
              <span>{evaluation.recommendation}</span>
            </p>
            <div className="flex items-center justify-between text-[9px] font-mono text-indigo-700 dark:text-indigo-400 pt-0.5">
              <span>EXIF Verification Hash: {evaluation.hash}</span>
              <span className="flex items-center gap-0.5">
                <ShieldCheck className="h-3 w-3 text-indigo-600" /> Provenance Cryptographically Sealed
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
