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

    const { pollId } = JSON.parse(event.body || "{}");
    if (!pollId) return json(400, { error: "Missing pollId" });
    const s = getSql();
    await s`DELETE FROM poll_votes WHERE poll_id = ${pollId}`;
    await s`DELETE FROM polls WHERE id = ${pollId}`;
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Delete failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
