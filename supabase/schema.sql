-- RoyalGambit Database Schema
-- Run this SQL in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games table
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mode TEXT NOT NULL CHECK (mode IN ('bot', 'pvp')),
    game_mode TEXT NOT NULL DEFAULT 'blitz' CHECK (game_mode IN ('bullet', 'blitz', 'rapid', 'classical')),
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished', 'aborted')),
    spectate_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    white_id UUID REFERENCES public.profiles(id),
    black_id UUID REFERENCES public.profiles(id),
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    initial_fen TEXT DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    current_fen TEXT DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    pgn TEXT DEFAULT '',
    result TEXT DEFAULT '*' CHECK (result IN ('1-0', '0-1', '1/2-1/2', '*')),
    termination TEXT CHECK (termination IN ('checkmate', 'resign', 'timeout', 'stalemate', 'draw_agreement', 'insufficient_material', 'threefold_repetition', 'fifty_move_rule', 'aborted')),
    time_control JSONB DEFAULT '{"baseMs": 300000, "incrementMs": 0}'::jsonb,
    ratings_processed BOOLEAN DEFAULT FALSE
);

-- Ratings table (ELO per user per time control mode)
CREATE TABLE IF NOT EXISTS public.ratings (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('bullet', 'blitz', 'rapid', 'classical')),
    elo INTEGER NOT NULL DEFAULT 1200,
    games_played INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    draws INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, mode)
);

-- Rating history table (append-only audit trail for ELO changes)
CREATE TABLE IF NOT EXISTS public.rating_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('bullet', 'blitz', 'rapid', 'classical')),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    elo_before INTEGER NOT NULL,
    elo_after INTEGER NOT NULL,
    delta INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RTC Rooms table (video/audio chat metadata per game)
CREATE TABLE IF NOT EXISTS public.rtc_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL UNIQUE REFERENCES public.games(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game spectators table (track active spectators)
CREATE TABLE IF NOT EXISTS public.game_spectators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (game_id, user_id)
);

-- Game chat messages table (persisted)
CREATE TABLE IF NOT EXISTS public.game_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('player', 'spectator')),
    message TEXT NOT NULL CHECK (char_length(message) <= 2000),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Moves table
CREATE TABLE IF NOT EXISTS public.moves (
    id BIGSERIAL PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    ply INTEGER NOT NULL,
    uci TEXT NOT NULL,
    san TEXT NOT NULL,
    fen_after TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (game_id, ply)
);

-- Matchmaking queue table
CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    time_control JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id)
);

-- Invitations table (for friend invites with realtime status updates)
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    to_email TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
    time_control JSONB NOT NULL DEFAULT '{"baseMs": 300000, "incrementMs": 0}'::jsonb,
    color_preference TEXT NOT NULL DEFAULT 'random'
      CHECK (color_preference IN ('white', 'black', 'random')),
    game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_games_white_id ON public.games(white_id);
