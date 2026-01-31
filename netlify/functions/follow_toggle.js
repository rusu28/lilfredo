const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const { userId } = JSON.parse(event.body || "{}");
    if (!userId) return json(400, { error: "Missing userId" });
    if (userId === user.id) return json(400, { error: "Cannot follow yourself" });
    const s = getSql();
    const existing = await s`SELECT 1 FROM follows WHERE follower_id = ${user.id} AND following_id = ${userId} LIMIT 1`;
    if (existing?.length) {
      await s`DELETE FROM follows WHERE follower_id = ${user.id} AND following_id = ${userId}`;
    } else {
      await s`INSERT INTO follows (follower_id, following_id) VALUES (${user.id}, ${userId})`;
      await s`
        INSERT INTO notifications (id, user_id, type, payload)
        VALUES (${require("crypto").randomUUID()}, ${userId}, 'follow', ${JSON.stringify({ from: user.username })}::jsonb)
      `;
    }
    const countRows = await s`SELECT COUNT(*)::int AS c FROM follows WHERE following_id = ${userId}`;
    return json(200, { following: !existing?.length, followers: countRows?.[0]?.c ?? 0 });
  } catch (e) {
    const msg = String(e?.message || "Follow failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
