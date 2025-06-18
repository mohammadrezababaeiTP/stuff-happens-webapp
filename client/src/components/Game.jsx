//import recat hooks and css and define the game componenet 
import { useState, useEffect } from 'react';
import './Game.css';
function Game({ user, onGameOver, onBackToProfile, gameStarted, gameId, cards: initialCards, resetGame }) {
  const [cards, setCards] = useState(initialCards || []);
  const [error, setError] = useState('');
  const [nextCard, setNextCard] = useState(null);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [history, setHistory] = useState([]);
  const [timer, setTimer] = useState(30);
  const [playedCardIds, setPlayedCardIds] = useState(initialCards ? initialCards.map(c => c.id) : []);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [lastResult, setLastResult] = useState(null);
// Resets all game state variables to start a new game whenever initialCards or gameId change.
// Also fetches the next card if initial cards and game ID are available.
  useEffect(() => {
    setCards(initialCards || []);
    setPlayedCardIds(initialCards ? initialCards.map(c => c.id) : []);
    setNextCard(null);
    setWrongGuesses(0);
    setGameOver(false);
    setWon(false);
    setHistory([]);
    setTimer(30);
    setAwaitingConfirm(false);
    setLastResult(null);
    setError('');
    if (initialCards && initialCards.length > 0 && gameId) {
      getNextCard(initialCards.map(c => c.id));
    }
  }, [initialCards, gameId]);
// useEffect to handle the countdown timer for each game round.
// If the player does not respond in time, mark the card as missed, send the result to the server,
// update game state and history, and check for game over condition.
  useEffect(() => {
    if (!nextCard || gameOver || awaitingConfirm) return;
    let alreadyHandled = false;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1 && !alreadyHandled) {
          alreadyHandled = true;
          clearInterval(interval);
          const missedCard = nextCard;
          setError('⏰ Time is up! You missed this card.');
          setNextCard(null);
          setWrongGuesses((prev) => prev + 1);
          const saveTimeoutGuess = async () => {
            try {
              await fetch(`http://localhost:3001/api/game/guess`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  game_id: gameId,
                  card_id: missedCard.id,
                  round_number: history.length + 1,
                  won: -1,
                  missed: true, // <-- add missed: true
                  gameOver: wrongGuesses + 1 >= 3,
                  outcome: wrongGuesses + 1 >= 3 ? 'lose' : null,
                }),
              });
              setHistory((prev) => [...prev, { card: missedCard, correct: -1, missed: true }]); // <-- add missed: true
              setPlayedCardIds((prev) => [...prev, missedCard.id]);
              setLastResult({ card: missedCard, correct: -1, missed: true }); // <-- add missed: true
              setAwaitingConfirm(true);
            } catch (err) {
              console.error('❌ Failed to save guess from timeout', err);
            }
            if (wrongGuesses + 1 >= 3) {
              setGameOver(true);
            }
          };
          saveTimeoutGuess();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [nextCard, gameOver, awaitingConfirm, wrongGuesses, history.length, gameId]);
// Fetches a new card from the server that hasn't been played yet.
// Updates the game state with the new card, resets the timer, and prepares for the next round.
  const getNextCard = async (used = playedCardIds) => {
    try {
      const res = await fetch('http://localhost:3001/api/game/next', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ used }),
      });
      if (!res.ok) throw new Error('❌ Failed to get card');
      const card = await res.json();
      setNextCard(card);
      setPlayedCardIds((prev) => [...prev, card.id]);
      setTimer(30);
      setAwaitingConfirm(false);
      setLastResult(null);
    } catch (err) {
      setError('⚠️ Network error');
    }
  };
