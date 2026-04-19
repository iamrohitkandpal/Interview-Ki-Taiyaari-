import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(DATA_DIR, 'bhisma.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ============================================
// SCHEMA INITIALIZATION
// ============================================
db.exec(`
    CREATE TABLE IF NOT EXISTS models (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        provider TEXT NOT NULL,
        apiKey TEXT DEFAULT '',
        endpoint TEXT DEFAULT '',
        modelId TEXT DEFAULT '',
        appType TEXT DEFAULT 'chatbot',
        status TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS test_results (
        id TEXT PRIMARY KEY,
        modelId TEXT,
        modelName TEXT,
        scanType TEXT DEFAULT 'manual',
        systemPrompt TEXT,
        totalAttacks INTEGER DEFAULT 0,
        passed INTEGER DEFAULT 0,
        failed INTEGER DEFAULT 0,
        riskScore INTEGER DEFAULT 0,
        riskLevel TEXT DEFAULT 'UNKNOWN',
        results TEXT DEFAULT '[]',
        createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS custom_attacks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT DEFAULT 'custom',
        severity TEXT DEFAULT 'medium',
        description TEXT DEFAULT '',
        prompt TEXT NOT NULL,
        source TEXT DEFAULT 'custom',
        autoScan INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS comparisons (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT DEFAULT '',
        testIds TEXT DEFAULT '[]',
        createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS active_defenses (
        defenseId TEXT PRIMARY KEY,
        config TEXT DEFAULT '{}',
        activatedAt TEXT DEFAULT (datetime('now'))
    );
`);

// ============================================
// PREPARED STATEMENTS (performance optimization)
// ============================================

// Models
const stmts = {
    models: {
        getAll: db.prepare('SELECT * FROM models ORDER BY createdAt DESC'),
        getById: db.prepare('SELECT * FROM models WHERE id = ?'),
        insert: db.prepare(`INSERT INTO models (id, name, provider, apiKey, endpoint, modelId, appType, status, createdAt)
                            VALUES (@id, @name, @provider, @apiKey, @endpoint, @modelId, @appType, @status, @createdAt)`),
        update: db.prepare('UPDATE models SET name = ?, apiKey = ?, endpoint = ?, modelId = ?, appType = ? WHERE id = ?'),
        updateStatus: db.prepare('UPDATE models SET status = ? WHERE id = ?'),
        delete: db.prepare('DELETE FROM models WHERE id = ?'),
    },
    testResults: {
        getAll: db.prepare('SELECT * FROM test_results ORDER BY createdAt DESC'),
        getById: db.prepare('SELECT * FROM test_results WHERE id = ?'),
        insert: db.prepare(`INSERT INTO test_results (id, modelId, modelName, scanType, systemPrompt, totalAttacks, passed, failed, riskScore, riskLevel, results, createdAt)
                            VALUES (@id, @modelId, @modelName, @scanType, @systemPrompt, @totalAttacks, @passed, @failed, @riskScore, @riskLevel, @results, @createdAt)`),
    },
    customAttacks: {
        getAll: db.prepare('SELECT * FROM custom_attacks ORDER BY createdAt DESC'),
        insert: db.prepare(`INSERT INTO custom_attacks (id, name, category, severity, description, prompt, source, autoScan, createdAt)
                            VALUES (@id, @name, @category, @severity, @description, @prompt, @source, @autoScan, @createdAt)`),
        delete: db.prepare('DELETE FROM custom_attacks WHERE id = ?'),
    },
    comparisons: {
        getAll: db.prepare('SELECT * FROM comparisons ORDER BY createdAt DESC'),
        getById: db.prepare('SELECT * FROM comparisons WHERE id = ?'),
        insert: db.prepare(`INSERT INTO comparisons (id, name, description, testIds, createdAt)
                            VALUES (@id, @name, @description, @testIds, @createdAt)`),
    },
    defenses: {
        getAll: db.prepare('SELECT * FROM active_defenses'),
        get: db.prepare('SELECT * FROM active_defenses WHERE defenseId = ?'),
        upsert: db.prepare(`INSERT OR REPLACE INTO active_defenses (defenseId, config, activatedAt)
                            VALUES (@defenseId, @config, @activatedAt)`),
        delete: db.prepare('DELETE FROM active_defenses WHERE defenseId = ?'),
    },
};

export { db, stmts };
export default db;
