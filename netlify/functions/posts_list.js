const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const viewer = await requireAuth(token);
    const s = getSql();
    const rows = await s`
      SELECT
        p.id,
        p.body,
        p.snapshot,
        p.created_at,
        p.edited_at,
        u.id as user_id,
        u.username,
        u.role,
        pr.avatar_url,
        pr.verified,
        (SELECT settings->'badgesSelected' FROM user_settings us WHERE us.user_id = u.id) AS badges,
        EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ${viewer.id}) AS liked,
        EXISTS(SELECT 1 FROM post_favorites pf WHERE pf.post_id = p.id AND pf.user_id = ${viewer.id}) AS favorited,
        EXISTS(SELECT 1 FROM follows f WHERE f.follower_id = ${viewer.id} AND f.following_id = u.id) AS following,
        (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS likes_count,
        (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) AS comments_count,
        (SELECT COUNT(*) FROM post_favorites pf WHERE pf.post_id = p.id) AS favorites_count
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN profiles pr ON pr.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `;
    return json(200, { posts: rows || [] });
  } catch (e) {
    return json(401, { error: "Unauthorized" });
  }
};
