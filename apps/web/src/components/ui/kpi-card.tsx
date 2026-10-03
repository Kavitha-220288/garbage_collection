'use client';

import React from 'react';
import { DataOrigin } from '@/lib/utils';
import { OriginBadge } from './origin-badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number; // e.g., +12.5 or -3.2
    label?: string; // e.g., vs last week
    isPositiveGood?: boolean;
  };
  origin?: DataOrigin;
  confidence?: number;
  icon?: React.ElementType;
  description?: string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  unit,
  trend,
  origin = 'SIMULATED',
  confidence,
  icon: Icon,
  description,
  className = '',
}: KpiCardProps) {
  const isPositive = trend ? trend.value > 0 : false;
  const isNegative = trend ? trend.value < 0 : false;
  const isGood = trend
    ? trend.isPositiveGood !== false
      ? isPositive
      : isNegative
    : true;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {value}
            </span>
            {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-2 text-primary dark:bg-primary/20">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <OriginBadge origin={origin} confidence={confidence} size="sm" />
        </div>
      </div>

      {(trend || description) && (
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={`inline-flex items-center gap-0.5 font-semibold ${
                  isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isPositive && <TrendingUp className="h-3.5 w-3.5" />}
                {isNegative && <TrendingDown className="h-3.5 w-3.5" />}
                {!isPositive && !isNegative && <Minus className="h-3.5 w-3.5" />}
                {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}
              </span>
              <span className="text-muted-foreground">{trend.label || 'vs baseline'}</span>
            </div>
          )}

          {description && (
            <span className="text-muted-foreground line-clamp-1">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
