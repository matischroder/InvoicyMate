// Express server for Facebook Messenger webhook
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Messenger Webhook is running.");
});

// TODO: Add webhook verification and message handling

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Messenger webhook listening on port ${PORT}`);
});
