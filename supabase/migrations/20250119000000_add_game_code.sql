-- Add short 6-character alphanumeric game code for easy sharing
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS game_code VARCHAR(6);

-- Create unique index for game_code lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_games_game_code ON public.games(game_code) WHERE game_code IS NOT NULL;

-- Function to generate a random 6-character alphanumeric code
CREATE OR REPLACE FUNCTION generate_game_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Backfill existing games with unique codes
DO $$
DECLARE
  game_record RECORD;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  FOR game_record IN SELECT id FROM public.games WHERE game_code IS NULL LOOP
    LOOP
      new_code := generate_game_code();
      SELECT EXISTS(SELECT 1 FROM public.games WHERE game_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    UPDATE public.games SET game_code = new_code WHERE id = game_record.id;
  END LOOP;
END $$;

-- Function to join a game by game_code (6-char alphanumeric)
CREATE OR REPLACE FUNCTION public.join_game_by_code(p_game_code TEXT)
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
  WHERE game_code = UPPER(p_game_code)
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
    WHERE id = v_game.id
    RETURNING * INTO v_game;
    RETURN v_game;
  ELSIF v_game.black_id IS NULL THEN
    UPDATE public.games
    SET black_id = v_user_id,
        status = 'active',
        started_at = NOW()
    WHERE id = v_game.id
    RETURNING * INTO v_game;
    RETURN v_game;
  ELSE
    RAISE EXCEPTION 'Game is full';
  END IF;
END;
$$;
