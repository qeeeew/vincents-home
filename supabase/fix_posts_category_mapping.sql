create or replace function public.normalize_tally_category(category_raw text)
returns text
language plpgsql
as $$
declare
  value_text text;
begin
  value_text := coalesce(category_raw, '');

  if value_text like '%전문직%' then
    return 'professional';
  end if;

  if value_text like '%취업%' then
    return 'career';
  end if;

  if value_text like '%전공%' or value_text like '%학부%' or value_text like '%편입%' then
    return 'major';
  end if;

  if value_text like '%중졸%' or value_text like '%고졸%' then
    return 'direction';
  end if;

  if value_text like '%자격증%' or value_text like '%어학%' then
    return 'certificate';
  end if;

  if value_text like '%자소서%' then
    return 'essay';
  end if;

  return 'etc';
end;
$$;

update public.posts
set category = public.normalize_tally_category(category)
where category not in (
  'professional',
  'career',
  'major',
  'direction',
  'certificate',
  'essay',
  'etc'
);
