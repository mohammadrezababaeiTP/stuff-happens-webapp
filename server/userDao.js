import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';

// Open the database file (or make it if missing)
const db = new Database('database.sqlite');

// Get user info from the database by username (used for login)
export function getUser(username) {
  return db.prepare('SELECT * FROM Users WHERE username = ?').get(username);
}

// Checks if username and password are right
// If ok, returns user object; if not, returns false
export function validateUser(username, password) {
  const user = getUser(username);
  if (!user) return false;

  const hashed = user.password;
  const isValid = bcrypt.compareSync(password, hashed);
  return isValid ? user : false;
}

// Get user by their ID (used for session stuff)
export function getUserById(id) {
  return db.prepare('SELECT * FROM Users WHERE id = ?').get(id);
}
