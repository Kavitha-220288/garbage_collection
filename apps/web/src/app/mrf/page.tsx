'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { KpiCard } from '@/components/ui/kpi-card';
import { OriginBadge } from '@/components/ui/origin-badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { Recycle, Truck, AlertTriangle, CheckCircle2, Scale, FileText } from 'lucide-react';

interface MrfTransaction {
  id: string;
  ticketId: string;
  vehicleId: string;
  originWard: string;
  grossWeight: number; // kg
  tareWeight: number; // kg
  netWeight: number; // kg
  wasteCategory: string;
  contaminationRate: string;
  status: string;
}

export default function MrfDashboard() {
  const transactions: MrfTransaction[] = [
    {
      id: '1',
      ticketId: 'MRF-2026-041',
      vehicleId: 'Vehicle V-12',
      originWard: 'Ward 12 (Gajuwaka)',
      grossWeight: 14200,
      tareWeight: 9400,
      netWeight: 4800,
      wasteCategory: 'Dry Recyclables',
      contaminationRate: '8.2%',
      status: 'Processed (Sorted)',
    },
    {
      id: '2',
      ticketId: 'MRF-2026-042',
      vehicleId: 'Vehicle V-03',
      originWard: 'Ward 2 (MVP Colony)',
      grossWeight: 12800,
      tareWeight: 9200,
      netWeight: 3600,
      wasteCategory: 'Wet Organic Waste',
      contaminationRate: '4.5%',
      status: 'Composting Batch #8',
    },
    {
      id: '3',
      ticketId: 'MRF-2026-043',
      vehicleId: 'Vehicle V-08',
      originWard: 'Ward 4 (Jagadamba)',
      grossWeight: 16100,
      tareWeight: 9500,
      netWeight: 6600,
      wasteCategory: 'Mixed Municipal',
      contaminationRate: '18.4%',
      status: 'Sorting In Progress',
    },
  ];

  const columns: Column<MrfTransaction>[] = [
    {
      key: 'ticketId',
      header: 'Weighbridge Ticket',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-foreground">{row.ticketId}</span>
          <p className="text-[10px] text-muted-foreground">{row.status}</p>
        </div>
      ),
    },
    {
      key: 'vehicleId',
      header: 'Inbound Vehicle & Ward',
      render: (row) => (
        <div>
          <p className="font-semibold text-foreground flex items-center gap-1">
            <Truck className="h-3 w-3 text-primary" /> {row.vehicleId}
          </p>
          <p className="text-[10px] text-muted-foreground">{row.originWard}</p>
        </div>
      ),
    },
    {
      key: 'netWeight',
      header: 'Net Weight',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-foreground">{row.netWeight.toLocaleString()} kg</span>
      ),
    },
    {
      key: 'wasteCategory',
      header: 'Waste Category',
      render: (row) => <span className="text-xs font-medium text-foreground">{row.wasteCategory}</span>,
    },
    {
      key: 'contaminationRate',
      header: 'Contamination %',
      sortable: true,
      render: (row) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
          parseFloat(row.contaminationRate) > 15
            ? 'bg-red-500/10 text-red-700 border-red-500/20'
            : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
        }`}>
          {row.contaminationRate}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => alert(`Downloading manifest ticket ${row.ticketId}`)}
          className="inline-flex items-center gap-1 rounded border border-input bg-card px-2 py-1 text-xs font-semibold text-foreground hover:bg-muted"
        >
          <FileText className="h-3 w-3" /> Ticket Manifest
        </button>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              MRF Material Recovery Hub
            </h1>
            <OriginBadge origin="REAL" size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Hyderabad MRF Plant #1 (Patancheru Industrial Estate) &bull; Suresh N. (MRF Manager)
          </p>
        </div>

        <button
          onClick={() => alert('New Weighbridge Ticket entry dialog...')}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
        >
          <Scale className="h-4 w-4" />
          <span>Record Inbound Load</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Today Inbound Weight"
          value="45.0"
          unit="Tonnes"
          trend={{ value: 12.1, label: 'vs weekly avg' }}
          origin="REAL"
          icon={Scale}
        />
        <KpiCard
          title="Material Recovery Rate"
          value="78.4%"
          unit="Target 75%"
          trend={{ value: 3.4, label: 'high recovery' }}
          origin="REAL"
          icon={Recycle}
        />
        <KpiCard
          title="Avg Contamination Rate"
          value="10.3%"
          unit="Acceptable"
          trend={{ value: -2.1, label: 'improved' }}
          origin="REAL"
          icon={AlertTriangle}
        />
        <KpiCard
          title="Landfill Diversion"
          value="35.2"
          unit="Tonnes Today"
          trend={{ value: 15.0, label: 'co2 credit' }}
          origin="SIMULATED"
          icon={CheckCircle2}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Inbound Weighbridge & Sort Transactions</h3>
          <span className="text-xs text-muted-foreground">Showing 3 plant transactions today</span>
        </div>

        <DataTable
          columns={columns}
          data={transactions}
          searchPlaceholder="Search by ticket ID, vehicle, or waste category..."
          onExportCsv={() => alert('Exporting Material Recovery Report (CSV)...')}
        />
      </div>
    </AppShell>
  );
}
