// Sample data for testing the timetable functionality
import { insertOne } from "./model/db.js";
import { ObjectId } from "mongodb";

async function seedDatabase() {
  console.log("Starting database seeding for timetable functionality...");
  
  // Clear existing data
  // Note: In a production environment, you would want to be more careful with this
  // and probably not delete existing data
  
  // Add rooms
  const rooms = [
    { bezeichnung: "252" },
    { bezeichnung: "253" },
    { bezeichnung: "254" },
    { bezeichnung: "255" },
    { bezeichnung: "351" },
    { bezeichnung: "352" },
    { bezeichnung: "353" },
    { bezeichnung: "354" },
    { bezeichnung: "451" },
    { bezeichnung: "452" }
  ];
  
  const roomIds: ObjectId[] = [];
  for (const room of rooms) {
    const result = await insertOne("raum", room);
    roomIds.push(result.insertedId);
    console.log(`Added room: ${room.bezeichnung}`);
  }
  
  // Add lecturers
  const lecturers = [
    { vorname: "Max", nachname: "Mustermann", firma: "DHBW", mail: "max.mustermann@dhbw-stuttgart.de" },
    { vorname: "Anna", nachname: "Schmidt", firma: "IBM", mail: "a.schmidt@ibm.com" },
    { vorname: "Thomas", nachname: "Müller", firma: "Bosch", mail: "t.mueller@bosch.de" },
    { vorname: "Laura", nachname: "Weber", firma: "DHBW", mail: "laura.weber@dhbw-stuttgart.de" },
    { vorname: "Michael", nachname: "Fischer", firma: "Mercedes-Benz", mail: "m.fischer@daimler.com" }
  ];
  
  const lecturerIds: ObjectId[] = [];
  for (const lecturer of lecturers) {
    const result = await insertOne("lehrbeauftragter", lecturer);
    lecturerIds.push(result.insertedId);
    console.log(`Added lecturer: ${lecturer.vorname} ${lecturer.nachname}`);
  }
  
  // Add lectures
  const lectures = [
    { bezeichnung: "Programmierung I" },
    { bezeichnung: "Datenbanken" },
    { bezeichnung: "Wirtschaftsmathematik" },
    { bezeichnung: "Software Engineering" },
    { bezeichnung: "Betriebssysteme" },
    { bezeichnung: "Algorithmen und Datenstrukturen" },
    { bezeichnung: "Web Engineering" },
    { bezeichnung: "IT-Sicherheit" }
  ];
  
  const lectureIds: ObjectId[] = [];
  for (const lecture of lectures) {
    const result = await insertOne("vorlesung", lecture);
    lectureIds.push(result.insertedId);
    console.log(`Added lecture: ${lecture.bezeichnung}`);
  }
  
  // Add courses
  const courses = [
    { bezeichnung: "WWI2020A", fakultaet: "Wirtschaft" },
    { bezeichnung: "WWI2020B", fakultaet: "Wirtschaft" },
    { bezeichnung: "TIF2020A", fakultaet: "Technik" },
    { bezeichnung: "TIF2020B", fakultaet: "Technik" },
    { bezeichnung: "INF2020", fakultaet: "Technik" }
  ];
  
  const courseIds: ObjectId[] = [];
  for (const course of courses) {
    const result = await insertOne("kurs", course);
    courseIds.push(result.insertedId);
    console.log(`Added course: ${course.bezeichnung}`);
  }
  
  // Create sample bookings for the current week
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1); // Get the Monday of current week
  monday.setHours(0, 0, 0, 0);
  
  const bookings = [];
  
  // Generate a random booking
  function generateBooking(day: number, startHour: number, duration: number) {
    const startDate = new Date(monday);
    startDate.setDate(monday.getDate() + day); // 0 = Monday, 4 = Friday
    startDate.setHours(startHour, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + duration);
    
    return {
      raum: roomIds[Math.floor(Math.random() * roomIds.length)],
      lehrbeauftragter: lecturerIds[Math.floor(Math.random() * lecturerIds.length)],
      vorlesung: lectureIds[Math.floor(Math.random() * lectureIds.length)],
      kurs: courseIds[Math.floor(Math.random() * courseIds.length)],
      zeitStart: startDate,
      zeitEnde: endDate
    };
  }
  
  // Generate some sample bookings for each day
  for (let day = 0; day < 5; day++) { // Monday to Friday
    // Morning bookings (3 per day)
    bookings.push(generateBooking(day, 8, 2));  // 8:00 - 10:00
    bookings.push(generateBooking(day, 10, 2)); // 10:00 - 12:00
    
    // Afternoon bookings (2-3 per day)
    bookings.push(generateBooking(day, 13, 2));  // 13:00 - 15:00
    bookings.push(generateBooking(day, 15, 2));  // 15:00 - 17:00
    
    if (Math.random() > 0.5) {
      bookings.push(generateBooking(day, 17, 2)); // 17:00 - 19:00 (some days)
    }
  }
  
  // Add some overlapping bookings for different rooms
  bookings.push(generateBooking(1, 9, 3));  // Tuesday 9:00 - 12:00
  bookings.push(generateBooking(3, 14, 3)); // Thursday 14:00 - 17:00
  
  // Insert all bookings
  for (const booking of bookings) {
    await insertOne("buchung", booking);
  }
  
  console.log(`Added ${bookings.length} bookings`);
  console.log("Database seeding completed successfully!");
}

// Run the seeding function
seedDatabase().catch(error => {
  console.error("Error seeding database:", error);
});
