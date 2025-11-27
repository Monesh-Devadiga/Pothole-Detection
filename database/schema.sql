PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS detections (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    location_lat REAL,
    location_lng REAL,
    severity TEXT CHECK( severity IN ('low','medium','high') ) DEFAULT 'low',
    confidence REAL DEFAULT 0,
    description TEXT,
    image_path TEXT,
    meta JSON,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    reporter_name TEXT,
    contact TEXT,
    location_lat REAL,
    location_lng REAL,
    address TEXT,
    status TEXT DEFAULT 'pending',
    description TEXT,
    image_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    detection_id TEXT,
    report_id TEXT,
    channel TEXT NOT NULL,
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'queued',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (detection_id) REFERENCES detections(id),
    FOREIGN KEY (report_id) REFERENCES reports(id)
);

CREATE TABLE IF NOT EXISTS telemetry (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT,
    location_lat REAL,
    location_lng REAL,
    road_condition TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
