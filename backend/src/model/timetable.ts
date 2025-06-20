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

// DELETE a booking by ID
router.delete("/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;
    
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid booking ID format" });
      return;
    }
    
    const result = await deleteOne("buchung", { _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    
    res.json({ success: true, deleted: true, message: "Booking successfully deleted" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

// POST filter bookings
router.post("/bookings/filter", async (req, res) => {
  try {
    const filter: BuchungFilter = req.body;
    const query: any = {};
    
    // If date is provided, filter by the whole week containing that date
    if (filter.date) {
      const selectedDate = new Date(filter.date);
      
      // Get the Monday of the week containing the selected date
      const monday = new Date(selectedDate);
      const dayOfWeek = monday.getDay(); // 0 = Sunday, 1 = Monday, ...
      
      // Adjust to get Monday (if selectedDate is Sunday, we get Monday of previous week)
      monday.setDate(monday.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0); // Start of Monday
      
      // Get the end of Friday (Sunday 00:00 technically)
      const saturday = new Date(monday);
      saturday.setDate(monday.getDate() + 6); // Saturday (end of week)
      saturday.setHours(0, 0, 0, 0); // Start of Saturday
      
      query.zeitStart = {
        $gte: monday,
        $lt: saturday
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

// POST create new booking
router.post("/bookings", async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Validate required fields
    if (!bookingData.raum || !bookingData.kurs || !bookingData.lehrbeauftragter || 
        !bookingData.vorlesung || !bookingData.zeitStart || !bookingData.zeitEnde) {
      res.status(400).json({ error: "Missing required booking information" });
      return;
    }
    
    // Convert string IDs to ObjectIds
    const booking = {
      raum: new ObjectId(bookingData.raum),
      kurs: new ObjectId(bookingData.kurs),
      lehrbeauftragter: new ObjectId(bookingData.lehrbeauftragter),
      vorlesung: new ObjectId(bookingData.vorlesung),
      zeitStart: new Date(bookingData.zeitStart),
      zeitEnde: new Date(bookingData.zeitEnde)
    };
    
    // Validate booking time
    if (booking.zeitEnde <= booking.zeitStart) {
      res.status(400).json({ error: "End time must be after start time" });
      return;
    }
    
    // Check for time conflicts with existing bookings
    const conflictQuery = {
      raum: booking.raum,
      $or: [
        // New booking starts during an existing booking
        {
          zeitStart: { $lte: booking.zeitStart },
          zeitEnde: { $gt: booking.zeitStart }
        },
        // New booking ends during an existing booking
        {
          zeitStart: { $lt: booking.zeitEnde },
          zeitEnde: { $gte: booking.zeitEnde }
        },
        // New booking completely contains an existing booking
        {
          zeitStart: { $gte: booking.zeitStart },
          zeitEnde: { $lte: booking.zeitEnde }
        }
      ]
    };
    
    const existingBookings = await find("buchung", conflictQuery);
    
    if (existingBookings.length > 0) {
       res.status(409).json({ 
        error: "Time conflict with existing booking",
        conflicts: existingBookings
      });
      return;
    }
    
    // Insert the new booking
    const result = await insertOne("buchung", booking);
    
    // Fetch the newly created booking with populated fields
    const newBooking = await findOne("buchung", { _id: result.insertedId });
    const populatedBooking = await populateBooking(newBooking);
    
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: populatedBooking
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// PUT update an existing booking
router.put("/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const bookingData = req.body;
    
    // Validate required fields
    if (!bookingData.raum || !bookingData.kurs || !bookingData.lehrbeauftragter || 
        !bookingData.vorlesung || !bookingData.zeitStart || !bookingData.zeitEnde) {
       res.status(400).json({ error: "Missing required booking information" });
       return;
    }
    
    // Validate ID format
    if (!ObjectId.isValid(id)) {
       res.status(400).json({ error: "Invalid booking ID format" });
      return;
    }
    
    // Convert string IDs to ObjectIds
    const booking = {
      raum: new ObjectId(bookingData.raum),
      kurs: new ObjectId(bookingData.kurs),
      lehrbeauftragter: new ObjectId(bookingData.lehrbeauftragter),
      vorlesung: new ObjectId(bookingData.vorlesung),
      zeitStart: new Date(bookingData.zeitStart),
      zeitEnde: new Date(bookingData.zeitEnde)
    };
    
    // Validate booking time
    if (booking.zeitEnde <= booking.zeitStart) {
       res.status(400).json({ error: "End time must be after start time" });
       return;
    }
    
    // Check for time conflicts with existing bookings (excluding this booking)
    const conflictQuery = {
      _id: { $ne: new ObjectId(id) },
      raum: booking.raum,
      $or: [
        // Updated booking starts during an existing booking
        {
          zeitStart: { $lte: booking.zeitStart },
          zeitEnde: { $gt: booking.zeitStart }
        },
        // Updated booking ends during an existing booking
        {
          zeitStart: { $lt: booking.zeitEnde },
          zeitEnde: { $gte: booking.zeitEnde }
        },
        // Updated booking completely contains an existing booking
        {
          zeitStart: { $gte: booking.zeitStart },
          zeitEnde: { $lte: booking.zeitEnde }
        }
      ]
    };
    
    const existingBookings = await find("buchung", conflictQuery);
    
    if (existingBookings.length > 0) {
       res.status(409).json({ 
        error: "Time conflict with existing booking",
        conflicts: existingBookings
      });
      return;
    }
    
    // Update the booking
    const result = await updateOne(
      "buchung", 
      { _id: new ObjectId(id) }, 
      { $set: booking }
    );
    
    if (result.matchedCount === 0) {
       res.status(404).json({ error: "Booking not found" });
       return;
    }
    
    // Fetch the updated booking with populated fields
    const updatedBooking = await findOne("buchung", { _id: new ObjectId(id) });
    const populatedBooking = await populateBooking(updatedBooking);
    
    res.json({
      success: true,
      message: "Booking updated successfully",
      booking: populatedBooking
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Failed to update booking" });
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