CREATE INDEX IF NOT EXISTS idx_games_black_id ON public.games(black_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_games_game_mode ON public.games(game_mode);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON public.games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_spectate_allowed_started_at ON public.games(spectate_allowed, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_moves_game_id ON public.moves(game_id);
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_time_control ON public.matchmaking_queue(time_control);
CREATE INDEX IF NOT EXISTS idx_invitations_from_user_id_created_at ON public.invitations(from_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invitations_to_user_id_created_at ON public.invitations(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);
CREATE INDEX IF NOT EXISTS idx_ratings_mode_elo ON public.ratings(mode, elo DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_rating_history_user_id ON public.rating_history(user_id);
CREATE INDEX IF NOT EXISTS idx_rating_history_game_id ON public.rating_history(game_id);
CREATE INDEX IF NOT EXISTS idx_rtc_rooms_game_id ON public.rtc_rooms(game_id);
CREATE INDEX IF NOT EXISTS idx_game_spectators_game_active ON public.game_spectators(game_id, is_active);
CREATE INDEX IF NOT EXISTS idx_game_spectators_user_active ON public.game_spectators(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_game_chat_messages_game_created_at ON public.game_chat_messages(game_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_chat_messages_sender_created_at ON public.game_chat_messages(sender_id, created_at DESC);

-- Row Level Security Policies

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rtc_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_spectators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Games policies
CREATE POLICY "Games are viewable by participants and finished games are public"
    ON public.games FOR SELECT
    USING (
        white_id = auth.uid() OR 
        black_id = auth.uid() OR 
        created_by = auth.uid() OR
        status = 'finished' OR
        status = 'waiting' OR
        (status = 'active' AND spectate_allowed = TRUE AND mode = 'pvp')
    );

CREATE POLICY "Authenticated users can create games"
    ON public.games FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Participants can update games"
    ON public.games FOR UPDATE
    USING (white_id = auth.uid() OR black_id = auth.uid() OR created_by = auth.uid());

-- Moves policies
CREATE POLICY "Moves are viewable if game is viewable"
    ON public.moves FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.games g
            WHERE g.id = game_id
            AND (
                g.white_id = auth.uid() OR
                g.black_id = auth.uid() OR
                g.status = 'finished' OR
                (g.status = 'active' AND g.spectate_allowed = TRUE AND g.mode = 'pvp')
            )
        )
    );

CREATE POLICY "Participants can insert moves"
    ON public.moves FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.games g
            WHERE g.id = game_id
            AND (g.white_id = auth.uid() OR g.black_id = auth.uid())
            AND g.status = 'active'
        )
    );

-- Matchmaking queue policies
CREATE POLICY "Users can view their own queue entry"
    ON public.matchmaking_queue FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own queue entry"
    ON public.matchmaking_queue FOR ALL
    USING (user_id = auth.uid());

-- Service role can read queue for matchmaking
CREATE POLICY "Service role can read queue"
    ON public.matchmaking_queue FOR SELECT
    USING (true);

-- Invitations policies
CREATE POLICY "Users can view invitations they sent or received"
    ON public.invitations FOR SELECT
    USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can create invitations they send"
    ON public.invitations FOR INSERT
    WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Senders can update their invitations"
    ON public.invitations FOR UPDATE
    USING (from_user_id = auth.uid())
    WITH CHECK (from_user_id = auth.uid());

-- Receivers can also update invitations (to accept/decline)
CREATE POLICY "Receivers can update their invitations"
    ON public.invitations FOR UPDATE
    USING (to_user_id = auth.uid())
    WITH CHECK (to_user_id = auth.uid());

-- Ratings policies (public read, no client writes - only via server/functions)
CREATE POLICY "Ratings are viewable by everyone"
    ON public.ratings FOR SELECT
    USING (true);

-- Rating history policies (owner can read their own history)
CREATE POLICY "Users can view their own rating history"
    ON public.rating_history FOR SELECT
    USING (user_id = auth.uid());

-- Public can view rating history for leaderboard context
CREATE POLICY "Rating history is publicly viewable"
    ON public.rating_history FOR SELECT
    USING (true);

-- RTC Rooms policies
CREATE POLICY "RTC rooms are viewable by game participants (and spectators for spectatable games)"
    ON public.rtc_rooms FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.games g
            WHERE g.id = game_id
            AND (
                g.white_id = auth.uid() OR
                g.black_id = auth.uid() OR
                (g.status = 'active' AND g.spectate_allowed = TRUE AND g.mode = 'pvp')
            )
        )
    );

CREATE POLICY "Game participants can create RTC rooms"
    ON public.rtc_rooms FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.games g
            WHERE g.id = game_id
            AND (g.white_id = auth.uid() OR g.black_id = auth.uid())
        )
        AND auth.uid() = created_by
    );

