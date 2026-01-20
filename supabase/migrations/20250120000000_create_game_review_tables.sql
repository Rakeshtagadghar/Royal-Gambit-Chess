-- Game Review Feature Migration
-- Creates tables for storing game analysis results from Stockfish engine

-- =============================================================================
-- TABLES
-- =============================================================================

-- Game Analysis table - stores per-game analysis summary
CREATE TABLE IF NOT EXISTS public.game_analysis (
    -- Primary key
    game_id UUID PRIMARY KEY REFERENCES public.games(id) ON DELETE CASCADE,

    -- Analysis status
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'done', 'failed')),

    -- Engine information
    engine_name TEXT NOT NULL DEFAULT 'stockfish',
    engine_version TEXT,

    -- Analysis settings used
    analysis_depth INTEGER NOT NULL DEFAULT 12,
    time_per_move_ms INTEGER NOT NULL DEFAULT 100,

    -- Hash for cache invalidation (hash of initial_fen + pgn + engine_version + settings)
    analysis_hash TEXT,

    -- White player statistics
    white_accuracy NUMERIC(5,2),           -- 0.00 to 100.00
    white_acpl NUMERIC(6,2),               -- Average centipawn loss
    white_blunders INTEGER DEFAULT 0,
    white_mistakes INTEGER DEFAULT 0,
    white_inaccuracies INTEGER DEFAULT 0,

    -- Black player statistics
    black_accuracy NUMERIC(5,2),
    black_acpl NUMERIC(6,2),
    black_blunders INTEGER DEFAULT 0,
    black_mistakes INTEGER DEFAULT 0,
    black_inaccuracies INTEGER DEFAULT 0,

    -- Processing metadata
    queued_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,

    -- For tracking progress during processing
    current_ply INTEGER DEFAULT 0,
    total_plies INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Move Analysis table - stores per-move analysis data
CREATE TABLE IF NOT EXISTS public.move_analysis (
    -- Composite primary key
    id BIGSERIAL PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    ply INTEGER NOT NULL,

    -- Move information
    played_move_uci TEXT NOT NULL,
    played_move_san TEXT,
    best_move_uci TEXT,
    best_move_san TEXT,

    -- Evaluation before this move was played
    eval_before_type TEXT CHECK (eval_before_type IN ('cp', 'mate')),
    eval_before_value INTEGER,  -- centipawns or mate-in-N

    -- Evaluation after this move was played
    eval_after_type TEXT CHECK (eval_after_type IN ('cp', 'mate')),
    eval_after_value INTEGER,

    -- Analysis results
    eval_loss_cp INTEGER DEFAULT 0,  -- How much worse than best move (in centipawns)
    classification TEXT NOT NULL DEFAULT 'good'
        CHECK (classification IN ('best', 'good', 'inaccuracy', 'mistake', 'blunder')),

    -- Principal variation (engine's best line)
    pv_uci TEXT,  -- Space-separated UCI moves

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique ply per game
    UNIQUE (game_id, ply)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Game Analysis indexes
CREATE INDEX IF NOT EXISTS idx_game_analysis_status
    ON public.game_analysis(status);
CREATE INDEX IF NOT EXISTS idx_game_analysis_queued_at
    ON public.game_analysis(queued_at)
    WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_game_analysis_completed_at
    ON public.game_analysis(completed_at DESC)
    WHERE status = 'done';

-- Move Analysis indexes
CREATE INDEX IF NOT EXISTS idx_move_analysis_game_id
    ON public.move_analysis(game_id);
CREATE INDEX IF NOT EXISTS idx_move_analysis_game_ply
    ON public.move_analysis(game_id, ply);
CREATE INDEX IF NOT EXISTS idx_move_analysis_classification
    ON public.move_analysis(game_id, classification)
    WHERE classification IN ('blunder', 'mistake', 'inaccuracy');

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.game_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.move_analysis ENABLE ROW LEVEL SECURITY;

-- Game Analysis Policies

-- Read: Participants can read their game analysis, public for finished games
CREATE POLICY "Game analysis readable by participants and public for finished games"
    ON public.game_analysis FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.games g
            WHERE g.id = game_id
            AND (
                g.white_id = auth.uid()
                OR g.black_id = auth.uid()
                OR g.status = 'finished'
            )
        )
    );

-- Insert/Update/Delete: Only service role (via Edge Functions)
-- No client-side policies for write operations - handled by service role

-- Move Analysis Policies

