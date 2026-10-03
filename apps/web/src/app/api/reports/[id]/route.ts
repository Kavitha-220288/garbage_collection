import { NextResponse } from 'next/server';
import { dbStore } from '../../../../../../api/src/services/db-store';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = dbStore.getReportById(id);
    const incident = dbStore.getIncidentById(id) || (report ? dbStore.getIncidentById(report.incidentId) : undefined);

    if (!incident) {
      return NextResponse.json(
        { success: false, error: `Complaint record '${id}' not found` },
        { status: 404 }
      );
    }

    const auditLogs = dbStore.getAuditLogsForIncident(incident.id);

    return NextResponse.json({
      success: true,
      report,
      incident,
      auditLogs,
      privacyNote: 'Worker identity shielded. Assigned crew code and vehicle ID displayed only.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch complaint details' },
      { status: 500 }
    );
  }
}
