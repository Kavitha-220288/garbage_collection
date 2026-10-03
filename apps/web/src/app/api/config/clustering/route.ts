import { NextResponse } from 'next/server';
import { dbStore } from '../../../../../../api/src/services/db-store';

export async function GET() {
  return NextResponse.json({
    success: true,
    config: dbStore.clusteringConfig,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.radiusMeters === 'number') {
      dbStore.clusteringConfig.radiusMeters = body.radiusMeters;
    }
    if (typeof body.timeWindowMinutes === 'number') {
      dbStore.clusteringConfig.timeWindowMinutes = body.timeWindowMinutes;
    }

    return NextResponse.json({
      success: true,
      message: 'Spatial-temporal clustering parameters updated.',
      config: dbStore.clusteringConfig,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update configuration' },
      { status: 400 }
    );
  }
}
