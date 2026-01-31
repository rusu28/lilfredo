const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const { id } = JSON.parse(event.body || "{}");
    const s = getSql();
    if (id) {
      await s`UPDATE notifications SET is_read = TRUE WHERE id = ${id} AND user_id = ${user.id}`;
    } else {
      await s`UPDATE notifications SET is_read = TRUE WHERE user_id = ${user.id}`;
    }
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Update failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
