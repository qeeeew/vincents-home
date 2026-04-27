#!/usr/bin/env python3
import json
import os
import re
import sys
from argparse import ArgumentParser

import requests


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATHS = [
    os.path.join(ROOT, ".env"),
    os.path.join(ROOT, "backend", ".env"),
]

NOTION_VERSION = "2022-06-28"
DATABASE_ID = os.getenv("TALLY_DATABASE_ID", "347ac14411dc80e8a7c8fabdf532c3df")
CONTENT_DATABASE_ID = os.getenv(
    "CONTENT_DATABASE_ID",
    "345ac14411dc8077bfbcd6a39506d1d0",
)
MAX_FILTERED_LENGTH = 1900
MAX_CONCERN_SUMMARY_LENGTH = 900
CATEGORY_SLUGS = {
    "professional",
    "career",
    "major",
    "direction",
    "certificate",
    "essay",
    "etc",
}
CATEGORY_MAP = {
    "전문직 진로 고민": "professional",
    "취업 준비 고민(금융권/사기업/공기업 등)": "career",
    "취업 준비 고민": "career",
    "대학교/학부/전공 선택": "major",
    "대학/학부/전공 선택": "major",
    "중졸·고졸 이후 진로 방향": "direction",
    "자격증·어학 준비 상담": "certificate",
    "자소서 첨삭(유료) 기타": "essay",
    "자소서 첨삭/기타": "essay",
    "기타(연애상담 및 한탄 등등)": "etc",
    "기타 상담": "etc",
}

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


def date_start_value(prop: dict) -> str:
    if prop.get("type") != "date" or not prop.get("date"):
        return ""
    return prop["date"].get("start", "")


def multi_select_value(prop: dict) -> str:
    if prop.get("type") != "multi_select":
        return ""
    return ", ".join(item.get("name", "") for item in prop.get("multi_select", []))


def select_value(prop: dict) -> str:
    if prop.get("type") != "select" or not prop.get("select"):
        return ""
    return prop["select"].get("name", "")


def checkbox_value(prop: dict) -> bool:
    if prop.get("type") != "checkbox":
        return False
    return bool(prop.get("checkbox", False))


def page_text(properties: dict, name: str) -> str:
    prop = properties.get(name, {})
    if prop.get("type") == "select":
        return select_value(prop)
    if prop.get("type") == "multi_select":
        return multi_select_value(prop)
    if prop.get("type") == "number":
        value = number_value(prop)
        return "" if value is None else str(int(value) if float(value).is_integer() else value)
    return plain_text(prop)


def normalize_category(value: str) -> str:
    value = compact_whitespace(value)
    if value in CATEGORY_SLUGS:
        return value
    return CATEGORY_MAP.get(value, "")


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


def compact_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def clean_paragraphs(text: str) -> str:
    text = (text or "").replace("\r\n", "\n").replace("\r", "\n").strip()
    lines = [compact_whitespace(line) for line in text.split("\n")]
    paragraphs = [line for line in lines if line]
    return "\n\n".join(paragraphs)


def truncate_sentence(text: str, max_length: int) -> str:
    cleaned = compact_whitespace(text)
    if len(cleaned) <= max_length:
        return cleaned
    return cleaned[: max_length - 1].rstrip() + "…"


def truncate_text(text: str, max_length: int) -> str:
    cleaned = (text or "").strip()
    if len(cleaned) <= max_length:
        return cleaned
    return cleaned[: max_length - 1].rstrip() + "…"


def summarize_concern(concern: str, max_length: int = MAX_CONCERN_SUMMARY_LENGTH) -> str:
    cleaned = clean_paragraphs(concern)
    if not cleaned:
        return "미기재"

    sentence_candidates = [
        compact_whitespace(item)
        for item in re.split(r"(?<=[.!?。？！])\s+|\n{2,}", cleaned)
        if item.strip()
    ]
    if not sentence_candidates:
        return truncate_text(cleaned, max_length)

    summary_parts = []
    current_length = 0
    for sentence in sentence_candidates:
        normalized = compact_whitespace(sentence)
        next_length = current_length + len(normalized) + (1 if summary_parts else 0)
        if summary_parts and next_length > max_length:
            break
        summary_parts.append(normalized)
        current_length = next_length
        if current_length >= max_length * 0.72:
            break

    return truncate_text("\n\n".join(summary_parts) or cleaned, max_length)


