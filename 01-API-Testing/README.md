# API Testing — Learning Roadmap

Work through the folders in order. Tick each box when you're done.

## 01-HTTP-Basics — understand what an API is
- [ ] Read `01-HTTP-Basics/lesson.md`
- [ ] Keep `01-HTTP-Basics/cheat-sheet.md` open as a reference
- [ ] Send every request in `01-HTTP-Basics/requests.http` (VS Code "REST Client" extension)
- [ ] Run `node send-requests.js` in `01-HTTP-Basics`
- [ ] Complete `01-HTTP-Basics/exercises.md`
- [ ] Score 12+/15 on `01-HTTP-Basics/quiz.md`

## 02-Manual-API-Testing — test APIs by hand first
- [ ] Read `02-Manual-API-Testing/lesson.md`
- [ ] Install Postman **or** the VS Code extension "Thunder Client"
- [ ] Send GET / POST / PUT / DELETE requests to https://jsonplaceholder.typicode.com
- [ ] Write down 5 test cases for one endpoint (positive + negative)

## 03-Playwright-API-Tests — automate them with code
- [ ] Read `03-Playwright-API-Tests/lesson.md`
- [ ] Run `npm install` and `npx playwright test` in that folder
- [ ] Read every test in `tests/` and understand each line
- [ ] Break a test on purpose and read the failure message

## 04-Exercises — practice on your own
- [ ] Complete `04-Exercises/exercises.md`

## 05-Postman-and-Newman — the tool interviews ask about ⭐
- [ ] Read `05-Postman-and-Newman/lesson.md`
- [ ] Run `npm install && npm test` there (7 requests, 24 assertions)
- [ ] Import the collection into the Postman app and read every Tests tab
- [ ] Write a JSON schema assertion of your own
- [ ] Run the data-driven CSV version (`npm run test:data`)

## Why API testing first?
- APIs are the "engine" behind every website and app — UI tests sit on top of them.
- API tests are **fast** (milliseconds), **stable** (no flaky buttons), and **easy to debug**.
- Playwright does API testing *and* UI testing, so what you learn here carries over to `07-Playwright-UI-Automation`.
