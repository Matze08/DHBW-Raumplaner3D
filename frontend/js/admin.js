// Admin authentication and functionality
const API_BASE_URL = "http://167.99.245.119:3001/api";
let currentUser = null;

// Prüfe, ob der Benutzer eingeloggt ist, sonst weiterleiten zum Login
document.addEventListener('DOMContentLoaded', () => {
  const userJson = localStorage.getItem("user");
  if (!userJson) {
    // Benutzer ist nicht eingeloggt - Weiterleitung zur Login-Seite
    alert("Sie müssen eingeloggt sein, um diese Seite zu sehen.");
    window.location.href = "login.html";
    return;
  }

  // Benutzer ist eingeloggt und damit automatisch Admin
  currentUser = JSON.parse(userJson);

  // Optional: Zeige an, wer eingeloggt ist
  const adminInfoElement = document.getElementById("adminInfo");
  if (adminInfoElement) {
    adminInfoElement.textContent = `Eingeloggt als: ${currentUser.email}`;
  }

  // Hier kann zusätzliche Admin-Funktionalität initialisiert werden
  initializeAdminFunctionality();

  // Setup event listeners for modal
  setupModalEventListeners();

  // Setup event listeners for add buttons
  setupAddButtonListeners();
});

function initializeAdminFunctionality() {
  // Hier können Sie Admin-spezifische Funktionen initialisieren
  console.log('Admin-Funktionalität wurde initialisiert');
  
  // Event-Listener für Timeslot-Klicks hinzufügen
  addTimeslotClickListeners();
}

// Modal Elements
const bookingModal = document.getElementById("bookingModal");
const modalClose = document.querySelector(".close");
const bookingForm = document.getElementById("bookingForm");
const modalTitle = document.getElementById("modalTitle");
const modalRoom = document.getElementById("modalRoom");
const modalCourse = document.getElementById("modalCourse");
const modalLecturer = document.getElementById("modalLecturer");
const modalLecture = document.getElementById("modalLecture");
const modalDate = document.getElementById("modalDate");
const modalStartTime = document.getElementById("modalStartTime");
const modalEndTime = document.getElementById("modalEndTime");
const modalBookingId = document.getElementById("modalBookingId");
const modalDay = document.getElementById("modalDay");
const modalHour = document.getElementById("modalHour");
const modalMinute = document.getElementById("modalMinute");
const saveBookingBtn = document.getElementById("saveBooking");
const deleteBookingBtn = document.getElementById("deleteBooking");
const cancelBookingBtn = document.getElementById("cancelBooking");

// Add click event listeners to timeslots using event delegation
function addTimeslotClickListeners() {
  // Use event delegation on the timetable body to handle all day cell clicks
  const timetableBody = document.getElementById("timetableBody");
  
  if (!timetableBody) {
    // If timetable body doesn't exist yet, wait and try again
    setTimeout(addTimeslotClickListeners, 500);
    return;
  }
  
  // Remove existing listener if any
  if (timetableBody.timeslotClickHandler) {
    timetableBody.removeEventListener("click", timetableBody.timeslotClickHandler);
  }
  
  // Add new event listener using delegation
  const timeslotClickHandler = async (event) => {
    // Find the closest day-cell element
    const dayCell = event.target.closest(".day-cell");
    
    if (!dayCell) return;
    
    // Check if the click is on a booking element or its children
    const isBookingClick = event.target.closest('.booking');
    
    // Only handle clicks on the cell itself, not on bookings
    if (!isBookingClick) {
      const day = parseInt(dayCell.dataset.day);
      const hour = parseInt(dayCell.dataset.hour);
      const minute = parseInt(dayCell.dataset.minute);
      await openCreateBookingModal(day, hour, minute);
    }
  };
  
  // Store reference to the handler for potential removal
  timetableBody.timeslotClickHandler = timeslotClickHandler;
  timetableBody.addEventListener("click", timeslotClickHandler);
}

// Set up event listeners for the booking modal
function setupModalEventListeners() {
  // Close modal when clicking the X
  modalClose.addEventListener("click", closeModal);
  
  // Close modal when clicking Cancel
  cancelBookingBtn.addEventListener("click", closeModal);
  
  // Handle form submission
  bookingForm.addEventListener("submit", handleBookingFormSubmit);
  
  // Close modal when clicking outside of it
  window.addEventListener("click", (event) => {
    if (event.target === bookingModal) {
      closeModal();
    }
  });
  
  // Handle delete button click
  deleteBookingBtn.addEventListener("click", handleDeleteBooking);
}

