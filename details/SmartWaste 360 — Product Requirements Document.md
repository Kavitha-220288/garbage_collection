# SmartWaste 360 — Product Requirements Document (PRD)

|  |  |
| --- | --- |
| **Product** | SmartWaste 360 — AI-Powered Smart Waste Collection & Municipal Operations Platform |
| **Version** | 1.0 (Draft) |
| **Date** | 3 October 2026 |
| **Reference city (demo)** | Visakhapatnam — 5 zones, 20 wards (all demo data labelled *Simulated*) |
| **Companion doc** | SmartWaste 360 — System Architecture |

---

## 1. Executive Summary

Municipal waste management is reactive: citizens complain, the municipality responds late, and field work is poorly verified. SmartWaste 360 is a unified platform connecting citizens, field workers, supervisors, officers, recycling facilities and administrators. Its **Waste Intelligence Engine (WIE)** predicts problems, prioritizes interventions, optimizes routes, verifies field action with evidence, and measures outcomes.

**Product vision:** move from *"citizen reports problem → municipality reacts"* to *"system predicts problem → prioritizes intervention → optimizes resources → verifies field action → measures outcome."*

---

## 2. Problem Statement

| Problem | Impact |
| --- | --- |
| Overflowing bins, missed pickups, illegal dumping | Health risk, public dissatisfaction |
| Duplicate and repeated complaints with no linking | Wasted dispatches, no root-cause fixing |
| Inefficient routes, no live vehicle visibility | Fuel/time waste, no accountability |
| Poor segregation, weak MRF monitoring | Low recovery, high landfill load |
| Disconnected citizen, field and municipal systems | No transparency, slow SLA resolution |
| No predictive intelligence | Constant firefighting |

---

## 3. Goals, Non-Goals & Success Metrics

### 3.1 Goals

1. One incident-centric workflow from report to verified resolution.
2. Predictive operations (overflow, hotspots, missed pickups, demand).
3. Evidence-based, auditable field work, including offline.
4. Transparent citizen experience and public accountability.
5. Honest AI: every prediction/simulation is clearly labelled.

### 3.2 Non-Goals (v1)

- Real payment/user-charge collection (architecture hooks only).
- Native iOS/Android apps (PWA only).
- Proprietary hardware (works without it; QR/RFID/sensors are integration-ready).
- Replacing municipal HR/payroll, or legal enforcement workflows.

### 3.3 Success Metrics (targets are for pilot evaluation; baselines to be measured)

| Metric | Target |
| --- | --- |
| SLA compliance (all complaint types) | ≥ 90% |
| Median complaint resolution time | −30% vs. baseline |
| Duplicate dispatches avoided by clustering | ≥ 80% of duplicate reports linked |
| Missed-pickup detection-to-action time | \< 30 min |
| Route distance reduction (optimized vs. original) | ≥ 10% |
| Source segregation rate | +10 pts over 6 months |
| Worker app task completion offline-then-synced | ≥ 99% without data loss |
| Citizen satisfaction (feedback rating) | ≥ 4.0 / 5 |
| Accessibility | WCAG 2.1 AA for all flows; AAA where practical |

---

## 4. Users & Personas

| Persona | Needs | Key pain | Device |
| --- | --- | --- | --- |
| **Citizen — Lakshmi, 34** | Report, track, know pickup time | No feedback after reporting | Mobile |
| **Worker/Driver — Ravi, 41** | Clear route, simple capture, safety | Poor connectivity, paperwork | Low-end Android PWA |
| **Supervisor — Anitha, 38** | Monitor crews, verify, escalate | No live view, disputed work | Tablet |
| **Municipal Officer — Dr. Rao, 52** | City KPIs, decisions, reports | Data arrives late/unreliable | Desktop |
| **MRF Manager — Suresh, 45** | Intake, sorting, recovery tracking | Manual logs, contamination | Desktop |
| **Administrator — Priya, 30** | Configure wards, SLAs, users | Hardcoded rules | Desktop |

---

## 4A. Roles & Permissions (summary)

| Capability | Citizen | Worker | Supervisor | Officer | MRF | Admin |
| --- | --- | --- | --- | --- | --- | --- |
| Submit/track complaints | ✔ |  | view | view |  | view |
| Execute field tasks, evidence |  | ✔ | verify |  |  |  |
| Assign tasks, approve routes |  |  | ✔ (ward scope) | ✔ |  |  |
| City analytics, AI insights, reports |  |  | ward only | ✔ | facility only | ✔ |
| Digital Twin / What-If |  |  |  | ✔ |  | ✔ |
| Facility intake & recovery |  |  |  | view | ✔ | ✔ |
| Users, roles, SLA config, audit logs |  |  |  |  |  | ✔ |

Access is role-based and scoped (ward/zone/facility).

---

## 5. Scope & Release Plan

