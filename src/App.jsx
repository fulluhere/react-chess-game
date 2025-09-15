import React, { useState, useEffect, useRef } from 'react';
import {
  auth,
  db,
  appId,
  initialAuthToken,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  collection,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  getDocs
} from './services/firebase';
import Lobby from './components/Lobby';
import Game from './components/Game';

const initialBoard = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const App = () => {
  // --- STATE AND REFS ---
  const [userId, setUserId] = useState(null);
  const [appInitialized, setAppInitialized] = useState(false);
  const [board, setBoard] = useState(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [turn, setTurn] = useState('white');
  const [status, setStatus] = useState('Lobby');
  const [gameId, setGameId] = useState('');
  const [opponentId, setOpponentId] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [isComputerGame, setIsComputerGame] = useState(false);
  const lastMoveRef = useRef(null);
  const [checkStatus, setCheckStatus] = useState({ white: false, black: false });
  const [isHotseat, setIsHotseat] = useState(false);

  // --- USEEFFECT HOOKS ---
  useEffect(() => {
    const initFirebase = async () => {
      try {
        if (initialAuthToken) await signInWithCustomToken(auth, initialAuthToken);
        else await signInAnonymously(auth);
      } catch (error) {
        console.error("Firebase Auth error:", error);
        await signInAnonymously(auth);
      }
    };
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
      setAppInitialized(true);
    });
    if (!appInitialized) initFirebase();
    return () => unsubscribeAuth();
  }, [appInitialized]);

  useEffect(() => {
    if (!userId || !appInitialized) return;
    const gamesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'chess_games');
    const q = query(gamesCollection);
    const unsubscribeGames = onSnapshot(q, (snapshot) => {
      const gameList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const myGame = gameList.find(game => game.id === gameId);
      if (myGame) {
        try {
          const newBoard = JSON.parse(myGame.board);
          setBoard(Array.isArray(newBoard) && newBoard.length === 8 ? newBoard : initialBoard);
        } catch (e) { setBoard(initialBoard); }
        setTurn(myGame.turn);
        setIsComputerGame(myGame.isComputerGame || false);
        if (myGame.lastMove) lastMoveRef.current = myGame.lastMove;
        if (myGame.players.length === 2 && myGame.status === 'waiting') {
          setStatus('playing');
          setOpponentId(myGame.players.find(p => p !== userId));
        }
        if (myGame.winner) setStatus('Game Over');
      }
    });
    return () => unsubscribeGames();
  }, [userId, gameId, appInitialized]);

  useEffect(() => {
    if (status === 'playing' && isComputerGame && turn !== playerColor) {
      const timer = setTimeout(() => makeComputerMove(), 1000);
      return () => clearTimeout(timer);
    }
  }, [turn, status, isComputerGame, playerColor, board]);

  // --- CHESS LOGIC FUNCTIONS ---
  const findKing = (currentBoard, color) => {
    const kingPiece = color === 'white' ? 'K' : 'k';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (currentBoard[r][c] === kingPiece) return { row: r, col: c };
      }
    }
    return null;
  };

  const getBoardAfterMove = (currentBoard, move) => {
    const newBoard = currentBoard.map(row => [...row]);
    const piece = newBoard[move.start.row][move.start.col];
    newBoard[move.end.row][move.end.col] = piece;
    newBoard[move.start.row][move.start.col] = '';
    if (piece.toLowerCase() === 'p' && (move.end.row === 0 || move.end.row === 7)) {
      newBoard[move.end.row][move.end.col] = piece === 'P' ? 'Q' : 'q';
    }
    return newBoard;
  };

  const isValidMove = (currentBoard, start, end, turnColor, ignoreCheck = false) => {
    if (!start || !end || start.row < 0 || start.row > 7 || start.col < 0 || start.col > 7 || end.row < 0 || end.row > 7 || end.col < 0 || end.col > 7) {
      return false;
    }
    const startPiece = currentBoard[start.row][start.col];
    if (!startPiece) return false;
    const endPiece = currentBoard[end.row][end.col];
    const dRow = end.row - start.row;
    const dCol = end.col - start.col;
    const movingPlayerColor = (startPiece === startPiece.toUpperCase()) ? 'white' : 'black';
    if (!ignoreCheck && movingPlayerColor !== turnColor) return false;
    if (endPiece && movingPlayerColor === ((endPiece === endPiece.toUpperCase()) ? 'white' : 'black')) return false;
    const isPathClear = (rStep, cStep, distance) => {
      for (let i = 1; i < distance; i++) {
        if (currentBoard[start.row + i * rStep][start.col + i * cStep]) return false;
      }
      return true;
    };
    let valid = false;
    switch (startPiece.toLowerCase()) {
      case 'p':
        const direction = movingPlayerColor === 'white' ? -1 : 1;
        const startRow = movingPlayerColor === 'white' ? 6 : 1;
        if (dCol === 0 && !endPiece) {
          if (dRow === direction) valid = true;
          if (dRow === 2 * direction && start.row === startRow && !currentBoard[start.row + direction][start.col]) valid = true;
        }
        if (Math.abs(dCol) === 1 && dRow === direction && endPiece) valid = true;
        break;
      case 'r': if (dRow === 0 || dCol === 0) valid = isPathClear(Math.sign(dRow), Math.sign(dCol), Math.max(Math.abs(dRow), Math.abs(dCol))); break;
      case 'b': if (Math.abs(dRow) === Math.abs(dCol)) valid = isPathClear(Math.sign(dRow), Math.sign(dCol), Math.abs(dRow)); break;
      case 'q': if (dRow === 0 || dCol === 0 || Math.abs(dRow) === Math.abs(dCol)) valid = isPathClear(Math.sign(dRow), Math.sign(dCol), Math.max(Math.abs(dRow), Math.abs(dCol))); break;
      case 'k': if (Math.abs(dRow) <= 1 && Math.abs(dCol) <= 1) valid = true; break;
      case 'n': if ((Math.abs(dRow) === 2 && Math.abs(dCol) === 1) || (Math.abs(dRow) === 1 && Math.abs(dCol) === 2)) valid = true; break;
      default: break;
    }
    if (valid && !ignoreCheck) {
      const newBoard = getBoardAfterMove(currentBoard, { start, end });
      const kingPos = findKing(newBoard, movingPlayerColor);
      if (kingPos && isSquareUnderAttack(newBoard, kingPos.row, kingPos.col, movingPlayerColor === 'white' ? 'black' : 'white')) {
        return false;
      }
    }
    return valid;
  };

  const isSquareUnderAttack = (currentBoard, row, col, attackerColor) => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece) {
          const pieceColor = (piece === piece.toUpperCase()) ? 'white' : 'black';
          if (pieceColor === attackerColor) {
            if (isValidMove(currentBoard, { row: r, col: c }, { row, col }, attackerColor, true)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  const generateMovesForPiece = (piece, r, c, currentBoard, turnColor) => {
    const moves = [];
    const addMoves = (moveOffsets) => {
      for (const [dr, dc] of moveOffsets) {
        const move = { start: { row: r, col: c }, end: { row: r + dr, col: c + dc } };
        if (isValidMove(currentBoard, move.start, move.end, turnColor)) moves.push(move);
      }
    };
    const addSlidingMoves = (directions) => {
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          const endR = r + i * dr;
          const endC = c + i * dc;
          const move = { start: { row: r, col: c }, end: { row: endR, col: endC } };
          if (isValidMove(currentBoard, move.start, move.end, turnColor)) {
            moves.push(move);
            if (currentBoard[endR][endC]) break;
          } else {
            break;
          }
        }
      }
    };
    switch (piece.toLowerCase()) {
      case 'p': addMoves([[-2, 0], [-1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1], [1, 0], [2, 0]]); break;
      case 'r': addSlidingMoves([[0, 1], [0, -1], [1, 0], [-1, 0]]); break;
      case 'n': addMoves([[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]]); break;
      case 'b': addSlidingMoves([[1, 1], [1, -1], [-1, 1], [-1, -1]]); break;
      case 'q': addSlidingMoves([[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]); break;
      case 'k': addMoves([[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]); break;
      default: break;
    }
    return moves;
  };
  
  const isCheckmate = (currentBoard, color) => {
    const kingPos = findKing(currentBoard, color);
    if (!kingPos) return false;
    const opponentColor = color === 'white' ? 'black' : 'white';
    if (!isSquareUnderAttack(currentBoard, kingPos.row, kingPos.col, opponentColor)) {
      return false;
    }
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece) {
          const pieceColor = (piece === piece.toUpperCase()) ? 'white' : 'black';
          if (pieceColor === color) {
            const moves = generateMovesForPiece(piece, r, c, currentBoard, color);
            if (moves.length > 0) return false;
          }
        }
      }
    }
    return true;
  };

  const updateBoardState = async (newBoard) => {
    const opponentColor = turn === 'white' ? 'black' : 'white';
    const checkmate = isCheckmate(newBoard, opponentColor);
    let isOpponentInCheck = false;
    const opponentKingPos = findKing(newBoard, opponentColor);
    if (opponentKingPos) {
      isOpponentInCheck = isSquareUnderAttack(newBoard, opponentKingPos.row, opponentKingPos.col, turn);
    }
    setCheckStatus({
      white: opponentColor === 'white' ? isOpponentInCheck : false,
      black: opponentColor === 'black' ? isOpponentInCheck : false,
    });
    const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'chess_games', gameId);
    await setDoc(gameRef, {
      board: JSON.stringify(newBoard),
      turn: opponentColor,
      lastMove: lastMoveRef.current,
      winner: checkmate ? turn : null,
      status: checkmate ? 'Game Over' : 'playing'
    }, { merge: true });
  };
  
  const handleSquareClick = async (row, col) => {
    if (status !== 'playing' || (!isHotseat && turn !== playerColor)) return;
    if (!selectedSquare) {
      const piece = board[row][col];
      const isPieceWhite = piece === piece.toUpperCase();
      const pieceColor = isPieceWhite ? 'white' : 'black';
      if (piece && pieceColor === turn) {
        setSelectedSquare({ row, col });
      }
    } else {
      const start = selectedSquare;
      const end = { row, col };
      if (isValidMove(board, start, end, turn)) {
        const newBoard = getBoardAfterMove(board, { start, end });
        lastMoveRef.current = { start, end };
        await updateBoardState(newBoard);
      }
      setSelectedSquare(null);
    }
  };

  const makeComputerMove = async () => {
    const computerColor = playerColor === 'white' ? 'black' : 'white';
    let possibleMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          const pieceColor = (piece === piece.toUpperCase()) ? 'white' : 'black';
          if (pieceColor === computerColor) {
            const movesForThisPiece = generateMovesForPiece(piece, r, c, board, computerColor);
            possibleMoves.push(...movesForThisPiece);
          }
        }
      }
    }
    if (possibleMoves.length > 0) {
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      const newBoard = getBoardAfterMove(board, randomMove);
      lastMoveRef.current = randomMove;
      await updateBoardState(newBoard);
    }
  };

  const createGame = async (gameOptions) => {
    const { isComputer = false, isHotseatGame = false } = gameOptions;
    setIsHotseat(isHotseatGame);
    setBoard(initialBoard);
    const newGameRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'chess_games'));
    const players = [userId];
    if (isComputer) players.push('AI_Opponent');
    if (isHotseatGame) players.push('Player 2 (Hotseat)');
    await setDoc(newGameRef, {
      board: JSON.stringify(initialBoard),
      players: players,
      turn: 'white',
      status: 'playing',
      isComputerGame: isComputer,
    });
    setGameId(newGameRef.id);
    setPlayerColor('white');
    setStatus('playing');
    if (isComputer) setOpponentId('AI_Opponent');
  };

  const resetGame = async () => {
    if (gameId) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'chess_games', gameId));
    }
    setGameId('');
    setOpponentId(null);
    setPlayerColor(null);
    setStatus('Lobby');
    setBoard(initialBoard);
    setCheckStatus({ white: false, black: false });
    setIsHotseat(false);
  };

  // --- JSX RENDER ---
  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 font-inter items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 flex flex-col items-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Multiplayer Chess</h1>
        {!appInitialized && <p>Loading...</p>}
        {appInitialized && status === 'Lobby' && (
          <Lobby createGame={createGame} />
        )}
        {appInitialized && (status === 'playing' || status === 'Game Over') && (
          <Game
            board={board}
            handleSquareClick={handleSquareClick}
            selectedSquare={selectedSquare}
            playerColor={playerColor}
            turn={turn}
            resetGame={resetGame}
            status={status}
            winner={status === 'Game Over' ? (turn !== playerColor ? 'You' : 'Opponent') : null}
            lastMove={lastMoveRef.current}
            checkStatus={checkStatus}
          />
        )}
      </div>
    </div>
  );
};

export default App;