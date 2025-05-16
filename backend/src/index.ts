import express from "express";
import db from "./model/db.js";
import path from "path";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "../")));
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
  res.send(await db());
});
