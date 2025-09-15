import React from 'react';

const pieceSymbols = {
  'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
  'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
};

const Board = ({ board, handleSquareClick, selectedSquare, playerColor }) => {
  const displayedBoard = playerColor === 'black' ? board.map(row => [...row].reverse()).reverse() : board;

  return (
    <div className="grid grid-cols-8 grid-rows-8 border-2 border-gray-800 shadow-xl">
      {displayedBoard.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const isWhite = (rowIndex + colIndex) % 2 === 0;
          const absoluteRow = playerColor === 'black' ? 7 - rowIndex : rowIndex;
          const absoluteCol = playerColor === 'black' ? 7 - colIndex : colIndex;
          const isSelected = selectedSquare && selectedSquare.row === absoluteRow && selectedSquare.col === absoluteCol;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-12 h-12 flex items-center justify-center transition-colors duration-200
                ${isWhite ? 'bg-yellow-100' : 'bg-amber-800'}
                ${isSelected ? 'ring-4 ring-blue-500 z-10' : ''}
              `}
              onClick={() => handleSquareClick(absoluteRow, absoluteCol)}
            >
              <span className={`text-4xl font-bold ${piece.toLowerCase() === piece ? 'text-gray-900' : 'text-red-600'}`}>
                {pieceSymbols[piece]}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Board;