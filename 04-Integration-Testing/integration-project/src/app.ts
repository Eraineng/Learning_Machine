// HTTP layer: routes → validation → repository → (notifier)
import express from 'express';
import { TaskRepository } from './taskRepository';
import type { Notifier } from './notifier';

export function createApp(deps: { repo: TaskRepository; notifier: Notifier }) {
  const { repo, notifier } = deps;
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/tasks', (req, res) => {
    const done = req.query.done === undefined ? undefined : req.query.done === 'true';
    res.json(repo.list({ done }));
  });

  app.post('/tasks', (req, res) => {
    const { title, assignee } = req.body ?? {};
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title is required' });
    }
    if (title.length > 100) {
      return res.status(400).json({ error: 'title must be at most 100 characters' });
    }
    const task = repo.create(title.trim(), assignee ?? null);
    res.status(201).location(`/tasks/${task.id}`).json(task);
  });

  app.get('/tasks/:id', (req, res) => {
    const task = repo.findById(Number(req.params.id));
    if (!task) return res.status(404).json({ error: 'task not found' });
    res.json(task);
  });

  app.patch('/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);
    const before = repo.findById(id);
    if (!before) return res.status(404).json({ error: 'task not found' });

    const task = repo.update(id, { title: req.body.title, done: req.body.done })!;

    let notified: boolean | undefined;
    if (!before.done && task.done) {
      notified = await notifier.taskCompleted(task);
    }
    res.json({ ...task, notified });
  });

  app.delete('/tasks/:id', (req, res) => {
    const deleted = repo.delete(Number(req.params.id));
    if (!deleted) return res.status(404).json({ error: 'task not found' });
    res.status(204).end();
  });

  return app;
}
