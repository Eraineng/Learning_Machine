// Real SQLite database (built into Node 22+). ':memory:' = lives only while the process runs.
import { DatabaseSync } from 'node:sqlite';

export type Db = DatabaseSync;

export function createDb(filename = ':memory:'): Db {
  const db = new DatabaseSync(filename);
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      done        INTEGER NOT NULL DEFAULT 0,
      assignee    TEXT,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}
