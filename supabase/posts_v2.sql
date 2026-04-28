alter table posts
add column if not exists insta_id text not null default '',
add column if not exists gender text not null default '',
add column if not exists age_bucket text not null default '';
