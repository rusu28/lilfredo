const { getSql, ensureSchema, json } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const s = getSql();
    const polls = await s`
      SELECT p.id, p.question, p.options, p.poll_type, p.allow_multiple, p.correct_index, p.edited_at, p.closes_at, p.created_at, u.username, u.id AS user_id,
        (SELECT settings->'badgesSelected' FROM user_settings us WHERE us.user_id = u.id) AS badges
      FROM polls p
      LEFT JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
      LIMIT 50
    `;
    const pollIds = polls.map((p) => p.id);
    let votes = [];
    if (pollIds.length) {
      votes = await s`
        SELECT poll_id, option_index, COUNT(*) AS c
        FROM poll_votes
        WHERE poll_id = ANY(${pollIds})
        GROUP BY poll_id, option_index
      `;
    }
    const grouped = {};
    polls.forEach((p) => {
      grouped[p.id] = { ...p, counts: Array((p.options || []).length).fill(0) };
    });
    votes.forEach((v) => {
      if (grouped[v.poll_id]) {
        const idx = v.option_index;
        const counts = grouped[v.poll_id].counts;
        if (idx >= 0 && idx < counts.length) counts[idx] = Number(v.c);
      }
    });
    return json(200, { ok: true, polls: Object.values(grouped) });
  } catch (e) {
    const msg = String(e?.message || "List failed");
    return json(400, { error: msg });
  }
};
