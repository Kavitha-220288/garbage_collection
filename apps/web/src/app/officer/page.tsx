'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { KpiCard } from '@/components/ui/kpi-card';
import { OriginBadge } from '@/components/ui/origin-badge';
import { PriorityBadge, SlaBadge, LifecycleBadge } from '@/components/ui/status-badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { Tabs } from '@/components/ui/tabs';
import { LeafletGisMap } from '@/components/maps';
import {
  calculateExplainablePriority,
  predictBinOverflow,
  detectWasteHotspots,
} from '@/lib/wie-intelligence';
import {
  Building2,
  Truck,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Map,
  Sparkles,
  Recycle,
  ShieldCheck,
  TrendingUp,
  Activity,
  Zap,
  Info,
  ChevronRight,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Search,
} from 'lucide-react';

export default function OfficerCommandCentre() {
  const [activeTab, setActiveTab] = useState('gis');
  const [officerName, setOfficerName] = useState<string>('Municipal Officer');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('swachh_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.name) setOfficerName(u.name);
      }
    } catch (e) {}
  }, []);

  // Drilldown level state: City -> Zone -> Ward -> Area -> Location -> Incident
  const [drillLevel, setDrillLevel] = useState<'CITY' | 'ZONE' | 'WARD' | 'LOCATION'>('CITY');
  const [selectedWard, setSelectedWard] = useState<string>('All GHMC Wards (Hyderabad)');

  // WIE Intelligence outputs
  const priorityResult = calculateExplainablePriority('OVERFLOWING_BIN', 3, false, 1.5);
  const overflowPrediction = predictBinOverflow('BIN-108', 88);
  const hotspots = detectWasteHotspots();

  return (
    <AppShell>
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-emerald-950 dark:text-emerald-50">
              Municipal Command Centre & GIS Control
            </h1>
            <OriginBadge origin="REAL" size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {officerName} &bull; Greater Hyderabad Municipal Corporation (6 Zones, 30 Circles)
          </p>
        </div>


        {/* Drill-down Breadcrumb Navigator */}
        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900 dark:text-emerald-100">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">DRILL:</span>
          <button
            type="button"
            onClick={() => {
              setDrillLevel('CITY');
              setSelectedWard('All GHMC Wards (Hyderabad)');
            }}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              drillLevel === 'CITY' ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-100 text-slate-700'
            }`}
          >
            City
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <button
            type="button"
            onClick={() => {
              setDrillLevel('ZONE');
              setSelectedWard('Gajuwaka & Central Zone');
            }}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              drillLevel === 'ZONE' ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-100 text-slate-700'
            }`}
          >
            Zone 2
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <button
            type="button"
            onClick={() => {
              setDrillLevel('WARD');
              setSelectedWard('Ward 4 (Jagadamba)');
            }}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              drillLevel === 'WARD' ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-100 text-slate-700'
            }`}
          >
            Ward 4
          </button>
        </div>
      </div>

      {/* 10 PRD City KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <KpiCard
          title="Daily Waste Collected"
          value="482.5"
          unit="Tonnes"
          trend={{ value: 6.4, label: 'vs yesterday' }}
          origin="REAL"
          icon={Truck}
        />
        <KpiCard
          title="Route Completion"
          value="94.2%"
          unit="24 Routes"
          trend={{ value: 2.1, label: 'on schedule' }}
          origin="REAL"
          icon={CheckCircle2}
        />
        <KpiCard
          title="SLA Compliance"
          value="91.8%"
          unit="Target 90%"
          trend={{ value: 3.5, label: 'above target' }}
          origin="REAL"
          icon={ShieldCheck}
        />
        <KpiCard
          title="Source Segregation"
          value="76.4%"
          unit="High Grade"
          trend={{ value: 5.0, label: 'target +10%' }}
          origin="REAL"
          icon={Recycle}
        />
        <KpiCard
          title="Predicted Hotspots"
          value="3"
          unit="Emerging"
          description="Gajuwaka Market Belt"
          origin="PREDICTED"
          confidence={0.92}
          icon={Sparkles}
        />
      </div>

      {/* Main Command Tabs */}
      <Tabs
        tabs={[
          { id: 'gis', label: 'GIS Live Operations Map', icon: Map },
          { id: 'wie', label: 'AI Waste Intelligence Engine (WIE)', badge: 'v2.4', icon: Sparkles },
          { id: 'incidents', label: 'Incidents & SLA Risk Queue', badge: '14 Active', icon: AlertTriangle },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {/* Tab 1: GIS Live Operations Map (Section: #gis & #fleet) */}
      <div id="gis" className="scroll-mt-6 space-y-3">
        <div id="fleet" className="scroll-mt-6">
          {activeTab === 'gis' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-emerald-600" /> Active View Scope: <span className="font-extrabold text-emerald-800">{selectedWard}</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                  PostGIS Spatial Boundary Layer Engaged
                </span>
              </div>

              <LeafletGisMap height="h-[620px]" />
            </div>
          )}
        </div>
      </div>

      {/* Tab 2: AI Waste Intelligence Engine (WIE) Panel (Section: #wie) */}
      <div id="wie" className="scroll-mt-6">
        {activeTab === 'wie' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 p-6 text-white green-shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Waste Intelligence Engine (WIE v2.4-Python Service)
                </div>
                <OriginBadge origin="PREDICTED" size="sm" />
              </div>

              <h3 className="text-xl font-extrabold tracking-tight text-emerald-50">
                Explainable Predictive Analytics & Route Replanning
              </h3>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                Every AI prediction includes full Data Provenance Envelopes (`origin`, `model_version`, `confidence`, `generated_at`, `supporting_metrics`, `recommended_action`).
              </p>
            </div>

            {/* 3 WIE Intelligence Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Priority Scoring */}
              <div className="rounded-2xl border border-emerald-200 bg-white p-5 green-shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Explainable Priority Score
                  </span>
                  <span className="text-xs font-black text-white bg-red-600 px-2 py-0.5 rounded-md">
                    {priorityResult.data.priority} ({priorityResult.data.score}/100)
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {priorityResult.data.factors.map((f, i) => (
                    <div key={i} className="flex justify-between items-center bg-emerald-50/50 p-2 rounded-lg text-[11px]">
                      <span className="text-slate-700 font-medium">{f.factor}</span>
                      <span className="font-mono font-bold text-emerald-700">+{f.contribution} pts</span>
                    </div>
                  ))}
                </div>

                <div className="pt-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/60 p-2 rounded-lg border border-emerald-200">
                  <span className="block text-[9px] uppercase tracking-wider text-emerald-700 font-extrabold">Recommended Action:</span>
                  {priorityResult.recommended_action}
                </div>
              </div>

              {/* Card 2: Bin Overflow Prediction */}
              <div className="rounded-2xl border border-emerald-200 bg-white p-5 green-shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Bin Overflow EWMA Prediction
                  </span>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                    Overflow in {overflowPrediction.data.predictedHoursToOverflow}h
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  Bin #BIN-108 (Jagadamba Market) current fill rate: <span className="font-bold text-slate-900">6.5% / hour</span>. Projected 90% threshold breach at:
                </p>
                <p className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg text-center">
                  {new Date(overflowPrediction.data.overflowTimestamp).toLocaleTimeString()}
                </p>

                <div className="pt-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/60 p-2 rounded-lg border border-emerald-200">
                  <span className="block text-[9px] uppercase tracking-wider text-emerald-700 font-extrabold">Recommended Action:</span>
                  {overflowPrediction.recommended_action}
                </div>
              </div>

              {/* Card 3: Hotspot Density Detection */}
              <div className="rounded-2xl border border-emerald-200 bg-white p-5 green-shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    DBSCAN Waste Hotspots
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {hotspots.data.hotspotsCount} Active Hotspots
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {hotspots.data.emergingZones.map((zone, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-emerald-50/50 p-2 rounded-lg text-[11px]">
                      <span className="font-bold text-slate-800">{zone}</span>
                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        z &gt; 2.1 Emerging
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/60 p-2 rounded-lg border border-emerald-200">
                  <span className="block text-[9px] uppercase tracking-wider text-emerald-700 font-extrabold">Recommended Action:</span>
                  {hotspots.recommended_action}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

