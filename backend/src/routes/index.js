const express = require('express');
const detectionsRouter = require('./detections');
const reportsRouter = require('./reports');
const alertsRouter = require('./alerts');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/detections', detectionsRouter);
router.use('/reports', reportsRouter);
router.use('/alerts', alertsRouter);

module.exports = router;
