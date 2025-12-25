import { Square, Color, PieceSymbol } from 'chess.js';

export type GameMode = 'bot' | 'pvp';
export type GameStatus = 'waiting' | 'active' | 'finished' | 'aborted';
export type GameResult = '1-0' | '0-1' | '1/2-1/2' | '*';
export type GameTermination = 
  | 'checkmate' 
  | 'resign' 
  | 'timeout' 
  | 'stalemate' 
  | 'draw_agreement' 
  | 'insufficient_material'
  | 'threefold_repetition'
  | 'fifty_move_rule'
  | 'aborted';

export interface TimeControl {
  baseMs: number;
  incrementMs: number;
}

export interface GamePlayer {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  rating?: number;
  timeRemainingMs: number;
}

export interface Move {
  id?: string;
  gameId: string;
  ply: number;
  uci: string;
  san: string;
  fenAfter: string;
  createdAt?: string;
}

export interface Game {
  id: string;
  mode: GameMode;
  status: GameStatus;
  whitePlayer?: GamePlayer;
  blackPlayer?: GamePlayer;
  createdBy: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  initialFen: string;
  currentFen: string;
  pgn: string;
  result: GameResult;
  termination?: GameTermination;
  timeControl: TimeControl;
  moves: Move[];
}

export interface BotDifficulty {
  label: string;
  depth: number;
  moveTimeMs: number;
  description: string;
}

export const BOT_DIFFICULTIES: BotDifficulty[] = [
  { label: 'Beginner', depth: 2, moveTimeMs: 50, description: 'Perfect for learning' },
  { label: 'Easy', depth: 4, moveTimeMs: 100, description: 'Casual play' },
  { label: 'Medium', depth: 8, moveTimeMs: 200, description: 'A fair challenge' },
  { label: 'Hard', depth: 12, moveTimeMs: 400, description: 'For experienced players' },
  { label: 'Expert', depth: 16, moveTimeMs: 800, description: 'Near master level' },
];

export const TIME_CONTROLS: { label: string; control: TimeControl }[] = [
  { label: 'Bullet 1+0', control: { baseMs: 60000, incrementMs: 0 } },
  { label: 'Bullet 2+1', control: { baseMs: 120000, incrementMs: 1000 } },
  { label: 'Blitz 3+0', control: { baseMs: 180000, incrementMs: 0 } },
  { label: 'Blitz 3+2', control: { baseMs: 180000, incrementMs: 2000 } },
  { label: 'Blitz 5+0', control: { baseMs: 300000, incrementMs: 0 } },
  { label: 'Blitz 5+3', control: { baseMs: 300000, incrementMs: 3000 } },
  { label: 'Rapid 10+0', control: { baseMs: 600000, incrementMs: 0 } },
  { label: 'Rapid 10+5', control: { baseMs: 600000, incrementMs: 5000 } },
  { label: 'Rapid 15+10', control: { baseMs: 900000, incrementMs: 10000 } },
  { label: 'Classical 30+0', control: { baseMs: 1800000, incrementMs: 0 } },
];

export interface ChessBoardState {
  fen: string;
  turn: Color;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  lastMove?: { from: Square; to: Square };
  legalMoves: Map<Square, Square[]>;
  capturedPieces: { white: PieceSymbol[]; black: PieceSymbol[] };
  moveHistory: { san: string; fen: string }[];
}

export interface Profile {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  stats?: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
  };
}

export type ColorPreference = 'white' | 'black' | 'random';

export interface CreateGameOptions {
  mode: GameMode;
  colorPreference: ColorPreference;
  timeControl: TimeControl;
  botDifficulty?: BotDifficulty;
}

