# Integration Testing — Learning Roadmap

Unit tests prove each piece works **alone**. Integration tests prove the pieces work **together**:
code ↔ database, API ↔ business logic, service ↔ external service.

## The practice app: Task API
```
HTTP request
    │
    ▼
┌────────────┐    ┌────────────────┐    ┌──────────────┐
│  app.ts    │───►│ taskRepository │───►│ SQLite DB    │
│ (Express)  │    │   (SQL)        │    │ (real!)      │
└─────┬──────┘    └────────────────┘    └──────────────┘
      │ task completed
      ▼
┌────────────┐   HTTP POST /notify   ┌──────────────────────┐
│ notifier.ts│──────────────────────►│ External notify svc  │
└────────────┘                       │ (fake server in tests)│
                                     └──────────────────────┘
```

```
integration-project/
├── src/          db.ts · taskRepository.ts · notifier.ts · app.ts · server.ts
└── tests/
    ├── helpers/fakeNotifyServer.ts
    ├── 01-repository-db.test.ts      (lesson 2) code ↔ database
    ├── 02-api-to-db.test.ts          (lesson 3) HTTP ↔ routes ↔ database
    └── 03-external-service.test.ts   (lesson 4) app ↔ external HTTP service
```

## Setup
Requires **Node 22+** (uses the built-in `node:sqlite`).
```powershell
cd integration-project
npm install
npm test          # the "SQLite is an experimental feature" warning is normal
npm start         # run the real API on http://localhost:3000 (try it with 01-API-Testing skills!)
```

## Checklist
- [ ] `01-What-Is-Integration-Testing/lesson.md`
- [ ] `02-Database-Integration/lesson.md`
- [ ] `03-API-Integration/lesson.md`
- [ ] `04-External-Services/lesson.md`
- [ ] `05-Exercises/exercises.md`
