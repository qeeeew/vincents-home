const { fetchSupabasePost, jsonResponse, supabaseRequest } = require("../../_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return jsonResponse(res, 405, { ok: false, error: "Method not allowed." });
  }

  try {
    const postId = String(req.query.page_id || "");
    const post = await fetchSupabasePost(postId);
    const nextViews = Number(post.views || 0) + 1;

    await supabaseRequest(`posts?id=eq.${encodeURIComponent(postId)}`, {
      method: "PATCH",
      body: JSON.stringify({ views: nextViews, updated_at: new Date().toISOString() }),
    });

    return jsonResponse(res, 200, { views: nextViews });
  } catch (error) {
    return jsonResponse(res, error.statusCode || 500, {
      ok: false,
      error: error.message || "Failed to increment views.",
    });
  }
};