// Sends the user's guess result for a card to the server after each round.
  const sendGuessToServer = async (
    cardId,
    isCorrect,
    roundNumber,
    willEnd,
    finalOutcome
  ) => {
    try {
      const payload = {
        game_id: gameId,
        card_id: cardId,
        round_number: roundNumber,
        won: isCorrect ? 1 : 0,
        gameOver: willEnd,
        outcome: finalOutcome,
      };
      await fetch('http://localhost:3001/api/game/guess', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('❌ Failed to send round');
    }
  };
// Handles the logic when the user tries to place the mystery card.
// Checks if the guess is correct, updates state, and sends result to server.
  const handleGuess = async (position) => {
    if (awaitingConfirm) return;
    const sorted = [...cards].sort((a, b) => a.bad_luck_index - b.bad_luck_index);
    const index = nextCard.bad_luck_index;
    const left = position === 0 ? -Infinity : sorted[position - 1].bad_luck_index;
    const right = position === sorted.length ? Infinity : sorted[position].bad_luck_index;
    const isCorrect = index > left && index < right;
    const newCards = [...cards, ...(isCorrect ? [nextCard] : [])];
    const newWrong = wrongGuesses + (isCorrect ? 0 : 1);
    const willEnd = newCards.length >= 6 || newWrong >= 3;
    const finalOutcome = willEnd
      ? newCards.length >= 6
        ? 'win'
        : 'lose'
      : null;
    await sendGuessToServer(nextCard.id, isCorrect, history.length + 1, willEnd, finalOutcome);
    setHistory((prev) => [...prev, { card: nextCard, correct: isCorrect ? 1 : 0, missed: false }]); // <-- add missed: false
    setCards(newCards);
    setWrongGuesses(newWrong);
    setLastResult({ card: nextCard, correct: isCorrect ? 1 : 0, missed: false }); // <-- add missed: false
    setAwaitingConfirm(true);
    setNextCard(null);
  };

// Confirms the result after the user sees the round outcome.
// Moves to next round or ends the game if win/lose condition is reached.
  const handleConfirm = async () => {
    setError("");
    setAwaitingConfirm(false);
    setLastResult(null);

    
    if (cards.length >= 6) {
      setWon(true);
      setGameOver(true);
      await fetch(`http://localhost:3001/api/game/${gameId}/end`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome: 'win' }),
      });
      if (onGameOver) onGameOver();
      return;
    }

    if (wrongGuesses >= 3) {
      setWon(false);
      setGameOver(true);
      await fetch(`http://localhost:3001/api/game/${gameId}/end`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome: 'lose' }),
      });
      if (onGameOver) onGameOver();
      return;
    }

    if (!gameOver) {
      getNextCard();
    }
  };
// Sort the player's cards by their bad luck index in ascending order
  const sortedCards = [...cards].sort((a, b) => a.bad_luck_index - b.bad_luck_index);
