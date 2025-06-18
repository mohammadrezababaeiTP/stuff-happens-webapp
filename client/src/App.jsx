import { useState } from 'react';
import LoginForm from './components/LoginForm';
import Game from './components/Game';
import GameHistory from './components/GameHistory';
import DemoGame from './components/DemoGame';
// This is the main App component, handles everything like login, 
// starting the game, switching screens, and showing history
function App() {
  // Keeps track of the logged in user (null if not logged in)
  const [user, setUser] = useState(null);
  // Stores the user's game history data
  const [historyData, setHistoryData] = useState([]);
  // Controls whether the history screen is shown
  const [showHistory, setShowHistory] = useState(false);
  // True if the current game is over
  const [gameOver, setGameOver] = useState(false);
  // True if the user has started a game
  const [gameStarted, setGameStarted] = useState(false);
  // If true, shows the demo game for guests (not logged in)
  const [showDemo, setShowDemo] = useState(false);
  // Holds the current game's ID
  const [gameId, setGameId] = useState(null);
  // List of the player's cards at the start of the game
  const [cards, setCards] = useState([]);


  // Gets the user's game history from the server
  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/profile', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setHistoryData(data);
      setShowHistory(true);
    } catch (err) {
      console.error('❌ Error fetching history:', err.message);
    }
  };
// Starts a new game, fetches initial cards from the server
  const startGame = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/game/start', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('❌ Failed to start game');
      const data = await res.json();
      setCards(data.cards);
      setGameId(data.gameId);
      setGameStarted(true);
      setGameOver(false);
      setShowHistory(false);
      // (REMOVED) Do not log the initial 3 cards as rounds (won: null)
    } catch (err) {
      alert(err.message);
    }
  };
 // Called when the game is over (win or lose)
  const handleGameOver = () => {
    setGameOver(true);
  };
  // For the "Start Game" button
  const handleGameStart = () => {
    startGame();
  };
  // Closes the history screen (doesn't reset game)
  const handleCloseHistory = () => {
    setShowHistory(false);
    // Do NOT reset game state here; just close the history view
  };
  // Goes back to profile screen from the game
  const handleBackToProfile = () => {
    setGameStarted(false);
    setGameOver(false);
    setShowHistory(false);
    setGameId(null);
    setCards([]);
  };
  // Restarts the game (called after game over or "Play Again")
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setGameId(null);
    setCards([]);
    startGame();
  };
  // --- UI rendering below ---
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f4f6fb 60%, #e3eafc 100%)' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#222', color: '#fff', padding: '0.75rem 1.5rem' }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>Stuff Happens</span>
        <div>
          {user ? (
            <>
              <span style={{ marginRight: '1rem' }}>Welcome, {user.username} 👋</span>
              <button
                style={{ marginRight: '1rem', background: '#444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                onClick={showHistory ? handleCloseHistory : fetchHistory}
                disabled={gameStarted && !gameOver}
              >
                📜 {showHistory ? 'Hide' : 'View'} Game History
              </button>
              <button
                style={{ background: '#d9534f', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                onClick={async () => {
                  await fetch('http://localhost:3001/api/logout', {
                    method: 'POST',
                    credentials: 'include',
                  });
                  setUser(null);
                  setGameStarted(false);
                  setGameOver(false);
                  setShowHistory(false);
                  setGameId(null);
                  setCards([]);
                }}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <span>Please log in</span>
          )}
        </div>
      </nav>

      {/* Main content below nav */}
      {!user ? (
        showDemo ? (
          <DemoGame onBack={() => setShowDemo(false)} />
        ) : (
          <LoginForm onLogin={(user) => setUser(user)} onDemo={() => setShowDemo(true)} />
        )
      ) : showHistory ? (
        <GameHistory data={historyData} onClose={handleCloseHistory} />
      ) : gameStarted && !gameOver ? (
        <Game
          user={user}
          onGameOver={handleGameOver}
          onBackToProfile={handleBackToProfile}
          gameStarted={gameStarted}
          gameId={gameId}
          cards={cards}
          resetGame={resetGame}
        />
      ) : gameOver ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2>Game Over</h2>
          <p>You can play again or go back to your profile.</p>
          <button
            style={{ margin: '1rem', padding: '0.75rem 1.5rem' }}
            onClick={resetGame}
          >
            🔄 Play Again
          </button>
          <button
            style={{ margin: '1rem', padding: '0.75rem 1.5rem' }}
            onClick={handleBackToProfile}
          >
            🏠 Back to Profile
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2>Welcome, {user.username} 👋</h2>
          <p>Ready to play Stuff Happens?</p>
          <button
            style={{ background: '#007bff', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', fontSize: '1.1rem', cursor: 'pointer' }}
            onClick={handleGameStart}
          >
            Start Game
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
