# SmartWaste 360 — System Architecture

*From "citizen reports, municipality reacts" to "system predicts, prioritizes, dispatches, verifies, measures."*

---

## 1. Architectural Thesis

SmartWaste 360 is built around **five unique design decisions**. Everything else (stack, modules, pages) follows from them.

| # | Decision | Why it matters |
| --- | --- | --- |
| 1 | **Incident-centric core**: citizens file *Reports*; the system clusters them into one *Incident*, which is the unit of work, SLA and audit. | Kills duplicate dispatches; confidence grows with report count. |
| 2 | **Provenance Envelope on every analytic record**: `origin = REAL \| SIMULATED \| PREDICTED`, plus `model_version`, `confidence`, `generated_at`. | Enforces the brief's rule to never present simulated or AI output as fact. Drives UI badges. |
| 3 | **One ingest path for real and simulated telemetry**: the GPS/bin simulator is just another *adapter* publishing to the same Telemetry Gateway. | Swapping in real GPS, QR, RFID or smart-bin sensors needs zero downstream change. |
| 4 | **Explainable scoring engines as pure functions**: Priority, Overflow, Cleanliness, Segregation, SLA-risk each return `{score, factors[], weights, version}`. | Citizens and officers can see *how* a score was derived; testable and tunable. |
| 5 | **Digital Twin = same engines on a cloned snapshot**: What-If runs the production optimizer/forecaster against a sandboxed copy of state. | No second codebase for simulation; results are consistent with live planning. |

---

## 2. High-Level Architecture

```
 CLIENTS (one codebase, role-based shells)
 ┌──────────────┬─────────────────┬──────────────┬───────────────────────────┐
 │ Citizen PWA  │ Worker PWA      │ Supervisor   │ Command Centre / MRF /    │
 │ (mobile)     │ (offline-first) │ (tablet)     │ Admin / Public (desktop)  │
 └──────┬───────┴────────┬────────┴──────┬───────┴─────────────┬─────────────┘
        │ REST + SSE/WS  │ Sync API      │                     │
 ┌──────▼────────────────▼───────────────▼─────────────────────▼─────────────┐
 │ API EDGE: Auth (JWT) → RBAC/ABAC → Zod validation → Rate limit → Audit    │
 └──────┬─────────────────────────────────────────────────────────────┬──────┘
        │                                                             │
 ┌──────▼──────────────── MODULAR MONOLITH (Node + TypeScript) ────────▼──────┐
 │ Identity │ Citizen & Reports │ Incident Engine │ Field Ops │ Fleet & Routes │
 │ Scheduling │ Bins & Assets │ MRF/Recycling │ SLA & Alerts │ Notifications  │
 │ Gamification │ Analytics/Reporting │ Public Dashboard │ Admin & Config     │
 └───────┬───────────────────┬──────────────────────────────┬────────────────┘
         │ domain events     │ jobs (BullMQ)                │ gRPC/HTTP
 ┌───────▼────────┐  ┌───────▼─────────┐        ┌───────────▼──────────────┐
 │ EVENT SPINE    │  │ WORKERS         │        │ WASTE INTELLIGENCE ENGINE │
 │ (outbox table  │  │ SLA ticker,     │        │ (Python FastAPI service)  │
 │ + Redis pub/   │  │ notifier,       │        │ Routing · Forecast ·      │
 │ sub)           │  │ aggregator,     │        │ Hotspot · Anomaly · Vision│
 └───────┬────────┘  │ simulator       │        └───────────┬──────────────┘
         │           └───────┬─────────┘                    │
 ┌───────▼───────────────────▼──────────────────────────────▼───────────────┐
 │ DATA: PostgreSQL + PostGIS (system of record) │ Redis (live state, queues)│
 │ Object storage (S3/MinIO: images, evidence)   │ TimescaleDB-style         │
 │                                               │ partitions (telemetry)    │
 └───────────────────────────────────────────────────────────────────────────┘
 TELEMETRY GATEWAY ◄── Simulator adapter │ GPS device adapter │ QR/RFID │ Sensors
```

**Why a modular monolith?** One deployable, strict module boundaries (no cross-module table access; only service interfaces and events). It is hackathon-friendly yet can split into services later. Only the **Intelligence Engine** is a separate process because it needs Python (OR-Tools, scikit-learn, statsmodels).

---

## 3. Technology Decisions

