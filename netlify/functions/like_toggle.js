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
    const existing = await s`SELECT 1 FROM post_likes WHERE user_id = ${user.id} AND post_id = ${postId} LIMIT 1`;
    if (existing?.length) {
      await s`DELETE FROM post_likes WHERE user_id = ${user.id} AND post_id = ${postId}`;
    } else {
      await s`INSERT INTO post_likes (user_id, post_id) VALUES (${user.id}, ${postId})`;
    }
    const owner = await s`SELECT user_id FROM posts WHERE id = ${postId} LIMIT 1`;
    if (!existing?.length && owner?.[0]?.user_id && owner[0].user_id !== user.id) {
      await s`
        INSERT INTO notifications (id, user_id, type, payload)
        VALUES (${require("crypto").randomUUID()}, ${owner[0].user_id}, 'like', ${JSON.stringify({ from: user.username, postId })}::jsonb)
      `;
    }
    const countRows = await s`SELECT COUNT(*)::int AS c FROM post_likes WHERE post_id = ${postId}`;
    return json(200, { liked: !existing?.length, likesCount: countRows?.[0]?.c ?? 0 });
  } catch (e) {
    const msg = String(e?.message || "Like failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
