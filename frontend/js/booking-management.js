// Constants for time display
const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_HEIGHT = 60; // Height in pixels for an hour (2 x 30px rows)
const API_BASE_URL = "http://localhost:3001/api";

// DOM Elements
const timetableBody = document.getElementById("timetableBody");
const roomFilter = document.getElementById("roomFilter");
const courseFilter = document.getElementById("courseFilter");
const lecturerFilter = document.getElementById("lecturerFilter");
const lectureFilter = document.getElementById("lectureFilter");
const dateFilter = document.getElementById("dateFilter");
const applyFilterBtn = document.getElementById("applyFilter");
const resetFilterBtn = document.getElementById("resetFilter");
const addBookingBtn = document.getElementById("addBooking");
const adminInfoElement = document.getElementById("adminInfo");

// Modal elements
const bookingModal = document.getElementById("bookingModal");
const modalClose = document.querySelector(".close");
const bookingForm = document.getElementById("bookingForm");
const modalRoom = document.getElementById("modalRoom");
const modalCourse = document.getElementById("modalCourse");
const modalLecturer = document.getElementById("modalLecturer");
const modalLecture = document.getElementById("modalLecture");
const modalDate = document.getElementById("modalDate");
const modalStartTime = document.getElementById("modalStartTime");
const modalEndTime = document.getElementById("modalEndTime");
const modalBookingId = document.getElementById("modalBookingId");
const saveBookingBtn = document.getElementById("saveBooking");
const deleteBookingBtn = document.getElementById("deleteBooking");
const cancelBookingBtn = document.getElementById("cancelBooking");

// Current user data
let currentUser = null;

// Set today's date as default for date filter
const today = new Date();
dateFilter.value = today.toISOString().split("T")[0];

// Initialize the booking management page
document.addEventListener("DOMContentLoaded", async () => {
  // Check if user is logged in and is an admin
  checkAdminAccess();

  // Initialize the timetable structure
  createTimetableStructure();

  // Update dates in the header
  updateDateHeaders();

  // Load filter options
  await loadFilterOptions();

  // Load bookings with default filters (today's date)
  await loadBookings();

  // Set up event listeners
  setupEventListeners();
});

// Check if the user is logged in and is an admin
function checkAdminAccess() {
  const userJson = localStorage.getItem("user");
  
  if (!userJson) {
    // User is not logged in, redirect to login page
    alert("Sie müssen eingeloggt sein, um auf die Buchungsverwaltung zuzugreifen.");
    window.location.href = "login.html";
    return;
  }
  
  currentUser = JSON.parse(userJson);
  
  // Display admin info
  adminInfoElement.textContent = `Eingeloggt als: ${currentUser.email || 'Administrator'}`;
}

// Create the basic timetable structure
function createTimetableStructure() {
  timetableBody.innerHTML = "";

  // Create rows for each hour
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    // Create half-hour rows
    for (let minute = 0; minute < 60; minute += 30) {
      const timeRow = document.createElement("div");
      timeRow.className = "time-row";

      // Time cell
      const timeCell = document.createElement("div");
      timeCell.className = "time-cell";

      // Only show time for full hours, leave half-hour cells empty
      if (minute === 0) {
        timeCell.textContent = `${hour.toString().padStart(2, "0")}:00`;
      } else {
        timeCell.innerHTML = "&nbsp;"; // Empty space to maintain cell structure
      }

      // Day cells container
      const dayCells = document.createElement("div");
      dayCells.className = "day-cells";

      // Create cells for each day of the week (Monday to Friday)
      for (let day = 0; day < 5; day++) {
        const dayCell = document.createElement("div");
        dayCell.className = "day-cell";
        dayCell.dataset.day = day;
        dayCell.dataset.hour = hour;
        dayCell.dataset.minute = minute;
        // Add click event to create a new booking
        dayCell.addEventListener("click", () => openNewBookingModal(day, hour, minute));

        dayCells.appendChild(dayCell);
      }

      timeRow.appendChild(timeCell);
      timeRow.appendChild(dayCells);
      timetableBody.appendChild(timeRow);
    }
  }
}

// Update the date headers in the timetable
function updateDateHeaders() {
  // Get the Monday of the current week
  const mondayDate = getMonday(new Date(dateFilter.value));
  
  // Update each day's date display
  for (let i = 0; i < 5; i++) {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + i);
    
    const formattedDate = date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit"
    });
    
    document.getElementById(`date-${getDayName(i)}`).textContent = formattedDate;
  }
}

// Get the Monday of the week for a given date
function getMonday(date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(date.setDate(diff));
}

// Get day name by index (0 = Monday, 4 = Friday)
function getDayName(index) {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  return days[index];
}

