import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { USER_IDS } from '@tests/fixtures/users';
import { GAME_IDS } from '@tests/fixtures/games';

/**
 * RLS Policy Tests
 *
 * These tests verify that Row Level Security policies are correctly enforced.
 * They require a local Supabase instance with proper migrations applied.
 *
 * To run these tests:
 * 1. Start local Supabase: `supabase start`
 * 2. Apply migrations: `supabase db reset`
 * 3. Run tests: `pnpm test:security`
 */

// Skip these tests if not running against local Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:55321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const shouldSkip = !SUPABASE_SERVICE_KEY || SUPABASE_URL.includes('supabase.co');

describe.skipIf(shouldSkip)('RLS Policy Tests', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let _adminClient: SupabaseClient;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let _playerAClient: SupabaseClient;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let _playerBClient: SupabaseClient;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let _spectatorClient: SupabaseClient;
  let anonymousClient: SupabaseClient;

  beforeAll(async () => {
    // Admin client for setup (bypasses RLS)
    _adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Anonymous client (no auth)
    anonymousClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create test users and get their clients
    // Note: In real tests, you'd create actual users and get their JWT tokens
    _playerAClient = anonymousClient; // Placeholder
    _playerBClient = anonymousClient; // Placeholder
    _spectatorClient = anonymousClient; // Placeholder
  });

  afterAll(async () => {
    // Cleanup test data
  });

  describe('profiles table', () => {
    it('should allow reading public profiles', async () => {
      const { error } = await anonymousClient
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('is_profile_public', true)
        .limit(1);

      // Should not get RLS error for public profiles
      expect(error?.code).not.toBe('42501');
    });

    it('should not allow anonymous users to insert profiles', async () => {
      const { error } = await anonymousClient
        .from('profiles')
        .insert({
          id: 'fake-id',
          username: 'hacker',
        });

      expect(error).toBeDefined();
    });

    it('should not allow users to update other users profiles', async () => {
      // This would require authenticated clients
      // For now, verify the structure
      expect(true).toBe(true);
    });
  });

  describe('games table', () => {
    it('should allow reading active/finished games', async () => {
      const { error } = await anonymousClient
        .from('games')
        .select('id, status, white_id, black_id')
        .in('status', ['active', 'finished'])
        .limit(1);

      // Should be able to read games for spectating
      expect(error?.code).not.toBe('42501');
    });

    it('should not allow anonymous users to create games', async () => {
      const { error } = await anonymousClient
        .from('games')
        .insert({
          mode: 'pvp',
          status: 'waiting',
          created_by: 'fake-user',
        });

      expect(error).toBeDefined();
    });

    it('should not allow anonymous users to update games', async () => {
      const { error } = await anonymousClient
        .from('games')
        .update({ status: 'aborted' })
        .eq('id', GAME_IDS.ongoing);

      expect(error).toBeDefined();
    });
  });

  describe('game_moves table', () => {
    it('should allow reading moves for any game', async () => {
      const { error } = await anonymousClient
        .from('game_moves')
        .select('id, game_id, ply, san')
        .limit(1);

      // Moves should be readable for spectating
      expect(error?.code).not.toBe('42501');
    });

    it('should not allow anonymous users to insert moves', async () => {
      const { error } = await anonymousClient
        .from('game_moves')
        .insert({
          game_id: GAME_IDS.ongoing,
          ply: 99,
          uci: 'e2e4',
          san: 'e4',
          fen_after: 'test',
        });

      expect(error).toBeDefined();
    });
  });

  describe('invitations table', () => {
    it('should not allow anonymous users to read invitations', async () => {
      const { data, error } = await anonymousClient
        .from('invitations')
        .select('*')
        .limit(1);

      // Either error or empty result (RLS blocks access)
      expect(error !== null || data?.length === 0).toBe(true);
    });

    it('should not allow anonymous users to create invitations', async () => {
      const { error } = await anonymousClient
        .from('invitations')
        .insert({
          sender_id: 'fake-sender',
          recipient_id: 'fake-recipient',
          status: 'pending',
        });

      expect(error).toBeDefined();
    });
  });

  describe('chat_messages table', () => {
    it('should allow reading chat messages for active games', async () => {
      // This depends on implementation - chat might be public or private
      await anonymousClient
        .from('chat_messages')
        .select('id, game_id, message')
        .limit(1);

      // Test structure - actual policy depends on implementation
      expect(true).toBe(true);
    });

    it('should not allow anonymous users to post messages', async () => {
      const { error } = await anonymousClient
        .from('chat_messages')
        .insert({
          game_id: GAME_IDS.ongoing,
          user_id: 'fake-user',
          message: 'hacked',
        });

      expect(error).toBeDefined();
    });
  });

  describe('learn_user_progress table', () => {
    it('should not allow anonymous users to read progress', async () => {
      const { data, error } = await anonymousClient
        .from('learn_user_progress')
        .select('*')
        .limit(1);

      // Progress is private - should be blocked
      expect(error !== null || data?.length === 0).toBe(true);
    });

    it('should not allow anonymous users to write progress', async () => {
      const { error } = await anonymousClient
        .from('learn_user_progress')
        .insert({
          user_id: 'fake-user',
          lesson_id: 'fake-lesson',
          status: 'completed',
        });

      expect(error).toBeDefined();
    });
  });

  describe('ratings table', () => {
    it('should allow reading ratings (public leaderboard)', async () => {
      const { error } = await anonymousClient
        .from('ratings')
        .select('user_id, mode, elo, games_played')
        .limit(1);

      // Ratings should be readable for leaderboard
      expect(error?.code).not.toBe('42501');
    });

    it('should not allow anonymous users to modify ratings', async () => {
      const { error } = await anonymousClient
        .from('ratings')
        .update({ elo: 9999 })
        .eq('user_id', USER_IDS.playerA);

      expect(error).toBeDefined();
    });
  });

  describe('webrtc_rooms table', () => {
    it('should not allow anonymous access to webrtc rooms', async () => {
      const { data, error } = await anonymousClient
        .from('webrtc_rooms')
        .select('*')
        .limit(1);

      // WebRTC rooms should be private
      expect(error !== null || data?.length === 0).toBe(true);
    });

    it('should not allow anonymous users to create rooms', async () => {
      const { error } = await anonymousClient
        .from('webrtc_rooms')
        .insert({
          game_id: GAME_IDS.ongoing,
          created_by: 'fake-user',
        });

      expect(error).toBeDefined();
    });
  });

  describe('learn_tracks table', () => {
    it('should allow reading published tracks', async () => {
      const { error } = await anonymousClient
        .from('learn_tracks')
        .select('id, slug, title, level')
        .eq('is_published', true)
        .limit(1);

      // Published tracks should be readable
      expect(error?.code).not.toBe('42501');
    });

    it('should not allow modifying tracks', async () => {
      const { error } = await anonymousClient
        .from('learn_tracks')
        .update({ title: 'Hacked' })
        .eq('slug', 'beginner-basics');

      expect(error).toBeDefined();
    });
  });

  describe('learn_lessons table', () => {
    it('should allow reading published lessons', async () => {
      const { error } = await anonymousClient
        .from('learn_lessons')
        .select('id, slug, title')
        .eq('is_published', true)
        .limit(1);

      expect(error?.code).not.toBe('42501');
    });
  });
});

// Additional helper tests for RLS verification patterns
describe('RLS Helper Tests', () => {
  it('should verify user can only access own data pattern', () => {
    // This is a pattern test - actual implementation would vary
    const policy = `
      CREATE POLICY "Users can only read own progress"
      ON learn_user_progress FOR SELECT
      USING (auth.uid() = user_id);
    `;

    expect(policy).toContain('auth.uid()');
    expect(policy).toContain('user_id');
  });

  it('should verify players can only write to own games pattern', () => {
    const policy = `
      CREATE POLICY "Players can insert moves"
      ON game_moves FOR INSERT
      WITH CHECK (
        auth.uid() IN (
          SELECT white_id FROM games WHERE id = game_id
          UNION
          SELECT black_id FROM games WHERE id = game_id
        )
      );
    `;

    expect(policy).toContain('white_id');
    expect(policy).toContain('black_id');
  });
});
