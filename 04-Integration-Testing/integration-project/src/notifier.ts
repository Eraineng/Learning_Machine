// Client for an EXTERNAL service (e.g. Slack/email microservice) reached over HTTP.
export class Notifier {
  constructor(private baseUrl: string, private timeoutMs = 2000) {}

  async taskCompleted(task: { id: number; title: string; assignee: string | null }): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: task.assignee ?? 'general',
          message: `Task #${task.id} "${task.title}" completed`,
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      return res.ok;
    } catch {
      return false; // service down or too slow → don't crash the main feature
    }
  }
}
