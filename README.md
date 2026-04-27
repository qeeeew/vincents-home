# Vincent's Home

Homepage project.

## Current flow

- Intake source of truth: `업데이트 전` Notion DB
- Editorial source of truth: `고민 콘텐츠 관리` Notion DB
- Public archive/site reads from the editorial DB through `backend/main.py`

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

## Archive ordering

- 상담 아카이브 is ordered by `Received Date` descending
- The newest received timestamp should appear at the top first
