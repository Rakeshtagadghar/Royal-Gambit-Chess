import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ packSlug: string }>;
}

/**
 * GET /api/learn/practice/[packSlug]
 *
 * Fetch a practice pack with its puzzles.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { packSlug } = await params;
    const supabase = await createClient();

    // Get current user (optional)
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch practice pack
    const { data: pack, error: packError } = await supabase
      .from('learn_practice_packs')
      .select('*')
      .eq('slug', packSlug)
      .eq('is_published', true)
      .single();

    if (packError || !pack) {
      return NextResponse.json({ error: 'Practice pack not found' }, { status: 404 });
    }

    // Fetch pack items with puzzles
    const { data: packItems, error: itemsError } = await supabase
      .from('learn_pack_items')
      .select('puzzle_id, order_index')
      .eq('pack_id', pack.id)
      .order('order_index');

    if (itemsError) {
      console.error('Pack items fetch error:', itemsError);
      return NextResponse.json({ error: 'Failed to fetch puzzles' }, { status: 500 });
    }

    // Fetch the actual puzzles
    let puzzles: Array<{
      id: string;
      level: string;
      topic: string;
      initialFen: string;
      solutionLineUci: string[];
      explanationMd: string | null;
      rating: number;
      createdAt: string;
    }> = [];

    if (packItems && packItems.length > 0) {
      const puzzleIds = packItems.map((item) => item.puzzle_id);

      const { data: puzzlesData } = await supabase
        .from('learn_puzzles')
        .select('*')
        .in('id', puzzleIds);

      if (puzzlesData) {
        // Create a map for ordering
        const puzzleMap = new Map(puzzlesData.map((p) => [p.id, p]));

        // Sort puzzles according to pack order
        puzzles = packItems
          .map((item) => puzzleMap.get(item.puzzle_id))
          .filter(Boolean)
          .map((p) => ({
            id: p!.id,
            level: p!.level,
            topic: p!.topic,
            initialFen: p!.initial_fen,
            solutionLineUci: p!.solution_line_uci || [],
            explanationMd: p!.explanation_md,
            rating: p!.rating,
            createdAt: p!.created_at,
          }));
      }
    }

    // Get user results if authenticated
    let results: Array<{
      puzzleId: string;
      isCorrect: boolean;
      attempts: number;
      timeMs: number | null;
    }> = [];

    if (user && puzzles.length > 0) {
      const puzzleIds = puzzles.map((p) => p.id);
      const { data: resultsData } = await supabase
        .from('learn_user_practice_results')
        .select('puzzle_id, is_correct, attempts, time_ms')
        .eq('user_id', user.id)
        .in('puzzle_id', puzzleIds)
        .order('created_at', { ascending: false });

      if (resultsData) {
        // Get most recent result per puzzle
        const resultMap = new Map<string, typeof resultsData[0]>();
        resultsData.forEach((r) => {
          if (!resultMap.has(r.puzzle_id)) {
            resultMap.set(r.puzzle_id, r);
          }
        });

        results = Array.from(resultMap.values()).map((r) => ({
          puzzleId: r.puzzle_id,
          isCorrect: r.is_correct,
          attempts: r.attempts,
          timeMs: r.time_ms,
        }));
      }
    }

    // Calculate stats
    const totalPuzzles = puzzles.length;
    const solvedPuzzles = results.length;
    const correctPuzzles = results.filter((r) => r.isCorrect).length;
    const accuracy = solvedPuzzles > 0 ? Math.round((correctPuzzles / solvedPuzzles) * 100) : 0;

    return NextResponse.json({
      pack: {
        id: pack.id,
        slug: pack.slug,
        title: pack.title,
        level: pack.level,
        topic: pack.topic,
        description: pack.description,
        coverImageUrl: pack.cover_image_url,
        isPublished: pack.is_published,
        createdAt: pack.created_at,
        updatedAt: pack.updated_at,
      },
      puzzles,
      results,
      stats: {
        totalPuzzles,
        solvedPuzzles,
        correctPuzzles,
        accuracy,
      },
    });
  } catch (error) {
    console.error('Practice pack error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
