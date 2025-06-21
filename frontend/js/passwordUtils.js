/**
 * Passwort-Encoding-Funktion mit Base64
 * @param {string} password - Das zu encodierende Passwort
 * @param {string} salt - Ein Salt zur Kombination mit dem Passwort (z.B. E-Mail des Benutzers)
 * @returns {string} Der Base64-encodierte String
 */
function hashPassword(password, salt) {
  // Kombiniere Passwort mit Salt
  const saltedPassword = password + salt;
console.log("hash", btoa(saltedPassword));
  // Konvertiere zu Base64
  return btoa(saltedPassword);
}

export { hashPassword };
