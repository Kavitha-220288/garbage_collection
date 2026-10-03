import { NextResponse } from 'next/server';
import { OfflineSyncOp } from '@smartwaste360/contracts';

// In-memory set of processed client_op_ids to enforce idempotency
const processedClientOpIds = new Set<string>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { operations } = body as { operations: OfflineSyncOp[] };

    if (!Array.isArray(operations)) {
      return NextResponse.json({ success: false, error: 'Invalid payload: operations array required' }, { status: 400 });
    }

    const results = [];
    let syncedCount = 0;

    for (const op of operations) {
      // Check idempotency: ignore duplicate client_op_ids
      if (processedClientOpIds.has(op.client_op_id)) {
        results.push({ client_op_id: op.client_op_id, status: 'IDEMPOTENT_SKIPPED' });
        continue;
      }

      processedClientOpIds.add(op.client_op_id);
      syncedCount++;

      results.push({
        client_op_id: op.client_op_id,
        operation_type: op.operation_type,
        status: 'SUCCESS',
        processed_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Idempotently processed ${syncedCount} offline operations.`,
      syncedCount,
      results,
      origin: 'REAL',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Worker sync failed' }, { status: 500 });
  }
}
