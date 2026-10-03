import { z } from 'zod';

// Data Origin Provenance
export const DataOriginSchema = z.enum(['REAL', 'SIMULATED', 'PREDICTED']);
export type DataOrigin = z.infer<typeof DataOriginSchema>;

// 13 Mandatory PRD Waste Categories
export const WasteCategorySchema = z.enum([
  'OVERFLOWING_BIN',
  'ILLEGAL_DUMPING',
  'MISSED_PICKUP',
  'HAZARDOUS_EWASTE',
  'CONSTRUCTION_DEBRIS',
  'GREEN_GARDEN',
  'DEAD_ANIMAL',
  'COMMERCIAL_WASTE',
  'DRAINAGE_LITTER',
  'PLASTIC_RECYCLABLES',
  'MEDICAL_WASTE',
  'PUBLIC_PARK',
  'OTHER_HAZARD',
]);
export type WasteCategory = z.infer<typeof WasteCategorySchema>;

export const WasteCategoryLabels: Record<WasteCategory, { name: string; description: string; defaultSlaHours: number; isHazardous: boolean }> = {
  OVERFLOWING_BIN: { name: 'Overflowing Bin', description: 'Public or residential bin exceeding 90% fill capacity', defaultSlaHours: 4, isHazardous: false },
  ILLEGAL_DUMPING: { name: 'Illegal Dumping', description: 'Unauthorized waste dumping on streets or vacant plots', defaultSlaHours: 8, isHazardous: false },
  MISSED_PICKUP: { name: 'Missed Household Pickup', description: 'Scheduled door-to-door waste collection missed', defaultSlaHours: 12, isHazardous: false },
  HAZARDOUS_EWASTE: { name: 'Hazardous / Electronic Waste', description: 'Batteries, chemicals, electronic waste, or toxic items', defaultSlaHours: 2, isHazardous: true },
  CONSTRUCTION_DEBRIS: { name: 'Construction & Demolition Debris', description: 'Concrete, bricks, plaster, or masonry rubble', defaultSlaHours: 24, isHazardous: false },
  GREEN_GARDEN: { name: 'Green / Garden Waste', description: 'Tree trimmings, leaves, branches, or organic yard waste', defaultSlaHours: 12, isHazardous: false },
  DEAD_ANIMAL: { name: 'Dead Animal Removal', description: 'Deceased animal requiring bio-safe clearance', defaultSlaHours: 4, isHazardous: true },
  COMMERCIAL_WASTE: { name: 'Commercial Waste Accumulation', description: 'Market, restaurant, or commercial establishment waste', defaultSlaHours: 6, isHazardous: false },
  DRAINAGE_LITTER: { name: 'Drainage & Litter Accumulation', description: 'Blocked storm drains, gutters, or litter accumulation', defaultSlaHours: 8, isHazardous: false },
  PLASTIC_RECYCLABLES: { name: 'Plastic & Dry Recyclables', description: 'High-volume recyclable packaging, cardboard, or plastic', defaultSlaHours: 12, isHazardous: false },
  MEDICAL_WASTE: { name: 'Medical / Bio-Hazardous Waste', description: 'Syringes, clinical waste, or bio-hazardous materials', defaultSlaHours: 2, isHazardous: true },
  PUBLIC_PARK: { name: 'Public Park / Beach Litter', description: 'Accumulated garbage in public recreation areas or beaches', defaultSlaHours: 6, isHazardous: false },
  OTHER_HAZARD: { name: 'Other Environmental Hazard', description: 'Uncategorized sanitation or environmental hazard', defaultSlaHours: 8, isHazardous: false },
};

// Lifecycle State Machine
export const LifecycleStatusSchema = z.enum([
  'SUBMITTED',
  'VERIFIED',
  'ASSIGNED',
  'ACCEPTED',
  'EN_ROUTE',
  'WORK_STARTED',
  'EVIDENCE_UPLOADED',
  'SUPERVISOR_VERIFIED',
  'RESOLVED',
  'REOPENED',
]);
export type LifecycleStatus = z.infer<typeof LifecycleStatusSchema>;

// Valid State Transitions Map
export const VALID_TRANSITIONS: Record<LifecycleStatus, LifecycleStatus[]> = {
  SUBMITTED: ['VERIFIED'],
  VERIFIED: ['ASSIGNED'],
  ASSIGNED: ['ACCEPTED', 'EN_ROUTE'],
  ACCEPTED: ['EN_ROUTE'],
  EN_ROUTE: ['WORK_STARTED'],
  WORK_STARTED: ['EVIDENCE_UPLOADED'],
  EVIDENCE_UPLOADED: ['SUPERVISOR_VERIFIED'],
  SUPERVISOR_VERIFIED: ['RESOLVED'],
  RESOLVED: ['REOPENED'],
  REOPENED: ['ASSIGNED'],
};

// Priority Level
export const PriorityLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export type PriorityLevel = z.infer<typeof PriorityLevelSchema>;

// Predefined Missed Pickup Reasons
export const MissedPickupReasonSchema = z.enum([
  'ROAD_BLOCKED',
  'VEHICLE_PROBLEM',
  'WASTE_UNAVAILABLE',
  'UNSAFE_LOCATION',
  'ACCESS_PROBLEM',
  'OTHER',
]);
export type MissedPickupReason = z.infer<typeof MissedPickupReasonSchema>;

