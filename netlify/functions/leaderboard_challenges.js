const { ensureSchema, getSql, json } = require("./_db");

exports.handler = async () => {
  try {
    await ensureSchema();
    const s = getSql();
    const rows = await s`
      SELECT u.username, COUNT(cs.id)::int AS count
      FROM users u
      LEFT JOIN challenge_scores cs ON cs.user_id = u.id
      GROUP BY u.username
      ORDER BY count DESC, u.username ASC
      LIMIT 50
    `;
    return json(200, { scores: rows || [] });
  } catch (e) {
    return json(500, { error: String(e?.message || e) });
  }
};
