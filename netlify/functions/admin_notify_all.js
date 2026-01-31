const { getSql, ensureSchema, json, requireAuth, isAdmin } = require("./_db");
const { randomUUID } = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    if (!isAdmin(user)) return json(403, { error: "Forbidden" });
    const { title, body, from } = JSON.parse(event.body || "{}");
    if (!title && !body) return json(400, { error: "Missing content" });
    const payload = { from: from || user.username, title: title || "System", body: body || "" };
    const s = getSql();
    await s`
      INSERT INTO notifications (id, user_id, type, payload)
      SELECT ${randomUUID()}, u.id, 'system', ${JSON.stringify(payload)}::jsonb
      FROM users u
    `;
    return json(200, { ok: true });
  } catch (e) {
    return json(400, { error: String(e?.message || "Notify failed") });
  }
};
