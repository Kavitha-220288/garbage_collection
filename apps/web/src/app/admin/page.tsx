'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { KpiCard } from '@/components/ui/kpi-card';
import { OriginBadge } from '@/components/ui/origin-badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { Tabs } from '@/components/ui/tabs';
import { LeafletGisMap } from '@/components/maps';
import { Settings, ShieldCheck, Users, MapPin, Clock, FileCode2, Map } from 'lucide-react';


interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entity: string;
  origin: 'REAL' | 'SIMULATED';
  ipAddress: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('audit');

  const auditLogs: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: '2026-10-03 16:45:12',
      actor: 'Dr. K. V. Rao',
      role: 'Municipal Officer',
      action: 'REASSIGN_INCIDENT',
      entity: 'Incident #INC-2026-089',
      origin: 'REAL',
      ipAddress: '10.12.4.88',
    },
    {
      id: '2',
      timestamp: '2026-10-03 16:30:05',
      actor: 'Anitha R.',
      role: 'Supervisor',
      action: 'VERIFY_EVIDENCE',
      entity: 'Task #TSK-880',
      origin: 'REAL',
      ipAddress: '10.12.4.92',
    },
    {
      id: '3',
      timestamp: '2026-10-03 15:10:44',
      actor: 'Priya S.',
      role: 'Admin',
      action: 'UPDATE_SLA_RULE',
      entity: 'SLA Rule: Overflowing Bin (4h Target)',
      origin: 'REAL',
      ipAddress: '10.12.4.10',
    },
  ];

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (row) => <span className="font-mono text-xs text-foreground">{row.timestamp}</span>,
    },
    {
      key: 'actor',
      header: 'Actor & Role',
      render: (row) => (
        <div>
          <p className="font-semibold text-foreground">{row.actor}</p>
          <p className="text-[10px] text-muted-foreground">{row.role}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Audit Action',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
          {row.action}
        </span>
      ),
    },
    {
      key: 'entity',
      header: 'Target Entity',
      render: (row) => <span className="text-xs text-foreground">{row.entity}</span>,
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (row) => <span className="font-mono text-xs text-muted-foreground">{row.ipAddress}</span>,
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              System Administration & Configuration
            </h1>
            <OriginBadge origin="REAL" size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Priya Sharma (Platform Administrator) &bull; GHMC Hyderabad Municipal Config
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active System Users"
          value="112"
          unit="6 Roles"
          origin="REAL"
          icon={Users}
        />
        <KpiCard
          title="Configured Wards"
          value="20 Wards"
          unit="5 Zones"
          origin="REAL"
          icon={MapPin}
        />
        <KpiCard
          title="SLA Default Rules"
          value="4 Active"
          unit="Rules Engine"
          origin="REAL"
          icon={Clock}
        />
        <KpiCard
          title="Audit Log Integrity"
          value="100%"
          unit="Append Only"
          origin="REAL"
          icon={ShieldCheck}
        />
      </div>

      <Tabs
        tabs={[
          { id: 'gis', label: 'GIS Master City Overview', icon: Map },
          { id: 'audit', label: 'Immutable Audit Trail', badge: 3, icon: ShieldCheck },
          { id: 'sla', label: 'SLA Rule Matrix', icon: Clock },
          { id: 'roles', label: 'RBAC Scopes', icon: Users },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {activeTab === 'gis' && (
        <div className="space-y-3">
          <LeafletGisMap height="h-[600px]" />
        </div>
      )}


      {activeTab === 'audit' && (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={auditLogs}
            searchPlaceholder="Search audit events by actor, action, or entity..."
            onExportCsv={() => alert('Exporting Audit Logs (CSV)...')}
          />
        </div>
      )}

      {activeTab === 'sla' && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-base font-bold text-foreground">Default Municipal SLA Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-4 space-y-1">
              <span className="text-xs font-bold text-foreground">Overflowing Bin Complaint</span>
              <p className="text-sm font-extrabold text-primary">Response Target: 4 Hours</p>
              <p className="text-[11px] text-muted-foreground">Auto-escalates to Supervisor after 2 hours idle.</p>
            </div>
            <div className="rounded-lg border border-border p-4 space-y-1">
              <span className="text-xs font-bold text-foreground">Illegal Dumping Clearance</span>
              <p className="text-sm font-extrabold text-primary">Response Target: 8 Hours</p>
              <p className="text-[11px] text-muted-foreground">Requires before/after photo verification hash.</p>
            </div>
            <div className="rounded-lg border border-border p-4 space-y-1">
              <span className="text-xs font-bold text-foreground">Missed Household Pickup</span>
              <p className="text-sm font-extrabold text-primary">Response Target: 12 Hours</p>
              <p className="text-[11px] text-muted-foreground">Reassigned to nearest route vehicle automatically.</p>
            </div>
            <div className="rounded-lg border border-border p-4 space-y-1">
              <span className="text-xs font-bold text-foreground">Hazardous Waste Hazard</span>
              <p className="text-sm font-extrabold text-red-600">Response Target: Emergency Dispatch</p>
              <p className="text-[11px] text-muted-foreground">Immediate SMS broadcast to municipal officer & HAZMAT crew.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="rounded-xl border border-border bg-card p-6 text-center py-12 space-y-2">
          <Users className="h-8 w-8 text-primary mx-auto" />
          <h3 className="text-base font-bold text-foreground">Role Scoping (ABAC + RBAC)</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Manage granular scopes across Ward, Zone, and Facility boundaries for Citizens, Workers, Supervisors, Officers, MRF Managers, and Admins.
          </p>
        </div>
      )}
    </AppShell>
  );
}
