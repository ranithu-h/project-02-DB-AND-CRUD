# Task API — SQLite version


# project-02-DB-AND-CRUD
 
A CRUD API for a to-do list, built with Node.js and Express. Tasks are now stored in a **SQLite** database instead of in memory, so data survives a server restart.
 
## Why SQLite
 
SQLite is a single file with zero setup — there's no separate database server to install or run. Unlike an in-memory list, the data written to it survives a server restart, since it's saved to disk instead of living only in a variable.
 
## Where the database lives
 
The database is a file called `tasks.db`, created automatically the first time the server runs. It's listed in `.gitignore`, so it's never pushed to GitHub — every fresh clone starts with no database file at all, and one is generated (with the table and 3 seeded tasks) the moment the server starts.
 
## How to run
 
```bash
npm install
node server.js
```
 
The server starts on `http://localhost:3000`. On first run, `tasks.db` is created automatically with a `tasks` table and 3 example tasks seeded in.
 
## Database viewer
 
Opened in DB Browser for SQLite:
 
![DB Browser](docs/db-browser-screenshot.png)
 
## Example SQL query
 
Run by hand in DB Browser's "Execute SQL" tab:
 
```sql
SELECT * FROM tasks WHERE done = 1;
```
 
Returned 3 completed tasks: id 2 ("Task 5"), id 3 ("Task 6"), and id 7 ("Study Express New").

## AI vs me — Stage 6 (SQLite migration)
 
**My prompt:**
 
```
Migrate an existing Express CRUD API for a todo list from an in memory array to
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
```
 
The AI's code lives in `ai-version/`, ran on a separate port, and was tested independently of my hand-built version.
 
### Did it start on the first try, and does persistence actually work?
 
Yes to both. `tasks.db` was created automatically, the table and 3 seeds were inserted on first run, and running the seed logic again on a restart correctly skipped re-inserting (still 4 tasks after a restart following one `POST`, not 7). All five endpoints returned the correct status codes when I fired the same checkpoint curls at it that I used on my own version.
 
### What did the AI do better?
 
- **Transactions for seeding.** It wrapped the 3 seed inserts in `db.transaction(...)`, so all three inserts succeed or fail together as one atomic unit. My version just runs three separate `.run()` calls in a loop with no such guarantee — if the process died mid-seed, my version could end up with 1 or 2 tasks instead of 3, while the AI's version can't end up partially seeded.
- **Schema constraints.** It used `title TEXT NOT NULL` and `done INTEGER NOT NULL DEFAULT 0` in the `CREATE TABLE` statement, and `AUTOINCREMENT` on the id. My table has no constraints at all — the database itself would silently accept a `NULL` title if some other bug ever let one slip through my JS-level validation. The AI's version defends against that at the schema level, not just in application code.
- **`DELETE` checks existence via `result.changes` instead of a separate `SELECT`.** It runs the `DELETE` directly and checks `result.changes === 0` to decide on a 404, which is one query instead of my two (a `SELECT` to check existence, then a `DELETE`). Slightly more efficient, same correctness.
- **Input validation.** It checks `typeof title !== 'string'` and trims whitespace before inserting. My version just checks `if (!title)`, which would let a title of `"   "` (spaces only) or accidentally-numeric input through.
### What did it get wrong or quietly ignore?
 
- It ran on **port 3001**, not 3000 — I didn't specify a port, so this isn't wrong exactly, but it's a silent deviation worth noting since it wouldn't drop into my project without a port change.
- My prompt said keep the *same server.js structure* — the AI dropped the Swagger/OpenAPI docs setup and the `GET /` and `GET /health` routes entirely, since I didn't explicitly list them in this prompt (I only described the SQLite migration, forgetting those routes exist too). Technically it followed my prompt correctly — but it's a good example of the AI not "filling gaps" the way a human collaborator might have asked about.
- The AI never mentioned or added `app.use(express.json())` in comments/docs, but did correctly include the line itself — worth double-checking output like this rather than assuming it silently dropped something just because it wasn't flagged.
### What did my prompt forget to specify?
 
I never mentioned the `GET /`, `GET /health`, Swagger UI setup, or the `search`/`done` query-filter extras I'd already added to my own `/tasks` route — so naturally none of that appears in the AI's version. I also didn't specify a port, so the AI picked its own default. This confirms the assignment's core lesson: the AI's output is only as complete as what I actually described — it can't infer parts of my existing API that I didn't mention, even if they were already built.
 
### Rematch — what changed
 
I added three lines to my prompt: keep `GET /`, `GET /health`, and the existing Swagger UI setup at `/docs` untouched; keep the `search` and `done` query-string filtering already on `GET /tasks`; and run on port 3000 to match my existing project. After regenerating, the AI included all three correctly — confirming again that precision in the prompt, not the AI's judgment, is what closes these gaps.
 