// Load all filter options from the backend
async function loadFilterOptions() {
  try {
    // Load rooms
    const rooms = await fetchData("/rooms");
    populateFilterSelect(roomFilter, rooms, "bezeichnung", "_id");
    populateFilterSelect(modalRoom, rooms, "bezeichnung", "_id");

    // Load courses
    const courses = await fetchData("/courses");
    populateFilterSelect(courseFilter, courses, "bezeichnung", "_id");
    populateFilterSelect(modalCourse, courses, "bezeichnung", "_id");

    // Load lecturers
    const lecturers = await fetchData("/lecturers");
    populateFilterSelect(lecturerFilter, lecturers, "name", "_id");
    populateFilterSelect(modalLecturer, lecturers, "name", "_id");

    // Load lectures
    const lectures = await fetchData("/lectures");
    populateFilterSelect(lectureFilter, lectures, "bezeichnung", "_id");
    populateFilterSelect(modalLecture, lectures, "bezeichnung", "_id");
  } catch (error) {
    console.error("Error loading filter options:", error);
    alert("Fehler beim Laden der Filterdaten. Bitte versuchen Sie es später erneut.");
  }
}

// Populate a select element with options
function populateFilterSelect(selectElement, data, textKey, valueKey) {
  // Keep the first option (typically "All...")
  const firstOption = selectElement.options[0];
  selectElement.innerHTML = "";
  selectElement.appendChild(firstOption);
  
  // Add options from data
  data.forEach(item => {
    const option = document.createElement("option");
    option.text = item[textKey];
    option.value = item[valueKey];
    selectElement.appendChild(option);
  });
}

// Load bookings based on current filters
async function loadBookings() {
  try {
    // Clear any existing bookings
    clearBookings();
    
    // Get filter values
    const filters = {
      room: roomFilter.value,
      course: courseFilter.value,
      lecturer: lecturerFilter.value,
      lecture: lectureFilter.value,
      date: dateFilter.value
    };
    
    // Get bookings from API with filters
    const bookings = await fetchData("/bookings", filters);
    
    // Display bookings in the timetable
    displayBookings(bookings);
  } catch (error) {
    console.error("Error loading bookings:", error);
    alert("Fehler beim Laden der Buchungen. Bitte versuchen Sie es später erneut.");
  }
}

// Clear all bookings from the timetable
function clearBookings() {
  const existingBookings = document.querySelectorAll(".booking-event");
  existingBookings.forEach(booking => booking.remove());
}

// Display bookings in the timetable
function displayBookings(bookings) {
  // Get the Monday of the current week
  const mondayDate = getMonday(new Date(dateFilter.value));
  
  bookings.forEach(booking => {
    // Create booking element
    const bookingDate = new Date(booking.datum);
    
    // Calculate day index (0 = Monday, 4 = Friday)
    const dayDiff = Math.floor((bookingDate - mondayDate) / (24 * 60 * 60 * 1000));
    
    // Skip if not in current week or not Mon-Fri
    if (dayDiff < 0 || dayDiff > 4) return;
    
    // Parse start and end times
    const startTime = parseTime(booking.startzeit);
    const endTime = parseTime(booking.endzeit);
    
    // Calculate position and height
    const startPosition = calculatePosition(startTime.hour, startTime.minute);
    const endPosition = calculatePosition(endTime.hour, endTime.minute);
    const height = endPosition - startPosition;
    
    // Create booking element
    const bookingElement = document.createElement("div");
    bookingElement.className = "booking-event";
    bookingElement.dataset.id = booking._id;
    bookingElement.style.top = `${startPosition}px`;
    bookingElement.style.height = `${height}px`;
    
    // Determine the day column to place the booking
    const dayColumns = document.querySelectorAll(".day-cells");
    const columnsArray = Array.from(dayColumns);
    
    // Find the cells for the given day
    for (let i = 0; i < columnsArray.length; i++) {
      const dayCells = columnsArray[i].querySelectorAll(".day-cell");
      const targetCell = dayCells[dayDiff];
      
      if (targetCell && targetCell.dataset.hour == startTime.hour && 
          targetCell.dataset.minute == startTime.minute) {
        // Set the booking content
        bookingElement.innerHTML = `
          <div class="booking-event-header">${booking.vorlesung.bezeichnung}</div>
          <div class="booking-event-details">Raum: ${booking.raum.bezeichnung}</div>
          <div class="booking-event-details">Kurs: ${booking.kurs.bezeichnung}</div>
          <div class="booking-event-details">Dozent: ${booking.dozent.name}</div>
        `;
        
        // Add click event to edit booking
        bookingElement.addEventListener("click", (event) => {
          event.stopPropagation();
          openEditBookingModal(booking);
        });
        
        // Add booking to the day cell
        targetCell.appendChild(bookingElement);
        break;
      }
    }
  });
}

// Parse time string into hour and minute
function parseTime(timeString) {
  const [hour, minute] = timeString.split(":").map(Number);
  return { hour, minute };
}

// Calculate vertical position based on hour and minute
function calculatePosition(hour, minute) {
  const hourOffset = hour - START_HOUR;
  const minuteOffset = minute / 60;
  return (hourOffset + minuteOffset) * HOUR_HEIGHT;
}

