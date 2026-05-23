-- Drop all existing policies and replace with non-recursive versions
drop policy if exists "Planner owns wedding" on weddings;
drop policy if exists "Members can view wedding" on weddings;
drop policy if exists "Anyone can view wedding by invite code" on weddings;
drop policy if exists "Members visible to wedding participants" on wedding_members;
drop policy if exists "Users can join weddings" on wedding_members;
drop policy if exists "Users can update their own membership" on wedding_members;
drop policy if exists "Tasks visible to participants" on tasks;
drop policy if exists "Planner can manage tasks" on tasks;
drop policy if exists "Members can claim tasks" on tasks;
drop policy if exists "Offers visible to participants" on offers;
drop policy if exists "Members can make offers" on offers;
drop policy if exists "Planner can update offer status" on offers;

-- ── WEDDINGS ──────────────────────────────────────────────────
-- Planner has full control
create policy "Planner full access on weddings" on weddings
  for all using (auth.uid() = planner_id);

-- Any signed-in user can read weddings (needed for invite code lookup)
create policy "Auth users can read weddings" on weddings
  for select using (auth.uid() is not null);

-- ── WEDDING_MEMBERS ───────────────────────────────────────────
-- Users can see their own membership row
create policy "Users see own membership" on wedding_members
  for select using (auth.uid() = user_id);

-- Planner can see all members of their wedding (references weddings, not wedding_members — no recursion)
create policy "Planner sees all members" on wedding_members
  for select using (
    exists (
      select 1 from weddings
      where weddings.id = wedding_members.wedding_id
      and weddings.planner_id = auth.uid()
    )
  );

create policy "Users can join weddings" on wedding_members
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own membership" on wedding_members
  for update using (auth.uid() = user_id);

-- ── TASKS ─────────────────────────────────────────────────────
-- Planner can do everything
create policy "Planner manages tasks" on tasks
  for all using (
    exists (
      select 1 from weddings
      where weddings.id = tasks.wedding_id
      and weddings.planner_id = auth.uid()
    )
  );

-- Members can read tasks
create policy "Members can read tasks" on tasks
  for select using (
    exists (
      select 1 from wedding_members
      where wedding_members.wedding_id = tasks.wedding_id
      and wedding_members.user_id = auth.uid()
    )
  );

-- Members can claim (update) tasks
create policy "Members can claim tasks" on tasks
  for update using (
    exists (
      select 1 from wedding_members
      where wedding_members.wedding_id = tasks.wedding_id
      and wedding_members.user_id = auth.uid()
    )
  );

-- ── OFFERS ────────────────────────────────────────────────────
-- Planner can do everything
create policy "Planner manages offers" on offers
  for all using (
    exists (
      select 1 from weddings
      where weddings.id = offers.wedding_id
      and weddings.planner_id = auth.uid()
    )
  );

-- Members can read offers
create policy "Members can read offers" on offers
  for select using (
    exists (
      select 1 from wedding_members
      where wedding_members.wedding_id = offers.wedding_id
      and wedding_members.user_id = auth.uid()
    )
  );

-- Members can submit their own offers
create policy "Members can make offers" on offers
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from wedding_members
      where wedding_members.wedding_id = offers.wedding_id
      and wedding_members.user_id = auth.uid()
    )
  );
