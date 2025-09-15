import React from 'react';
import Square from './Square';

const Board = ({ board, handleSquareClick, selectedSquare, lastMove, checkStatus, playerColor }) => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const boardRanks = playerColor === 'black' ? ranks.slice().reverse() : ranks;
  const boardFiles = playerColor === 'black' ? files.slice().reverse() : files;
  
  const whiteKingPos = findKing(board, 'white');
  const blackKingPos = findKing(board, 'black');

  const renderBoard = () => {
    const boardToRender = playerColor === 'black' ? board.slice().reverse().map(row => row.slice().reverse()) : board;
    
    return boardToRender.map((row, r) =>
      row.map((piece, c) => {
        const originalR = playerColor === 'black' ? 7 - r : r;
        const originalC = playerColor === 'black' ? 7 - c : c;
        
        let isKingInCheck = false;
        if (checkStatus.white && whiteKingPos && whiteKingPos.row === originalR && whiteKingPos.col === originalC) isKingInCheck = true;
        if (checkStatus.black && blackKingPos && blackKingPos.row === originalR && blackKingPos.col === originalC) isKingInCheck = true;

        const isSel = selectedSquare && selectedSquare.row === originalR && selectedSquare.col === originalC;
        const isLast = lastMove && ((lastMove.start.row === originalR && lastMove.start.col === originalC) || (lastMove.end.row === originalR && lastMove.end.col === originalC));

        return (
          <Square
            key={`${originalR}-${originalC}`}
            piece={piece}
            r={originalR}
            c={originalC}
            onClick={() => handleSquareClick(originalR, originalC)}
            isSelected={isSel}
            isLastMove={isLast}
            isKingInCheck={isKingInCheck}
          />
        );
      })
    );
  };
  
  function findKing(boardToSearch, color) {
    const kingPiece = color === 'white' ? 'K' : 'k';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (boardToSearch[r][c] === kingPiece) return { row: r, col: c };
      }
    }
    return null;
  }

  return (
    // ✅ CHANGE: Updated text and border colors
    <div className="w-[480px] h-[480px] grid grid-cols-[20px_1fr] grid-rows-[1fr_20px] font-bold text-slate-700">
      <div className="grid grid-rows-8">
        {boardRanks.map(rank => <div key={rank} className="flex items-center justify-center text-sm">{rank}</div>)}
      </div>
      <div className="grid grid-cols-8 grid-rows-8 border-2 border-slate-700 shadow-xl">
        {renderBoard()}
      </div>
      <div />
      <div className="grid grid-cols-8">
        {boardFiles.map(file => <div key={file} className="flex items-center justify-center text-sm">{file}</div>)}
      </div>
    </div>
  );
};

export default Board;