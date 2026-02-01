const { getSql, ensureSchema, json } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const s = getSql();
    const rows = await s`
      SELECT p.id, p.name, p.config, p.is_public, p.created_at, u.username
      FROM presets p
      LEFT JOIN users u ON u.id = p.user_id
      WHERE p.is_public = TRUE
      ORDER BY p.created_at DESC
      LIMIT 50
    `;
    return json(200, { ok: true, presets: rows });
  } catch (e) {
    const msg = String(e?.message || "List failed");
    return json(400, { error: msg });
  }
};
