const {
  cleanText,
  jsonResponse,
  supabaseRequest,
  verifyPassword,
} = require("../_supabase");

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

async function fetchComment(commentId) {
  const rows = await supabaseRequest(
    `comments?select=id,post_id,nickname,content,password_hash,deleted,created_at,updated_at&id=eq.${encodeURIComponent(commentId)}&limit=1`
  );
  if (!Array.isArray(rows) || !rows.length || rows[0].deleted) {
    const error = new Error("Comment not found.");
    error.statusCode = 404;
    throw error;
  }
  return rows[0];
}

module.exports = async function handler(req, res) {
  const commentId = String(req.query.comment_id || "");

  try {
    const body = await readJsonBody(req);
    const password = cleanText(body.password, 4, 80, "Password");
    const comment = await fetchComment(commentId);

    if (!verifyPassword(password, String(comment.password_hash || ""))) {
      return jsonResponse(res, 403, { ok: false, error: "Password does not match." });
    }

    if (req.method === "PATCH") {
      const content = cleanText(body.content, 1, 800, "Content");
      const rows = await supabaseRequest(`comments?id=eq.${encodeURIComponent(commentId)}`, {
        method: "PATCH",
        preferRepresentation: true,
        body: JSON.stringify({ content, updated_at: new Date().toISOString() }),
      });
      return jsonResponse(res, 200, rows && rows[0] ? commentResponse(rows[0]) : {});
    }

    if (req.method === "DELETE") {
      await supabaseRequest(`comments?id=eq.${encodeURIComponent(commentId)}`, {
        method: "PATCH",
        body: JSON.stringify({ deleted: true, updated_at: new Date().toISOString() }),
      });
      return jsonResponse(res, 200, { ok: true });
    }

    return jsonResponse(res, 405, { ok: false, error: "Method not allowed." });
  } catch (error) {
    return jsonResponse(res, error.statusCode || 500, {
      ok: false,
      error: error.message || "Failed to handle comment.",
    });
  }
};
