import { create } from 'zustand';
import { Chess, Square, PieceSymbol } from 'chess.js';
import {
  LearnLesson,
  LearnLessonStep,
  LearnUserProgress,
  LearnPuzzle,
  StepArrow,
} from '@/types/learn';

// ============================================
// Lesson Player State
// ============================================
interface LessonState {
  // Current lesson data
  lesson: LearnLesson | null;
  steps: LearnLessonStep[];
  currentStepIndex: number;

  // Chess game state for the lesson
  game: Chess;
  currentFen: string;

  // Board interaction state
  selectedSquare: Square | null;
  highlightedSquares: Square[];
  arrows: StepArrow[];
  customHighlights: string[];
  pieceToMove: string | null; // Square of the piece that should be moved (for visual guidance)
  boardOrientation: 'white' | 'black';

  // Step progress
  stepCompleted: boolean;
  showingHint: boolean;
  currentHintIndex: number;
  hintsUsed: number;
  attempts: number;
  wrongMoveMessage: string | null;
  correctMoveMessage: string | null;

  // Quiz state (for quiz steps)
  selectedQuizOption: string | null;
  quizAnswered: boolean;
  quizCorrect: boolean;

  // Overall lesson progress
  progress: LearnUserProgress | null;
  startTime: number | null;

  // Puzzle mode (for puzzle steps or practice)
  puzzleMode: boolean;
  currentPuzzle: LearnPuzzle | null;
  puzzleMoveIndex: number;

  // Actions
  initLesson: (lesson: LearnLesson, steps: LearnLessonStep[], progress?: LearnUserProgress) => void;
  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Board actions
  makeMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
  selectSquare: (square: Square | null) => void;
  flipBoard: () => void;
  resetStep: () => void;

  // Hint actions
  showHint: () => void;
  revealSolution: () => void;

  // Quiz actions
  selectQuizOption: (optionId: string) => void;
  submitQuizAnswer: () => void;
  resetQuiz: () => void;

  // Progress actions
  markStepComplete: () => void;
  completeLesson: () => void;
  getTimeSpent: () => number;

  // Puzzle actions
  initPuzzle: (puzzle: LearnPuzzle) => void;

  // Reset
  reset: () => void;
}

function computeLegalMoves(game: Chess): Map<Square, Square[]> {
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

  return legalMoves;
}

const initialState = {
  lesson: null,
  steps: [],
  currentStepIndex: 0,
  game: new Chess(),
  currentFen: new Chess().fen(),
  selectedSquare: null,
  highlightedSquares: [],
  arrows: [],
  customHighlights: [],
  pieceToMove: null,
  boardOrientation: 'white' as const,
  stepCompleted: false,
  showingHint: false,
  currentHintIndex: -1,
  hintsUsed: 0,
  attempts: 0,
  wrongMoveMessage: null,
  correctMoveMessage: null,
  selectedQuizOption: null,
  quizAnswered: false,
  quizCorrect: false,
  progress: null,
  startTime: null,
  puzzleMode: false,
  currentPuzzle: null,
  puzzleMoveIndex: 0,
};

