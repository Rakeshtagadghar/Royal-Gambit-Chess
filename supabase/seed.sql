-- Seed file for test users
-- This file is automatically run when you execute `supabase db reset`
-- Useful for E2E testing with deterministic test users

-- Note: The handle_new_user() trigger will automatically create profiles
-- when users are inserted into auth.users

-- Insert test users into auth.users with deterministic IDs
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES
  -- Test User 1
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'test@example.com',
    crypt('testpassword123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"testuser"}'::jsonb,
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  ),
  -- Test User 2 (Player B)
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'playerb@example.com',
    crypt('testpassword123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"playerb"}'::jsonb,
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  ),
  -- Test User 3 (Spectator)
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'spectator@example.com',
    crypt('testpassword123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"spectator"}'::jsonb,
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

-- The handle_new_user() trigger should have created profiles automatically
-- But let's ensure they exist and initialize ratings
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  FOR test_user_id IN 
    SELECT id FROM auth.users WHERE email IN ('test@example.com', 'playerb@example.com', 'spectator@example.com')
  LOOP
    -- Ensure profile exists (in case trigger didn't run)
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
      test_user_id,
      (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = test_user_id),
      (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = test_user_id)
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Initialize ratings
    PERFORM public.initialize_user_ratings(test_user_id);
  END LOOP;
END $$;
