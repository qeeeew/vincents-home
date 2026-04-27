const crypto = require("crypto");

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || "";

function jsonResponse(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function ensureSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error("Supabase environment variables are missing.");
  }
}

function supabaseHeaders(preferRepresentation = false) {
  ensureSupabase();
  const headers = {
    apikey: SUPABASE_SECRET_KEY,
    Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
  if (preferRepresentation) {
    headers.Prefer = "return=representation";
  }
  return headers;
}

function supabaseApiUrl(path) {
  ensureSupabase();
  return `${SUPABASE_URL}/rest/v1/${path.replace(/^\/+/, "")}`;
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(supabaseApiUrl(path), {
    ...options,
    headers: {
      ...supabaseHeaders(Boolean(options.preferRepresentation)),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`Supabase request failed: ${response.status} ${errorText}`);
    error.statusCode = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return await response.json();
}

function toSortableTimestamp(value) {
  const timestamp = new Date(value || "").getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function syntheticPostBlocks(post) {
  const blocks = [];
  const academicBackground = String(post.academicBackground || "").trim();
  const concern = String(post.concern || "").trim();
  const insight = String(post.insight || "").trim();

  const appendParagraphs = (text) => {
    text
      .split("\n\n")
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .forEach((paragraph) => {
        blocks.push({
          type: "paragraph",
          richText: [{ text: paragraph, href: null, annotations: {} }],
        });
      });
  };

  if (academicBackground) {
    blocks.push({
      type: "heading_2",
      richText: [{ text: "기본 배경", href: null, annotations: {} }],
    });
    appendParagraphs(academicBackground);
  }

  if (concern) {
    blocks.push({
      type: "heading_2",
      richText: [{ text: "고민 내용", href: null, annotations: {} }],
    });
    appendParagraphs(concern);
  }

  if (insight) {
    blocks.push({
      type: "heading_2",
      richText: [{ text: "Vincent's insight", href: null, annotations: {} }],
    });
    appendParagraphs(insight);
  }

  return blocks;
}

function supabasePostResponse(row) {
  return {
    id: row.id || "",
    title: row.title || "",
    category: row.category || "",
    academicBackground: row.academic_background || "",
    concern: row.concern || "",
    insight: row.insight || "",
    featured: Boolean(row.featured),
    receivedDate: row.received_at || "",
    views: Number(row.views || 0),
    created: row.created_at || "",
  };
}

async function fetchSupabasePost(postId) {
  const rows = await supabaseRequest(
    `posts?select=id,title,category,academic_background,concern,insight,featured,received_at,views,created_at,published&id=eq.${encodeURIComponent(postId)}&limit=1`
  );
  if (!Array.isArray(rows) || !rows.length) {
    const error = new Error("Post not found.");
    error.statusCode = 404;
    throw error;
  }
  return rows[0];
}

function cleanText(value, minLength, maxLength, fieldName) {
  const cleaned = String(value || "").trim();
  if (cleaned.length < minLength) {
    const error = new Error(`${fieldName} is too short.`);
    error.statusCode = 400;
    throw error;
  }
  if (cleaned.length > maxLength) {
    const error = new Error(`${fieldName} is too long.`);
    error.statusCode = 400;
    throw error;
  }
  return cleaned;
}

function makePasswordHash(password) {
  cleanText(password, 4, 80, "Password");
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 160000;
  const digest = crypto
    .pbkdf2Sync(password, salt, iterations, 32, "sha256")
    .toString("hex");
  return `pbkdf2_sha256$${iterations}$${salt}$${digest}`;
}

function verifyPassword(password, passwordHash) {
  const parts = String(passwordHash || "").split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") return false;
  const iterations = Number(parts[1]);
  const salt = parts[2];
  const storedDigest = parts[3];
  const digest = crypto
    .pbkdf2Sync(password, salt, iterations, 32, "sha256")
    .toString("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(storedDigest));
}

module.exports = {
  cleanText,
  fetchSupabasePost,
  jsonResponse,
  makePasswordHash,
  supabasePostResponse,
  supabaseRequest,
  syntheticPostBlocks,
  toSortableTimestamp,
  verifyPassword,
};
