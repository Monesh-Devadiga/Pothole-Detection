const express = require('express');
const repository = require('../db/repository');
const alertService = require('../services/alertService');

const router = express.Router();

router.get('/', (req, res) => {
  const reports = repository.listReports(200);
  res.json({ reports });
});

router.post('/', (req, res, next) => {
  try {
    const record = repository.createReport({
      reporter_name: req.body.name,
      contact: req.body.contact,
      location_lat: req.body.location?.lat,
      location_lng: req.body.location?.lng,
      address: req.body.address,
      description: req.body.description,
      image_url: req.body.imageUrl,
    });

    alertService.dispatch({
      reportId: record.id,
      channel: 'authority_dashboard',
      recipient: 'city-field-team',
      message: `Citizen report ${record.id}: ${record.description || 'New pothole report'}`,
      status: 'queued',
    });

    res.status(201).json({ report: record });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
