import { hashPassword } from "./passwordUtils.js";

/**
 * Handles the login process
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {HTMLElement} errorMessage - Error message element
 * @returns {Promise<boolean>} - Returns true if login successful, false otherwise
 */
export async function handleLogin(email, password, errorMessage) {
  try {
    // Trim email to remove whitespace
    const trimmedEmail = email.trim();

    // Erzeuge einen sicheren Hash des Passworts mit der E-Mail als Salt
    const passwordHash = await hashPassword(password, trimmedEmail);

    const response = await fetch("http://167.99.245.119:3001/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: trimmedEmail,
        password: passwordHash, // Sende den Hash anstatt des Klartextpassworts
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      errorMessage.textContent = error.message || "Login fehlgeschlagen";
      errorMessage.style.display = "block";
      return false;
    }

    const data = await response.json();
    alert("Erfolgreich eingeloggt!");
    // Speichere den Benutzer in localStorage für die Session
    localStorage.setItem("user", JSON.stringify(data.user));
    // Weiterleiten zur Hauptseite
    window.location.href = "root.html";
    return true;
  } catch (err) {
    errorMessage.textContent =
      "Netzwerkfehler. Bitte versuche es später erneut.";
    errorMessage.style.display = "block";
    console.error(err);
    return false;
  }
}

/**
 * Handles automatic logout when login page is loaded
 */
export function handleAutoLogout() {
  // Prüfe, ob ein Benutzer eingeloggt ist
  const currentUser = localStorage.getItem("user");

  if (currentUser) {
    // Nur ausloggen, wenn tatsächlich jemand eingeloggt war
    localStorage.removeItem("user");
    console.log("Benutzer wurde automatisch ausgeloggt");
    return true;
  } else {
    console.log("Kein eingeloggter Benutzer gefunden");
    return false;
  }
}

// Automatisch ausloggen, wenn die Login-Seite aufgerufen wird
document.addEventListener("DOMContentLoaded", () => {
  handleAutoLogout();
});

const form = document.querySelector("form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorMessage = document.getElementById("errorMessage");

    const email = form.email.value.trim();
    const password = form.password.value;

    await handleLogin(email, password, errorMessage);
  });
}
