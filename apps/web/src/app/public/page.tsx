'use client';

import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { KpiCard } from '@/components/ui/kpi-card';
import { OriginBadge } from '@/components/ui/origin-badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { Eye, Award, Recycle, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';

interface WardBenchmark {
  wardName: string;
  zone: string;
  cleanlinessScore: number;
  segregationRate: string;
  slaCompliance: string;
  rank: number;
}

export default function PublicDashboard() {
  const wards: WardBenchmark[] = [
    { rank: 1, wardName: 'Ward 4 (Jagadamba)', zone: 'Zone 1', cleanlinessScore: 92, segregationRate: '84%', slaCompliance: '96%' },
    { rank: 2, wardName: 'Ward 2 (MVP Colony)', zone: 'Zone 1', cleanlinessScore: 89, segregationRate: '81%', slaCompliance: '94%' },
    { rank: 3, wardName: 'Ward 12 (Gajuwaka)', zone: 'Zone 3', cleanlinessScore: 85, segregationRate: '76%', slaCompliance: '90%' },
    { rank: 4, wardName: 'Ward 1 (Beach Road)', zone: 'Zone 1', cleanlinessScore: 82, segregationRate: '72%', slaCompliance: '88%' },
  ];

  const columns: Column<WardBenchmark>[] = [
    {
      key: 'rank',
      header: 'City Rank',
      sortable: true,
      render: (row) => (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          #{row.rank}
        </span>
      ),
    },
    {
      key: 'wardName',
      header: 'Ward Name',
      render: (row) => (
        <div>
          <p className="font-bold text-foreground">{row.wardName}</p>
          <p className="text-[10px] text-muted-foreground">{row.zone}</p>
        </div>
      ),
    },
    {
      key: 'cleanlinessScore',
      header: 'Cleanliness Score',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-foreground text-sm">{row.cleanlinessScore} / 100</span>
          <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${row.cleanlinessScore}%` }} />
          </div>
        </div>
      ),
    },
    {
      key: 'segregationRate',
      header: 'Source Segregation',
      render: (row) => <span className="font-semibold text-emerald-600 dark:text-emerald-400">{row.segregationRate}</span>,
    },
    {
      key: 'slaCompliance',
      header: 'SLA Resolution Rate',
      render: (row) => <span className="font-semibold text-foreground">{row.slaCompliance}</span>,
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Hyderabad Public Waste Transparency Portal
            </h1>
            <OriginBadge origin="REAL" size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Open City Performance Metrics &bull; Pre-Aggregated Anonymized Data (No PII Exposed)
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="h-4 w-4" />
          <span>Open Municipal Data</span>
        </div>
      </div>

      {/* City Cleanliness Score & Impact KPIs (Section: #score) */}
      <div id="score" className="scroll-mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Monthly Waste Recycled"
          value="1,420"
          unit="Tonnes"
          trend={{ value: 12.5, label: 'recovery rate' }}
          origin="REAL"
          icon={Recycle}
        />
        <KpiCard
          title="City Resolution Rate"
          value="94.2%"
          unit="Within SLA"
          trend={{ value: 3.1, label: 'faster pickup' }}
          origin="REAL"
          icon={CheckCircle2}
        />
        <KpiCard
          title="CO2 Emissions Avoided"
          value="840"
          unit="Tonnes CO2e"
          trend={{ value: 18.2, label: 'green impact' }}
          origin="SIMULATED"
          icon={Award}
        />
        <KpiCard
          title="Citizen Eco-Champions"
          value="12,450"
          unit="Active"
          trend={{ value: 14.0, label: 'community engagement' }}
          origin="REAL"
          icon={Eye}
        />
      </div>

      {/* Ward Cleanliness & Performance Leaderboard (Section: #wards) */}
      <div id="wards" className="scroll-mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Ward Cleanliness & Performance Leaderboard</h3>
          <span className="text-xs text-muted-foreground">Updated daily from verified field telemetry</span>
        </div>

        <DataTable
          columns={columns}
          data={wards}
          searchPlaceholder="Search ward by name or zone..."
          onExportCsv={() => alert('Exporting Public Ward Performance Dataset (CSV)...')}
        />
      </div>
    </AppShell>
  );
}

