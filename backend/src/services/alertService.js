const EventEmitter = require('events');
const repository = require('../db/repository');

class AlertService extends EventEmitter {
  constructor() {
    super();
    this.clients = new Set();
  }

  registerClient(res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('\n');
    this.clients.add(res);
    res.on('close', () => this.clients.delete(res));
  }

  dispatch(payload) {
    const alert = repository.createAlert({
      detection_id: payload.detectionId,
      report_id: payload.reportId,
      channel: payload.channel || 'authority_email',
      recipient: payload.recipient || 'ops-center@city.gov',
      message: payload.message,
      status: payload.status || 'sent',
    });

    this.emit('alert', alert);
    this.broadcast(alert);
    return alert;
  }

  broadcast(alert) {
    const data = `data: ${JSON.stringify(alert)}\n\n`;
    this.clients.forEach((res) => res.write(data));
  }
}

module.exports = new AlertService();
