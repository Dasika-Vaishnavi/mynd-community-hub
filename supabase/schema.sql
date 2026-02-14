-- Run this in your Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  author_karma integer not null default 0,
  title text not null,
  preview text not null,
  flair text not null,
  space text not null,
  upvotes integer not null default 0,
  comments integer not null default 0,
  pet_color text,
  pet_expression text check (pet_expression in ('happy', 'calm', 'sleepy', 'excited'))
);

alter table public.posts enable row level security;

drop policy if exists "Posts are readable by everyone" on public.posts;
create policy "Posts are readable by everyone"
on public.posts
for select
using (true);

drop policy if exists "Authenticated users can insert posts" on public.posts;
create policy "Authenticated users can insert posts"
on public.posts
for insert
to authenticated
with check (auth.uid() = author_id);

drop policy if exists "Users can update their own posts" on public.posts;
create policy "Users can update their own posts"
on public.posts
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);
