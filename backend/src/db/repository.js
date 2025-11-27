const { v4: uuid } = require('uuid');
const db = require('./connection');

const detectionInsert = db.prepare(`
  INSERT INTO detections (id, source, location_lat, location_lng, severity, confidence, description, image_path, meta)
  VALUES (@id, @source, @location_lat, @location_lng, @severity, @confidence, @description, @image_path, @meta)
`);

const reportInsert = db.prepare(`
  INSERT INTO reports (id, reporter_name, contact, location_lat, location_lng, address, status, description, image_url)
  VALUES (@id, @reporter_name, @contact, @location_lat, @location_lng, @address, @status, @description, @image_url)
`);

const alertInsert = db.prepare(`
  INSERT INTO alerts (id, detection_id, report_id, channel, recipient, message, status)
  VALUES (@id, @detection_id, @report_id, @channel, @recipient, @message, @status)
`);

const telemetryInsert = db.prepare(`
  INSERT INTO telemetry (id, vehicle_id, location_lat, location_lng, road_condition)
  VALUES (@id, @vehicle_id, @location_lat, @location_lng, @road_condition)
`);

module.exports = {
  createDetection(payload) {
    const record = {
      id: payload.id || `det-${uuid()}`,
      source: payload.source,
      location_lat: payload.location_lat,
      location_lng: payload.location_lng,
      severity: payload.severity,
      confidence: payload.confidence,
      description: payload.description,
      image_path: payload.image_path,
      meta: JSON.stringify(payload.meta || {}),
    };
    detectionInsert.run(record);
    return record;
  },
  listDetections(limit = 50) {
    return db.prepare(`
      SELECT * FROM detections ORDER BY datetime(created_at) DESC LIMIT ?
    `).all(limit);
  },
  getDetectionById(id) {
    return db.prepare('SELECT * FROM detections WHERE id = ?').get(id);
  },
  createReport(payload) {
    const record = {
      id: payload.id || `rep-${uuid()}`,
      reporter_name: payload.reporter_name,
      contact: payload.contact,
      location_lat: payload.location_lat,
      location_lng: payload.location_lng,
      address: payload.address,
      status: payload.status || 'pending',
      description: payload.description,
      image_url: payload.image_url,
    };
    reportInsert.run(record);
    return record;
  },
  listReports(limit = 100) {
    return db.prepare('SELECT * FROM reports ORDER BY datetime(created_at) DESC LIMIT ?').all(limit);
  },
  createAlert(payload) {
    const record = {
      id: payload.id || `alt-${uuid()}`,
      detection_id: payload.detection_id || null,
      report_id: payload.report_id || null,
      channel: payload.channel,
      recipient: payload.recipient,
      message: payload.message,
      status: payload.status || 'queued',
    };
    alertInsert.run(record);
    return record;
  },
  listAlerts(limit = 50) {
    return db.prepare('SELECT * FROM alerts ORDER BY datetime(created_at) DESC LIMIT ?').all(limit);
  },
  logTelemetry(payload) {
    const record = {
      id: payload.id || `tel-${uuid()}`,
      vehicle_id: payload.vehicle_id,
      location_lat: payload.location_lat,
      location_lng: payload.location_lng,
      road_condition: payload.road_condition,
    };
    telemetryInsert.run(record);
    return record;
  },
};
