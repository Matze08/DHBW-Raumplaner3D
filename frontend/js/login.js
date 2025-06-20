import { hashPassword } from "./passwordUtils.js";

// Automatisch ausloggen, wenn die Login-Seite aufgerufen wird
document.addEventListener("DOMContentLoaded", () => {
  // Prüfe, ob ein Benutzer eingeloggt ist
  const currentUser = localStorage.getItem("user");

  if (currentUser) {
    // Nur ausloggen, wenn tatsächlich jemand eingeloggt war
    localStorage.removeItem("user");
    console.log("Benutzer wurde automatisch ausgeloggt");
  } else {
    console.log("Kein eingeloggter Benutzer gefunden");
  }
});

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorMessage = document.getElementById("errorMessage");

  const email = form.email.value.trim();
  const password = form.password.value;

  try {
    // Erzeuge einen sicheren Hash des Passworts mit der E-Mail als Salt
    const passwordHash = await hashPassword(password, email);

    const response = await fetch("http://localhost:3001/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password: passwordHash, // Sende den Hash anstatt des Klartextpassworts
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      errorMessage.textContent = error.message || "Login fehlgeschlagen";
      errorMessage.style.display = "block";
      return;
    }

    const data = await response.json();
    alert("Erfolgreich eingeloggt!");
    // Speichere den Benutzer in localStorage für die Session
    localStorage.setItem("user", JSON.stringify(data.user));
    // Weiterleiten zur Hauptseite
    window.location.href = "root.html";
  } catch (err) {
    errorMessage.textContent =
      "Netzwerkfehler. Bitte versuche es später erneut.";
    errorMessage.style.display = "block";
    console.error(err);
  }
});
