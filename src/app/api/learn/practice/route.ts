import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/learn/practice
 *
 * Fetch all published practice packs with puzzle counts.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Fetch published practice packs
    const { data: packs, error: packsError } = await supabase
      .from('learn_practice_packs')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (packsError) {
      console.error('Practice packs fetch error:', packsError);
      return NextResponse.json({ error: 'Failed to fetch practice packs' }, { status: 500 });
    }

    // Get puzzle counts for each pack
    const packsWithCount = await Promise.all(
      (packs || []).map(async (pack) => {
        const { count } = await supabase
          .from('learn_pack_items')
          .select('id', { count: 'exact', head: true })
          .eq('pack_id', pack.id);

        return {
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
          puzzleCount: count || 0,
        };
      })
    );

    return NextResponse.json({ packs: packsWithCount });
  } catch (error) {
    console.error('Practice packs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