-- Spectators policies
CREATE POLICY "Spectators can view for spectatable games or if participant"
    ON public.game_spectators FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.games g
            WHERE g.id = game_id
            AND (
                g.white_id = auth.uid() OR
                g.black_id = auth.uid() OR
                (g.status = 'active' AND g.spectate_allowed = TRUE AND g.mode = 'pvp')
            )
        )
    );

CREATE POLICY "Spectators can insert themselves for spectatable active games"
    ON public.game_spectators FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.games g
            WHERE g.id = game_id
              AND g.status = 'active'
              AND g.spectate_allowed = TRUE
              AND g.mode = 'pvp'
        )
    );

CREATE POLICY "Spectators can update their own spectator row"
    ON public.game_spectators FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Chat policies
CREATE POLICY "Chat messages viewable by participants or active spectators"
    ON public.game_chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.games g
            WHERE g.id = game_id
              AND (g.white_id = auth.uid() OR g.black_id = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.game_spectators s
            WHERE s.game_id = game_id
              AND s.user_id = auth.uid()
              AND s.is_active = TRUE
        )
    );

CREATE POLICY "Chat messages insertable by participants or active spectators"
    ON public.game_chat_messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND (
            EXISTS (
                SELECT 1 FROM public.games g
                WHERE g.id = game_id
                  AND (g.white_id = auth.uid() OR g.black_id = auth.uid())
            )
            OR EXISTS (
                SELECT 1 FROM public.game_spectators s
                WHERE s.game_id = game_id
                  AND s.user_id = auth.uid()
                  AND s.is_active = TRUE
            )
        )
    );

CREATE POLICY "Chat message sender can soft-delete their message"
    ON public.game_chat_messages FOR UPDATE
    USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- Ongoing games view (spectate entry point)
-- IMPORTANT: security_invoker ensures the view runs with the querying user's permissions (RLS-safe for PostgREST).
CREATE OR REPLACE VIEW public.ongoing_games_view
WITH (security_invoker = true)
AS
SELECT
    g.id,
    g.game_mode,
    g.status,
    g.started_at,
    g.created_at,
    g.time_control,
    g.white_id,
    g.black_id,
    w.username AS white_username,
    w.display_name AS white_display_name,
    b.username AS black_username,
    b.display_name AS black_display_name,
    (SELECT COUNT(*)::int FROM public.moves m WHERE m.game_id = g.id) AS move_count,
    (SELECT COUNT(*)::int FROM public.game_spectators s WHERE s.game_id = g.id AND s.is_active = TRUE) AS spectator_count
FROM public.games g
LEFT JOIN public.profiles w ON w.id = g.white_id
LEFT JOIN public.profiles b ON b.id = g.black_id
WHERE g.status = 'active'
  AND g.mode = 'pvp'
  AND g.spectate_allowed = TRUE;

GRANT SELECT ON public.ongoing_games_view TO anon, authenticated;

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'username', 'User')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SECURITY DEFINER function to join a waiting game.
-- This avoids RLS blocking the "join" update for a user who is not yet a participant.
CREATE OR REPLACE FUNCTION public.join_game(p_game_id uuid)
RETURNS public.games
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_game public.games;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO v_game
  FROM public.games
  WHERE id = p_game_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Game not found';
  END IF;

  IF v_game.status <> 'waiting' THEN
    RAISE EXCEPTION 'Game is not accepting players';
  END IF;

  -- Already a participant
  IF v_game.white_id = v_user_id OR v_game.black_id = v_user_id THEN
    RETURN v_game;
  END IF;

  IF v_game.white_id IS NULL THEN
    UPDATE public.games
    SET white_id = v_user_id,
        status = CASE WHEN v_game.black_id IS NULL THEN 'waiting' ELSE 'active' END,
        started_at = CASE WHEN v_game.black_id IS NULL THEN started_at ELSE NOW() END
    WHERE id = p_game_id
    RETURNING * INTO v_game;
    RETURN v_game;
  ELSIF v_game.black_id IS NULL THEN
    UPDATE public.games
    SET black_id = v_user_id,
        status = 'active',
        started_at = NOW()
    WHERE id = p_game_id
    RETURNING * INTO v_game;
    RETURN v_game;
  ELSE
    RAISE EXCEPTION 'Game is full';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_game(uuid) TO authenticated;

