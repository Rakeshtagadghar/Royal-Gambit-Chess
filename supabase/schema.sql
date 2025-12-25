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
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished', 'aborted')),
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
    time_control JSONB DEFAULT '{"baseMs": 300000, "incrementMs": 0}'::jsonb
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
CREATE INDEX IF NOT EXISTS idx_games_created_at ON public.games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moves_game_id ON public.moves(game_id);
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_time_control ON public.matchmaking_queue(time_control);
CREATE INDEX IF NOT EXISTS idx_invitations_from_user_id_created_at ON public.invitations(from_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invitations_to_user_id_created_at ON public.invitations(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);

-- Row Level Security Policies

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

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
        status = 'waiting'
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
            AND (g.white_id = auth.uid() OR g.black_id = auth.uid() OR g.status = 'finished')
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