export const MissedPickupReasonLabels: Record<MissedPickupReason, string> = {
  ROAD_BLOCKED: 'Road or Lane Blocked by Obstruction',
  VEHICLE_PROBLEM: 'Vehicle Mechanical Breakdown / Issue',
  WASTE_UNAVAILABLE: 'Bin or Waste Not Available at Location',
  UNSAFE_LOCATION: 'Unsafe Field Location or Hazardous Condition',
  ACCESS_PROBLEM: 'Gated Access or Key/Gate Problem',
  OTHER: 'Other Field Issue',
};

// Worker Task Structure
export interface WorkerTask {
  id: string;
  taskId: string; // TSK-XXXX
  incidentId?: string;
  shiftId: string;
  workerName: string;
  vehicleId: string;
  locationName: string;
  wardName: string;
  latitude: number;
  longitude: number;
  priority: PriorityLevel;
  type: string;
  category: WasteCategory;
  status: LifecycleStatus;
  evidenceBeforeUrl?: string;
  evidenceAfterUrl?: string;
  evidenceHash?: string;
  recordedWeightKg?: number;
  segregationQuality?: 'HIGH' | 'MODERATE' | 'CONTAMINATED';
  missedReason?: MissedPickupReason;
  missedNotes?: string;
  timestamp?: string;
  origin: DataOrigin;
}

// Client Idempotent Offline Operation Schema
export const SyncOpStatusSchema = z.enum(['ONLINE', 'OFFLINE', 'SYNCING', 'SYNCED', 'SYNC_ERROR']);
export type SyncOpStatus = z.infer<typeof SyncOpStatusSchema>;

export interface OfflineSyncOp {
  client_op_id: string; // UUIDv7
  created_at: string;
  device_info: string;
  operation_type: 'COMPLETE_TASK' | 'MARK_MISSED' | 'UPLOAD_EVIDENCE' | 'UPDATE_LOCATION';
  payload: any;
  sync_status: SyncOpStatus;
  retry_count: number;
  error_message?: string;
}

// Telemetry Gateway Data Format
export interface VehicleTelemetry {
  asset_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  load_percent: number;
  status: 'AVAILABLE' | 'EN_ROUTE' | 'COLLECTING' | 'DELAYED' | 'FULL' | 'OFFLINE';
  source: 'SIMULATED' | 'REAL_GPS' | 'SENSOR';
}

// Explainable WIE Intelligence Provenance Envelope
export interface WieProvenanceEnvelope<T> {
  origin: DataOrigin;
  model_version: string;
  confidence: number;
  generated_at: string;
  supporting_metrics: Record<string, any>;
  recommended_action: string;
  data: T;
}

// Explainable Priority Breakdown
export interface PriorityScoreResult {
  score: number; // 0 to 100
  priority: PriorityLevel;
  factors: {
    factor: string;
    weight: number;
    contribution: number;
    explanation: string;
  }[];
  generatedAt: string;
}

// SLA Status
export const SlaStatusSchema = z.enum(['MET', 'AT_RISK', 'BREACHED', 'RUNNING']);
export type SlaStatus = z.infer<typeof SlaStatusSchema>;

// Citizen Report Input Schema
export const CreateReportInputSchema = z.object({
  category: WasteCategorySchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(3, 'Address location is required'),
  wardName: z.string().default('Ward 4 (Jagadamba)'),
  landmark: z.string().optional(),
  description: z.string().min(5, 'Please provide a brief description'),
  photoUrl: z.string().optional(),
  photoHash: z.string().optional(),
  citizenName: z.string().default('Citizen User'),
  citizenPhone: z.string().optional(),
});
export type CreateReportInput = z.infer<typeof CreateReportInputSchema>;

// Citizen Report Record
export interface CitizenReport {
  id: string; // REP-2026-XXXX
  incidentId: string; // INC-2026-XXXX
  category: WasteCategory;
  categoryLabel: string;
  latitude: number;
  longitude: number;
  address: string;
  wardName: string;
  landmark?: string;
  description: string;
  photoUrl?: string;
  photoHash?: string;
  submittedAt: string;
  citizenName: string;
  isDuplicate: boolean;
  origin: DataOrigin;
}

// Clustered Incident Record
export interface Incident {
  id: string; // INC-2026-XXXX
  title: string;
  category: WasteCategory;
  categoryLabel: string;
  latitude: number;
  longitude: number;
  address: string;
  wardName: string;
  reportsCount: number;
  confidence: number;
  priority: PriorityLevel;
  priorityScore: number;
  priorityFactors: PriorityScoreResult['factors'];
  status: LifecycleStatus;
  slaStatus: SlaStatus;
  slaTargetHours: number;
  slaDueAt: string;
  assignedCrewCode?: string;
  assignedVehicleId?: string;
  evidenceBeforeUrl?: string;
  evidenceAfterUrl?: string;
  evidenceHash?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  origin: DataOrigin;
}

// Audit Log Entry
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  incidentId: string;
  actor: string;
  actorRole: string;
  previousStatus?: LifecycleStatus;
  newStatus: LifecycleStatus;
  action: string;
  details: string;
  origin: DataOrigin;
}

// Feedback Schema
export const SubmitFeedbackInputSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});
export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackInputSchema>;

export interface IncidentFeedback {
  id: string;
  incidentId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reopenedIncident: boolean;
}
