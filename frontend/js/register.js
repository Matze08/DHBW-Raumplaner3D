import { hashPassword } from './passwordUtils.js';

const form = document.querySelector('form');

// Prüfe, ob der Benutzer eingeloggt ist, sonst weiterleiten zum Login
document.addEventListener('DOMContentLoaded', () => {
  const currentUser = localStorage.getItem('user');
  if (!currentUser) {
    // Benutzer ist nicht eingeloggt - Weiterleitung zur Login-Seite
    alert('Sie müssen eingeloggt sein, um neue Benutzer registrieren zu können.');
    window.location.href = 'login.html';
    return;
  }
  
  // Optional: Zeige an, wer gerade einen neuen Benutzer registriert
  const userData = JSON.parse(currentUser);
  const registerInfoElement = document.getElementById('registerInfo');
  if (registerInfoElement) {
    registerInfoElement.textContent = `Sie registrieren als: ${userData.email || 'Administrator'}`;
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorMessage = document.getElementById('errorMessage');

  // Prüfe nochmals, ob der Benutzer eingeloggt ist
  const currentUser = localStorage.getItem('user');
  if (!currentUser) {
    errorMessage.textContent = "Sie müssen eingeloggt sein, um neue Benutzer zu registrieren.";
    errorMessage.style.display = 'block';
    return;
  }

  const email = form.email.value.trim();
  const password = form.password.value;

  try {
    // Erzeuge einen sicheren Hash des Passworts mit der E-Mail als Salt
    const passwordHash = await hashPassword(password, email);
    
    // Hole das Auth-Token oder die User-ID des eingeloggten Benutzers
    const userData = JSON.parse(currentUser);
    
    const response = await fetch("http://localhost:3001/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Optional: Füge einen Auth-Header hinzu, falls dein Backend das unterstützt
        "Authorization": `Bearer ${userData._id || ''}`
      },
      body: JSON.stringify({ 
        email, 
        password: passwordHash, // Sende den Hash anstatt des Klartextpassworts
        registeredBy: userData.email || 'unknown' // Wer hat registriert
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      errorMessage.textContent = error.message || "Registrierung fehlgeschlagen";
      errorMessage.style.display = "block";
      return;
    }

    const data = await response.json();
    alert('Benutzer erfolgreich registriert!');
    
    // Formular zurücksetzen für weitere Registrierungen
    form.reset();
  } catch (err) {
    errorMessage.textContent =
      "Netzwerkfehler. Bitte versuche es später erneut.";
    errorMessage.style.display = 'block';
    console.error(err);
  }
});