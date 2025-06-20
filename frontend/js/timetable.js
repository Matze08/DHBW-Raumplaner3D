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

// Set today's date as default for date filter
const today = new Date();
dateFilter.value = today.toISOString().split("T")[0];

// Initialize the timetable
document.addEventListener("DOMContentLoaded", async () => {
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

  // Create a modal for booking details
  createBookingModal();
});

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
        // Add a title attribute for better UX
        dayCell.title = "Klicken, um eine neue Buchung zu erstellen";

        // Add a subtle visual indicator that cells are clickable in admin view
        if (document.body.classList.contains("admin-page")) {
          dayCell.style.cursor = "pointer";
        }

        dayCells.appendChild(dayCell);
      }

      timeRow.appendChild(timeCell);
      timeRow.appendChild(dayCells);
      timetableBody.appendChild(timeRow);
    }
  }
}

// Load all filter options from the backend
async function loadFilterOptions() {
  try {
    // Load rooms
    const rooms = await fetchData("/rooms");
    populateFilterSelect(roomFilter, rooms, "bezeichnung", "_id");

    // Load courses
    const courses = await fetchData("/courses");
    populateFilterSelect(courseFilter, courses, "bezeichnung", "_id");

    // Load lecturers
    const lecturers = await fetchData("/lecturers");
    populateFilterSelect(
      lecturerFilter,
      lecturers,
      (item) => `${item.vorname} ${item.nachname}`,
      "_id"
    );

    // Load lectures
    const lectures = await fetchData("/lectures");
    populateFilterSelect(lectureFilter, lectures, "bezeichnung", "_id");
  } catch (error) {
    console.error("Error loading filter options:", error);
    showNotification("Fehler beim Laden der Filteroptionen", "error");
  }
}

// Helper function to populate select elements
function populateFilterSelect(
  selectElement,
  items,
  labelProperty,
  valueProperty
) {
  if (!items || items.length === 0) return;

  // Clear existing options except the first one (All)
  while (selectElement.options.length > 1) {
    selectElement.remove(1);
  }

  // Add options
  items.forEach((item) => {
    const option = document.createElement("option");
    if (typeof labelProperty === "function") {
      option.textContent = labelProperty(item);
    } else {
      option.textContent = item[labelProperty];
    }
    option.value = item[valueProperty];
    selectElement.appendChild(option);
  });
}

// Load bookings based on filters
async function loadBookings() {
  try {
    // Build filter object
    const filters = {
      date: dateFilter.value,
      roomId: roomFilter.value || null,
      courseId: courseFilter.value || null,
      lecturerId: lecturerFilter.value || null,
      lectureId: lectureFilter.value || null,
    };

    // Update date headers based on selected date
    updateDateHeaders(new Date(dateFilter.value));

    // Fetch bookings with filters
    const bookings = await fetchData("/bookings/filter", "POST", filters);

    // Clear existing bookings
    clearBookings();

    // Display bookings
    displayBookings(bookings);
  } catch (error) {
    console.error("Error loading bookings:", error);
    showNotification("Fehler beim Laden der Buchungen", "error");
  }
}

// Clear all bookings from the timetable
function clearBookings() {
  const bookingElements = document.querySelectorAll(".booking");
  bookingElements.forEach((el) => el.remove());
}

