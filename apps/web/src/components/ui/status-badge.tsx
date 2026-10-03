'use client';

import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
  FileCheck,
  Play,
  Send,
} from 'lucide-react';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type SlaStatus = 'MET' | 'AT_RISK' | 'BREACHED' | 'RUNNING';
export type LifecycleStatus =
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'WORK_STARTED'
  | 'EVIDENCE_UPLOADED'
  | 'SUPERVISOR_VERIFIED'
  | 'RESOLVED'
  | 'REOPENED';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  const config = {
    CRITICAL: {
      label: 'Critical',
      bg: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
      icon: AlertTriangle,
    },
    HIGH: {
      label: 'High',
      bg: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30',
      icon: AlertCircle,
    },
    MEDIUM: {
      label: 'Medium',
      bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
      icon: Clock,
    },
    LOW: {
      label: 'Low',
      bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30',
      icon: Clock,
    },
  }[priority];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${config.bg} ${className}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}

interface SlaBadgeProps {
  status: SlaStatus;
  remainingText?: string;
  className?: string;
}

export function SlaBadge({ status, remainingText, className = '' }: SlaBadgeProps) {
  const config = {
    MET: {
      label: 'SLA Met',
      bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
    },
    AT_RISK: {
      label: 'SLA At Risk',
      bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
      icon: AlertCircle,
    },
    BREACHED: {
      label: 'SLA Breached',
      bg: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
      icon: XCircle,
    },
    RUNNING: {
      label: 'SLA Active',
      bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
      icon: Clock,
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${config.bg} ${className}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{remainingText || config.label}</span>
    </span>
  );
}

interface LifecycleBadgeProps {
  status: LifecycleStatus;
  className?: string;
}

export function LifecycleBadge({ status, className = '' }: LifecycleBadgeProps) {
  const config: Record<LifecycleStatus, { label: string; bg: string; icon: React.ElementType }> = {
    SUBMITTED: {
      label: 'Submitted',
      bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30',
      icon: Send,
    },
    VERIFIED: {
      label: 'Verified',
      bg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
      icon: ShieldCheck,
    },
    ASSIGNED: {
      label: 'Assigned',
      bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
      icon: Clock,
    },
    ACCEPTED: {
      label: 'Accepted',
      bg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
      icon: CheckCircle2,
    },
    EN_ROUTE: {
      label: 'En Route',
      bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
      icon: Truck,
    },
    WORK_STARTED: {
      label: 'In Progress',
      bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
      icon: Play,
    },
    EVIDENCE_UPLOADED: {
      label: 'Evidence Uploaded',
      bg: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30',
      icon: FileCheck,
    },
    SUPERVISOR_VERIFIED: {
      label: 'Supervisor Verified',
      bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck,
    },
    RESOLVED: {
      label: 'Resolved',
      bg: 'bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 border-emerald-600/30',
      icon: CheckCircle2,
    },
    REOPENED: {
      label: 'Reopened',
      bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
      icon: RotateCcw,
    },
  };

  const current = config[status] || config.SUBMITTED;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${current.bg} ${className}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{current.label}</span>
    </span>
  );
}
