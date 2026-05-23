-- ============================================================
-- Wedify Database Schema
-- Paste this into Supabase SQL Editor and run it
-- ============================================================

-- Weddings table
create table if not exists weddings (
  id          uuid default gen_random_uuid() primary key,
  created_at  timestamptz default now(),
  planner_id  uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  date        date,
  venue       text,
  description text,
  couple_names text not null,
  invite_code text unique default substr(md5(random()::text), 1, 8) not null
);

-- Wedding members (guests who joined via invite link)
create table if not exists wedding_members (
  id          uuid default gen_random_uuid() primary key,
  created_at  timestamptz default now(),
  wedding_id  uuid references weddings(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete cascade not null,
  display_name text not null,
  rsvp        text default 'pending' check (rsvp in ('yes','no','maybe','pending')),
  unique(wedding_id, user_id)
);

-- Tasks (created by planner, claimed by guests)
create table if not exists tasks (
  id          uuid default gen_random_uuid() primary key,
  created_at  timestamptz default now(),
  wedding_id  uuid references weddings(id) on delete cascade not null,
  created_by  uuid references auth.users(id) on delete set null,
  title       text not null,
  description text,
  category    text default 'other' check (category in ('setup','food','music','photography','decor','transport','accommodation','other')),
  status      text default 'open' check (status in ('open','claimed','done')),
  claimed_by  uuid references auth.users(id) on delete set null,
  claimed_at  timestamptz
);

-- Offers (guests proactively volunteer skills/items)
create table if not exists offers (
  id          uuid default gen_random_uuid() primary key,
  created_at  timestamptz default now(),
  wedding_id  uuid references weddings(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete cascade not null,
  display_name text not null,
  title       text not null,
  description text,
  category    text default 'other' check (category in ('setup','food','music','photography','decor','transport','accommodation','skill','equipment','other')),
  status      text default 'pending' check (status in ('pending','accepted','declined'))
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table weddings enable row level security;
alter table wedding_members enable row level security;
alter table tasks enable row level security;
alter table offers enable row level security;

-- Weddings: planner can do anything; guests can read their own wedding
create policy "Planner owns wedding" on weddings
  for all using (auth.uid() = planner_id);

create policy "Members can view wedding" on weddings
  for select using (
    exists (
      select 1 from wedding_members
      where wedding_members.wedding_id = weddings.id
      and wedding_members.user_id = auth.uid()
    )
  );

-- Allow anyone authenticated to read a wedding by invite_code (for join flow)
create policy "Anyone can view wedding by invite code" on weddings
  for select using (auth.uid() is not null);

-- Wedding members: visible to planner + all members of that wedding
create policy "Members visible to wedding participants" on wedding_members
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from weddings
      where weddings.id = wedding_members.wedding_id
      and weddings.planner_id = auth.uid()
    )
    or exists (
      select 1 from wedding_members wm2
      where wm2.wedding_id = wedding_members.wedding_id
      and wm2.user_id = auth.uid()
    )
  );

create policy "Users can join weddings" on wedding_members
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own membership" on wedding_members
  for update using (auth.uid() = user_id);

-- Tasks: visible to planner + all members; only planner can create; members can claim
create policy "Tasks visible to participants" on tasks
  for select using (
    exists (
      select 1 from weddings
      where weddings.id = tasks.wedding_id
      and (
        weddings.planner_id = auth.uid()
        or exists (
          select 1 from wedding_members
          where wedding_members.wedding_id = tasks.wedding_id
          and wedding_members.user_id = auth.uid()
        )
      )
    )
  );

create policy "Planner can manage tasks" on tasks
  for all using (
    exists (
      select 1 from weddings
      where weddings.id = tasks.wedding_id
      and weddings.planner_id = auth.uid()
    )
  );

create policy "Members can claim tasks" on tasks
  for update using (
    exists (
      select 1 from wedding_members
      where wedding_members.wedding_id = tasks.wedding_id
      and wedding_members.user_id = auth.uid()
    )
  );

-- Offers: visible to planner + all members; members can insert their own
create policy "Offers visible to participants" on offers
  for select using (
    exists (
      select 1 from weddings
      where weddings.id = offers.wedding_id
      and (
        weddings.planner_id = auth.uid()
        or exists (
          select 1 from wedding_members
          where wedding_members.wedding_id = offers.wedding_id
          and wedding_members.user_id = auth.uid()
        )
      )
    )
  );

create policy "Members can make offers" on offers
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from wedding_members
      where wedding_members.wedding_id = offers.wedding_id
      and wedding_members.user_id = auth.uid()
    )
  );

create policy "Planner can update offer status" on offers
  for update using (
    exists (
      select 1 from weddings
      where weddings.id = offers.wedding_id
      and weddings.planner_id = auth.uid()
    )
  );
