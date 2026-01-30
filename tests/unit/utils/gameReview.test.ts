import { describe, it, expect } from 'vitest';
import {
  classifyMove,
  calculateAccuracy,
  calculateAcpl,
  CLASSIFICATION_THRESHOLDS,
  testScenarios,
  foolsMateAnalysis,
  italianGameAnalysis,
  createMoveAnalysis,
  createGameAnalysis,
} from '@tests/fixtures/gameReview';

describe('Game Review Utilities', () => {
  describe('classifyMove', () => {
    it('should classify move as "best" when eval loss is 0', () => {
      expect(classifyMove(0)).toBe('best');
    });

    it('should classify move as "best" when eval loss is at threshold (20cp)', () => {
      expect(classifyMove(CLASSIFICATION_THRESHOLDS.best)).toBe('best');
    });

    it('should classify move as "good" when eval loss is between 21-50cp', () => {
      expect(classifyMove(21)).toBe('good');
      expect(classifyMove(35)).toBe('good');
      expect(classifyMove(50)).toBe('good');
    });

    it('should classify move as "inaccuracy" when eval loss is between 51-150cp', () => {
      expect(classifyMove(51)).toBe('inaccuracy');
      expect(classifyMove(100)).toBe('inaccuracy');
      expect(classifyMove(150)).toBe('inaccuracy');
    });

    it('should classify move as "mistake" when eval loss is between 151-300cp', () => {
      expect(classifyMove(151)).toBe('mistake');
      expect(classifyMove(200)).toBe('mistake');
      expect(classifyMove(300)).toBe('mistake');
    });

    it('should classify move as "blunder" when eval loss exceeds 300cp', () => {
      expect(classifyMove(301)).toBe('blunder');
      expect(classifyMove(500)).toBe('blunder');
      expect(classifyMove(9999)).toBe('blunder');
    });

    it('should handle all edge cases correctly', () => {
      testScenarios.classificationEdgeCases.forEach(({ evalLoss, expected }) => {
        expect(classifyMove(evalLoss)).toBe(expected);
      });
    });
  });

  describe('calculateAccuracy', () => {
    it('should return ~100% accuracy for ACPL of 0', () => {
      const accuracy = calculateAccuracy(0);
      expect(accuracy).toBeGreaterThan(99);
      expect(accuracy).toBeLessThanOrEqual(100);
    });

    it('should return lower accuracy for higher ACPL', () => {
      const acc0 = calculateAccuracy(0);
      const acc10 = calculateAccuracy(10);
      const acc25 = calculateAccuracy(25);
      const acc50 = calculateAccuracy(50);

      expect(acc0).toBeGreaterThan(acc10);
      expect(acc10).toBeGreaterThan(acc25);
      expect(acc25).toBeGreaterThan(acc50);
    });

    it('should never return negative accuracy', () => {
      expect(calculateAccuracy(100)).toBeGreaterThanOrEqual(0);
      expect(calculateAccuracy(500)).toBeGreaterThanOrEqual(0);
      expect(calculateAccuracy(1000)).toBeGreaterThanOrEqual(0);
    });

    it('should never return accuracy greater than 100', () => {
      expect(calculateAccuracy(-10)).toBeLessThanOrEqual(100);
      expect(calculateAccuracy(0)).toBeLessThanOrEqual(100);
    });

    it('should match expected ranges for various ACPL values', () => {
      testScenarios.accuracyCases.forEach(({ acpl, expectedMin, expectedMax }) => {
        const accuracy = calculateAccuracy(acpl);
        expect(accuracy).toBeGreaterThanOrEqual(expectedMin);
        expect(accuracy).toBeLessThanOrEqual(expectedMax);
      });
    });
  });

  describe('calculateAcpl', () => {
    it('should calculate white ACPL from odd-indexed moves (1, 3, 5...)', () => {
      const moves = [
        createMoveAnalysis({ ply: 1, eval_loss_cp: 10 }),
        createMoveAnalysis({ ply: 2, eval_loss_cp: 20 }),
        createMoveAnalysis({ ply: 3, eval_loss_cp: 30 }),
        createMoveAnalysis({ ply: 4, eval_loss_cp: 40 }),
      ];

      const whiteAcpl = calculateAcpl(moves, 'white');
      // White moves are at indices 0 and 2 (plies 1 and 3)
      expect(whiteAcpl).toBe((10 + 30) / 2); // 20
    });

    it('should calculate black ACPL from even-indexed moves (2, 4, 6...)', () => {
      const moves = [
        createMoveAnalysis({ ply: 1, eval_loss_cp: 10 }),
        createMoveAnalysis({ ply: 2, eval_loss_cp: 20 }),
        createMoveAnalysis({ ply: 3, eval_loss_cp: 30 }),
        createMoveAnalysis({ ply: 4, eval_loss_cp: 40 }),
      ];

      const blackAcpl = calculateAcpl(moves, 'black');
      // Black moves are at indices 1 and 3 (plies 2 and 4)
      expect(blackAcpl).toBe((20 + 40) / 2); // 30
    });

    it('should return 0 for empty move list', () => {
      expect(calculateAcpl([], 'white')).toBe(0);
      expect(calculateAcpl([], 'black')).toBe(0);
    });

    it('should handle games with only one move', () => {
      const moves = [createMoveAnalysis({ ply: 1, eval_loss_cp: 50 })];

      expect(calculateAcpl(moves, 'white')).toBe(50);
      expect(calculateAcpl(moves, 'black')).toBe(0);
    });
  });

  describe('Fool\'s Mate Analysis', () => {
    it('should have exactly 4 plies', () => {
      expect(foolsMateAnalysis.length).toBe(4);
    });

    it('should identify g4 as a blunder (allows mate in 1)', () => {
      const g4Move = foolsMateAnalysis.find(m => m.played_move_san === 'g4');
      expect(g4Move).toBeDefined();
      expect(g4Move?.classification).toBe('blunder');
    });

    it('should identify Qh4# as best move', () => {
      const checkmateMove = foolsMateAnalysis.find(m => m.played_move_san === 'Qh4#');
      expect(checkmateMove).toBeDefined();
      expect(checkmateMove?.classification).toBe('best');
      expect(checkmateMove?.eval_after.type).toBe('mate');
    });

    it('should have correct eval types for mate positions', () => {
      const g4Move = foolsMateAnalysis.find(m => m.played_move_san === 'g4');
      expect(g4Move?.eval_after.type).toBe('mate');
      expect(g4Move?.eval_after.value).toBe(-1);
    });
  });

  describe('Italian Game Analysis', () => {
    it('should have 10 plies', () => {
      expect(italianGameAnalysis.length).toBe(10);
    });

    it('should have mostly "best" and "good" classifications', () => {
      const classifications = italianGameAnalysis.map(m => m.classification);
      const bestAndGood = classifications.filter(
        c => c === 'best' || c === 'good'
      );
      expect(bestAndGood.length).toBe(10);
    });

    it('should have no blunders or mistakes', () => {
      const hasBlunder = italianGameAnalysis.some(m => m.classification === 'blunder');
      const hasMistake = italianGameAnalysis.some(m => m.classification === 'mistake');
      expect(hasBlunder).toBe(false);
      expect(hasMistake).toBe(false);
    });

    it('should have correct opening moves', () => {
      expect(italianGameAnalysis[0].played_move_san).toBe('e4');
      expect(italianGameAnalysis[1].played_move_san).toBe('e5');
      expect(italianGameAnalysis[2].played_move_san).toBe('Nf3');
      expect(italianGameAnalysis[3].played_move_san).toBe('Nc6');
      expect(italianGameAnalysis[4].played_move_san).toBe('Bc4');
    });
  });

  describe('createMoveAnalysis factory', () => {
    it('should create a valid move analysis with defaults', () => {
      const move = createMoveAnalysis();

      expect(move.ply).toBe(1);
      expect(move.played_move_uci).toBe('e2e4');
      expect(move.classification).toBe('best');
      expect(move.pv).toHaveLength(3);
    });

    it('should allow overriding specific fields', () => {
      const move = createMoveAnalysis({
        ply: 5,
        classification: 'blunder',
        eval_loss_cp: 500,
      });

      expect(move.ply).toBe(5);
      expect(move.classification).toBe('blunder');
      expect(move.eval_loss_cp).toBe(500);
      // Default fields should remain
      expect(move.played_move_uci).toBe('e2e4');
    });
  });

  describe('createGameAnalysis factory', () => {
    it('should create a valid game analysis with defaults', () => {
      const analysis = createGameAnalysis();

      expect(analysis.status).toBe('done');
      expect(analysis.engine_name).toBe('stockfish');
      expect(analysis.analysis_depth).toBe(12);
      expect(analysis.moves.length).toBeGreaterThan(0);
    });

    it('should allow overriding player stats', () => {
      const analysis = createGameAnalysis({
        white: {
          accuracy: 50,
          acpl: 100,
          blunders: 5,
          mistakes: 3,
          inaccuracies: 2,
        },
      });

      expect(analysis.white.accuracy).toBe(50);
      expect(analysis.white.blunders).toBe(5);
    });

    it('should generate unique game IDs', () => {
      const analysis1 = createGameAnalysis();
      const analysis2 = createGameAnalysis();

      expect(analysis1.game_id).not.toBe(analysis2.game_id);
    });
  });

  describe('Classification thresholds consistency', () => {
    it('should have thresholds in ascending order', () => {
      expect(CLASSIFICATION_THRESHOLDS.best).toBeLessThan(CLASSIFICATION_THRESHOLDS.good);
      expect(CLASSIFICATION_THRESHOLDS.good).toBeLessThan(CLASSIFICATION_THRESHOLDS.inaccuracy);
      expect(CLASSIFICATION_THRESHOLDS.inaccuracy).toBeLessThan(CLASSIFICATION_THRESHOLDS.mistake);
    });

    it('should match the documented thresholds', () => {
      expect(CLASSIFICATION_THRESHOLDS.best).toBe(20);
      expect(CLASSIFICATION_THRESHOLDS.good).toBe(50);
      expect(CLASSIFICATION_THRESHOLDS.inaccuracy).toBe(150);
      expect(CLASSIFICATION_THRESHOLDS.mistake).toBe(300);
    });
  });

  describe('Eval types', () => {
    it('should handle centipawn evaluations', () => {
      const move = createMoveAnalysis({
        eval_before: { type: 'cp', value: 50 },
        eval_after: { type: 'cp', value: 100 },
      });

      expect(move.eval_before.type).toBe('cp');
      expect(move.eval_after.type).toBe('cp');
    });

    it('should handle mate evaluations', () => {
      const move = createMoveAnalysis({
        eval_before: { type: 'mate', value: 5 },
        eval_after: { type: 'mate', value: 4 },
      });

      expect(move.eval_before.type).toBe('mate');
      expect(move.eval_before.value).toBe(5);
    });

    it('should handle transition from cp to mate', () => {
      const move = createMoveAnalysis({
        eval_before: { type: 'cp', value: 500 },
        eval_after: { type: 'mate', value: 3 },
      });

      expect(move.eval_before.type).toBe('cp');
      expect(move.eval_after.type).toBe('mate');
    });
  });

  describe('Player statistics validation', () => {
    testScenarios.playerStatsCases.forEach(({ description, white }) => {
      it(`should validate ${description} statistics`, () => {
        const analysis = createGameAnalysis({ white });

        expect(analysis.white.accuracy).toBeGreaterThanOrEqual(0);
        expect(analysis.white.accuracy).toBeLessThanOrEqual(100);
        expect(analysis.white.acpl).toBeGreaterThanOrEqual(0);
        expect(analysis.white.blunders).toBeGreaterThanOrEqual(0);
        expect(analysis.white.mistakes).toBeGreaterThanOrEqual(0);
        expect(analysis.white.inaccuracies).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
