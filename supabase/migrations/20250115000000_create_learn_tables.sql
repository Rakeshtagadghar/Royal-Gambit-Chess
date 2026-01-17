-- Migration: Create Learn/Tutorial Tables
-- Description: Schema for chess tutorials, lessons, practice packs, and progress tracking

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types for learn system
DO $$ BEGIN
    CREATE TYPE learn_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE learn_topic AS ENUM ('rules', 'tactics', 'openings', 'endgames', 'strategy', 'calculation');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE learn_step_type AS ENUM ('explain', 'move_task', 'quiz', 'puzzle', 'model_line');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE learn_progress_status AS ENUM ('not_started', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE puzzle_topic AS ENUM ('fork', 'pin', 'skewer', 'mate', 'endgame', 'deflection', 'discovered_attack', 'zwischenzug', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 1. LEARN_TRACKS - Top-level learning tracks
-- ============================================
CREATE TABLE IF NOT EXISTS learn_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    level learn_level NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    order_index INT DEFAULT 0,
    estimated_hours DECIMAL(4,1) DEFAULT 1.0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_learn_tracks_level ON learn_tracks(level);
CREATE INDEX IF NOT EXISTS idx_learn_tracks_order ON learn_tracks(order_index);
CREATE INDEX IF NOT EXISTS idx_learn_tracks_published ON learn_tracks(is_published);

-- ============================================
-- 2. LEARN_LESSONS - Lessons and their metadata
-- ============================================
CREATE TABLE IF NOT EXISTS learn_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID REFERENCES learn_tracks(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    topic learn_topic NOT NULL,
    level learn_level NOT NULL,
    description TEXT,
    estimated_minutes INT DEFAULT 5,
    order_index INT DEFAULT 0,
    prerequisite_lesson_ids JSONB DEFAULT '[]'::jsonb,
    cover_image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for lessons
CREATE INDEX IF NOT EXISTS idx_learn_lessons_track ON learn_lessons(track_id);
CREATE INDEX IF NOT EXISTS idx_learn_lessons_topic ON learn_lessons(topic);
CREATE INDEX IF NOT EXISTS idx_learn_lessons_level ON learn_lessons(level);
CREATE INDEX IF NOT EXISTS idx_learn_lessons_order ON learn_lessons(order_index);
CREATE INDEX IF NOT EXISTS idx_learn_lessons_published ON learn_lessons(is_published);

-- ============================================
-- 3. LEARN_LESSON_STEPS - Interactive steps for lessons
-- ============================================
CREATE TABLE IF NOT EXISTS learn_lesson_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES learn_lessons(id) ON DELETE CASCADE NOT NULL,
    step_index INT NOT NULL,
    type learn_step_type NOT NULL,
    title TEXT,
    body_md TEXT,
    initial_fen TEXT,
    required_move_uci TEXT,
    allowed_moves_uci JSONB DEFAULT '[]'::jsonb,
    solution_line_uci JSONB DEFAULT '[]'::jsonb,
    hints JSONB DEFAULT '[]'::jsonb,
    explain_correct_md TEXT,
    explain_wrong_md TEXT,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(lesson_id, step_index)
);

-- Index for steps ordering
CREATE INDEX IF NOT EXISTS idx_learn_lesson_steps_lesson ON learn_lesson_steps(lesson_id, step_index);

-- ============================================
-- 4. LEARN_PRACTICE_PACKS - Curated puzzle sets
-- ============================================
CREATE TABLE IF NOT EXISTS learn_practice_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    level learn_level NOT NULL,
    topic learn_topic NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for practice packs
CREATE INDEX IF NOT EXISTS idx_learn_practice_packs_level ON learn_practice_packs(level);
CREATE INDEX IF NOT EXISTS idx_learn_practice_packs_topic ON learn_practice_packs(topic);
CREATE INDEX IF NOT EXISTS idx_learn_practice_packs_published ON learn_practice_packs(is_published);

-- ============================================
-- 5. LEARN_PUZZLES - Puzzle positions and solutions
-- ============================================
CREATE TABLE IF NOT EXISTS learn_puzzles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level learn_level NOT NULL,
    topic puzzle_topic NOT NULL,
    initial_fen TEXT NOT NULL,
    solution_line_uci JSONB DEFAULT '[]'::jsonb NOT NULL,
    explanation_md TEXT,
    rating INT DEFAULT 1200,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for puzzles
CREATE INDEX IF NOT EXISTS idx_learn_puzzles_level ON learn_puzzles(level);
CREATE INDEX IF NOT EXISTS idx_learn_puzzles_topic ON learn_puzzles(topic);
CREATE INDEX IF NOT EXISTS idx_learn_puzzles_rating ON learn_puzzles(rating);

-- ============================================
-- 6. LEARN_PACK_ITEMS - Link puzzles to packs
-- ============================================
CREATE TABLE IF NOT EXISTS learn_pack_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID REFERENCES learn_practice_packs(id) ON DELETE CASCADE NOT NULL,
    puzzle_id UUID REFERENCES learn_puzzles(id) ON DELETE CASCADE NOT NULL,
    order_index INT DEFAULT 0,
    UNIQUE(pack_id, puzzle_id)
);

-- Index for pack items ordering
CREATE INDEX IF NOT EXISTS idx_learn_pack_items_pack ON learn_pack_items(pack_id, order_index);

-- ============================================
-- 7. LEARN_USER_PROGRESS - Per-user lesson progress
-- ============================================
CREATE TABLE IF NOT EXISTS learn_user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES learn_lessons(id) ON DELETE CASCADE NOT NULL,
    status learn_progress_status DEFAULT 'not_started',
    last_step_index INT DEFAULT 0,
    attempts INT DEFAULT 0,
    hints_used INT DEFAULT 0,
    best_score INT,
    time_spent_seconds INT DEFAULT 0,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, lesson_id)
);

