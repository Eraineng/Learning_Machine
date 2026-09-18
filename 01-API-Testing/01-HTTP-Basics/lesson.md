# Lesson 1 — HTTP Basics

## What is an API?
An **API** (Application Programming Interface) lets one program talk to another.
A **web API** (usually "REST API") does this over **HTTP** — the same protocol your browser uses.

Think of a restaurant:
- **You** (client) → give an order to the **waiter** (API) → **kitchen** (server/database) prepares it → waiter brings back your food (response).

## The Request
Every request has:

| Part | Example | Meaning |
|------|---------|---------|
| **Method** | `GET` | What you want to do |
| **URL** | `https://jsonplaceholder.typicode.com/posts/1` | Which resource |
| **Headers** | `Content-Type: application/json` | Extra info (format, auth token…) |
| **Body** | `{"title": "Hello"}` | Data you send (POST/PUT/PATCH only) |
| **Query params** | `?userId=1` | Filters added to the URL |

### HTTP Methods (CRUD)
| Method | Action | CRUD |
|--------|--------|------|
| `GET` | Read data | **R**ead |
| `POST` | Create new data | **C**reate |
| `PUT` | Replace existing data | **U**pdate |
| `PATCH` | Update part of data | **U**pdate |
| `DELETE` | Remove data | **D**elete |

## The Response
| Part | Example |
|------|---------|
| **Status code** | `200` |
| **Headers** | `Content-Type: application/json` |
| **Body** | `{"id": 1, "title": "..."}` |

### Status codes you must know
| Code | Meaning | When |
|------|---------|------|
| `200 OK` | Success | GET/PUT worked |
| `201 Created` | Created | POST worked |
| `204 No Content` | Success, empty body | DELETE worked |
| `400 Bad Request` | Your input is wrong | Missing/invalid field |
| `401 Unauthorized` | Not logged in | Missing/bad token |
| `403 Forbidden` | Logged in but not allowed | No permission |
| `404 Not Found` | Resource doesn't exist | Wrong ID/URL |
| `500 Internal Server Error` | Server crashed | Bug on the server |

Rule of thumb: **2xx = success, 4xx = client's fault, 5xx = server's fault.**

## JSON
APIs mostly send data as **JSON**:
```json
{
  "id": 1,
  "name": "Leanne Graham",
  "active": true,
  "tags": ["admin", "editor"],
  "address": { "city": "Gwenborough" }
}
```
Types: string, number, boolean, array `[]`, object `{}`, `null`.

## Try it
1. Open in your browser: https://jsonplaceholder.typicode.com/users/1 — that's a GET request!
2. Try https://jsonplaceholder.typicode.com/users/9999 — what do you get?
3. In PowerShell run:
   ```powershell
   curl.exe -i https://jsonplaceholder.typicode.com/posts/1
   ```
   `-i` shows the status code and headers. Find them.
4. Create a post with POST:
   ```powershell
   curl.exe -i -X POST https://jsonplaceholder.typicode.com/posts -H "Content-Type: application/json" -d '{\"title\":\"hi\",\"body\":\"test\",\"userId\":1}'
   ```
   Which status code came back? Why is it not 200?

## Check yourself
- What's the difference between PUT and PATCH?
- A user types a wrong password — which status code should the API return?
- Where does data go in a GET request vs a POST request?
