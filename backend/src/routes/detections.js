const express = require('express');
const multer = require('multer');
const detectorService = require('../services/detectorService');
const repository = require('../db/repository');
const alertService = require('../services/alertService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

router.get('/', (req, res) => {
  const detections = repository.listDetections(100);
  res.json({ detections });
});

router.post('/analyze', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'image field is required' });
    }

    const meta = {
      lat: req.body.lat ? parseFloat(req.body.lat) : undefined,
      lng: req.body.lng ? parseFloat(req.body.lng) : undefined,
    };

    const result = await detectorService.analyzeImage(req.file.buffer, meta);

    const detectionRecord = repository.createDetection({
      source: req.body.source || 'edge-camera',
      location_lat: meta.lat || null,
      location_lng: meta.lng || null,
      severity: result.severity,
      confidence: result.confidence,
      description: req.body.description || 'AI-detected pothole',
      image_path: req.file.originalname,
      meta: {
        boundingBoxes: result.boundingBoxes,
        surfaceAreaCm: result.surfaceAreaCm,
        modelVersion: result.modelVersion,
        inferenceTimeMs: result.inferenceTimeMs,
      },
    });

    if (result.severity === 'high') {
      alertService.dispatch({
        detectionId: detectionRecord.id,
        channel: 'authority_email',
        recipient: 'roads-response@city.gov',
        message: `Critical pothole detected near (${detectionRecord.location_lat}, ${detectionRecord.location_lng}).`,
      });
    }

    res.status(201).json({ detection: detectionRecord, result });
  } catch (error) {
    next(error);
  }
});

router.post('/telemetry', (req, res, next) => {
  try {
    const payload = repository.logTelemetry({
      vehicle_id: req.body.vehicleId,
      location_lat: req.body.location?.lat,
      location_lng: req.body.location?.lng,
      road_condition: req.body.roadCondition,
    });

    res.status(201).json({ telemetry: payload });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
