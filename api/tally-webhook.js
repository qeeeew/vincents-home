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

function stringifyFieldValue(value) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => stringifyFieldValue(item))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof value === "object") {
    if (typeof value.label === "string") return value.label.trim();
    if (typeof value.text === "string") return value.text.trim();
    if (typeof value.value === "string") return value.value.trim();
    return compact(JSON.stringify(value));
  }
  return compact(String(value));
}

function labelMatches(label, patterns) {
  const normalized = compact(label).toLowerCase();
  return patterns.some((pattern) => normalized.includes(pattern));
}

function findFieldValue(fields, patterns) {
  const field = fields.find((entry) => {
    const label = entry?.label || entry?.key || "";
    return labelMatches(label, patterns);
  });
  return field ? stringifyFieldValue(field.value) : "";
}

function ageBucket(ageRaw) {
  const matched = String(ageRaw || "").match(/\d+/);
  if (!matched) return "";

  const age = Number(matched[0]);
  if (!Number.isFinite(age)) return "";

  const decade = Math.floor(age / 10) * 10;
  const offset = age % 10;
  const part = offset <= 3 ? "초반" : offset <= 6 ? "중반" : "후반";
  return `${decade}대 ${part}`;
}

function academicLine(raw) {
  const text = compact(raw);
  if (!text) return "";

  const rules = [
    { keywords: ["서울대", "연세대", "고려대"], line: "SKY" },
    { keywords: ["서강대", "성균관대", "한양대"], line: "서성한" },
    { keywords: ["중앙대", "경희대", "한국외대", "외대", "서울시립대", "시립대"], line: "중경외시" },
    { keywords: ["건국대", "동국대", "홍익대"], line: "건동홍" },
    { keywords: ["국민대", "숭실대", "세종대", "단국대"], line: "국숭세단" },
    { keywords: ["광운대", "명지대", "상명대", "가톨릭대"], line: "광명상가" },
    { keywords: ["인하대", "아주대"], line: "인아" },
    { keywords: ["경기대", "가천대"], line: "인가경" },
    { keywords: ["부산대", "경북대", "전남대", "충남대", "충북대", "전북대", "강원대", "경상국립대", "제주대"], line: "지거국" },
    { keywords: ["전문대"], line: "전문대" },
    { keywords: ["고졸"], line: "고졸" },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return rule.line;
    }
  }

  return text;
}

function mergedContext(record) {
  const parts = [];
  if (record.current_status_raw) parts.push(`현재상태: ${record.current_status_raw}`);
  if (record.academic_background_raw) parts.push(`학력/배경: ${record.academic_background_raw}`);
  if (record.english_level_raw) parts.push(`영어: ${record.english_level_raw}`);
  if (record.math_level_raw) parts.push(`수학: ${record.math_level_raw}`);
  if (record.financial_status_raw) parts.push(`재정상태: ${record.financial_status_raw}`);
  if (record.concern_raw) parts.push(`고민: ${record.concern_raw}`);
  return parts.join("\n");
}

function normalizedCategory(categoryRaw) {
  const text = compact(categoryRaw);
  const mappings = [
    { patterns: ["전문직"], value: "professional" },
    { patterns: ["취업 준비"], value: "career" },
    { patterns: ["대학교", "대학/학부", "전공 선택", "학부"], value: "major" },
    { patterns: ["중졸", "고졸 이후"], value: "direction" },
    { patterns: ["자격증", "어학"], value: "certificate" },
    { patterns: ["자소서"], value: "essay" },
    { patterns: ["기타"], value: "etc" },
  ];

  for (const mapping of mappings) {
    if (mapping.patterns.some((pattern) => text.includes(pattern))) {
      return mapping.value;
    }
  }
  return "";
}

function shortTitleFromConcern(concernRaw) {
  const normalized = compact(concernRaw)
    .replace(/^(안녕하세요|안녕하십니까|안녕하세용|안녕하십니까\!)[,\.\s]*/i, "")
    .trim();

  if (!normalized) return "상담 고민 정리";
  if (normalized.length <= 58) return normalized;
  return `${normalized.slice(0, 57).trim()}…`;
}

function extractRecord(payload) {
  const fields = Array.isArray(payload?.data?.fields) ? payload.data.fields : [];

  const record = {
    submission_id: compact(payload?.data?.submissionId || payload?.data?.responseId || payload?.eventId || ""),
    source: "tally",
    name: findFieldValue(fields, ["이름", "name"]),
    email: findFieldValue(fields, ["이메일", "email"]),
    phone: findFieldValue(fields, ["전화", "휴대폰", "phone"]),
    age_raw: findFieldValue(fields, ["나이", "age"]),
    age_bucket: "",
    academic_background_raw: findFieldValue(fields, ["대학 라인", "학력", "학교", "대학", "학과/복수전공", "학과", "전공"]),
    academic_line: "",
    category_raw: findFieldValue(fields, ["진로 고민 유형", "카테고리", "category"]),
    normalized_category: "",
    financial_status_raw: findFieldValue(fields, ["재정 상태", "재정상태", "용돈", "여유 자금"]),
    current_status_raw: findFieldValue(fields, ["현재 상태", "재직", "학년", "고졸"]),
    concern_raw: findFieldValue(fields, ["고민", "상담 내용"]),
    english_level_raw: findFieldValue(fields, ["영어 점수", "영어 실력", "토익", "영어"]),
    math_level_raw: findFieldValue(fields, ["수학 점수", "수학실력", "수학 실력", "수학"]),
    merged_context: "",
    normalized_title: "",
    normalized_concern: "",
    raw_payload: payload,
    processed: false,
    updated_at: new Date().toISOString(),
  };

  record.age_bucket = ageBucket(record.age_raw);
  record.academic_line = academicLine(record.academic_background_raw);
  record.normalized_category = normalizedCategory(record.category_raw);
  record.merged_context = mergedContext(record);
  record.normalized_title = shortTitleFromConcern(record.concern_raw);
  record.normalized_concern = record.merged_context;

  return record;
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

async function upsertIntakeSubmission(record) {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error("Supabase environment variables are missing.");
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/intake_submissions?on_conflict=submission_id`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([record]),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase upsert failed: ${response.status} ${errorText}`);
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
    const record = extractRecord(payload);

    if (!record.submission_id) {
      return jsonResponse(res, 400, { ok: false, error: "Missing submission id." });
    }

    const saved = await upsertIntakeSubmission(record);
    return jsonResponse(res, 200, {
      ok: true,
      submissionId: record.submission_id,
      rowId: saved?.id || null,
    });
  } catch (error) {
    return jsonResponse(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown webhook error.",
    });
  }
};
