import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select("tasks", {
        title: search,
        description: search,
      });

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      const validations = [
        { value: title, message: "title is required" },
        { value: description, message: "description is required" },
      ];

      for (const item of validations) {
        if (!item.value)
          return res
            .writeHead(400)
            .end(JSON.stringify({ message: item.message }));
      }

      const now = new Date();

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: now,
        updated_at: now,
      };

      database.insert("tasks", task);

      return res.writeHead(201).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      const validations = [
        { value: title, message: "title is required" },
        { value: description, message: "description is required" },
      ];

      for (const item of validations) {
        if (!item.value)
          return res
            .writeHead(400)
            .end(JSON.stringify({ message: item.message }));
      }

      try {
        database.update("tasks", id, {
          title,
          description,
        });

        return res.writeHead(204).end();
      } catch (error) {
        res.writeHead(404).end(JSON.stringify({ message: error.message }));
      }
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      try {
        database.delete("tasks", id);

        return res.writeHead(204).end();
      } catch (error) {
        res.writeHead(404).end(JSON.stringify({ message: error.message }));
      }
    },
  },
];