-- Indexes for user progress
CREATE INDEX IF NOT EXISTS idx_learn_user_progress_user ON learn_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learn_user_progress_lesson ON learn_user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_learn_user_progress_status ON learn_user_progress(status);

-- ============================================
-- 8. LEARN_USER_PRACTICE_RESULTS - Puzzle attempt results
-- ============================================
CREATE TABLE IF NOT EXISTS learn_user_practice_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    puzzle_id UUID REFERENCES learn_puzzles(id) ON DELETE CASCADE NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempts INT DEFAULT 1,
    time_ms INT,
    hints_used INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for practice results
CREATE INDEX IF NOT EXISTS idx_learn_user_practice_results_user ON learn_user_practice_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learn_user_practice_results_puzzle ON learn_user_practice_results(puzzle_id);

-- ============================================
-- 9. LEARN_USER_STREAKS - Track learning streaks
-- ============================================
CREATE TABLE IF NOT EXISTS learn_user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for streaks
CREATE INDEX IF NOT EXISTS idx_learn_user_streaks_user ON learn_user_streaks(user_id);

-- ============================================
-- 10. LEARN_ACHIEVEMENTS - User achievements/badges
-- ============================================
CREATE TABLE IF NOT EXISTS learn_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT DEFAULT 'general',
    criteria JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 11. LEARN_USER_ACHIEVEMENTS - Track earned achievements
-- ============================================
CREATE TABLE IF NOT EXISTS learn_user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES learn_achievements(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, achievement_id)
);

-- Index for user achievements
CREATE INDEX IF NOT EXISTS idx_learn_user_achievements_user ON learn_user_achievements(user_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE learn_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE learn_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE learn_lesson_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE learn_practice_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE learn_puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learn_pack_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE learn_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learn_user_practice_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE learn_user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE learn_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE learn_user_achievements ENABLE ROW LEVEL SECURITY;

-- Public content: Anyone can read published content
CREATE POLICY "Public can read published tracks" ON learn_tracks
    FOR SELECT USING (is_published = true);

CREATE POLICY "Public can read published lessons" ON learn_lessons
    FOR SELECT USING (is_published = true);

CREATE POLICY "Public can read lesson steps for published lessons" ON learn_lesson_steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM learn_lessons
            WHERE learn_lessons.id = learn_lesson_steps.lesson_id
            AND learn_lessons.is_published = true
        )
    );

CREATE POLICY "Public can read published practice packs" ON learn_practice_packs
    FOR SELECT USING (is_published = true);

CREATE POLICY "Public can read puzzles" ON learn_puzzles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public can read pack items for published packs" ON learn_pack_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM learn_practice_packs
            WHERE learn_practice_packs.id = learn_pack_items.pack_id
            AND learn_practice_packs.is_published = true
        )
    );

CREATE POLICY "Public can read achievements" ON learn_achievements
    FOR SELECT USING (true);

-- User progress: Only owner can access their own progress
CREATE POLICY "Users can read own progress" ON learn_user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON learn_user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON learn_user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Practice results: Only owner can access
CREATE POLICY "Users can read own practice results" ON learn_user_practice_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice results" ON learn_user_practice_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Streaks: Only owner can access
CREATE POLICY "Users can read own streaks" ON learn_user_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON learn_user_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON learn_user_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- User achievements: Only owner can read
CREATE POLICY "Users can read own achievements" ON learn_user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON learn_user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_learn_streak(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_last_date DATE;
    v_today DATE := CURRENT_DATE;
    v_current_streak INT;
    v_longest_streak INT;
BEGIN
    -- Get current streak info
    SELECT last_activity_date, current_streak, longest_streak
    INTO v_last_date, v_current_streak, v_longest_streak
    FROM learn_user_streaks
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        -- Create new streak record
        INSERT INTO learn_user_streaks (user_id, current_streak, longest_streak, last_activity_date)
        VALUES (p_user_id, 1, 1, v_today);
    ELSIF v_last_date = v_today THEN
        -- Already updated today, do nothing
        NULL;
    ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
        -- Consecutive day, increment streak
        UPDATE learn_user_streaks
        SET
            current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1),
            last_activity_date = v_today,
            updated_at = now()
        WHERE user_id = p_user_id;
    ELSE
        -- Streak broken, reset to 1
        UPDATE learn_user_streaks
        SET
            current_streak = 1,
            last_activity_date = v_today,
            updated_at = now()
        WHERE user_id = p_user_id;
    END IF;
