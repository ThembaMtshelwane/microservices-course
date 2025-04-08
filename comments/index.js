import express from "express";
import bodyParser from "body-parser";
import { randomBytes } from "crypto";
import logger from "./utils/logger.js";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = 4001;

app.use(bodyParser.json());
app.use(cors());

// key is the post id and value is an array of posts
const commentsByPostId = {};

app.get("/posts/:id/comments", async (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  // generate a random id for the comment
  const commentId = randomBytes(16).toString("hex");

  //extract the content of the comment from the client via request body
  const { content } = req.body;

  // check if the user sent the content
  if (!content) {
    res.status(400).json({ error: "Content is required" });
  }

  // get all comments associated with the post => post/id
  const comments = commentsByPostId[req.params.id] || [];

  // add the new comment to the posts' comments list
  comments.push({ id: commentId, content, status: "pending" });

  // Add the comments of this post to the rest of the commnets list
  commentsByPostId[req.params.id] = comments;

  // Once the comment is created emit an event to the event bus
  await axios.post("http://localhost:4005/events", {
    type: "CommnetCreated",
    data: { id: commentId, content, postId: req.params.id, status: "pending" },
  });

  res.status(201).send(comments);
});

// Waiting to recieve the the event bus
app.post("/events", async (req, res) => {
  console.log("Received event ", req.body.type);
  const { type, data } = req.body;

  if (type === "CommentModerated") {
    const { id, content, postId, status } = data;

    const commnets = commentsByPostId[postId];

    const comment = commnets.find((comment) => comment.id === id);

    comment.status = status;

    await axios.post("http://localhost:4005/events", {
      type: "CommentUpdated",
      data: { id, content, status, postId },
    });
  }

  res.send({});
});

app.listen(PORT, () => {
  logger.info(`Listening on port: ${PORT}`);
});
