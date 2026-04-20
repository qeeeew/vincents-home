import os
import hashlib
import hmac
import secrets
from datetime import datetime, timezone
from typing import Any

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


load_dotenv()

NOTION_TOKEN = os.getenv("NOTION_TOKEN", "")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID", "")
NOTION_COMMENTS_DATABASE_ID = os.getenv(
    "NOTION_COMMENTS_DATABASE_ID",
    "8a1c87c73ad540ae910ae1ca48f7e06a",
)
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
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"],
)


class CommentCreate(BaseModel):
    nickname: str
    password: str
    content: str


class CommentUpdate(BaseModel):
    password: str
    content: str


class CommentDelete(BaseModel):
    password: str


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


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clean_text(value: str, field_name: str, min_length: int, max_length: int) -> str:
    cleaned = value.strip()
    if len(cleaned) < min_length:
        raise HTTPException(status_code=400, detail=f"{field_name} is too short.")
    if len(cleaned) > max_length:
        raise HTTPException(status_code=400, detail=f"{field_name} is too long.")
    return cleaned


def make_password_hash(password: str) -> str:
    clean_text(password, "Password", 4, 80)
    salt = secrets.token_hex(16)
    iterations = 160_000
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations,
    ).hex()
    return f"pbkdf2_sha256${iterations}${salt}${digest}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations, salt, stored_digest = password_hash.split("$", 3)
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        int(iterations),
    ).hex()
    return hmac.compare_digest(digest, stored_digest)


def plain_rich_text(value: str) -> dict[str, list[dict[str, dict[str, str]]]]:
    return {"rich_text": [{"text": {"content": value}}]}


def plain_title(value: str) -> dict[str, list[dict[str, dict[str, str]]]]:
    return {"title": [{"text": {"content": value}}]}


def comment_summary(content: str) -> str:
    return content[:40] + ("..." if len(content) > 40 else "")


def comment_response(page: dict[str, Any]) -> dict[str, str]:
    properties = page.get("properties", {})
    return {
        "id": page.get("id", ""),
        "nickname": property_text(properties, "Nickname"),
        "content": property_text(properties, "Content"),
        "createdAt": property_date(properties, "Created At") or page.get("created_time", ""),
        "updatedAt": property_date(properties, "Updated At") or "",
    }


def fetch_comment_page(comment_id: str) -> dict[str, Any]:
    response = requests.get(
        f"https://api.notion.com/v1/pages/{comment_id}",
        headers=notion_headers(),
        timeout=12,
    )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()


def ensure_comment_password(comment_id: str, password: str) -> dict[str, Any]:
    page = fetch_comment_page(comment_id)
    properties = page.get("properties", {})

    if property_checkbox(properties, "Deleted"):
        raise HTTPException(status_code=404, detail="Comment not found.")

    password_hash = property_text(properties, "Password Hash")
    if not verify_password(password, password_hash):
        raise HTTPException(status_code=403, detail="Password does not match.")

    return page


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


def fetch_table_rows(block_id: str) -> list[list[list[dict[str, Any]]]]:
    response = requests.get(
        f"https://api.notion.com/v1/blocks/{block_id}/children",
        headers=notion_headers(),
        params={"page_size": 100},
        timeout=12,
    )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    rows: list[list[list[dict[str, Any]]]] = []
    for row in response.json().get("results", []):
        if row.get("type") != "table_row":
            continue
        cells = row.get("table_row", {}).get("cells", [])
        rows.append([rich_text_to_segments(cell) for cell in cells])

    return rows


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
            if block.get("type") == "table":
                table = block.get("table", {})
                blocks.append(
                    {
                        "type": "table",
                        "hasColumnHeader": table.get("has_column_header", False),
                        "hasRowHeader": table.get("has_row_header", False),
                        "rows": fetch_table_rows(block.get("id", "")),
                    }
                )
                continue

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


def query_comments(post_id: str) -> list[dict[str, str]]:
    url = f"https://api.notion.com/v1/databases/{NOTION_COMMENTS_DATABASE_ID}/query"
    payload: dict[str, Any] = {
        "filter": {
            "and": [
                {"property": "Post ID", "rich_text": {"equals": post_id}},
                {"property": "Deleted", "checkbox": {"equals": False}},
            ]
        },
        "sorts": [{"property": "Created At", "direction": "ascending"}],
        "page_size": 100,
    }

    response = requests.post(url, headers=notion_headers(), json=payload, timeout=12)

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return [comment_response(page) for page in response.json().get("results", [])]


def create_comment(post_id: str, payload: CommentCreate) -> dict[str, str]:
    nickname = clean_text(payload.nickname, "Nickname", 1, 20)
    password = clean_text(payload.password, "Password", 4, 80)
    content = clean_text(payload.content, "Content", 1, 800)
    created_at = now_iso()

    response = requests.post(
        "https://api.notion.com/v1/pages",
        headers=notion_headers(),
        json={
            "parent": {"database_id": NOTION_COMMENTS_DATABASE_ID},
            "properties": {
                "Comment": plain_title(comment_summary(content)),
                "Post ID": plain_rich_text(post_id),
                "Nickname": plain_rich_text(nickname),
                "Password Hash": plain_rich_text(make_password_hash(password)),
                "Content": plain_rich_text(content),
                "Deleted": {"checkbox": False},
                "Created At": {"date": {"start": created_at}},
                "Updated At": {"date": {"start": created_at}},
            },
        },
        timeout=12,
    )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return comment_response(response.json())


def update_comment(comment_id: str, payload: CommentUpdate) -> dict[str, str]:
    ensure_comment_password(comment_id, clean_text(payload.password, "Password", 4, 80))
    content = clean_text(payload.content, "Content", 1, 800)
    updated_at = now_iso()

    response = requests.patch(
        f"https://api.notion.com/v1/pages/{comment_id}",
        headers=notion_headers(),
        json={
            "properties": {
                "Comment": plain_title(comment_summary(content)),
                "Content": plain_rich_text(content),
                "Updated At": {"date": {"start": updated_at}},
            }
        },
        timeout=12,
    )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return comment_response(response.json())


def delete_comment(comment_id: str, payload: CommentDelete) -> dict[str, bool]:
    ensure_comment_password(comment_id, clean_text(payload.password, "Password", 4, 80))

    response = requests.patch(
        f"https://api.notion.com/v1/pages/{comment_id}",
        headers=notion_headers(),
        json={
            "properties": {
                "Deleted": {"checkbox": True},
                "Updated At": {"date": {"start": now_iso()}},
            }
        },
        timeout=12,
    )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return {"ok": True}


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


@app.get("/api/consulting-posts/{page_id}/comments")
def consulting_post_comments(page_id: str) -> list[dict[str, str]]:
    return query_comments(page_id)


@app.post("/api/consulting-posts/{page_id}/comments")
def consulting_post_comment_create(page_id: str, payload: CommentCreate) -> dict[str, str]:
    return create_comment(page_id, payload)


@app.patch("/api/comments/{comment_id}")
def consulting_post_comment_update(comment_id: str, payload: CommentUpdate) -> dict[str, str]:
    return update_comment(comment_id, payload)


@app.delete("/api/comments/{comment_id}")
def consulting_post_comment_delete(comment_id: str, payload: CommentDelete) -> dict[str, bool]:
    return delete_comment(comment_id, payload)


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