-- Read: Same as game analysis
CREATE POLICY "Move analysis readable by participants and public for finished games"
    ON public.move_analysis FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.games g
            WHERE g.id = game_id
            AND (
                g.white_id = auth.uid()
                OR g.black_id = auth.uid()
                OR g.status = 'finished'
            )
        )
    );

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to calculate move classification based on centipawn loss
CREATE OR REPLACE FUNCTION public.classify_move(eval_loss_cp INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF eval_loss_cp IS NULL THEN
        RETURN 'good';
    ELSIF eval_loss_cp <= 20 THEN
        RETURN 'best';
    ELSIF eval_loss_cp <= 50 THEN
        RETURN 'good';
    ELSIF eval_loss_cp <= 150 THEN
        RETURN 'inaccuracy';
    ELSIF eval_loss_cp <= 300 THEN
        RETURN 'mistake';
    ELSE
        RETURN 'blunder';
    END IF;
END;
$$;

-- Function to calculate accuracy from average centipawn loss (Lichess-style)
-- Uses exponential decay: accuracy = 103.1668 * exp(-0.04354 * acpl) - 3.1669
CREATE OR REPLACE FUNCTION public.calculate_accuracy(acpl NUMERIC)
RETURNS NUMERIC(5,2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    accuracy NUMERIC;
BEGIN
    IF acpl IS NULL OR acpl < 0 THEN
        RETURN NULL;
    END IF;

    -- Lichess-style accuracy formula
    accuracy := 103.1668 * EXP(-0.04354 * acpl) - 3.1669;

    -- Clamp to 0-100 range
    IF accuracy < 0 THEN
        accuracy := 0;
    ELSIF accuracy > 100 THEN
        accuracy := 100;
    END IF;

    RETURN ROUND(accuracy, 2);
END;
$$;

-- Function to queue a game for analysis (idempotent)
CREATE OR REPLACE FUNCTION public.queue_game_analysis(p_game_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_game RECORD;
    v_existing RECORD;
    v_total_plies INTEGER;
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized', 'code', 'UNAUTHORIZED');
    END IF;

    -- Get game info
    SELECT * INTO v_game
    FROM public.games
    WHERE id = p_game_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Game not found', 'code', 'GAME_NOT_FOUND');
    END IF;

    -- Check if user is participant
    IF v_game.white_id != auth.uid() AND v_game.black_id != auth.uid() AND v_game.created_by != auth.uid() THEN
        RETURN json_build_object('success', false, 'error', 'You don''t have access to this game', 'code', 'FORBIDDEN');
    END IF;

    -- Check if game is finished
    IF v_game.status != 'finished' THEN
        RETURN json_build_object('success', false, 'error', 'Analysis can only be performed on finished games', 'code', 'GAME_NOT_FINISHED');
    END IF;

    -- Check for existing analysis
    SELECT * INTO v_existing
    FROM public.game_analysis
    WHERE game_id = p_game_id;

    IF FOUND THEN
        RETURN json_build_object(
            'success', true,
            'status', v_existing.status,
            'game_id', p_game_id,
            'queued_at', v_existing.queued_at,
            'message', CASE
                WHEN v_existing.status = 'done' THEN 'Analysis already completed'
                WHEN v_existing.status = 'processing' THEN 'Analysis in progress'
                ELSE 'Analysis already queued'
            END
        );
    END IF;

    -- Count total plies for progress tracking
    SELECT COUNT(*) INTO v_total_plies
    FROM public.moves
    WHERE game_id = p_game_id;

    -- Insert new analysis record
    INSERT INTO public.game_analysis (game_id, status, total_plies)
    VALUES (p_game_id, 'pending', v_total_plies);

    RETURN json_build_object(
        'success', true,
        'status', 'pending',
        'game_id', p_game_id,
        'queued_at', NOW(),
        'message', 'Game queued for analysis'
    );
END;
$$;

-- Function to get analysis status
CREATE OR REPLACE FUNCTION public.get_analysis_status(p_game_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_analysis RECORD;
    v_game RECORD;
BEGIN
    -- Get game to check access
    SELECT * INTO v_game
    FROM public.games
    WHERE id = p_game_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Game not found', 'code', 'GAME_NOT_FOUND');
    END IF;

    -- Check access (finished games are public)
    IF v_game.status != 'finished' THEN
        IF auth.uid() IS NULL OR (v_game.white_id != auth.uid() AND v_game.black_id != auth.uid()) THEN
            RETURN json_build_object('success', false, 'error', 'Access denied', 'code', 'FORBIDDEN');
        END IF;
    END IF;

    -- Get analysis
    SELECT * INTO v_analysis
    FROM public.game_analysis
    WHERE game_id = p_game_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'game_id', p_game_id,
            'status', 'not_requested'
        );
    END IF;

    RETURN json_build_object(
        'game_id', p_game_id,
        'status', v_analysis.status,
        'progress', CASE
            WHEN v_analysis.status = 'processing' AND v_analysis.total_plies > 0 THEN
                json_build_object(
                    'current_ply', v_analysis.current_ply,
                    'total_plies', v_analysis.total_plies,
                    'percentage', ROUND((v_analysis.current_ply::NUMERIC / v_analysis.total_plies) * 100, 1)
                )
            ELSE NULL
        END
    );
END;
$$;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update timestamp trigger for game_analysis
CREATE OR REPLACE FUNCTION public.update_game_analysis_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_game_analysis_timestamp
    BEFORE UPDATE ON public.game_analysis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_game_analysis_timestamp();

-- =============================================================================
-- GRANTS
-- =============================================================================

GRANT EXECUTE ON FUNCTION public.classify_move(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_accuracy(NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.queue_game_analysis(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_analysis_status(UUID) TO authenticated, anon;

-- =============================================================================
-- REALTIME
-- =============================================================================

-- Enable realtime for game_analysis status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_analysis;

-- =============================================================================
-- VIEWS
-- =============================================================================

-- View for games with analysis summary (for archive/history pages)
CREATE OR REPLACE VIEW public.games_with_analysis
WITH (security_invoker = true)
AS
SELECT
    g.id,
    g.mode,
    g.game_mode,
    g.status,
    g.white_id,
    g.black_id,
    g.result,
    g.termination,
    g.created_at,
    g.ended_at,
    ga.status as analysis_status,
    ga.white_accuracy,
    ga.black_accuracy,
    ga.completed_at as analysis_completed_at
FROM public.games g
LEFT JOIN public.game_analysis ga ON g.id = ga.game_id;

GRANT SELECT ON public.games_with_analysis TO authenticated, anon;
