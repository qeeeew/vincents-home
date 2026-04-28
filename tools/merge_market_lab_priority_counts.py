from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

from pypdf import PdfReader


ROOT = Path("/Users/iyulha/Desktop/Vincent's Home")
DEFAULT_DATA_FILE = ROOT / "market-lab-data.js"
DEFAULT_PDF = Path("/Users/iyulha/Desktop/sh 청년매입임대주택 자료/2025-1차 경쟁률.pdf")

LINE_RE = re.compile(
    r"^(?P<prefix>.+?)\s+(?P<rank>일반[123]순위|소계)\s+(?P<supply>\d+)\s+(?P<applicants>\d+)\s+(?P<ratio>\d+(?:\.\d+)?)$"
)
PREFIX_RE = re.compile(
    r"^(?P<kind>신규공급|재공급)\s+(?P<district>\S+)\s+<(?P=kind)>\s+\S+\s+\[(?P<housing_name>[^\]]+)\]\s*(?P<descriptor>(?:\([^)]+\)|-)*)\s*-\s+"
)


def round_half_up(value: float, digits: int = 1) -> float:
    quant = "0." + ("0" * (digits - 1)) + "1"
    return float(Decimal(str(value)).quantize(Decimal(quant), rounding=ROUND_HALF_UP))


def load_records(data_file: Path) -> list[dict]:
    text = data_file.read_text(encoding="utf-8").strip()
    payload = text.split("=", 1)[1].strip()
    if payload.endswith(";"):
        payload = payload[:-1]
    return json.loads(payload)


def save_records(data_file: Path, records: list[dict]) -> None:
    serialized = json.dumps(records, ensure_ascii=False, separators=(",", ":"))
    data_file.write_text(f"window.marketLabData = {serialized};\n", encoding="utf-8")


def normalize_record_descriptor(record: dict) -> str:
    housing_type = record.get("housingType")
    gender = record.get("gender")

    if gender:
        if not housing_type or housing_type == gender:
            return gender
        if gender in housing_type:
            return housing_type
        return f"{housing_type}({gender})"

    return housing_type or "-"


def normalize_pdf_descriptor(raw_descriptor: str) -> str:
    raw_descriptor = raw_descriptor.strip()
    if not raw_descriptor or raw_descriptor == "-":
        return "-"

    parts = re.findall(r"\(([^)]+)\)", raw_descriptor)
    if not parts:
        return raw_descriptor

    genders = [part for part in parts if part in {"남성", "여성"}]
    non_genders = [part for part in parts if part not in {"남성", "여성"}]

    if non_genders and genders:
        return f"{''.join(non_genders)}({genders[-1]})"
    if genders:
        return genders[-1]
    return "".join(non_genders) or "-"


def record_match_key(record: dict) -> tuple[str, str, str, str, int, int, float]:
    return (
        record["kind"],
        record["district"],
        record["housingName"],
        normalize_record_descriptor(record),
        int(record["supply"]),
        int(record["applicants"]),
        round_half_up(float(record["competitionRatio"]), 1),
    )


def parse_pdf_groups(pdf_path: Path) -> dict[tuple[str, str, str, str, int, int, float], dict]:
    groups_by_base: dict[tuple[str, str, str, str, int], dict] = {}

    reader = PdfReader(str(pdf_path))
    for page in reader.pages:
        for raw_line in (page.extract_text() or "").splitlines():
            line = " ".join(raw_line.split())
            if not line or "일반" not in line and "소계" not in line:
                continue

            line_match = LINE_RE.match(line)
            if not line_match:
                continue

            prefix = line_match.group("prefix")
            prefix_match = PREFIX_RE.match(prefix)
            if not prefix_match:
                continue

            kind = prefix_match.group("kind")
            district = prefix_match.group("district")
            housing_name = prefix_match.group("housing_name")
            descriptor = normalize_pdf_descriptor(prefix_match.group("descriptor") or "")
            supply = int(line_match.group("supply"))
            applicants = int(line_match.group("applicants"))
            ratio = round_half_up(float(line_match.group("ratio")), 1)
            rank = line_match.group("rank")

            base_key = (kind, district, housing_name, descriptor, supply)
            entry = groups_by_base.setdefault(
                base_key,
                {
                    "rank1Applicants": 0,
                    "rank2Applicants": 0,
                    "rank3Applicants": 0,
                    "applicants": None,
                    "competitionRatio": None,
                },
            )

            if rank == "일반1순위":
                entry["rank1Applicants"] = applicants
            elif rank == "일반2순위":
                entry["rank2Applicants"] = applicants
            elif rank == "일반3순위":
                entry["rank3Applicants"] = applicants
            elif rank == "소계":
                entry["applicants"] = applicants
                entry["competitionRatio"] = ratio

    final_groups: dict[tuple[str, str, str, str, int, int, float], dict] = {}
    for base_key, entry in groups_by_base.items():
        if entry["applicants"] is None or entry["competitionRatio"] is None:
            raise ValueError(f"Missing subtotal row in PDF for {base_key}")

        full_key = base_key + (entry["applicants"], entry["competitionRatio"])
        final_groups[full_key] = entry

    return final_groups


def verify_source_keys(records: list[dict], pdf_groups: dict) -> None:
    record_keys = [record_match_key(record) for record in records]
    duplicates = [key for key, count in Counter(record_keys).items() if count > 1]
    if duplicates:
        raise ValueError(f"Duplicate record keys found in data file: {duplicates[:5]}")

    missing = [key for key in record_keys if key not in pdf_groups]
    extras = [key for key in pdf_groups if key not in set(record_keys)]

    if missing:
        raise ValueError(f"PDF rows missing for {len(missing)} records. First: {missing[0]}")
    if extras:
        raise ValueError(f"Extra PDF groups not matched to records: {extras[:5]}")


def merge_counts(records: list[dict], pdf_groups: dict) -> tuple[list[dict], int]:
    updated = []
    touched = 0

    for record in records:
        key = record_match_key(record)
        counts = pdf_groups[key]

        rank1 = int(counts["rank1Applicants"])
        rank2 = int(counts["rank2Applicants"])
        rank3 = int(counts["rank3Applicants"])

        if rank1 + rank2 + rank3 != int(record["applicants"]):
            raise ValueError(
                "Priority applicant totals do not match subtotal "
                f"for {key}: {rank1} + {rank2} + {rank3} != {record['applicants']}"
            )

        next_record = dict(record)
        next_record["rank1Applicants"] = rank1
        next_record["rank2Applicants"] = rank2
        next_record["rank3Applicants"] = rank3
        updated.append(next_record)

        if (
            record.get("rank1Applicants") != rank1
            or record.get("rank2Applicants") != rank2
            or record.get("rank3Applicants") != rank3
        ):
            touched += 1

    return updated, touched


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Merge 1/2/3 priority applicant counts into market lab data.")
    parser.add_argument("--data-file", type=Path, default=DEFAULT_DATA_FILE)
    parser.add_argument("--pdf", type=Path, default=DEFAULT_PDF)
    parser.add_argument("--check-only", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    records = load_records(args.data_file)
    pdf_groups = parse_pdf_groups(args.pdf)
    verify_source_keys(records, pdf_groups)
    updated_records, touched = merge_counts(records, pdf_groups)

    if not args.check_only:
        save_records(args.data_file, updated_records)

    print(
        json.dumps(
            {
                "records": len(records),
                "pdf_groups": len(pdf_groups),
                "updated_records": touched,
                "data_file": str(args.data_file),
                "pdf": str(args.pdf),
                "check_only": args.check_only,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
