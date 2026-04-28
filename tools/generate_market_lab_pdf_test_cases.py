import csv
import json
import math
import random
import re
from pathlib import Path

from pypdf import PdfReader


ROOT = Path("/Users/iyulha/Desktop/Vincent's Home")
PDF_PATH = Path("/Users/iyulha/Desktop/sh 청년매입임대주택 자료/2024 1차 경쟁률.pdf")
DATA_JS_PATH = ROOT / "market-lab-data.js"
OUTPUT_PATH = ROOT / "exports" / "market_lab_pdf_2024_1_random_test_results.csv"

BOOTSTRAP_RUNS = 300
RANK_ORDER = {
    "1순위": 1,
    "2순위": 2,
    "3순위": 3,
}
HEADER_PREFIXES = (
    "계 경쟁률",
    "주소지",
    "2024-1차 청년 매입임대주택 입주자모집공고",
    "인터넷 청약신청 경쟁률 공지",
    "구분 성별 공급호수",
    "신청현황",
    "자치구 주택명 주택형",
)


def clamp(value, min_value, max_value):
    return min(max_value, max(min_value, value))


def average(values):
    return sum(values) / len(values) if values else None


def median(values):
    if not values:
        return None
    sorted_values = sorted(values)
    middle = len(sorted_values) // 2
    if len(sorted_values) % 2 == 0:
        return (sorted_values[middle - 1] + sorted_values[middle]) / 2
    return sorted_values[middle]


def percentile(values, ratio):
    if not values:
        return None
    sorted_values = sorted(values)
    index = min(len(sorted_values) - 1, max(0, math.floor((len(sorted_values) - 1) * ratio)))
    return sorted_values[index]


def interval_from_samples(values, low=0.025, high=0.975):
    if not values:
        return None
    return {
        "low": percentile(values, low),
        "high": percentile(values, high),
    }


def capped_mean(values, cap=0.9):
    if not values:
        return 0
    return average([min(value, cap) for value in values]) or 0


def describe_chance(win_rate, reserve_rate):
    if win_rate >= 0.55:
        return "합격권"
    if reserve_rate >= 0.4:
        return "예비권"
    return "탈락권"


def judge_label(win_rate, reserve_rate):
    if win_rate >= 0.55:
        return "합격권"
    if reserve_rate >= 0.4:
        return "예비권"
    return "탈락권"


def load_market_lab_data():
    raw = DATA_JS_PATH.read_text(encoding="utf-8").strip()
    prefix = "window.marketLabData = "
    if not raw.startswith(prefix) or not raw.endswith(";"):
        raise ValueError("market-lab-data.js 형식을 읽을 수 없습니다.")
    return json.loads(raw[len(prefix):-1])


def bootstrap_records(records, rng):
    return [records[rng.randrange(len(records))] for _ in range(len(records))]


def calculate_rank_share_stats(records):
    total_applicants = sum(record.get("applicants", 0) or 0 for record in records)
    if not total_applicants:
        return None
    rank1 = sum(record.get("rank1Applicants", 0) or 0 for record in records)
    rank2 = sum(record.get("rank2Applicants", 0) or 0 for record in records)
    rank3 = sum(record.get("rank3Applicants", 0) or 0 for record in records)
    return {
        "totalApplicants": total_applicants,
        "rank1Share": rank1 / total_applicants,
        "rank2Share": rank2 / total_applicants,
        "rank3Share": rank3 / total_applicants,
    }


