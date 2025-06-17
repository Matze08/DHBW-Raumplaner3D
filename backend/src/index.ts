import express from "express";
import { getUser, run } from "./model/db.js";
import path from "path";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

console.log("INFO | Starting Raumplaner-Backend...");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/html/root.html"));
});

app.listen(port, () => {
  console.log(`INFO | Raumplaner-Backend listening on port ${port}`);
});

app.get("/api/", async (req, res) => {
  //res.send("Raumplaner-Backend API");
  res.send(await run());
});

app.get("/api/login/", async (req, res) => {
  const { username, password } = req.query;

  if (!username || !password) {
    res.status(400).send("Username and password are required");
    return;
  }

  const user = await getUser(username as string, password as string);

  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});
