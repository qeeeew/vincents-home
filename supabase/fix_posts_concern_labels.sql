update public.posts
set concern = replace(concern, '원문 고민:', '질문자의 고민:')
where concern like '%원문 고민:%';
