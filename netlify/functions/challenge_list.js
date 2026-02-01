const { getSql, ensureSchema, json } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const s = getSql();
    const challenges = await s`
      SELECT c.id, c.title, c.type, c.description, c.settings, c.expires_at, c.created_at, c.reward_credits, c.reward_gadget, c.preset_name, c.difficulty_score, c.pinned, c.gear_lock, c.is_private, u.username AS creator
      FROM challenges c
      LEFT JOIN users u ON u.id = c.creator_id
      ORDER BY c.pinned DESC, c.created_at DESC
      LIMIT 50
    `;

    const ids = challenges.map((c) => c.id);
    let scores = [];
    if (ids.length) {
      scores = await s`
        SELECT cs.challenge_id, cs.user_id, u.username, cs.score, cs.created_at
        FROM challenge_scores cs
        JOIN users u ON u.id = cs.user_id
        WHERE cs.challenge_id = ANY(${ids})
        ORDER BY cs.score DESC, cs.created_at ASC
      `;
    }

    const byId = {};
    challenges.forEach((c) => {
      byId[c.id] = { ...c, leaderboard: [] };
    });
    scores.forEach((sc) => {
      if (byId[sc.challenge_id] && byId[sc.challenge_id].leaderboard.length < 10) {
        byId[sc.challenge_id].leaderboard.push(sc);
      }
    });

    return json(200, { ok: true, challenges: Object.values(byId) });
  } catch (e) {
    const msg = String(e?.message || "List failed");
    return json(400, { error: msg });
  }
};
