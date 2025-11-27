require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'PotVision API',
    objectives: [
      'Generate detailed pothole reports and send real-time alerts',
      'Enable public manual reporting for coverage completeness',
      'Alert drivers to upcoming potholes and support planning data',
    ],
    docs: '/api/health',
  });
});

app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.BACKEND_PORT || process.env.PORT || 4000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
