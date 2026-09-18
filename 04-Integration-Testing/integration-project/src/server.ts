// Run the real app manually: npm start → http://localhost:3000/tasks
import { createDb } from './db';
import { TaskRepository } from './taskRepository';
import { Notifier } from './notifier';
import { createApp } from './app';

const db = createDb('tasks.db');
const app = createApp({
  repo: new TaskRepository(db),
  notifier: new Notifier(process.env.NOTIFY_URL ?? 'http://localhost:4000'),
});

app.listen(3000, () => console.log('Task API on http://localhost:3000'));
