// Async code + timers

export type Fetcher = (url: string) => Promise<{ ok: boolean; json: () => Promise<any> }>;

export async function getUserName(id: number, fetcher: Fetcher): Promise<string> {
  const res = await fetcher(`https://api.example.com/users/${id}`);
  if (!res.ok) throw new Error(`User ${id} not found`);
  const user = await res.json();
  return `${user.firstName} ${user.lastName}`;
}

export function scheduleReminder(callback: (msg: string) => void, minutes: number): void {
  setTimeout(() => callback(`Reminder after ${minutes} min`), minutes * 60_000);
}

export async function retry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
