#!/usr/bin/env python3
import os
import sys
import time
from typing import Any

import requests


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATHS = [os.path.join(ROOT, "backend", ".env"), os.path.join(ROOT, ".env")]
NOTION_VERSION = "2022-06-28"
CONTENT_DATABASE_ID = os.getenv(
    "CONTENT_DATABASE_ID",
    "345ac14411dc8077bfbcd6a39506d1d0",
)
FEATURED_ORDER_VALUE = "1"


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


def plain_text(prop: dict[str, Any]) -> str:
    prop_type = prop.get("type")
    if prop_type == "title":
        items = prop.get("title", [])
    elif prop_type == "rich_text":
        items = prop.get("rich_text", [])
    else:
        return ""

    return "".join(item.get("plain_text", "") for item in items).strip()


def checkbox_value(prop: dict[str, Any]) -> bool:
    return bool(prop.get("checkbox", False)) if prop.get("type") == "checkbox" else False


def rich_text_prop(value: str) -> dict[str, Any]:
    value = value.strip()
    return {"rich_text": [{"text": {"content": value}}]} if value else {"rich_text": []}


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


def main() -> int:
    load_env()
    updated = 0

    for page in fetch_content_pages():
        properties = page.get("properties", {})
        is_featured = checkbox_value(properties.get("인기글", {}))
        current_order = plain_text(properties.get("Order", {}))
        desired_order = FEATURED_ORDER_VALUE if is_featured else ""

        if current_order == desired_order:
            continue

        notion_request(
            "PATCH",
            f"/pages/{page['id']}",
            {"properties": {"Order": rich_text_prop(desired_order)}},
        )
        updated += 1
        time.sleep(0.25)

    print(f"Synchronized Order bridge for {updated} page(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
