const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || "";

function jsonResponse(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function compact(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isUuidLike(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(compact(value));
}

function stringifyFieldValue(value, entry = null) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => stringifyFieldValue(item, entry))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof value === "object") {
    if (typeof value.label === "string") return value.label.trim();
    if (typeof value.name === "string") return value.name.trim();
    if (typeof value.title === "string") return value.title.trim();
    if (typeof value.text === "string") return value.text.trim();
    if (typeof value.value === "object") return stringifyFieldValue(value.value, entry);
    if (typeof value.value === "string" && !isUuidLike(value.value)) return value.value.trim();
    if (typeof value.id === "string" && Array.isArray(entry?.options)) {
      const matched = entry.options.find((option) => compact(option?.id) === compact(value.id));
      if (matched) return stringifyFieldValue(matched, entry);
    }
    return compact(JSON.stringify(value));
  }
  return compact(String(value));
}

function normalizeLabel(label) {
  return compact(label).replace(/[\s_()\/\-:]/g, "").toLowerCase();
}

function findFieldValue(fields, labels) {
  const targets = (Array.isArray(labels) ? labels : [labels]).map(normalizeLabel);
  const field = fields.find((entry) => {
    const label = entry?.label || entry?.key || "";
    const normalized = normalizeLabel(label);
    return targets.some((target) => normalized === target || normalized.includes(target) || target.includes(normalized));
  });
  return field ? stringifyFieldValue(field.value, field) : "";
}

function receivedAtFromPayload(payload) {
  const candidates = [
    payload?.data?.submittedAt,
    payload?.data?.createdAt,
    payload?.createdAt,
    payload?.eventDate,
  ];

  for (const candidate of candidates) {
    const value = compact(candidate);
    if (!value) continue;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  return new Date().toISOString();
}

function extractSubmission(payload) {
  const fields = Array.isArray(payload?.data?.fields) ? payload.data.fields : [];

  return {
    received_at: receivedAtFromPayload(payload),
    title: findFieldValue(fields, ["제목"]),
    instagram_id: findFieldValue(fields, ["인스타 아이디", "인스타아이디"]),
    current_status: findFieldValue(fields, ["현재상태", "현재 상태", "현재 상태(학년/고졸/재직 중 등)"]),
    age: findFieldValue(fields, ["나이"]),
    gender: findFieldValue(fields, ["성별"]),
    career_concern_type: findFieldValue(fields, ["진로고민유형", "진로 고민 유형", "진로 고민 유형 선택"]),
    academic_background: findFieldValue(fields, ["학벌"]),
    major: findFieldValue(fields, ["학과"]),
    grade: findFieldValue(fields, ["학점", "학점 or 고교 내신"]),
    english_score: findFieldValue(fields, ["객관적 영어 점수"]),
    math_score: findFieldValue(fields, ["객관적 수학 점수"]),
    financial_status: findFieldValue(fields, ["현재재정상태", "현재 재정 상태"]),
    concern: findFieldValue(fields, ["고민", "고민 내용"]),
    message_to_vincent: findFieldValue(fields, ["vincent 에게 하고 싶은 말", "vincent에게 하고 싶은 말"]),
  };
}

async function readRawBody(req) {
  if (req.body && typeof req.body === "string") return req.body;
  if (req.body && Buffer.isBuffer(req.body)) return req.body.toString("utf8");
  if (req.body && typeof req.body === "object") return JSON.stringify(req.body);

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function insertSubmission(record) {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error("Supabase environment variables are missing.");
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/tally_submissions`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify([record]),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase insert failed: ${response.status} ${errorText}`);
  }

  const rows = await response.json();
  return rows[0] || null;
}

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    return jsonResponse(res, 200, { ok: true, endpoint: "tally-webhook" });
  }

  if (req.method !== "POST") {
    return jsonResponse(res, 405, { ok: false, error: "Method not allowed." });
  }

  try {
    const rawBody = await readRawBody(req);
    const payload = rawBody ? JSON.parse(rawBody) : {};
    const record = extractSubmission(payload);
    const saved = await insertSubmission(record);

    return jsonResponse(res, 200, {
      ok: true,
      rowId: saved?.id || null,
      receivedAt: saved?.received_at || record.received_at,
    });
  } catch (error) {
    return jsonResponse(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown webhook error.",
    });
  }
};
