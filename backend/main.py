import os
import hashlib
import hmac
import secrets
from datetime import datetime, timezone
from time import monotonic
from typing import Any

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


load_dotenv()

CONTENT_PROVIDER = os.getenv("CONTENT_PROVIDER", "").strip().lower()
NOTION_TOKEN = os.getenv("NOTION_TOKEN", "")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID", "")
NOTION_COMMENTS_DATABASE_ID = os.getenv(
    "NOTION_COMMENTS_DATABASE_ID",
    "8a1c87c73ad540ae910ae1ca48f7e06a",
)
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY", "")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]
if "*" not in ALLOWED_ORIGINS and "null" not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append("null")

NOTION_VERSION = "2022-06-28"
POSTS_CACHE_TTL_SECONDS = int(os.getenv("POSTS_CACHE_TTL_SECONDS", "45"))
CONTENT_CACHE_TTL_SECONDS = int(os.getenv("CONTENT_CACHE_TTL_SECONDS", "120"))
COMMENTS_CACHE_TTL_SECONDS = int(os.getenv("COMMENTS_CACHE_TTL_SECONDS", "15"))
CATEGORY_VALUES = {
    "professional",
    "career",
    "major",
    "direction",
    "certificate",
    "essay",
    "etc",
}
cache_store: dict[str, tuple[float, Any]] = {}

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


def supabase_headers(prefer_representation: bool = False) -> dict[str, str]:
    if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="Supabase environment variables are not configured.",
        )

    headers = {
        "apikey": SUPABASE_SECRET_KEY,
        "Authorization": f"Bearer {SUPABASE_SECRET_KEY}",
        "Content-Type": "application/json",
    }
    if prefer_representation:
        headers["Prefer"] = "return=representation"
    return headers


def use_supabase_provider() -> bool:
    if CONTENT_PROVIDER:
        return CONTENT_PROVIDER == "supabase"
    return bool(SUPABASE_URL and SUPABASE_SECRET_KEY)


def supabase_api_url(path: str) -> str:
    return f"{SUPABASE_URL}/rest/v1/{path.lstrip('/')}"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def cache_get(key: str) -> Any | None:
    cached = cache_store.get(key)
    if not cached:
        return None

    expires_at, value = cached
    if expires_at <= monotonic():
        cache_store.pop(key, None)
        return None

    return value


def cache_set(key: str, value: Any, ttl_seconds: int) -> Any:
    cache_store[key] = (monotonic() + max(ttl_seconds, 0), value)
    return value


def cache_delete(key: str) -> None:
    cache_store.pop(key, None)


def cache_clear_prefix(prefix: str) -> None:
    stale_keys = [key for key in cache_store if key.startswith(prefix)]
    for key in stale_keys:
        cache_store.pop(key, None)


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


def fetch_notion_blocks(page_id: str) -> list[dict[str, Any]]:
    cache_key = f"content:{page_id}"
    cached_blocks = cache_get(cache_key)
    if cached_blocks is not None:
        return cached_blocks

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

    return cache_set(cache_key, blocks, CONTENT_CACHE_TTL_SECONDS)


def parse_iso_datetime(value: str | None) -> datetime:
    if not value:
        return datetime.min.replace(tzinfo=timezone.utc)

    normalized = value.replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError:
        return datetime.min.replace(tzinfo=timezone.utc)

    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)

    return parsed.astimezone(timezone.utc)


def text_to_paragraph_blocks(text: str) -> list[dict[str, Any]]:
    blocks: list[dict[str, Any]] = []
    for paragraph in [chunk.strip() for chunk in text.split("\n\n") if chunk.strip()]:
        blocks.append(
            {
                "type": "paragraph",
                "richText": [{"text": paragraph, "href": None, "annotations": {}}],
            }
        )
    return blocks