// Display bookings on the timetable
function displayBookings(bookings) {
  if (!bookings || bookings.length === 0) return;
  bookings.forEach((booking) => {
    // Convert dates to Date objects
    const startTime = new Date(booking.zeitStart);
    const endTime = new Date(booking.zeitEnde);

    // Calculate day index (0 = Monday, 4 = Friday)
    const dayIndex = startTime.getDay() - 1; // getDay(): 0 = Sunday, so -1 gives Monday = 0
    if (dayIndex < 0 || dayIndex > 4) return; // Skip weekends

    // Calculate position and height
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const endHour = endTime.getHours();
    const endMinute = endTime.getMinutes();

    // Find the correct cell to place the booking
    const startPositionY = calculatePositionY(startHour, startMinute);
    const height = calculateHeight(startHour, startMinute, endHour, endMinute);

    // Create booking element
    const bookingElement = document.createElement("div");
    bookingElement.className = "booking";
    bookingElement.dataset.id = booking._id;
    bookingElement.style.top = `${startPositionY}px`;
    bookingElement.style.height = `${height}px`;

    // Add booking content
    bookingElement.innerHTML = `
      <div class="booking-title">${
        booking.vorlesung?.bezeichnung || "Keine Angabe"
      }</div>
      <div class="booking-details">
        <div class="booking-room">Raum: ${
          booking.raum?.bezeichnung || "Keine Angabe"
        }</div>
        <div class="booking-course">Kurs: ${
          booking.kurs?.bezeichnung || "Keine Angabe"
        }</div>
        <div class="booking-lecturer">Dozent: ${
          booking.lehrbeauftragter
            ? `${booking.lehrbeauftragter.vorname} ${booking.lehrbeauftragter.nachname}`
            : "Keine Angabe"
        }</div>
        <div class="booking-time">${formatTime(startTime)} - ${formatTime(
      endTime
    )}</div>
      </div>
      <button class="booking-delete-btn" title="Buchung löschen">×</button>
    `;

    // Find all cells for this day
    const dayCells = document.querySelectorAll(
      `.day-cell[data-day="${dayIndex}"]`
    );
    if (dayCells.length > 0) {
      // Add to the first cell of the day (we'll position it absolutely)
      dayCells[0].appendChild(bookingElement);

      // Add click event to show details
      bookingElement.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent event from bubbling to day cell
        showBookingDetails(booking);
      });

      // Add click event for delete button
      const deleteBtn = bookingElement.querySelector(".booking-delete-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", (event) => {
          event.stopPropagation(); // Prevent event from bubbling to day cell or booking
          deleteBooking(booking._id, event);
        });
      }
    }
  });
}

// Calculate vertical position based on time
function calculatePositionY(hour, minute) {
  // Calculate the number of half-hour slots before this time
  const halfHourSlots = (hour - START_HOUR) * 2 + Math.floor(minute / 30);

  // Each time row has a min-height of 60px (for a full hour)
  // So each half-hour slot has 30px height
  return halfHourSlots * 30;
}

// Calculate height based on duration
function calculateHeight(startHour, startMinute, endHour, endMinute) {
  // Calculate start and end in minutes since midnight
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  // Duration in minutes
  const durationMinutes = endTotalMinutes - startTotalMinutes;

  // Convert to half-hour slots
  const halfHourSlots = durationMinutes / 30;

  // Each half-hour slot is 30px high
  return halfHourSlots * 30;
}

