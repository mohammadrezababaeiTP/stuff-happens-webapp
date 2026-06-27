// This is the main server file. Sets up express, passport, and all the game APIs.
import Database from 'better-sqlite3';
import express from 'express';
import session from 'express-session';
import passport from './auth.js';
import cors from 'cors';

const db = new Database('database.sqlite');
const app = express();
const port = 3001;

// Allow frontend (React) to talk to backend (here)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
// Session stuff for login
app.use(session({
  secret: 'a strong secret key',
  resave: false,
  saveUninitialized: false
}));
// Passport for auth
app.use(passport.initialize());
app.use(passport.session());


// --- API Endpoints ---
// Login endpoint
app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Wrong credentials' });

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({ id: user.id, username: user.username });
    });
  })(req, res, next);
});
// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: 'Logged out' });
  });
});
// Check if user is logged in (for session persistence)
app.get('/api/session', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ id: req.user.id, username: req.user.username });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});
// Start a new game for the logged in user, give 3 random cards
app.get('/api/game/start', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
        // Insert a new row in Games table
    const insertGame = db.prepare(`
      INSERT INTO Games (user_id, start_time, outcome)
      VALUES (?, datetime('now'), 'in-progress')
    `);
    const result = insertGame.run(req.user.id);
    const gameId = result.lastInsertRowid;

    const cards = db.prepare(`
      SELECT id, name, image_path, bad_luck_index
      FROM Cards
      ORDER BY RANDOM()
      LIMIT 3
    `).all();

    // Insert the initial 3 cards into GameCards table with won = 2

    const insertGameCard = db.prepare(`
      INSERT INTO GameCards (game_id, card_id, round_number, won)
      VALUES (?, ?, ?, ?)
    `);
    cards.forEach((card, idx) => {
      insertGameCard.run(gameId, card.id, idx + 1, 2); // 2 for initial card
    });

    res.json({ cards, gameId });
  } catch (err) {
    console.error('❌ Error in /api/game/start:', err);
    res.status(500).json({ error: 'Failed to start game' });
  }
});
// Get a new random card (not used yet)
app.post('/api/game/next', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const used = req.body.used || [];
  const placeholders = used.length ? used.map(() => '?').join(',') : 'NULL';

  try {
      // Pick a card not in the 'used' list
    const card = db.prepare(`
      SELECT id, name, image_path, bad_luck_index
      FROM Cards
      WHERE id NOT IN (${placeholders})
      ORDER BY RANDOM()
      LIMIT 1
    `).get(...used);

    if (!card) {
      return res.status(404).json({ error: 'No more cards left' });
    }

    res.json(card);
  } catch (err) {
    console.error('❌ Error in /api/game/next:', err);
    res.status(500).json({ error: 'Failed to fetch next card' });
  }
});

// Save the result of user's guess for a round
app.post('/api/game/guess', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const {
    game_id,
    card_id,
    round_number,
    won,
    gameOver,
    outcome
  } = req.body;

  console.log('🟡 Guess received:', req.body);

  // Accept won = 1 (correct), 0 (wrong), or -1 (missed)
  if (!game_id || !card_id || typeof round_number !== 'number' || ![-1,0,1].includes(won)) {
    console.error('❌ Invalid data format for inserting GameCard');
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    db.prepare(`
      INSERT INTO GameCards (game_id, card_id, round_number, won)
      VALUES (?, ?, ?, ?)
    `).run(game_id, card_id, round_number, won);

    console.log('✅ Inserted GameCard:', { game_id, card_id, round_number, won });

     // If it's the end of the game, update Games table with result
    if (gameOver && (outcome === 'win' || outcome === 'lose')) {
      db.prepare(`
        UPDATE Games
        SET outcome = ?, end_time = datetime('now')
        WHERE id = ?
      `).run(outcome, game_id);
    }

    res.status(200).json({ message: 'Round saved' });
  } catch (err) {
    console.error('❌ Error in /api/game/guess:', err.message);
    res.status(500).json({ error: 'Failed to save guess' });
  }
});

// Update the game result (when it's over)
app.put('/api/game/:id/end', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { outcome } = req.body;
  const gameId = req.params.id;

  if (!['win', 'lose'].includes(outcome)) {
    console.error("❌ Invalid outcome value received:", outcome);
    return res.status(400).json({ error: 'Invalid outcome value' });
  }

  // const finalOutcome = outcome === 'win' ? 'won' : 'lost';

const finalOutcome = outcome; 

  try {
    console.log('💾 Updating game:', gameId, '→', finalOutcome);

    const stmt = db.prepare(`
      UPDATE Games
      SET outcome = ?, end_time = datetime('now')
      WHERE id = ?
    `);
    const result = stmt.run(finalOutcome, gameId);

    console.log('✅ SQL update result:', result);

    if (result.changes === 0) {
      console.error('❌ No game updated, maybe wrong ID?');
      return res.status(404).json({ error: 'Game not found' });
    }

    res.status(200).json({ message: 'Game outcome updated successfully' });
  } catch (err) {
    console.error('❌ Error in /api/game/:id/end:', err.message);
    res.status(500).json({ error: 'Failed to update game outcome' });
  }
});

// Get the user's profile and their game history
app.get('/api/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
        // Get all games for this user
    const games = db.prepare(`
      SELECT id, start_time, end_time, outcome
      FROM Games
      WHERE user_id = ?
      ORDER BY start_time DESC
    `).all(req.user.id);

    const result = games.map((game) => {
       // Get the list of cards played in each game
      const rounds = db.prepare(`
        SELECT GameCards.round_number, GameCards.won, Cards.name AS card_name
        FROM GameCards
        JOIN Cards ON GameCards.card_id = Cards.id
        WHERE GameCards.game_id = ?
        ORDER BY GameCards.round_number ASC
      `).all(game.id);

      return {
        gameId: game.id,
        start_time: game.start_time,
        end_time: game.end_time,
        outcome: game.outcome,
        rounds: rounds, // includes round_number, won, card_name
      };
    });

    res.json(result);
  } catch (err) {
    console.error('❌ Error fetching profile data:', err);
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
});
// Just starts the server//
app.listen(port, () => {
  console.log(`✅ Server listening at http://localhost:${port}`);
});
