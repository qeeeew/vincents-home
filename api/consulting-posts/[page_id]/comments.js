const {
  cleanText,
  jsonResponse,
  makePasswordHash,
  supabaseRequest,
} = require("../../_supabase");

function commentResponse(row) {
  return {
    id: row.id || "",
    nickname: row.nickname || "",
    content: row.content || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

module.exports = async function handler(req, res) {
  const postId = String(req.query.page_id || "");

  try {
    if (req.method === "GET") {
      const rows = await supabaseRequest(
        `comments?select=id,nickname,content,created_at,updated_at&post_id=eq.${encodeURIComponent(postId)}&deleted=is.false&order=created_at.asc`
      );
      return jsonResponse(res, 200, (Array.isArray(rows) ? rows : []).map(commentResponse));
    }

    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const nickname = cleanText(body.nickname, 1, 20, "Nickname");
      const password = cleanText(body.password, 4, 80, "Password");
      const content = cleanText(body.content, 1, 800, "Content");
      const nowIso = new Date().toISOString();

      const rows = await supabaseRequest("comments", {
        method: "POST",
        preferRepresentation: true,
        body: JSON.stringify([
          {
            post_id: postId,
            nickname,
            password_hash: makePasswordHash(password),
            content,
            deleted: false,
            created_at: nowIso,
            updated_at: nowIso,
          },
        ]),
      });

      return jsonResponse(res, 200, rows && rows[0] ? commentResponse(rows[0]) : {});
    }

    return jsonResponse(res, 405, { ok: false, error: "Method not allowed." });
  } catch (error) {
    return jsonResponse(res, error.statusCode || 500, {
      ok: false,
      error: error.message || "Failed to handle comments.",
    });
  }
};
