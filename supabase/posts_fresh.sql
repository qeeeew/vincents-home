create extension if not exists pgcrypto;

create table if not exists posts_fresh (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  academic_background text not null default '',
  concern text not null default '',
  insight text not null default '',
  received_at timestamptz not null,
  published boolean not null default false,
  featured boolean not null default false,
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  insta_id text not null default '',
  gender text not null default '',
  age_bucket text not null default '',
  message_to_vincent text not null default ''
);

create index if not exists posts_fresh_public_order_idx
on posts_fresh (featured desc, received_at desc, created_at desc);

alter table posts_fresh enable row level security;

drop policy if exists "Public can read published posts_fresh" on posts_fresh;
create policy "Public can read published posts_fresh"
on posts_fresh
for select
to anon, authenticated
using (published = true);
