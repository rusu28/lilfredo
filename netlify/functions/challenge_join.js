const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    await requireAuth(token);
    const { challengeId, code } = JSON.parse(event.body || "{}");
    if (!challengeId) return json(400, { error: "Missing challengeId" });
    const s = getSql();
    const rows = await s`SELECT id, is_private, access_code FROM challenges WHERE id = ${challengeId} LIMIT 1`;
    if (!rows.length) return json(404, { error: "Challenge not found" });
    if (rows[0].is_private) {
      if (!code || code !== rows[0].access_code) return json(403, { error: "Invalid code" });
    }
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Join failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
