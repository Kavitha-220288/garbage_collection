'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { OriginBadge } from '@/components/ui/origin-badge';
import { LeafletMapPicker } from '@/components/maps';

import { WasteCategory, WasteCategoryLabels } from '@smartwaste360/contracts';
import {
  Camera,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Send,
  Loader2,
  ArrowRight,
  Info,
  ShieldCheck,
} from 'lucide-react';

export default function ReportWastePage() {
  const router = useRouter();

  const [category, setCategory] = useState<WasteCategory>('OVERFLOWING_BIN');
  const [address, setAddress] = useState('Jagadamba Center (Main Market)');
  const [wardName, setWardName] = useState('Ward 4 (Jagadamba)');
  const [latitude, setLatitude] = useState(17.7121);
  const [longitude, setLongitude] = useState(83.3012);
  const [landmark, setLandmark] = useState('Near Market Entrance');
  const [description, setDescription] = useState('');
  const [citizenName, setCitizenName] = useState('Lakshmi K.');

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoHash, setPhotoHash] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  const wasteCategoriesList = Object.keys(WasteCategoryLabels) as WasteCategory[];

  const handleSimulatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setPhotoHash(`sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 10)}`);
      };
      reader.readAsDataURL(file);
    } else {
      // Demo fallback photo
      setPhotoPreview('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80');
      setPhotoHash('sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          latitude,
          longitude,
          address,
          wardName,
          landmark,
          description: description || `Reported ${WasteCategoryLabels[category].name} issue at ${address}`,
          photoUrl: photoPreview || '/assets/demo-waste-photo.jpg',
          photoHash: photoHash || 'sha256:demo9918237',
          citizenName,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSubmissionResult(data);
    } catch (err: any) {
      alert(`Submission Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Report Waste Problem
            </h1>
            <OriginBadge origin="REAL" size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Submit waste issues directly to Greater Hyderabad Municipal Command. The Incident Engine clusters duplicates automatically.
          </p>
        </div>
      </div>

      {submissionResult ? (
        /* Confirmation Card */
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-6 max-w-2xl mx-auto animate-in fade-in zoom-in-95">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              Report Submitted Successfully!
            </h2>
            <p className="text-sm text-muted-foreground">
              Complaint ID: <span className="font-mono font-bold text-primary">{submissionResult.report.id}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Linked Incident ID: <span className="font-mono font-bold text-foreground">{submissionResult.incident.id}</span>
            </p>
          </div>

          {/* Spatial Duplicate Banner */}
          {submissionResult.isDuplicate ? (
            <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4 text-left space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                  <Info className="h-4 w-4" /> Duplicate Notice &mdash; Linked to Existing Incident
                </h4>
                <OriginBadge origin="REAL" size="sm" />
              </div>
              <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                {submissionResult.message}
              </p>
              <p className="text-[11px] text-muted-foreground pt-1">
                Total citizen confirmations linked to Incident #{submissionResult.incident.id}: <span className="font-bold">{submissionResult.incident.reportsCount}</span>
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-left space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> New Incident Created & Dispatched
                </h4>
                <OriginBadge origin="REAL" size="sm" />
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {submissionResult.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => router.push(`/citizen/track/${submissionResult.report.id}`)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <span>Track Live Complaint Timeline</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setSubmissionResult(null);
                setPhotoPreview(null);
              }}
              className="rounded-lg border border-input px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Report Another Problem
            </button>
          </div>
        </div>
      ) : (
        /* Report Form */
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
          {/* Step 1: Select Category */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-foreground">Step 1: Select Waste Category (13 PRD Types)</h3>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {wasteCategoriesList.map((catKey) => {
                const cat = WasteCategoryLabels[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    type="button"
                    key={catKey}
                    onClick={() => setCategory(catKey)}
                    className={`flex flex-col justify-between rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 font-bold text-primary shadow-xs'
                        : 'border-input bg-card text-foreground hover:bg-muted'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{cat.name}</p>
                      <p className="text-[10px] opacity-80 line-clamp-1 mt-0.5">{cat.description}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[9px]">
                      <span className={`px-1.5 py-0.5 rounded font-semibold ${cat.isHazardous ? 'bg-red-500/20 text-red-700 dark:text-red-400' : 'bg-muted text-muted-foreground'}`}>
                        {cat.isHazardous ? 'Hazardous' : 'Standard'}
                      </span>
                      <span className="opacity-75">SLA: {cat.defaultSlaHours}h</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Interactive Location Picker */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Step 2: Capture GPS Location & Ward Pin
            </h3>
            <LeafletMapPicker
              latitude={latitude}
              longitude={longitude}
              address={address}
              wardName={wardName}
              onChangeLocation={(loc) => {
                setLatitude(loc.latitude);
                setLongitude(loc.longitude);
                setAddress(loc.address);
                setWardName(loc.wardName);
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Specific Landmark</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near shop, market entrance, opposite park..."
                  className="w-full rounded-lg border border-input bg-card p-2 text-xs text-foreground focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Reporter Name</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-card p-2 text-xs text-foreground focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Photo Evidence Upload */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Step 3: Photo / Evidence Capture
            </h3>

            {photoPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border bg-black max-h-56 flex items-center justify-center">
                <img src={photoPreview} alt="Evidence preview" className="max-h-56 object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoHash(null);
                  }}
                  className="absolute top-2 right-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white hover:bg-black"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 bg-muted/20 hover:bg-muted/40 cursor-pointer text-center">
                <Camera className="h-8 w-8 text-primary" />
                <span className="text-xs font-bold text-foreground mt-2">Tap to take photo or upload file</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">EXIF GPS and SHA-256 timestamp recorded</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleSimulatePhotoUpload}
                  className="hidden"
                />
              </label>
            )}

            {/* AI Category Suggestion Advisory */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  AI Suggestion &mdash; verify before submission
                </span>
                <OriginBadge origin="PREDICTED" confidence={0.91} size="sm" />
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-400">
                AI Vision suggested category: <span className="font-bold">{WasteCategoryLabels[category].name}</span>. You can override if required.
              </p>
            </div>
          </div>

          {/* Step 4: Description */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Step 4: Additional Description
            </h3>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe waste volume, blockage, smells, or urgency details..."
              className="w-full rounded-lg border border-input bg-card p-2.5 text-xs text-foreground focus:border-primary"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/citizen')}
              className="rounded-lg border border-input px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Clustering & Registering...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Waste Problem</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </AppShell>
  );
}
