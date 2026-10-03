'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { KpiCard } from '@/components/ui/kpi-card';
import { OriginBadge } from '@/components/ui/origin-badge';
import { PriorityBadge, SlaBadge, LifecycleBadge } from '@/components/ui/status-badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { Tabs } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { LeafletGisMap } from '@/components/maps';
import { MissedPickupReasonLabels, MissedPickupReason } from '@smartwaste360/contracts';
import {
  ShieldCheck,
  Truck,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Map,
  XCircle,
  FileCheck,
  RefreshCw,
  Award,
  Layers,
  Camera,
  RotateCcw,
} from 'lucide-react';

interface SupervisorTask {
  id: string;
  taskId: string;
  workerName: string;
  vehicleId: string;
  location: string;
  wardName: string;
  type: string;
  status: 'SUBMITTED' | 'ASSIGNED' | 'EN_ROUTE' | 'WORK_STARTED' | 'EVIDENCE_UPLOADED' | 'SUPERVISOR_VERIFIED' | 'RESOLVED';
  evidenceBeforeUrl?: string;
  evidenceAfterUrl?: string;
  evidenceHash: string;
  recordedWeightKg?: number;
  missedReason?: MissedPickupReason;
  time: string;
  origin: 'REAL' | 'SIMULATED';
}

import { AiPhotoEvaluator } from '@/components/common/ai-photo-evaluator';

