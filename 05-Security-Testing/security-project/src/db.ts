import { DatabaseSync } from 'node:sqlite';
import { scryptSync, randomBytes } from 'node:crypto';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 32).toString('hex')}`;
}

export function createDb() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,        -- ❌ plain text, used by the VULNERABLE app
      password_hash TEXT NOT NULL,   -- ✅ salted scrypt hash, used by the SECURE app
      role TEXT NOT NULL DEFAULT 'user'
    );
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item TEXT NOT NULL,
      total REAL NOT NULL
    );
  `);

  const addUser = db.prepare('INSERT INTO users (username, password, password_hash, role) VALUES (?, ?, ?, ?)');
  addUser.run('alice', 'alice123', hashPassword('alice123'), 'user'); // id 1
  addUser.run('bob', 'bob123', hashPassword('bob123'), 'user'); // id 2
  addUser.run('admin', 'Adm1n!Secret', hashPassword('Adm1n!Secret'), 'admin'); // id 3

  const addOrder = db.prepare('INSERT INTO orders (user_id, item, total) VALUES (?, ?, ?)');
  addOrder.run(1, 'Alice laptop', 1200); // order 1 → alice
  addOrder.run(2, 'Bob headphones', 199); // order 2 → bob

  return db;
}
