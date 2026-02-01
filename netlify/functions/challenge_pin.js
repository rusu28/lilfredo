const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    if (user.role !== "admin") return json(403, { error: "Admin only" });

    const { challengeId, pinned } = JSON.parse(event.body || "{}");
    const s = getSql();
    await s`UPDATE challenges SET pinned = ${!!pinned} WHERE id = ${challengeId}`;
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Pin failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
