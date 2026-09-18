const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../crm.sqlite');
const db = new sqlite3.Database(dbPath);

// Promisified query helper functions
const dbAsync = {
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
};

const initDatabase = async () => {
  try {
    // Enable foreign keys
    await dbAsync.run(`PRAGMA foreign_keys = ON;`);

    // Users table
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Leads table
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        source TEXT DEFAULT 'Website',
        status TEXT CHECK(status IN ('NEW', 'CONTACTED', 'IN_PROGRESS', 'CONVERTED', 'LOST')) DEFAULT 'NEW',
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Lead Activities & Follow-up Notes table
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS lead_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER NOT NULL,
        activity_type TEXT CHECK(activity_type IN ('CREATED', 'STATUS_CHANGE', 'NOTE_ADDED', 'DETAILS_UPDATED')) NOT NULL,
        description TEXT NOT NULL,
        created_by TEXT DEFAULT 'System',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE
      );
    `);

    console.log('✅ SQLite Database initialized successfully.');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
};

module.exports = { db, dbAsync, initDatabase };
