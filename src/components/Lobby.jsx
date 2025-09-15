import React from 'react';

const Lobby = ({ createGame }) => {
  return (
    <div className="w-full max-w-sm flex flex-col items-center space-y-4 animate-fade-in-down">
      <h2 className="text-2xl font-bold text-slate-700">Choose a Game Mode</h2>
      
      {/* Play vs. Computer Button */}
      <button
        onClick={() => createGame({ isComputer: true })}
        className="w-full px-6 py-4 text-lg font-bold text-white bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-105 flex items-center justify-center space-x-3"
      >
        <span className="text-2xl">🤖</span>
        <span>Play vs. Computer</span>
      </button>

      {/* Play Hotseat Button */}
      <button
        onClick={() => createGame({ isHotseatGame: true })}
        className="w-full px-6 py-4 text-lg font-bold text-slate-800 bg-yellow-400 rounded-lg shadow-lg hover:bg-yellow-500 transition-transform transform hover:scale-105 flex items-center justify-center space-x-3"
      >
        <span className="text-2xl">🤝</span>
        <span>Play Hotseat (2 Players)</span>
      </button>
    </div>
  );
};

export default Lobby;