// Format time as HH:MM
function formatTime(date) {
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

// Show booking details in a modal
function showBookingDetails(booking) {
  const modal = document.getElementById("bookingDetailsModal");
  const modalContent = modal.querySelector(".modal-content");

  // Format dates
  const startTime = new Date(booking.zeitStart);
  const endTime = new Date(booking.zeitEnde);
  const formattedDate = startTime.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Set modal content
  modalContent.innerHTML = `
    <div class="modal-header">
      <h3>${booking.vorlesung?.bezeichnung || "Buchungsdetails"}</h3>
      <button class="close-modal">&times;</button>
    </div>
    <div class="modal-detail">
      <span class="modal-label">Datum:</span>
      <span class="modal-value">${formattedDate}</span>
    </div>
    <div class="modal-detail">
      <span class="modal-label">Zeit:</span>
      <span class="modal-value">${formatTime(startTime)} - ${formatTime(
    endTime
  )}</span>
    </div>
    <div class="modal-detail">
      <span class="modal-label">Raum:</span>
      <span class="modal-value">${
        booking.raum?.bezeichnung || "Keine Angabe"
      }</span>
    </div>
    <div class="modal-detail">
      <span class="modal-label">Kurs:</span>
      <span class="modal-value">${
        booking.kurs?.bezeichnung || "Keine Angabe"
      }</span>
    </div>
    <div class="modal-detail">
      <span class="modal-label">Dozent:</span>
      <span class="modal-value">${
        booking.lehrbeauftragter
          ? `${booking.lehrbeauftragter.vorname} ${booking.lehrbeauftragter.nachname}`
          : "Keine Angabe"
      }</span>
    </div>
    ${
      booking.lehrbeauftragter?.firma
        ? `
      <div class="modal-detail">
        <span class="modal-label">Firma:</span>
        <span class="modal-value">${booking.lehrbeauftragter.firma}</span>
      </div>
    `
        : ""
    }
    ${
      booking.lehrbeauftragter?.mail
        ? `
      <div class="modal-detail">
        <span class="modal-label">E-Mail:</span>
        <span class="modal-value">${booking.lehrbeauftragter.mail}</span>
      </div>
    `
        : ""
    }
  `;

  // Show modal
  modal.style.display = "flex";

  // Close modal when clicking the close button
  const closeButton = modalContent.querySelector(".close-modal");
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close modal when clicking outside
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

// Create modal for booking details
function createBookingModal() {
  // Check if modal already exists
  if (document.getElementById("bookingDetailsModal")) return;

  const modal = document.createElement("div");
  modal.id = "bookingDetailsModal";
  modal.className = "booking-modal";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

// Setup event listeners
function setupEventListeners() {
  // Apply filter button
  applyFilterBtn.addEventListener("click", loadBookings);

  // Reset filter button
  resetFilterBtn.addEventListener("click", () => {
    roomFilter.value = "";
    courseFilter.value = "";
    lecturerFilter.value = "";
    lectureFilter.value = "";

    // Set today's date
    const today = new Date();
    dateFilter.value = today.toISOString().split("T")[0];

    // Update date headers with today's date
    updateDateHeaders(today);

    // Reload bookings
    loadBookings();
  });

  // Date filter change
  dateFilter.addEventListener("change", loadBookings);
}

// Update date headers based on selected date
function updateDateHeaders(selectedDate = new Date()) {
  // Get the Monday of the week containing the selected date
  const monday = new Date(selectedDate);
  const dayOfWeek = monday.getDay(); // 0 = Sunday, 1 = Monday, ...

  // Adjust to get Monday (if today is Sunday, we get Monday of previous week)
  monday.setDate(monday.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  // Format options for date display
  const dateFormatOptions = { day: "2-digit", month: "2-digit" };

  // Update each day's date display
  document.getElementById("date-monday").textContent =
    monday.toLocaleDateString("de-DE", dateFormatOptions);

  const tuesday = new Date(monday);
  tuesday.setDate(monday.getDate() + 1);
  document.getElementById("date-tuesday").textContent =
    tuesday.toLocaleDateString("de-DE", dateFormatOptions);

  const wednesday = new Date(monday);
  wednesday.setDate(monday.getDate() + 2);
  document.getElementById("date-wednesday").textContent =
    wednesday.toLocaleDateString("de-DE", dateFormatOptions);

  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  document.getElementById("date-thursday").textContent =
    thursday.toLocaleDateString("de-DE", dateFormatOptions);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  document.getElementById("date-friday").textContent =
    friday.toLocaleDateString("de-DE", dateFormatOptions);
}

// Helper function to fetch data from the API
async function fetchData(endpoint, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
}

// Delete a booking by ID
async function deleteBooking(bookingId, event) {
  // Stop event propagation to prevent opening the booking details modal
  event.stopPropagation();

  if (!confirm("Möchten Sie diese Buchung wirklich löschen?")) {
    return;
  }

  try {
    const response = await fetchData(`/bookings/${bookingId}`, "DELETE");

    if (response.success || response.deleted) {
      // Remove the booking element from the DOM
      const bookingElement = document.querySelector(
        `.booking[data-id="${bookingId}"]`
      );
      if (bookingElement) {
        bookingElement.remove();
      }

      showNotification("Buchung erfolgreich gelöscht", "success");
    } else {
      throw new Error("Fehler beim Löschen der Buchung");
    }
  } catch (error) {
    console.error("Error deleting booking:", error);
    showNotification("Fehler beim Löschen der Buchung", "error");
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // You can implement a notification system here
  console.log(`${type.toUpperCase()}: ${message}`);
  alert(message);
}
