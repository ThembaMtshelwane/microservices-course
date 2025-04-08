import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const PORT = 4003;

app.use(bodyParser.json());

// Catch any events from the event bus
app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  if (type === "CommnetCreated") {
    const status = data.content.includes("orange") ? "rejected" : "approved";

    await axios.post("http://localhost:4005/events", {
      type: "CommentModerated",
      data: { id: data.id, postId: data.postId, status, content: data.content },
    });
  }
  res.send({});
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
