import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { AuditReport, UrlReport } from './scanner.js';

export type StoredReport = AuditReport | UrlReport;

export class ReportStore {
  private db: DatabaseSync;
  constructor(path: string) {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
    const version = this.db.prepare('PRAGMA user_version').get() as { user_version: number };
    if (version.user_version > 1) { this.db.close(); throw new Error('The database schema is newer than this application.'); }
    if (version.user_version === 0) this.db.exec(`
      BEGIN;
      CREATE TABLE scans (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, target TEXT NOT NULL,
        violations INTEGER NOT NULL, affected_nodes INTEGER NOT NULL, needs_review INTEGER NOT NULL,
        report_json TEXT NOT NULL CHECK(json_valid(report_json)));
      CREATE INDEX scans_created ON scans(created_at DESC, id DESC);
      PRAGMA user_version = 1;
      COMMIT;
    `);
  }
  save(report: StoredReport) {
    this.db.prepare('INSERT INTO scans VALUES (?, ?, ?, ?, ?, ?, ?)').run(report.id, report.createdAt,
      report.target, report.summary.violationRules, report.summary.affectedNodes, report.summary.needsReview, JSON.stringify(report));
  }
  list(limit = 20, offset = 0) {
    const items = this.db.prepare(`SELECT id, created_at AS createdAt, target, violations,
      affected_nodes AS affectedNodes, needs_review AS needsReview FROM scans ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`).all(limit, offset);
    const count = this.db.prepare('SELECT COUNT(*) AS count FROM scans').get() as { count: number };
    return { items, total: count.count, limit, offset };
  }
  get(id: string): StoredReport | null {
    const row = this.db.prepare('SELECT report_json FROM scans WHERE id = ?').get(id) as { report_json: string } | undefined;
    return row ? JSON.parse(row.report_json) : null;
  }
  close() { this.db.close(); }
}
