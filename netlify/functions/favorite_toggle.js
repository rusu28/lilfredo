const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const { postId } = JSON.parse(event.body || "{}");
    if (!postId) return json(400, { error: "Missing postId" });
    const s = getSql();
    const existing = await s`SELECT 1 FROM post_favorites WHERE user_id = ${user.id} AND post_id = ${postId} LIMIT 1`;
    if (existing?.length) {
      await s`DELETE FROM post_favorites WHERE user_id = ${user.id} AND post_id = ${postId}`;
    } else {
      await s`INSERT INTO post_favorites (user_id, post_id) VALUES (${user.id}, ${postId})`;
    }
    const count = await s`SELECT COUNT(*)::int AS c FROM post_favorites WHERE post_id = ${postId}`;
    return json(200, { favorited: !existing?.length, favoritesCount: count?.[0]?.c ?? 0 });
  } catch (e) {
    return json(400, { error: String(e?.message || "Favorite failed") });
  }
};
