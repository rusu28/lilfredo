const { getSql, ensureSchema, json } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    // public list
    const s = getSql();
    const rows = await s`
      SELECT s.id, s.name, s.seed, s.mode, s.difficulty, s.config, s.created_at, u.username, pr.verified
      FROM seeds s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN profiles pr ON pr.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 50
    `;
    return json(200, { seeds: rows || [] });
  } catch (e) {
    const msg = String(e?.message || "Load failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
