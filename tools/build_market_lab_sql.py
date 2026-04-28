from __future__ import annotations

import argparse
import json
from collections import Counter
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path


ROOT = Path("/Users/iyulha/Desktop/Vincent's Home")
DATA_FILE = ROOT / "market-lab-data.js"
OUTPUT_SQL = ROOT / "supabase" / "market_lab_housing.sql"
CHUNK_DIR = ROOT / "supabase" / "market_lab_housing_chunks"


SCHEMA_SQL = """create extension if not exists pgcrypto;

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
"""


def load_records() -> list[dict]:
    text = DATA_FILE.read_text(encoding="utf-8").strip()
    payload = text.split("=", 1)[1].strip()
    if payload.endswith(";"):
        payload = payload[:-1]
    return json.loads(payload)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build market lab SQL from market-lab-data.js")
    parser.add_argument("--round-key", help="Optional round key filter, e.g. 2024-2")
    parser.add_argument("--output", type=Path, help="Optional output SQL file path")
    parser.add_argument("--chunk-dir", type=Path, help="Optional output chunk directory path")
    return parser.parse_args()


def sql_literal(value) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    text = str(value).replace("'", "''")
    return f"'{text}'"


def record_key(record: dict) -> str:
    return "|".join([
        record["roundKey"],
        record["kind"],
        record["district"],
        record["housingName"],
        record.get("housingType") or "",
        record.get("gender") or "",
        record["address"],
    ])


def round_half_up(value: float, digits: int = 1) -> float:
    quant = "0." + ("0" * (digits - 1)) + "1"
    return float(Decimal(str(value)).quantize(Decimal(quant), rounding=ROUND_HALF_UP))


def verify_records(records: list[dict]) -> None:
    keys = [record_key(record) for record in records]
    duplicate_keys = [key for key, count in Counter(keys).items() if count > 1]
    if duplicate_keys:
        raise ValueError(f"Duplicate record keys found: {duplicate_keys[:5]}")

    bad_ratios = []
    for record in records:
        expected = round_half_up(record["applicants"] / record["supply"], 1)
        actual = round_half_up(float(record["competitionRatio"]), 1)
        if expected != actual:
            bad_ratios.append((record_key(record), expected, actual))

    if bad_ratios:
        raise ValueError(f"Competition ratio mismatches found: {bad_ratios[:5]}")

    bad_priority_totals = []
    for record in records:
        rank1 = int(record.get("rank1Applicants") or 0)
        rank2 = int(record.get("rank2Applicants") or 0)
        rank3 = int(record.get("rank3Applicants") or 0)
        if rank1 + rank2 + rank3 != int(record["applicants"]):
            bad_priority_totals.append((record_key(record), rank1, rank2, rank3, record["applicants"]))

    if bad_priority_totals:
        raise ValueError(f"Priority applicant totals mismatched: {bad_priority_totals[:5]}")


def build_round_rows(records: list[dict]) -> list[tuple[str, str, str]]:
    rounds: dict[str, tuple[str, str, str]] = {}
    for record in records:
        rounds[record["roundKey"]] = (
            record["roundKey"],
            record["roundLabel"],
            record["noticeDate"],
        )
    return sorted(rounds.values(), key=lambda item: item[2], reverse=True)


def build_sql(records: list[dict]) -> str:
    rounds = build_round_rows(records)

    round_values = ",\n".join(
        f"  ({sql_literal(round_key)}, {sql_literal(round_label)}, {sql_literal(notice_date)})"
        for round_key, round_label, notice_date in rounds
    )

    record_values = ",\n".join(
        "  ("
        + ", ".join([
            sql_literal(record_key(record)),
            sql_literal(record["roundKey"]),
            sql_literal(record["kind"]),
            sql_literal(record["district"]),
            sql_literal(record["housingName"]),
            sql_literal(record.get("housingType")),
            sql_literal(record.get("gender")),
            sql_literal(record["address"]),
            sql_literal(record["supply"]),
            sql_literal(record["applicants"]),
            sql_literal(int(record.get("rank1Applicants") or 0)),
            sql_literal(int(record.get("rank2Applicants") or 0)),
            sql_literal(int(record.get("rank3Applicants") or 0)),
            sql_literal(round_half_up(float(record["competitionRatio"]), 1)),
            sql_literal(record["winningRank"]),
            sql_literal(record["winningScore"]),
            sql_literal(record.get("reserveRank")),
            sql_literal(record.get("reserveScore")),
        ])
        + ")"
        for record in records
    )

    return f"""{SCHEMA_SQL}

insert into public.market_lab_rounds (
  round_key,
  round_label,
  notice_date
)
values
{round_values}
on conflict (round_key) do update
set
  round_label = excluded.round_label,
  notice_date = excluded.notice_date,
  updated_at = now();

insert into public.market_lab_housing_records (
  record_key,
  round_key,
  kind,
  district,
  housing_name,
  housing_type,
  gender,
  address,
  supply,
  applicants,
  rank1_applicants,
  rank2_applicants,
  rank3_applicants,
  competition_ratio,
  winning_rank,
  winning_score,
  reserve_rank,
  reserve_score
)
values
{record_values}
on conflict (record_key) do update
set
  round_key = excluded.round_key,
  kind = excluded.kind,
  district = excluded.district,
  housing_name = excluded.housing_name,
  housing_type = excluded.housing_type,
  gender = excluded.gender,
  address = excluded.address,
  supply = excluded.supply,
  applicants = excluded.applicants,
  rank1_applicants = excluded.rank1_applicants,
  rank2_applicants = excluded.rank2_applicants,
  rank3_applicants = excluded.rank3_applicants,
  competition_ratio = excluded.competition_ratio,
  winning_rank = excluded.winning_rank,
  winning_score = excluded.winning_score,
  reserve_rank = excluded.reserve_rank,
  reserve_score = excluded.reserve_score,
  updated_at = now();
"""


