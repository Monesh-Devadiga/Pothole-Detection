const express = require('express');
const repository = require('../db/repository');
const alertService = require('../services/alertService');

const router = express.Router();

router.get('/', (req, res) => {
  const alerts = repository.listAlerts(100);
  res.json({ alerts });
});

router.get('/stream', (req, res) => {
  alertService.registerClient(res);
});

router.post('/', (req, res, next) => {
  try {
    const alert = alertService.dispatch({
      detectionId: req.body.detectionId,
      reportId: req.body.reportId,
      channel: req.body.channel,
      recipient: req.body.recipient,
      message: req.body.message,
      status: 'sent',
    });

    res.status(201).json({ alert });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
