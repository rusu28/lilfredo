const { getSql, ensureSchema, json, requireAuth, isAdmin } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const { pollId } = JSON.parse(event.body || "{}");
    if (!pollId) return json(400, { error: "Missing pollId" });
    const s = getSql();
    const rows = await s`SELECT id, user_id FROM polls WHERE id = ${pollId} LIMIT 1`;
    if (!rows.length) return json(404, { error: "Poll not found" });
    if (!isAdmin(user) && rows[0].user_id !== user.id) return json(403, { error: "Forbidden" });
    await s`DELETE FROM polls WHERE id = ${pollId}`;
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Delete failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