export default function SupervisorDashboard() {
  const [activeTab, setActiveTab] = useState('verification');
  const [selectedTaskForVerification, setSelectedTaskForVerification] = useState<SupervisorTask | null>(null);

  const [tasks, setTasks] = useState<SupervisorTask[]>([
    {
      id: '1',
      taskId: 'TSK-881',
      workerName: 'Ravi Kumar (Driver)',
      vehicleId: 'Vehicle V-12',
      location: 'Gajuwaka Main Market (Bin #B-108)',
      wardName: 'Ward 12 (Gajuwaka)',
      type: 'Overflowing Bin Clearing',
      status: 'EVIDENCE_UPLOADED',
      evidenceBeforeUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
      evidenceAfterUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
      evidenceHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      recordedWeightKg: 450,
      time: '12 mins ago',
      origin: 'REAL',
    },
    {
      id: '2',
      taskId: 'TSK-882',
      workerName: 'Srinivas M.',
      vehicleId: 'Vehicle V-08',
      location: 'MVP Colony Sector 3 Bus Stop',
      wardName: 'Ward 2 (MVP Colony)',
      type: 'Scheduled Household Pickup',
      status: 'EN_ROUTE',
      evidenceHash: 'Pending completion',
      time: 'In Progress',
      origin: 'SIMULATED',
    },
    {
      id: '3',
      taskId: 'TSK-880',
      workerName: 'K. Prasad',
      vehicleId: 'Vehicle V-03',
      location: 'Jagadamba Junction Commercial Yard',
      wardName: 'Ward 4 (Jagadamba)',
      type: 'Illegal Dumping Removal',
      status: 'SUPERVISOR_VERIFIED',
      evidenceBeforeUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
      evidenceAfterUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
      evidenceHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      recordedWeightKg: 620,
      time: '45 mins ago',
      origin: 'REAL',
    },
  ]);

  // Handle Supervisor Evidence Verification Approval
  const handleApproveEvidence = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.taskId === taskId ? { ...t, status: 'SUPERVISOR_VERIFIED' } : t))
    );
    setSelectedTaskForVerification(null);
    alert(`Evidence for ${taskId} verified & approved by Supervisor Anitha R. Task moved to RESOLVED.`);
  };

  // Handle Supervisor Evidence Rejection
  const handleRejectEvidence = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.taskId === taskId ? { ...t, status: 'WORK_STARTED' } : t))
    );
    setSelectedTaskForVerification(null);
    alert(`Evidence for ${taskId} rejected. Returned to worker for re-upload.`);
  };

  const columns: Column<SupervisorTask>[] = [
    {
      key: 'taskId',
      header: 'Task & Type',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-extrabold text-xs text-slate-900">{row.taskId}</span>
          <p className="text-[10px] text-muted-foreground">{row.type}</p>
        </div>
      ),
    },
    {
      key: 'workerName',
      header: 'Worker & Fleet',
      render: (row) => (
        <div>
          <p className="font-bold text-xs text-slate-900">{row.workerName}</p>
          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <Truck className="h-3 w-3 text-emerald-600" /> {row.vehicleId}
          </p>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Ward Location',
      render: (row) => (
        <div>
          <span className="text-xs text-slate-800 font-medium flex items-center gap-1">
            <MapPin className="h-3 w-3 text-emerald-600" /> {row.location}
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
            {row.wardName}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Lifecycle State',
      render: (row) => <LifecycleBadge status={row.status} />,
    },
    {
      key: 'evidenceHash',
      header: 'Evidence Integrity',
      render: (row) => (
        <div className="max-w-xs">
          {row.status === 'EVIDENCE_UPLOADED' || row.status === 'SUPERVISOR_VERIFIED' ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="h-3 w-3 text-emerald-600" /> SHA-256 Verified
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium">Awaiting Photo</span>
          )}
        </div>
      ),
    },
    {
      key: 'origin',
      header: 'Origin',
      render: (row) => <OriginBadge origin={row.origin} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedTaskForVerification(row)}
          className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white transition-colors"
        >
          Verify Evidence
        </button>
      ),
    },
  ];

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-emerald-950 dark:text-emerald-50">
              Supervisor Operations & Evidence Verification
            </h1>
            <OriginBadge origin="REAL" size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ward Scope: <span className="font-bold text-emerald-700">Ward 4 (Jagadamba) & Ward 12 (Gajuwaka)</span> &bull; Anitha R. (Senior Supervisor)
          </p>
        </div>
      </div>

      {/* Ward KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Field Crews"
          value="14 / 15"
          unit="On Shift"
          trend={{ value: 93, label: 'attendance' }}
          origin="REAL"
          icon={Users}
        />
        <KpiCard
          title="Pending Evidence Verifications"
          value={tasks.filter((t) => t.status === 'EVIDENCE_UPLOADED').length.toString()}
          unit="Tasks"
          trend={{ value: -2, label: 'cleared today' }}
          origin="REAL"
          icon={ShieldCheck}
        />
        <KpiCard
          title="Missed Pickup Queue"
          value="1"
          unit="Requires Action"
          trend={{ value: 0, label: 'within SLA' }}
          origin="SIMULATED"
          icon={AlertTriangle}
        />
        <KpiCard
          title="Ward Cleanliness Index"
          value="88%"
          unit="Ward 4"
          trend={{ value: 4.2, label: 'above target' }}
          origin="PREDICTED"
          confidence={0.93}
          icon={CheckCircle2}
        />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'verification', label: 'Field Evidence Verification', badge: tasks.filter((t) => t.status === 'EVIDENCE_UPLOADED').length, icon: ShieldCheck },
          { id: 'fleet', label: 'Ward GIS Live Fleet Map', icon: Map },
          { id: 'missed', label: 'Missed Pickup Queue', badge: 1, icon: AlertTriangle },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {/* Tab 1: Evidence Verification Matrix (Section: #verify) */}
      <div id="verify" className="scroll-mt-6">
        {activeTab === 'verification' && (
          <div className="space-y-4">
            <DataTable
              columns={columns}
              data={tasks}
              searchPlaceholder="Search by worker name, task ID, or location..."
              onExportCsv={() => alert('Exporting Supervisor Verification Report (CSV)...')}
            />
          </div>
        )}
      </div>

      {/* Tab 2: GIS Live Fleet Map (Section: #fleet) */}
      <div id="fleet" className="scroll-mt-6">
        {activeTab === 'fleet' && (
          <div className="space-y-3">
            <LeafletGisMap height="h-[580px]" />
          </div>
        )}
      </div>

      {/* Tab 3: Missed Pickup Queue (Section: #missed) */}
      <div id="missed" className="scroll-mt-6">
        {activeTab === 'missed' && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-6 space-y-4 green-shadow-sm">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span>Missed Pickup Alert #MP-104 &bull; MVP Colony Route</span>
              </h3>
              <SlaBadge status="AT_RISK" remainingText="28 mins left" />
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p>
                <span className="font-bold">Vehicle V-08 (Driver Srinivas M.)</span> reported a missed pickup at Stop #14 due to:
              </p>
              <div className="p-3 rounded-xl border border-amber-200 bg-white space-y-1 font-mono text-[11px]">
                <p><span className="font-bold text-amber-800">Reason:</span> Road or Lane Blocked by Obstruction (Double-parked trucks)</p>
                <p><span className="font-bold text-amber-800">Notes:</span> Commercial delivery truck blocking narrow alley entrance.</p>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">
                Recommended Action: Reassign Stop #14 to nearest idle vehicle V-03 (0.8 km away).
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => alert('Reassigning Stop #14 to Vehicle V-03... Reassignment logged to audit trail.')}
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-amber-700 shadow-md"
              >
                Approve Reassignment to Vehicle V-03
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Evidence Verification Side Modal Drawer */}
      {selectedTaskForVerification && (
        <Modal
          isOpen={!!selectedTaskForVerification}
          onClose={() => setSelectedTaskForVerification(null)}
          title={`Supervisor Verification — ${selectedTaskForVerification.taskId}`}
          description={`Worker: ${selectedTaskForVerification.workerName} | Location: ${selectedTaskForVerification.location}`}
          maxWidth="lg"
        >
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
              <span className="text-xs font-bold text-slate-800">Task Type: {selectedTaskForVerification.type}</span>
              <LifecycleBadge status={selectedTaskForVerification.status} />
            </div>

            {/* AI Evaluator Inspection Card */}
            <AiPhotoEvaluator
              beforePhotoUrl={selectedTaskForVerification.evidenceBeforeUrl}
              afterPhotoUrl={selectedTaskForVerification.evidenceAfterUrl}
              role="WORKER"
            />

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">EXIF SHA-256 Integrity Hash:</span>
                <span className="font-bold text-emerald-700 truncate max-w-xs">{selectedTaskForVerification.evidenceHash}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recorded Quantity Loaded:</span>
                <span className="font-bold text-slate-900">{selectedTaskForVerification.recordedWeightKg || 450} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Supervisor Scope Check:</span>
                <span className="font-bold text-emerald-700">Scope Verified (Ward 4 / Ward 12)</span>
              </div>
            </div>

            {/* Verification Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleRejectEvidence(selectedTaskForVerification.taskId)}
                className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition-colors"
              >
                Reject Evidence & Return
              </button>
              <button
                type="button"
                onClick={() => handleApproveEvidence(selectedTaskForVerification.taskId)}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 transition-colors"
              >
                Approve & Mark Resolved
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}

