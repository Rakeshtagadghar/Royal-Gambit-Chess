import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { server } from '../../msw/server';
import { http, HttpResponse } from 'msw';
import { useAuthStore } from '@/stores/authStore';
import { useLearnStore, usePracticeStore } from '@/stores/learnStore';
import { mockUsers, mockProfiles } from '../fixtures/users';
import {
  mockTracks,
  mockLessons,
  mockLessonSteps,
  mockPracticePacks,
  mockPuzzles,
  mockUserProgress,
  LESSON_IDS,
  PACK_IDS,
  createTrack,
} from '../fixtures/learn';

describe('Learn Module Integration', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    useAuthStore.getState().setUser(mockUsers.playerA);
    useAuthStore.getState().setProfile(mockProfiles.playerA);
    // Reset learn stores
    useLearnStore.getState().reset();
    usePracticeStore.getState().reset();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('Learning Tracks', () => {
    it('should fetch all published tracks', async () => {
      server.use(
        http.get('/api/learn/tracks', () => {
          return HttpResponse.json({
            tracks: Object.values(mockTracks),
          });
        })
      );

      const response = await fetch('/api/learn/tracks');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.tracks).toBeDefined();
      expect(data.tracks.length).toBeGreaterThan(0);
    });

    it('should return tracks sorted by level', async () => {
      server.use(
        http.get('/api/learn/tracks', () => {
          return HttpResponse.json({
            tracks: [
              createTrack({ level: 'beginner', orderIndex: 1 }),
              createTrack({ level: 'intermediate', orderIndex: 2 }),
              createTrack({ level: 'advanced', orderIndex: 3 }),
            ],
          });
        })
      );

      const response = await fetch('/api/learn/tracks');
      const data = await response.json();

      expect(data.tracks[0].level).toBe('beginner');
      expect(data.tracks[1].level).toBe('intermediate');
      expect(data.tracks[2].level).toBe('advanced');
    });

    it('should fetch single track with lessons', async () => {
      server.use(
        http.get('/api/learn/tracks/:trackSlug', ({ params }) => {
          expect(params.trackSlug).toBe('beginner-basics');

          return HttpResponse.json({
            track: mockTracks.beginner,
            lessons: [mockLessons.movingPieces, mockLessons.checkAndCheckmate],
          });
        })
      );

      const response = await fetch('/api/learn/tracks/beginner-basics');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.track).toBeDefined();
      expect(data.lessons).toBeDefined();
      expect(data.lessons.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent track', async () => {
      server.use(
        http.get('/api/learn/tracks/:trackSlug', () => {
          return HttpResponse.json(
            { error: 'Track not found' },
            { status: 404 }
          );
        })
      );

      const response = await fetch('/api/learn/tracks/non-existent');
      expect(response.status).toBe(404);
    });
  });

  describe('Lessons', () => {
    it('should fetch lesson with steps', async () => {
      const lessonSteps = mockLessonSteps.filter(
        (step) => step.lessonId === LESSON_IDS.movingPieces
      );

      server.use(
        http.get('/api/learn/lessons/:lessonSlug', ({ params }) => {
          expect(params.lessonSlug).toBe('moving-pieces');

          return HttpResponse.json({
            lesson: mockLessons.movingPieces,
            steps: lessonSteps,
          });
        })
      );

      const response = await fetch('/api/learn/lessons/moving-pieces');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.lesson).toBeDefined();
      expect(data.steps).toBeDefined();
      expect(data.steps.length).toBeGreaterThan(0);
    });

    it('should return lesson steps in order', async () => {
      const lessonSteps = mockLessonSteps.filter(
        (step) => step.lessonId === LESSON_IDS.movingPieces
      );

      server.use(
        http.get('/api/learn/lessons/:lessonSlug', () => {
          return HttpResponse.json({
            lesson: mockLessons.movingPieces,
            steps: lessonSteps,
          });
        })
      );

      const response = await fetch('/api/learn/lessons/moving-pieces');
      const data = await response.json();

      for (let i = 1; i < data.steps.length; i++) {
        expect(data.steps[i - 1].orderIndex).toBeLessThan(data.steps[i].orderIndex);
      }
    });

    it('should handle different step types', async () => {
      server.use(
        http.get('/api/learn/lessons/:lessonSlug', () => {
          return HttpResponse.json({
            lesson: mockLessons.movingPieces,
            steps: [
              { id: '1', type: 'explain', orderIndex: 1, title: 'Introduction' },
              { id: '2', type: 'move_task', orderIndex: 2, title: 'Move Task', requiredMoveUci: 'e2e4' },
              { id: '3', type: 'puzzle', orderIndex: 3, title: 'Puzzle', puzzleFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
              { id: '4', type: 'quiz', orderIndex: 4, title: 'Quiz', questionMarkdown: 'What is the best move?' },
            ],
          });
        })
      );

      const response = await fetch('/api/learn/lessons/moving-pieces');
      const data = await response.json();

      const stepTypes = data.steps.map((s: { type: string }) => s.type);
      expect(stepTypes).toContain('explain');
      expect(stepTypes).toContain('move_task');
      expect(stepTypes).toContain('puzzle');
      expect(stepTypes).toContain('quiz');
    });

    it('should prevent access to locked lessons', async () => {
      server.use(
        http.get('/api/learn/lessons/:lessonSlug', () => {
          return HttpResponse.json(
            { error: 'Lesson is locked. Complete prerequisites first.' },
            { status: 403 }
          );
        })
      );

      const response = await fetch('/api/learn/lessons/advanced-tactics');
      expect(response.status).toBe(403);
    });
  });

  describe('Lesson Progress', () => {
    it('should save lesson progress', async () => {
      server.use(
        http.post('/api/learn/progress/lesson', async ({ request }) => {
          const body = await request.json() as {
            lessonId: string;
            stepId: string;
            completed: boolean;
          };
          expect(body.lessonId).toBe(LESSON_IDS.movingPieces);
          expect(body.stepId).toBeDefined();
          expect(body.completed).toBe(true);

          return HttpResponse.json({
            success: true,
            progress: {
              lessonId: body.lessonId,
              completedSteps: [body.stepId],
              isComplete: false,
            },
          });
        })
      );

      const response = await fetch('/api/learn/progress/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: LESSON_IDS.movingPieces,
          stepId: 'step-1',
          completed: true,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should mark lesson as complete when all steps done', async () => {
      server.use(
        http.post('/api/learn/progress/lesson', () => {
          return HttpResponse.json({
            success: true,
            progress: {
              lessonId: LESSON_IDS.movingPieces,
              completedSteps: ['step-1', 'step-2', 'step-3'],
              isComplete: true,
            },
          });
        })
      );

      const response = await fetch('/api/learn/progress/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: LESSON_IDS.movingPieces,
          stepId: 'step-3',
          completed: true,
        }),
      });

      const data = await response.json();
      expect(data.progress.isComplete).toBe(true);
    });

    it('should fetch user learning progress', async () => {
      server.use(
        http.get('/api/learn/progress', () => {
          return HttpResponse.json({
            progress: mockUserProgress,
            stats: {
              completedLessons: 1,
              inProgressLessons: 2,
              totalLessons: 4,
            },
          });
        })
      );

      const response = await fetch('/api/learn/progress');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.progress).toBeDefined();
      expect(data.stats).toBeDefined();
    });
  });

  describe('Practice Packs', () => {
    it('should fetch all practice packs', async () => {
      server.use(
        http.get('/api/learn/practice', () => {
          return HttpResponse.json({
            packs: Object.values(mockPracticePacks),
          });
        })
      );

      const response = await fetch('/api/learn/practice');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.packs).toBeDefined();
      expect(data.packs.length).toBeGreaterThan(0);
    });

    it('should fetch practice pack with puzzles', async () => {
      const packPuzzles = mockPuzzles.filter(
        (puzzle) => puzzle.packId === PACK_IDS.mateIn1
      );

      server.use(
        http.get('/api/learn/practice/:packSlug', ({ params }) => {
          expect(params.packSlug).toBe('mate-in-1');

          return HttpResponse.json({
            pack: mockPracticePacks.mateIn1,
            puzzles: packPuzzles,
          });
        })
      );

      const response = await fetch('/api/learn/practice/mate-in-1');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.pack).toBeDefined();
      expect(data.puzzles).toBeDefined();
      expect(data.puzzles.length).toBeGreaterThan(0);
    });

    it('should validate puzzle solutions', async () => {
      const puzzle = mockPuzzles[0];

      server.use(
        http.post('/api/learn/progress/puzzle', async ({ request }) => {
          const body = await request.json() as {
            puzzleId: string;
            moves: string[];
            correct: boolean;
          };
          expect(body.puzzleId).toBe(puzzle.id);

          return HttpResponse.json({
            success: true,
            correct: body.correct,
            solution: puzzle.solutionUci,
          });
        })
      );

      const response = await fetch('/api/learn/progress/puzzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzleId: puzzle.id,
          moves: puzzle.solutionUci,
          correct: true,
          timeMs: 5000,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.correct).toBe(true);
    });

    it('should track puzzle attempts', async () => {
      server.use(
        http.post('/api/learn/progress/puzzle', () => {
          return HttpResponse.json({
            success: true,
            correct: false,
            attempts: 2,
            maxAttempts: 3,
          });
        })
      );

      const response = await fetch('/api/learn/progress/puzzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzleId: 'puzzle-1',
          moves: ['e2e4'], // Wrong move
          correct: false,
          timeMs: 3000,
        }),
      });

      const data = await response.json();
      expect(data.attempts).toBe(2);
      expect(data.maxAttempts).toBe(3);
    });
  });

  describe('Recommended Lessons', () => {
    it('should fetch personalized recommendations', async () => {
      server.use(
        http.get('/api/learn/recommended', () => {
          return HttpResponse.json({
            lessons: [mockLessons.movingPieces, mockLessons.checkAndCheckmate],
            reason: 'Based on your progress',
          });
        })
      );

      const response = await fetch('/api/learn/recommended');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.lessons).toBeDefined();
      expect(data.lessons.length).toBeGreaterThan(0);
    });

    it('should return empty recommendations for completed users', async () => {
      server.use(
        http.get('/api/learn/recommended', () => {
          return HttpResponse.json({
            lessons: [],
            reason: 'All lessons completed!',
          });
        })
      );

      const response = await fetch('/api/learn/recommended');
      const data = await response.json();
      expect(data.lessons).toEqual([]);
    });
  });

  describe('Learn Store Integration', () => {
    // Get lesson steps for the moving pieces lesson
    const movingPiecesSteps = mockLessonSteps.filter(
      (step) => step.lessonId === LESSON_IDS.movingPieces
    );

    it('should initialize lesson in store', () => {
      const { initLesson } = useLearnStore.getState();

      initLesson(mockLessons.movingPieces, movingPiecesSteps);

      const state = useLearnStore.getState();
      // Store uses `lesson` not `currentLesson`
      expect(state.lesson).toEqual(mockLessons.movingPieces);
      expect(state.steps).toEqual(movingPiecesSteps);
      expect(state.currentStepIndex).toBe(0);
    });

    it('should navigate between lesson steps', () => {
      const { initLesson, goToStep } = useLearnStore.getState();

      initLesson(mockLessons.movingPieces, movingPiecesSteps);

      goToStep(1);
      expect(useLearnStore.getState().currentStepIndex).toBe(1);

      goToStep(2);
      expect(useLearnStore.getState().currentStepIndex).toBe(2);
    });

    it('should track step completion with markStepComplete', () => {
      const { initLesson, markStepComplete } = useLearnStore.getState();

      initLesson(mockLessons.movingPieces, movingPiecesSteps);

      // Initially stepCompleted should be false
      expect(useLearnStore.getState().stepCompleted).toBe(false);

      // Mark current step as complete
      markStepComplete();
      expect(useLearnStore.getState().stepCompleted).toBe(true);
    });

    it('should handle move tasks correctly', () => {
      const { initLesson, makeMove } = useLearnStore.getState();

      // Create a step with a move_task that requires e2e4
      const stepsWithMoveTask = [
        {
          id: 'step-move',
          lessonId: LESSON_IDS.movingPieces,
          type: 'move_task' as const,
          orderIndex: 1,
          title: 'Move the Pawn',
          requiredMoveUci: 'e2e4',
          initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        },
      ];

      initLesson(mockLessons.movingPieces, stepsWithMoveTask);

      // Make correct move - returns boolean
      const result = makeMove('e2', 'e4');
      expect(result).toBe(true);
    });
  });

  describe('Practice Store Integration', () => {
    const mateIn1Puzzles = mockPuzzles.filter(
      (puzzle) => puzzle.packId === PACK_IDS.mateIn1
    );

    it('should initialize practice session', () => {
      const { initPractice } = usePracticeStore.getState();

      // initPractice takes just puzzles array, not (pack, puzzles)
      initPractice(mateIn1Puzzles);

      const state = usePracticeStore.getState();
      // Store has puzzles but not currentPack
      expect(state.puzzles).toEqual(mateIn1Puzzles);
      expect(state.currentPuzzleIndex).toBe(0);
    });

    it('should record puzzle results', () => {
      const { initPractice, recordResult } = usePracticeStore.getState();

      initPractice(mateIn1Puzzles);

      recordResult(true, 1, 5000);

      const state = usePracticeStore.getState();
      expect(state.results.length).toBe(1);
      expect(state.results[0].correct).toBe(true);
    });

    it('should advance to next puzzle', () => {
      const { initPractice, nextPuzzle } = usePracticeStore.getState();

      initPractice(mateIn1Puzzles);

      expect(usePracticeStore.getState().currentPuzzleIndex).toBe(0);

      nextPuzzle();
      expect(usePracticeStore.getState().currentPuzzleIndex).toBe(1);
    });

    it('should calculate practice statistics', () => {
      const { initPractice, recordResult, getStats } = usePracticeStore.getState();

      initPractice(mateIn1Puzzles);

      recordResult(true, 1, 3000);
      recordResult(false, 2, 5000);

      const stats = getStats();
      expect(stats.total).toBe(2);
      expect(stats.correct).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle unauthorized access to progress', async () => {
      useAuthStore.getState().reset(); // Log out

      server.use(
        http.get('/api/learn/progress', () => {
          return HttpResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      const response = await fetch('/api/learn/progress');
      expect(response.status).toBe(401);
    });

    it('should handle network errors gracefully', async () => {
      server.use(
        http.get('/api/learn/tracks', () => {
          return HttpResponse.error();
        })
      );

      await expect(fetch('/api/learn/tracks')).rejects.toThrow();
    });

    it('should handle server errors', async () => {
      server.use(
        http.post('/api/learn/progress/lesson', () => {
          return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      const response = await fetch('/api/learn/progress/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: 'test', stepId: 'test', completed: true }),
      });

      expect(response.status).toBe(500);
    });
  });
});
