// Explore by hand:  node server.js vulnerable   |   node server.js safe
import { createFlightApi } from './src/flightApi.js';

const mode = process.argv[2] === 'safe' ? 'safe' : 'vulnerable';
const port = mode === 'safe' ? 5002 : 5001;

createFlightApi({ mode, capacity: 5 }).listen(port, '127.0.0.1', () => {
  console.log(`${mode.toUpperCase()} flight API on http://127.0.0.1:${port}`);
  console.log('Try:');
  console.log(`  curl.exe http://127.0.0.1:${port}/flights/FL100`);
  console.log(`  curl.exe -X POST http://127.0.0.1:${port}/bookings -H "Authorization: Bearer user-a" -H "Content-Type: application/json" -d "{\\"seats\\":1,\\"price\\":1}"`);
});
