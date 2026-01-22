-- Create a table for public profiles (accessible by everyone)
create table profiles (
  id uuid references auth.users not null,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  website text,
  mmr int default 1000,

  primary key (id),
  unique(username),
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Matchmaking Queue
create table match_queue (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  join_time timestamp with time zone default now(),
  min_mmr int,
  max_mmr int
);

alter table match_queue enable row level security;

-- Games Table
create table games (
  id uuid primary key default uuid_generate_v4(),
  player_1_id uuid references auth.users,
  player_2_id uuid references auth.users,
  status text default 'waiting', -- waiting, active, finished
  current_turn uuid references auth.users,
  winner_id uuid references auth.users,
  state jsonb, -- Store the full gamestate dump here (cards, hp, etc)
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table games enable row level security;

-- Function to handle new user signup automatically (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
