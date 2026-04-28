#!/usr/bin/env python3
import argparse
import csv
import os
import re
import sys
import time
from datetime import datetime
from typing import Any

import requests


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATHS = [os.path.join(ROOT, "backend", ".env"), os.path.join(ROOT, ".env")]
NOTION_VERSION = "2022-06-28"
DATABASE_ID = "347ac14411dc80e8a7c8fabdf532c3df"


def load_env() -> None:
    for path in ENV_PATHS:
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as file:
            for line in file:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                os.environ.setdefault(key, value.strip().strip("'\""))


def notion_request(method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    token = os.getenv("NOTION_TOKEN")
    if not token:
        raise RuntimeError("NOTION_TOKEN is missing. Add it to backend/.env.")

    response = requests.request(
        method,
        f"https://api.notion.com/v1{path}",
        headers={
            "Authorization": f"Bearer {token}",
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"Notion API error {response.status_code}: {response.text}")
    return response.json()


def text_prop(value: str) -> dict[str, Any]:
    value = clean(value)
    return {"rich_text": [{"text": {"content": value}}]} if value else {"rich_text": []}


def title_prop(value: str) -> dict[str, Any]:
    value = clean(value) or "상담 고민 정리"
    return {"title": [{"text": {"content": value[:1900]}}]}


def number_prop(value: str) -> dict[str, Any] | None:
    match = re.search(r"\d+(?:\.\d+)?", value or "")
    if not match:
        return None
    return {"number": float(match.group())}


def clean(value: str | None) -> str:
    return (value or "").strip()


def first(row: dict[str, str], *keys: str) -> str:
    for key in keys:
        value = clean(row.get(key))
        if value:
            return value
    return ""


def compact(value: str) -> str:
    return re.sub(r"\s+", " ", clean(value))


def summarize(value: str, limit: int) -> str:
    value = compact(value)
    if len(value) <= limit:
        return value
    return value[: limit - 1].rstrip() + "…"


def submitted_datetime(value: str) -> str | None:
    value = clean(value)
    if not value:
        return None
    return datetime.strptime(value, "%Y-%m-%d %H:%M:%S").isoformat()


def build_concern(row: dict[str, str]) -> str:
    category = first(row, "진로 고민 유형 선택")
    concern = first(row, "고민: ", "고민   ", "고민 내용", "고민 내용 (2)")
    extra = first(row, "기타 상담 내용 ", "기타 상담 내용  (2)")

    parts = []
    if concern:
        parts.append(concern)
    if extra:
        parts.append(f"기타 상담 내용: {extra}")
    if not parts and category:
        parts.append(category)
    return "\n\n".join(parts)


def age_bucket(age: str) -> str:
    match = re.search(r"\d+", age or "")
    if not match:
        return clean(age) or "미기재"
    value = int(match.group())
    decade = value // 10 * 10
    offset = value % 10
    part = "초반" if offset <= 3 else "중반" if offset <= 6 else "후반"
    return f"{decade}대 {part}"


def build_concern_filtered(row: dict[str, str], concern: str) -> str:
    status = first(row, "현재 상태(학년/고졸/재직 중 등)")
    major = first(row, "학과/복수전공 등 ", "학과/복수전공 등  (2)", "현재 학과/복수전공 등 ")
    grade = first(row, "학점 or 고교 내신  (예시: 4.3/4.5 )")
    english = first(
        row,
        "객관적 영어 점수 (Ex_토익 990)",
        "객관적 영어 점수 (Ex_토익 990) (2)",
        "객관적 영어 점수 (Ex_토익 990) (3)",
        "객관적 영어 점수 (ex_중학교, 고등학교 당시 수준, 없으면 없음으로)",
    )
    math = first(
        row,
        "순객관적 수학 점수(Ex_수능 가형 1등급)",
        "객관적 수학 점수(Ex_수능 가형 1등급)",
        "객관적 수학 점수(Ex_수능 가형 1등급) (2)",
        "객관적 수학 점수(Ex_중학교, 고등학교 당시 수준, 없으면 없음으로)",
    )
    finance = first(
        row,
        "현재 재정 상태(아르바이트, 부모님 용돈 및 여유 자금) ",
        "현재 재정 상태(아르바이트, 부모님 용돈 및 여유 자금)  (2)",
    )
    job1 = first(row, "관심  직무1(금융권/사기업/공기업 등) ")
    job2 = first(row, "관심  직무2(PB/해외영업/금공 등) ")
    certs = first(row, "보유 자격증 (신분사 등 )")

    extra_items = []
    if status:
        extra_items.append(status)
    if major:
        extra_items.append(f"전공: {major}")
    if grade:
        extra_items.append(f"학점/내신: {grade}")
    if english:
        extra_items.append(f"영어: {english}")
    if math:
        extra_items.append(f"수학: {math}")
    if job1:
        extra_items.append(f"관심 직무1: {job1}")
    if job2:
        extra_items.append(f"관심 직무2: {job2}")
    if certs:
        extra_items.append(f"자격증: {certs}")

    return "\n".join(
        [
            f"성별: {first(row, '성별') or '미기재'}",
            f"나이: {age_bucket(first(row, '나이'))}",
            f"기타 사항: {', '.join(extra_items) if extra_items else '기타 사항 미기재'}",
            f"재정 상황: {finance or '미기재'}",
            "",
            f"고민: {summarize(concern, 900) or '미기재'}",
        ]
    )[:1900]


def build_properties(row: dict[str, str], create: bool = False) -> dict[str, Any]:
    concern = build_concern(row)
    submitted = submitted_datetime(first(row, "Submitted at"))
    title = summarize(re.sub(r"^(안녕하세요|안녕하십니까)[,.\s]*", "", concern), 58).strip(" .。")

    properties: dict[str, Any] = {
        "Title": title_prop(title),
        "Submission ID": text_prop(first(row, "Submission ID")),
        "insta ID": text_prop(first(row, "인스타 아이디")),
        "현재 상태(재직 등)": text_prop(first(row, "현재 상태(학년/고졸/재직 중 등)")),
        "Category": {"select": {"name": first(row, "진로 고민 유형 선택")}},
        "대학 라인": text_prop(first(row, "대학 라인 or 고졸(ex_서성한, 서울대 등)   ", "대학 라인 or 고졸", "대학 라인 or 고졸 (2)")),
        "학과": text_prop(first(row, "학과/복수전공 등 ", "학과/복수전공 등  (2)", "현재 학과/복수전공 등 ")),
        "학점": text_prop(first(row, "학점 or 고교 내신  (예시: 4.3/4.5 )")),
        "영어 실력": text_prop(
            first(
                row,
                "객관적 영어 점수 (Ex_토익 990)",
                "객관적 영어 점수 (Ex_토익 990) (2)",
                "객관적 영어 점수 (Ex_토익 990) (3)",
                "객관적 영어 점수 (ex_중학교, 고등학교 당시 수준, 없으면 없음으로)",
            )
        ),
        "수학실력": text_prop(
            first(
                row,
                "순객관적 수학 점수(Ex_수능 가형 1등급)",
                "객관적 수학 점수(Ex_수능 가형 1등급)",
                "객관적 수학 점수(Ex_수능 가형 1등급) (2)",
                "객관적 수학 점수(Ex_중학교, 고등학교 당시 수준, 없으면 없음으로)",
            )
        ),
        "현재 재정상태": text_prop(first(row, "현재 재정 상태(아르바이트, 부모님 용돈 및 여유 자금) ", "현재 재정 상태(아르바이트, 부모님 용돈 및 여유 자금)  (2)")),
        "Concern": text_prop(concern[:1900]),
        "concern_filtered": text_prop(build_concern_filtered(row, concern)),
        "Vincent에게 말하고 싶은 것": text_prop(first(row, "Vincent에게 말하고 싶은 것")),
    }

    if create:
        properties["Published"] = {"checkbox": False}
        properties["Views"] = {"number": 0}

    age = number_prop(first(row, "나이"))
    if age:
        properties["나이"] = age

    gender = first(row, "성별")
    if gender:
        properties["성별"] = {"multi_select": [{"name": gender}]}

    if submitted:
        properties["Received Date"] = {"date": {"start": submitted}}

    return properties


def existing_pages_by_submission_id() -> dict[str, str]:
    pages: dict[str, str] = {}
    cursor = None
    while True:
        payload: dict[str, Any] = {"page_size": 100}
        if cursor:
            payload["start_cursor"] = cursor
        data = notion_request("POST", f"/databases/{DATABASE_ID}/query", payload)
        for page in data.get("results", []):
            prop = page.get("properties", {}).get("Submission ID", {})
            text = "".join(item.get("plain_text", "") for item in prop.get("rich_text", []))
            if text:
                pages[text] = page["id"]
        if not data.get("has_more"):
            return pages
        cursor = data.get("next_cursor")


def create_page(row: dict[str, str]) -> None:
    notion_request(
        "POST",
        "/pages",
        {"parent": {"database_id": DATABASE_ID}, "properties": build_properties(row, create=True)},
    )


def update_page(page_id: str, row: dict[str, str]) -> None:
    notion_request(
        "PATCH",
        f"/pages/{page_id}",
        {"properties": build_properties(row)},
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("csv_path")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    load_env()
    with open(args.csv_path, newline="", encoding="utf-8-sig") as file:
        rows = list(csv.DictReader(file))

    existing = existing_pages_by_submission_id()
    update_rows = [row for row in rows if first(row, "Submission ID") in existing]
    new_rows = [row for row in rows if first(row, "Submission ID") not in existing]
    print(f"CSV rows: {len(rows)}")
    print(f"Existing Submission IDs in Notion: {len(existing)}")
    print(f"Rows to update: {len(update_rows)}")
    print(f"Rows to create: {len(new_rows)}")

    if not args.apply:
        for row in update_rows[:10]:
            print(f"~ update {first(row, 'Submitted at')} {first(row, 'Submission ID')} {first(row, '인스타 아이디')} {first(row, '진로 고민 유형 선택')}")
        for row in new_rows[:10]:
            print(f"+ create {first(row, 'Submitted at')} {first(row, 'Submission ID')} {first(row, '인스타 아이디')} {first(row, '진로 고민 유형 선택')}")
        return 0

    for index, row in enumerate(update_rows, start=1):
        update_page(existing[first(row, "Submission ID")], row)
        print(f"Updated {index}/{len(update_rows)}: {first(row, 'Submission ID')}")
        time.sleep(0.35)

    for index, row in enumerate(new_rows, start=1):
        create_page(row)
        print(f"Created {index}/{len(new_rows)}: {first(row, 'Submission ID')}")
        time.sleep(0.35)

    return 0


if __name__ == "__main__":
    sys.exit(main())
