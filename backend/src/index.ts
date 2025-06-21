import express from "express";
import { getUser, insertUser, run, findOne } from "./model/db.js";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";
import timetableRoutes from "./model/timetable.js";

const app = express();
const port = 3001;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Mount timetable routes
app.use("/api", timetableRoutes);

console.log("INFO | Starting Raumplaner-Backend...");

app.get("/", (req, res) => {
  //res.sendFile(path.join(__dirname, "../frontend/html/root.html"));
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

app.post("/api/register", async (req, res) => {
  const { email, password, registeredBy } = req.body;
  const authHeader = req.headers.authorization;

  // Einfache Überprüfung, ob ein Benutzer authentifiziert ist
  // In einer produktiven Umgebung würde man hier JWT oder Sessions verwenden
  if (!authHeader && !registeredBy) {
    res.status(403).json({
      success: false,
      message: "Sie müssen eingeloggt sein, um neue Benutzer zu registrieren",
    });
    return;
  }

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
    return;
  }

  // Prüfe, ob ein Benutzer mit dieser E-Mail bereits existiert
  const existingUser = await findOne("admin", { email });
  if (existingUser) {
    res.status(409).json({
      success: false,
      message: "Ein Benutzer mit dieser E-Mail existiert bereits",
    });
    return;
  }

  // Benutzer mit Informationen zum Registrierenden anlegen
  const user = await insertUser(email, password, registeredBy);

  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(500).json({
      success: false,
      message: "Fehler beim Anlegen des Benutzers",
    });
  }
});