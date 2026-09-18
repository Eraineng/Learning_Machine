# HTTP Cheat Sheet

## Anatomy of a request
```
POST /posts?draft=true HTTP/1.1          ← method, path, query, version
Host: jsonplaceholder.typicode.com       ← headers
Content-Type: application/json
Authorization: Bearer abc123
                                         ← blank line
{"title": "Hello", "userId": 1}          ← body
```

## Anatomy of a response
```
HTTP/1.1 201 Created                     ← status line
Content-Type: application/json; charset=utf-8
                                         ← blank line
{"id": 101, "title": "Hello", "userId": 1}
```

## URL parts
```
https://api.example.com:443/users/42/orders?status=paid&page=2#top
└─┬─┘   └──────┬──────┘└┬┘└──────┬──────┘└─────────┬─────────┘└┬┘
scheme       host     port     path            query       fragment
```
- **Path parameter** — part of the path, identifies ONE resource: `/users/42`
- **Query parameter** — after `?`, filters/sorts/pages: `?status=paid&page=2`

## Methods
| Method | Purpose | Has body? | Safe?* | Idempotent?** |
|--------|---------|-----------|--------|---------------|
| GET | Read | No | ✅ | ✅ |
| POST | Create | Yes | ❌ | ❌ |
| PUT | Replace whole resource | Yes | ❌ | ✅ |
| PATCH | Change some fields | Yes | ❌ | ❌ (usually) |
| DELETE | Remove | Rarely | ❌ | ✅ |
| HEAD | Like GET, headers only | No | ✅ | ✅ |
| OPTIONS | Which methods allowed? | No | ✅ | ✅ |

\* **Safe** = doesn't change data.
\** **Idempotent** = sending it 1 time or 10 times gives the same end result.
Calling `DELETE /posts/1` twice → post is still just deleted. Calling `POST /posts` twice → two posts!

## Status codes
| Range | Meaning | Common ones |
|-------|---------|-------------|
| 1xx | Info | `100 Continue` |
| 2xx | Success | `200 OK`, `201 Created`, `204 No Content` |
| 3xx | Redirect | `301 Moved Permanently`, `304 Not Modified` |
| 4xx | Client error | `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `405 Method Not Allowed`, `409 Conflict`, `422 Unprocessable Entity`, `429 Too Many Requests` |
| 5xx | Server error | `500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable`, `504 Gateway Timeout` |

**401 vs 403:** 401 = "Who are you?" (not logged in). 403 = "I know who you are, but no." (no permission)

## Common headers
| Header | Direction | Example | Purpose |
|--------|-----------|---------|---------|
| `Content-Type` | both | `application/json` | Format of the body being sent |
| `Accept` | request | `application/json` | Format I want back |
| `Authorization` | request | `Bearer eyJhbGci...` | Credentials / token |
| `Cookie` / `Set-Cookie` | req / res | `token=abc` | Session data |
| `Cache-Control` | response | `no-cache` | Caching rules |
| `Location` | response | `/posts/101` | Where the new/moved resource is |
| `User-Agent` | request | `curl/8.0` | Which client is calling |

## Common Content-Types
- `application/json` — JSON (most APIs)
- `application/x-www-form-urlencoded` — HTML forms: `name=Ann&age=30`
- `multipart/form-data` — file uploads
- `text/html`, `text/plain`, `application/xml`

## curl quick reference (Windows: use `curl.exe`)
```powershell
curl.exe URL                                   # GET
curl.exe -i URL                                # show status + headers
curl.exe -I URL                                # HEAD (headers only)
curl.exe -v URL                                # verbose: see the full request too
curl.exe -X POST URL -H "Content-Type: application/json" -d '{\"a\":1}'
curl.exe -X DELETE URL
curl.exe -H "Authorization: Bearer TOKEN" URL
```
