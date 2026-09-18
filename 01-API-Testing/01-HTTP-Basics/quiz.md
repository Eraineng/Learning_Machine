# HTTP Basics Quiz

Answer on paper first, then check the answers at the bottom.

## Part A — Multiple choice
1. Which method should be used to **read** data?
   a) POST  b) GET  c) PUT  d) PATCH
2. A new user was successfully created. The best status code is:
   a) 200  b) 201  c) 204  d) 202
3. The user is logged in but tries to delete someone else's account. Status?
   a) 400  b) 401  c) 403  d) 404
4. Which header tells the server the body is JSON?
   a) `Accept`  b) `Authorization`  c) `Content-Type`  d) `Host`
5. In `/users/42?sort=name`, what is `42`?
   a) query parameter  b) path parameter  c) header  d) body
6. Which method is **NOT** idempotent?
   a) GET  b) PUT  c) DELETE  d) POST
7. The server has a bug and crashes. The response is most likely:
   a) 404  b) 400  c) 500  d) 302

## Part B — Short answer
8. What's the difference between PUT and PATCH?
9. What's the difference between 401 and 404?
10. Why doesn't a GET request normally have a body?
11. What does "2xx / 4xx / 5xx" tell you about **who** made the mistake?

## Part C — Spot the bug (you're the tester!)
For each, say what's wrong with the API's behavior.
12. `POST /login` with a wrong password returns `200 OK` and `{"error": "wrong password"}`.
13. `GET /products/abc` (invalid id) returns `500 Internal Server Error`.
14. `DELETE /orders/7` returns `200 OK`, but `GET /orders/7` still returns the order.
15. `GET /users` returns `Content-Type: text/html` but the body is JSON.

---

## Answers
<details>
<summary>Click to show</summary>

1. **b** GET
2. **b** 201 Created
3. **c** 403 Forbidden — they're authenticated but not allowed
4. **c** Content-Type (`Accept` says what format you *want back*)
5. **b** path parameter
6. **d** POST — two POSTs create two resources
7. **c** 500
8. PUT replaces the **whole** resource (missing fields may be removed); PATCH changes **only** the fields you send.
9. 401 = you're not authenticated (no/bad credentials). 404 = the resource doesn't exist.
10. GET only asks for data; filters go in the URL (query params). Many servers/proxies ignore GET bodies.
11. 2xx = no mistake; 4xx = client sent something wrong; 5xx = server failed.
12. Should be `401 Unauthorized` (or 400). Clients/tools that check the status code will think login succeeded.
13. Should be `400 Bad Request` or `404 Not Found`. A 500 means the server didn't validate input — a real bug.
14. The delete didn't actually happen (or caching is stale). Status says success but the data disagrees.
15. Wrong header — should be `application/json`. Clients may fail to parse the body.

</details>
