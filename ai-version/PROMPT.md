Migrate an existing Express CRUD API for a to-do list from an in-memory array to
a SQLite database using better-sqlite3, ES modules syntax (import, not require).

Requirements:
- Open/create a file called tasks.db
- Create a table called tasks with columns: id (integer primary key, auto
  generated), title (text), done (integer, 0 or 1)
- Only if the table is empty, seed it with 3 example tasks
- Keep these five endpoints with identical behavior to before:
  GET /tasks - list all tasks
  GET /tasks/:id - get one task, 404 with {"error": "Task not found"} if
  missing
  POST /tasks - create a task, 400 if title missing/empty, 201 with the
  created task (including its database-generated id) on success
  PUT /tasks/:id - update title and/or done (partial updates allowed), 400 if
  both are missing, 404 if unknown id, 200 with updated task on success
  DELETE /tasks/:id - remove a task, 404 if unknown id, 204 with empty body
  on success
- All queries must use parameterized placeholders (?), never string-glued SQL
- Keep the same server.js structure, just swap out the storage layer