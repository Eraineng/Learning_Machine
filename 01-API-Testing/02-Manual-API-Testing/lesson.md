# Lesson 2 — Manual API Testing

Before automating, learn to **think like a tester** by hand.

## Tools
- **Postman** (https://www.postman.com/downloads) — most popular
- **Thunder Client** — VS Code extension, lightweight
- **curl** — command line

## What do we check in an API test?
1. **Status code** — is it the expected one?
2. **Response body** — correct fields, values, and data types?
3. **Headers** — e.g. `Content-Type: application/json`
4. **Response time** — fast enough? (e.g. < 1s)
5. **Side effects** — after POST, can I GET the new item?

## Types of test cases
| Type | Idea | Example for `POST /users` |
|------|------|---------------------------|
| **Positive** | Valid input works | Valid name + email → `201` |
| **Negative** | Invalid input is rejected | Missing email → `400` |
| **Boundary** | Edges of limits | Name with 1 char, 255 chars, 256 chars |
| **Auth** | Security rules | No token → `401` |
| **Not found** | Missing resource | `GET /users/99999` → `404` |

## Writing a test case
| ID | Title | Steps | Expected |
|----|-------|-------|----------|
| TC-01 | Get existing post | GET `/posts/1` | `200`, body has `id: 1`, `title` is a string |
| TC-02 | Get missing post | GET `/posts/99999` | `404` |
| TC-03 | Create post | POST `/posts` with title, body, userId | `201`, body echoes data + has `id` |
| TC-04 | Filter posts by user | GET `/posts?userId=1` | `200`, every item has `userId: 1` |
| TC-05 | Delete post | DELETE `/posts/1` | `200` |

## Practice APIs (free, no signup)
- https://jsonplaceholder.typicode.com — fake posts/users/todos (writes are faked, not saved)
- https://restful-booker.herokuapp.com — has auth + real bugs to find (great for testers!)
- https://petstore.swagger.io — explore with Swagger docs

## Try it
1. Install Postman or Thunder Client.
2. Run TC-01 to TC-05 above by hand. Did they all pass?
3. Open https://restful-booker.herokuapp.com/apidoc — write 5 test cases for `CreateBooking`,
   including at least 2 negative cases. Save them in a `my-test-cases.md` in this folder.