END;
$$;

-- Function to get track progress for a user
CREATE OR REPLACE FUNCTION get_track_progress(p_user_id UUID, p_track_id UUID)
RETURNS TABLE (
    total_lessons INT,
    completed_lessons INT,
    in_progress_lessons INT,
    completion_percentage DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(l.id)::INT as total_lessons,
        COUNT(CASE WHEN lup.status = 'completed' THEN 1 END)::INT as completed_lessons,
        COUNT(CASE WHEN lup.status = 'in_progress' THEN 1 END)::INT as in_progress_lessons,
        CASE
            WHEN COUNT(l.id) = 0 THEN 0
            ELSE ROUND((COUNT(CASE WHEN lup.status = 'completed' THEN 1 END)::DECIMAL / COUNT(l.id)::DECIMAL) * 100, 1)
        END as completion_percentage
    FROM learn_lessons l
    LEFT JOIN learn_user_progress lup ON l.id = lup.lesson_id AND lup.user_id = p_user_id
    WHERE l.track_id = p_track_id AND l.is_published = true;
END;
$$;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to relevant tables
DROP TRIGGER IF EXISTS update_learn_tracks_updated_at ON learn_tracks;
CREATE TRIGGER update_learn_tracks_updated_at
    BEFORE UPDATE ON learn_tracks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learn_lessons_updated_at ON learn_lessons;
CREATE TRIGGER update_learn_lessons_updated_at
    BEFORE UPDATE ON learn_lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learn_practice_packs_updated_at ON learn_practice_packs;
CREATE TRIGGER update_learn_practice_packs_updated_at
    BEFORE UPDATE ON learn_practice_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learn_user_progress_updated_at ON learn_user_progress;
CREATE TRIGGER update_learn_user_progress_updated_at
    BEFORE UPDATE ON learn_user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DEFAULT ACHIEVEMENTS
-- ============================================
INSERT INTO learn_achievements (slug, title, description, icon, category, criteria) VALUES
    ('first_lesson', 'First Steps', 'Complete your first lesson', '🎯', 'milestone', '{"lessons_completed": 1}'),
    ('beginner_track', 'Beginner Graduate', 'Complete the beginner track', '🎓', 'track', '{"track_level": "beginner"}'),
    ('fork_finder', 'Fork Finder', 'Solve 10 fork puzzles', '🍴', 'tactics', '{"puzzle_topic": "fork", "count": 10}'),
    ('pin_master', 'Pin Master', 'Solve 10 pin puzzles', '📌', 'tactics', '{"puzzle_topic": "pin", "count": 10}'),
    ('mate_patterns', 'Checkmate Artist', 'Solve 20 checkmate puzzles', '👑', 'tactics', '{"puzzle_topic": "mate", "count": 20}'),
    ('streak_7', 'Week Warrior', 'Maintain a 7-day learning streak', '🔥', 'streak', '{"streak_days": 7}'),
    ('streak_30', 'Monthly Master', 'Maintain a 30-day learning streak', '⚡', 'streak', '{"streak_days": 30}'),
    ('puzzle_100', 'Century Solver', 'Solve 100 puzzles', '💯', 'milestone', '{"puzzles_solved": 100}'),
    ('endgame_rookie', 'Endgame Rookie', 'Complete all endgame lessons', '🏁', 'topic', '{"topic": "endgames"}'),
    ('perfect_lesson', 'Perfectionist', 'Complete a lesson without using hints', '✨', 'achievement', '{"no_hints": true}')
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE learn_tracks IS 'Top-level learning tracks (Beginner, Intermediate, Advanced, Expert)';
COMMENT ON TABLE learn_lessons IS 'Individual lessons within tracks';
COMMENT ON TABLE learn_lesson_steps IS 'Interactive steps within lessons (explanations, move tasks, quizzes)';
COMMENT ON TABLE learn_practice_packs IS 'Curated sets of puzzles for practice';
COMMENT ON TABLE learn_puzzles IS 'Individual puzzle positions with solutions';
COMMENT ON TABLE learn_user_progress IS 'Per-user progress tracking for lessons';
COMMENT ON TABLE learn_user_practice_results IS 'Per-user puzzle attempt results';
COMMENT ON TABLE learn_user_streaks IS 'User learning streak tracking';
COMMENT ON TABLE learn_achievements IS 'Available achievements/badges';
COMMENT ON TABLE learn_user_achievements IS 'Achievements earned by users';