def synthetic_post_blocks(post: dict[str, Any]) -> list[dict[str, Any]]:
    blocks: list[dict[str, Any]] = []
    academic_background = str(post.get("academicBackground") or "").strip()
    concern = str(post.get("concern") or "").strip()
    insight = str(post.get("insight") or "").strip()

    if academic_background:
        blocks.append(
            {
                "type": "heading_2",
                "richText": [{"text": "기본 배경", "href": None, "annotations": {}}],
            }
        )
        blocks.extend(text_to_paragraph_blocks(academic_background))

    if concern:
        blocks.append(
            {
                "type": "heading_2",
                "richText": [{"text": "고민 내용", "href": None, "annotations": {}}],
            }
        )
        blocks.extend(text_to_paragraph_blocks(concern))

    if insight:
        blocks.append(
            {
                "type": "heading_2",
                "richText": [{"text": "Vincent's insight", "href": None, "annotations": {}}],
            }
        )
        blocks.extend(text_to_paragraph_blocks(insight))

    return blocks


def query_notion_posts(category: str) -> list[dict[str, Any]]:
    cache_key = f"posts:{category}"
    cached_posts = cache_get(cache_key)
    if cached_posts is not None:
        return cached_posts

    url = f"https://api.notion.com/v1/databases/{NOTION_DATABASE_ID}/query"
    payload: dict[str, Any] = {
        "filter": {
            "and": [
                {"property": "Published", "checkbox": {"equals": True}},
                {"property": "Category", "select": {"equals": category}},
            ]
        },
        "sorts": [
            {"property": "Received Date", "direction": "descending"},
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
                "featured": property_checkbox(properties, "인기글"),
                "receivedDate": property_date(properties, "Received Date"),
                "views": property_number(properties, "Views"),
                "created": page.get("created_time"),
            }
        )

    posts.sort(
        key=lambda post: (
            bool(post.get("featured")),
            parse_iso_datetime(post.get("receivedDate")),
            parse_iso_datetime(post.get("created")),
        ),
        reverse=True,
    )
    return cache_set(cache_key, posts, POSTS_CACHE_TTL_SECONDS)


def supabase_post_response(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id", ""),
        "title": row.get("title", "") or "",
        "category": row.get("category", "") or "",
        "academicBackground": row.get("academic_background", "") or "",
        "concern": row.get("concern", "") or "",
        "insight": row.get("insight", "") or "",
        "featured": bool(row.get("featured", False)),
        "receivedDate": row.get("received_at"),
        "views": int(row.get("views") or 0),
        "created": row.get("created_at"),
    }


def query_supabase_posts(category: str) -> list[dict[str, Any]]:
    cache_key = f"posts:{category}"
    cached_posts = cache_get(cache_key)
    if cached_posts is not None:
        return cached_posts

    response = requests.get(
        supabase_api_url("posts"),
        headers=supabase_headers(),
        params={
            "select": "id,title,category,academic_background,concern,insight,featured,received_at,views,created_at",
            "category": f"eq.{category}",
            "published": "is.true",
            "order": "featured.desc,received_at.desc,created_at.desc",
        },
        timeout=12,
    )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    posts = [supabase_post_response(row) for row in response.json()]
    return cache_set(cache_key, posts, POSTS_CACHE_TTL_SECONDS)


def fetch_supabase_post(post_id: str) -> dict[str, Any]:
    response = requests.get(
        supabase_api_url("posts"),
        headers=supabase_headers(),
        params={
            "select": "id,title,category,academic_background,concern,insight,featured,received_at,views,created_at,published",
            "id": f"eq.{post_id}",
            "limit": "1",
        },
        timeout=12,
    )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    rows = response.json()
    if not rows:
        raise HTTPException(status_code=404, detail="Post not found.")
    return rows[0]


def query_posts(category: str) -> list[dict[str, Any]]:
    if use_supabase_provider():
        return query_supabase_posts(category)
    return query_notion_posts(category)