| Phase | Theme | Contents |
| --- | --- | --- |
| **MVP (P0)** | Core loop | Auth/RBAC; report waste; incident clustering; priority scoring; lifecycle + timeline; worker PWA with offline sync; evidence; live (simulated) tracking; SLA engine; supervisor dashboard; command centre KPIs; notifications (in-app/email); demo data; en/hi/te |
| **Release 2 (P1)** | Intelligence | Route optimization & replanning; overflow prediction; hotspots; anomaly alerts; missed-pickup intelligence; schedules; MRF module; segregation & cleanliness scores; eco-points |
| **Release 3 (P2)** | Differentiators | Digital Twin & What-If; demand/event forecast; cost & carbon; Emergency Mode; public dashboard; recurrence intelligence & interventions; QR/RFID adapters; PDF/CSV reports |

---

## 6. Functional Requirements

Priority: **P0** = must for MVP, **P1** = Release 2, **P2** = Release 3.

### 6.1 Identity & Access

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-ID-1 | Register/login with email/phone; hashed passwords; session/JWT | P0 |
| FR-ID-2 | RBAC with ward/zone/facility scoping; protected routes and APIs | P0 |
| FR-ID-3 | Audit log for logins, role changes, config changes, state changes | P0 |
| FR-ID-4 | Language selection (English, Hindi, Telugu) persisted per user | P0 |

### 6.2 Citizen Experience

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-CZ-1 | Home shows next collection, today's status, nearby bins, active complaints, nearest vehicle + ETA, cleanliness score, eco-points | P0 |
| FR-CZ-2 | "Report Waste Problem" flow: type → photo/video → GPS (adjustable) → category (13 listed) → description → submit | P0 |
| FR-CZ-3 | Optional AI suggestion (category, severity, dumping/overflow likelihood) with label "AI suggestion — verify before submission"; user may override | P1 |
| FR-CZ-4 | Duplicate notice: "Your report has been linked to an existing incident." | P0 |
| FR-CZ-5 | Complaint details: ID, status, department, SLA, expected response, dispatch status, evidence, resolution time, feedback; **no worker personal data** | P0 |
| FR-CZ-6 | Visual lifecycle timeline | P0 |
| FR-CZ-7 | Collection calendar; live vehicle tracking with ETA | P0/P1 |
| FR-CZ-8 | Rate service and give feedback after resolution; negative feedback can reopen | P0 |
| FR-CZ-9 | Notifications: received, assigned, dispatched, resolved, reminder, vehicle approaching, rescheduled | P0 |
| FR-CZ-10 | Recycling info, eco-points, badges, levels, monthly challenges, neighbourhood leaderboard, impact dashboard | P1 |

### 6.3 Incident & Complaint Management

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-IN-1 | Cluster reports within configurable radius/time window into one Incident; confidence increases with reports | P0 |
| FR-IN-2 | Dynamic priority (Low/Medium/High/Critical) from severity, location sensitivity (schools/hospitals), waste type, nearby reports, age, recurrence, volume, SLA; **citizens cannot set priority** | P0 |
| FR-IN-3 | Lifecycle: Submitted → Verification → Assigned → Accepted → En Route → Work Started → Evidence Uploaded → Supervisor Verified → Resolved → Feedback; invalid transitions rejected | P0 |
| FR-IN-4 | Every status change creates an audit event | P0 |
| FR-IN-5 | Supervisor can reassign, escalate, reopen, merge/split incidents | P0 |
| FR-IN-6 | Recurrence detection with history and recommended intervention (extra pickup, bin, route change, awareness campaign, enforcement, recycling drive) | P2 |

### 6.4 Worker / Driver (Offline-first PWA)

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-WK-1 | View shift, today's route, collection points; navigate to location | P0 |
| FR-WK-2 | Mark pickup completed/missed (with reason); record quantity and category/segregation breakdown | P0 |
| FR-WK-3 | Before/after photos with GPS, timestamp, worker/vehicle/task IDs | P0 |
| FR-WK-4 | Report vehicle problem, blocked road, overflowing bin | P0 |
| FR-WK-5 | Full offline operation; banner "N offline records waiting to sync"; automatic sync on reconnect; idempotent; conflicts surfaced, never silently lost | P0 |
| FR-WK-6 | Priority/emergency task push and route-update notice | P1 |
| FR-WK-7 | Safety Centre: SOS, accident/breakdown, hazardous warning, unsafe location, weather alert, long-shift alert, emergency contact, nearest safe facility | P0 (SOS) / P1 |

### 6.5 Supervisor

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-SV-1 | Live operations map; worker/task monitoring; attendance | P0 |
| FR-SV-2 | Assign tasks; verify evidence; approve/modify AI routes | P0/P1 |
| FR-SV-3 | Missed Pickup queue with alert (location, schedule, vehicle, worker, reason, SLA countdown, recommended action, nearest available vehicle) | P1 |
| FR-SV-4 | SLA monitor (running / at risk / breached / met); escalation | P0 |
| FR-SV-5 | Anomaly investigation; ward analytics | P1 |

