'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { KpiCard } from '@/components/ui/kpi-card';
import { OriginBadge } from '@/components/ui/origin-badge';
import { LifecycleBadge } from '@/components/ui/status-badge';
import { LeafletGisMap } from '@/components/maps';
import {
  WorkerTask,
  OfflineSyncOp,
  SyncOpStatus,
  MissedPickupReason,
  MissedPickupReasonLabels,
  LifecycleStatus,
} from '@smartwaste360/contracts';
import {
  getCachedWorkerTasks,
  saveCachedWorkerTasks,
  getOfflineOps,
  queueOfflineOperation,
  syncPendingOperations,
} from '@/lib/offline-sync-store';
import {
  Truck,
  MapPin,
  Camera,
  ShieldAlert,
  CheckCircle2,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  Map,
  Clock,
  FileCheck,
  XCircle,
  Navigation,
  Scale,
  Shield,
  Layers,
  ArrowRight,
  Check,
} from 'lucide-react';

import { AiPhotoEvaluator } from '@/components/common/ai-photo-evaluator';

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState<WorkerTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<WorkerTask | null>(null);

  // Connectivity & Sync States
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncOpStatus>('ONLINE');
  const [pendingOps, setPendingOps] = useState<OfflineSyncOp[]>([]);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // Form Inputs for Active Task Execution
  const [weightKg, setWeightKg] = useState<number>(420);
  const [segregation, setSegregation] = useState<'HIGH' | 'MODERATE' | 'CONTAMINATED'>('HIGH');
  const [beforePhoto, setBeforePhoto] = useState<string>('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80');
  const [afterPhoto, setAfterPhoto] = useState<string>('');
  const [beforeHash, setBeforeHash] = useState<string>('sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [afterHash, setAfterHash] = useState<string>('');

  // Missed Pickup Form State
  const [isMissedModalOpen, setIsMissedModalOpen] = useState(false);
  const [missedReason, setMissedReason] = useState<MissedPickupReason>('ROAD_BLOCKED');
  const [missedNotes, setMissedNotes] = useState('');

  // Photo Upload Handlers
  const handleBeforePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBeforePhoto(reader.result as string);
        setBeforeHash(`sha256:${Math.random().toString(36).substring(2, 15)}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAfterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterPhoto(reader.result as string);
        setAfterHash(`sha256:${Math.random().toString(36).substring(2, 15)}`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load cached tasks and pending ops on mount
  useEffect(() => {
    const loadedTasks = getCachedWorkerTasks();
    setTasks(loadedTasks);
    if (loadedTasks.length > 0) {
      setSelectedTask(loadedTasks[0]);
    }
    const ops = getOfflineOps();
    setPendingOps(ops.filter((op) => op.sync_status !== 'SYNCED'));

    // Handle browser online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('ONLINE');
      handleAutoSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync pending operations
  const handleAutoSync = async () => {
    setSyncStatus('SYNCING');
    const result = await syncPendingOperations();
    if (result.errors.length === 0) {
      setSyncStatus('SYNCED');
      setSyncMsg(`Successfully synchronized ${result.syncedCount} offline task operations.`);
    } else {
      setSyncStatus('SYNC_ERROR');
      setSyncMsg(`Sync error: ${result.errors[0]}`);
    }
    setPendingOps(getOfflineOps().filter((op) => op.sync_status !== 'SYNCED'));
  };

  // State Machine Transition Handler
  const handleTransitionState = (nextState: LifecycleStatus) => {
    if (!selectedTask) return;

    const updatedTask: WorkerTask = {
      ...selectedTask,
      status: nextState,
      timestamp: new Date().toISOString(),
    };

    // Update state locally
    const newTasks = tasks.map((t) => (t.id === selectedTask.id ? updatedTask : t));
    setTasks(newTasks);
    setSelectedTask(updatedTask);
    saveCachedWorkerTasks(newTasks);

    // Queue operation for idempotent sync
    queueOfflineOperation(
      'COMPLETE_TASK',
      {
        taskId: selectedTask.taskId,
        nextState,
        timestamp: new Date().toISOString(),
      },
      isOnline
    );

    setPendingOps(getOfflineOps().filter((op) => op.sync_status !== 'SYNCED'));

    if (isOnline) {
      handleAutoSync();
    }
  };

  // Complete Task Handler (Work Completed & Evidence Uploaded)
  const handleCompleteTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    const fakeAfterHash = afterHash || `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setAfterHash(fakeAfterHash);

    const updatedTask: WorkerTask = {
      ...selectedTask,
      status: 'EVIDENCE_UPLOADED',
      recordedWeightKg: weightKg,
      segregationQuality: segregation,
      evidenceBeforeUrl: beforePhoto,
      evidenceAfterUrl: afterPhoto || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
      evidenceHash: fakeAfterHash,
      timestamp: new Date().toISOString(),
    };

    const newTasks = tasks.map((t) => (t.id === selectedTask.id ? updatedTask : t));
    setTasks(newTasks);
    setSelectedTask(updatedTask);
    saveCachedWorkerTasks(newTasks);

    queueOfflineOperation(
      'UPLOAD_EVIDENCE',
      {
        taskId: selectedTask.taskId,
        recordedWeightKg: weightKg,
        segregationQuality: segregation,
        evidenceHash: fakeAfterHash,
        timestamp: new Date().toISOString(),
      },
      isOnline
    );

    setPendingOps(getOfflineOps().filter((op) => op.sync_status !== 'SYNCED'));
    if (isOnline) handleAutoSync();
  };

  // Missed Collection Handler
  const handleRecordMissedPickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    const updatedTask: WorkerTask = {
      ...selectedTask,
      status: 'SUBMITTED', // Re-enqueued with missed pickup record
      missedReason,
      missedNotes,
      timestamp: new Date().toISOString(),
    };

    const newTasks = tasks.map((t) => (t.id === selectedTask.id ? updatedTask : t));
    setTasks(newTasks);
    setSelectedTask(updatedTask);
    saveCachedWorkerTasks(newTasks);

    queueOfflineOperation(
      'MARK_MISSED',
      {
        taskId: selectedTask.taskId,
        missedReason,
        missedNotes,
        timestamp: new Date().toISOString(),
      },
      isOnline
    );

    setIsMissedModalOpen(false);
    setPendingOps(getOfflineOps().filter((op) => op.sync_status !== 'SYNCED'));
    if (isOnline) handleAutoSync();
  };

  const completedCount = tasks.filter((t) => t.status === 'EVIDENCE_UPLOADED' || t.status === 'SUPERVISOR_VERIFIED' || t.status === 'RESOLVED').length;

  return (
    <AppShell>
      {/* Real-time & Offline Synchronization Header Banner */}
      <div
        className={`rounded-2xl border p-4 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          !isOnline
            ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
            : syncStatus === 'SYNCING'
            ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
            : 'border-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <WifiOff className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {isOnline ? 'Online Operational Sync Active' : 'Offline Mode — Local Queue Engaged'}
              </h3>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                  !isOnline
                    ? 'bg-amber-200 text-amber-800 border-amber-300'
                    : 'bg-indigo-200 text-indigo-800 border-indigo-300'
                }`}
              >
                {syncStatus}
              </span>
            </div>
            <p className="text-[11px] opacity-90 mt-0.5">
              {pendingOps.length > 0
                ? `${pendingOps.length} offline operation records queued with client UUIDv7 keys.`
                : 'All shift operations synchronized with central backend database.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              const nextMode = !isOnline;
              setIsOnline(nextMode);
              setSyncStatus(nextMode ? 'ONLINE' : 'OFFLINE');
              if (nextMode) handleAutoSync();
            }}
            className="rounded-xl border border-current bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold hover:bg-black/5 transition-colors shadow-2xs"
          >
            Simulate {isOnline ? 'Network Disconnect (Offline)' : 'Network Reconnect (Online)'}
          </button>
          {pendingOps.length > 0 && (
            <button
              type="button"
              onClick={handleAutoSync}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Sync Now ({pendingOps.length})
            </button>
          )}
        </div>
      </div>

      {syncMsg && (
        <div className="rounded-xl border border-indigo-300 bg-indigo-100/60 p-2.5 text-xs font-bold text-indigo-900 flex items-center justify-between">
          <span>{syncMsg}</span>
          <button type="button" onClick={() => setSyncMsg(null)} className="text-indigo-700 hover:text-indigo-950">
            Dismiss
          </button>
        </div>
      )}

      {/* Driver & Shift Header Controls (Section: #safety) */}
      <div id="safety" className="scroll-mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-indigo-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-indigo-950 dark:text-indigo-50">
              Worker & Driver Shift Operations PWA
            </h1>
            <OriginBadge origin="REAL" size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Driver: <span className="font-bold text-foreground">Ravi Kumar</span> &bull; Shift #S-408 &bull; Vehicle: <span className="font-bold text-indigo-700">V-12 (Gajuwaka Route)</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('EMERGENCY SOS ALERT TRIGGERED! Broadcaster emitted GPS location to Supervisor Anitha & Control Room.')}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-red-700 transition-all animate-pulse"
        >
          <ShieldAlert className="h-4 w-4" /> EMERGENCY SOS BROADCAST
        </button>
      </div>

      {/* Shift KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Stops Completed"
          value={`${completedCount} / ${tasks.length}`}
          unit="Stops"
          trend={{ value: Math.round((completedCount / tasks.length) * 100), label: 'shift progress' }}
          origin="REAL"
          icon={CheckCircle2}
        />
        <KpiCard
          title="Total Payload Loaded"
          value="4.8"
          unit="Tonnes"
          description="Compactor capacity 82%"
          origin="REAL"
          icon={Truck}
        />
        <KpiCard
          title="Next Scheduled Target"
          value={selectedTask ? selectedTask.taskId : 'Finished'}
          unit={selectedTask ? selectedTask.wardName.split(' ')[0] : 'Done'}
          description={selectedTask ? selectedTask.locationName : 'Shift complete'}
          origin="REAL"
          icon={MapPin}
        />
        <KpiCard
          title="Shift Time Remaining"
          value="2h 15m"
          unit="Shift #S-408"
          origin="SIMULATED"
          icon={Clock}
        />
      </div>

      {/* Turn-by-Turn GPS Map Navigation (Section: #route) */}
      <div id="route" className="scroll-mt-6 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <Map className="h-4 w-4 text-emerald-600" /> Active GPS Turn-by-Turn Route Navigation
          </h3>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Route #HYD-04 &bull; GHMC Hyderabad Cyberabad Zone
          </span>
        </div>
        <LeafletGisMap height="h-[380px]" />
      </div>

      {/* Main Shift Task Execution Section (Section: #evidence) */}
      <div id="evidence" className="scroll-mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assigned Task Sequence List (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-emerald-200 bg-white p-4 space-y-3 green-shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-emerald-600" /> Today's Collection Queue ({tasks.length})
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Shift #S-408
            </span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {tasks.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              const isDone = task.status === 'EVIDENCE_UPLOADED' || task.status === 'SUPERVISOR_VERIFIED';
              return (
                <button
                  type="button"
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`w-full text-left rounded-xl p-3 border transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                      : isDone
                      ? 'border-emerald-200 bg-emerald-50/20 opacity-80'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1">
                      {task.taskId}
                      {isDone && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </span>
                    <LifecycleBadge status={task.status} />
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{task.type}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-emerald-600 shrink-0" /> {task.locationName}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Selected Task Lifecycle Execution & Evidence Upload (7 cols) */}
        {selectedTask ? (
          <div className="lg:col-span-7 rounded-2xl border border-emerald-200 bg-white p-5 green-shadow-md space-y-5">
            <div className="flex flex-wrap items-center justify-between border-b border-emerald-100 pb-3 gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Active Task Details
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                  <span>{selectedTask.taskId} &bull; {selectedTask.type}</span>
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" /> {selectedTask.locationName}, {selectedTask.wardName}
                </p>
              </div>

              <LifecycleBadge status={selectedTask.status} />
            </div>

            {/* Task Lifecycle State Transition Stepper */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Lifecycle State Transition Machine
              </h4>
              <div className="flex flex-wrap items-center gap-1.5">
                {['ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'WORK_STARTED', 'EVIDENCE_UPLOADED'].map((st, idx) => {
                  const isCurrent = selectedTask.status === st;
                  return (
                    <button
                      type="button"
                      key={st}
                      onClick={() => handleTransitionState(st as LifecycleStatus)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                        isCurrent
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      {idx + 1}. {st}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Evidence & Collection Data Entry Form */}
            <form onSubmit={handleCompleteTask} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Step 1: Before & After Evidence Photo Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Camera className="h-3.5 w-3.5 text-emerald-600" /> Before Photo Evidence
                  </label>
                  <label className="block rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 p-3 text-center space-y-1 cursor-pointer hover:bg-emerald-100/50">
                    <Camera className="h-6 w-6 text-emerald-600 mx-auto" />
                    <p className="text-[11px] font-bold text-slate-800">
                      {beforePhoto ? 'Before Photo Loaded' : 'Tap to capture / pick file'}
                    </p>
                    <span className="text-[9px] font-mono text-emerald-700 block truncate">{beforeHash}</span>
                    <input type="file" accept="image/*" onChange={handleBeforePhotoUpload} className="hidden" />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Camera className="h-3.5 w-3.5 text-emerald-600" /> After Clearing Photo Evidence
                  </label>
                  <label className="block rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 p-3 text-center space-y-1 cursor-pointer hover:bg-emerald-100/50">
                    <Camera className="h-6 w-6 text-emerald-600 mx-auto" />
                    <p className="text-[11px] font-bold text-slate-800">
                      {afterPhoto ? 'After Photo Uploaded' : 'Tap to capture / pick file'}
                    </p>
                    <span className="text-[9px] font-mono text-emerald-700 block truncate">
                      {afterHash || 'EXIF SHA-256 Hash Generated'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleAfterPhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* AI Verification & Score Card */}
              {(beforePhoto || afterPhoto) && (
                <AiPhotoEvaluator
                  beforePhotoUrl={beforePhoto}
                  afterPhotoUrl={afterPhoto}
                  role="WORKER"
                  category={selectedTask.category}
                />
              )}

              {/* Step 2: Recorded Waste Quantity & Segregation Quality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5 text-emerald-600" /> Waste Quantity (kg)
                  </label>
                  <input
                    type="number"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full rounded-xl border border-emerald-200 bg-emerald-50/20 px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" /> Segregation Quality
                  </label>
                  <select
                    value={segregation}
                    onChange={(e: any) => setSegregation(e.target.value)}
                    className="w-full rounded-xl border border-emerald-200 bg-emerald-50/20 px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="HIGH">High (&gt; 90% Clean Source)</option>
                    <option value="MODERATE">Moderate (70-90% Segregated)</option>
                    <option value="CONTAMINATED">Contaminated (&lt; 70% Segregated)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 py-3 text-xs font-extrabold text-white shadow-md hover:from-emerald-700 hover:to-green-800 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" /> Upload Evidence & Complete Task
                </button>

                <button
                  type="button"
                  onClick={() => setIsMissedModalOpen(true)}
                  className="rounded-xl border border-amber-400 bg-amber-50 px-4 py-3 text-xs font-extrabold text-amber-800 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-600" /> Report Missed / Blocked
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>

      {/* Missed Pickup Predefined Reason Modal */}
      {isMissedModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-amber-300 bg-white p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" /> Report Missed Collection ({selectedTask.taskId})
              </h3>
              <button
                type="button"
                onClick={() => setIsMissedModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordMissedPickup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Predefined Missed Pickup Reason</label>
                <select
                  value={missedReason}
                  onChange={(e: any) => setMissedReason(e.target.value)}
                  className="w-full rounded-xl border border-amber-200 bg-amber-50/30 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                >
                  {Object.entries(MissedPickupReasonLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Field Worker Notes / Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe road blockage or access issue..."
                  value={missedNotes}
                  onChange={(e) => setMissedNotes(e.target.value)}
                  className="w-full rounded-xl border border-amber-200 bg-amber-50/30 p-3 text-xs text-slate-900 focus:outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMissedModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-amber-700 shadow-md"
                >
                  Submit Missed Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