def query_comments(post_id: str) -> list[dict[str, str]]:
    cache_key = f"comments:{post_id}"
    cached_comments = cache_get(cache_key)
    if cached_comments is not None:
        return cached_comments

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

    comments = [comment_response(page) for page in response.json().get("results", [])]
    return cache_set(cache_key, comments, COMMENTS_CACHE_TTL_SECONDS)


def supabase_comment_response(row: dict[str, Any]) -> dict[str, str]:
    return {
        "id": row.get("id", ""),
        "nickname": row.get("nickname", "") or "",
        "content": row.get("content", "") or "",
        "createdAt": row.get("created_at", "") or "",
        "updatedAt": row.get("updated_at", "") or "",
    }


def query_supabase_comments(post_id: str) -> list[dict[str, str]]:
    cache_key = f"comments:{post_id}"
    cached_comments = cache_get(cache_key)
    if cached_comments is not None:
        return cached_comments

    response = requests.get(
        supabase_api_url("comments"),
        headers=supabase_headers(),
        params={
            "select": "id,nickname,content,created_at,updated_at",
            "post_id": f"eq.{post_id}",
            "deleted": "is.false",
            "order": "created_at.asc",
        },
        timeout=12,
    )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    comments = [supabase_comment_response(row) for row in response.json()]
    return cache_set(cache_key, comments, COMMENTS_CACHE_TTL_SECONDS)


def query_all_comments(post_id: str) -> list[dict[str, str]]:
    if use_supabase_provider():
        return query_supabase_comments(post_id)
    return query_comments(post_id)


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

    cache_delete(f"comments:{post_id}")
    return comment_response(response.json())


def create_supabase_comment(post_id: str, payload: CommentCreate) -> dict[str, str]:
    nickname = clean_text(payload.nickname, "Nickname", 1, 20)
    password = clean_text(payload.password, "Password", 4, 80)
    content = clean_text(payload.content, "Content", 1, 800)

    response = requests.post(
        supabase_api_url("comments"),
        headers=supabase_headers(prefer_representation=True),
        json=[
            {
                "post_id": post_id,
                "nickname": nickname,
                "password_hash": make_password_hash(password),
                "content": content,
            }
        ],
        timeout=12,
    )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    cache_delete(f"comments:{post_id}")
    rows = response.json()
    return supabase_comment_response(rows[0]) if rows else {}


def update_comment(comment_id: str, payload: CommentUpdate) -> dict[str, str]:
    page = ensure_comment_password(comment_id, clean_text(payload.password, "Password", 4, 80))
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

    cache_delete(f"comments:{property_text(page.get('properties', {}), 'Post ID')}")
    return comment_response(response.json())


def fetch_supabase_comment(comment_id: str) -> dict[str, Any]:
    response = requests.get(
        supabase_api_url("comments"),
        headers=supabase_headers(),
        params={
            "select": "id,post_id,nickname,content,password_hash,deleted,created_at,updated_at",
            "id": f"eq.{comment_id}",
            "limit": "1",
        },
        timeout=12,
    )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    rows = response.json()
    if not rows or rows[0].get("deleted"):
        raise HTTPException(status_code=404, detail="Comment not found.")
    return rows[0]


def update_supabase_comment(comment_id: str, payload: CommentUpdate) -> dict[str, str]:
    comment = fetch_supabase_comment(comment_id)
    password = clean_text(payload.password, "Password", 4, 80)
    content = clean_text(payload.content, "Content", 1, 800)

    if not verify_password(password, str(comment.get("password_hash", ""))):
        raise HTTPException(status_code=403, detail="Password does not match.")

    response = requests.patch(
        supabase_api_url("comments"),
        headers=supabase_headers(prefer_representation=True),
        params={"id": f"eq.{comment_id}"},
        json={"content": content, "updated_at": now_iso()},
        timeout=12,
    )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    cache_delete(f"comments:{comment.get('post_id', '')}")
    rows = response.json()
    return supabase_comment_response(rows[0]) if rows else {}


