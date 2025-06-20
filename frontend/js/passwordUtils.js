/**
 * Sichere Passwort-Hashing-Funktion mit SHA-256
 * @param {string} password - Das zu hashende Passwort
 * @param {string} salt - Ein Salt zur Erhöhung der Sicherheit (z.B. E-Mail des Benutzers)
 * @returns {Promise<string>} Der Passwort-Hash
 */
async function hashPassword(password, salt) {
  // Kombiniere Passwort mit Salt
  const saltedPassword = password + salt;
  
  // Konvertiere den String in ein Array von Bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(saltedPassword);
  
  // Berechne den SHA-256 Hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Konvertiere das ArrayBuffer zu einem Hex-String
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

export { hashPassword };
