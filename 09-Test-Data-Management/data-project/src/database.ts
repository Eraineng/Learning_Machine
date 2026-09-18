// A small store used to demonstrate seeding and cleanup strategies.
import { DatabaseSync } from 'node:sqlite';
import type { User } from './types';

export function createDb() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, first_name TEXT, last_name TEXT,
      phone TEXT, plan TEXT, active INTEGER, created_at TEXT
    );
    CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, status TEXT, total REAL);
  `);
  return db;
}

export function insertUser(db: DatabaseSync, user: User) {
  db.prepare(
    'INSERT INTO users (id, email, first_name, last_name, phone, plan, active, created_at) VALUES (?,?,?,?,?,?,?,?)',
  ).run(user.id, user.email, user.firstName, user.lastName, user.phone, user.plan, user.active ? 1 : 0, user.createdAt);
  return user;
}

export function countUsers(db: DatabaseSync): number {
  return (db.prepare('SELECT COUNT(*) AS c FROM users').get() as any).c;
}

/** Cleanup strategy 1: delete everything (fast, simple, not parallel-safe). */
export function truncateAll(db: DatabaseSync) {
  db.exec('DELETE FROM orders; DELETE FROM users;');
}

/** Cleanup strategy 2: track what a test created and remove exactly that. */
export class DataTracker {
  private createdUserIds: number[] = [];

  track(user: User) {
    this.createdUserIds.push(user.id);
    return user;
  }

  cleanup(db: DatabaseSync) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    for (const id of this.createdUserIds) stmt.run(id);
    this.createdUserIds = [];
  }
}
