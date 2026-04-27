const {
  jsonResponse,
  supabasePostResponse,
  supabaseRequest,
  toSortableTimestamp,
} = require("./_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return jsonResponse(res, 405, { ok: false, error: "Method not allowed." });
  }

  try {
    const category = String(req.query.category || "").trim();
    const rows = await supabaseRequest(
      `posts?select=id,title,category,academic_background,concern,insight,featured,received_at,views,created_at&category=eq.${encodeURIComponent(category)}&published=is.true&order=featured.desc,received_at.desc,created_at.desc`
    );

    const posts = (Array.isArray(rows) ? rows : []).map(supabasePostResponse);
    posts.sort((left, right) => {
      const receivedDiff = toSortableTimestamp(right.receivedDate) - toSortableTimestamp(left.receivedDate);
      if (receivedDiff !== 0) return receivedDiff;
      return toSortableTimestamp(right.created) - toSortableTimestamp(left.created);
    });

    return jsonResponse(res, 200, posts);
  } catch (error) {
    return jsonResponse(res, error.statusCode || 500, {
      ok: false,
      error: error.message || "Failed to fetch posts.",
    });
  }
};
