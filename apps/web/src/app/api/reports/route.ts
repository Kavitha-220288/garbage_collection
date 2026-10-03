import { NextResponse } from 'next/server';
import { dbStore } from '../../../../../api/src/services/db-store';
import { CreateReportInputSchema } from '@smartwaste360/contracts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CreateReportInputSchema.parse(body);

    const result = dbStore.createReport(validated);

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
  const incidents = dbStore.getIncidents();
  return NextResponse.json({ success: true, count: incidents.length, incidents });
}
