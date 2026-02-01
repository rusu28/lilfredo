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

    const { challengeId } = JSON.parse(event.body || "{}");
    if (!challengeId) return json(400, { error: "Missing challengeId" });
    const s = getSql();
    await s`DELETE FROM challenge_scores WHERE challenge_id = ${challengeId}`;
    await s`DELETE FROM challenge_completions WHERE challenge_id = ${challengeId}`;
    await s`DELETE FROM challenges WHERE id = ${challengeId}`;
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Delete failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
