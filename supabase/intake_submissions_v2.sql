alter table intake_submissions
add column if not exists event_id text not null default '',
add column if not exists tally_form_id text not null default '',
add column if not exists title_raw text not null default '',
add column if not exists insta_id text not null default '',
add column if not exists gender_raw text not null default '',
add column if not exists academic_line_input text not null default '',
add column if not exists major_raw text not null default '',
add column if not exists grade_raw text not null default '',
add column if not exists message_to_vincent_raw text not null default '';

create index if not exists intake_submissions_received_idx
on intake_submissions (received_at desc);

create index if not exists intake_submissions_draft_post_id_idx
on intake_submissions (draft_post_id);
