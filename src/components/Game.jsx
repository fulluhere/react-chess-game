import React from 'react';
import Board from './chess/Board';
import GameOverScreen from './GameOverScreen';

const Game = ({
  board,
  handleSquareClick,
  selectedSquare,
  playerColor,
  turn,
  resetGame,
  lastMove,
  checkStatus,
  status,
  winner,
}) => {
  return (
    <div className="relative flex flex-col items-center space-y-4">
      
      {status === 'Game Over' && (
        <GameOverScreen winner={winner} playerColor={playerColor} resetGame={resetGame} />
      )}

      <div className="text-xl font-semibold">
        {status !== 'Game Over' && `${turn.charAt(0).toUpperCase() + turn.slice(1)}'s Turn`}
      </div>

      <Board 
        board={board}
        handleSquareClick={handleSquareClick}
        selectedSquare={selectedSquare}
        lastMove={lastMove}
        checkStatus={checkStatus}
        playerColor={playerColor}
      />

      <div className="flex space-x-4">
        <button
          onClick={resetGame}
          className="px-4 py-2 font-semibold text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600 transition"
        >
          End Game
        </button>
      </div>
    </div>
  );
};

export default Game;