-- Enable Realtime for games table
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.moves;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invitations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ratings;

-- Leaderboard view: ranks users by ELO per mode
-- Uses security_invoker to respect RLS policies
DROP VIEW IF EXISTS public.leaderboard_global;

CREATE VIEW public.leaderboard_global 
WITH (security_invoker = true)
AS
SELECT 
    r.user_id,
    r.mode,
    r.elo,
    r.games_played,
    r.wins,
    r.losses,
    r.draws,
    p.username,
    p.display_name,
    p.avatar_url,
    RANK() OVER (PARTITION BY r.mode ORDER BY r.elo DESC, r.games_played DESC) as rank
FROM public.ratings r
JOIN public.profiles p ON p.id = r.user_id
WHERE r.games_played > 0;

-- Function to initialize ratings for a user (all modes at 1200)
CREATE OR REPLACE FUNCTION public.initialize_user_ratings(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.ratings (user_id, mode, elo, games_played, wins, losses, draws)
    VALUES 
        (p_user_id, 'bullet', 1200, 0, 0, 0, 0),
        (p_user_id, 'blitz', 1200, 0, 0, 0, 0),
        (p_user_id, 'rapid', 1200, 0, 0, 0, 0),
        (p_user_id, 'classical', 1200, 0, 0, 0, 0)
    ON CONFLICT (user_id, mode) DO NOTHING;
END;
$$;

-- Function to calculate ELO change
-- K-factor: 32 for players with <30 games, 24 for 30-100 games, 16 for 100+ games
CREATE OR REPLACE FUNCTION public.calculate_elo_delta(
    p_player_elo INTEGER,
    p_opponent_elo INTEGER,
    p_player_games INTEGER,
    p_result NUMERIC  -- 1 for win, 0 for loss, 0.5 for draw
)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_k_factor INTEGER;
    v_expected NUMERIC;
    v_delta INTEGER;
BEGIN
    -- Determine K-factor based on games played
    IF p_player_games < 30 THEN
        v_k_factor := 32;
    ELSIF p_player_games < 100 THEN
        v_k_factor := 24;
    ELSE
        v_k_factor := 16;
    END IF;
    
    -- Calculate expected score (ELO formula)
    v_expected := 1.0 / (1.0 + POWER(10.0, (p_opponent_elo - p_player_elo) / 400.0));
    
    -- Calculate ELO change
    v_delta := ROUND(v_k_factor * (p_result - v_expected));
    
    RETURN v_delta;
END;
$$;

-- SECURITY DEFINER function to process game result and update ratings
-- This should only be called by server-side code (API routes)
CREATE OR REPLACE FUNCTION public.process_game_ratings(p_game_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_game RECORD;
    v_white_rating RECORD;
    v_black_rating RECORD;
    v_white_result NUMERIC;
    v_black_result NUMERIC;
    v_white_delta INTEGER;
    v_black_delta INTEGER;
BEGIN
    -- Get game info
    SELECT * INTO v_game
    FROM public.games
    WHERE id = p_game_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Game not found');
    END IF;
    
    -- Only process PvP games
    IF v_game.mode != 'pvp' THEN
        RETURN json_build_object('error', 'Not a PvP game');
    END IF;
    
    -- Only process finished games
    IF v_game.status != 'finished' THEN
        RETURN json_build_object('error', 'Game not finished');
    END IF;
    
    -- Don't process if already done
    IF v_game.ratings_processed THEN
        RETURN json_build_object('error', 'Ratings already processed');
    END IF;
    
    -- Check both players exist
    IF v_game.white_id IS NULL OR v_game.black_id IS NULL THEN
        RETURN json_build_object('error', 'Missing player');
    END IF;
    
    -- Initialize ratings if they don't exist
    PERFORM public.initialize_user_ratings(v_game.white_id);
    PERFORM public.initialize_user_ratings(v_game.black_id);
    
    -- Get current ratings
    SELECT * INTO v_white_rating
    FROM public.ratings
    WHERE user_id = v_game.white_id AND mode = v_game.game_mode;
    
    SELECT * INTO v_black_rating
    FROM public.ratings
    WHERE user_id = v_game.black_id AND mode = v_game.game_mode;
    
    -- Determine results
    IF v_game.result = '1-0' THEN
        v_white_result := 1.0;
        v_black_result := 0.0;
    ELSIF v_game.result = '0-1' THEN
        v_white_result := 0.0;
        v_black_result := 1.0;
    ELSIF v_game.result = '1/2-1/2' THEN
        v_white_result := 0.5;
        v_black_result := 0.5;
    ELSE
        RETURN json_build_object('error', 'Invalid result');
    END IF;
    
    -- Calculate ELO changes
    v_white_delta := public.calculate_elo_delta(
        v_white_rating.elo,
        v_black_rating.elo,
        v_white_rating.games_played,
        v_white_result
    );
    
    v_black_delta := public.calculate_elo_delta(
        v_black_rating.elo,
        v_white_rating.elo,
        v_black_rating.games_played,
        v_black_result
    );
    
    -- Insert rating history for white
    INSERT INTO public.rating_history (user_id, mode, game_id, elo_before, elo_after, delta)
    VALUES (
        v_game.white_id,
        v_game.game_mode,
        p_game_id,
        v_white_rating.elo,
        v_white_rating.elo + v_white_delta,
        v_white_delta
    );
    
    -- Insert rating history for black
    INSERT INTO public.rating_history (user_id, mode, game_id, elo_before, elo_after, delta)
    VALUES (
        v_game.black_id,
        v_game.game_mode,
        p_game_id,
        v_black_rating.elo,
        v_black_rating.elo + v_black_delta,
        v_black_delta
    );
    
    -- Update white's rating
    UPDATE public.ratings
    SET 
        elo = elo + v_white_delta,
        games_played = games_played + 1,
        wins = wins + CASE WHEN v_white_result = 1.0 THEN 1 ELSE 0 END,
        losses = losses + CASE WHEN v_white_result = 0.0 THEN 1 ELSE 0 END,
        draws = draws + CASE WHEN v_white_result = 0.5 THEN 1 ELSE 0 END,
        updated_at = NOW()
    WHERE user_id = v_game.white_id AND mode = v_game.game_mode;
    
    -- Update black's rating
    UPDATE public.ratings
    SET 
        elo = elo + v_black_delta,
        games_played = games_played + 1,
        wins = wins + CASE WHEN v_black_result = 1.0 THEN 1 ELSE 0 END,
        losses = losses + CASE WHEN v_black_result = 0.0 THEN 1 ELSE 0 END,
        draws = draws + CASE WHEN v_black_result = 0.5 THEN 1 ELSE 0 END,
        updated_at = NOW()
    WHERE user_id = v_game.black_id AND mode = v_game.game_mode;
    
    -- Mark game as processed
    UPDATE public.games
    SET ratings_processed = TRUE
    WHERE id = p_game_id;
    
    RETURN json_build_object(
        'success', true,
        'white_delta', v_white_delta,
        'black_delta', v_black_delta,
        'white_new_elo', v_white_rating.elo + v_white_delta,
        'black_new_elo', v_black_rating.elo + v_black_delta
    );
END;
$$;

-- Also initialize ratings when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'username', 'User')
    );
    
    -- Initialize ratings for the new user
    PERFORM public.initialize_user_ratings(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.initialize_user_ratings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_game_ratings(UUID) TO authenticated;

