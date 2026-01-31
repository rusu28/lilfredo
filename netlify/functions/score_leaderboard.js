const { getSql, ensureSchema, json } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const s = getSql();
    const rows = await s`
      SELECT u.username, sc.score, sc.night
      FROM scores sc
      JOIN users u ON u.id = sc.user_id
      ORDER BY sc.score DESC, sc.created_at DESC
      LIMIT 20
    `;
    return json(200, { scores: rows || [] });
  } catch (e) {
    return json(400, { error: String(e?.message || "Load failed") });
  }
};
