import Database from 'better-sqlite3';

// Connects to our database file (creates it if it doesn't exist)
const db = new Database('database.sqlite');

// First, delete all previous GameCards, Games, and Cards so we can start fresh
db.prepare('DELETE FROM GameCards').run();
db.prepare('DELETE FROM Games').run();
db.prepare('DELETE FROM Cards').run();

// Make sure Cards table exists (creates it if missing)
db.prepare(`
  CREATE TABLE IF NOT EXISTS Cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image_path TEXT NOT NULL,
    bad_luck_index REAL NOT NULL,
    theme TEXT DEFAULT 'university'
  )
`).run();

// Here's the list of all our bad-luck cards for the game (all about university life)
const cards = [
    // Each card has a name, image, and a bad luck score
  { name: "Missed project deadline", image_path: "forgot-deadline.jpg", index: 5 },
  { name: "Power outage during online presentation", image_path: "power-out-presentation.jpg", index: 12 },
  { name: "Forgot student card on exam day", image_path: "no-student-card.jpg", index: 18 },
  { name: "Cold food after long cafeteria line", image_path: "cold-food.jpg", index: 21 },
  { name: "Overslept on exam morning", image_path: "oversleep-exam.jpg", index: 26 },
  { name: "Laptop crashed the night before exam", image_path: "laptop-crash.jpg", index: 29.5 },
  { name: "Lost project file", image_path: "lost-file.jpg", index: 33 },
  { name: "Didn’t hear teacher in online class", image_path: "mute-teacher.jpg", index: 36.5 },
  { name: "Couldn't find professor for signature", image_path: "no-signature.jpg", index: 41 },
  { name: "Spilled water on notebook", image_path: "water-spill.jpg", index: 43.5 },
  { name: "Roommate fight", image_path: "roommate-argument.jpg", index: 46 },
  { name: "Forgot university Wi-Fi password", image_path: "wifi-password.jpg", index: 48 },
  { name: "Embarrassed during group presentation", image_path: "group-fail.jpg", index: 51.5 },
  { name: "Dropped a chosen course by mistake", image_path: "dropped-course.jpg", index: 54 },
  { name: "Missed class due to late bus", image_path: "missed-bus.jpg", index: 57.5 },
  { name: "Lost dorm bank card", image_path: "lost-card.jpg", index: 59 },
  { name: "No food left at cafeteria", image_path: "no-food-left.jpg", index: 62 },
  { name: "Bike crash on campus", image_path: "bike-accident.jpg", index: 65 },
  { name: "Group members caused low grade", image_path: "group-lowgrade.jpg", index: 67 },
  { name: "Dropped phone in toilet", image_path: "phone-drop.jpg", index: 69 },
  { name: "Fell down library stairs", image_path: "stairs-fall.jpg", index: 71 },
  { name: "No internet on project day", image_path: "no-internet.jpg", index: 73 },
  { name: "Forgot portal password", image_path: "forgot-portal.jpg", index: 75 },
  { name: "Chair slipped during class", image_path: "chair-fall.jpg", index: 76 },
  { name: "Charger broke before exam night", image_path: "burnt-charger.jpg", index: 78 },
  { name: "Left laptop at dorm", image_path: "left-laptop.jpg", index: 80 },
  { name: "Torn notebook pages before exam", image_path: "ripped-notes.jpg", index: 82 },
  { name: "Accidentally showed wrong slide", image_path: "wrong-slide.jpg", index: 83 },
  { name: "Confused during course registration", image_path: "unit-confusion.jpg", index: 84.5 },
  { name: "Forgot to submit homework", image_path: "missed-homework.jpg", index: 85.5 },
  { name: "Student email got hacked", image_path: "email-hacked.jpg", index: 87 },
  { name: "Locked out of online exam", image_path: "exam-locked-out.jpg", index: 88 },
  { name: "Argued with professor", image_path: "teacher-argument.jpg", index: 89.5 },
  { name: "Period problem during presentation", image_path: "period-problem.jpg", index: 91 },
  { name: "Last-minute classroom change", image_path: "class-change.jpg", index: 92 },
  { name: "Power outage during exam", image_path: "power-out-exam.jpg", index: 93 },
  { name: "Noisy background from dorm", image_path: "noisy-room.jpg", index: 94 },
  { name: "Forgot PE uniform", image_path: "no-sportswear.jpg", index: 95 },
  { name: "Notes soaked in rain", image_path: "rain-notes.jpg", index: 96 },
  { name: "Sat on a wet seat", image_path: "wet-seat.jpg", index: 96.5 },
  { name: "Lunch fell off tray", image_path: "lunch-drop.jpg", index: 97 },
  { name: "Tea spilled on laptop", image_path: "tea-laptop.jpg", index: 97.5 },
  { name: "Hand got stuck in dorm door", image_path: "door-trap.jpg", index: 98 },
  { name: "Shoe broke in university yard", image_path: "shoe-break.jpg", index: 98.5 },
  { name: "Dropped phone from second floor", image_path: "phone-fall.jpg", index: 99 },
  { name: "Dead power bank before exam", image_path: "dead-powerbank.jpg", index: 99.5 },
  { name: "Missed project grade due to absence", image_path: "project-absent.jpg", index: 99.8 },
  { name: "Lost dorm room key", image_path: "lost-key.jpg", index: 100 },
  { name: "Exam file corrupted before upload", image_path: "corrupted-file.jpg", index: 99.9 },
  { name: "Mic didn't work during online oral exam", image_path: "mic-fail.jpg", index: 98.7 }
];

// This will insert all the cards above into the Cards table
const insert = db.prepare(`
  INSERT INTO Cards (name, image_path, bad_luck_index, theme)
  VALUES (?, ?, ?, ?)
`);
// Go through the cards array and add each one to the database
for (const card of cards) {
  insert.run(card.name, card.image_path, card.index, 'university');
}

console.log(`✅ ${cards.length} cards inserted into the database.`);
