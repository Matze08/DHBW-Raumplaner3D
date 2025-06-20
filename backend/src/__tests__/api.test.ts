import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ObjectId } from 'mongodb';
import { getUser, insertUser, findOne } from '../model/db';

// Mock die Datenbankfunktionen
jest.mock('../model/db', () => ({
  getUser: jest.fn(),
  insertUser: jest.fn(),
  findOne: jest.fn(),
  run: jest.fn(),
}));

// Mock für timetable routes
jest.mock('../model/timetable', () => {
  const mockRouter = {
    use: jest.fn(),
  };
  return mockRouter;
});

const mockedGetUser = getUser as jest.MockedFunction<typeof getUser>;
const mockedInsertUser = insertUser as jest.MockedFunction<typeof insertUser>;
const mockedFindOne = findOne as jest.MockedFunction<typeof findOne>;

describe('Backend API Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    // Setup Express App für Tests
    app = express();
    app.use(cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // Login Route
    app.post("/api/login", async (req, res) => {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: "Email and password are required" });
        return;
      }

      const user = await getUser(email, password);

      if (user) {
        res.json({ success: true, user });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    });

    // Register Route
    app.post("/api/register", async (req, res) => {
      const { email, password, registeredBy } = req.body;
      const authHeader = req.headers.authorization;

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

      const existingUser = await findOne("admin", { email });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "Ein Benutzer mit dieser E-Mail existiert bereits",
        });
        return;
      }

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

    // Clear alle Mocks vor jedem Test
    jest.clearAllMocks();
  });

  describe('POST /api/login', () => {
    it('sollte erfolgreich einloggen mit gültigen Credentials', async () => {
      const mockUser = { 
        _id: new ObjectId(), 
        email: 'test@example.com', 
        passwordHash: 'hashedpassword' 
      };
      mockedGetUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/login')
        .send({ email: 'test@example.com', password: 'hashedpassword' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(mockUser.email);
      expect(response.body.user.passwordHash).toBe(mockUser.passwordHash);
      expect(mockedGetUser).toHaveBeenCalledWith('test@example.com', 'hashedpassword');
    });

    it('sollte 401 zurückgeben bei ungültigen Credentials', async () => {
      mockedGetUser.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/login')
        .send({ email: 'wrong@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('sollte 400 zurückgeben wenn Email oder Password fehlen', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email and password are required');
    });
  });

  describe('POST /api/register', () => {
    it('sollte erfolgreich registrieren wenn Authorization Header vorhanden', async () => {
      const mockInsertResult = { 
        insertedId: new ObjectId(),
        acknowledged: true
      };
      mockedFindOne.mockResolvedValue(null); // Kein existierender User
      mockedInsertUser.mockResolvedValue(mockInsertResult as any);

      const response = await request(app)
        .post('/api/register')
        .set('Authorization', 'Bearer token')
        .send({ email: 'new@example.com', password: 'newpassword' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.acknowledged).toBe(true);
      expect(response.body.user.insertedId).toBeDefined();
    });

    it('sollte 409 zurückgeben wenn User bereits existiert', async () => {
      const existingUser = { 
        _id: new ObjectId(),
        email: 'existing@example.com' 
      };
      mockedFindOne.mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/api/register')
        .set('Authorization', 'Bearer token')
        .send({ email: 'existing@example.com', password: 'password' });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Ein Benutzer mit dieser E-Mail existiert bereits');
    });

    it('sollte 403 zurückgeben ohne Authorization', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({ email: 'new@example.com', password: 'newpassword' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Sie müssen eingeloggt sein, um neue Benutzer zu registrieren');
    });
  });
});
