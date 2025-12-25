import { create } from 'zustand';
import { Chess, Square, Move as ChessMove, Color, PieceSymbol } from 'chess.js';
import { 
  Game, 
  GameMode, 
  GameStatus, 
  GameResult, 
  Move, 
  TimeControl,
  BotDifficulty,
  GameTermination,
  ChessBoardState
} from '@/types/chess';

interface GameState {
  // Core game state
  game: Chess;
  gameId: string | null;
  mode: GameMode | null;
  status: GameStatus;
  result: GameResult;
  termination: GameTermination | null;
  
  // Players
  playerColor: Color | null;
  whiteTimeMs: number;
  blackTimeMs: number;
  timeControl: TimeControl | null;
  
  // Bot settings
  botDifficulty: BotDifficulty | null;
  
  // Board state
  boardState: ChessBoardState;
  selectedSquare: Square | null;
  highlightedSquares: Square[];
  isAnimating: boolean;
  boardOrientation: 'white' | 'black';
  
  // Move viewing
  viewingMoveIndex: number;
  
  // Actions
  initGame: (options: {
    mode: GameMode;
    playerColor: Color;
    timeControl: TimeControl;
    botDifficulty?: BotDifficulty;
    fen?: string;
    gameId?: string;
  }) => void;
  makeMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
  selectSquare: (square: Square | null) => void;
  setHighlightedSquares: (squares: Square[]) => void;
  flipBoard: () => void;
  updateTime: (color: Color, timeMs: number) => void;
  decrementTime: (color: Color, deltaMs: number) => void;
  setResult: (result: GameResult, termination: GameTermination) => void;
  viewMove: (index: number) => void;
  reset: () => void;
  loadGame: (game: Game) => void;
  getPgn: () => string;
  getCurrentFen: () => string;
  undoMove: () => boolean;
  setIsAnimating: (animating: boolean) => void;
}

function computeBoardState(game: Chess, lastMove?: { from: Square; to: Square }): ChessBoardState {
  const moves = game.moves({ verbose: true });
  const legalMoves = new Map<Square, Square[]>();
  
  moves.forEach((move) => {
    const from = move.from as Square;
    const to = move.to as Square;
    if (!legalMoves.has(from)) {
      legalMoves.set(from, []);
    }
    legalMoves.get(from)!.push(to);
  });

  // Compute captured pieces
  const history = game.history({ verbose: true });
  const capturedPieces: { white: PieceSymbol[]; black: PieceSymbol[] } = {
    white: [],
    black: [],
  };
  
  history.forEach((move) => {
    if (move.captured) {
      if (move.color === 'w') {
        capturedPieces.white.push(move.captured);
      } else {
        capturedPieces.black.push(move.captured);
      }
    }
  });

  // Move history for navigation
  const tempGame = new Chess();
  const moveHistory = history.map((move) => {
    tempGame.move(move);
    return { san: move.san, fen: tempGame.fen() };
  });

  return {
    fen: game.fen(),
    turn: game.turn(),
    isCheck: game.isCheck(),
    isCheckmate: game.isCheckmate(),
    isStalemate: game.isStalemate(),
    isDraw: game.isDraw(),
    isGameOver: game.isGameOver(),
    lastMove,
    legalMoves,
    capturedPieces,
    moveHistory,
  };
}

const initialBoardState = computeBoardState(new Chess());

