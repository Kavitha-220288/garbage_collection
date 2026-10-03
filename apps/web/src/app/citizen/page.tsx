'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { KpiCard } from '@/components/ui/kpi-card';
import { OriginBadge } from '@/components/ui/origin-badge';
import { PriorityBadge, SlaBadge, LifecycleBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { AiPhotoEvaluator } from '@/components/common/ai-photo-evaluator';
import { VoiceAssistant } from '@/components/common/voice-assistant';
import { LeafletGisMap } from '@/components/maps';
import {
  PlusCircle,
  Award,
  MapPin,
  Clock,
  CheckCircle2,
  Camera,
  Sparkles,
  AlertTriangle,
  Upload,
  User,
  Truck,
  Boxes,
  Gift,
} from 'lucide-react';

export default function CitizenDashboard() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [category, setCategory] = useState('Overflowing Bin');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const wasteCategories = [
    'Overflowing Bin',
    'Illegal Dumping',
    'Missed Household Pickup',
    'Hazardous / Electronic Waste',
    'Construction Debris',
    'Green / Garden Waste',
    'Dead Animal Removal',
    'Commercial Waste',
    'Drainage / Litter Accumulation',
    'Plastic / Dry Recyclables',
    'Medical Waste',
    'Public Park Waste',
    'Other Environmental Hazard',
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Citizen Portal & Incident Reporting
            </h1>
            <OriginBadge origin="REAL" size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Lakshmi K. &bull; MVP Colony, Ward 2 &bull; Visakhapatnam
          </p>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Report Waste Problem</span>
        </button>
      </div>

      {/* Multilingual Voice Complaint Assistant */}
      <VoiceAssistant
        onTranscriptChange={(text) => setDescription(text)}
        onCategorySuggested={(cat) => setCategory(cat)}
      />


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Next Household Pickup"
          value="08:30 AM"
          unit="Today"
          description="Vehicle V-03 on route"
          origin="REAL"
          icon={Clock}
        />
        <KpiCard
          title="Active Complaints"
          value="1"
          unit="In Progress"
          description="Incident #INC-2026-091"
          origin="REAL"
          icon={AlertTriangle}
        />
        <KpiCard
          title="Eco-Points Earned"
          value="450"
          unit="Pts (Level 3)"
          trend={{ value: 50, label: 'verified reports' }}
          origin="REAL"
          icon={Award}
        />
        <KpiCard
          title="Neighborhood Score"
          value="89 / 100"
          unit="MVP Colony"
          trend={{ value: 2.5, label: 'top 5%' }}
          origin="PREDICTED"
          confidence={0.95}
          icon={CheckCircle2}
        />
      </div>

      {/* Active Citizen Complaint Timeline Card (Section: #track) */}
      <div id="track" className="scroll-mt-6 rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>My Active Report: #INC-2026-091</span>
              <LifecycleBadge status="WORK_STARTED" />
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5 text-primary" /> MVP Colony Sector 5 (Bin #B-042)
            </p>
          </div>
          <SlaBadge status="MET" remainingText="SLA On Track" />
        </div>

        {/* Visual Lifecycle Timeline */}
        <div className="py-2">
          <p className="text-xs font-semibold text-muted-foreground mb-3">Audit-Verified Lifecycle Timeline</p>
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-2 md:border-l-0 md:border-t-2 border-primary/30 pt-4 md:pt-4 pl-4 md:pl-0">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">1</div>
              <div>
                <p className="text-xs font-bold text-foreground">Submitted</p>
                <p className="text-[10px] text-muted-foreground">09:15 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">2</div>
              <div>
                <p className="text-xs font-bold text-foreground">Clustered & Verified</p>
                <p className="text-[10px] text-muted-foreground">09:18 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold animate-pulse">3</div>
              <div>
                <p className="text-xs font-bold text-primary">En Route / In Progress</p>
                <p className="text-[10px] text-muted-foreground">Vehicle V-03 Dispatched</p>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-50">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px] font-bold">4</div>
              <div>
                <p className="text-xs font-bold text-foreground">Evidence Verification</p>
                <p className="text-[10px] text-muted-foreground">Pending photo</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Photo Analysis for Active Report */}
        <AiPhotoEvaluator
          photoUrl="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80"
          role="CITIZEN"
          category="OVERFLOWING_BIN"
        />

        {/* Privacy Note */}
        <div className="rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Worker Identity Shielded: Assigned crew code &quot;CREW-W2-A&quot; (Vehicle V-03).</span>
          <OriginBadge origin="REAL" size="sm" />
        </div>
      </div>

      {/* Live Vehicle Tracking Section (Section: #map) */}
      <div id="map" className="scroll-mt-6 rounded-xl border border-border bg-card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Truck className="h-5 w-5 text-emerald-600" /> Live Ward Waste Collection Vehicle Map
            </h3>
            <p className="text-xs text-muted-foreground">Real-time GPS telemetry & door-to-door vehicle location</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            Vehicle V-03 &bull; En Route
          </span>
        </div>
        <LeafletGisMap height="h-[320px]" />
      </div>

      {/* Rate Our Work Section (Section: #rating) */}
      <div id="rating" className="scroll-mt-6 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" /> Give Rating to Our Work
            </h3>
            <p className="text-xs text-muted-foreground">Rate municipal sanitation performance, worker cleanliness speed, and bin maintenance in your ward</p>
          </div>
          <div className="rounded-xl bg-indigo-600 text-white font-extrabold px-3.5 py-1.5 text-xs shadow-sm flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-300" /> Ward 2 Rating: 4.8 / 5.0 ⭐
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-card p-3.5 border border-border space-y-2">
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Door-to-Door Pickup</span>
            <p className="text-xs font-bold text-foreground">Timeliness & Cleanliness</p>
            <div className="flex items-center gap-1 text-amber-400 text-sm">
              ★★★★★ <span className="text-xs font-bold text-slate-700 ml-1">5.0 / 5</span>
            </div>
            <p className="text-[11px] text-muted-foreground">&ldquo;Worker arrived right on schedule at 08:30 AM.&rdquo;</p>
          </div>

          <div className="rounded-lg bg-card p-3.5 border border-border space-y-2">
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Bin Clearance Speed</span>
            <p className="text-xs font-bold text-foreground">SLA Resolution Rating</p>
            <div className="flex items-center gap-1 text-amber-400 text-sm">
              ★★★★☆ <span className="text-xs font-bold text-slate-700 ml-1">4.6 / 5</span>
            </div>
            <p className="text-[11px] text-muted-foreground">&ldquo;Overflowing bin issue cleared within 2 hours of report.&rdquo;</p>
          </div>

          <div className="rounded-lg bg-card p-3.5 border border-border space-y-2">
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Overall Ward Sanitation</span>
            <p className="text-xs font-bold text-foreground">Submit Your Feedback</p>
            <button
              onClick={() => alert('Thank you for rating Swachh Setu sanitation work! Your 5-star rating has been submitted to Ward Supervisor Anitha R.')}
              className="w-full mt-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 text-xs shadow-xs transition-colors flex items-center justify-center gap-1"
            >
              ⭐ Rate Recent Pickup (5 Stars)
            </button>
          </div>
        </div>
      </div>

      {/* Report Waste Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Waste Incident with Photo AI"
        description="Submit photo and location. The AI Vision Evaluator will score and category-classify automatically."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('Report submitted! Your incident ID is #INC-2026-095 with AI Verification.');
            setIsReportModalOpen(false);
          }}
          className="space-y-4 py-2"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Waste Problem Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-input bg-card p-2.5 text-xs text-foreground focus:border-primary"
            >
              {wasteCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Photo Evidence Upload</label>
            {photoUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-border bg-black max-h-48 flex items-center justify-center">
                <img src={photoUrl} alt="Preview" className="max-h-48 object-contain" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="absolute top-2 right-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white hover:bg-black"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-4 bg-muted/20 hover:bg-muted/40 cursor-pointer">
                <Camera className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium text-foreground mt-1">Click to capture photo or pick file</span>
                <span className="text-[10px] text-muted-foreground">EXIF GPS and timestamp recorded</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* AI Evaluator Engine Card */}
          {photoUrl && (
            <AiPhotoEvaluator
              photoUrl={photoUrl}
              role="CITIZEN"
              category={category as any}
            />
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Description & Landmarks</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact landmark details, bin condition, or urgency..."
              className="w-full rounded-lg border border-input bg-card p-2.5 text-xs text-foreground focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="rounded-lg border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Submit Report with AI Score
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

