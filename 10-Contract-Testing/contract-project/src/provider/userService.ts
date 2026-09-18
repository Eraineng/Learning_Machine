// PROVIDER: the real user-service API, owned by another team.
import express from 'express';

export interface UserRow { id: number; name: string; email: string; plan: string; createdAt: string; internalNotes?: string }

export function createProvider(options: { version?: 'v1' | 'v2-breaking' } = {}) {
  const version = options.version ?? 'v1';
  const users = new Map<number, UserRow>();
  const app = express();
  app.use(express.json());

  // Provider states: test-only endpoints that put the provider into a known state.
  // Real Pact setups do this with "state handlers" instead of HTTP routes.
  app.post('/_test/state', (req, res) => {
    users.clear();
    if (req.body.state === 'user 1 exists') {
      users.set(1, {
        id: 1, name: 'Ann Tester', email: 'ann@example.com', plan: 'pro',
        createdAt: '2026-01-05T10:00:00.000Z', internalNotes: 'VIP customer',
      });
    }
    if (req.body.state === 'three users exist') {
      [1, 2, 3].forEach((id) =>
        users.set(id, { id, name: `User ${id}`, email: `user${id}@example.com`, plan: 'free', createdAt: '2026-01-05T10:00:00.000Z' }),
      );
    }
    res.status(204).end();
  });

  app.get('/users', (_req, res) => {
    res.json([...users.values()].map((u) => shape(u, version)));
  });

  app.get('/users/:id', (req, res) => {
    const user = users.get(Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json(shape(user, version));
  });

  return app;
}

function shape(user: UserRow, version: 'v1' | 'v2-breaking') {
  if (version === 'v1') {
    // Note: the provider returns MORE than the consumer needs (createdAt, internalNotes).
    // That's fine — contracts only require what consumers actually use.
    return user;
  }
  // 💥 v2: the provider team "cleaned up" the API:
  //   - `name` was split into firstName/lastName
  //   - `plan` was renamed to `subscriptionTier`
  const [firstName, ...rest] = user.name.split(' ');
  return {
    id: user.id,
    firstName,
    lastName: rest.join(' '),
    email: user.email,
    subscriptionTier: user.plan,
    createdAt: user.createdAt,
  };
}
