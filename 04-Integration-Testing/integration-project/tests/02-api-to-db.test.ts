// Integration: HTTP request → Express routes → validation → repository → SQLite
// supertest calls the app in-process, no need to start a server on a port.
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createDb } from '../src/db';
import { TaskRepository } from '../src/taskRepository';
import { Notifier } from '../src/notifier';
import { createApp } from '../src/app';
import { startFakeNotifyServer, type FakeNotifyServer } from './helpers/fakeNotifyServer';

describe('Task API ↔ database', () => {
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
    repo = new TaskRepository(createDb(':memory:'));
    app = createApp({ repo, notifier: new Notifier(notify.url) });
    notify.reset();
  });

  it('GET /health', async () => {
    await request(app).get('/health').expect(200, { status: 'ok' });
  });

  it('POST /tasks saves to the database', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: '  Buy milk  ', assignee: 'ann' })
      .expect(201)
      .expect('Content-Type', /json/);

    expect(res.body).toMatchObject({ title: 'Buy milk', done: false, assignee: 'ann' });
    expect(res.headers.location).toBe(`/tasks/${res.body.id}`);

    // Verify the side effect directly in the DB, not only the response
    expect(repo.findById(res.body.id)?.title).toBe('Buy milk');
  });

  it.each([
    [{}, 'title is required'],
    [{ title: '' }, 'title is required'],
    [{ title: '   ' }, 'title is required'],
    [{ title: 123 }, 'title is required'],
    [{ title: 'x'.repeat(101) }, 'title must be at most 100 characters'],
  ])('POST /tasks with %j → 400', async (body, error) => {
    await request(app).post('/tasks').send(body).expect(400, { error });
    expect(repo.list()).toHaveLength(0); // nothing was written
  });

  it('accepts exactly 100 characters (boundary)', async () => {
    await request(app).post('/tasks').send({ title: 'x'.repeat(100) }).expect(201);
  });

  it('GET /tasks?done=true filters using data seeded directly in the DB', async () => {
    // Arrange through the repository (fast), assert through the API
    const a = repo.create('Done task');
    repo.create('Open task');
    repo.update(a.id, { done: true });

    const res = await request(app).get('/tasks?done=true').expect(200);
    expect(res.body.map((t: any) => t.title)).toEqual(['Done task']);
  });

  it('full lifecycle: create → read → update → delete → 404', async () => {
    const { body: created } = await request(app).post('/tasks').send({ title: 'Lifecycle' }).expect(201);

    await request(app).get(`/tasks/${created.id}`).expect(200);
    const { body: updated } = await request(app)
      .patch(`/tasks/${created.id}`)
      .send({ title: 'Renamed' })
      .expect(200);
    expect(updated.title).toBe('Renamed');

    await request(app).delete(`/tasks/${created.id}`).expect(204);
    await request(app).get(`/tasks/${created.id}`).expect(404);
    expect(repo.list()).toEqual([]);
  });

  it('PATCH unknown id → 404', async () => {
    await request(app).patch('/tasks/999').send({ done: true }).expect(404);
  });
});
