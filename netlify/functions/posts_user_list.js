const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    await requireAuth(token);
    const username = event.queryStringParameters?.username;
    if (!username) return json(400, { error: "Missing username" });
    const s = getSql();
    const rows = await s`
      SELECT
        p.id,
        p.body,
        p.snapshot,
        p.created_at,
        u.id as user_id,
        u.username,
        u.role,
        pr.avatar_url,
        pr.verified,
        (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS likes_count,
        (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) AS comments_count,
        (SELECT COUNT(*) FROM post_favorites pf WHERE pf.post_id = p.id) AS favorites_count
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN profiles pr ON pr.user_id = u.id
      WHERE u.username = ${String(username)}
      ORDER BY p.created_at DESC
      LIMIT 50
    `;
    return json(200, { posts: rows || [] });
  } catch (e) {
    return json(400, { error: String(e?.message || "Load failed") });
  }
};
