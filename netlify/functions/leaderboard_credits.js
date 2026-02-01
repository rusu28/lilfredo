const { ensureSchema, getSql, json } = require("./_db");

exports.handler = async () => {
  try {
    await ensureSchema();
    const s = getSql();
    const rows = await s`
      SELECT u.username,
        COALESCE((us.settings->>'credits')::int, 0) AS credits
      FROM users u
      LEFT JOIN user_settings us ON us.user_id = u.id
      ORDER BY credits DESC, u.username ASC
      LIMIT 50
    `;
    return json(200, { scores: rows || [] });
  } catch (e) {
    return json(500, { error: String(e?.message || e) });
  }
};
