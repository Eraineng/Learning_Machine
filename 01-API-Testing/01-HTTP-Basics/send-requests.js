// Send real HTTP requests with plain Node.js (no install needed, Node 18+).
// Run from this folder:   node send-requests.js
// This is what Playwright's `request` does for you under the hood.

const BASE = 'https://jsonplaceholder.typicode.com';

async function show(title, method, url, body) {
  const options = { method, headers: { Accept: 'application/json' } };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body); // JS object → JSON text
  }

  const start = Date.now();
  const response = await fetch(url, options);
  const ms = Date.now() - start;
  const text = await response.text();

  console.log(`\n=== ${title} ===`);
  console.log(`${method} ${url}`);
  console.log(`Status:       ${response.status} ${response.statusText}`);
  console.log(`Content-Type: ${response.headers.get('content-type')}`);
  console.log(`Time:         ${ms} ms`);
  console.log(`Body:         ${text.length > 300 ? text.slice(0, 300) + '...' : text}`);
}

async function main() {
  await show('Read one post', 'GET', `${BASE}/posts/1`);
  await show('Filter with query params', 'GET', `${BASE}/comments?postId=1`);
  await show('Not found', 'GET', `${BASE}/posts/99999`);
  await show('Create', 'POST', `${BASE}/posts`, { title: 'Hi', body: 'From Node', userId: 1 });
  await show('Partial update', 'PATCH', `${BASE}/posts/1`, { title: 'Patched' });
  await show('Delete', 'DELETE', `${BASE}/posts/1`);

  // YOUR TURN: add a request for /todos/5 and one for /users/3/albums
}

main();
