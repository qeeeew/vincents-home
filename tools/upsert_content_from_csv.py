#!/usr/bin/env python3
import argparse
import csv
import os
import sys
import time
from datetime import datetime
from typing import Any

import requests


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATHS = [os.path.join(ROOT, "backend", ".env"), os.path.join(ROOT, ".env")]
NOTION_VERSION = "2022-06-28"
CONTENT_DATABASE_ID = os.getenv(
    "CONTENT_DATABASE_ID",
    "345ac14411dc8077bfbcd6a39506d1d0",
)


def load_env() -> None:
    for path in ENV_PATHS:
        if not os.path.exists(path):
            continue

        with open(path, encoding="utf-8") as file:
            for line in file:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line or line.startswith(";"):
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


def clean(value: str | None) -> str:
    return (value or "").strip()


def first(row: dict[str, str], *keys: str) -> str:
    for key in keys:
        value = clean(row.get(key))
        if value:
            return value
    return ""


def rich_text_prop(value: str) -> dict[str, Any]:
    value = clean(value)[:1900]
    return {"rich_text": [{"text": {"content": value}}]} if value else {"rich_text": []}


def title_prop(value: str) -> dict[str, Any]:
    value = clean(value)[:1900] or "상담 고민 정리"
    return {"title": [{"text": {"content": value}}]}


def select_prop(value: str) -> dict[str, Any]:
    return {"select": {"name": clean(value)}} if clean(value) else {"select": None}


def checkbox_prop(value: str) -> dict[str, Any]:
    normalized = clean(value).lower()
    return {"checkbox": normalized in {"true", "1", "yes", "y", "published", "배포", "체크"}}


def parse_received_date(value: str) -> str:
    cleaned = clean(value)
    if not cleaned:
        return ""

    for pattern in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(cleaned, pattern).isoformat()
        except ValueError:
            continue

    return cleaned


def date_prop(value: str) -> dict[str, Any]:
    parsed = parse_received_date(value)
    return {"date": {"start": parsed}} if parsed else {"date": None}


def page_text(properties: dict[str, Any], name: str) -> str:
    prop = properties.get(name, {})
    prop_type = prop.get("type")
    if prop_type == "title":
        items = prop.get("title", [])
    elif prop_type == "rich_text":
        items = prop.get("rich_text", [])
    else:
        return ""
    return "".join(item.get("plain_text", "") for item in items).strip()


def date_start_value(properties: dict[str, Any], name: str) -> str:
    prop = properties.get(name, {})
    if prop.get("type") != "date" or not prop.get("date"):
        return ""
    return prop["date"].get("start", "")


def fetch_content_pages() -> list[dict[str, Any]]:
    pages: list[dict[str, Any]] = []
    cursor: str | None = None

    while True:
        payload: dict[str, Any] = {"page_size": 100}
        if cursor:
            payload["start_cursor"] = cursor

        data = notion_request("POST", f"/databases/{CONTENT_DATABASE_ID}/query", payload)
        pages.extend(data.get("results", []))

        if not data.get("has_more"):
            return pages
        cursor = data.get("next_cursor")


def build_indexes(
    pages: list[dict[str, Any]],
) -> tuple[dict[str, dict[str, Any]], dict[tuple[str, str], dict[str, Any]]]:
    by_submission_id: dict[str, dict[str, Any]] = {}
    by_title_and_date: dict[tuple[str, str], dict[str, Any]] = {}

    for page in pages:
        properties = page.get("properties", {})
        submission_id = page_text(properties, "Submission ID")
        title = page_text(properties, "Title")
        received_date = date_start_value(properties, "Received Date")

        if submission_id:
            by_submission_id[submission_id] = page
        if title or received_date:
            by_title_and_date[(title, received_date)] = page

    return by_submission_id, by_title_and_date


def row_properties(row: dict[str, str]) -> dict[str, Any]:
    return {
        "Submission ID": rich_text_prop(first(row, "Submission ID")),
        "Title": title_prop(first(row, "Title")),
        "Category": select_prop(first(row, "Category")),
        "Concern": rich_text_prop(first(row, "Concern")),
        "Vincent Insight": rich_text_prop(first(row, "Vincent Insight", "Insight")),
        "Order": rich_text_prop(first(row, "Order")),
        "인기글": checkbox_prop(first(row, "인기글", "Featured")),
        "Published": checkbox_prop(first(row, "Published")),
        "Received Date": date_prop(first(row, "Received Date")),
    }


def find_existing_page(
    row: dict[str, str],
    by_submission_id: dict[str, dict[str, Any]],
    by_title_and_date: dict[tuple[str, str], dict[str, Any]],
) -> dict[str, Any] | None:
    submission_id = first(row, "Submission ID")
    if submission_id and submission_id in by_submission_id:
        return by_submission_id[submission_id]

    title = first(row, "Title")
    received_date = parse_received_date(first(row, "Received Date"))
    return by_title_and_date.get((title, received_date))


def create_page(properties: dict[str, Any]) -> None:
    notion_request(
        "POST",
        "/pages",
        {
            "parent": {"database_id": CONTENT_DATABASE_ID},
            "properties": properties,
        },
    )


def update_page(page_id: str, properties: dict[str, Any]) -> None:
    notion_request(
        "PATCH",
        f"/pages/{page_id}",
        {"properties": properties},
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("csv_path")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    load_env()
    with open(args.csv_path, newline="", encoding="utf-8-sig") as file:
        rows = list(csv.DictReader(file))

    by_submission_id, by_title_and_date = build_indexes(fetch_content_pages())
    creates = 0
    updates = 0

    for row in rows:
        existing_page = find_existing_page(row, by_submission_id, by_title_and_date)
        if existing_page:
            updates += 1
            print(f"~ update {first(row, 'Submission ID')} {first(row, 'Title')}")
        else:
            creates += 1
            print(f"+ create {first(row, 'Submission ID')} {first(row, 'Title')}")

    print(f"CSV rows: {len(rows)}")
    print(f"Rows to update: {updates}")
    print(f"Rows to create: {creates}")

    if not args.apply:
        return 0

    for index, row in enumerate(rows, start=1):
        properties = row_properties(row)
        existing_page = find_existing_page(row, by_submission_id, by_title_and_date)
        if existing_page:
            update_page(existing_page["id"], properties)
            print(f"Updated {index}/{len(rows)}: {first(row, 'Submission ID')}")
        else:
            create_page(properties)
            print(f"Created {index}/{len(rows)}: {first(row, 'Submission ID')}")
        time.sleep(0.35)

    return 0


if __name__ == "__main__":
    sys.exit(main())