def build_title(properties: dict) -> str:
    concern = summarize_concern(page_text(properties, "Concern"), 58)
    concern = re.sub(r"^(안녕하세요|안녕하십니까)[,.\\s]*", "", concern).strip()
    concern = concern.strip(" .。")
    return concern or "상담 고민 정리"


def build_extra(properties: dict) -> str:
    items = []

    status = replace_university_line(page_text(properties, "현재 상태(재직 등)"))
    major = page_text(properties, "학과")
    english = page_text(properties, "영어 실력")
    math = page_text(properties, "수학실력")
    grade = grade_bucket(page_text(properties, "학점"))

    if status:
        items.append(f"현재 상태: {status}")
    if major:
        items.append(f"전공: {major}")
    if english:
        items.append(f"영어: {english}")
    if math:
        items.append(f"수학: {math}")
    if grade:
        items.append(f"학점: {grade}")

    return "\n".join(f"- {item}" for item in items) if items else "기타 사항 미기재"


def build_concern_filtered(properties: dict) -> str:
    gender = page_text(properties, "성별") or "미기재"
    age = age_bucket(page_text(properties, "나이"))
    extra = build_extra(properties)
    finance = page_text(properties, "현재 재정상태") or "미기재"
    concern_summary = summarize_concern(page_text(properties, "Concern"))

    filtered = "\n".join(
        [
            f"성별: {gender}",
            f"나이: {age}",
            "",
            "기타 사항:",
            extra,
            "",
            f"재정 상황: {finance}",
            "",
            "고민:",
            concern_summary,
        ]
    )
    return truncate_text(filtered, MAX_FILTERED_LENGTH)


def title_is_empty(page: dict) -> bool:
    return not plain_text(page.get("properties", {}).get("Title", {}))


def concern_filtered_is_empty(page: dict) -> bool:
    return not plain_text(page.get("properties", {}).get("concern_filtered", {}))


def fetch_target_pages() -> list[dict]:
    pages: list[dict] = []
    cursor = None

    while True:
        payload = {
            "page_size": 100,
            "filter": {"property": "concern_filtered", "rich_text": {"is_empty": True}},
        }
        if cursor:
            payload["start_cursor"] = cursor

        data = notion_request("POST", f"/databases/{DATABASE_ID}/query", payload)
        pages.extend(
            page for page in data.get("results", []) if concern_filtered_is_empty(page)
        )

        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")

    return pages


def fetch_all_pages() -> list[dict]:
    pages: list[dict] = []
    cursor = None

    while True:
        payload = {"page_size": 100}
        if cursor:
            payload["start_cursor"] = cursor

        data = notion_request("POST", f"/databases/{DATABASE_ID}/query", payload)
        pages.extend(data.get("results", []))

        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")

    return pages


def fetch_content_pages() -> list[dict]:
    pages: list[dict] = []
    cursor = None

    while True:
        payload = {"page_size": 100}
        if cursor:
            payload["start_cursor"] = cursor

        data = notion_request("POST", f"/databases/{CONTENT_DATABASE_ID}/query", payload)
        pages.extend(data.get("results", []))

        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")

    return pages


def content_page_key(properties: dict) -> tuple[str, str]:
    return (
        plain_text(properties.get("Title", {})),
        date_start_value(properties.get("Received Date", {})),
    )


def content_page_submission_id(properties: dict) -> str:
    return plain_text(properties.get("Submission ID", {}))


def existing_content_keys() -> set[tuple[str, str]]:
    return {
        content_page_key(page.get("properties", {}))
        for page in fetch_content_pages()
        if content_page_key(page.get("properties", {}))[0]
    }


def rich_text_prop(value: str) -> dict:
    cleaned = truncate_text(value, 1900)
    if not cleaned:
        return {"rich_text": []}
    return {"rich_text": [{"text": {"content": cleaned}}]}


def title_prop(value: str) -> dict:
    cleaned = truncate_text(value, 1900) or "상담 고민 정리"
    return {"title": [{"text": {"content": cleaned}}]}


