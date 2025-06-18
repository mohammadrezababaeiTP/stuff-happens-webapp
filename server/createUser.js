// Import database and hashing library
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';

// Connect to the SQLite database
const db = new Database('database.sqlite');

// Define the test users' credentials (add as many as you need)
const users = [
  { username: 'webapplication', password: '137800' },
  { username: 'fuvio', password: 'politecnico25' }
];

// Generate salt and hash the password securely, then insert each user
const saltRounds = 10;

for (const { username, password } of users) {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);

  try {
    db.prepare(`
      INSERT INTO Users (username, password, salt) VALUES (?, ?, ?)
    `).run(username, hash, salt);

    console.log("✅ User created successfully:", username);
  } catch (err) {
    // Handle error (e.g., user already exists)
    console.error("❌ Failed to create user:", username, err.message);
  }
}
