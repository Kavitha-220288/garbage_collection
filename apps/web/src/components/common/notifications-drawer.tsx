'use client';

import React from 'react';
import { Drawer } from '@/components/ui/drawer';
import { OriginBadge } from '@/components/ui/origin-badge';
import { AlertTriangle, Clock, CheckCircle2, Bell, Truck } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
  const sampleNotifications = [
    {
      id: 'n-1',
      title: 'SLA Breach Warning',
      message: 'Bin #B-108 in Ward 12 (Gajuwaka) reached 92% capacity without assigned dispatch.',
      time: '10 mins ago',
      type: 'critical',
      origin: 'PREDICTED' as const,
      confidence: 0.94,
    },
    {
      id: 'n-2',
      title: 'New Incident Clustered',
      message: '3 citizen reports merged into Incident #INC-2026-089 (Overflowing Bin at Jagadamba Center).',
      time: '24 mins ago',
      type: 'info',
      origin: 'REAL' as const,
    },
    {
      id: 'n-3',
      title: 'Route Replanning Alert',
      message: 'Vehicle V-08 delayed due to road work on MVP Colony Main Rd. Emergency reroute generated.',
      time: '1 hour ago',
      type: 'warning',
      origin: 'SIMULATED' as const,
    },
    {
      id: 'n-4',
      title: 'MRF Batch Received',
      message: '4.2 tonnes dry waste received at MRF Facility #1 from Ward 4.',
      time: '2 hours ago',
      type: 'success',
      origin: 'REAL' as const,
    },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Municipal Command Alerts"
      subtitle="Live notifications, SLA warnings, and operational events"
      size="md"
    >
      <div className="space-y-3">
        {sampleNotifications.map((n) => {
          const configMap: Record<string, { icon: React.ElementType; color: string }> = {
            critical: { icon: AlertTriangle, color: 'text-red-500 bg-red-500/10' },
            warning: { icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
            info: { icon: Truck, color: 'text-blue-500 bg-blue-500/10' },
            success: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
          };

          const iconConfig = configMap[n.type] || { icon: Bell, color: 'text-primary bg-primary/10' };
          const Icon = iconConfig.icon;

          return (
            <div
              key={n.id}
              className="group relative rounded-xl border border-border bg-card p-4 transition-all hover:shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${iconConfig.color}`}>
                  <Icon className="h-4 w-4 shrink-0" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-foreground">{n.title}</h4>
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                  <div className="pt-2">
                    <OriginBadge origin={n.origin} confidence={n.confidence} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Drawer>
  );
}
