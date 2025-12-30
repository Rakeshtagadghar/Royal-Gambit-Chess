-- Migration: PvP in-game video (rtc_rooms), spectators, chat, ongoing games view
-- Safe to run multiple times (idempotent-ish).
-- NOTE: `CREATE POLICY` has no IF NOT EXISTS, so we guard with pg_policies checks.

begin;

-- 1) Add column(s) to existing tables
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'games'
      and column_name = 'spectate_allowed'
  ) then
    alter table public.games
      add column spectate_allowed boolean not null default true;
  end if;
end $$;

-- 2) Create new tables (if missing)
create table if not exists public.game_spectators (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid not null references public.games(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  left_at timestamptz,
  is_active boolean not null default true,
  unique (game_id, user_id)
);

create table if not exists public.game_chat_messages (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid not null references public.games(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  sender_role text not null check (sender_role in ('player', 'spectator')),
  message text not null check (char_length(message) <= 2000),
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- 3) Indexes
create index if not exists idx_games_spectate_allowed_started_at
  on public.games(spectate_allowed, started_at desc);

create index if not exists idx_game_spectators_game_active
  on public.game_spectators(game_id, is_active);

create index if not exists idx_game_spectators_user_active
  on public.game_spectators(user_id, is_active);

create index if not exists idx_game_chat_messages_game_created_at
  on public.game_chat_messages(game_id, created_at desc);

create index if not exists idx_game_chat_messages_sender_created_at
  on public.game_chat_messages(sender_id, created_at desc);

-- 4) Enable RLS
alter table public.game_spectators enable row level security;
alter table public.game_chat_messages enable row level security;

-- 5) Update existing policies to allow spectating reads
do $$
begin
  -- games: broaden existing policy if it exists
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'games'
      and policyname = 'Games are viewable by participants and finished games are public'
  ) then
    execute $pol$
      alter policy "Games are viewable by participants and finished games are public"
      on public.games
      using (
        white_id = auth.uid() OR
        black_id = auth.uid() OR
        created_by = auth.uid() OR
        status = 'finished' OR
        status = 'waiting' OR
        (status = 'active' AND spectate_allowed = TRUE AND mode = 'pvp')
      )
    $pol$;
  end if;

  -- moves: broaden existing policy if it exists
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'moves'
      and policyname = 'Moves are viewable if game is viewable'
  ) then
    execute $pol$
      alter policy "Moves are viewable if game is viewable"
      on public.moves
      using (
        exists (
          select 1 from public.games g
          where g.id = game_id
            and (
              g.white_id = auth.uid() or
              g.black_id = auth.uid() or
              g.status = 'finished' or
              (g.status = 'active' and g.spectate_allowed = TRUE and g.mode = 'pvp')
            )
        )
      )
    $pol$;
  end if;

  -- rtc_rooms: broaden existing policy if it exists
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'rtc_rooms'
      and policyname = 'RTC rooms are viewable by game participants'
  ) then
    execute $pol$
      alter policy "RTC rooms are viewable by game participants"
      on public.rtc_rooms
      using (
        exists (
          select 1 from public.games g
          where g.id = game_id
            and (
              g.white_id = auth.uid() or
              g.black_id = auth.uid() or
              (g.status = 'active' and g.spectate_allowed = TRUE and g.mode = 'pvp')
            )
        )
      )
    $pol$;
  end if;
end $$;

-- 6) New policies: spectators + chat
do $$
begin
  -- game_spectators SELECT
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'game_spectators'
      and policyname = 'Spectators can view for spectatable games or if participant'
  ) then
    execute $pol$
      create policy "Spectators can view for spectatable games or if participant"
      on public.game_spectators for select
      using (
        exists (
          select 1 from public.games g
          where g.id = game_id
            and (
              g.white_id = auth.uid() or
              g.black_id = auth.uid() or
              (g.status = 'active' and g.spectate_allowed = TRUE and g.mode = 'pvp')
            )
        )
      )
    $pol$;
  end if;

  -- game_spectators INSERT
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'game_spectators'
      and policyname = 'Spectators can insert themselves for spectatable active games'
  ) then
    execute $pol$
      create policy "Spectators can insert themselves for spectatable active games"
      on public.game_spectators for insert
      with check (
        auth.uid() = user_id and
        exists (
          select 1 from public.games g
          where g.id = game_id
            and g.status = 'active'
            and g.spectate_allowed = TRUE
            and g.mode = 'pvp'
        )
      )
    $pol$;
  end if;

  -- game_spectators UPDATE
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'game_spectators'
      and policyname = 'Spectators can update their own spectator row'
  ) then
    execute $pol$
      create policy "Spectators can update their own spectator row"
      on public.game_spectators for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id)
    $pol$;
  end if;

  -- chat SELECT
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'game_chat_messages'
      and policyname = 'Chat messages viewable by participants or active spectators'
  ) then
    execute $pol$
      create policy "Chat messages viewable by participants or active spectators"
      on public.game_chat_messages for select
      using (
        exists (
          select 1 from public.games g
          where g.id = game_id
            and (g.white_id = auth.uid() or g.black_id = auth.uid())
        )
        or exists (
          select 1 from public.game_spectators s
          where s.game_id = game_id
            and s.user_id = auth.uid()
            and s.is_active = TRUE
        )
      )
    $pol$;
  end if;

  -- chat INSERT
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'game_chat_messages'
      and policyname = 'Chat messages insertable by participants or active spectators'
  ) then
    execute $pol$
      create policy "Chat messages insertable by participants or active spectators"
      on public.game_chat_messages for insert
      with check (
        sender_id = auth.uid()
        and (
          exists (
            select 1 from public.games g
            where g.id = game_id
              and (g.white_id = auth.uid() or g.black_id = auth.uid())
          )
          or exists (
            select 1 from public.game_spectators s
            where s.game_id = game_id
              and s.user_id = auth.uid()
              and s.is_active = TRUE
          )
        )
      )
    $pol$;
  end if;

  -- chat UPDATE (soft-delete)
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'game_chat_messages'
      and policyname = 'Chat message sender can soft-delete their message'
  ) then
    execute $pol$
      create policy "Chat message sender can soft-delete their message"
      on public.game_chat_messages for update
      using (sender_id = auth.uid())
      with check (sender_id = auth.uid())
    $pol$;
  end if;
end $$;

-- 7) Ongoing games view (spectate entry point)
create or replace view public.ongoing_games_view
with (security_invoker = true)
as
select
  g.id,
  g.game_mode,
  g.status,
  g.started_at,
  g.created_at,
  g.time_control,
  g.white_id,
  g.black_id,
  w.username as white_username,
  w.display_name as white_display_name,
  b.username as black_username,
  b.display_name as black_display_name,
  (select count(*)::int from public.moves m where m.game_id = g.id) as move_count,
  (select count(*)::int from public.game_spectators s where s.game_id = g.id and s.is_active = TRUE) as spectator_count
from public.games g
left join public.profiles w on w.id = g.white_id
left join public.profiles b on b.id = g.black_id
where g.status = 'active'
  and g.mode = 'pvp'
  and g.spectate_allowed = TRUE;

grant select on public.ongoing_games_view to anon, authenticated;

commit;


