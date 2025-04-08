import express from "express";
import bodyParser from "body-parser";
import { randomBytes } from "crypto";
import logger from "./utils/logger.js";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = 4000;

app.use(bodyParser.json());
app.use(cors());

//stores all the paosts that will be created
const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/posts", async (req, res) => {
  const id = randomBytes(16).toString("hex");
  const { title } = req.body;
  if (!title) {
    res.status(400).json({ error: "Title is required" });
  }
  posts[id] = { 
    id,
    title,
  };

  try {
    // Emitting an event to the event-bus
    await axios.post(`http://localhost:4005/events`, {
      type: "PostCreated",
      data: { id, title },
    });

    res.status(201).send(posts[id]);
  } catch (error) {
    logger.error(error.message);
  }
});

app.post("/events", (req, res) => {
  console.log("Received event ", req.body.type);
  res.send({});
});

app.listen(PORT, () => {
  logger.info(`Listening on port: ${PORT}`);
});
