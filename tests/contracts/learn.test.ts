import { describe, it, expect } from 'vitest';
import {
  TracksResponseSchema,
  TrackDetailResponseSchema,
  LessonDetailResponseSchema,
  PracticePacksResponseSchema,
  PracticePackDetailResponseSchema,
  ProgressResponseSchema,
  SaveLessonProgressRequestSchema,
  SavePuzzleResultRequestSchema,
  ErrorResponseSchema,
} from './schemas';

describe('Learn API Contract Tests', () => {
  describe('GET /api/learn/tracks', () => {
    describe('Response Schema', () => {
      it('should validate valid tracks response', () => {
        const validResponse = {
          tracks: [
            {
              id: 'track-1',
              slug: 'beginner-basics',
              title: 'Beginner Basics',
              level: 'beginner',
              description: 'Learn the fundamentals of chess',
              coverImageUrl: '/images/beginner.png',
              orderIndex: 1,
              estimatedHours: 3,
              isPublished: true,
              totalLessons: 10,
              completedLessons: 3,
              inProgressLessons: 1,
              completionPercentage: 30,
            },
            {
              id: 'track-2',
              slug: 'intermediate-tactics',
              title: 'Intermediate Tactics',
              level: 'intermediate',
              description: 'Master tactical patterns',
              orderIndex: 2,
              estimatedHours: 5,
              isPublished: true,
              totalLessons: 15,
              completedLessons: 0,
              inProgressLessons: 0,
              completionPercentage: 0,
            },
          ],
        };

        const result = TracksResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should validate empty tracks list', () => {
        const validResponse = { tracks: [] };
        const result = TracksResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should accept null coverImageUrl', () => {
        const validResponse = {
          tracks: [
            {
              id: 'track-1',
              slug: 'track',
              title: 'Track',
              level: 'advanced',
              description: 'Description',
              coverImageUrl: null,
              orderIndex: 1,
              estimatedHours: 2,
            },
          ],
        };

        const result = TracksResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should validate all level types', () => {
        const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
        levels.forEach(level => {
          const response = {
            tracks: [
              {
                id: `track-${level}`,
                slug: level,
                title: `${level} Track`,
                level,
                description: 'Description',
                orderIndex: 1,
                estimatedHours: 1,
              },
            ],
          };

          const result = TracksResponseSchema.safeParse(response);
          expect(result.success).toBe(true);
        });
      });
    });
  });

  describe('GET /api/learn/tracks/:trackSlug', () => {
    describe('Response Schema', () => {
      it('should validate valid track detail response', () => {
        const validResponse = {
          track: {
            id: 'track-1',
            slug: 'beginner-basics',
            title: 'Beginner Basics',
            level: 'beginner',
            description: 'Learn the fundamentals',
            orderIndex: 1,
            estimatedHours: 3,
          },
          lessons: [
            {
              id: 'lesson-1',
              slug: 'moving-pieces',
              title: 'Moving Pieces',
              description: 'Learn how pieces move',
              orderIndex: 1,
              estimatedMinutes: 15,
            },
            {
              id: 'lesson-2',
              slug: 'capturing',
              title: 'Capturing',
              description: 'Learn how to capture',
              orderIndex: 2,
              estimatedMinutes: 10,
            },
          ],
        };

        const result = TrackDetailResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should validate track with no lessons', () => {
        const validResponse = {
          track: {
            id: 'track-1',
            slug: 'new-track',
            title: 'New Track',
            level: 'beginner',
            description: 'Coming soon',
            orderIndex: 1,
            estimatedHours: 0,
          },
          lessons: [],
        };

        const result = TrackDetailResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('GET /api/learn/lessons/:lessonSlug', () => {
    describe('Response Schema', () => {
      it('should validate lesson with explain step', () => {
        const validResponse = {
          lesson: {
            id: 'lesson-1',
            slug: 'intro',
            title: 'Introduction',
            description: 'Getting started',
            orderIndex: 1,
            estimatedMinutes: 10,
          },
          steps: [
            {
              id: 'step-1',
              type: 'explain',
              orderIndex: 1,
              title: 'Welcome',
              contentMarkdown: '# Welcome\n\nThis is the introduction.',
            },
          ],
        };

        const result = LessonDetailResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should validate lesson with move_task step', () => {
        const validResponse = {
          lesson: {
            id: 'lesson-1',
            slug: 'first-move',
            title: 'Your First Move',
            description: 'Learn to move',
            orderIndex: 1,
            estimatedMinutes: 5,
          },
          steps: [
            {
              id: 'step-1',
              type: 'move_task',
              orderIndex: 1,
              title: 'Move the Pawn',
              instructionMarkdown: 'Move the pawn to e4',
              initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
              requiredMoveUci: 'e2e4',
            },
          ],
        };

        const result = LessonDetailResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should validate all step types', () => {
        const stepTypes = ['explain', 'move_task', 'puzzle', 'quiz', 'model_line'];
        stepTypes.forEach(type => {
          const response = {
            lesson: {
              id: 'lesson-1',
              slug: 'test',
              title: 'Test',
              description: 'Test',
              orderIndex: 1,
              estimatedMinutes: 5,
            },
            steps: [
              {
                id: 'step-1',
                type,
                orderIndex: 1,
                title: 'Step',
              },
            ],
          };

          const result = LessonDetailResponseSchema.safeParse(response);
          expect(result.success).toBe(true);
        });
      });
    });
  });

  describe('GET /api/learn/practice', () => {
    describe('Response Schema', () => {
      it('should validate practice packs response', () => {
        const validResponse = {
          packs: [
            {
              id: 'pack-1',
              slug: 'tactics-101',
              title: 'Tactics 101',
              description: 'Basic tactical patterns',
              puzzleCount: 20,
              difficulty: 'beginner',
            },
            {
              id: 'pack-2',
              slug: 'forks',
              title: 'Fork Training',
              description: 'Master the fork',
              puzzleCount: 30,
              difficulty: 'intermediate',
            },
          ],
        };

        const result = PracticePacksResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('GET /api/learn/practice/:packSlug', () => {
    describe('Response Schema', () => {
      it('should validate pack detail with puzzles', () => {
        const validResponse = {
          pack: {
            id: 'pack-1',
            slug: 'mate-in-1',
            title: 'Mate in 1',
            description: 'Find checkmate in one move',
            puzzleCount: 50,
            difficulty: 'beginner',
          },
          puzzles: [
            {
              id: 'puzzle-1',
              fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
              solutionUci: ['h5f7'],
              rating: 800,
            },
            {
              id: 'puzzle-2',
              fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
              solutionUci: ['e1e8'],
              rating: 700,
            },
          ],
        };

        const result = PracticePackDetailResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should validate multi-move puzzle solutions', () => {
        const validResponse = {
          pack: {
            id: 'pack-1',
            slug: 'mate-in-2',
            title: 'Mate in 2',
            description: 'Find checkmate in two moves',
            puzzleCount: 25,
            difficulty: 'intermediate',
          },
          puzzles: [
            {
              id: 'puzzle-1',
              fen: 'some-fen',
              solutionUci: ['d1h5', 'e7e6', 'h5f7'],
              rating: 1200,
            },
          ],
        };

        const result = PracticePackDetailResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('GET /api/learn/progress', () => {
    describe('Response Schema', () => {
      it('should validate progress response', () => {
        const validResponse = {
          progress: {
            lessonsCompleted: 5,
            lessonsInProgress: 2,
            puzzlesSolved: 50,
            currentStreak: 3,
            longestStreak: 7,
          },
        };

        const result = ProgressResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should validate zero progress', () => {
        const validResponse = {
          progress: {
            lessonsCompleted: 0,
            lessonsInProgress: 0,
            puzzlesSolved: 0,
            currentStreak: 0,
            longestStreak: 0,
          },
        };

        const result = ProgressResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('POST /api/learn/progress/lesson', () => {
    describe('Request Schema', () => {
      it('should validate in_progress status', () => {
        const validRequest = {
          lessonId: 'lesson-1',
          status: 'in_progress',
        };

        const result = SaveLessonProgressRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should validate completed status', () => {
        const validRequest = {
          lessonId: 'lesson-1',
          status: 'completed',
        };

        const result = SaveLessonProgressRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should reject invalid status', () => {
        const invalidRequest = {
          lessonId: 'lesson-1',
          status: 'pending',
        };

        const result = SaveLessonProgressRequestSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('POST /api/learn/progress/puzzle', () => {
    describe('Request Schema', () => {
      it('should validate solved puzzle', () => {
        const validRequest = {
          puzzleId: 'puzzle-1',
          solved: true,
          timeMs: 5000,
        };

        const result = SavePuzzleResultRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should validate failed puzzle', () => {
        const validRequest = {
          puzzleId: 'puzzle-1',
          solved: false,
          timeMs: 15000,
        };

        const result = SavePuzzleResultRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should reject missing timeMs', () => {
        const invalidRequest = {
          puzzleId: 'puzzle-1',
          solved: true,
        };

        const result = SavePuzzleResultRequestSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Error Responses', () => {
    it('should validate 401 unauthorized error', () => {
      const errorResponse = { error: 'Unauthorized' };
      const result = ErrorResponseSchema.safeParse(errorResponse);
      expect(result.success).toBe(true);
    });

    it('should validate 404 not found error', () => {
      const errorResponse = { error: 'Track not found' };
      const result = ErrorResponseSchema.safeParse(errorResponse);
      expect(result.success).toBe(true);
    });

    it('should validate 500 server error', () => {
      const errorResponse = { error: 'Failed to fetch tracks' };
      const result = ErrorResponseSchema.safeParse(errorResponse);
      expect(result.success).toBe(true);
    });
  });
});
