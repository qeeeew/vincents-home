#!/usr/bin/env python3
import os
import sys
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

        with open(path, "r", encoding="utf-8") as file:
            for line in file:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                os.environ.setdefault(key, value.strip().strip("'\""))


def notion_headers() -> dict[str, str]:
    token = os.getenv("NOTION_TOKEN")
    if not token:
        raise RuntimeError("NOTION_TOKEN is missing. Add it to backend/.env.")

    return {
        "Authorization": f"Bearer {token}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }


def supabase_headers() -> dict[str, str]:
    key = os.getenv("SUPABASE_SECRET_KEY")
    if not key:
        raise RuntimeError("SUPABASE_SECRET_KEY is missing. Add it to backend/.env.")

    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def supabase_base_url() -> str:
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    if not url:
        raise RuntimeError("SUPABASE_URL is missing. Add it to backend/.env.")
    return f"{url}/rest/v1"


def notion_request(method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    response = requests.request(
        method,
        f"https://api.notion.com/v1{path}",
        headers=notion_headers(),
        json=payload,
        timeout=30,
    )

    if response.status_code >= 400:
        raise RuntimeError(f"Notion API error {response.status_code}: {response.text}")
    return response.json()


def supabase_request(
    method: str,
    path: str,
    *,
    params: dict[str, str] | None = None,
    payload: Any = None,
) -> Any:
    response = requests.request(
        method,
        f"{supabase_base_url()}/{path.lstrip('/')}",
        headers=supabase_headers(),
        params=params,
        json=payload,
        timeout=30,
    )

    if response.status_code >= 400:
        raise RuntimeError(f"Supabase API error {response.status_code}: {response.text}")
    if not response.text:
        return None
    return response.json()


def plain_text(prop: dict[str, Any]) -> str:
    prop_type = prop.get("type")
    if prop_type == "title":
        items = prop.get("title", [])
    elif prop_type == "rich_text":
        items = prop.get("rich_text", [])
    else:
        return ""
    return "".join(item.get("plain_text", "") for item in items).strip()


def select_value(prop: dict[str, Any]) -> str:
    if prop.get("type") != "select" or not prop.get("select"):
        return ""
    return prop["select"].get("name", "")


def checkbox_value(prop: dict[str, Any]) -> bool:
    if prop.get("type") != "checkbox":
        return False
    return bool(prop.get("checkbox", False))


def date_start_value(prop: dict[str, Any]) -> str:
    if prop.get("type") != "date" or not prop.get("date"):
        return ""
    return prop["date"].get("start", "")


def number_value(prop: dict[str, Any]) -> int:
    if prop.get("type") != "number":
        return 0
    value = prop.get("number")
    return int(value) if value is not None else 0


def sanitize_received_at(value: str, fallback: str) -> str:
    cleaned = (value or "").strip()
    if not cleaned:
        return fallback

    normalized = cleaned.replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError:
        return fallback

    if parsed.tzinfo is None:
        return parsed.isoformat()
    return parsed.astimezone().isoformat()


def fetch_notion_content_pages() -> list[dict[str, Any]]:
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


def fetch_existing_supabase_posts() -> dict[tuple[str, str, str], dict[str, Any]]:
    rows = supabase_request(
        "GET",
        "posts",
        params={
            "select": "id,title,category,received_at",
            "limit": "1000",
        },
    ) or []

    index: dict[tuple[str, str, str], dict[str, Any]] = {}
    for row in rows:
        key = (
            str(row.get("title", "")).strip(),
            str(row.get("category", "")).strip(),
            str(row.get("received_at", "")).strip(),
        )
        index[key] = row
    return index


def notion_page_to_post(page: dict[str, Any]) -> dict[str, Any]:
    properties = page.get("properties", {})
    created_time = page.get("created_time", "")
    title = plain_text(properties.get("Title", {}))
    category = select_value(properties.get("Category", {}))
    concern = plain_text(properties.get("Concern", {}))
    insight = plain_text(properties.get("Vincent Insight", {}))
    academic_background = plain_text(properties.get("학벌", {})) or plain_text(properties.get("대학 라인", {}))
    received_at = sanitize_received_at(
        date_start_value(properties.get("Received Date", {})),
        created_time,
    )

    return {
        "title": title or "상담 고민 정리",
        "category": category,
        "academic_background": academic_background,
        "concern": concern,
        "insight": insight,
        "received_at": received_at,
        "published": checkbox_value(properties.get("Published", {})),
        "featured": checkbox_value(properties.get("인기글", {})),
        "views": number_value(properties.get("Views", {})),
    }


def main() -> int:
    load_env()
    notion_pages = fetch_notion_content_pages()
    existing_posts = fetch_existing_supabase_posts()

    creates = 0
    updates = 0

    for page in notion_pages:
        post = notion_page_to_post(page)
        key = (
            post["title"].strip(),
            post["category"].strip(),
            post["received_at"].strip(),
        )
        if key in existing_posts:
            updates += 1
            row_id = existing_posts[key]["id"]
            supabase_request(
                "PATCH",
                "posts",
                params={"id": f"eq.{row_id}"},
                payload=post,
            )
            print(f"~ updated {post['title']}")
        else:
            creates += 1
            supabase_request("POST", "posts", payload=[post])
            print(f"+ created {post['title']}")

    print(f"Notion pages: {len(notion_pages)}")
    print(f"Supabase posts updated: {updates}")
    print(f"Supabase posts created: {creates}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
