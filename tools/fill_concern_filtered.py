#!/usr/bin/env python3
import json
import os
import re
import sys

import requests


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATHS = [
    os.path.join(ROOT, ".env"),
    os.path.join(ROOT, "backend", ".env"),
]

NOTION_VERSION = "2022-06-28"
DATABASE_ID = os.getenv("TALLY_DATABASE_ID", "347ac14411dc80e8a7c8fabdf532c3df")

UNIVERSITY_LINES = {
    "서울대": "SKY",
    "연세대": "SKY",
    "고려대": "SKY",
    "서강대": "서성한",
    "성균관대": "서성한",
    "한양대": "서성한",
    "중앙대": "중경외시",
    "경희대": "중경외시",
    "한국외대": "중경외시",
    "외대": "중경외시",
    "서울시립대": "중경외시",
    "시립대": "중경외시",
    "건국대": "건동홍",
    "동국대": "건동홍",
    "홍익대": "건동홍",
    "국민대": "국숭세단",
    "숭실대": "국숭세단",
    "세종대": "국숭세단",
    "단국대": "국숭세단",
    "광운대": "광명상가",
    "명지대": "광명상가",
    "상명대": "광명상가",
    "가톨릭대": "광명상가",
    "인하대": "인아",
    "아주대": "인아",
    "경기대": "인가경",
    "가천대": "인가경",
    "인천대": "인천대 라인",
    "부산대": "지거국",
    "경북대": "지거국",
    "전남대": "지거국",
    "충남대": "지거국",
    "충북대": "지거국",
    "전북대": "지거국",
    "강원대": "지거국",
    "경상국립대": "지거국",
    "제주대": "지거국",
    "한양여대": "전문대",
}


def load_env() -> None:
    for path in ENV_PATHS:
        if not os.path.exists(path):
            continue

        with open(path, "r", encoding="utf-8") as file:
            for line in file:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                os.environ.setdefault(key, value.strip().strip("'\""))


def notion_request(method: str, path: str, payload: dict | None = None) -> dict:
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
        timeout=20,
    )

    if response.status_code >= 400:
        raise RuntimeError(f"Notion API error {response.status_code}: {response.text}")

    return response.json()


def plain_text(prop: dict) -> str:
    prop_type = prop.get("type")
    if prop_type == "title":
        items = prop.get("title", [])
    elif prop_type == "rich_text":
        items = prop.get("rich_text", [])
    else:
        return ""

    return "".join(item.get("plain_text", "") for item in items).strip()


def number_value(prop: dict) -> float | None:
    if prop.get("type") != "number":
        return None
    return prop.get("number")


def multi_select_value(prop: dict) -> str:
    if prop.get("type") != "multi_select":
        return ""
    return ", ".join(item.get("name", "") for item in prop.get("multi_select", []))


def page_text(properties: dict, name: str) -> str:
    prop = properties.get(name, {})
    if prop.get("type") == "multi_select":
        return multi_select_value(prop)
    if prop.get("type") == "number":
        value = number_value(prop)
        return "" if value is None else str(int(value) if float(value).is_integer() else value)
    return plain_text(prop)


def age_bucket(age: str) -> str:
    if not age:
        return "미기재"

    match = re.search(r"\d+", str(age))
    if not match:
        return str(age)

    value = int(match.group())
    decade = value // 10 * 10
    offset = value % 10

    if offset <= 3:
        part = "초반"
    elif offset <= 6:
        part = "중반"
    else:
        part = "후반"

    return f"{decade}대 {part}"


def grade_bucket(grade: str) -> str:
    if not grade:
        return "학점 미기재"

    match = re.search(r"\d+(?:\.\d+)?", grade)
    if not match:
        return grade

    value = float(match.group())
    if value > 4.2:
        return "고학점"
    if value >= 3.5:
        return "평범한 학점"
    return "낮은 학점"


def replace_university_line(text: str) -> str:
    if not text:
        return ""

    result = text
    for university, line_name in UNIVERSITY_LINES.items():
        result = result.replace(university, f"{line_name} 라인")

    result = re.sub(r"(\S+대학교)", "대학 라인", result)
    result = re.sub(r"(\S+대)(?=\s|$|학년|졸업|재학|편입)", "대학 라인", result)
    return result


def build_extra(properties: dict) -> str:
    items = []

    status = replace_university_line(page_text(properties, "현재 상태(재직 등)"))
    major = page_text(properties, "학과")
    english = page_text(properties, "영어 실력")
    math = page_text(properties, "수학실력")
    grade = grade_bucket(page_text(properties, "학점"))

    if status:
        items.append(status)
    if major:
        items.append(f"전공: {major}")
    if english:
        items.append(f"영어: {english}")
    if math:
        items.append(f"수학: {math}")
    if grade:
        items.append(f"학점: {grade}")

    return ", ".join(items) if items else "기타 사항 미기재"


def build_concern_filtered(properties: dict) -> str:
    gender = page_text(properties, "성별") or "미기재"
    age = age_bucket(page_text(properties, "나이"))
    extra = build_extra(properties)
    finance = page_text(properties, "현재 재정상태") or "미기재"
    concern = page_text(properties, "Concern") or "미기재"

    return "\n".join(
        [
            f"성별: {gender}",
            f"나이: {age}",
            f"기타 사항: {extra}",
            f"재정 상황: {finance}",
            "",
            f"고민: {concern}",
        ]
    )


def title_is_empty(page: dict) -> bool:
    return not plain_text(page.get("properties", {}).get("Title", {}))


def fetch_target_pages() -> list[dict]:
    pages: list[dict] = []
    cursor = None

    while True:
        payload = {
            "page_size": 100,
            "filter": {"property": "Title", "title": {"is_empty": True}},
        }
        if cursor:
            payload["start_cursor"] = cursor

        data = notion_request("POST", f"/databases/{DATABASE_ID}/query", payload)
        pages.extend(page for page in data.get("results", []) if title_is_empty(page))

        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")

    return pages


def update_page(page: dict) -> None:
    filtered = build_concern_filtered(page.get("properties", {}))
    chunks = [filtered[index : index + 1900] for index in range(0, len(filtered), 1900)]
    notion_request(
        "PATCH",
        f"/pages/{page['id']}",
        {
            "properties": {
                "concern_filtered": {
                    "rich_text": [{"text": {"content": chunk}} for chunk in chunks[:10]],
                }
            }
        },
    )


def main() -> int:
    load_env()
    pages = fetch_target_pages()

    for page in pages:
        update_page(page)

    print(f"Updated concern_filtered for {len(pages)} row(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
