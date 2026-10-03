import { NextResponse } from 'next/server';
import { VehicleTelemetry } from '@smartwaste360/contracts';

// Server-Sent Events (SSE) Telemetry Gateway Stream Endpoint
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        // Generate simulated vehicle telemetry data packet
        const telemetry: VehicleTelemetry = {
          asset_id: `V-${Math.floor(Math.random() * 15 + 1).toString().padStart(2, '0')}`,
          timestamp: new Date().toISOString(),
          latitude: Number((17.7121 + (Math.random() - 0.5) * 0.04).toFixed(6)),
          longitude: Number((83.3012 + (Math.random() - 0.5) * 0.04).toFixed(6)),
          speed_kmh: Math.floor(15 + Math.random() * 30),
          load_percent: Math.floor(40 + Math.random() * 50),
          status: 'COLLECTING',
          source: 'SIMULATED',
        };

        const data = `data: ${JSON.stringify(telemetry)}\n\n`;
        controller.enqueue(encoder.encode(data));
      }, 3000);

      reqSignal?.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

// Optional signal handling mock for SSE
let reqSignal: AbortSignal | null = null;
