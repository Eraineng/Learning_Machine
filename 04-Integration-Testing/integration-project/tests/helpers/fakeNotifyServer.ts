// A tiny REAL HTTP server that pretends to be the external notification service.
// Tests can inspect what it received and make it fail or be slow.
import http from 'node:http';
import type { AddressInfo } from 'node:net';

export interface FakeNotifyServer {
  url: string;
  received: any[];
  mode: 'ok' | 'error' | 'slow';
  reset(): void;
  close(): Promise<void>;
}

export async function startFakeNotifyServer(): Promise<FakeNotifyServer> {
  const state = { received: [] as any[], mode: 'ok' as FakeNotifyServer['mode'] };

  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      if (req.method === 'POST' && req.url === '/notify') {
        state.received.push(JSON.parse(body));
        if (state.mode === 'error') {
          res.writeHead(503).end();
        } else if (state.mode === 'slow') {
          setTimeout(() => res.writeHead(200).end(), 3000);
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' }).end('{"sent":true}');
        }
        return;
      }
      res.writeHead(404).end();
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve)); // port 0 = any free port
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    get received() {
      return state.received;
    },
    get mode() {
      return state.mode;
    },
    set mode(m) {
      state.mode = m;
    },
    reset() {
      state.received = [];
      state.mode = 'ok';
    },
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}
