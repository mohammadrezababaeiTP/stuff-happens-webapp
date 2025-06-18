import { useState, useEffect } from 'react';
import './DemoGame.css';

// Full demo card set (add more as needed)
//these cards are for demo and they are not stored in the db 
const allDemoCards = [
  { id: 1, name: 'Missed project deadline', image_path: 'forgot-deadline.jpg', bad_luck_index: 5 },
  { id: 2, name: 'Laptop crashed the night before exam', image_path: 'laptop-crash.jpg', bad_luck_index: 29.5 },
  { id: 3, name: 'Overslept on exam morning', image_path: 'oversleep-exam.jpg', bad_luck_index: 26 },
  { id: 4, name: 'Forgot university Wi-Fi password', image_path: 'wifi-password.jpg', bad_luck_index: 48 },
  { id: 5, name: 'Lost project file', image_path: 'lost-file.jpg', bad_luck_index: 33 },
  { id: 6, name: 'No food left at cafeteria', image_path: 'no-food-left.jpg', bad_luck_index: 62 },
  { id: 7, name: 'Bike crash on campus', image_path: 'bike-accident.jpg', bad_luck_index: 65 },
  { id: 8, name: 'Group members caused low grade', image_path: 'group-lowgrade.jpg', bad_luck_index: 67 },
];
//this part handle the main demo game logic , and display the first3cards and shows the mystery card for single demo round
//handle the game result manage the state for the demo round
function getRandomCards() {
  const shuffled = [...allDemoCards].sort(() => 0.5 - Math.random());
  const initial = shuffled.slice(0, 3);
  // Pick a mystery card not in initial
  const remaining = shuffled.slice(3);
  const mystery = remaining[Math.floor(Math.random() * remaining.length)];
  return { initial, mystery };
}
//this shows the user is playing or ended the game and for guessing and 
// saving the results and 3 initial cards and 1 card for the demo
function DemoGame({ onBack }) {
  const [step, setStep] = useState('play'); // 'play' | 'end'
  const [guessIndex, setGuessIndex] = useState(null);
  const [result, setResult] = useState(null);
  const [{ initial, mystery }, setCards] = useState(getRandomCards());
  const [timer, setTimer] = useState(30);
  const [missed, setMissed] = useState(false);
// Handle timer and round state: reset timer on new round, and end the round if time runs out.
  useEffect(() => {
    if (step !== 'play') return;
    setTimer(30);
    setMissed(false);
  }, [step, initial, mystery]);

  useEffect(() => {
    if (step !== 'play') return;
    if (timer === 0) {
      setMissed(true);
      setResult({ card: mystery, isCorrect: false, timeout: true });
      setStep('end');
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timer, mystery]);
//check the game is still playing or end 
//Determines if the guess is correct by comparing the mystery card’s index to the selected position , then set the result
  const handleGuess = (index) => {
    if (step !== 'play') return;
    setGuessIndex(index);
    const sorted = [...initial].sort((a, b) => a.bad_luck_index - b.bad_luck_index);
    const left = index === 0 ? -Infinity : sorted[index - 1].bad_luck_index;
    const right = index === sorted.length ? Infinity : sorted[index].bad_luck_index;
    const isCorrect = mystery.bad_luck_index > left && mystery.bad_luck_index < right;
    setResult({ card: mystery, isCorrect });
    setStep('end');
  };
//reset the demo game 
  const handleTryAgain = () => {
    setStep('play');
    setGuessIndex(null);
    setResult(null);
    setCards(getRandomCards());
    setTimer(30);
    setMissed(false);
  };
//This section renders the demo game’s user interface, updating what’s shown depending 
// on whether the user is playing, has guessed, or wants to replay or exit.
  if (step === 'end') {
    return (
      <div className="demo-game-container">
        <h2 className="demo-title">Thanks for playing the demo!</h2>
        <p>
          {result && (
            <>
              <span className="demo-mystery-name">{result.card.name}</span><br />
              <img src={`images/${result.card.image_path}`} alt={result.card.name} width="200" style={{ borderRadius: '10px', margin: '0.7rem 0' }} /><br />
              {result.timeout ? (
                <span style={{ color: 'orange' }}>⏰ Time is up! Missed this card.</span>
              ) : result.isCorrect ? (
                <span style={{ color: 'green' }}>✅ Correct!</span>
              ) : (
                <span style={{ color: 'red' }}>❌ Wrong!</span>
              )}
            </>
          )}
        </p>
        <p style={{ marginTop: '1.5rem' }}>
          Log in to play full games and view your history.
        </p>
        <button className="demo-place-btn" onClick={handleTryAgain} style={{ marginRight: '1rem' }}>Try Again</button>
        <button className="demo-place-btn" onClick={onBack}>Back to Login</button>
      </div>
    );
  }

  // Play step
  //getRandomCards: Selects 3 random initial cards and 1 random mystery card for the demo round,
  //  ensuring no duplicates.
  //Utility/Support Logic: Any other small functions or constants needed to 
  // support the main demo game flow (e.g., shuffling, picking cards, etc.).
  const sorted = [...initial].sort((a, b) => a.bad_luck_index - b.bad_luck_index);

  return (
    <div className="demo-game-container">
      <h2 className="demo-title">Demo Game</h2>
      <div className="demo-timer">
        <span role="img" aria-label="timer">⏱️</span> Timer: {timer}s
      </div>
      <ul className="demo-cards-list">
        {sorted.map((card, i) => (
          <li key={card.id} className="demo-card-row">
            <img src={`images/${card.image_path}`} alt={card.name} />
            <div className="demo-card-info">
              <strong>{card.name}</strong> - Bad Luck: {card.bad_luck_index}
            </div>
            <button className="demo-place-btn" onClick={() => handleGuess(i)} disabled={step === 'end' || missed}>
              ⬇️ Place Here
            </button>
          </li>
        ))}
        <li className="demo-card-row" style={{ justifyContent: 'center', background: 'none', boxShadow: 'none' }}>
          <button className="demo-place-btn" onClick={() => handleGuess(sorted.length)} disabled={step === 'end' || missed}>
            ⬇️ Place Here (end)
          </button>
        </li>
      </ul>
      <div className="demo-mystery-section">
        <div className="demo-mystery-title">Mystery Card</div>
        <div className="demo-mystery-name">{mystery.name}</div>
        <img src={`images/${mystery.image_path}`} alt={mystery.name} />
        <div className="demo-mystery-desc">Where do you think this card belongs?</div>
      </div>
    </div>
  );
}

export default DemoGame;