def infer_fake_lower_bounds(records):
    fake1_rates = []
    fake2_rates = []
    fake12_rates = []

    for record in records:
        supply = float(record.get("supply") or 0)
        rank1_applicants = float(record.get("rank1Applicants") or 0)
        rank2_applicants = float(record.get("rank2Applicants") or 0)
        winning_rank_order = RANK_ORDER.get(record.get("winningRank"), 99)
        reserve_rank = record.get("reserveRank")
        reserve_rank_order = RANK_ORDER.get(reserve_rank, 99) if reserve_rank else 99

        if supply <= 0:
            continue

        winning_slots = supply
        reserve_slots = supply * 3

        fake1_winning = (
            max(0, rank1_applicants - winning_slots + 1) / rank1_applicants
            if winning_rank_order >= 2 and rank1_applicants > 0
            else 0
        )
        fake1_reserve = (
            max(0, rank1_applicants - reserve_slots + 1) / rank1_applicants
            if reserve_rank_order >= 2 and rank1_applicants > 0
            else 0
        )
        fake1_rates.append(max(fake1_winning, fake1_reserve))

        remaining_winning_after_rank1 = max(0, winning_slots - rank1_applicants)
        remaining_reserve_after_rank1 = max(0, reserve_slots - rank1_applicants)
        fake2_winning = (
            max(0, rank2_applicants - remaining_winning_after_rank1 + 1) / rank2_applicants
            if winning_rank_order >= 3 and rank2_applicants > 0
            else 0
        )
        fake2_reserve = (
            max(0, rank2_applicants - remaining_reserve_after_rank1 + 1) / rank2_applicants
            if reserve_rank_order >= 3 and rank2_applicants > 0
            else 0
        )
        fake2_rates.append(max(fake2_winning, fake2_reserve))

        higher_applicants = rank1_applicants + rank2_applicants
        fake12_winning = (
            max(0, higher_applicants - winning_slots + 1) / higher_applicants
            if winning_rank_order >= 3 and higher_applicants > 0
            else 0
        )
        fake12_reserve = (
            max(0, higher_applicants - reserve_slots + 1) / higher_applicants
            if reserve_rank_order >= 3 and higher_applicants > 0
            else 0
        )
        fake12_rates.append(max(fake12_winning, fake12_reserve))

    fake1_positive = [rate for rate in fake1_rates if rate > 0]
    fake2_positive = [rate for rate in fake2_rates if rate > 0]
    fake12_positive = [rate for rate in fake12_rates if rate > 0]

    return {
        "fake1RawRate": average(fake1_rates) or 0,
        "fake2RawRate": average(fake2_rates) or 0,
        "fake12RawRate": average(fake12_rates) or 0,
        "fake1Rate": capped_mean(fake1_positive, 0.9),
        "fake2Rate": capped_mean(fake2_positive, 0.9),
        "fake12Rate": capped_mean(fake12_positive, 0.9),
        "fake1PositiveShare": average([1 if rate > 0 else 0 for rate in fake1_rates]) or 0,
        "fake2PositiveShare": average([1 if rate > 0 else 0 for rate in fake2_rates]) or 0,
        "fake12PositiveShare": average([1 if rate > 0 else 0 for rate in fake12_rates]) or 0,
    }


def get_ahead_count(rank, rank1_count, rank2_count):
    if rank == "1순위":
        return 0
    if rank == "2순위":
        return rank1_count
    return rank1_count + rank2_count


def calculate_adjusted_rates(filters, base_win_rate, base_reserve_rate, fake_bounds):
    rank = filters["rank"]
    if rank == "1순위":
        fake_exposure = 0
    elif rank == "2순위":
        fake_exposure = fake_bounds["fake1Rate"] * fake_bounds["fake1PositiveShare"]
    else:
        fake_exposure = fake_bounds["fake12Rate"] * max(
            fake_bounds["fake12PositiveShare"], fake_bounds["fake2PositiveShare"]
        )

    win_uplift = (1 - base_win_rate) * fake_exposure * (0.6 if rank == "3순위" else 0.42)
    reserve_uplift = (1 - base_reserve_rate) * fake_exposure * (0.82 if rank == "3순위" else 0.56)

    return {
        "adjustedWinRate": clamp(base_win_rate + win_uplift, 0, 0.995),
        "adjustedReserveRate": clamp(max(base_win_rate + win_uplift, base_reserve_rate + reserve_uplift), 0, 0.999),
    }


