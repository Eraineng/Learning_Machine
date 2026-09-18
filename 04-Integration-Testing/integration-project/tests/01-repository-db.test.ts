// Integration: our repository code + a REAL SQLite database (no mocks)
import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '../src/db';
import { TaskRepository } from '../src/taskRepository';

describe('TaskRepository ↔ SQLite', () => {
  let repo: TaskRepository;

  beforeEach(() => {
    // Fresh in-memory database for every test → perfect isolation
    repo = new TaskRepository(createDb(':memory:'));
  });

  it('creates a task and reads it back from the database', () => {
    const created = repo.create('Write integration tests', 'ann');

    expect(created).toEqual({
      id: expect.any(Number),
      title: 'Write integration tests',
      done: false, // DB stores 0 → mapped to boolean false
      assignee: 'ann',
      createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
    });
    expect(repo.findById(created.id)).toEqual(created);
  });

  it('auto-increments ids', () => {
    const a = repo.create('A');
    const b = repo.create('B');
    expect(b.id).toBe(a.id + 1);
  });

  it('filters by done status', () => {
    const a = repo.create('A');
    repo.create('B');
    repo.update(a.id, { done: true });

    expect(repo.list({ done: true }).map((t) => t.title)).toEqual(['A']);
    expect(repo.list({ done: false }).map((t) => t.title)).toEqual(['B']);
    expect(repo.list()).toHaveLength(2);
  });

  it('partial update keeps other fields', () => {
    const task = repo.create('Old title', 'bob');
    const updated = repo.update(task.id, { done: true });

    expect(updated).toMatchObject({ title: 'Old title', done: true, assignee: 'bob' });
  });

  it('delete returns false for a missing row', () => {
    expect(repo.delete(12345)).toBe(false);
  });

  it('stores special characters safely (parameterized SQL)', () => {
    const nasty = `Robert'); DROP TABLE tasks;-- 😀 "quotes" 日本語`;
    const task = repo.create(nasty);

    expect(repo.findById(task.id)!.title).toBe(nasty);
    expect(repo.list()).toHaveLength(1); // table still exists!
  });

  it('database enforces NOT NULL on title', () => {
    // Bypass our code to prove the DB constraint itself works
    const db = createDb();
    expect(() => db.prepare('INSERT INTO tasks (title) VALUES (NULL)').run()).toThrow(/NOT NULL/);
  });
});
