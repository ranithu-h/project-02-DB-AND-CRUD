import express from 'express';
const app = express();
app.use(express.json());

import Database from 'better-sqlite3';
const db = new Database('tasks.db');

db.exec("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT, done INTEGER);");
const countRow = db.prepare('SELECT COUNT(*) AS numrow FROM tasks').get()

if (countRow.numrow !== 0){
  const data = [
    {title: "Task 4", done: 0},
    {title: "Task 5", done: 1},
    {title: "Task 6", done: 0}
  ]

  const insert = db.prepare("INSERT INTO tasks (title, done) VALUES (?,?)");
  data.forEach((task)=>{
    insert.run(task.title, task.done);
  });
}


import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { title } from 'process';

const openapiDocument = JSON.parse(readFileSync('./docs/openapi.json', 'utf-8'));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
const port = 3000;

let tasks = [
  {id: 1, title: "Task 1", done: true},
  {id: 2, title: "Task 2", done: false},
  {id: 3, title: "Task 3", done: true}
]

app.get('/', (req, res) => {
  res.json({ "name": "Task API", 
    "version": "1.0", 
    "endpoints": ["/tasks"] });
});

app.get('/health', (req, res) => {
  res.json({ "status": "OK" });
});

app.get('/tasks', (req, res) => {

  if (req.query.done === "false"){
    let not_dont_tasks = []
  
    for (let i = 0; i < tasks.length; i++){
      if (tasks[i].done === false){
        not_dont_tasks.push(tasks[i]);
      }
    }

      return res.json(not_dont_tasks)
  }

  res.json(tasks);
});

app.get('/tasks/:id', (req, res) =>{
  const id = Number(req.params.id);
  const task = tasks.find(t => t.id === id);

  if (!task){
    return res.status(404).json({ error: "Task ${id} not found" });
  }

  res.json(task);
});

app.post('/tasks', (req, res) => {
  const title = req.body.title

  if (!title){
    return res.status(400).json({error: "Missing Title"});
  }

  let new_id = tasks.length + 1;

  tasks.push({ "id": new_id,
    "title": "Buy milk",
    done: false
  })

  res.status(201).json({ "id": new_id,
    "title": title,
    done: false
  });
});

app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find(t => t.id === id);
  const title = req.body.title;
  const done = req.body.done;

  if (!task){
    return res.status(404).json({error: "Unknown id"});
  }

  if (!title && done === undefined){
    return res.status(400).json({error: "Empty/Invalid body"})
  }

  if (title !== undefined){
    task.title = title;
  }

  if (done !== undefined){
    task.done = done;
  }

  res.json(task)
});

app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);

  let indexToRemove = -1;

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      indexToRemove = i;
    }
  }

  if (indexToRemove === -1) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  tasks.splice(indexToRemove, 1);

  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});