def get_rank_aware_score_pools(records, selected_rank_order):
    winning_pool = [
        record.get("winningScore")
        for record in records
        if RANK_ORDER.get(record.get("winningRank"), 99) >= selected_rank_order and isinstance(record.get("winningScore"), (int, float))
    ]
    reserve_pool = [
        record.get("reserveScore")
        for record in records
        if record.get("reserveRank")
        and RANK_ORDER.get(record.get("reserveRank"), 99) >= selected_rank_order
        and isinstance(record.get("reserveScore"), (int, float))
    ]
    return {
        "winningPool": winning_pool,
        "reservePool": reserve_pool if reserve_pool else winning_pool,
    }


def calibrate_score_probability(raw_probability, score, rank):
    score_anchor = clamp(score / 13, 0, 1)
    exponent = 0.42 if rank == "1순위" else 0.5 if rank == "2순위" else 0.58
    anchor_weight = 0.28 if rank == "1순위" else 0.18 if rank == "2순위" else 0.12
    powered_probability = math.pow(clamp(raw_probability, 0, 1), exponent)
    return clamp((powered_probability * (1 - anchor_weight)) + (score_anchor * anchor_weight), 0, 0.999)


def calculate_soft_reach(ahead_count, slots, score_probability, rank):
    if slots <= 0:
        return 0
    overflow = max(0, ahead_count - slots + 1)
    slack = max(1, slots * (1.8 if rank == "1순위" else 1.3 if rank == "2순위" else 1.1))
    pressure = overflow / slack
    score_shield = 0.55 + (score_probability * (1.25 if rank == "1순위" else 0.9 if rank == "2순위" else 0.7))
    reach = 1 / (1 + (pressure / score_shield))
    floor = 0.18 if rank == "1순위" else 0.06 if rank == "2순위" else 0.02
    return clamp(reach, floor, 1)


