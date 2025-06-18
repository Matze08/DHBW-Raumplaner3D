const form = document.querySelector('form');


  form.addEventListener('submit', async (e) => {
    e.preventDefault();
        const errorMessage = document.getElementById('errorMessage');

    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        errorMessage.textContent = error.message || "Login fehlgeschlagen";
        errorMessage.style.display = "block";
        return;
      }

      const data = await response.json();
      alert('Erfolgreich eingeloggt!');
      // z.B. weiterleiten:
      // window.location.href = '/dashboard';
    } catch (err) {
      errorMessage.textContent =
        "Netzwerkfehler. Bitte versuche es später erneut.";
      errorMessage.style.display = 'block';
      console.error(err);
    }
  });