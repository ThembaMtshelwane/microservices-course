import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import logger from "./utils/logger.js";
import cors from "cors";

const app = express();
const PORT = 4005;

app.use(bodyParser.json());
app.use(cors());

app.post("/events", async (req, res) => {
  const event = req.body;

  await axios.post("http://localhost:4000/events", event); // send event to posts
  await axios.post("http://localhost:4001/events", event); // send event to commnets
  await axios.post("http://localhost:4002/events", event); // send event to query
  await axios.post("http://localhost:4003/events", event); // send event to moderation

  res.send({ status: "OK" });
});

app.listen(PORT, () => {
  logger.info(`Listening on port: ${PORT}`);
});
