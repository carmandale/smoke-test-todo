const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory store
let todos = [];
let nextId = 1;

// GET /api/todos — list all todos
app.get("/api/todos", (req, res) => {
  res.json(todos);
});

// POST /api/todos — create a todo
app.post("/api/todos", (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }
  const todo = { id: nextId++, title: title.trim(), completed: false };
  todos.push(todo);
  res.status(201).json(todo);
});

// PATCH /api/todos/:id — toggle completed
app.patch("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const todo = todos.find((t) => t.id === id);
  if (!todo) return res.status(404).json({ error: "not found" });

  if (req.body.title !== undefined) {
    if (typeof req.body.title !== "string" || !req.body.title.trim()) {
      return res.status(400).json({ error: "title must be a non-empty string" });
    }
    todo.title = req.body.title.trim();
  }
  if (req.body.completed !== undefined) {
    todo.completed = Boolean(req.body.completed);
  }
  res.json(todo);
});

// DELETE /api/todos/:id — delete a todo
app.delete("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  todos.splice(idx, 1);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Todo app running at http://localhost:${PORT}`);
});
