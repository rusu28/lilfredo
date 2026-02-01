const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const { pollId, optionIndex } = JSON.parse(event.body || "{}");
    const idx = Number(optionIndex);
    if (!pollId || !Number.isInteger(idx)) return json(400, { error: "Missing pollId or optionIndex" });
    const s = getSql();
    const rows = await s`SELECT id, options, closes_at, allow_multiple FROM polls WHERE id = ${pollId} LIMIT 1`;
    if (!rows.length) return json(404, { error: "Poll not found" });
    if (rows[0].closes_at && new Date(rows[0].closes_at) < new Date()) return json(400, { error: "Poll closed" });
    const options = rows[0].options || [];
    if (idx < 0 || idx >= options.length) return json(400, { error: "Invalid option index" });
    if (rows[0].allow_multiple) {
      await s`
        INSERT INTO poll_votes (poll_id, user_id, option_index)
        VALUES (${pollId}, ${user.id}, ${idx})
        ON CONFLICT (poll_id, user_id, option_index) DO NOTHING
      `;
    } else {
      await s`DELETE FROM poll_votes WHERE poll_id = ${pollId} AND user_id = ${user.id}`;
      await s`
        INSERT INTO poll_votes (poll_id, user_id, option_index)
        VALUES (${pollId}, ${user.id}, ${idx})
        ON CONFLICT (poll_id, user_id, option_index) DO NOTHING
      `;
    }
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Vote failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
