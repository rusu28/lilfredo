const { getSql, ensureSchema, json, requireAuth, isAdmin } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const { messageId } = JSON.parse(event.body || "{}");
    if (!messageId) return json(400, { error: "Missing messageId" });
    const s = getSql();
    const rows = await s`SELECT id, from_user_id FROM messages WHERE id = ${messageId} LIMIT 1`;
    if (!rows.length) return json(404, { error: "Message not found" });
    if (!isAdmin(user) && rows[0].from_user_id !== user.id) return json(403, { error: "Forbidden" });
    await s`DELETE FROM messages WHERE id = ${messageId}`;
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Delete failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