def select_prop(value: str) -> dict:
    return {"select": {"name": value}} if value else {"select": None}


def date_prop(value: str) -> dict:
    return {"date": {"start": value}} if value else {"date": None}


def category_update(properties: dict) -> dict:
    category = normalize_category(page_text(properties, "Category"))
    if not category:
        return {}
    return {"Category": {"select": {"name": category}}}


def source_page_updates(properties: dict) -> dict:
    title = build_title(properties)
    filtered = build_concern_filtered(properties)
    current_title = page_text(properties, "Title")
    current_filtered = page_text(properties, "concern_filtered")
    next_properties = {}

    if title != current_title:
        next_properties["Title"] = title_prop(title)
    if filtered != current_filtered:
        next_properties["concern_filtered"] = rich_text_prop(filtered)
    next_properties.update(category_update(properties))

    return next_properties


def update_page(page: dict) -> bool:
    properties = page.get("properties", {})
    next_properties = source_page_updates(properties)
    if not next_properties:
        return False

    notion_request(
        "PATCH",
        f"/pages/{page['id']}",
        {"properties": next_properties},
    )
    return True


def content_sync_properties(properties: dict) -> dict:
    filtered = build_concern_filtered(properties)
    title = build_title(properties)
    category = normalize_category(page_text(properties, "Category"))
    received_date = date_start_value(properties.get("Received Date", {}))
    submission_id = page_text(properties, "Submission ID")
    next_properties = {
        "Title": title_prop(title),
        "Concern": rich_text_prop(filtered),
        "Vincent Insight": rich_text_prop(page_text(properties, "Vincent Insight")),
        "Order": rich_text_prop(page_text(properties, "Order")),
        "Published": {"checkbox": checkbox_value(properties.get("Published", {}))},
        "Submission ID": rich_text_prop(submission_id),
    }

    next_properties["Category"] = select_prop(category)
    next_properties["Received Date"] = date_prop(received_date)

    return next_properties


def build_content_indexes(
    pages: list[dict],
) -> tuple[dict[str, dict], dict[str, list[dict]], dict[str, list[dict]]]:
    by_submission_id: dict[str, dict] = {}
    by_received_date: dict[str, list[dict]] = {}
    by_title: dict[str, list[dict]] = {}

    for page in pages:
        properties = page.get("properties", {})
        submission_id = content_page_submission_id(properties)
        received_date = date_start_value(properties.get("Received Date", {}))
        title = plain_text(properties.get("Title", {}))

        if submission_id:
            by_submission_id[submission_id] = page
        if received_date:
            by_received_date.setdefault(received_date, []).append(page)
        if title:
            by_title.setdefault(title, []).append(page)

    return by_submission_id, by_received_date, by_title


def find_matching_content_page(
    source_properties: dict,
    by_submission_id: dict[str, dict],
    by_received_date: dict[str, list[dict]],
    by_title: dict[str, list[dict]],
) -> dict | None:
    submission_id = page_text(source_properties, "Submission ID")
    received_date = date_start_value(source_properties.get("Received Date", {}))
    title = build_title(source_properties)

    if submission_id and submission_id in by_submission_id:
        return by_submission_id[submission_id]

    date_matches = by_received_date.get(received_date, []) if received_date else []
    if len(date_matches) == 1:
        return date_matches[0]
    if title and date_matches:
        for page in date_matches:
            current_title = plain_text(page.get("properties", {}).get("Title", {}))
            if current_title == title:
                return page

    title_matches = by_title.get(title, []) if title else []
    if len(title_matches) == 1:
        return title_matches[0]
    if received_date and title_matches:
        for page in title_matches:
            current_date = date_start_value(page.get("properties", {}).get("Received Date", {}))
            if current_date == received_date:
                return page

    return None


