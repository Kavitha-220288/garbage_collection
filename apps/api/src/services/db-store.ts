import {
  CitizenReport,
  Incident,
  AuditLogEntry,
  IncidentFeedback,
  CreateReportInput,
  WasteCategoryLabels,
  LifecycleStatus,
} from '@smartwaste360/contracts';
import { findMatchingIncident, DEFAULT_CLUSTERING_CONFIG, ClusteringConfig } from './clustering-engine';
import { calculatePriorityScore } from './priority-engine';
import { transitionLifecycleStatus } from './lifecycle-state-machine';

class DatabaseStore {
  private reports: CitizenReport[] = [];
  private incidents: Incident[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private feedbacks: IncidentFeedback[] = [];

  public clusteringConfig: ClusteringConfig = { ...DEFAULT_CLUSTERING_CONFIG };

  constructor() {
    this.seedDemoData();
  }

  private seedDemoData() {
    const now = new Date();

    // Demo Incident 1
    const inc1: Incident = {
      id: 'INC-2026-089',
      title: 'Overflowing Bin at Jagadamba Center',
      category: 'OVERFLOWING_BIN',
      categoryLabel: WasteCategoryLabels['OVERFLOWING_BIN'].name,
      latitude: 17.7121,
      longitude: 83.3012,
      address: 'Jagadamba Center (Main Market), Ward 4',
      wardName: 'Ward 4 (Jagadamba)',
      reportsCount: 3,
      confidence: 0.95,
      priority: 'CRITICAL',
      priorityScore: 82,
      priorityFactors: [
        { factor: 'Waste Accumulation Severity', weight: 0.3, contribution: 30, explanation: 'Overflowing public bin' },
        { factor: 'Report Density', weight: 0.3, contribution: 30, explanation: '3 citizen reports linked' },
        { factor: 'Location Sensitivity', weight: 0.15, contribution: 15, explanation: 'High-density commercial market' },
      ],
      status: 'ASSIGNED',
      slaStatus: 'AT_RISK',
      slaTargetHours: 4,
      slaDueAt: new Date(now.getTime() + 45 * 60 * 1000).toISOString(),
      assignedCrewCode: 'CREW-W4-A',
      assignedVehicleId: 'Vehicle V-12',
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      origin: 'REAL',
    };

    // Demo Incident 2
    const inc2: Incident = {
      id: 'INC-2026-090',
      title: 'Illegal Dumping on Gajuwaka High School Rd',
      category: 'ILLEGAL_DUMPING',
      categoryLabel: WasteCategoryLabels['ILLEGAL_DUMPING'].name,
      latitude: 17.6892,
      longitude: 83.2145,
      address: 'Gajuwaka High School Rd, Ward 12',
      wardName: 'Ward 12 (Gajuwaka)',
      reportsCount: 1,
      confidence: 0.85,
      priority: 'HIGH',
      priorityScore: 65,
      priorityFactors: [
        { factor: 'Waste Severity', weight: 0.3, contribution: 30, explanation: 'Illegal debris dumping' },
        { factor: 'Report Density', weight: 0.3, contribution: 10, explanation: '1 citizen report' },
      ],
      status: 'EN_ROUTE',
      slaStatus: 'RUNNING',
      slaTargetHours: 8,
      slaDueAt: new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString(),
      assignedCrewCode: 'CREW-W12-B',
      assignedVehicleId: 'Vehicle V-08',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      origin: 'SIMULATED',
    };

    this.incidents.push(inc1, inc2);

    // Initial audit events
    this.recordAuditLog('INC-2026-089', 'Lakshmi K.', 'Citizen', undefined, 'SUBMITTED', 'INITIAL_REPORT', 'Report submitted by citizen');
    this.recordAuditLog('INC-2026-089', 'System Engine', 'System', 'SUBMITTED', 'VERIFIED', 'AUTO_VERIFY', 'Spatial-temporal verification passed');
    this.recordAuditLog('INC-2026-089', 'Anitha R.', 'Supervisor', 'VERIFIED', 'ASSIGNED', 'ASSIGN_CREW', 'Assigned to Crew CREW-W4-A (Vehicle V-12)');
  }

  // Record Audit Log Entry
  public recordAuditLog(
    incidentId: string,
    actor: string,
    actorRole: string,
    previousStatus: LifecycleStatus | undefined,
    newStatus: LifecycleStatus,
    action: string,
    details: string
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      incidentId,
      actor,
      actorRole,
      previousStatus,
      newStatus,
      action,
      details,
      origin: 'REAL',
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  // Create Citizen Report with Incident Clustering
  public createReport(input: CreateReportInput): { report: CitizenReport; incident: Incident; isDuplicate: boolean } {
    const now = new Date();
    const submittedAtIso = now.toISOString();

    // Check spatial-temporal duplicate clustering match
    const match = findMatchingIncident(
      input.latitude,
      input.longitude,
      submittedAtIso,
      this.incidents,
      this.clusteringConfig
    );

    let incident: Incident;
    let isDuplicate = false;

    if (match) {
      // DUPLICATE DETECTED: Link to existing incident
      isDuplicate = true;
      incident = match.incident;
      incident.reportsCount += 1;
      incident.confidence = Math.min(0.99, incident.confidence + 0.05);

      // Recalculate priority with increased report count
      const updatedPriority = calculatePriorityScore(
        incident.category,
        incident.reportsCount,
        incident.wardName
      );
      incident.priority = updatedPriority.priority;
      incident.priorityScore = updatedPriority.score;
      incident.priorityFactors = updatedPriority.factors;
      incident.updatedAt = submittedAtIso;

      this.recordAuditLog(
        incident.id,
        input.citizenName,
        'Citizen',
        incident.status,
        incident.status,
        'LINKED_DUPLICATE_REPORT',
        `Duplicate report linked (${match.distanceMeters}m distance, ${match.timeDiffMinutes}m time window). Linked count: ${incident.reportsCount}`
      );
    } else {
      // NEW INCIDENT CREATION
      const incCount = this.incidents.length + 89;
      const incidentId = `INC-2026-${String(incCount).padStart(3, '0')}`;
      const categoryMeta = WasteCategoryLabels[input.category];
      const priorityResult = calculatePriorityScore(input.category, 1, input.wardName);
      const slaDueAt = new Date(now.getTime() + categoryMeta.defaultSlaHours * 60 * 60 * 1000).toISOString();

      incident = {
        id: incidentId,
        title: `${categoryMeta.name} at ${input.address.split(',')[0]}`,
        category: input.category,
        categoryLabel: categoryMeta.name,
        latitude: input.latitude,
        longitude: input.longitude,
        address: input.address,
        wardName: input.wardName,
        reportsCount: 1,
        confidence: 0.85,
        priority: priorityResult.priority,
        priorityScore: priorityResult.score,
        priorityFactors: priorityResult.factors,
        status: 'SUBMITTED',
        slaStatus: 'RUNNING',
        slaTargetHours: categoryMeta.defaultSlaHours,
        slaDueAt,
        createdAt: submittedAtIso,
        updatedAt: submittedAtIso,
        origin: 'REAL',
      };

      this.incidents.unshift(incident);

      this.recordAuditLog(
        incident.id,
        input.citizenName,
        'Citizen',
        undefined,
        'SUBMITTED',
        'CREATE_INCIDENT',
        `New incident created for ${categoryMeta.name} in ${input.wardName}`
      );
    }

    // Create Report Record
    const repCount = this.reports.length + 101;
    const reportId = `REP-2026-${String(repCount).padStart(4, '0')}`;

    const report: CitizenReport = {
      id: reportId,
      incidentId: incident.id,
      category: input.category,
      categoryLabel: WasteCategoryLabels[input.category].name,
      latitude: input.latitude,
      longitude: input.longitude,
      address: input.address,
      wardName: input.wardName,
      landmark: input.landmark,
      description: input.description,
      photoUrl: input.photoUrl || '/assets/demo-waste-photo.jpg',
      photoHash: input.photoHash || `sha256:${Math.random().toString(36).substring(2, 15)}`,
      submittedAt: submittedAtIso,
      citizenName: input.citizenName,
      isDuplicate,
      origin: 'REAL',
    };

    this.reports.unshift(report);

    return { report, incident, isDuplicate };
  }

  // Transition Incident Lifecycle Status
  public transitionIncidentStatus(
    incidentId: string,
    targetStatus: LifecycleStatus,
    actor: string,
    actorRole: string,
    details?: string
  ): Incident {
    const incident = this.incidents.find((i) => i.id === incidentId);
    if (!incident) throw new Error(`Incident '${incidentId}' not found`);

    const previousStatus = incident.status;
    const newStatus = transitionLifecycleStatus(previousStatus, targetStatus);

    incident.status = newStatus;
    incident.updatedAt = new Date().toISOString();
    if (newStatus === 'RESOLVED') {
      incident.resolvedAt = new Date().toISOString();
      incident.slaStatus = 'MET';
    }

    this.recordAuditLog(
      incident.id,
      actor,
      actorRole,
      previousStatus,
      newStatus,
      'STATUS_TRANSITION',
      details || `Transitioned status from ${previousStatus} to ${newStatus}`
    );

    return incident;
  }

  // Submit Feedback & Rating
  public submitFeedback(incidentId: string, rating: number, comment?: string): IncidentFeedback {
    const incident = this.incidents.find((i) => i.id === incidentId);
    if (!incident) throw new Error(`Incident '${incidentId}' not found`);

    let reopenedIncident = false;
    if (rating <= 2 && incident.status === 'RESOLVED') {
      // Reopen incident automatically if citizen rating is <= 2
      this.transitionIncidentStatus(
        incidentId,
        'REOPENED',
        'Citizen (Low Rating Trigger)',
        'Citizen',
        `Reopened due to low satisfaction rating (${rating}/5). Comment: "${comment || 'No comment'}"`
      );
      reopenedIncident = true;
    }

    const feedback: IncidentFeedback = {
      id: `FB-${Date.now()}`,
      incidentId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      reopenedIncident,
    };

    this.feedbacks.unshift(feedback);
    return feedback;
  }

  // Getters
  public getIncidents(): Incident[] {
    return this.incidents;
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.find((i) => i.id === id);
  }

  public getReportById(id: string): CitizenReport | undefined {
    return this.reports.find((r) => r.id === id || r.incidentId === id);
  }

  public getAuditLogsForIncident(incidentId: string): AuditLogEntry[] {
    return this.auditLogs.filter((a) => a.incidentId === incidentId);
  }
}

export const dbStore = new DatabaseStore();
