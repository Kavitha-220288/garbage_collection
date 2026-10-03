import { NextResponse } from 'next/server';
import { dbStore } from '../../../../../../../api/src/services/db-store';
import { LifecycleStatusSchema } from '@smartwaste360/contracts';

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
