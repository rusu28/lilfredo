const { getSql, ensureSchema, json, requireAuth, isAdmin } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    if (!isAdmin(user)) return json(403, { error: "Forbidden" });
    const { userId, verified } = JSON.parse(event.body || "{}");
    if (!userId) return json(400, { error: "Missing userId" });
    const s = getSql();
    await s`UPDATE profiles SET verified = ${!!verified} WHERE user_id = ${userId}`;
    return json(200, { ok: true });
  } catch (e) {
    return json(400, { error: String(e?.message || "Update failed") });
  }
};
