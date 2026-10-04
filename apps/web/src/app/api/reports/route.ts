import { NextResponse } from 'next/server';
import { dbStore } from '../../../../../api/src/services/db-store';
import { CreateReportInputSchema } from '@smartwaste360/contracts';
import { connectToDatabase } from '@/lib/mongodb';
import { ReportModel, IncidentModel, AuditLogModel } from '@/lib/models';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CreateReportInputSchema.parse(body);

    const result = dbStore.createReport(validated);

    // Save & Insert into MongoDB if connected
    try {
      await connectToDatabase();
      await ReportModel.create(result.report);
      await IncidentModel.findOneAndUpdate(
        { id: result.incident.id },
        result.incident,
        { upsert: true, new: true }
      );
      
      const logs = dbStore.getAuditLogsForIncident(result.incident.id);
      for (const log of logs) {
        await AuditLogModel.findOneAndUpdate({ id: log.id }, log, { upsert: true });
      }
    } catch (dbErr: any) {
      console.warn('⚠️ MongoDB connection/insert skipped:', dbErr?.message || dbErr);
    }

    return NextResponse.json({
      success: true,
      report: result.report,
      incident: result.incident,
      isDuplicate: result.isDuplicate,
      message: result.isDuplicate
        ? `Your report has been linked to existing Incident #${result.incident.id}. Multiple reports increase dispatch priority.`
        : `New Incident #${result.incident.id} registered. Field team dispatched.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit waste report' },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const dbIncidents = await IncidentModel.find().lean();
    if (dbIncidents && dbIncidents.length > 0) {
      return NextResponse.json({ success: true, count: dbIncidents.length, incidents: dbIncidents });
    }
  } catch (err: any) {
    console.warn('⚠️ MongoDB GET fallback to memory:', err?.message || err);
  }

  const incidents = dbStore.getIncidents();
  return NextResponse.json({ success: true, count: incidents.length, incidents });
}

