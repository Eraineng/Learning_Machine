// CONSUMER: a client library used by the web app. It only needs id, name, email and plan.
export interface User {
  id: number;
  name: string;
  email: string;
  plan: string;
}

export class UserClient {
  constructor(private baseUrl: string) {}

  async getUser(id: number): Promise<User> {
    const res = await fetch(`${this.baseUrl}/users/${id}`, { headers: { Accept: 'application/json' } });
    if (res.status === 404) throw new Error(`User ${id} not found`);
    if (!res.ok) throw new Error(`Unexpected status ${res.status}`);

    const body = (await res.json()) as any;
    return { id: body.id, name: body.name, email: body.email, plan: body.plan };
  }

  async listUsers(): Promise<User[]> {
    const res = await fetch(`${this.baseUrl}/users`, { headers: { Accept: 'application/json' } });
    const body = (await res.json()) as any[];
    return body.map((u) => ({ id: u.id, name: u.name, email: u.email, plan: u.plan }));
  }

  /** The UI shows "Ann (pro)" — this is the behavior the consumer really cares about. */
  async getDisplayName(id: number): Promise<string> {
    const user = await this.getUser(id);
    return `${user.name} (${user.plan})`;
  }
}