export const useLearnStore = create<LessonState>((set, get) => ({
  ...initialState,

  initLesson: (lesson, steps, progress) => {
    const firstStep = steps[0];
    const startIndex = progress?.lastStepIndex ?? 0;
    let game: Chess;
    try {
      game = new Chess(firstStep?.initialFen || undefined);
    } catch {
      // Invalid FEN (e.g., missing king), fall back to starting position
      game = new Chess();
    }

    set({
      lesson,
      steps,
      currentStepIndex: startIndex,
      game,
      currentFen: game.fen(),
      selectedSquare: null,
      highlightedSquares: [],
      arrows: firstStep?.meta?.arrows || [],
      customHighlights: firstStep?.meta?.highlights || [],
      pieceToMove: firstStep?.meta?.pieceToMove || null,
      boardOrientation: firstStep?.meta?.boardPrefs?.orientation || 'white',
      stepCompleted: false,
      showingHint: false,
      currentHintIndex: -1,
      hintsUsed: progress?.hintsUsed ?? 0,
      attempts: progress?.attempts ?? 0,
      wrongMoveMessage: null,
      correctMoveMessage: null,
      selectedQuizOption: null,
      quizAnswered: false,
      quizCorrect: false,
      progress,
      startTime: Date.now(),
      puzzleMode: false,
      currentPuzzle: null,
      puzzleMoveIndex: 0,
    });

    // Go to the correct step if resuming
    if (startIndex > 0 && startIndex < steps.length) {
      get().goToStep(startIndex);
    }
  },

  goToStep: (index) => {
    const { steps } = get();
    if (index < 0 || index >= steps.length) return;

    const step = steps[index];
    let game: Chess;
    try {
      game = new Chess(step.initialFen || undefined);
    } catch {
      // Invalid FEN (e.g., missing king), fall back to starting position
      game = new Chess();
    }

    set({
      currentStepIndex: index,
      game,
      currentFen: game.fen(),
      selectedSquare: null,
      highlightedSquares: [],
      arrows: step.meta?.arrows || [],
      customHighlights: step.meta?.highlights || [],
      pieceToMove: step.meta?.pieceToMove || null,
      boardOrientation: step.meta?.boardPrefs?.orientation || get().boardOrientation,
      stepCompleted: false,
      showingHint: false,
      currentHintIndex: -1,
      wrongMoveMessage: null,
      correctMoveMessage: null,
      selectedQuizOption: null,
      quizAnswered: false,
      quizCorrect: false,
      puzzleMoveIndex: 0,
    });
  },

  nextStep: () => {
    const { currentStepIndex, steps } = get();
    if (currentStepIndex < steps.length - 1) {
      get().goToStep(currentStepIndex + 1);
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      get().goToStep(currentStepIndex - 1);
    }
  },

  makeMove: (from, to, promotion) => {
    const { game, steps, currentStepIndex, puzzleMode, currentPuzzle, puzzleMoveIndex } = get();
    const step = steps[currentStepIndex];

    // Handle puzzle mode
    if (puzzleMode && currentPuzzle) {
      const expectedMove = currentPuzzle.solutionLineUci[puzzleMoveIndex];
      const moveUci = `${from}${to}${promotion || ''}`;

      if (moveUci === expectedMove) {
        try {
          game.move({ from, to, promotion });
          const newMoveIndex = puzzleMoveIndex + 1;

          // Check if puzzle is complete
          if (newMoveIndex >= currentPuzzle.solutionLineUci.length) {
            set({
              currentFen: game.fen(),
              stepCompleted: true,
              correctMoveMessage: currentPuzzle.explanationMd || 'Correct! Puzzle solved.',
              puzzleMoveIndex: newMoveIndex,
            });
          } else {
            // Make the opponent's reply if there is one
            const opponentMove = currentPuzzle.solutionLineUci[newMoveIndex];
            if (opponentMove) {
              setTimeout(() => {
                const { game } = get();
                const oFrom = opponentMove.slice(0, 2) as Square;
                const oTo = opponentMove.slice(2, 4) as Square;
                const oPromo = opponentMove[4] as PieceSymbol | undefined;
                game.move({ from: oFrom, to: oTo, promotion: oPromo });
                set({
                  currentFen: game.fen(),
                  puzzleMoveIndex: newMoveIndex + 1,
                  selectedSquare: null,
                  highlightedSquares: [],
                });
              }, 300);
            }

            set({
              currentFen: game.fen(),
              puzzleMoveIndex: newMoveIndex,
              selectedSquare: null,
              highlightedSquares: [],
              correctMoveMessage: 'Correct!',
            });
          }
          return true;
        } catch {
          return false;
        }
      } else {
        set({
          attempts: get().attempts + 1,
          wrongMoveMessage: 'Not quite. Try again!',
          correctMoveMessage: null,
        });
        return false;
      }
    }

    // Handle move_task step
    if (step?.type === 'move_task' && step.requiredMoveUci) {
      const moveUci = `${from}${to}${promotion || ''}`;

      // Check if this is the required move
      if (moveUci === step.requiredMoveUci) {
        try {
          game.move({ from, to, promotion });
          set({
            currentFen: game.fen(),
            stepCompleted: true,
            correctMoveMessage: step.explainCorrectMd || 'Correct!',
            wrongMoveMessage: null,
            selectedSquare: null,
            highlightedSquares: [],
          });
          return true;
        } catch {
          return false;
        }
      } else {
        // Check if it's an allowed alternative move
        const isAllowed = step.allowedMovesUci?.includes(moveUci);
        if (isAllowed) {
          try {
            game.move({ from, to, promotion });
            set({
              currentFen: game.fen(),
              stepCompleted: true,
              correctMoveMessage: step.explainCorrectMd || 'Correct!',
              wrongMoveMessage: null,
              selectedSquare: null,
              highlightedSquares: [],
            });
            return true;
          } catch {
            return false;
          }
        }

        // Wrong move
        set({
          attempts: get().attempts + 1,
          wrongMoveMessage: step.explainWrongMd || 'That\'s not the best move. Try again!',
          correctMoveMessage: null,
        });
        return false;
      }
    }

    // Handle puzzle step
    if (step?.type === 'puzzle' && step.solutionLineUci?.length > 0) {
      const { puzzleMoveIndex } = get();
      const expectedMove = step.solutionLineUci[puzzleMoveIndex];
      const moveUci = `${from}${to}${promotion || ''}`;

      if (moveUci === expectedMove) {
        try {
          game.move({ from, to, promotion });
          const newMoveIndex = puzzleMoveIndex + 1;

          if (newMoveIndex >= step.solutionLineUci.length) {
            set({
              currentFen: game.fen(),
              stepCompleted: true,
              correctMoveMessage: step.explainCorrectMd || 'Correct!',
              puzzleMoveIndex: newMoveIndex,
            });
          } else {
            // Make opponent's move
            const opponentMove = step.solutionLineUci[newMoveIndex];
            if (opponentMove) {
              setTimeout(() => {
                const { game } = get();
                const oFrom = opponentMove.slice(0, 2) as Square;
                const oTo = opponentMove.slice(2, 4) as Square;
                const oPromo = opponentMove[4] as PieceSymbol | undefined;
                game.move({ from: oFrom, to: oTo, promotion: oPromo });
                set({
                  currentFen: game.fen(),
                  puzzleMoveIndex: newMoveIndex + 1,
                  selectedSquare: null,
                  highlightedSquares: [],
                });
              }, 300);
            }

            set({
              currentFen: game.fen(),
              puzzleMoveIndex: newMoveIndex,
              correctMoveMessage: 'Correct! Keep going...',
              selectedSquare: null,
              highlightedSquares: [],
            });
          }
          return true;
        } catch {
          return false;
        }
      } else {
        set({
          attempts: get().attempts + 1,
          wrongMoveMessage: step.explainWrongMd || 'Not the right move. Try again!',
          correctMoveMessage: null,
        });
        return false;
      }
    }

    // Handle model_line step (auto-advance through line)
    if (step?.type === 'model_line') {
      try {
        game.move({ from, to, promotion });
        set({
          currentFen: game.fen(),
          selectedSquare: null,
          highlightedSquares: [],
        });
        return true;
      } catch {
        return false;
      }
    }

    // Default: allow free movement for explain steps
    try {
      game.move({ from, to, promotion });
      set({
        currentFen: game.fen(),
        selectedSquare: null,
        highlightedSquares: [],
      });
      return true;
    } catch {
      return false;
    }
  },

  selectSquare: (square) => {
    const { game, selectedSquare } = get();

    if (!square) {
      set({ selectedSquare: null, highlightedSquares: [] });
      return;
    }

    // If clicking same square, deselect
    if (selectedSquare === square) {
      set({ selectedSquare: null, highlightedSquares: [] });
      return;
    }

    // If there's a selected square and this is a valid target, let makeMove handle it
    if (selectedSquare) {
      const legalMoves = computeLegalMoves(game);
      const targets = legalMoves.get(selectedSquare) || [];
      if (targets.includes(square)) {
        get().makeMove(selectedSquare, square);
        return;
      }
    }

    // Select new square if it has a piece
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      const legalMoves = computeLegalMoves(game);
      const targets = legalMoves.get(square) || [];
      set({ selectedSquare: square, highlightedSquares: targets });
    } else {
      set({ selectedSquare: null, highlightedSquares: [] });
    }
  },

  flipBoard: () => {
    set((state) => ({
      boardOrientation: state.boardOrientation === 'white' ? 'black' : 'white',
    }));
  },

  resetStep: () => {
    const { steps, currentStepIndex } = get();
    const step = steps[currentStepIndex];
    const game = new Chess(step?.initialFen || undefined);

    set({
      game,
      currentFen: game.fen(),
      selectedSquare: null,
      highlightedSquares: [],
      stepCompleted: false,
      wrongMoveMessage: null,
      correctMoveMessage: null,
      puzzleMoveIndex: 0,
    });
  },

  showHint: () => {
    const { steps, currentStepIndex, currentHintIndex, hintsUsed } = get();
    const step = steps[currentStepIndex];
    const hints = step?.hints || [];

    if (currentHintIndex < hints.length - 1) {
      const newHintIndex = currentHintIndex + 1;
      const isNewHint = newHintIndex > currentHintIndex;

      set({
        showingHint: true,
        currentHintIndex: newHintIndex,
        hintsUsed: isNewHint ? hintsUsed + 1 : hintsUsed,
      });
    }
  },

  revealSolution: () => {
    const { steps, currentStepIndex, game } = get();
    const step = steps[currentStepIndex];

    if (step?.type === 'move_task' && step.requiredMoveUci) {
      const from = step.requiredMoveUci.slice(0, 2) as Square;
      const to = step.requiredMoveUci.slice(2, 4) as Square;
      const promotion = step.requiredMoveUci[4] as PieceSymbol | undefined;

      try {
        game.move({ from, to, promotion });
        set({
          currentFen: game.fen(),
          stepCompleted: true,
          correctMoveMessage: step.explainCorrectMd || 'Solution revealed.',
          hintsUsed: get().hintsUsed + 1,
        });
      } catch {
        // Handle error
      }
    } else if (step?.type === 'puzzle' && step.solutionLineUci?.length > 0) {
      // Play through entire solution
      const tempGame = new Chess(step.initialFen || undefined);
      for (const moveUci of step.solutionLineUci) {
        const from = moveUci.slice(0, 2) as Square;
        const to = moveUci.slice(2, 4) as Square;
        const promotion = moveUci[4] as PieceSymbol | undefined;
        tempGame.move({ from, to, promotion });
      }

      set({
        game: tempGame,
        currentFen: tempGame.fen(),
        stepCompleted: true,
        correctMoveMessage: step.explainCorrectMd || 'Solution revealed.',
        hintsUsed: get().hintsUsed + 1,
        puzzleMoveIndex: step.solutionLineUci.length,
      });
    }
  },

  selectQuizOption: (optionId) => {
    set({ selectedQuizOption: optionId });
  },

  submitQuizAnswer: () => {
    const { steps, currentStepIndex, selectedQuizOption } = get();
    const step = steps[currentStepIndex];
    const quiz = step?.meta?.quiz;

    if (!quiz || !selectedQuizOption) return;

    const isCorrect = selectedQuizOption === quiz.correctOptionId;

    set({
      quizAnswered: true,
      quizCorrect: isCorrect,
      stepCompleted: isCorrect,
      attempts: isCorrect ? get().attempts : get().attempts + 1,
      correctMoveMessage: isCorrect ? (quiz.explainMd || 'Correct!') : null,
      wrongMoveMessage: isCorrect ? null : 'Not quite. Try again!',
    });
  },

  resetQuiz: () => {
    set({
      selectedQuizOption: null,
      quizAnswered: false,
      quizCorrect: false,
      wrongMoveMessage: null,
    });
  },

  markStepComplete: () => {
    set({ stepCompleted: true });
  },

  completeLesson: () => {
    // This would typically trigger an API call to save progress
    set({
      progress: get().progress
        ? { ...get().progress!, status: 'completed', completedAt: new Date().toISOString() }
        : null,
    });
  },

  getTimeSpent: () => {
    const { startTime } = get();
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  },

  initPuzzle: (puzzle) => {
    const game = new Chess(puzzle.initialFen);

    // Determine board orientation based on who moves first
    const orientation = game.turn() === 'w' ? 'white' : 'black';

    set({
      puzzleMode: true,
      currentPuzzle: puzzle,
      game,
      currentFen: game.fen(),
      boardOrientation: orientation,
      selectedSquare: null,
      highlightedSquares: [],
      stepCompleted: false,
      puzzleMoveIndex: 0,
      wrongMoveMessage: null,
      correctMoveMessage: null,
      hintsUsed: 0,
      attempts: 0,
      startTime: Date.now(),
    });
  },

  reset: () => {
    set({
      ...initialState,
      game: new Chess(),
    });
  },
}));

