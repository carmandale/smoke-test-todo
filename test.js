const express = require("express");
const path = require("path");
const http = require("http");

// Build the same app inline so we can test without spawning a process
const app = express();
app.use(express.json());

let todos = [];
let nextId = 1;

app.get("/api/todos", (req, res) => res.json(todos));
app.post("/api/todos", (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }
  const todo = { id: nextId++, title: title.trim(), completed: false };
  todos.push(todo);
  res.status(201).json(todo);
});
app.patch("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const todo = todos.find((t) => t.id === id);
  if (!todo) return res.status(404).json({ error: "not found" });
  if (req.body.completed !== undefined) todo.completed = Boolean(req.body.completed);
  if (req.body.title !== undefined) todo.title = req.body.title.trim();
  res.json(todo);
});
app.delete("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  todos.splice(idx, 1);
  res.status(204).end();
});

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${msg}`);
  } else {
    failed++;
    console.error(`  FAIL: ${msg}`);
  }
}

async function request(method, path, body) {
  const res = await fetch(`http://localhost:${server.address().port}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = null; }
  return { status: res.status, data };
}

let server;

async function run() {
  server = app.listen(0); // random port
  console.log("Running API tests...\n");

  // 1. List todos — empty
  let r = await request("GET", "/api/todos");
  assert(r.status === 200, "GET /api/todos returns 200");
  assert(Array.isArray(r.data) && r.data.length === 0, "initially empty");

  // 2. Create a todo
  r = await request("POST", "/api/todos", { title: "Buy milk" });
  assert(r.status === 201, "POST returns 201");
  assert(r.data.title === "Buy milk", "todo title matches");
  assert(r.data.completed === false, "todo starts incomplete");
  const todoId = r.data.id;

  // 3. Create another
  await request("POST", "/api/todos", { title: "Walk dog" });

  // 4. List — should have 2
  r = await request("GET", "/api/todos");
  assert(r.data.length === 2, "two todos exist");

  // 5. Toggle completed
  r = await request("PATCH", `/api/todos/${todoId}`, { completed: true });
  assert(r.status === 200, "PATCH returns 200");
  assert(r.data.completed === true, "todo marked completed");

  // 6. Delete
  r = await request("DELETE", `/api/todos/${todoId}`);
  assert(r.status === 204, "DELETE returns 204");

  // 7. List — should have 1
  r = await request("GET", "/api/todos");
  assert(r.data.length === 1, "one todo remains after delete");

  // 8. Invalid create
  r = await request("POST", "/api/todos", { title: "" });
  assert(r.status === 400, "empty title returns 400");

  // 9. Not found
  r = await request("PATCH", "/api/todos/999", { completed: true });
  assert(r.status === 404, "missing todo returns 404");

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error(err);
  if (server) server.close();
  process.exit(1);
});
