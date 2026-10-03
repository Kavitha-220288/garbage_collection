'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { OriginBadge } from '@/components/ui/origin-badge';
import { PriorityBadge, SlaBadge, LifecycleBadge } from '@/components/ui/status-badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { Tabs } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { LeafletGisMap } from '@/components/maps';
import { Incident, LifecycleStatus } from '@smartwaste360/contracts';
import { AlertTriangle, Clock, MapPin, Truck, CheckCircle2, ShieldCheck, XOctagon, Map, ListFilter } from 'lucide-react';

export default function OfficerIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activeTab, setActiveTab] = useState('map');

  const [transitionStatus, setTransitionStatus] = useState<LifecycleStatus>('VERIFIED');
  const [transitionError, setTransitionError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/incidents');
      const data = await res.json();
      if (data.success) {
        setIncidents(data.incidents);
      }
    } catch (err: any) {
      console.error('Failed to fetch incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleTransition = async () => {
    if (!selectedIncident) return;
    setTransitionError(null);

    try {
      const res = await fetch(`/api/incidents/${selectedIncident.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetStatus: transitionStatus,
          actor: 'Dr. K. V. Rao',
          actorRole: 'Municipal Officer',
          details: `Manual state transition request to ${transitionStatus}`,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      setSelectedIncident(data.incident);
      fetchIncidents();
    } catch (err: any) {
      setTransitionError(err.message || 'Transition rejected');
    }
  };

  const columns: Column<Incident>[] = [
    {
      key: 'id',
      header: 'Incident ID & Title',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-foreground">{row.id}</span>
          <p className="text-[10px] text-muted-foreground">{row.title}</p>
        </div>
      ),
    },
    {
      key: 'reportsCount',
      header: 'Clustered Reports',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 font-extrabold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
          {row.reportsCount} Report(s)
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      key: 'status',
      header: 'Lifecycle State',
      render: (row) => <LifecycleBadge status={row.status} />,
    },
    {
      key: 'slaStatus',
      header: 'SLA Status',
      render: (row) => <SlaBadge status={row.slaStatus} remainingText={`Target ${row.slaTargetHours}h`} />,
    },
    {
      key: 'origin',
      header: 'Origin',
      render: (row) => <OriginBadge origin={row.origin} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Manage',
      render: (row) => (
        <button
          onClick={() => {
            setSelectedIncident(row);
            setTransitionError(null);
          }}
          className="rounded-md border border-input bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted"
        >
          Inspect & Transition
        </button>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Incident Management & Guarded State Machine
            </h1>
            <OriginBadge origin="REAL" size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Clustered incident management, explainable priority breakdown, and strict guarded transitions.
          </p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'map', label: 'GIS Operations Map', icon: Map },
          { id: 'matrix', label: 'Incident Data Matrix', badge: incidents.length, icon: ListFilter },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {activeTab === 'map' && (
        <div className="space-y-3">
          <LeafletGisMap
            height="h-[600px]"
            onSelectEntity={(type, entity) => {
              if (type === 'incident') {
                const matched = incidents.find((i) => i.id === entity.id);
                if (matched) setSelectedIncident(matched);
              }
            }}
          />
        </div>
      )}

      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={incidents}
            searchPlaceholder="Filter incidents by ID, category, or title..."
            onExportCsv={() => alert('Exporting Incidents Matrix CSV...')}
          />
        </div>
      )}


      {/* Inspect & Transition Modal */}
      {selectedIncident && (
        <Modal
          isOpen={!!selectedIncident}
          onClose={() => setSelectedIncident(null)}
          title={`Manage Incident #${selectedIncident.id}`}
          description={`Category: ${selectedIncident.categoryLabel} | Location: ${selectedIncident.address}`}
          maxWidth="lg"
        >
          <div className="space-y-4 py-2">
            {/* Status & Priority Badge Strip */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <LifecycleBadge status={selectedIncident.status} />
                <PriorityBadge priority={selectedIncident.priority} />
              </div>
              <SlaBadge status={selectedIncident.slaStatus} remainingText={`SLA ${selectedIncident.slaTargetHours}h Target`} />
            </div>

            {/* Explainable Priority Breakdown */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
              <span className="text-xs font-bold text-foreground">Explainable Priority Factors Breakdown</span>
              <div className="space-y-1">
                {selectedIncident.priorityFactors.map((f: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{f.factor}: {f.explanation}</span>
                    <span className="font-mono font-bold text-primary">+{f.contribution} pts</span>
                  </div>
                ))}

              </div>
            </div>

            {/* Transition Control */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Select Target Lifecycle Transition</label>
              <select
                value={transitionStatus}
                onChange={(e) => setTransitionStatus(e.target.value as LifecycleStatus)}
                className="w-full rounded-lg border border-input bg-card p-2 text-xs text-foreground focus:border-primary"
              >
                <option value="VERIFIED">VERIFIED (From Submitted)</option>
                <option value="ASSIGNED">ASSIGNED (From Verified)</option>
                <option value="ACCEPTED">ACCEPTED (From Assigned)</option>
                <option value="EN_ROUTE">EN_ROUTE (From Accepted/Assigned)</option>
                <option value="WORK_STARTED">WORK_STARTED (From En Route)</option>
                <option value="EVIDENCE_UPLOADED">EVIDENCE_UPLOADED (From Work Started)</option>
                <option value="SUPERVISOR_VERIFIED">SUPERVISOR_VERIFIED (From Evidence Uploaded)</option>
                <option value="RESOLVED">RESOLVED (From Supervisor Verified)</option>
              </select>
            </div>

            {/* Invalid Transition Error Banner */}
            {transitionError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 flex items-start gap-2 text-destructive">
                <XOctagon className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="text-xs font-semibold leading-relaxed">
                  <p className="font-bold">Guarded Transition Rejected!</p>
                  <p>{transitionError}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="rounded-lg border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleTransition}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Execute Transition
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
