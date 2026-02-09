-- Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  current_streak int default 0,
  longest_streak int default 0,
  last_completed_date timestamptz,
  streak_shields_count int default 0,
  updated_at timestamptz default now()
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Handle new user signup -> create profile automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, current_streak, longest_streak, streak_shields_count)
  values (new.id, 0, 0, 0);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