| Layer | Choice | Reason |
| --- | --- | --- |
| Frontend | Next.js + TypeScript, Tailwind, shadcn/ui (Radix, accessible) | SSR for public dashboard, PWA for field apps |
| State/data | TanStack Query (server state), Zustand (UI + offline queue), RHF + Zod | Shared Zod schemas with the backend |
| Maps/charts | Leaflet + `leaflet.markercluster` + heat layer; ECharts | Open-source, offline tile caching possible |
| Backend | Node + Express + TypeScript, Drizzle/Prisma + raw PostGIS SQL | Typed contracts; spatial queries via SQL |
| Realtime | SSE for dashboards/notifications; WebSocket for worker↔server | SSE is simple and proxy-friendly |
| Queue | Redis + BullMQ | SLA timers, notifications, aggregation |
| Intelligence | FastAPI, OR-Tools (VRP), scikit-learn (DBSCAN, IsolationForest), statsmodels/Prophet, pluggable vision API | Right tool per task |
| Storage | S3-compatible (MinIO locally), pre-signed uploads | Evidence integrity, small API payloads |
| Deploy | Docker Compose (dev/demo) → single cloud VM or Kubernetes | Portable |

---

## 4. Domain Model (Bounded Contexts)

**Core aggregates**

- **Report** (citizen submission) → **Incident** (clustered, deduplicated, owns SLA) → **Task** (field work item) → **Evidence** (before/after, hash, GPS) → **Feedback**.
- **Schedule** → **CollectionTask** → **Route** → **RouteStop** → **WasteRecord** (per-category weights) → **FacilityTransaction** → **RecyclingRecord**.
- **Asset** abstraction: `Bin`, `CollectionPoint`, `Vehicle`, `Facility` each carry `asset_tag` (QR/RFID-ready) and `geom`.
- **Ward → Zone → City** hierarchy with PostGIS polygons (the drill-down City → Zone → Ward → Area → Location → Incident).

**Cross-cutting tables**

| Table | Purpose |
| --- | --- |
| `domain_event` (outbox) | Append-only events; source for audit, timelines, notifications, analytics |
| `audit_log` | Who/what/when/before/after; written by a single middleware + event consumer |
| `ai_insight` | Insight + `supporting_metrics`, `confidence`, `recommended_action`, `origin`, `model_version` |
| `alert` | Severity, explanation, recommended action, linked incident/vehicle |
| `sla_rule` / `sla_clock` | Configurable targets; clock state (running / at-risk / breached / met) |
| `scenario` | Digital-twin snapshots and What-If results |
| `sync_op` | Idempotency keys for offline operations |

**Index strategy:** GiST on every `geom`; BRIN/partitioning on `vehicle_location(ts)`; composite `(ward_id, status, priority)` on incidents; partial index on open incidents; unique `(client_op_id)` on sync ops.

---

## 5. The Incident Engine (heart of the complaint flow)

```
Report ─► Validate/Rate-limit ─► Image hash + EXIF check ─► AI Vision (optional)
      ─► Spatial-temporal clustering (ST_DWithin radius + time window, configurable)
            ├─ match found → link to Incident, raise confidence, notify citizen
            └─ none        → create Incident
      ─► Priority Engine (explainable) ─► SLA clock start ─► Auto-assign (nearest feasible worker/vehicle)
```

**Lifecycle state machine** (guarded transitions, each emits a `domain_event`): `Submitted → Verified → Assigned → Accepted → En Route → Work Started → Evidence Uploaded → Supervisor Verified → Resolved → Feedback` Illegal jumps are rejected; reopen path exists from `Resolved` if feedback is negative.

**Priority Engine inputs:** severity, waste type (hazardous weighting), nearby report count, age, proximity to schools/hospitals (PostGIS lookup), recurrence, estimated volume, SLA remaining. Citizens never supply priority; their input only affects *evidence*, never the score weights.

**Anti-abuse:** per-citizen rate limits, duplicate-hash rejection, eco-points awarded only on *verified* reports.

---

## 6. Waste Intelligence Engine (WIE)

A stateless service exposing versioned capabilities. Each returns the Provenance Envelope.

