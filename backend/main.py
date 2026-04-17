import os
from typing import Any

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()

NOTION_TOKEN = os.getenv("NOTION_TOKEN", "")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID", "")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]
if "*" not in ALLOWED_ORIGINS and "null" not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append("null")

NOTION_VERSION = "2022-06-28"
CATEGORY_VALUES = {
    "professional",
    "career",
    "major",
    "direction",
    "certificate",
    "essay",
    "etc",
}

app = FastAPI(title="Vincent's Home API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or ["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def rich_text_to_plain_text(items: list[dict[str, Any]]) -> str:
    return "".join(item.get("plain_text", "") for item in items or []).strip()


def rich_text_to_segments(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    segments = []

    for item in items or []:
        plain_text = item.get("plain_text", "")
        if not plain_text:
            continue

        segments.append(
            {
                "text": plain_text,
                "href": item.get("href"),
                "annotations": item.get("annotations", {}),
            }
        )

    return segments


def title_to_plain_text(items: list[dict[str, Any]]) -> str:
    return "".join(item.get("plain_text", "") for item in items or []).strip()


def property_text(properties: dict[str, Any], name: str) -> str:
    prop = properties.get(name, {})
    prop_type = prop.get("type")

    if prop_type == "title":
        return title_to_plain_text(prop.get("title", []))

    if prop_type == "rich_text":
        return rich_text_to_plain_text(prop.get("rich_text", []))

    return ""


def property_select(properties: dict[str, Any], name: str) -> str:
    prop = properties.get(name, {})
    selected = prop.get("select")
    return selected.get("name", "") if selected else ""


def property_checkbox(properties: dict[str, Any], name: str) -> bool:
    prop = properties.get(name, {})
    return bool(prop.get("checkbox", False))


def property_date(properties: dict[str, Any], name: str) -> str | None:
    prop = properties.get(name, {})
    date_value = prop.get("date")
    if not date_value:
        return None
    return date_value.get("start")


def property_numberish(properties: dict[str, Any], name: str) -> int:
    prop = properties.get(name, {})
    if prop.get("type") == "number":
        value = prop.get("number")
        return int(value) if value is not None else 0

    raw = property_text(properties, name)
    try:
        return int(raw)
    except ValueError:
        return 9999


def property_number(properties: dict[str, Any], name: str) -> int:
    prop = properties.get(name, {})
    if prop.get("type") != "number":
        return 0

    value = prop.get("number")
    return int(value) if value is not None else 0


def notion_headers() -> dict[str, str]:
    if not NOTION_TOKEN or not NOTION_DATABASE_ID:
        raise HTTPException(
            status_code=500,
            detail="Notion environment variables are not configured.",
        )

    return {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }


def block_rich_text(block: dict[str, Any], block_type: str) -> list[dict[str, Any]]:
    return rich_text_to_segments(block.get(block_type, {}).get("rich_text", []))


def block_caption(block: dict[str, Any], block_type: str) -> str:
    return rich_text_to_plain_text(block.get(block_type, {}).get("caption", []))


def notion_image_url(block: dict[str, Any]) -> str:
    image = block.get("image", {})
    image_type = image.get("type")

    if image_type == "external":
        return image.get("external", {}).get("url", "")

    if image_type == "file":
        return image.get("file", {}).get("url", "")

    return ""


def notion_asset_url(asset: dict[str, Any]) -> str:
    asset_type = asset.get("type")

    if asset_type == "external":
        return asset.get("external", {}).get("url", "")

    if asset_type == "file":
        return asset.get("file", {}).get("url", "")

    return ""


def notion_asset_name(asset: dict[str, Any], fallback: str) -> str:
    name = asset.get("name")
    if name:
        return name

    caption = rich_text_to_plain_text(asset.get("caption", []))
    return caption or fallback


def notion_block_to_content(block: dict[str, Any]) -> dict[str, Any] | None:
    block_type = block.get("type")

    if block_type in {
        "paragraph",
        "heading_1",
        "heading_2",
        "heading_3",
        "quote",
        "bulleted_list_item",
        "numbered_list_item",
    }:
        return {
            "type": block_type,
            "richText": block_rich_text(block, block_type),
        }

    if block_type == "divider":
        return {"type": "divider"}

    if block_type == "image":
        image_url = notion_image_url(block)
        if not image_url:
            return None

        return {
            "type": "image",
            "url": image_url,
            "caption": block_caption(block, "image"),
        }

    if block_type in {"file", "pdf"}:
        asset = block.get(block_type, {})
        file_url = notion_asset_url(asset)
        if not file_url:
            return None

        return {
            "type": "file",
            "url": file_url,
            "name": notion_asset_name(asset, "첨부파일"),
            "caption": block_caption(block, block_type),
        }

    return None


def fetch_notion_blocks(page_id: str) -> list[dict[str, Any]]:
    url = f"https://api.notion.com/v1/blocks/{page_id}/children"
    blocks: list[dict[str, Any]] = []
    cursor: str | None = None

    while True:
        params = {"page_size": 100}
        if cursor:
            params["start_cursor"] = cursor

        response = requests.get(
            url,
            headers=notion_headers(),
            params=params,
            timeout=12,
        )

        if response.status_code >= 400:
            raise HTTPException(status_code=response.status_code, detail=response.text)

        payload = response.json()
        for block in payload.get("results", []):
            content_block = notion_block_to_content(block)
            if content_block:
                blocks.append(content_block)

        if not payload.get("has_more"):
            break

        cursor = payload.get("next_cursor")

    return blocks


def query_notion_posts(category: str) -> list[dict[str, Any]]:
    url = f"https://api.notion.com/v1/databases/{NOTION_DATABASE_ID}/query"
    payload: dict[str, Any] = {
        "filter": {
            "and": [
                {"property": "Published", "checkbox": {"equals": True}},
                {"property": "Category", "select": {"equals": category}},
            ]
        },
        "sorts": [
            {"property": "Order", "direction": "ascending"},
            {"timestamp": "created_time", "direction": "descending"},
        ],
        "page_size": 50,
    }

    response = requests.post(url, headers=notion_headers(), json=payload, timeout=12)

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    pages = response.json().get("results", [])
    posts = []

    for page in pages:
        properties = page.get("properties", {})
        posts.append(
            {
                "id": page.get("id"),
                "title": property_text(properties, "Title"),
                "category": property_select(properties, "Category"),
                "concern": property_text(properties, "Concern"),
                "insight": property_text(properties, "Vincent Insight"),
                "receivedDate": property_date(properties, "Received Date"),
                "views": property_number(properties, "Views"),
                "order": property_numberish(properties, "Order"),
                "created": page.get("created_time"),
            }
        )

    return sorted(posts, key=lambda post: post["order"])


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/consulting-posts")
def consulting_posts(
    category: str = Query(..., description="Consulting category key"),
) -> list[dict[str, Any]]:
    if category not in CATEGORY_VALUES:
        raise HTTPException(status_code=400, detail="Unknown category.")

    return query_notion_posts(category)


@app.get("/api/consulting-posts/{page_id}/content")
def consulting_post_content(page_id: str) -> dict[str, list[dict[str, Any]]]:
    return {"blocks": fetch_notion_blocks(page_id)}


@app.post("/api/consulting-posts/{page_id}/view")
def increment_post_view(page_id: str) -> dict[str, int]:
    page_url = f"https://api.notion.com/v1/pages/{page_id}"
    page_response = requests.get(page_url, headers=notion_headers(), timeout=12)

    if page_response.status_code >= 400:
        raise HTTPException(status_code=page_response.status_code, detail=page_response.text)

    properties = page_response.json().get("properties", {})
    next_views = property_number(properties, "Views") + 1

    update_response = requests.patch(
        page_url,
        headers=notion_headers(),
        json={"properties": {"Views": {"number": next_views}}},
        timeout=12,
    )

    if update_response.status_code >= 400:
        raise HTTPException(status_code=update_response.status_code, detail=update_response.text)

    return {"views": next_views}
