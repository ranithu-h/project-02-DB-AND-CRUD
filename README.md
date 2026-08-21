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