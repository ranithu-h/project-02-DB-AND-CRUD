import express from 'express';
import Database from 'better-sqlite3';

const app = express();
app.use(express.json());

const db = new Database('tasks.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();
  if (count === 0) {
    const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
    const seedMany = db.transaction((seedTasks) => {
      for (const t of seedTasks) insert.run(t.title, t.done);
    });
    seedMany([
      { title: 'Buy milk', done: 0 },
      { title: 'Walk the dog', done: 0 },
      { title: 'Finish assignment', done: 0 },
    ]);
  }
}
seedIfEmpty();

app.get('/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks').all();
  res.status(200).json(tasks);
});

app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.status(200).json(task);
});

app.post('/tasks', (req, res) => {
  const { title } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and cannot be empty' });
  }

  const result = db
    .prepare('INSERT INTO tasks (title, done) VALUES (?, ?)')
    .run(title.trim(), 0);

  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newTask);
});

app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, done } = req.body || {};

  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: 'Provide at least title or done' });
  }

  const newTitle = title !== undefined ? title : task.title;
  const newDone = done !== undefined ? (done ? 1 : 0) : task.done;

  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(newTitle, newDone, id);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.status(200).json(updated);
});

app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.status(204).send();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI version listening on port ${PORT}`);
});