### 6.6 Fleet, Routes & Scheduling

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-FL-1 | Live map: vehicle location, route, completed/pending stops, status (Available, On Route, Collecting, Delayed, Full, Maintenance, Offline), driver, capacity, ETA; simulated GPS when no real feed | P0 |
| FR-FL-2 | Schedule builder (recurring, holidays, emergency); calendar, list and map views; reschedule missed pickups | P1 |
| FR-FL-3 | Route optimization using capacity, quantities, priority complaints, fill levels, availability, depot, MRF; show original vs. optimized (distance, time, fuel, stops, utilization) | P1 |
| FR-FL-4 | Dynamic replanning: assess capacity/time, show **"Insert emergency stop"** with updated route | P1 |

### 6.7 Bins & Prediction

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-BN-1 | Bin registry, fill level (simulated or sensor-ready), fill-rate history | P0 |
| FR-BN-2 | "Predicted Overflow" with estimated time to 90%, interval, and auto-created priority task | P1 |
| FR-BN-3 | QR/RFID asset identifier on bins, households, vehicles | P2 |

### 6.8 Recycling & MRF

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-MR-1 | Record incoming waste (type, weight, source vehicle) | P1 |
| FR-MR-2 | Track flow: received → sorting → recyclables → organic processing → compost/bio-gas → reject → disposal | P1 |
| FR-MR-3 | KPIs: recovery %, contamination %, reject %, capacity utilization, daily/monthly trends | P1 |
| FR-MR-4 | Material Recovery Report (CSV/PDF) | P1/P2 |

### 6.9 Command Centre, Analytics & Intelligence

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-AN-1 | Command Centre KPIs: waste collected, today's collections, active vehicles, completed routes, missed pickups, open/critical complaints, recycling rate, segregation rate, hotspots, SLA compliance (all dynamic) | P0 |
| FR-AN-2 | Analytics suites (collection, complaints, fleet, recycling, citizen) with filters: date, ward, zone, waste type, vehicle, worker, category | P1 |
| FR-AN-3 | GIS map with toggleable layers (vehicles, bins, points, complaints, dumping, hotspots, wards, routes, MRF, transfer, disposal) and clustering; drill City → Zone → Ward → Area → Location → Incident | P0/P1 |
| FR-AN-4 | Hotspot detection incl. **Emerging Waste Hotspot** | P1 |
| FR-AN-5 | AI Insights panel: each insight has supporting metrics, confidence/uncertainty, recommended action, timestamp, **data-origin badge** | P1 |
| FR-AN-6 | Operations Alerts Centre: route deviation, GPS jump, long stops, repeated misses, complaint spikes, abnormal quantities, suspicious duplicates, attendance anomalies; with severity, explanation, action | P1 |
| FR-AN-7 | Cleanliness Score per ward with visible metric breakdown; Segregation Score | P1 |
| FR-AN-8 | Demand forecast: today, tomorrow, 7 days, 30 days | P2 |
| FR-AN-9 | Cost intelligence (fuel, operating, cost/tonne, cost/ward) and carbon impact with visible assumptions | P2 |

### 6.10 Differentiators

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-DX-1 | Digital Twin snapshot of bins, points, vehicles, routes, wards, facilities | P2 |
| FR-DX-2 | What-If Simulator: add/remove vehicles, change frequency/bins/routes/workforce → impact on distance, time, cost, coverage, missed pickups | P2 |
| FR-DX-3 | Event-based prediction (festival, concert, market, event, holiday) with temporary capacity recommendation | P2 |
| FR-DX-4 | Emergency Waste Mode: temporary zones, vehicles, bins, routes, priority schedules | P2 |

### 6.11 Notifications, Transparency & Administration

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-NT-1 | In-app + email notifications; web push; SMS-ready provider interface; templates managed by admin | P0/P1 |
| FR-NT-2 | Officer notifications: SLA breach, critical complaint, route failure, breakdown, predicted overflow, abnormal event | P1 |
| FR-PB-1 | Public dashboard with anonymized city/ward statistics; no personal data | P2 |
| FR-AD-1 | Admin CRUD: users, roles, wards, vehicles, bins, collection points, facilities, waste categories, schedules, SLA rules, settings; audit logs viewer | P0/P1 |
| FR-EX-1 | Search, sort, filter, pagination, CSV/PDF export on tables | P1 |

### 6.12 SLA Defaults (configurable)

| Type | Response target |
| --- | --- |
| Overflowing bin | 4 hours |
| Illegal dumping | 8 hours |
| Missed pickup | 12 hours |
| Critical hazardous waste | Emergency (admin-defined) |