// Open modal to create a new booking
async function openCreateBookingModal(day, hour, minute) {
  // Set modal title
  modalTitle.textContent = "Neue Buchung erstellen";
  
  // Reset form
  bookingForm.reset();
  
  // Hide delete button for new bookings
  deleteBookingBtn.style.display = "none";
  
  // Store the day, hour and minute in hidden fields
  modalDay.value = day;
  modalHour.value = hour;
  modalMinute.value = minute;
  
  // Clear booking ID (it's a new booking)
  modalBookingId.value = "";
  
  // Get the selected date from the date filter
  const selectedDateStr = document.getElementById("dateFilter").value;
  const selectedDate = new Date(selectedDateStr);
  
  // Calculate the booking date based on the selected week and day
  const dayOffset = day - (selectedDate.getDay() - 1); // Adjust for weekday (Monday = 0)
  const bookingDate = new Date(selectedDate);
  bookingDate.setDate(selectedDate.getDate() + dayOffset);
  
  // Set the date in the modal
  modalDate.value = bookingDate.toISOString().split("T")[0];
  
  // Set default start and end time based on clicked cell
  modalStartTime.value = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  
  // Default duration: 1.5 hours
  const endHour = (hour + (minute >= 30 ? 2 : 1)) % 24;
  const endMinute = (minute + 30) % 60;
  modalEndTime.value = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
  
  // Populate dropdowns with data and wait for completion
  await loadModalDropdowns();
  
  // Open the modal
  bookingModal.style.display = "block";
}

// Close the booking modal
function closeModal() {
  bookingModal.style.display = "none";
}

// Load data for the modal dropdown menus
async function loadModalDropdowns() {
  try {
    // Load rooms
    const rooms = await fetchData("/rooms");
    populateSelect(modalRoom, rooms, "bezeichnung", "_id");
    
    // Load courses
    const courses = await fetchData("/courses");
    populateSelect(modalCourse, courses, "bezeichnung", "_id");
    
    // Load lecturers
    const lecturers = await fetchData("/lecturers");
    populateSelect(modalLecturer, lecturers, "bezeichnung", "_id");
    
    // Load lectures
    const lectures = await fetchData("/lectures");
    populateSelect(modalLecture, lectures, "bezeichnung", "_id");
    
    // Return a resolved promise after all data is loaded
    return Promise.resolve();
  } catch (error) {
    console.error("Error loading modal dropdowns:", error);
    alert("Fehler beim Laden der Dropdown-Daten");
    // Return a rejected promise on error
    return Promise.reject(error);
  }
}

// Helper function to populate select elements
function populateSelect(selectElement, items, labelProperty, valueProperty) {
  if (!items || items.length === 0) return;
  
  // Clear existing options except the first one
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
  
  // If items exist, automatically select the first option
  if (items.length > 0) {
    // Select the first actual item (index 1, since index 0 is the "Please select" option)
    if (selectElement.options.length > 1) {
      selectElement.selectedIndex = 1;
    }
  }
}

// Handle booking form submission
async function handleBookingFormSubmit(event) {
  event.preventDefault();
  
  // Get form data
  const date = new Date(modalDate.value);
  const startTimeParts = modalStartTime.value.split(":");
  const endTimeParts = modalEndTime.value.split(":");
  
  const startTime = new Date(date);
  startTime.setHours(parseInt(startTimeParts[0]), parseInt(startTimeParts[1]));
  
  const endTime = new Date(date);
  endTime.setHours(parseInt(endTimeParts[0]), parseInt(endTimeParts[1]));
  
  // Validate times
  if (endTime <= startTime) {
    alert("Die Endzeit muss nach der Startzeit liegen.");
    return;
  }
  
  const bookingData = {
    raum: modalRoom.value,
    kurs: modalCourse.value,
    lehrbeauftragter: modalLecturer.value,
    vorlesung: modalLecture.value,
    zeitStart: startTime.toISOString(),
    zeitEnde: endTime.toISOString()
  };
  console.log("Booking Data:", bookingData);
  
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
    
    // Refresh the bookings display
    if (typeof loadBookings === "function") {
      loadBookings();
    } else {
      // If loadBookings is not directly accessible, try to trigger a refresh
      location.reload();
    }
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
    
    // Refresh the bookings display
    if (typeof loadBookings === "function") {
      loadBookings();
    } else {
      // If loadBookings is not directly accessible, try to trigger a refresh
      location.reload();
    }
  } catch (error) {
    console.error("Error deleting booking:", error);
    alert(`Fehler: ${error.message}`);
  }
}

// Fetch data from the API
async function fetchData(endpoint, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: {
        "Authorization": `Bearer ${currentUser?._id || ""}`
      }
    };
    
    if (body && (method === "POST" || method === "PUT")) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "API request failed");
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
}

