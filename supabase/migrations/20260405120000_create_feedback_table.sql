create table if not exists feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  message text not null,
  email text,
  created_at timestamp with time zone default now()
);

alter table feedback enable row level security;

-- Anyone authenticated can insert feedback
create policy "Users can insert feedback"
  on feedback for insert
  to authenticated
  with check (true);

-- Anon users can also submit feedback (no login required)
create policy "Anon can insert feedback"
  on feedback for insert
  to anon
  with check (true);

-- Users can only read their own feedback
create policy "Users can read own feedback"
  on feedback for select
  to authenticated
  using (user_id = auth.uid());