// Main render block for the game UI.
// Displays timer, chances left, player's cards, 
// the mystery card, result banners, guess history, and end game screen.
  return (
    <div className="game-container">
      {error && <p className="result-banner lose">{error}</p>}
      <div className="game-timer">
        <span role="img" aria-label="timer">⏱️</span> Time left: {timer}s
      </div>
      <div className="game-chances">
        <span role="img" aria-label="chances">❤️</span> Chances left: {3 - wrongGuesses} / 3
      </div>
      <div className="cards-row">
        {sortedCards.map((card, i) => (
          <div key={card.id} className="game-card">
            <img src={`images/${card.image_path}`} alt={card.name} />
            <div className="card-title">{card.name}</div>
            <div className="card-subtitle">Bad Luck: {card.bad_luck_index}</div>
            <button className="confirm-btn" onClick={() => handleGuess(i)} disabled={gameOver || awaitingConfirm || !nextCard} style={{marginTop: '0.7rem', fontSize: '0.95rem', padding: '0.3rem 1.1rem'}}>
              ⬇️ Place Here
            </button>
          </div>
        ))}
        {sortedCards.length > 0 && (
          <div className="game-card" style={{background: 'none', boxShadow: 'none', minWidth: 'unset'}}>
            <button className="confirm-btn" onClick={() => handleGuess(sortedCards.length)} disabled={gameOver || awaitingConfirm || !nextCard} style={{fontSize: '0.95rem', padding: '0.3rem 1.1rem'}}>
              ⬇️ Place Here (end)
            </button>
          </div>
        )}
      </div>
      {nextCard && !awaitingConfirm && (
        <div className="mystery-section">
          <div className="mystery-title">Mystery Card</div>
          <div className="card-title">{nextCard.name}</div>
          <img src={`images/${nextCard.image_path}`} alt={nextCard.name} />
          <div className="mystery-desc">Where do you think this card belongs?</div>
        </div>
      )}
      {awaitingConfirm && lastResult && (
        <div className="result-banner animated-result" style={{
          background: lastResult.correct === 1
            ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'
            : lastResult.missed === -1
            ? 'linear-gradient(90deg, #ffe066 0%, #f59e42 100%)'
            : 'linear-gradient(90deg, #ff6b6b 0%, #f06595 100%)',
          border: `2px solid ${lastResult.correct === 1 ? '#16a34a' : lastResult.missed === -1 ? '#f59e42' : '#c0392b'}`,
          color: '#222',
          borderRadius: '16px',
          boxShadow: `0 0 16px 2px ${lastResult.correct === 1 ? '#43e97b55' : lastResult.missed === -1 ? '#ffe06655' : '#ff6b6b55'}`,
          padding: '1.2rem',
          textAlign: 'center',
          animation: 'fadeIn 0.5s',
          maxWidth: '340px',
          margin: '0 auto'
        }} aria-live="polite">
          <div style={{ fontSize: '2.2rem', marginBottom: '0.3rem' }}>
            {lastResult.correct === 1 && '✅'}
            {lastResult.missed === -1 && '⏱️'}
            {lastResult.correct === 0 && lastResult.missed === false && '❌'}
          </div>
          <div className="mystery-title" style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '0.3rem 0' }}>
            {lastResult.correct === 1 && 'Correct!'}
            {lastResult.missed === -1 && 'Missed!'}
            {lastResult.correct === 0 && lastResult.missed === false && 'Wrong!'}
          </div>
          <div className="card-title" style={{marginBottom: '0.7rem'}}>{lastResult.card.name}</div>
          <button className="confirm-btn" onClick={handleConfirm} style={{ marginTop: '0.5rem', fontSize: '1rem' }}>
            Confirm
          </button>
        </div>
      )}
      {history.length > 0 && (
        <div style={{marginTop: '1.5rem', width: '100%'}}>
          <h3 style={{marginBottom: '0.7rem'}}>Guess History</h3>
          <ul style={{paddingLeft: 0, listStyle: 'none'}}>
            {history.map((entry, i) => {
              let label = '';
              let color = '';
              if (entry.correct === 1) {
                label = '✅ Correct';
                color = 'green';
              } else if (entry.correct === -1) {
                label = '⏱️ Miss';
                color = 'orange';
              } else if (entry.correct === 0) {
                label = '❌ Wrong';
                color = 'red';
              } else {
                label = '⚠️ Unknown';
                color = 'black';
              }
              return (
                <li key={i} style={{ color, marginBottom: '0.3rem' }}>
                  {entry.card.name} – {label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {gameOver && (
        <div style={{marginTop: '1.5rem'}}>
          <div className={`result-banner ${won ? 'win' : 'lose'}`}> 
            {won ? '🎉 You won the game!' : '❌ Game over – you lost.'}
          </div>
          <button className="confirm-btn" onClick={resetGame} style={{marginTop: '1.2rem'}}>
            🔁 Play Again
          </button>
          <div style={{ marginTop: '1rem' }}>
            <button className="confirm-btn" onClick={onBackToProfile} style={{background: '#e3eafc', color: '#4f8cff'}}>
              🏠 Back to Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
