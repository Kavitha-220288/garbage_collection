'use client';

import { WorkerTask, OfflineSyncOp, SyncOpStatus, MissedPickupReason } from '@smartwaste360/contracts';

const OFFLINE_OPS_KEY = 'smartwaste360_offline_ops';
const CACHED_TASKS_KEY = 'smartwaste360_cached_tasks';

// Initial Seed Tasks for Worker Shift #S-408 (Visakhapatnam Gajuwaka & MVP Routes)
export const initialWorkerTasks: WorkerTask[] = [
  {
    id: 'wk-1',
    taskId: 'TSK-881',
    incidentId: 'INC-2026-089',
    shiftId: 'S-408',
    workerName: 'Ravi Kumar (Driver)',
    vehicleId: 'Vehicle V-12',
    locationName: 'Gajuwaka Main Market (Bin #B-108)',
    wardName: 'Ward 12 (Gajuwaka)',
    latitude: 17.6892,
    longitude: 83.2145,
    priority: 'CRITICAL',
    type: 'Overflowing Bin Clearing',
    category: 'OVERFLOWING_BIN',
    status: 'WORK_STARTED',
    origin: 'REAL',
  },
  {
    id: 'wk-2',
    taskId: 'TSK-882',
    incidentId: 'INC-2026-090',
    shiftId: 'S-408',
    workerName: 'Ravi Kumar (Driver)',
    vehicleId: 'Vehicle V-12',
    locationName: 'MVP Colony Sector 3 Bus Stop',
    wardName: 'Ward 2 (MVP Colony)',
    latitude: 17.7412,
    longitude: 83.3321,
    priority: 'HIGH',
    type: 'Scheduled Household Pickup',
    category: 'MISSED_PICKUP',
    status: 'EN_ROUTE',
    origin: 'REAL',
  },
  {
    id: 'wk-3',
    taskId: 'TSK-883',
    shiftId: 'S-408',
    workerName: 'Ravi Kumar (Driver)',
    vehicleId: 'Vehicle V-12',
    locationName: 'Jagadamba Junction Commercial Yard',
    wardName: 'Ward 4 (Jagadamba)',
    latitude: 17.7121,
    longitude: 83.3012,
    priority: 'MEDIUM',
    type: 'Plastic Recyclables Batch',
    category: 'PLASTIC_RECYCLABLES',
    status: 'ASSIGNED',
    origin: 'REAL',
  },
  {
    id: 'wk-4',
    taskId: 'TSK-884',
    shiftId: 'S-408',
    workerName: 'Ravi Kumar (Driver)',
    vehicleId: 'Vehicle V-12',
    locationName: 'Fisheries Harbor Gate #2',
    wardName: 'Ward 1 (Beach Road)',
    latitude: 17.7188,
    longitude: 83.3245,
    priority: 'HIGH',
    type: 'Commercial Waste Collection',
    category: 'COMMERCIAL_WASTE',
    status: 'ASSIGNED',
    origin: 'REAL',
  },
  {
    id: 'wk-5',
    taskId: 'TSK-885',
    shiftId: 'S-408',
    workerName: 'Ravi Kumar (Driver)',
    vehicleId: 'Vehicle V-12',
    locationName: 'NAD Junction Market Stop',
    wardName: 'Ward 15 (NAD)',
    latitude: 17.7301,
    longitude: 83.2456,
    priority: 'LOW',
    type: 'Garden Waste Removal',
    category: 'GREEN_GARDEN',
    status: 'ASSIGNED',
    origin: 'SIMULATED',
  },
];

// Utility: UUIDv7 / Timestamp client_op_id generator
export function generateClientOpId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `op_${timestamp}_${random}`;
}

// Retrieve cached tasks from storage
export function getCachedWorkerTasks(): WorkerTask[] {
  if (typeof window === 'undefined') return initialWorkerTasks;
  const stored = localStorage.getItem(CACHED_TASKS_KEY);
  if (!stored) {
    localStorage.setItem(CACHED_TASKS_KEY, JSON.stringify(initialWorkerTasks));
    return initialWorkerTasks;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initialWorkerTasks;
  }
}

// Save cached tasks
export function saveCachedWorkerTasks(tasks: WorkerTask[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CACHED_TASKS_KEY, JSON.stringify(tasks));
}

// Retrieve pending offline sync operations
export function getOfflineOps(): OfflineSyncOp[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(OFFLINE_OPS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Save offline sync operations
export function saveOfflineOps(ops: OfflineSyncOp[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OFFLINE_OPS_KEY, JSON.stringify(ops));
}

// Queue a new operation offline or online
export function queueOfflineOperation(
  type: OfflineSyncOp['operation_type'],
  payload: any,
  isOnline: boolean
): OfflineSyncOp {
  const newOp: OfflineSyncOp = {
    client_op_id: generateClientOpId(),
    created_at: new Date().toISOString(),
    device_info: typeof navigator !== 'undefined' ? navigator.userAgent : 'PWA Client',
    operation_type: type,
    payload,
    sync_status: isOnline ? 'SYNCED' : 'OFFLINE',
    retry_count: 0,
  };

  const ops = getOfflineOps();
  ops.push(newOp);
  saveOfflineOps(ops);

  return newOp;
}

// Synchronize all pending offline ops idempotently with backend
export async function syncPendingOperations(): Promise<{ syncedCount: number; errors: string[] }> {
  const ops = getOfflineOps();
  const pendingOps = ops.filter((op) => op.sync_status === 'OFFLINE' || op.sync_status === 'SYNC_ERROR');

  if (pendingOps.length === 0) {
    return { syncedCount: 0, errors: [] };
  }

  // Mark status as SYNCING
  const updatedOps = ops.map((op) => {
    if (pendingOps.some((p) => p.client_op_id === op.client_op_id)) {
      return { ...op, sync_status: 'SYNCING' as SyncOpStatus };
    }
    return op;
  });
  saveOfflineOps(updatedOps);

  try {
    const res = await fetch('/api/worker/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations: pendingOps }),
    });

    const data = await res.json();

    if (data.success) {
      // Mark as SYNCED
      const finalOps = ops.map((op) => {
        if (pendingOps.some((p) => p.client_op_id === op.client_op_id)) {
          return { ...op, sync_status: 'SYNCED' as SyncOpStatus };
        }
        return op;
      });
      saveOfflineOps(finalOps);
      return { syncedCount: pendingOps.length, errors: [] };
    } else {
      throw new Error(data.error || 'Sync endpoint returned failure');
    }
  } catch (err: any) {
    // Revert status to SYNC_ERROR
    const errorOps = ops.map((op) => {
      if (pendingOps.some((p) => p.client_op_id === op.client_op_id)) {
        return { ...op, sync_status: 'SYNC_ERROR' as SyncOpStatus, error_message: err.message };
      }
      return op;
    });
    saveOfflineOps(errorOps);
    return { syncedCount: 0, errors: [err.message] };
  }
}