def calculate_estimate(filters, market_lab_data, seed):
    rng = random.Random(seed)
    bootstrap_runs = []

    for _ in range(BOOTSTRAP_RUNS):
        sampled_records = bootstrap_records(market_lab_data, rng)
        share_stats = calculate_rank_share_stats(sampled_records)
        if not share_stats:
            continue

        selected_rank_order = RANK_ORDER.get(filters["rank"], 3)
        fake_bounds = infer_fake_lower_bounds(sampled_records)
        score_pools = get_rank_aware_score_pools(sampled_records, selected_rank_order)
        rank1_count = filters["applicants"] * share_stats["rank1Share"]
        rank2_count = filters["applicants"] * share_stats["rank2Share"]
        rank3_count = filters["applicants"] * share_stats["rank3Share"]
        effective_rank1 = rank1_count * (1 - fake_bounds["fake1Rate"])
        effective_rank2 = rank2_count * (1 - fake_bounds["fake2Rate"])
        ahead_without_fake = get_ahead_count(filters["rank"], rank1_count, rank2_count)
        winning_slots = filters["supply"]
        reserve_slots = filters["supply"] * 3

        raw_win_score_probability = (
            len([score for score in score_pools["winningPool"] if filters["score"] >= score]) / len(score_pools["winningPool"])
            if score_pools["winningPool"]
            else 0
        )
        raw_reserve_score_probability = (
            len([score for score in score_pools["reservePool"] if filters["score"] >= score]) / len(score_pools["reservePool"])
            if score_pools["reservePool"]
            else 0
        )
        win_score_probability = calibrate_score_probability(raw_win_score_probability, filters["score"], filters["rank"])
        reserve_score_probability = calibrate_score_probability(raw_reserve_score_probability, filters["score"], filters["rank"])
        base_win_reach = calculate_soft_reach(ahead_without_fake, winning_slots, win_score_probability, filters["rank"])
        base_reserve_reach = calculate_soft_reach(ahead_without_fake, reserve_slots, reserve_score_probability, filters["rank"])
        base_win_probability = base_win_reach * win_score_probability
        base_reserve_probability = max(base_win_probability, base_reserve_reach * reserve_score_probability)
        adjusted = calculate_adjusted_rates(filters, base_win_probability, base_reserve_probability, fake_bounds)

        bootstrap_runs.append(
            {
                "shareStats": share_stats,
                "fakeBounds": fake_bounds,
                "baseWinProbability": base_win_probability,
                "baseReserveProbability": base_reserve_probability,
                "adjustedWinProbability": adjusted["adjustedWinRate"],
                "adjustedReserveProbability": adjusted["adjustedReserveRate"],
                "winningMedian": median(
                    [record.get("winningScore") for record in market_lab_data if isinstance(record.get("winningScore"), (int, float))]
                ),
                "reserveMedian": median(
                    [record.get("reserveScore") for record in market_lab_data if isinstance(record.get("reserveScore"), (int, float))]
                ),
                "ratioMedian": median(
                    [record.get("competitionRatio") for record in market_lab_data if isinstance(record.get("competitionRatio"), (int, float))]
                ),
                "adjustedCounts": {
                    "rank1": effective_rank1,
                    "rank2": effective_rank2,
                    "rank3": rank3_count,
                },
            }
        )

    win_samples = [
        run["adjustedWinProbability"] if filters["includeFakeSupport"] else run["baseWinProbability"]
        for run in bootstrap_runs
    ]
    reserve_samples = [
        run["adjustedReserveProbability"] if filters["includeFakeSupport"] else run["baseReserveProbability"]
        for run in bootstrap_runs
    ]
    share1_samples = [run["shareStats"]["rank1Share"] for run in bootstrap_runs]
    share2_samples = [run["shareStats"]["rank2Share"] for run in bootstrap_runs]
    share3_samples = [run["shareStats"]["rank3Share"] for run in bootstrap_runs]

    return {
        "sampleCount": len(market_lab_data),
        "winRate": average(win_samples) or 0,
        "reserveRate": average(reserve_samples) or 0,
        "winInterval": interval_from_samples(win_samples),
        "reserveInterval": interval_from_samples(reserve_samples),
        "rank1Share": average(share1_samples) or 0,
        "rank2Share": average(share2_samples) or 0,
        "rank3Share": average(share3_samples) or 0,
        "winningMedian": bootstrap_runs[0]["winningMedian"] if bootstrap_runs else None,
        "reserveMedian": bootstrap_runs[0]["reserveMedian"] if bootstrap_runs else None,
        "ratioMedian": bootstrap_runs[0]["ratioMedian"] if bootstrap_runs else None,
        "chanceBand": describe_chance(average(win_samples) or 0, average(reserve_samples) or 0),
        "judge": judge_label(average(win_samples) or 0, average(reserve_samples) or 0),
    }


def parse_pdf_rows():
    reader = PdfReader(str(PDF_PATH))
    rows = []
    pattern = re.compile(
        r"^(재공급|신규공급)\s+(\S+)\s+(.+?)\s+(서울특별시.+?)\s+(남성|여성|-)\s+(\d+)\s+(\d+)\s+(\d+(?:\.\d+)?)$"
    )

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        for raw_line in text.splitlines():
            line = raw_line.strip()
            if not line or line.startswith(HEADER_PREFIXES):
                continue
            match = pattern.match(line)
            if not match:
                continue

            kind, district, prefix, address, gender, supply, applicants, ratio = match.groups()
            prefix_tokens = prefix.split()
            housing_type = None
            if prefix_tokens[-1] == "-":
                housing_name = " ".join(prefix_tokens[:-1]).strip()
            elif re.fullmatch(r"\d+[A-Z]", prefix_tokens[-1]):
                housing_type = prefix_tokens[-1]
                housing_name = " ".join(prefix_tokens[:-1]).strip()
            else:
                housing_name = prefix.strip()

            rows.append(
                {
                    "page": page_number,
                    "sourceLine": line,
                    "kind": kind,
                    "district": district,
                    "housingName": housing_name,
                    "housingType": housing_type or "",
                    "address": address,
                    "gender": "" if gender == "-" else gender,
                    "supply": int(supply),
                    "applicants": int(applicants),
                    "competitionRatio": float(ratio),
                }
            )
    return rows


