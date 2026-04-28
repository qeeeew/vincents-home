begin;

-- 1) Remove Codex-inserted test rows.
delete from public.tally_submissions
where title in (
  '테스트 제목',
  '테스트 제목 2',
  '재연결 테스트',
  '라벨 테스트'
);

-- 2) Normalize known polluted gender UUID values.
update public.tally_submissions
set gender = '여'
where gender = 'dfec7f79-4cbf-4c94-8d73-d92f91db1d7a';

-- 3) Clear UUID-like garbage that should not remain in text fields.
update public.tally_submissions
set
  gender = case
    when gender ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then ''
    else gender
  end,
  current_status = case
    when current_status ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then ''
    else current_status
  end,
  career_concern_type = case
    when career_concern_type ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then ''
    else career_concern_type
  end,
  academic_background = case
    when academic_background ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then ''
    else academic_background
  end,
  major = case
    when major ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then ''
    else major
  end,
  grade = case
    when grade ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then ''
    else grade
  end,
  english_score = case
    when english_score ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then ''
    else english_score
  end,
  math_score = case
    when math_score ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then ''
    else math_score
  end,
  financial_status = case
    when financial_status ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then ''
    else financial_status
  end,
  concern = case
    when concern ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then ''
    else concern
  end,
  message_to_vincent = case
    when message_to_vincent ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then ''
    else message_to_vincent
  end;

-- 4) Clear object/json-looking residue accidentally stored in text columns.
update public.tally_submissions
set
  gender = case
    when gender ~ '^\s*[\{\[]' then ''
    else gender
  end,
  current_status = case
    when current_status ~ '^\s*[\{\[]' then ''
    else current_status
  end,
  career_concern_type = case
    when career_concern_type ~ '^\s*[\{\[]' then ''
    else career_concern_type
  end,
  academic_background = case
    when academic_background ~ '^\s*[\{\[]' then ''
    else academic_background
  end,
  major = case
    when major ~ '^\s*[\{\[]' then ''
    else major
  end,
  grade = case
    when grade ~ '^\s*[\{\[]' then ''
    else grade
  end,
  english_score = case
    when english_score ~ '^\s*[\{\[]' then ''
    else english_score
  end,
  math_score = case
    when math_score ~ '^\s*[\{\[]' then ''
    else math_score
  end,
  financial_status = case
    when financial_status ~ '^\s*[\{\[]' then ''
    else financial_status
  end,
  concern = case
    when concern ~ '^\s*[\{\[]' then ''
    else concern
  end,
  message_to_vincent = case
    when message_to_vincent ~ '^\s*[\{\[]' then ''
    else message_to_vincent
  end;

commit;