| Capability | Method | Output |
| --- | --- | --- |
| **Routing** | OR-Tools CVRP with time windows, capacity, priority penalties, depot + MRF drop | Optimized route, distance/time/fuel saved, utilization |
| **Dynamic replanning** | Insertion heuristic: can vehicle absorb stop within capacity and shift time? | "Insert emergency stop" plan or fallback to next vehicle |
| **Overflow prediction** | Per-bin fill-rate regression (EWMA + day-of-week seasonality) | Time-to-90%, interval, auto-task |
| **Hotspots** | DBSCAN/H3 grid density + rate-of-change vs. rolling baseline | Hotspots; **Emerging** if growth z-score exceeds threshold |
| **Anomaly detection** | Rules (impossible GPS jump, long stop, deviation corridor) + IsolationForest on trip features | Alerts with explanation |
| **Demand forecast** | Seasonal model + event multipliers (festival, market, holiday) | Today / tomorrow / 7 / 30 days |
| **Recurrence intelligence** | Location-keyed complaint history | "Recurring issue" + intervention (extra pickup, bin, inspection, awareness drive) |
| **Vision (optional)** | Pluggable image classifier API | Category, severity, illegal-dump likelihood; always labelled *"AI suggestion — verify"* |
| **Cost & carbon** | Config-driven coefficients (fuel price, emission factors) | Cost/tonne, cost/ward, CO₂ avoided with listed assumptions |

**Data honesty rule:** if no real history exists, WIE runs on simulator data and tags every output `SIMULATED`; the UI shows a persistent origin badge.

---

## 7. Real-Time & Simulation

- **Telemetry Gateway** accepts `{asset_id, ts, lat, lon, speed, load, source}` from any adapter, validates, then writes to Redis (latest state) and Postgres (history).
- **Simulator adapter** moves vehicles along road-snapped polylines, injects realistic faults (stops, deviations, breakdowns, GPS jumps), and fills bins with diurnal curves. It is toggleable and seeded for reproducible demos.
- **Fan-out:** Event Spine → SSE channels scoped by role + ward (`/stream/ops?ward=12`), so a supervisor receives only their ward's events.
- **Missed-pickup detector:** worker process compares expected stop windows with telemetry and task records; generates alert + nearest available vehicle suggestion.

---

## 8. Offline-First Worker PWA

1. **Download:** route, stops, task details and map tiles cached via Service Worker + IndexedDB at shift start.
2. **Op-log:** every action (collect, miss, photo, quantity, incident) becomes an immutable operation with a client-generated UUIDv7 `client_op_id`, device time, and GPS.
3. **Sync:** background sync posts ordered batches to `/api/sync`; the server is **idempotent** on `client_op_id`. UI shows "12 offline records waiting to sync."
4. **Conflict policy:** server-authoritative for assignments/route changes (client op flagged `superseded`); client-authoritative for factual field data (weights, photos, timestamps). Conflicts surface to the supervisor, never silently discarded.
5. **Photos:** queued blobs uploaded to pre-signed URLs; SHA-256 + EXIF timestamp/GPS recorded for the evidence chain.

---

## 9. Evidence, Safety & Trust

- **Evidence chain:** `before/after photo + hash + GPS + timestamp + worker + vehicle + task`. Reused hashes or EXIF/GPS mismatches raise a suspicion flag for supervisor review.
- **Worker safety module:** SOS (broadcast to supervisor + nearest vehicle + emergency contact), breakdown/accident reports, hazardous-waste warnings, weather alerts, long-shift fatigue prompts, nearest safe facility. Location is shared with the system **only during an active shift**; workers see their own data.
- **Citizen privacy:** worker identities are hidden (role/vehicle code only); public dashboard reads from **pre-aggregated, anonymized materialized views** with small-count suppression.

---

## 10. Security & RBAC

- Argon2id password hashing; short-lived JWT access + rotating refresh tokens in httpOnly cookies.
- **RBAC + scope (ABAC)**: permissions are `resource:action`, constrained by scope (ward, zone, facility). E.g. a Supervisor can `incident:assign` only within assigned wards.
- Zod validation on every route; per-route rate limits; upload checks (magic-bytes type validation, size caps, AV-scan hook, re-encoding to strip risky metadata after hashing).
- Immutable audit log for state changes, config edits, logins, exports.
- Secrets via environment/secret manager; CORS allow-list; CSP headers.

---

## 11. API Surface (REST + streams)

Follows the brief's endpoints, grouped by module, plus these architecture-specific additions:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/sync` | Idempotent offline batch ingest |
| `GET /api/incidents`, `GET /api/incidents/:id/timeline` | Incident-centric view and audit timeline |
| `POST /api/telemetry` | Gateway ingest for real devices/adapters |
| `POST /api/routes/:id/replan` | Emergency insertion |
| `POST /api/scenarios`, `GET /api/scenarios/:id/result` | Digital Twin / What-If |
| `POST /api/forecast/event` | Event-based demand prediction |
| `GET /api/scores/ward/:id` | Cleanliness score with factor breakdown |
| `GET /api/stream/{ops,citizen,worker}` | SSE channels |
| `GET /api/public/summary` | Anonymized public dashboard feed |

