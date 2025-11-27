INSERT INTO detections (id, source, location_lat, location_lng, severity, confidence, description, image_path, meta)
VALUES
    ('det-001', 'drone', 12.9716, 77.5946, 'high', 0.94, 'Deep pothole near signal', 'samples/det-001.jpg', '{"lane":"2","width_cm":45}');

INSERT INTO reports (id, reporter_name, contact, location_lat, location_lng, address, status, description)
VALUES
    ('rep-001', 'Aditi Rao', 'aditi@example.com', 12.975, 77.6001, 'MG Road, Bengaluru', 'acknowledged', 'Water-filled pothole causing backups');

INSERT INTO alerts (id, detection_id, channel, recipient, message, status)
VALUES
    ('alt-001', 'det-001', 'authority_email', 'bbmp@city.gov', 'Critical pothole detected at MG Road. Severity: high', 'sent');