export const useGameStore = create<GameState>((set, get) => ({
  game: new Chess(),
  gameId: null,
  mode: null,
  status: 'waiting',
  result: '*',
  termination: null,
  
  playerColor: null,
  whiteTimeMs: 0,
  blackTimeMs: 0,
  timeControl: null,
  
  botDifficulty: null,
  
  boardState: initialBoardState,
  selectedSquare: null,
  highlightedSquares: [],
  isAnimating: false,
  boardOrientation: 'white',
  
  viewingMoveIndex: -1,

  initGame: (options) => {
    const game = new Chess(options.fen);
    const boardState = computeBoardState(game);
    
    set({
      game,
      gameId: options.gameId || `local-${Date.now()}`,
      mode: options.mode,
      status: 'active',
      result: '*',
      termination: null,
      playerColor: options.playerColor,
      whiteTimeMs: options.timeControl.baseMs,
      blackTimeMs: options.timeControl.baseMs,
      timeControl: options.timeControl,
      botDifficulty: options.botDifficulty || null,
      boardState,
      selectedSquare: null,
      highlightedSquares: [],
      boardOrientation: options.playerColor === 'w' ? 'white' : 'black',
      viewingMoveIndex: -1,
    });
  },

  makeMove: (from, to, promotion) => {
    const { game, status, boardState } = get();
    
    if (status !== 'active') return false;
    
    try {
      const move = game.move({ from, to, promotion });
      if (!move) return false;
      
      const newBoardState = computeBoardState(game, { from, to });
      const newViewingIndex = newBoardState.moveHistory.length - 1;
      
      set({
        boardState: newBoardState,
        selectedSquare: null,
        highlightedSquares: [],
        viewingMoveIndex: newViewingIndex,
      });
      
      // Check for game over
      if (newBoardState.isGameOver) {
        let result: GameResult = '*';
        let termination: GameTermination = 'checkmate';
        
        if (newBoardState.isCheckmate) {
          result = newBoardState.turn === 'w' ? '0-1' : '1-0';
          termination = 'checkmate';
        } else if (newBoardState.isStalemate) {
          result = '1/2-1/2';
          termination = 'stalemate';
        } else if (game.isThreefoldRepetition()) {
          result = '1/2-1/2';
          termination = 'threefold_repetition';
        } else if (game.isInsufficientMaterial()) {
          result = '1/2-1/2';
          termination = 'insufficient_material';
        } else if (game.isDraw()) {
          result = '1/2-1/2';
          termination = 'fifty_move_rule';
        }
        
        set({ status: 'finished', result, termination });
      }
      
      return true;
    } catch {
      return false;
    }
  },

  selectSquare: (square) => {
    const { selectedSquare, boardState, game, playerColor, status, viewingMoveIndex } = get();
    
    // Don't allow selection if game is not active or viewing history
    if (status !== 'active' || viewingMoveIndex !== boardState.moveHistory.length - 1) {
      set({ selectedSquare: null, highlightedSquares: [] });
      return;
    }
    
    // Don't allow moves when it's not player's turn
    if (playerColor && boardState.turn !== playerColor) {
      set({ selectedSquare: null, highlightedSquares: [] });
      return;
    }
    
    if (!square) {
      set({ selectedSquare: null, highlightedSquares: [] });
      return;
    }
    
    // If clicking the same square, deselect
    if (selectedSquare === square) {
      set({ selectedSquare: null, highlightedSquares: [] });
      return;
    }
    
    // If there's a selected square and this is a legal move target
    if (selectedSquare) {
      const legalTargets = boardState.legalMoves.get(selectedSquare) || [];
      if (legalTargets.includes(square)) {
        // This will be handled by the board component (promotion check, etc.)
        return;
      }
    }
    
    // Select the new square if it has a piece of the current turn
    const piece = game.get(square);
    if (piece && piece.color === boardState.turn) {
      const legalTargets = boardState.legalMoves.get(square) || [];
      set({ selectedSquare: square, highlightedSquares: legalTargets });
    } else {
      set({ selectedSquare: null, highlightedSquares: [] });
    }
  },

  setHighlightedSquares: (squares) => set({ highlightedSquares: squares }),

  flipBoard: () => set((state) => ({ 
    boardOrientation: state.boardOrientation === 'white' ? 'black' : 'white' 
  })),

  updateTime: (color, timeMs) => {
    if (color === 'w') {
      set({ whiteTimeMs: timeMs });
    } else {
      set({ blackTimeMs: timeMs });
    }
  },

  decrementTime: (color, deltaMs) => {
    const state = get();
    if (color === 'w') {
      const newTime = Math.max(0, state.whiteTimeMs - deltaMs);
      set({ whiteTimeMs: newTime });
      if (newTime === 0) {
        set({ status: 'finished', result: '0-1', termination: 'timeout' });
      }
    } else {
      const newTime = Math.max(0, state.blackTimeMs - deltaMs);
      set({ blackTimeMs: newTime });
      if (newTime === 0) {
        set({ status: 'finished', result: '1-0', termination: 'timeout' });
      }
    }
  },

  setResult: (result, termination) => {
    set({ status: 'finished', result, termination });
  },

  viewMove: (index) => {
    const { boardState, game } = get();
    const maxIndex = boardState.moveHistory.length - 1;
    const newIndex = Math.max(-1, Math.min(index, maxIndex));
    set({ viewingMoveIndex: newIndex, selectedSquare: null, highlightedSquares: [] });
  },

  reset: () => {
    const game = new Chess();
    set({
      game,
      gameId: null,
      mode: null,
      status: 'waiting',
      result: '*',
      termination: null,
      playerColor: null,
      whiteTimeMs: 0,
      blackTimeMs: 0,
      timeControl: null,
      botDifficulty: null,
      boardState: computeBoardState(game),
      selectedSquare: null,
      highlightedSquares: [],
      boardOrientation: 'white',
      viewingMoveIndex: -1,
    });
  },

  loadGame: (savedGame) => {
    const game = new Chess();
    game.loadPgn(savedGame.pgn);
    
    const history = game.history({ verbose: true });
    const lastMove = history.length > 0 
      ? { from: history[history.length - 1].from as Square, to: history[history.length - 1].to as Square }
      : undefined;
    
    set({
      game,
      gameId: savedGame.id,
      mode: savedGame.mode,
      status: savedGame.status,
      result: savedGame.result,
      termination: savedGame.termination || null,
      playerColor: null, // Will be set based on auth
      whiteTimeMs: savedGame.whitePlayer?.timeRemainingMs || savedGame.timeControl.baseMs,
      blackTimeMs: savedGame.blackPlayer?.timeRemainingMs || savedGame.timeControl.baseMs,
      timeControl: savedGame.timeControl,
      botDifficulty: null,
      boardState: computeBoardState(game, lastMove),
      selectedSquare: null,
      highlightedSquares: [],
      boardOrientation: 'white',
      viewingMoveIndex: history.length - 1,
    });
  },

  getPgn: () => get().game.pgn(),
  
  getCurrentFen: () => get().game.fen(),

  undoMove: () => {
    const { game, mode, status } = get();
    
    if (status !== 'active') return false;
    
    // Only allow undo in bot mode
    if (mode !== 'bot') return false;
    
    // Undo both bot's move and player's move
    const move1 = game.undo();
    const move2 = game.undo();
    
    if (!move1 && !move2) return false;
    
    const history = game.history({ verbose: true });
    const lastMove = history.length > 0
      ? { from: history[history.length - 1].from as Square, to: history[history.length - 1].to as Square }
      : undefined;
    
    set({
      boardState: computeBoardState(game, lastMove),
      viewingMoveIndex: history.length - 1,
    });
    
    return true;
  },

  setIsAnimating: (animating) => set({ isAnimating: animating }),
}));

