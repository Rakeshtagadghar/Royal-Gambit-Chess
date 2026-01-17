import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/learn/tracks
 *
 * Fetch all published learning tracks with optional user progress.
 * Returns tracks sorted by order_index.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user (optional - progress only shown if authenticated)
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch published tracks
    const { data: tracks, error: tracksError } = await supabase
      .from('learn_tracks')
      .select('*')
      .eq('is_published', true)
      .order('order_index');

    if (tracksError) {
      console.error('Tracks fetch error:', tracksError);
      return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
    }

    // Build tracks with progress
    const tracksWithProgress = await Promise.all(
      (tracks || []).map(async (track) => {
        // Get lesson count for this track
        const { count: lessonCount } = await supabase
          .from('learn_lessons')
          .select('id', { count: 'exact', head: true })
          .eq('track_id', track.id)
          .eq('is_published', true);

        const totalLessons = lessonCount || 0;
        let completedLessons = 0;
        let inProgressLessons = 0;

        // Get user progress if authenticated
        if (user && totalLessons > 0) {
          const { data: lessons } = await supabase
            .from('learn_lessons')
            .select('id')
            .eq('track_id', track.id)
            .eq('is_published', true);

          if (lessons && lessons.length > 0) {
            const lessonIds = lessons.map((l) => l.id);
            const { data: progress } = await supabase
              .from('learn_user_progress')
              .select('status')
              .eq('user_id', user.id)
              .in('lesson_id', lessonIds);

            if (progress) {
              completedLessons = progress.filter((p) => p.status === 'completed').length;
              inProgressLessons = progress.filter((p) => p.status === 'in_progress').length;
            }
          }
        }

        return {
          id: track.id,
          slug: track.slug,
          title: track.title,
          level: track.level,
          description: track.description,
          coverImageUrl: track.cover_image_url,
          orderIndex: track.order_index,
          estimatedHours: track.estimated_hours,
          isPublished: track.is_published,
          createdAt: track.created_at,
          updatedAt: track.updated_at,
          totalLessons,
          completedLessons,
          inProgressLessons,
          completionPercentage: totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0,
        };
      })
    );

    return NextResponse.json({ tracks: tracksWithProgress });
  } catch (error) {
    console.error('Tracks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
