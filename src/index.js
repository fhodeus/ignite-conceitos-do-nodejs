const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (!username)
    return response.status(400).json({ error: `Username is not provided.` });

  const user = users.find((user) => user.username === username);

  if (!user)
    return response
      .status(400)
      .json({ error: `User with username ${username} does not exist` });

  request.user = user;
  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (!name || !username)
    return response
      .status(400)
      .json({ error: "Invalid `name` or `username`." });

  const user = users.find((user) => user.username === username);

  if (user)
    return response
      .status(400)
      .json({ error: `User with username ${username} already exist` });

  const newUser = { id: uuidv4(), name, username, todos: [] };
  users.push(newUser);

  response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  response.status(201).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;

  if (!title || !deadline)
    return response
      .status(400)
      .json({ error: "Invalid `title` or `deadline`." });

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);
  response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const todos = request.user.todos;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = todos.find((todo) => todo.id === id);

  if (!todo)
    return response
      .status(404)
      .json({ error: `Todo with id ${id} does not exist` });

  todo.title = title || todo.title;
  todo.deadline = deadline || todo.deadline;

  response.status(201).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const todos = request.user.todos;
  const { id } = request.params;

  const todo = todos.find((todo) => todo.id === id);

  if (!todo)
    return response
      .status(404)
      .json({ error: `Todo with id ${id} does not exist` });

  todo.done = true;

  response.status(201).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const todos = request.user.todos;
  const { id } = request.params;

  const removedTodo = todos.find((todo) => todo.id === id);

  if (!removedTodo)
    return response
      .status(404)
      .json({ error: `Todo with id ${id} does not exist` });

  request.user.todos = todos.filter((todo) => todo.id !== removedTodo.id);;

  response.status(204).json(todos);
});

module.exports = app;
