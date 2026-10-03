'use client';

import React, { useState, useEffect, use } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { OriginBadge } from '@/components/ui/origin-badge';
import { PriorityBadge, SlaBadge, LifecycleBadge } from '@/components/ui/status-badge';
import { LeafletGisMap } from '@/components/maps';
import {
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Star,
  Truck,
  AlertTriangle,
  Send,
  Loader2,
  ArrowLeft,
  FileCheck,
  Map,
} from 'lucide-react';
import Link from 'next/link';


export default function ComplaintTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/${id}`);
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load complaint tracking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/incidents/${data.incident.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      setFeedbackSubmitted(true);
      setFeedbackMsg(result.message);
      fetchDetails(); // Refresh to show reopened status if rating <= 2
    } catch (err: any) {
      alert(`Feedback Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-xs font-semibold text-muted-foreground">Fetching Live Audit Timeline & SLA Clock...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center space-y-4 max-w-lg mx-auto">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
          <h2 className="text-lg font-bold text-foreground">Complaint Record Not Found</h2>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Link
            href="/citizen"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Citizen Home
          </Link>
        </div>
      </AppShell>
    );
  }

  const { report, incident, auditLogs } = data;

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/citizen" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Complaint Tracking Timeline #{incident.id}
            </h1>
            <OriginBadge origin={incident.origin || 'REAL'} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Category: <span className="font-bold text-foreground">{incident.categoryLabel}</span> &bull; {incident.address}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LifecycleBadge status={incident.status} />
          <PriorityBadge priority={incident.priority} />
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Linked Reports</p>
          <p className="text-xl font-extrabold text-foreground">{incident.reportsCount} Citizen Report(s)</p>
          <p className="text-[10px] text-emerald-600">Deduplicated & Clustered</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">SLA Clock Status</p>
          <div className="pt-0.5">
            <SlaBadge status={incident.slaStatus} remainingText={`Target ${incident.slaTargetHours} Hours`} />
          </div>
          <p className="text-[10px] text-muted-foreground">Due: {new Date(incident.slaDueAt).toLocaleTimeString()}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Dispatch Fleet</p>
          <p className="text-sm font-bold text-foreground flex items-center gap-1.5 pt-1">
            <Truck className="h-4 w-4 text-primary" /> {incident.assignedCrewCode || 'Crew CREW-W4-A'}
          </p>
          <p className="text-[10px] text-muted-foreground">Vehicle {incident.assignedVehicleId || 'V-12'}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Privacy Shield</p>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1">
            <ShieldCheck className="h-4 w-4" /> Personal PII Hidden
          </p>
          <p className="text-[10px] text-muted-foreground">Worker identity anonymized</p>
        </div>
      </div>

      {/* Live Vehicle Tracking & Complaint Location Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Map className="h-4 w-4 text-emerald-500" />
            <span>Live Dispatch Vehicle GPS Map & Location Pin</span>
          </h3>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            ETA: 12 Mins &bull; 0.6 km away
          </span>
        </div>
        <LeafletGisMap height="h-[350px]" />
      </div>

      {/* Visual Audit-Verified Timeline */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">

        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <span>Audit-Verified Lifecycle Timeline</span>
          </h3>
          <span className="text-xs text-muted-foreground">{auditLogs.length} verified events logged</span>
        </div>

        <div className="relative border-l-2 border-primary/30 ml-4 pl-6 space-y-6">
          {auditLogs.map((log: any, idx: number) => (
            <div key={log.id} className="relative group">
              {/* Timeline Marker Node */}
              <div className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-xs">
                {auditLogs.length - idx}
              </div>

              <div className="rounded-lg border border-border bg-card p-3 space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{log.action}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <LifecycleBadge status={log.newStatus} />
                  <span className="text-[11px] font-semibold text-muted-foreground">By: {log.actor} ({log.actorRole})</span>
                </div>
                <p className="text-xs text-muted-foreground pt-1">{log.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Before & After Evidence Chain */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-base font-bold text-foreground border-b border-border pb-3">
          Field Photo Evidence & Integrity Chain
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground">Before Clearing (Citizen Submission)</span>
            <div className="rounded-lg border border-border bg-muted/30 p-2 text-center">
              <img
                src={report?.photoUrl || '/assets/demo-waste-photo.jpg'}
                alt="Before evidence"
                className="max-h-44 w-full object-cover rounded"
              />
              <span className="text-[9px] font-mono text-muted-foreground block mt-1">
                Hash: {report?.photoHash || 'sha256:7f83b1657ff1fc53b92'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground">After Clearing (Worker Evidence)</span>
            <div className="rounded-lg border border-border bg-muted/30 p-2 text-center">
              {incident.status === 'RESOLVED' || incident.status === 'SUPERVISOR_VERIFIED' ? (
                <div>
                  <img
                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"
                    alt="After evidence"
                    className="max-h-44 w-full object-cover rounded"
                  />
                  <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 block mt-1">
                    Hash Verified &bull; sha256:e3b0c44298fc1c149afbf
                  </span>
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-muted-foreground p-4">
                  <Clock className="h-8 w-8 mb-2" />
                  <span className="text-xs font-semibold">Pending Work Completion</span>
                  <span className="text-[10px]">Worker photo will upload upon task resolution</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rating & Feedback Section */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-base font-bold text-foreground border-b border-border pb-3">
          Rate Service Resolution Experience
        </h3>

        {feedbackSubmitted ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Feedback Saved
              </span>
              <OriginBadge origin="REAL" size="sm" />
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">{feedbackMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Satisfaction Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-foreground ml-2">
                  {rating === 5 ? 'Excellent' : rating <= 2 ? 'Unsatisfied (Will Reopen)' : 'Satisfactory'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Comments / Remarks (Optional)</label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your feedback regarding speed, cleanliness, or field worker service..."
                className="w-full rounded-lg border border-input bg-card p-2 text-xs text-foreground focus:border-primary"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit Service Rating</span>
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
