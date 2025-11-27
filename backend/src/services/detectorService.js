const crypto = require('crypto');

class DetectorService {
  constructor() {
    this.confidenceFloor = 0.5;
  }

  async analyzeImage(buffer, metadata = {}) {
    if (!buffer || buffer.length === 0) {
      throw new Error('Image buffer is empty');
    }

    const digest = crypto.createHash('sha1').update(buffer).digest('hex');
    const pseudoScore = parseInt(digest.slice(0, 8), 16);
    const confidence = this._normalize((pseudoScore % 100) / 100);
    const confidencePercentage = Math.round(confidence * 100);
    const severityLabel = confidencePercentage >= 50 ? 'high risk' : 'low risk';
    const severity = severityLabel === 'high risk' ? 'high' : 'low';

    const depthCm = this._normalizeDepth(5 + ((pseudoScore >> 4) % 16));

    const response = {
      severity,
      severityLabel,
      confidence,
      confidencePercentage,
      boundingBoxes: this._generateBoxes(pseudoScore),
      surfaceAreaCm: 20 + (pseudoScore % 50),
      widthCm: 30 + ((pseudoScore >> 3) % 30),
      depthCm,
      centroid: {
        lat: metadata.lat || metadata.location_lat || null,
        lng: metadata.lng || metadata.location_lng || null,
      },
      modelVersion: 'dl-pothole-net-v1',
      inferenceTimeMs: 210 + (pseudoScore % 50),
    };

    return response;
  }

  _normalize(value) {
    const normalized = Math.min(1, Math.max(this.confidenceFloor, value));
    return Number(normalized.toFixed(2));
  }

  _normalizeDepth(value) {
    const safeValue = Math.min(20, Math.max(5, value));
    return Number(safeValue.toFixed(1));
  }

  _generateBoxes(seed) {
    const base = (seed % 3) + 1;
    return Array.from({ length: base }).map((_, index) => ({
      id: `bbox-${index + 1}`,
      x: (seed >> (index + 1)) % 200,
      y: (seed >> (index + 2)) % 200,
      width: 40 + ((seed >> (index + 3)) % 60),
      height: 30 + ((seed >> (index + 4)) % 50),
    }));
  }
}

module.exports = new DetectorService();