---

## 7. AI & Data Requirements

| Rule | Requirement |
| --- | --- |
| Data honesty | Every metric, insight and prediction carries origin: **Real / Simulated / AI-Predicted**, visible in UI |
| No overclaiming | AI output is advisory; citizens verify image classification; officers confirm recommendations |
| Explainability | Scores (priority, overflow, cleanliness, SLA risk) show contributing factors |
| Fallback | If real data is unavailable, use simulator and label accordingly; do not fabricate real-world predictions |
| Evidence integrity | Image hash and metadata checks to detect reuse |
| Anti-gaming | Eco-points only for verified reports; caps and cool-downs on submissions |
| Demo data | Visakhapatnam: 20 wards, 200+ collection points, 100+ bins, 30 vehicles, 60 workers, 500+ households, 300+ complaints, multiple MRFs, history; clearly marked demo |

---

## 8. Non-Functional Requirements

| Area | Requirement |
| --- | --- |
| **Performance** | Dashboard load \< 3 s on broadband; map renders 10k+ points via clustering; live vehicle updates within \~5 s |
| **Scalability** | Supports 1M citizens, 1k vehicles, 10k bins in architecture (demo runs smaller) |
| **Availability** | 99.5% target; worker PWA fully functional offline |
| **Security** | Argon2/bcrypt hashing, RBAC, input validation, rate limiting, secure uploads (type/size checks), audit trail, privacy-aware handling |
| **Privacy** | No citizen PII on public views; worker identity hidden from citizens; location tracking of workers only during active shifts |
| **Accessibility** | WCAG 2.1 AA minimum, AAA where practical; keyboard, screen reader, contrast, focus, large targets, reduced motion, non-colour status cues, accessible charts |
| **Localization** | English, Hindi, Telugu; all text from translation files; extensible to more Indian languages |
| **Responsiveness** | Mobile (citizen, worker), tablet (supervisor), desktop (officer, MRF, admin) |
| **Reliability** | Idempotent sync; no data loss on connectivity drops |
| **Observability** | Structured logs, error tracking, health checks |
| **Compatibility** | Latest two versions of Chrome, Edge, Safari, Firefox; Android 8+ for the PWA |

---

## 9. Key User Flows (Acceptance-Level)

1. **Report → Resolution (Citizen):** submit report → receive ID → see timeline progress → view after-photo → rate. *Accept:* each status change appears within 10 s and an audit event exists.
2. **Duplicate:** two citizens report the same spot within the radius → one incident, both notified, one task.
3. **Worker offline:** lose connectivity → complete 5 stops with photos → reconnect → all synced once, no duplicates.
4. **Missed pickup:** vehicle skips a stop → alert created with SLA clock and nearest vehicle suggestion → supervisor reassigns.
5. **Emergency insert:** critical dumping 1.2 km from a vehicle → system evaluates capacity/time → supervisor accepts "Insert emergency stop" → worker route updates.
6. **Officer:** Command Centre → AI Insight → What-If → promote scenario to draft schedule.
7. **MRF:** incoming load recorded → processing outcomes entered → recovery report generated.

---

## 10. Dependencies & Integrations

- Map tiles/geocoding (OpenStreetMap-based or Mapbox).
- Optional image-classification API.
- Email provider (SMTP) and SMS gateway (provider-agnostic).
- Optional real GPS devices/telematics (adapter interface).
- Weather data source (optional; simulated fallback).

---

## 11. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Scope breadth | Phased releases; vertical slice first |
| Misleading AI outputs | Origin badges, confidence, "verify" prompts |
| Low field adoption | Simple offline-first UI, local-language support, supervisor training |
| Poor data quality | Validation, evidence checks, anomaly alerts |
| Worker surveillance concerns | Shift-only tracking; safety features that benefit workers; transparent policy |
| Complaint gaming | Priority is system-computed; rewards only for verified actions |
| Connectivity gaps | Offline queue and conflict policy |

---

## 12. Assumptions & Open Questions

**Assumptions:** demo uses simulated GPS/bin data; municipal SLA values are configurable defaults; ward boundaries are approximate demo polygons.

**Open questions**

1. Which real telematics/GPS vendors must be supported at pilot?
2. Official SLA and escalation matrix per municipality?
3. Data-retention period for photos and location history?
4. Is SMS/push mandatory in pilot, or email/in-app sufficient?
5. Who approves AI-generated route changes: supervisor only, or auto-approve below a threshold?
6. Is public dashboard release subject to municipal approval?

---

## 13. Deliverables Checklist

Product architecture • personas • user journeys • information architecture • design system (Figma/React) • 59-page structure • database schema • REST API • RBAC • full-stack implementation • GIS • route optimization • AI layer • real-time simulation • notifications • analytics • accessibility • responsive UI • demo data • tests • deployment config • README.