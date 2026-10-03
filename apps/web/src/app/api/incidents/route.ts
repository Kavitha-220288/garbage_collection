import { NextResponse } from 'next/server';
import { dbStore } from '../../../../../api/src/services/db-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ward = searchParams.get('ward');
  const status = searchParams.get('status');

  let incidents = dbStore.getIncidents();

  if (ward) {
    incidents = incidents.filter((i) => i.wardName.toLowerCase().includes(ward.toLowerCase()));
  }

  if (status) {
    incidents = incidents.filter((i) => i.status === status);
  }

  return NextResponse.json({
    success: true,
    count: incidents.length,
    incidents,
  });
}
