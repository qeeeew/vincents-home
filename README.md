# Vincent's Home

Homepage project.

## Current flow

- Intake source of truth: `업데이트 전` Notion DB
- Editorial source of truth: `고민 콘텐츠 관리` Notion DB
- Public archive/site reads from the editorial DB through `backend/main.py`
- `backend/main.py` can now switch between `Notion` and `Supabase` with `CONTENT_PROVIDER=notion|supabase`

## Safe editorial rule

- Write and publish in `고민 콘텐츠 관리`
- `Vincent Insight` and `Published` in the editorial DB should not be overwritten by the source sync anymore
- Matching between source rows and editorial rows now prefers `Submission ID`

## Scripts

- `tools/import_tally_to_update_before.py`
  - Imports the Tally CSV into the source DB (`업데이트 전`)
- `tools/fill_concern_filtered.py`
  - Normalizes source rows and creates or updates editorial rows
  - Existing editorial rows keep manual `Vincent Insight` and `Published` values
- `tools/upsert_content_from_csv.py`
  - Excel-friendly path for updating `고민 콘텐츠 관리` from a CSV export
  - Dry run: `python3 tools/upsert_content_from_csv.py tools/consulting_content_template.csv`
  - Apply: `python3 tools/upsert_content_from_csv.py <your_csv_path> --apply`
- `tools/migrate_notion_content_to_supabase.py`
  - One-time migration from `고민 콘텐츠 관리` Notion DB into Supabase `posts`
  - Needs `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in `backend/.env`
  - Run: `python3 tools/migrate_notion_content_to_supabase.py`

## Tally webhook

- Active form URL: `https://tally.so/r/RGZkZJ`
- Vercel endpoint: `/api/tally-webhook`
- File: [api/tally-webhook.js](/Users/iyulha/Desktop/Vincent's%20Home/api/tally-webhook.js)
- Required Vercel env vars:
  - `SUPABASE_URL`
  - `SUPABASE_SECRET_KEY`
- Behavior:
  - Receives a Tally `FORM_RESPONSE` webhook
  - Inserts directly into `tally_submissions`
  - Maps only these fields: `제목`, `인스타 아이디`, `현재상태`, `나이`, `성별`, `진로고민유형`, `학벌`, `학과`, `학점`, `객관적 영어 점수`, `객관적 수학 점수`, `현재재정상태`, `고민`, `vincent 에게 하고 싶은 말`
  - Sets `received_at` from the Tally submission timestamp when available, otherwise from the webhook receive time

## Archive ordering

- 상담 아카이브 is ordered by `Received Date` descending
- The newest received timestamp should appear at the top first
- When `CONTENT_PROVIDER=supabase`, the same API routes keep working and read from Supabase instead of Notion
