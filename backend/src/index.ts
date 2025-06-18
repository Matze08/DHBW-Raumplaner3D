import express from "express";
import { getUser, run } from "./model/db.js";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
    return;
  }

  const user = await getUser(email, password);

  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});