def content_page_updates(existing_page: dict, source_properties: dict) -> dict:
    current_properties = existing_page.get("properties", {})
    desired_properties = content_sync_properties(source_properties)
    next_properties = {}

    desired_submission_id = page_text(source_properties, "Submission ID")
    if page_text(current_properties, "Submission ID") != desired_submission_id:
        next_properties["Submission ID"] = desired_properties["Submission ID"]

    desired_title = build_title(source_properties)
    current_title = plain_text(current_properties.get("Title", {}))
    if not current_title:
        next_properties["Title"] = desired_properties["Title"]

    desired_concern = build_concern_filtered(source_properties)
    if plain_text(current_properties.get("Concern", {})) != desired_concern:
        next_properties["Concern"] = desired_properties["Concern"]

    desired_order = page_text(source_properties, "Order")
    current_order = page_text(current_properties, "Order")
    if desired_order and not current_order:
        next_properties["Order"] = desired_properties["Order"]

    desired_category = normalize_category(page_text(source_properties, "Category"))
    if page_text(current_properties, "Category") != desired_category:
        next_properties["Category"] = desired_properties["Category"]

    desired_received_date = date_start_value(source_properties.get("Received Date", {}))
    current_received_date = date_start_value(current_properties.get("Received Date", {}))
    if current_received_date != desired_received_date:
        next_properties["Received Date"] = desired_properties["Received Date"]

    return next_properties


def sync_content_page(
    source_page: dict,
    by_submission_id: dict[str, dict],
    by_received_date: dict[str, list[dict]],
    by_title: dict[str, list[dict]],
) -> str:
    properties = source_page.get("properties", {})
    existing_page = find_matching_content_page(
        properties,
        by_submission_id,
        by_received_date,
        by_title,
    )

    if existing_page:
        next_properties = content_page_updates(existing_page, properties)
        if not next_properties:
            return "unchanged"

        notion_request(
            "PATCH",
            f"/pages/{existing_page['id']}",
            {"properties": next_properties},
        )
        return "updated"

    notion_request(
        "POST",
        "/pages",
        {
            "parent": {"database_id": CONTENT_DATABASE_ID},
            "properties": content_sync_properties(properties)
        },
    )
    return "created"


def normalize_existing_categories() -> int:
    updated = 0
    for page in fetch_all_pages():
        properties = page.get("properties", {})
        current_category = page_text(properties, "Category")
        normalized = normalize_category(current_category)
        if not normalized or normalized == current_category:
            continue

        notion_request(
            "PATCH",
            f"/pages/{page['id']}",
            {"properties": {"Category": {"select": {"name": normalized}}}},
        )
        updated += 1

    return updated


def rewrite_existing_concern_filtered() -> int:
    updated = 0
    for page in fetch_all_pages():
        properties = page.get("properties", {})
        filtered = build_concern_filtered(properties)
        current_filtered = page_text(properties, "concern_filtered")
        next_properties = {}

        if filtered != current_filtered:
            next_properties["concern_filtered"] = {
                "rich_text": [{"text": {"content": filtered}}],
            }
        next_properties.update(category_update(properties))

        if not next_properties:
            continue

        notion_request(
            "PATCH",
            f"/pages/{page['id']}",
            {"properties": next_properties},
        )
        updated += 1

    return updated


def main() -> int:
    parser = ArgumentParser()
    parser.add_argument(
        "--normalize-categories",
        action="store_true",
        help="Normalize every existing Category value to the shared site category slug.",
    )
    parser.add_argument(
        "--rewrite-filtered",
        action="store_true",
        help="Rewrite existing concern_filtered values with the current readable format.",
    )
    args = parser.parse_args()

    load_env()
    if args.normalize_categories:
        updated = normalize_existing_categories()
        print(f"Normalized Category for {updated} row(s).")
        return 0
    if args.rewrite_filtered:
        updated = rewrite_existing_concern_filtered()
        print(f"Rewrote concern_filtered for {updated} row(s).")
        return 0

    pages = fetch_all_pages()
    content_pages = fetch_content_pages()
    by_submission_id, by_received_date, by_title = build_content_indexes(content_pages)
    normalized = normalize_existing_categories()
    updated_source = 0
    created_content = 0
    updated_content = 0

    for page in pages:
        if update_page(page):
            updated_source += 1

        sync_result = sync_content_page(
            page,
            by_submission_id,
            by_received_date,
            by_title,
        )
        if sync_result == "created":
            created_content += 1
        elif sync_result == "updated":
            updated_content += 1

    print(
        "Normalized Category for "
        f"{normalized} row(s). Updated source {updated_source} row(s). "
        f"Synced content {updated_content} update(s), {created_content} create(s)."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