// Setup event listeners for add buttons
function setupAddButtonListeners() {
  // Room add button
  const addRoomBtn = document.getElementById('addRoomBtn');
  const addRoomForm = document.getElementById('addRoomForm');
  const saveRoomBtn = document.getElementById('saveRoom');
  const cancelRoomBtn = document.getElementById('cancelRoom');
  const newRoomInput = document.getElementById('newRoomInput');

  addRoomBtn.addEventListener('click', () => {
    addRoomBtn.style.display = 'none';
    addRoomForm.style.display = 'block';
    newRoomInput.focus();
  });

  cancelRoomBtn.addEventListener('click', () => {
    addRoomForm.style.display = 'none';
    addRoomBtn.style.display = 'block';
    newRoomInput.value = '';
  });

  saveRoomBtn.addEventListener('click', () => saveNewItem('room', newRoomInput.value, addRoomForm, addRoomBtn, newRoomInput));

  // Course add button
  const addCourseBtn = document.getElementById('addCourseBtn');
  const addCourseForm = document.getElementById('addCourseForm');
  const saveCourseBtn = document.getElementById('saveCourse');
  const cancelCourseBtn = document.getElementById('cancelCourse');
  const newCourseInput = document.getElementById('newCourseInput');

  addCourseBtn.addEventListener('click', () => {
    addCourseBtn.style.display = 'none';
    addCourseForm.style.display = 'block';
    newCourseInput.focus();
  });

  cancelCourseBtn.addEventListener('click', () => {
    addCourseForm.style.display = 'none';
    addCourseBtn.style.display = 'block';
    newCourseInput.value = '';
  });

  saveCourseBtn.addEventListener('click', () => saveNewItem('course', newCourseInput.value, addCourseForm, addCourseBtn, newCourseInput));

  // Lecturer add button
  const addLecturerBtn = document.getElementById('addLecturerBtn');
  const addLecturerForm = document.getElementById('addLecturerForm');
  const saveLecturerBtn = document.getElementById('saveLecturer');
  const cancelLecturerBtn = document.getElementById('cancelLecturer');
  const newLecturerInput = document.getElementById('newLecturerInput');

  addLecturerBtn.addEventListener('click', () => {
    addLecturerBtn.style.display = 'none';
    addLecturerForm.style.display = 'block';
    newLecturerInput.focus();
  });

  cancelLecturerBtn.addEventListener('click', () => {
    addLecturerForm.style.display = 'none';
    addLecturerBtn.style.display = 'block';
    newLecturerInput.value = '';
  });

  saveLecturerBtn.addEventListener('click', () => saveNewItem('lecturer', newLecturerInput.value, addLecturerForm, addLecturerBtn, newLecturerInput));

  // Lecture add button
  const addLectureBtn = document.getElementById('addLectureBtn');
  const addLectureForm = document.getElementById('addLectureForm');
  const saveLectureBtn = document.getElementById('saveLecture');
  const cancelLectureBtn = document.getElementById('cancelLecture');
  const newLectureInput = document.getElementById('newLectureInput');

  addLectureBtn.addEventListener('click', () => {
    addLectureBtn.style.display = 'none';
    addLectureForm.style.display = 'block';
    newLectureInput.focus();
  });

  cancelLectureBtn.addEventListener('click', () => {
    addLectureForm.style.display = 'none';
    addLectureBtn.style.display = 'block';
    newLectureInput.value = '';
  });

  saveLectureBtn.addEventListener('click', () => saveNewItem('lecture', newLectureInput.value, addLectureForm, addLectureBtn, newLectureInput));

  // Enter key handling for all inputs
  [newRoomInput, newCourseInput, newLecturerInput, newLectureInput].forEach((input, index) => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const types = ['room', 'course', 'lecturer', 'lecture'];
        const forms = [addRoomForm, addCourseForm, addLecturerForm, addLectureForm];
        const buttons = [addRoomBtn, addCourseBtn, addLecturerBtn, addLectureBtn];
        
        saveNewItem(types[index], input.value, forms[index], buttons[index], input);
      }
    });
  });
}

// Save new item function
async function saveNewItem(type, value, form, button, input) {
  if (!value.trim()) {
    alert('Bitte geben Sie einen Namen ein.');
    return;
  }

  try {
    // API endpoint mapping
    const endpoints = {
      room: '/rooms',
      course: '/courses',
      lecturer: '/lecturers',
      lecture: '/lectures'
    };

    // Create the item
    const data = { name: value.trim() };
    await fetchData(endpoints[type], 'POST', data);

    // Reset form
    form.style.display = 'none';
    button.style.display = 'block';
    input.value = '';

    // Show success message
    console.log(`${getTypeDisplayName(type)} wurde erfolgreich hinzugefügt!`);

    // Reload the dropdown options if needed
    loadModalDropdowns();
    loadFilterOptions();

  } catch (error) {
    console.error(`Error saving ${type}:`, error);
    alert(`Fehler beim Hinzufügen des ${getTypeDisplayName(type)}s: ${error.message}`);
  }
}

// Helper function to get display names
function getTypeDisplayName(type) {
  const names = {
    room: 'Raum',
    course: 'Kurs',
    lecturer: 'Dozent',
    lecture: 'Vorlesung'
  };
  return names[type] || type;
}
