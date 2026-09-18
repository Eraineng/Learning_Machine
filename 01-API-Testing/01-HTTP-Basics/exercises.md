# HTTP Basics — Hands-on Exercises

Write your answers in a new file `my-answers.md` in this folder.

## 1. Explore with the browser (5 min)
1. Open https://jsonplaceholder.typicode.com/users/1 — list 5 fields and their JSON types.
2. Press **F12 → Network tab**, reload. Click the request. Find the **status code**, **method**, and the **Content-Type** response header.
3. Open https://jsonplaceholder.typicode.com/posts?userId=3 — how many posts does user 3 have?

## 2. Use requests.http (10 min)
1. Install the **REST Client** extension in VS Code.
2. Open `requests.http` and send requests 1–14 one by one.
3. For each, write down: method, status code, and one sentence on what happened.
4. Request 11 (httpbin `/anything`) echoes your request. Find your `X-My-Header` in the response.
5. Add request 15: get all **todos** of user 2 that are **completed** (hint: two query params joined with `&`).

## 3. Use curl (10 min)
1. `curl.exe -v https://jsonplaceholder.typicode.com/posts/1` — lines starting with `>` are your request, `<` the response. Copy the request headers you sent.
2. `curl.exe -I https://jsonplaceholder.typicode.com/posts/1` — what's different from GET?
3. Send a PATCH with curl that changes the `title` of post 5.

## 4. Use Node.js (10 min)
1. Run `node send-requests.js`.
2. Complete the "YOUR TURN" part at the bottom of the file.
3. Which request was the slowest? Run it again — is it still the slowest?

## 5. Think like a tester (10 min)
Pick the endpoint `GET /posts/{id}`. Write 5 test ideas, e.g.:
- valid id `1` → 200
- id that doesn't exist → ?
- id `0`, `-1`, `abc`, `1.5` → ?

Try them all. Did any response surprise you?

## Done?
Take `quiz.md`. Score 12+/15 → move on to `02-Manual-API-Testing`.