// ============================================
// Practice Session State
// ============================================
interface PracticeState {
  puzzles: LearnPuzzle[];
  currentPuzzleIndex: number;
  results: { puzzleId: string; correct: boolean; attempts: number; timeMs: number }[];
  sessionStartTime: number | null;

  // Actions
  initPractice: (puzzles: LearnPuzzle[]) => void;
  recordResult: (correct: boolean, attempts: number, timeMs: number) => void;
  nextPuzzle: () => void;
  getStats: () => { total: number; correct: number; accuracy: number; avgTime: number };
  reset: () => void;
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  puzzles: [],
  currentPuzzleIndex: 0,
  results: [],
  sessionStartTime: null,

  initPractice: (puzzles) => {
    set({
      puzzles,
      currentPuzzleIndex: 0,
      results: [],
      sessionStartTime: Date.now(),
    });
  },

  recordResult: (correct, attempts, timeMs) => {
    const { puzzles, currentPuzzleIndex, results } = get();
    const puzzle = puzzles[currentPuzzleIndex];

    if (puzzle) {
      set({
        results: [...results, { puzzleId: puzzle.id, correct, attempts, timeMs }],
      });
    }
  },

  nextPuzzle: () => {
    const { currentPuzzleIndex, puzzles } = get();
    if (currentPuzzleIndex < puzzles.length - 1) {
      set({ currentPuzzleIndex: currentPuzzleIndex + 1 });
    }
  },

  getStats: () => {
    const { results } = get();
    const total = results.length;
    const correct = results.filter((r) => r.correct).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const avgTime = total > 0 ? Math.round(results.reduce((sum, r) => sum + r.timeMs, 0) / total) : 0;

    return { total, correct, accuracy, avgTime };
  },

  reset: () => {
    set({
      puzzles: [],
      currentPuzzleIndex: 0,
      results: [],
      sessionStartTime: null,
    });
  },
}));
