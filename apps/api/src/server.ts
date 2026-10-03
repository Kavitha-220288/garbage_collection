import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbStore } from './services/db-store';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// 1. GET /api/incidents - List incidents with optional Ward & Status filters
app.get('/api/incidents', (req: Request, res: Response) => {
  const { ward, status } = req.query;
  let incidents = dbStore.getIncidents();

  if (ward && typeof ward === 'string') {
    incidents = incidents.filter((i) => i.wardName.toLowerCase().includes(ward.toLowerCase()));
  }

  if (status && typeof status === 'string') {
    incidents = incidents.filter((i) => i.status === status);
  }

  res.json({
    success: true,
    count: incidents.length,
    incidents,
  });
});

// 2. POST /api/incidents - Create new incident report with AI classification & PostGIS lookup
app.post('/api/incidents', (req: Request, res: Response) => {
  try {
    const { category, address, wardName, latitude, longitude, rawText, photoUrl } = req.body;

    const report = dbStore.createReport({
      category: category || 'OVERFLOWING_BIN',
      address: address || 'MVP Colony Market, Ward 2',
      wardName: wardName || 'Ward 2 (MVP Colony)',
      latitude: latitude || 17.7121,
      longitude: longitude || 83.3012,
      rawText: rawText || 'Overflowing bin reported',
      photoUrl: photoUrl || null,
      origin: 'REAL',
    });

    res.status(201).json({
      success: true,
      message: 'Incident report created & classified by AI successfully.',
      report,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3. PATCH /api/incidents/:id/status - Lifecycle state machine transition (WORK_STARTED -> EVIDENCE_UPLOADED -> RESOLVED)
app.patch('/api/incidents/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, actorName, actorRole, afterPhotoUrl, afterPhotoHash } = req.body;

    const updatedIncident = dbStore.transitionStatus(id, status, {
      actorName: actorName || 'System Worker',
      actorRole: actorRole || 'Driver PWA',
      afterPhotoUrl,
      afterPhotoHash,
    });

    res.json({
      success: true,
      message: `Incident ${id} transitioned to state ${status}`,
      incident: updatedIncident,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 4. POST /api/incidents/:id/feedback - Submit Citizen Rating (1 to 5 Stars)
app.post('/api/incidents/:id/feedback', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score, comment } = req.body;

    const result = dbStore.recordFeedback(id, Number(score), comment);

    res.json({
      success: true,
      message: 'Thank you for rating Swachh Setu sanitation work!',
      feedback: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Start Express API Server
app.listen(PORT, () => {
  console.log(`🚀 Swachh Setu Backend API running on http://localhost:${PORT}`);
});