All list endpoints support pagination, sorting, filtering and `?format=csv|pdf` export.

---

## 12. Frontend Architecture

- **Role shells:** `/(citizen)`, `/(worker)`, `/(supervisor)`, `/(officer)`, `/(mrf)`, `/(admin)`, `/(public)` route groups, each with its own layout, navigation and guard.
- **Shared design system** (`packages/ui`): tokens (type, spacing, radius, elevation, status palette), plus `StatusBadge` (colour + icon + text, never colour alone), `KpiCard`, `DataTable`, `Timeline`, `OriginBadge` (REAL/SIMULATED/PREDICTED), `ScoreBreakdown`, `MapShell` with layer toggles, accessible chart wrappers with data-table fallback.
- **Localization:** i18next with namespaced JSON (`en`, `hi`, `te`); no hardcoded strings; adding a language is a new JSON folder.
- **Accessibility:** semantic landmarks, focus management in drawers/modals, reduced-motion, 44px+ targets, keyboard-operable maps (list alternative to map markers).

---

## 13. Digital Twin & What-If

1. `POST /api/scenarios` snapshots current assets, schedules and demand into a `scenario` workspace.
2. Officer mutations (remove Vehicle V-12, add 5 bins, change frequency, add festival event) apply to the snapshot only.
3. WIE re-runs routing and forecasting on the snapshot; the **diff** vs. baseline reports distance, time, cost, coverage and expected missed pickups.
4. Results are labelled `SIMULATED`; officers can "promote" a scenario into a draft schedule for approval.

**Emergency Waste Mode** is a scenario type that can be *activated* live: it creates temporary zones, bins, vehicles and priority schedules with an expiry.

---

## 14. Data Flow (End-to-End)

```
Citizen Report → Incident Engine (cluster + score + SLA) → Command Centre sees it
   → WIE routing/dispatch suggestion → Supervisor approves (or auto-assign)
   → Worker PWA (offline-capable) executes + uploads evidence
   → Supervisor verifies → Resolved → Citizen notified + feedback
   → WasteRecord → MRF intake → recovery/reject metrics
   → Aggregator → KPIs, Cleanliness Score, Segregation Score
   → WIE learns baselines → Insights, forecasts, interventions → loop
```

---

## 15. Repository & Deployment Layout

```
smartwaste360/
├─ apps/
│  ├─ web/            # Next.js role shells (PWA)
│  ├─ api/            # Express modular monolith + workers
│  └─ intelligence/   # FastAPI WIE service
├─ packages/
│  ├─ ui/             # design system
│  ├─ contracts/      # shared Zod schemas + OpenAPI
│  ├─ i18n/           # en / hi / te
│  └─ config/         # SLA defaults, scoring weights, emission factors
├─ db/                # migrations, PostGIS seeds, demo-data generator (Visakhapatnam)
├─ infra/             # docker-compose, MinIO, Redis, CI, env templates
└─ docs/              # architecture, ADRs, README
```

**Environments:** Docker Compose runs web, api, intelligence, postgres+postgis, redis, minio, and the simulator with one command. Seeding produces 20 wards, 200+ collection points, 100+ bins, 30 vehicles, 60 workers, 500+ households, 300+ complaints, MRFs and history, **all flagged `SIMULATED`**.

---

## 16. Build Order (Aligned to the Brief)

1. **Foundations:** monorepo, auth/RBAC, schema + PostGIS, event spine, audit.
2. **Incident flow:** reports, clustering, priority, lifecycle, evidence.
3. **Fleet & field:** simulator, telemetry gateway, live map, worker PWA + offline sync.
4. **Intelligence:** routing, overflow, hotspots, anomalies, missed-pickup detection.
5. **Operations:** schedules, SLA engine, alerts centre, MRF module.
6. **Analytics & public:** KPIs, ward scores, cost/carbon, public dashboard, exports.
7. **Differentiators:** Digital Twin, What-If, event forecasting, Emergency Mode.
8. **Hardening:** accessibility audit, i18n completion, tests (unit for scoring engines, integration for state machine and sync, E2E per role), README.

---

## 17. Key Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Scope too large | Vertical slice first (report → dispatch → resolve → analytics), then widen |
| AI overclaiming | Provenance Envelope + mandatory "verify" copy + confidence display |
| Offline conflicts | Idempotent op-log + explicit conflict policy + supervisor review queue |
| Map performance | Server-side clustering/H3 aggregation, viewport-bounded queries |
| Privacy | Scoped RBAC, worker anonymization, aggregated public views with count suppression |