const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const projectRoot = path.resolve(__dirname, '../../../');
const dbPath = path.join(projectRoot, 'database', 'pothole.db');
const schemaPath = path.join(projectRoot, 'database', 'schema.sql');
const seedPath = path.join(projectRoot, 'database', 'sample_data.sql');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);

if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
}

try {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM detections').get();
  if (count === 0 && fs.existsSync(seedPath)) {
    db.exec(fs.readFileSync(seedPath, 'utf-8'));
  }
} catch (error) {
  console.warn('Database initialization warning:', error.message);
}

module.exports = db;
