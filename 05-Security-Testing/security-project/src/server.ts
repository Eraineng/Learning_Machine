// npm run start:vuln   → http://127.0.0.1:4001  (bound to localhost only!)
// npm run start:secure → http://127.0.0.1:4002
import { createApp } from './app';

const mode = process.argv[2] === 'secure' ? 'secure' : 'vuln';
const port = mode === 'secure' ? 4002 : 4001;

createApp(mode).listen(port, '127.0.0.1', () => {
  console.log(`${mode.toUpperCase()} app on http://127.0.0.1:${port}`);
  if (mode === 'vuln') console.log('⚠️  Intentionally vulnerable. Do not expose to a network.');
});
