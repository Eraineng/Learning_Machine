// Integration: our app ↔ an external HTTP service (replaced by a fake server we control)
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createDb } from '../src/db';
import { TaskRepository } from '../src/taskRepository';
import { Notifier } from '../src/notifier';
import { createApp } from '../src/app';
import { startFakeNotifyServer, type FakeNotifyServer } from './helpers/fakeNotifyServer';

describe('completing a task notifies the external service', () => {
  let notify: FakeNotifyServer;
  let repo: TaskRepository;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    notify = await startFakeNotifyServer();
  });
  afterAll(async () => {
    await notify.close();
  });

  beforeEach(() => {
    notify.reset();
    repo = new TaskRepository(createDb());
    // short timeout so the "slow service" test stays fast
    app = createApp({ repo, notifier: new Notifier(notify.url, 500) });
  });

  it('sends the right payload over HTTP', async () => {
    const task = repo.create('Ship release', 'ann');

    const res = await request(app).patch(`/tasks/${task.id}`).send({ done: true }).expect(200);

    expect(res.body.notified).toBe(true);
    expect(notify.received).toEqual([
      { channel: 'ann', message: `Task #${task.id} "Ship release" completed` },
    ]);
  });

  it('does not notify when the task was already done', async () => {
    const task = repo.create('Already done');
    repo.update(task.id, { done: true });

    await request(app).patch(`/tasks/${task.id}`).send({ done: true }).expect(200);
    expect(notify.received).toHaveLength(0);
  });

  it('service returns 503 → task is still saved, notified=false', async () => {
    notify.mode = 'error';
    const task = repo.create('Resilience');

    const res = await request(app).patch(`/tasks/${task.id}`).send({ done: true }).expect(200);

    expect(res.body.notified).toBe(false);
    expect(repo.findById(task.id)?.done).toBe(true);
  });

  it('service too slow → times out gracefully', async () => {
    notify.mode = 'slow';
    const task = repo.create('Timeout');

    const start = Date.now();
    const res = await request(app).patch(`/tasks/${task.id}`).send({ done: true }).expect(200);

    expect(res.body.notified).toBe(false);
    expect(Date.now() - start).toBeLessThan(2000); // did not wait the full 3s
  });

  it('service completely down → still works', async () => {
    const deadApp = createApp({ repo, notifier: new Notifier('http://127.0.0.1:1', 500) });
    const task = repo.create('No service');

    const res = await request(deadApp).patch(`/tasks/${task.id}`).send({ done: true }).expect(200);
    expect(res.body.notified).toBe(false);
  });
});
