const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    await requireAuth(token);
    const postId = event.queryStringParameters?.postId;
    if (!postId) return json(400, { error: "Missing postId" });
    const s = getSql();
    const rows = await s`
      SELECT pc.id, pc.body, pc.created_at, pc.parent_id, u.username
      FROM post_comments pc
      JOIN users u ON u.id = pc.user_id
      WHERE pc.post_id = ${postId}
      ORDER BY pc.created_at ASC
      LIMIT 200
    `;
    return json(200, { comments: rows || [] });
  } catch (e) {
    const msg = String(e?.message || "Load failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
