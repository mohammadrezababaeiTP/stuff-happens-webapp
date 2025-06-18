import React from 'react';

function GameHistory({ data, onClose }) {
  console.log("Game History Data:", data);
  return (
    <div>
      <h2>📜 Game History</h2>
      <button onClick={onClose}>⬅️ Back to Game</button>

      {data.length === 0 ? (
        <p>No games played yet.</p>
      ) : (
        data.map((game) => {
          const totalCorrect = game.rounds.filter(r => r.won === 1).length;
          const totalCollected = game.rounds.filter(r => r.won !== 2).length;


          return (
            <div
              key={game.gameId}
              style={{
                border: '1px solid #ccc',
                padding: '1rem',
                margin: '1rem 0',
                opacity: game.outcome === 'in-progress' ? 0.5 : 1,
                background: game.outcome === 'in-progress' ? '#f6f6f6' : '#fff',
                filter: game.outcome === 'in-progress' ? 'grayscale(0.7)' : 'none',
                borderRadius: '12px'
              }}
            >
             <p>Start: {game.start_time ? new Date(game.start_time + 'Z').toLocaleString() : 'N/A'}</p>
<p>End: {game.end_time ? new Date(game.end_time + 'Z').toLocaleString() : 'N/A'}</p>
              <p
                style={{
                  color: game.outcome === 'win'
                    ? 'green'
                    : game.outcome === 'lose'
                    ? 'red'
                    : 'gray',
                  fontWeight: 700,
                  fontSize: '1.1em'
                }}
              >
                Outcome: {game.outcome === 'win'
                  ? <span style={{color:'green'}}>win 🎉</span>
                  : game.outcome === 'lose'
                  ? <span style={{color:'red'}}>lose ❌</span>
                  : <span style={{color:'#666'}}>in progress</span>
                }
              </p>
              {game.rounds && game.rounds.length > 0 && (
                <div>
                  <h4 style={{margin: '0.7em 0 0.3em 0'}}>Cards Played:</h4>
                  <ul style={{paddingLeft: 0, listStyle: 'none'}}>
                    {(() => {
                      // Separate initial and played cards
                      const initialCards = game.rounds.filter(r => r.won === 2);
                      const playedCards = game.rounds.filter(r => r.won !== 2);

                      return (
                        <>
                          {initialCards.map((r, index) => (
                            <li
                              key={`initial-${index}`}
                              style={{ color: '#666', marginBottom: '0.2em', fontWeight: 500 }}
                            >
                              🟦 Initial Card: <span style={{fontWeight:500}}>{r.card_name}</span>
                            </li>
                          ))}
                          {playedCards.map((r, index) => {
                            let label = '';
                            let color = '';
                            if (r.won === 1) {
                              label = '✅ Correct';
                              color = 'green';
                            } else if (r.won === 0) {
                              label = '❌ Wrong';
                              color = 'red';
                            } else if (r.won === -1) {
                              label = '⏱️ Miss';
                              color = 'orange';
                            } else {
                              label = '⚠️ Unknown';
                              color = 'black';
                            }
                            return (
                              <li
                                key={`played-${index}`}
                                style={{
                                  color,
                                  marginBottom: '0.2em',
                                  fontWeight: r.won === 1 ? 700 : 400,
                                  fontSize: r.won === 1 ? '1.01em' : '1em'
                                }}
                              >
                                Round {r.round_number}: <span style={{fontWeight:500}}>{r.card_name}</span> – {label}
                              </li>
                            );
                          })}
                        </>
                      );
                    })()}
                  </ul>
                  <div style={{marginTop: '0.5em', fontWeight: 600}}>
                    Total Correct: <span style={{color: 'green'}}>{totalCorrect}</span>
                  </div>
                  <div style={{marginTop: '0.3em', fontWeight: 600}}>
                    Total collected cards: <span style={{color: 'blue'}}>{totalCollected}</span>
                  </div>
                </div>
              )}
              {game.outcome === 'in-progress' && (
                <div style={{ color: '#888', fontStyle: 'italic', marginTop: '0.5rem' }}>
                  (Game in progress or abandoned)
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default GameHistory;