// Set up event listeners
function setupEventListeners() {
  // Filter buttons
  applyFilterBtn.addEventListener("click", loadBookings);
  resetFilterBtn.addEventListener("click", resetFilters);
  
  // Add booking button
  addBookingBtn.addEventListener("click", () => openNewBookingModal());
  
  // Date filter change
  dateFilter.addEventListener("change", () => {
    updateDateHeaders();
    loadBookings();
  });
  
  // Modal close button
  modalClose.addEventListener("click", closeModal);
  cancelBookingBtn.addEventListener("click", closeModal);
  
  // Booking form submission
  bookingForm.addEventListener("submit", handleBookingFormSubmit);
  
  // Delete booking button
  deleteBookingBtn.addEventListener("click", handleDeleteBooking);
}

// Reset all filters to default values
function resetFilters() {
  roomFilter.value = "";
  courseFilter.value = "";
  lecturerFilter.value = "";
  lectureFilter.value = "";
  dateFilter.value = new Date().toISOString().split("T")[0];
  updateDateHeaders();
  loadBookings();
}

// Open modal to create a new booking
function openNewBookingModal(day = 0, hour = 8, minute = 0) {
  // Set form defaults
  bookingForm.reset();
  modalBookingId.value = ""; // New booking, no ID
  
  // Set default date (Monday of current week + day offset)
  const mondayDate = getMonday(new Date(dateFilter.value));
  const bookingDate = new Date(mondayDate);
  bookingDate.setDate(mondayDate.getDate() + day);
  modalDate.value = bookingDate.toISOString().split("T")[0];
  
  // Set default times
  modalStartTime.value = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  let endHour = hour + 1;
  if (endHour >= END_HOUR) endHour = END_HOUR - 1;
  modalEndTime.value = `${endHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  
  // Update modal title and show delete button
  document.getElementById("modalTitle").textContent = "Neue Buchung erstellen";
  deleteBookingBtn.style.display = "none";
  
  // Show modal
  bookingModal.style.display = "block";
}

// Open modal to edit an existing booking
function openEditBookingModal(booking) {
  // Fill form with booking data
  modalBookingId.value = booking._id;
  modalRoom.value = booking.raum._id;
  modalCourse.value = booking.kurs._id;
  modalLecturer.value = booking.dozent._id;
  modalLecture.value = booking.vorlesung._id;
  
  // Set date and times
  modalDate.value = new Date(booking.datum).toISOString().split("T")[0];
  modalStartTime.value = booking.startzeit;
  modalEndTime.value = booking.endzeit;
  
  // Update modal title and show delete button
  document.getElementById("modalTitle").textContent = "Buchung bearbeiten";
  deleteBookingBtn.style.display = "inline-block";
  
  // Show modal
  bookingModal.style.display = "block";
}

// Close the booking modal
function closeModal() {
  bookingModal.style.display = "none";
}

// Handle booking form submission (create or update)
async function handleBookingFormSubmit(event) {
  event.preventDefault();
  
  // Get form data
  const bookingData = {
    raum: modalRoom.value,
    kurs: modalCourse.value,
    dozent: modalLecturer.value,
    vorlesung: modalLecture.value,
    datum: modalDate.value,
    startzeit: modalStartTime.value,
    endzeit: modalEndTime.value
  };
  
  try {
    // Check if creating or updating
    const isNewBooking = !modalBookingId.value;
    const url = isNewBooking ? 
      `${API_BASE_URL}/bookings` : 
      `${API_BASE_URL}/bookings/${modalBookingId.value}`;
    
    const method = isNewBooking ? "POST" : "PUT";
    
    // Call API
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${currentUser._id}`
      },
      body: JSON.stringify(bookingData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Ein Fehler ist aufgetreten");
    }
    
    // Success
    alert(isNewBooking ? "Buchung erfolgreich erstellt!" : "Buchung erfolgreich aktualisiert!");
    closeModal();
    loadBookings(); // Refresh the bookings display
  } catch (error) {
    console.error("Error saving booking:", error);
    alert(`Fehler: ${error.message}`);
  }
}

// Handle booking deletion
async function handleDeleteBooking() {
  // Check if there's a booking ID
  if (!modalBookingId.value) {
    alert("Keine gültige Buchung zum Löschen ausgewählt.");
    return;
  }
  
  // Confirm deletion
  if (!confirm("Sind Sie sicher, dass Sie diese Buchung löschen möchten?")) {
    return;
  }
  
  try {
    // Call API to delete booking
    const response = await fetch(`${API_BASE_URL}/bookings/${modalBookingId.value}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${currentUser._id}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Ein Fehler ist aufgetreten");
    }
    
    // Success
    alert("Buchung erfolgreich gelöscht!");
    closeModal();
    loadBookings(); // Refresh the bookings display
  } catch (error) {
    console.error("Error deleting booking:", error);
    alert(`Fehler: ${error.message}`);
  }
}

// Fetch data from the API
async function fetchData(endpoint, params = {}) {
  // Build query string from params
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value) // Filter out empty values
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  
  const url = `${API_BASE_URL}${endpoint}${queryParams ? `?${queryParams}` : ""}`;
  
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${currentUser?._id || ""}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return await response.json();
}
