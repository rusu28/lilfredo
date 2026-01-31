const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const s = getSql();
    const rows = await s`
      SELECT u.id, u.username, u.role
      FROM users u
      WHERE EXISTS (
        SELECT 1 FROM follows f1
        WHERE f1.follower_id = ${user.id} AND f1.following_id = u.id
      )
      AND EXISTS (
        SELECT 1 FROM follows f2
        WHERE f2.follower_id = u.id AND f2.following_id = ${user.id}
      )
      ORDER BY u.username ASC
      LIMIT 200
    `;
    return json(200, { friends: rows || [] });
  } catch (e) {
    const msg = String(e?.message || "Load failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
