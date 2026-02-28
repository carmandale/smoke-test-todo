# smoke-test-todo

Simple todo app with a REST API and web UI. Built as a smoke test for agent orchestrator.

## Quick Start

```bash
npm install
npm start
# Open http://localhost:3001
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/todos | List all todos |
| POST | /api/todos | Create a todo (`{ "title": "..." }`) |
| PATCH | /api/todos/:id | Update a todo (`{ "completed": true }`) |
| DELETE | /api/todos/:id | Delete a todo |

## Tests

```bash
npm test
```