def delete_comment(comment_id: str, payload: CommentDelete) -> dict[str, bool]:
    page = ensure_comment_password(comment_id, clean_text(payload.password, "Password", 4, 80))

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

    cache_delete(f"comments:{property_text(page.get('properties', {}), 'Post ID')}")
    return {"ok": True}


def delete_supabase_comment(comment_id: str, payload: CommentDelete) -> dict[str, bool]:
    comment = fetch_supabase_comment(comment_id)
    password = clean_text(payload.password, "Password", 4, 80)

    if not verify_password(password, str(comment.get("password_hash", ""))):
        raise HTTPException(status_code=403, detail="Password does not match.")

    response = requests.patch(
        supabase_api_url("comments"),
        headers=supabase_headers(prefer_representation=True),
        params={"id": f"eq.{comment_id}"},
        json={"deleted": True, "updated_at": now_iso()},
        timeout=12,
    )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    cache_delete(f"comments:{comment.get('post_id', '')}")
    return {"ok": True}


def create_any_comment(post_id: str, payload: CommentCreate) -> dict[str, str]:
    if use_supabase_provider():
        return create_supabase_comment(post_id, payload)
    return create_comment(post_id, payload)


def update_any_comment(comment_id: str, payload: CommentUpdate) -> dict[str, str]:
    if use_supabase_provider():
        return update_supabase_comment(comment_id, payload)
    return update_comment(comment_id, payload)


def delete_any_comment(comment_id: str, payload: CommentDelete) -> dict[str, bool]:
    if use_supabase_provider():
        return delete_supabase_comment(comment_id, payload)
    return delete_comment(comment_id, payload)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/consulting-posts")
def consulting_posts(
    category: str = Query(..., description="Consulting category key"),
) -> list[dict[str, Any]]:
    if category not in CATEGORY_VALUES:
        raise HTTPException(status_code=400, detail="Unknown category.")

    return query_posts(category)


def fetch_post_content(page_id: str) -> dict[str, list[dict[str, Any]]]:
    if use_supabase_provider():
        post = supabase_post_response(fetch_supabase_post(page_id))
        return {"blocks": synthetic_post_blocks(post)}
    return {"blocks": fetch_notion_blocks(page_id)}


@app.get("/api/consulting-posts/{page_id}/content")
def consulting_post_content(page_id: str) -> dict[str, list[dict[str, Any]]]:
    return fetch_post_content(page_id)


@app.get("/api/consulting-posts/{page_id}/comments")
def consulting_post_comments(page_id: str) -> list[dict[str, str]]:
    return query_all_comments(page_id)


@app.post("/api/consulting-posts/{page_id}/comments")
def consulting_post_comment_create(page_id: str, payload: CommentCreate) -> dict[str, str]:
    return create_any_comment(page_id, payload)


@app.patch("/api/comments/{comment_id}")
def consulting_post_comment_update(comment_id: str, payload: CommentUpdate) -> dict[str, str]:
    return update_any_comment(comment_id, payload)


@app.delete("/api/comments/{comment_id}")
def consulting_post_comment_delete(comment_id: str, payload: CommentDelete) -> dict[str, bool]:
    return delete_any_comment(comment_id, payload)


def increment_supabase_post_view(post_id: str) -> dict[str, int]:
    post = fetch_supabase_post(post_id)
    next_views = int(post.get("views") or 0) + 1

    response = requests.patch(
        supabase_api_url("posts"),
        headers=supabase_headers(prefer_representation=True),
        params={"id": f"eq.{post_id}"},
        json={"views": next_views, "updated_at": now_iso()},
        timeout=12,
    )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    cache_clear_prefix("posts:")
    return {"views": next_views}


@app.post("/api/consulting-posts/{page_id}/view")
def increment_post_view(page_id: str) -> dict[str, int]:
    if use_supabase_provider():
        return increment_supabase_post_view(page_id)

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

    cache_clear_prefix("posts:")
    return {"views": next_views}
