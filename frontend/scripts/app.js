const API_BASE = (window.API_BASE_URL || 'http://localhost:4000') + '/api';

const detectionForm = document.getElementById('detectionForm');
const detectionResult = document.getElementById('detectionResult');
const reportForm = document.getElementById('reportForm');
const reportStatus = document.getElementById('reportStatus');
const alertFeed = document.getElementById('alertFeed');
const reportFeed = document.getElementById('reportFeed');
const criticalCount = document.getElementById('criticalCount');
const objectivesBtn = document.getElementById('scrollToObjectives');

document.addEventListener('DOMContentLoaded', () => {
  objectivesBtn?.addEventListener('click', () => {
    document.getElementById('objectives').scrollIntoView({ behavior: 'smooth' });
  });

  bindDetectionForm();
  bindReportForm();
  hydrateFeeds();
  initAlertStream();
});

let lastPreviewUrl;

function bindDetectionForm() {
  detectionForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fileInput = detectionForm.querySelector('input[name="image"]');
    const imageFile = fileInput?.files?.[0];
    if (!imageFile) {
      detectionResult.textContent = 'Please attach a road photo first.';
      return;
    }

    detectionResult.textContent = 'Running inference...';
    const formData = new FormData(detectionForm);

    try {
      const response = await fetch(`${API_BASE}/detections/analyze`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Detection failed');
      const payload = await response.json();
      renderDetection(payload, imageFile);
    } catch (error) {
      detectionResult.textContent = error.message;
    }
  });
}

function renderDetection({ detection, result }, imageFile) {
  const confidencePct = result?.confidencePercentage ?? Math.round((result?.confidence || 0) * 100);
  const depthValue = Math.max(0, Number(result?.depthCm ?? 0));
  const severityLabel = result?.severityLabel || result?.severity;
  const statsHtml = `
    <strong>Severity:</strong> ${severityLabel}<br>
    <strong>Confidence:</strong> ${confidencePct}%<br>
    <strong>Surface area:</strong> ${result?.surfaceAreaCm} cm²<br>
    <strong>Depth:</strong> ${depthValue} cm<br>
  `;

  detectionResult.innerHTML = `
    ${statsHtml}
    <div class="detection-visual">
      <canvas id="detectionCanvas" aria-label="Detected pothole preview"></canvas>
      <p class="visual-caption">Review the uploaded frame for confirmation.</p>
    </div>
  `;

  paintDetectionPreview(imageFile);
}

function paintDetectionPreview(imageFile) {
  if (!imageFile) return;
  const canvas = document.getElementById('detectionCanvas');
  if (!canvas) return;

  if (lastPreviewUrl) {
    URL.revokeObjectURL(lastPreviewUrl);
  }
  lastPreviewUrl = URL.createObjectURL(imageFile);

  const ctx = canvas.getContext('2d');
  const image = new Image();
  image.onload = () => {
    const scaleFactor = Math.min(600 / image.width, 400 / image.height, 1);
    const drawWidth = Math.floor(image.width * scaleFactor);
    const drawHeight = Math.floor(image.height * scaleFactor);
    canvas.width = drawWidth;
    canvas.height = drawHeight;
    ctx.drawImage(image, 0, 0, drawWidth, drawHeight);
  };
  image.src = lastPreviewUrl;
}

function bindReportForm() {
  reportForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    reportStatus.textContent = 'Submitting report...';
    const data = Object.fromEntries(new FormData(reportForm));
    const body = {
      name: data.name,
      contact: data.contact,
      address: data.address,
      description: data.description,
      imageUrl: data.imageUrl || undefined,
      location: {
        lat: data.lat ? Number(data.lat) : undefined,
        lng: data.lng ? Number(data.lng) : undefined,
      },
    };

    try {
      const response = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Unable to send report');
      const payload = await response.json();
      reportStatus.textContent = `Report ${payload.report.id} queued for maintenance`;
      reportForm.reset();
      hydrateFeeds();
    } catch (error) {
      reportStatus.textContent = error.message;
    }
  });
}

async function hydrateFeeds() {
  try {
    const [alertsRes, reportsRes] = await Promise.all([
      fetch(`${API_BASE}/alerts`),
      fetch(`${API_BASE}/reports`),
    ]);
    const alertsJson = await alertsRes.json();
    const reportsJson = await reportsRes.json();
    renderAlerts(alertsJson.alerts || []);
    renderReports(reportsJson.reports || []);
  } catch (error) {
    console.warn('Unable to hydrate feeds', error);
  }
}

function renderAlerts(alerts) {
  alertFeed.innerHTML = '';
  alerts.slice(0, 5).forEach((alert) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${alert.channel}</strong>: ${alert.message}<br><span>${alert.created_at}</span>`;
    alertFeed.appendChild(li);
  });
  criticalCount.textContent = alerts.filter((alert) => alert.message?.toLowerCase().includes('critical')).length;
}

function renderReports(reports) {
  reportFeed.innerHTML = '';
  reports.slice(0, 5).forEach((report) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${report.address || 'Unknown location'}</strong><br>${report.description}`;
    reportFeed.appendChild(li);
  });
}

function initAlertStream() {
  const source = new EventSource(`${API_BASE}/alerts/stream`);
  source.onmessage = (event) => {
    const alert = JSON.parse(event.data);
    const li = document.createElement('li');
    li.innerHTML = `<strong>${alert.channel}</strong>: ${alert.message}<br><span>${alert.created_at}</span>`;
    alertFeed.prepend(li);
    criticalCount.textContent = Number(criticalCount.textContent || 0) + 1;
  };
  source.onerror = () => source.close();
}
