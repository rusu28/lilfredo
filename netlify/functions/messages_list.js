const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const withUserId = event.queryStringParameters?.withUserId;
    if (!withUserId) return json(400, { error: "Missing withUserId" });
    const s = getSql();
    const f1 = await s`SELECT 1 FROM follows WHERE follower_id = ${user.id} AND following_id = ${withUserId} LIMIT 1`;
    const f2 = await s`SELECT 1 FROM follows WHERE follower_id = ${withUserId} AND following_id = ${user.id} LIMIT 1`;
    if (!f1?.length || !f2?.length) return json(403, { error: "Not friends" });
    const rows = await s`
      SELECT m.id, m.body, m.created_at, m.from_user_id, m.to_user_id,
        u.username as from_username
      FROM messages m
      JOIN users u ON u.id = m.from_user_id
      WHERE (m.from_user_id = ${user.id} AND m.to_user_id = ${withUserId})
         OR (m.from_user_id = ${withUserId} AND m.to_user_id = ${user.id})
      ORDER BY m.created_at ASC
      LIMIT 200
    `;
    return json(200, { messages: rows || [] });
  } catch (e) {
    const msg = String(e?.message || "Load failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
