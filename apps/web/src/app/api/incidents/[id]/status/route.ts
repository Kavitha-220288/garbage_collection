import { NextResponse } from 'next/server';
import { dbStore } from '../../../../../../../api/src/services/db-store';
import { LifecycleStatusSchema } from '@smartwaste360/contracts';
import { connectToDatabase } from '@/lib/mongodb';
import { IncidentModel, AuditLogModel } from '@/lib/models';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const targetStatus = LifecycleStatusSchema.parse(body.targetStatus);
    const actor = body.actor || 'Municipal Officer';
    const actorRole = body.actorRole || 'Officer';
    const details = body.details || `State transition to ${targetStatus}`;

    const incident = dbStore.transitionIncidentStatus(id, targetStatus, actor, actorRole, details);

    // Sync to MongoDB if connected
    try {
      await connectToDatabase();
      await IncidentModel.findOneAndUpdate({ id: incident.id }, incident, { upsert: true, new: true });
      const logs = dbStore.getAuditLogsForIncident(incident.id);
      if (logs.length > 0) {
        await AuditLogModel.findOneAndUpdate({ id: logs[0].id }, logs[0], { upsert: true });
      }
    } catch (dbErr: any) {
      console.warn('⚠️ MongoDB status update skipped:', dbErr?.message || dbErr);
    }

    return NextResponse.json({
      success: true,
      message: `Incident ${id} status updated to '${targetStatus}'. Audit event logged.`,
      incident,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Invalid state transition rejected' },
      { status: 400 }
    );
  }
}

