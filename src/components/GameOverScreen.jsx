import React from 'react';

const GameOverScreen = ({ winner, playerColor, resetGame }) => {
  const didPlayerWin = winner === playerColor;
  
  const message = didPlayerWin
    ? "Congratulations, you won!"
    : "The opponent has won. Better luck next time!";
  
  const icon = didPlayerWin ? '🏆' : '😔';

  return (
    <div className="absolute inset-0 bg-slate-800 bg-opacity-70 flex flex-col items-center justify-center z-20">
      <div className="bg-white rounded-xl shadow-2xl p-8 text-center animate-fade-in-down">
        <div className="text-6xl mb-4">{icon}</div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">{message}</h2>
        <p className="text-slate-600 mb-6">
          {winner ? `${winner.charAt(0).toUpperCase() + winner.slice(1)} wins by checkmate.` : 'The game has ended.'}
        </p>
        <button
          onClick={resetGame}
          className="px-6 py-3 font-semibold text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 transition-transform transform hover:scale-105"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;