def chunked(items: list[dict], size: int) -> list[list[dict]]:
    return [items[index:index + size] for index in range(0, len(items), size)]


def build_round_sql(records: list[dict]) -> str:
    rounds = build_round_rows(records)
    round_values = ",\n".join(
        f"  ({sql_literal(round_key)}, {sql_literal(round_label)}, {sql_literal(notice_date)})"
        for round_key, round_label, notice_date in rounds
    )
    return f"""insert into public.market_lab_rounds (
  round_key,
  round_label,
  notice_date
)
values
{round_values}
on conflict (round_key) do update
set
  round_label = excluded.round_label,
  notice_date = excluded.notice_date,
  updated_at = now();
"""


def build_record_chunk_sql(records: list[dict]) -> str:
    record_values = ",\n".join(
        "  ("
        + ", ".join([
            sql_literal(record_key(record)),
            sql_literal(record["roundKey"]),
            sql_literal(record["kind"]),
            sql_literal(record["district"]),
            sql_literal(record["housingName"]),
            sql_literal(record.get("housingType")),
            sql_literal(record.get("gender")),
            sql_literal(record["address"]),
            sql_literal(record["supply"]),
            sql_literal(record["applicants"]),
            sql_literal(int(record.get("rank1Applicants") or 0)),
            sql_literal(int(record.get("rank2Applicants") or 0)),
            sql_literal(int(record.get("rank3Applicants") or 0)),
            sql_literal(round_half_up(float(record["competitionRatio"]), 1)),
            sql_literal(record["winningRank"]),
            sql_literal(record["winningScore"]),
            sql_literal(record.get("reserveRank")),
            sql_literal(record.get("reserveScore")),
        ])
        + ")"
        for record in records
    )
    return f"""insert into public.market_lab_housing_records (
  record_key,
  round_key,
  kind,
  district,
  housing_name,
  housing_type,
  gender,
  address,
  supply,
  applicants,
  rank1_applicants,
  rank2_applicants,
  rank3_applicants,
  competition_ratio,
  winning_rank,
  winning_score,
  reserve_rank,
  reserve_score
)
values
{record_values}
on conflict (record_key) do update
set
  round_key = excluded.round_key,
  kind = excluded.kind,
  district = excluded.district,
  housing_name = excluded.housing_name,
  housing_type = excluded.housing_type,
  gender = excluded.gender,
  address = excluded.address,
  supply = excluded.supply,
  applicants = excluded.applicants,
  rank1_applicants = excluded.rank1_applicants,
  rank2_applicants = excluded.rank2_applicants,
  rank3_applicants = excluded.rank3_applicants,
  competition_ratio = excluded.competition_ratio,
  winning_rank = excluded.winning_rank,
  winning_score = excluded.winning_score,
  reserve_rank = excluded.reserve_rank,
  reserve_score = excluded.reserve_score,
  updated_at = now();
"""


def main() -> None:
    args = parse_args()
    records = load_records()
    if args.round_key:
        records = [record for record in records if record.get("roundKey") == args.round_key]
        if not records:
            raise ValueError(f"No records found for round_key={args.round_key}")

    output_sql = args.output or OUTPUT_SQL
    chunk_dir = args.chunk_dir or CHUNK_DIR

    verify_records(records)
    output_sql.write_text(build_sql(records), encoding="utf-8")
    chunk_dir.mkdir(parents=True, exist_ok=True)
    (chunk_dir / "00_schema.sql").write_text(SCHEMA_SQL + "\n", encoding="utf-8")
    (chunk_dir / "01_rounds.sql").write_text(build_round_sql(records), encoding="utf-8")
    for index, record_group in enumerate(chunked(records, 25), start=2):
        (chunk_dir / f"{index:02d}_records.sql").write_text(
            build_record_chunk_sql(record_group),
            encoding="utf-8",
        )

    round_counts = Counter(record["roundLabel"] for record in records)
    print("Verified market lab data")
    print(f"records={len(records)}")
    print(f"rounds={len(round_counts)}")
    print(f"round_counts={dict(round_counts)}")
    print(f"output={output_sql}")
    print(f"chunk_dir={chunk_dir}")


if __name__ == "__main__":
    main()
