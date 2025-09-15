import React from 'react';
import Piece from './Piece';

const Square = ({ piece, r, c, onClick, isSelected, isLastMove, isKingInCheck }) => {
  const isLight = (r + c) % 2 === 0;
  // ✅ CHANGE: New high-contrast board colors
  const bgColor = isLight ? 'bg-stone-200' : 'bg-emerald-700';

  const highlightClasses = [
    isSelected ? 'bg-lime-400/70' : '',
    isLastMove ? 'bg-yellow-300/50' : '',
    isKingInCheck ? 'bg-red-500/60' : '',
  ].join(' ');
  
  return (
    <div
      onClick={onClick}
      className={`relative w-full aspect-square flex items-center justify-center cursor-pointer ${bgColor}`}
    >
      <div className={`absolute inset-0 ${highlightClasses}`} />
      <div className="relative z-10 w-4/5 h-4/5">
        <Piece piece={piece} />
      </div>
    </div>
  );
};

export default Square;