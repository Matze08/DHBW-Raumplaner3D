import express, { Router } from "express";
import { find, findOne, insertOne, updateOne, deleteOne } from "./db.js";
import { ObjectId } from "mongodb";
import { BuchungFilter } from "./interfaces.js";

const router = Router();

// GET all rooms
router.get("/rooms", async (req, res) => {
  try {
    const rooms = await find("raum");
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// GET all lecturers
router.get("/lecturers", async (req, res) => {
  try {
    const lecturers = await find("lehrbeauftragter");
    res.json(lecturers);
  } catch (error) {
    console.error("Error fetching lecturers:", error);
    res.status(500).json({ error: "Failed to fetch lecturers" });
  }
});

// GET all lectures
router.get("/lectures", async (req, res) => {
  try {
    const lectures = await find("vorlesung");
    res.json(lectures);
  } catch (error) {
    console.error("Error fetching lectures:", error);
    res.status(500).json({ error: "Failed to fetch lectures" });
  }
});

// GET all courses
router.get("/courses", async (req, res) => {
  try {
    const courses = await find("kurs");
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// GET all bookings
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await find("buchung");
    // Populate related entities
    const populatedBookings = await populateBookings(bookings);
    res.json(populatedBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// GET a specific booking by ID
router.get("/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await findOne("buchung", { _id: new ObjectId(id) });
    
    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    
    // Populate related entities
    const populatedBooking = await populateBooking(booking);
    res.json(populatedBooking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});

// POST filter bookings
router.post("/bookings/filter", async (req, res) => {
  try {
    const filter: BuchungFilter = req.body;
    const query: any = {};
    
    // If date is provided, filter by date
    if (filter.date) {
      const selectedDate = new Date(filter.date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.zeitStart = {
        $gte: selectedDate,
        $lt: nextDay
      };
    }
    
    // Add other filters if provided
    if (filter.roomId) {
      query.raum = new ObjectId(filter.roomId);
    }
    
    if (filter.courseId) {
      query.kurs = new ObjectId(filter.courseId);
    }
    
    if (filter.lecturerId) {
      query.lehrbeauftragter = new ObjectId(filter.lecturerId);
    }
    
    if (filter.lectureId) {
      query.vorlesung = new ObjectId(filter.lectureId);
    }
    
    const bookings = await find("buchung", query);
    
    // Populate related entities
    const populatedBookings = await populateBookings(bookings);
    res.json(populatedBookings);
  } catch (error) {
    console.error("Error filtering bookings:", error);
    res.status(500).json({ error: "Failed to filter bookings" });
  }
});

// Helper function to populate a single booking with related entities
async function populateBooking(booking: any) {
  if (!booking) return null;
  
  const populated = { ...booking };
  
  // Populate room
  if (booking.raum && booking.raum instanceof ObjectId) {
    populated.raum = await findOne("raum", { _id: booking.raum });
  }
  
  // Populate lecturer
  if (booking.lehrbeauftragter && booking.lehrbeauftragter instanceof ObjectId) {
    populated.lehrbeauftragter = await findOne("lehrbeauftragter", { _id: booking.lehrbeauftragter });
  }
  
  // Populate lecture
  if (booking.vorlesung && booking.vorlesung instanceof ObjectId) {
    populated.vorlesung = await findOne("vorlesung", { _id: booking.vorlesung });
  }
  
  // Populate course
  if (booking.kurs && booking.kurs instanceof ObjectId) {
    populated.kurs = await findOne("kurs", { _id: booking.kurs });
  }
  
  return populated;
}

// Helper function to populate multiple bookings with related entities
async function populateBookings(bookings: any[]) {
  if (!bookings || bookings.length === 0) return [];
  
  const populatedBookings = [];
  
  for (const booking of bookings) {
    const populatedBooking = await populateBooking(booking);
    populatedBookings.push(populatedBooking);
  }
  
  return populatedBookings;
}

export default router;
