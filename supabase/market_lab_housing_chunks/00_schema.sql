create extension if not exists pgcrypto;

create table if not exists public.market_lab_rounds (
  round_key text primary key,
  round_label text not null,
  notice_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.market_lab_housing_records (
  record_key text primary key,
  round_key text not null references public.market_lab_rounds (round_key) on delete cascade,
  kind text not null,
  district text not null,
  housing_name text not null,
  housing_type text,
  gender text,
  address text not null,
  supply integer not null check (supply > 0),
  applicants integer not null check (applicants >= 0),
  rank1_applicants integer not null default 0 check (rank1_applicants >= 0),
  rank2_applicants integer not null default 0 check (rank2_applicants >= 0),
  rank3_applicants integer not null default 0 check (rank3_applicants >= 0),
  competition_ratio numeric(10, 1) not null check (competition_ratio >= 0),
  winning_rank text not null,
  winning_score integer not null check (winning_score >= 0),
  reserve_rank text,
  reserve_score integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists market_lab_housing_records_round_key_idx
on public.market_lab_housing_records (round_key);

create index if not exists market_lab_housing_records_district_idx
on public.market_lab_housing_records (district);

create index if not exists market_lab_housing_records_round_district_idx
on public.market_lab_housing_records (round_key, district);

alter table public.market_lab_housing_records
add column if not exists rank1_applicants integer not null default 0 check (rank1_applicants >= 0);

alter table public.market_lab_housing_records
add column if not exists rank2_applicants integer not null default 0 check (rank2_applicants >= 0);

alter table public.market_lab_housing_records
add column if not exists rank3_applicants integer not null default 0 check (rank3_applicants >= 0);

alter table public.market_lab_rounds enable row level security;
alter table public.market_lab_housing_records enable row level security;

drop policy if exists "Public can read market lab rounds" on public.market_lab_rounds;
create policy "Public can read market lab rounds"
on public.market_lab_rounds
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read market lab housing records" on public.market_lab_housing_records;
create policy "Public can read market lab housing records"
on public.market_lab_housing_records
for select
to anon, authenticated
using (true);

