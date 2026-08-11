-- Lunch Pick menu save counters
-- Run this file once in Supabase Dashboard > SQL Editor.

create table if not exists public.menu_likes (
  menu_id text primary key,
  like_count bigint not null default 0 check (like_count >= 0),
  updated_at timestamptz not null default now(),
  constraint menu_likes_menu_id_length check (char_length(menu_id) between 1 and 80)
);

-- Keep the allowlist up to date when this script is re-run on an existing project.
alter table public.menu_likes drop constraint if exists menu_likes_known_menu;
alter table public.menu_likes add constraint menu_likes_known_menu check (menu_id in (
  'kimchi-jjigae', 'donkatsu', 'jeyuk-bokkeum', 'beef-pho',
  'salmon-poke', 'malatang', 'perilla-soba', 'cheeseburger',
  'sundubu-jjigae', 'shrimp-cream-pasta', 'assorted-sushi', 'dakgalbi-bowl',
  'bibimbap', 'chicken-curry', 'mul-naengmyeon', 'clam-kalguksu',
  'beef-burrito', 'chicken-caesar-salad', 'bulgogi-bowl', 'tteokbokki-set',
  'iced-americano', 'cafe-latte', 'vanilla-latte', 'matcha-latte',
  'grapefruit-ade', 'lemon-tea', 'black-sugar-bubble-tea',
  'strawberry-smoothie', 'yuzu-kombucha', 'rooibos-tea'
));

alter table public.menu_likes enable row level security;

-- Clients cannot read or mutate the table directly. They can only execute the
-- two narrowly-scoped functions granted below.
revoke all on table public.menu_likes from anon, authenticated;

create or replace function public.get_menu_like_counts()
returns table (menu_id text, like_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select likes.menu_id, likes.like_count
  from public.menu_likes as likes;
$$;

create or replace function public.change_menu_like(
  p_menu_id text,
  p_delta integer
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_count bigint;
begin
  if p_menu_id is null or char_length(trim(p_menu_id)) not between 1 and 80 then
    raise exception 'Invalid menu id';
  end if;

  if p_delta not in (-1, 1) then
    raise exception 'Delta must be -1 or 1';
  end if;

  insert into public.menu_likes as likes (menu_id, like_count, updated_at)
  values (trim(p_menu_id), greatest(p_delta, 0), now())
  on conflict (menu_id) do update
  set like_count = greatest(0, likes.like_count + p_delta),
      updated_at = now()
  returning like_count into next_count;

  return next_count;
end;
$$;

revoke execute on function public.get_menu_like_counts() from public;
revoke execute on function public.change_menu_like(text, integer) from public;
grant execute on function public.get_menu_like_counts() to anon, authenticated;
grant execute on function public.change_menu_like(text, integer) to anon, authenticated;
