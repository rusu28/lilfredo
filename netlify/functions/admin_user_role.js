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

    const { userId, role } = JSON.parse(event.body || "{}");
    if (!userId || !role) return json(400, { error: "Missing fields" });
    const safeRole = role === "admin" ? "admin" : "user";
    const s = getSql();
    await s`UPDATE users SET role = ${safeRole} WHERE id = ${userId}`;
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Update failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