def make_random_cases(row_index, row):
    rng = random.Random(20260428 + row_index)
    cases = []
    for scenario_no in range(1, 4):
        rank = rng.choice(["1순위", "2순위", "3순위"])
        score = rng.randint(3, 13)
        include_fake_support = rng.choice([True, False])
        cases.append(
            {
                "scenarioNo": scenario_no,
                "rank": rank,
                "score": score,
                "applicants": row["applicants"],
                "supply": row["supply"],
                "includeFakeSupport": include_fake_support,
                "seed": (row_index + 1) * 100 + scenario_no,
            }
        )
    return cases


def main():
    market_lab_data = load_market_lab_data()
    pdf_rows = parse_pdf_rows()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    fieldnames = [
        "row_no",
        "page",
        "source_kind",
        "source_district",
        "source_housing_name",
        "source_housing_type",
        "source_gender",
        "source_supply",
        "source_applicants",
        "source_competition_ratio",
        "scenario_no",
        "test_rank",
        "test_score",
        "test_expected_applicants",
        "test_supply",
        "test_include_fake_support",
        "chance_band",
        "judge",
        "win_rate",
        "reserve_rate",
        "win_interval_low",
        "win_interval_high",
        "reserve_interval_low",
        "reserve_interval_high",
        "rank1_share_mean",
        "rank2_share_mean",
        "rank3_share_mean",
        "winning_score_median",
        "reserve_score_median",
        "competition_ratio_median",
        "source_line",
    ]

    with OUTPUT_PATH.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()

        for row_index, row in enumerate(pdf_rows, start=1):
            for case in make_random_cases(row_index, row):
                result = calculate_estimate(
                    {
                        "rank": case["rank"],
                        "score": case["score"],
                        "applicants": case["applicants"],
                        "supply": case["supply"],
                        "includeFakeSupport": case["includeFakeSupport"],
                    },
                    market_lab_data,
                    case["seed"],
                )
                writer.writerow(
                    {
                        "row_no": row_index,
                        "page": row["page"],
                        "source_kind": row["kind"],
                        "source_district": row["district"],
                        "source_housing_name": row["housingName"],
                        "source_housing_type": row["housingType"],
                        "source_gender": row["gender"],
                        "source_supply": row["supply"],
                        "source_applicants": row["applicants"],
                        "source_competition_ratio": row["competitionRatio"],
                        "scenario_no": case["scenarioNo"],
                        "test_rank": case["rank"],
                        "test_score": case["score"],
                        "test_expected_applicants": case["applicants"],
                        "test_supply": case["supply"],
                        "test_include_fake_support": "Y" if case["includeFakeSupport"] else "N",
                        "chance_band": result["chanceBand"],
                        "judge": result["judge"],
                        "win_rate": round(result["winRate"], 6),
                        "reserve_rate": round(result["reserveRate"], 6),
                        "win_interval_low": round(result["winInterval"]["low"], 6) if result["winInterval"] else "",
                        "win_interval_high": round(result["winInterval"]["high"], 6) if result["winInterval"] else "",
                        "reserve_interval_low": round(result["reserveInterval"]["low"], 6) if result["reserveInterval"] else "",
                        "reserve_interval_high": round(result["reserveInterval"]["high"], 6) if result["reserveInterval"] else "",
                        "rank1_share_mean": round(result["rank1Share"], 6),
                        "rank2_share_mean": round(result["rank2Share"], 6),
                        "rank3_share_mean": round(result["rank3Share"], 6),
                        "winning_score_median": result["winningMedian"],
                        "reserve_score_median": result["reserveMedian"],
                        "competition_ratio_median": result["ratioMedian"],
                        "source_line": row["sourceLine"],
                    }
                )

    print(f"rows={len(pdf_rows)}")
    print(f"scenarios={len(pdf_rows) * 3}")
    print(f"output={OUTPUT_PATH}")


if __name__ == "__main__":
    main()
