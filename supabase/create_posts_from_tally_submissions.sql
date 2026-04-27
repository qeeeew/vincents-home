create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  category text not null default '',
  academic_background text not null default '',
  concern text not null default '',
  insight text not null default '',
  received_at timestamptz not null,
  published boolean not null default false,
  featured boolean not null default false,
  views integer not null default 0,
  insta_id text not null default '',
  gender text not null default '',
  age_bucket text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts
add column if not exists tally_submission_id uuid unique;

create index if not exists posts_received_at_idx
on public.posts (received_at desc);

create index if not exists posts_public_order_idx
on public.posts (featured desc, received_at desc, created_at desc);

create or replace function public.tally_age_bucket(age_raw text)
returns text
language plpgsql
as $$
declare
  age_num integer;
  decade integer;
  tail integer;
begin
  if age_raw is null or regexp_replace(age_raw, '\D', '', 'g') = '' then
    return '';
  end if;

  age_num := cast(regexp_replace(age_raw, '\D', '', 'g') as integer);
  decade := (age_num / 10) * 10;
  tail := age_num % 10;

  if tail <= 6 then
    return decade::text || '대 초중반';
  end if;

  return decade::text || '대 후반';
end;
$$;

create or replace function public.create_post_from_tally_submission()
returns trigger
language plpgsql
as $$
declare
  built_academic_background text;
  built_age_bucket text;
  built_basic_info text;
  built_concern text;
  built_category text;
begin
  built_academic_background := concat_ws(
    ' / ',
    nullif(new.academic_background, ''),
    nullif(new.major, ''),
    nullif(new.grade, '')
  );

  built_age_bucket := public.tally_age_bucket(new.age);

  built_basic_info := concat_ws(
    ' / ',
    case when coalesce(new.math_score, '') <> '' then '수학 ' || new.math_score else null end,
    case when coalesce(new.english_score, '') <> '' then '영어 ' || new.english_score else null end
  );

  built_category := case
    when coalesce(new.career_concern_type, '') like '%전문직%' then 'professional'
    when coalesce(new.career_concern_type, '') like '%취업%' then 'career'
    when coalesce(new.career_concern_type, '') like '%전공%' then 'major'
    when coalesce(new.career_concern_type, '') like '%학부%' then 'major'
    when coalesce(new.career_concern_type, '') like '%중졸%' then 'direction'
    when coalesce(new.career_concern_type, '') like '%고졸%' then 'direction'
    when coalesce(new.career_concern_type, '') like '%자격증%' then 'certificate'
    when coalesce(new.career_concern_type, '') like '%어학%' then 'certificate'
    when coalesce(new.career_concern_type, '') like '%자소서%' then 'essay'
    else 'etc'
  end;

  built_concern := concat_ws(
    E'\n',
    '학력/배경: ' || coalesce(new.academic_background, ''),
    '나이대: ' || coalesce(built_age_bucket, ''),
    '성별: ' || coalesce(new.gender, ''),
    '재정상태: ' || coalesce(new.financial_status, ''),
    '기초 정보: ' || coalesce(built_basic_info, ''),
    '질문자의 고민: ' || coalesce(new.concern, '')
  );

  insert into public.posts (
    tally_submission_id,
    title,
    category,
    academic_background,
    concern,
    insight,
    received_at,
    published,
    featured,
    views,
    insta_id,
    gender,
    age_bucket
  )
  values (
    new.id,
    coalesce(new.title, ''),
    built_category,
    coalesce(built_academic_background, ''),
    coalesce(built_concern, ''),
    '',
    new.received_at,
    false,
    false,
    0,
    coalesce(new.instagram_id, ''),
    coalesce(new.gender, ''),
    coalesce(built_age_bucket, '')
  )
  on conflict (tally_submission_id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_create_post_from_tally_submission on public.tally_submissions;

create trigger trg_create_post_from_tally_submission
after insert on public.tally_submissions
for each row
execute function public.create_post_from_tally_submission();
