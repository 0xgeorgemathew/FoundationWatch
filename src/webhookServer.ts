import express from "express";
import bodyParser from "body-parser";
import { spawn } from "child_process";

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
  console.log("Webhook received:", req.body);

  if (process.send) {
    process.send({ type: "webhook", data: req.body });
  }
  res.status(200).send("Webhook Server Triggered");
});

app.listen(port, () => {
  console.log(`Webhook listening on port ${port}`);
});
