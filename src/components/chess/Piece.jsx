import React from 'react';

const pieces = {
  'K': 'M16 4 L14 12 L18 12 L16 4 M12 13 L20 13 L20 18 L12 18 L12 13 M14 19 L18 19 L18 28 L14 28 L14 19',
  'Q': 'M8 8 L12 13 L16 8 L20 13 L24 8 L22 20 L10 20 L8 8 M10 22 L22 22 L22 28 L10 28 L10 22',
  'R': 'M8 8 L8 14 L12 14 L12 12 L20 12 L20 14 L24 14 L24 8 L8 8 M10 15 L10 28 L22 28 L22 15 L10 15',
  'B': 'M16 6 C18 10, 18 14, 16 18 C14 14, 14 10, 16 6 M13 20 L19 20 L19 28 L13 28 L13 20',
  'N': 'M10 8 C14 4, 18 4, 22 8 L22 22 L18 28 L12 28 L10 22 L10 8',
  'P': 'M16 10 C18 12, 18 16, 16 18 C14 16, 14 12, 16 10 M14 20 L18 20 L18 28 L14 28 L14 20',
};

const Piece = ({ piece }) => {
  if (!piece) return null;

  const isWhite = piece === piece.toUpperCase();
  const pieceType = piece.toUpperCase();
  
  const path = pieces[pieceType];
  // ✅ CHANGE: High-contrast fill and stroke colors
  const color = isWhite ? '#FFFFFF' : '#111827'; // White or Gray-900 (near black)
  const strokeColor = isWhite ? '#111827' : '#FFFFFF'; // Opposite for a strong outline

  return (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <g>
        <path
          d={path}
          stroke={strokeColor}
          strokeWidth="1.5" // Increased stroke width for better visibility
          strokeLinejoin="round"
          fill={color}
        />
      </g>
    </svg>
  );
};

export default Piece;