const { getSql, ensureSchema, json, requireAuth, isAdmin } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const { pollId, question, options, pollType, correctIndex } = JSON.parse(event.body || "{}");
    if (!pollId || !question || !Array.isArray(options) || options.length < 2) {
      return json(400, { error: "Missing pollId/question/options" });
    }
    const s = getSql();
    const rows = await s`SELECT id, user_id FROM polls WHERE id = ${pollId} LIMIT 1`;
    if (!rows.length) return json(404, { error: "Poll not found" });
    if (!isAdmin(user) && rows[0].user_id !== user.id) return json(403, { error: "Forbidden" });
    const type = pollType === "quiz" ? "quiz" : pollType === "multi" ? "multi" : "single";
    let correct = type === "quiz" && Number.isInteger(correctIndex) ? Number(correctIndex) : null;
    if (correct !== null && (correct < 0 || correct >= options.length)) correct = null;
    const allowMultiple = type === "multi";
    await s`
      UPDATE polls
      SET question = ${question},
          options = ${options},
          poll_type = ${type},
          allow_multiple = ${allowMultiple},
          correct_index = ${correct},
          edited_at = NOW()
      WHERE id = ${pollId}
    `;
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Edit failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
