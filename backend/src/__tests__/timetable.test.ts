import request from 'supertest';
import express from 'express';
import { ObjectId } from 'mongodb';
import { find } from '../model/db';

// Mock die Datenbankfunktionen
jest.mock('../model/db', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  insertOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
}));

const mockedFind = find as jest.MockedFunction<typeof find>;

describe('Timetable API Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    // Setup Express App für Tests mit manueller Route-Definition
    app = express();
    app.use(express.json());

    // Definiere die Routen direkt für Tests
    app.get('/api/rooms', async (req, res) => {
      try {
        const rooms = await find("raum");
        res.json(rooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ error: "Failed to fetch rooms" });
      }
    });

    app.get('/api/lecturers', async (req, res) => {
      try {
        const lecturers = await find("lehrbeauftragter");
        res.json(lecturers);
      } catch (error) {
        console.error("Error fetching lecturers:", error);
        res.status(500).json({ error: "Failed to fetch lecturers" });
      }
    });

    app.get('/api/lectures', async (req, res) => {
      try {
        const lectures = await find("vorlesung");
        res.json(lectures);
      } catch (error) {
        console.error("Error fetching lectures:", error);
        res.status(500).json({ error: "Failed to fetch lectures" });
      }
    });

    app.get('/api/courses', async (req, res) => {
      try {
        const courses = await find("kurs");
        res.json(courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
      }
    });

    // Clear alle Mocks vor jedem Test
    jest.clearAllMocks();
  });

  describe('GET /api/rooms', () => {
    it('sollte alle Räume erfolgreich abrufen', async () => {
      const mockRooms = [
        { _id: new ObjectId(), name: 'Raum 101', capacity: 30 },
        { _id: new ObjectId(), name: 'Raum 102', capacity: 25 },
      ];
      mockedFind.mockResolvedValue(mockRooms);

      const response = await request(app).get('/api/rooms');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe('Raum 101');
      expect(response.body[1].name).toBe('Raum 102');
      expect(mockedFind).toHaveBeenCalledWith('raum');
    });

    it('sollte 500 bei Datenbankfehler zurückgeben', async () => {
      mockedFind.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/rooms');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch rooms');
    });
  });

  describe('GET /api/lecturers', () => {
    it('sollte alle Lehrbeauftragten erfolgreich abrufen', async () => {
      const mockLecturers = [
        { _id: new ObjectId(), name: 'Prof. Dr. Müller', email: 'mueller@dhbw.de' },
        { _id: new ObjectId(), name: 'Dr. Schmidt', email: 'schmidt@dhbw.de' },
      ];
      mockedFind.mockResolvedValue(mockLecturers);

      const response = await request(app).get('/api/lecturers');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe('Prof. Dr. Müller');
      expect(response.body[1].name).toBe('Dr. Schmidt');
      expect(mockedFind).toHaveBeenCalledWith('lehrbeauftragter');
    });

    it('sollte 500 bei Datenbankfehler zurückgeben', async () => {
      mockedFind.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/lecturers');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch lecturers');
    });
  });

  describe('GET /api/lectures', () => {
    it('sollte alle Vorlesungen erfolgreich abrufen', async () => {
      const mockLectures = [
        { 
          _id: new ObjectId(), 
          name: 'Mathematik I', 
          lecturer: 'Prof. Dr. Müller',
          duration: 90 
        },
        { 
          _id: new ObjectId(), 
          name: 'Programmierung', 
          lecturer: 'Dr. Schmidt',
          duration: 120 
        },
      ];
      mockedFind.mockResolvedValue(mockLectures);

      const response = await request(app).get('/api/lectures');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe('Mathematik I');
      expect(response.body[1].name).toBe('Programmierung');
      expect(mockedFind).toHaveBeenCalledWith('vorlesung');
    });

    it('sollte 500 bei Datenbankfehler zurückgeben', async () => {
      mockedFind.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/lectures');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch lectures');
    });
  });

  describe('GET /api/courses', () => {
    it('sollte alle Kurse erfolgreich abrufen', async () => {
      const mockCourses = [
        { 
          _id: new ObjectId(), 
          name: 'TINF21B', 
          semester: 5,
          students: 28 
        },
        { 
          _id: new ObjectId(), 
          name: 'WINF20A', 
          semester: 7,
          students: 25 
        },
      ];
      mockedFind.mockResolvedValue(mockCourses);

      const response = await request(app).get('/api/courses');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe('TINF21B');
      expect(response.body[1].name).toBe('WINF20A');
      expect(mockedFind).toHaveBeenCalledWith('kurs');
    });

    it('sollte 500 bei Datenbankfehler zurückgeben', async () => {
      mockedFind.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/courses');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch courses');
    });
  });

  describe('Error Handling', () => {
    it('sollte alle Endpunkte mit derselben Fehlerbehandlung testen', async () => {
      const endpoints = ['/api/rooms', '/api/lecturers', '/api/lectures', '/api/courses'];
      
      for (const endpoint of endpoints) {
        mockedFind.mockRejectedValue(new Error('Database connection failed'));
        
        const response = await request(app).get(endpoint);
        
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Failed to fetch');
      }
    });
  });
});
