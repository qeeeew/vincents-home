const {
  fetchSupabasePost,
  jsonResponse,
  supabasePostResponse,
  syntheticPostBlocks,
} = require("../../_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return jsonResponse(res, 405, { ok: false, error: "Method not allowed." });
  }

  try {
    const row = await fetchSupabasePost(String(req.query.page_id || ""));
    const post = supabasePostResponse(row);
    return jsonResponse(res, 200, { blocks: syntheticPostBlocks(post) });
  } catch (error) {
    return jsonResponse(res, error.statusCode || 500, {
      ok: false,
      error: error.message || "Failed to fetch content.",
    });
  }
};
