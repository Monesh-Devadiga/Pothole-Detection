<<<<<<< HEAD
# PotVision

PotVision is a deep-learning inspired pothole detection stack that fuses AI-driven analytics, public reporting, and proactive driver alerts. The system fulfils three key objectives:

1. Generate detailed pothole reports and push real-time alerts to relevant authorities.
2. Provide a public-facing portal to manually report undetected potholes.
3. Alert drivers to upcoming potholes to cut accidents and improve traffic flow while harvesting planning data.

## Project Layout

```
backend/   Node.js + Express API. Hosts detection, reporting, alerts, telemetry and SSE stream.
frontend/  Static site that calls the API for AI detections, manual reports, and alert feeds.
database/  SQLite schema + optional seed data. Runtime DB file is created automatically.
```

## Backend

```
cd backend
cp .env.example .env   # optional overrides
npm install             # already done once
npm run start           # or npm run dev for hot reload
```

The API exposes:
- POST /api/detections/analyze - upload an image for deep-learning inference, auto-alerts on high severity.
- POST /api/reports - citizen-reported potholes (objective 2).
- GET /api/alerts and GET /api/alerts/stream - historical plus real-time alerting for authorities/drivers (objective 3).
- Supporting endpoints for detections, reports, and telemetry ingestion.

## Frontend

Serve the static files however you prefer (e.g. VS Code Live Server, `npx serve frontend`). Open `frontend/index.html` in a browser; update `window.API_BASE_URL` if the backend runs on a different host/port.

Features:
- Objectives hero detailing the program.
- AI detection form - uploads image to backend and displays severity, bounding boxes, and stats.
- Manual reporting form - pushes structured data to /api/reports.
- Live alerts plus recent reports feed driven by the REST API and SSE stream.

## Database

- Schema lives in `database/schema.sql` and is auto-applied by the backend.
- Optional starter records in `database/sample_data.sql`.
- Runtime SQLite file `database/pothole.db` is created on first boot.

## Next Steps

- Replace the simulated detectorService with a TensorFlow/Torch inference module.
- Connect alertService to SMS/email gateways.
- Add authentication for authority dashboards and citizen report follow-up.
=======
# Pothole-Detection
To detect pothole and send alert.
>>>>>>> ae8aed7af05f9a382b3dde29527889c6016364d0
