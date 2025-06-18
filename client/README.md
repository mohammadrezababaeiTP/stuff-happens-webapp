### Server-side

**APIs:**
- `POST /api/login` &nbsp;— User login, returns session info.
- `POST /api/logout` &nbsp;— User logout, destroys session.
- `POST /api/game/start` &nbsp;— Creates a new game and returns initial cards.
- `POST /api/game/next` &nbsp;— Returns a new mystery card (not among previous).
- `POST /api/game/guess` &nbsp;— Saves a guess for a card (with result).
- `PUT  /api/game/:id/end` &nbsp;— Closes a game and updates outcome.
- `GET  /api/profile` &nbsp;— Gets user profile and game history.
- `GET  /api/cards` &nbsp;— Returns full list of cards (admin/testing only).

**Database tables:**
- `Users` — Stores user accounts and login info.
- `Games` — Stores metadata for each played game.
- `GameCards` — Stores all cards used in each game, with their status/result.
- `Cards` — Stores the master list of possible cards.


## 2. Client-side

**Routes:**
- `/login` — Login page (user authentication)
- `/game` — Main game interface
- `/history` — Shows game history for the logged-in user
- `/` — Redirects to login or game depending on authentication

**Main React Components:**
- `App.jsx` — Application root and routing
- `LoginForm.jsx` — User login form
- `Game.jsx` — Main game logic and UI
- `GameHistory.jsx` — Displays game history and past results
- `DemoGame.jsx` — Demo version for testing (if present)

## 3. Overall

**Screenshots:**

- Game History page:  
  ![User History](./screenshots/history.png)

- During a game:  
  ![Game in Progress](./screenshots/game.png)


**Demo accounts:**
- Username: `student1` &nbsp;|&nbsp; Password: `pass123`
- Username: `testuser` &nbsp;|&nbsp; Password: `abc123`

