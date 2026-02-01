-- Enhanced profile trigger to handle OAuth metadata (Google, GitHub, etc.)
-- This replaces the basic trigger to properly extract avatar, display name from OAuth providers

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_username TEXT;
    v_display_name TEXT;
    v_avatar_url TEXT;
    v_email_base TEXT;
BEGIN
    -- Extract email base for username fallback
    v_email_base := COALESCE(
        split_part(NEW.email, '@', 1),
        'user_' || substr(NEW.id::text, 1, 8)
    );

    -- Get display name from OAuth metadata (Google, GitHub, etc.)
    v_display_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',      -- Google
        NEW.raw_user_meta_data->>'name',           -- Generic
        NEW.raw_user_meta_data->>'username',       -- From signup form
        v_email_base,
        'User'
    );

    -- Generate username (lowercase, sanitized, with suffix for uniqueness)
    v_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        lower(regexp_replace(v_display_name, '[^a-zA-Z0-9_]', '_', 'g'))
    );
    -- Ensure username is not empty after sanitization
    IF v_username IS NULL OR v_username = '' THEN
        v_username := 'user';
    END IF;
    -- Add suffix for uniqueness
    v_username := v_username || '_' || substr(NEW.id::text, 1, 8);

    -- Get avatar URL from OAuth providers
    v_avatar_url := COALESCE(
        NEW.raw_user_meta_data->>'picture',        -- Google
        NEW.raw_user_meta_data->>'avatar_url'      -- GitHub, others
    );

    -- Insert or update profile
    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    VALUES (NEW.id, v_username, v_display_name, v_avatar_url)
    ON CONFLICT (id) DO UPDATE SET
        display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
