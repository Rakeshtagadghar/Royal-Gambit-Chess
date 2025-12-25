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

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_games_white_id ON public.games(white_id);
CREATE INDEX IF NOT EXISTS idx_games_black_id ON public.games(black_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON public.games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moves_game_id ON public.moves(game_id);
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_time_control ON public.matchmaking_queue(time_control);

-- Row Level Security Policies

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;

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

-- Enable Realtime for games table
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.moves;

