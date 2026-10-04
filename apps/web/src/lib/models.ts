import mongoose, { Schema, Document } from 'mongoose';

// --- Report Schema ---
export interface IReport extends Document {
  id: string;
  incidentId: string;
  category: string;
  categoryLabel: string;
  latitude: number;
  longitude: number;
  address: string;
  wardName: string;
  landmark?: string;
  description?: string;
  photoUrl: string;
  photoHash?: string;
  submittedAt: string;
  citizenName?: string;
  isDuplicate: boolean;
  origin: string;
}

const ReportSchema = new Schema<IReport>(
  {
    id: { type: String, required: true, unique: true },
    incidentId: { type: String, required: true },
    category: { type: String, required: true },
    categoryLabel: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true },
    wardName: { type: String, required: true },
    landmark: { type: String },
    description: { type: String },
    photoUrl: { type: String, required: true },
    photoHash: { type: String },
    submittedAt: { type: String, required: true },
    citizenName: { type: String },
    isDuplicate: { type: Boolean, default: false },
    origin: { type: String, default: 'REAL' },
  },
  { timestamps: true }
);

// --- Incident Schema ---
export interface IIncident extends Document {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  latitude: number;
  longitude: number;
  address: string;
  wardName: string;
  reportsCount: number;
  confidence: number;
  priority: string;
  priorityScore: number;
  priorityFactors: Array<{
    factor: string;
    weight: number;
    contribution: number;
    explanation: string;
  }>;
  status: string;
  slaStatus: string;
  slaTargetHours: number;
  slaDueAt: string;
  assignedCrewCode?: string;
  assignedVehicleId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  origin: string;
}

const IncidentSchema = new Schema<IIncident>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    categoryLabel: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true },
    wardName: { type: String, required: true },
    reportsCount: { type: Number, default: 1 },
    confidence: { type: Number, default: 0.85 },
    priority: { type: String, required: true },
    priorityScore: { type: Number, required: true },
    priorityFactors: [
      {
        factor: String,
        weight: Number,
        contribution: Number,
        explanation: String,
      },
    ],
    status: { type: String, default: 'SUBMITTED' },
    slaStatus: { type: String, default: 'RUNNING' },
    slaTargetHours: { type: Number, default: 4 },
    slaDueAt: { type: String },
    assignedCrewCode: { type: String },
    assignedVehicleId: { type: String },
    createdAt: { type: String },
    updatedAt: { type: String },
    resolvedAt: { type: String },
    origin: { type: String, default: 'REAL' },
  },
  { timestamps: true }
);

// --- Audit Log Schema ---
export interface IAuditLog extends Document {
  id: string;
  timestamp: string;
  incidentId: string;
  actor: string;
  actorRole: string;
  previousStatus?: string;
  newStatus: string;
  action: string;
  details: string;
  origin: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    id: { type: String, required: true, unique: true },
    timestamp: { type: String, required: true },
    incidentId: { type: String, required: true },
    actor: { type: String, required: true },
    actorRole: { type: String, required: true },
    previousStatus: { type: String },
    newStatus: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String, required: true },
    origin: { type: String, default: 'REAL' },
  },
  { timestamps: true }
);

// --- Feedback Schema ---
export interface IFeedback extends Document {
  id: string;
  incidentId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reopenedIncident: boolean;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    id: { type: String, required: true, unique: true },
    incidentId: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
    createdAt: { type: String, required: true },
    reopenedIncident: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// --- User Schema ---
export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'CITIZEN' | 'OFFICER' | 'WORKER' | 'SUPERVISOR' | 'ADMIN';
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'CITIZEN' },
    phone: { type: String },
    avatarUrl: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const ReportModel = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
export const IncidentModel = mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export const FeedbackModel = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);
export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

