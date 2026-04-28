insert into public.market_lab_rounds (
  round_key,
  round_label,
  notice_date
)
values
  ('2024-2', '2024년 2차', '2024-12-26')
on conflict (round_key) do update
set
  round_label = excluded.round_label,
  notice_date = excluded.notice_date,
  updated_at = now();
