'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingSpinner({ label = 'Loading operational data...', className = '' }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {label && <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/70 dark:bg-muted/40 ${className}`}
    />
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3">
      <div className="flex h-10 w-full animate-pulse rounded-md bg-muted/60" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex h-12 w-full animate-pulse rounded-md bg-muted/30" />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
