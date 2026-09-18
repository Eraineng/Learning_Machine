// Data access layer: the only code that writes SQL.
import type { Db } from './db';

export interface Task {
  id: number;
  title: string;
  done: boolean;
  assignee: string | null;
  createdAt: string;
}

interface TaskRow {
  id: number;
  title: string;
  done: number;
  assignee: string | null;
  created_at: string;
}

const toTask = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  done: row.done === 1,
  assignee: row.assignee,
  createdAt: row.created_at,
});

export class TaskRepository {
  constructor(private db: Db) {}

  create(title: string, assignee: string | null = null): Task {
    const result = this.db
      .prepare('INSERT INTO tasks (title, assignee) VALUES (?, ?)')
      .run(title, assignee);
    return this.findById(Number(result.lastInsertRowid))!;
  }

  findById(id: number): Task | undefined {
    const row = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
    return row ? toTask(row) : undefined;
  }

  list(filter: { done?: boolean } = {}): Task[] {
    const rows =
      filter.done === undefined
        ? this.db.prepare('SELECT * FROM tasks ORDER BY id').all()
        : this.db.prepare('SELECT * FROM tasks WHERE done = ? ORDER BY id').all(filter.done ? 1 : 0);
    return (rows as unknown as TaskRow[]).map(toTask);
  }

  update(id: number, changes: { title?: string; done?: boolean }): Task | undefined {
    const current = this.findById(id);
    if (!current) return undefined;
    this.db
      .prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?')
      .run(changes.title ?? current.title, (changes.done ?? current.done) ? 1 : 0, id);
    return this.findById(id);
  }

  delete(id: number): boolean {
    return this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id).changes > 0;
  }

  deleteAll(): void {
    this.db.exec('DELETE FROM tasks');
  }
}
