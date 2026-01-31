const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);

    const { score, night } = JSON.parse(event.body || "{}");
    const scoreVal = Number(score);
    const nightVal = Number(night);
    if (!Number.isFinite(scoreVal) || scoreVal < 0) return json(400, { error: "Invalid score" });
    if (!Number.isFinite(nightVal) || nightVal < 1) return json(400, { error: "Invalid night" });

    const s = getSql();
    const scoreInt = Math.floor(scoreVal);
    const nightInt = Math.floor(nightVal);
    await s`INSERT INTO scores (user_id, score, night) VALUES (${user.id}, ${scoreInt}, ${nightInt})`;
    await s`
      INSERT INTO user_stats (user_id, best, sessions, highest_night, total_score)
      VALUES (${user.id}, ${scoreInt}, 1, ${nightInt}, ${scoreInt})
      ON CONFLICT (user_id) DO UPDATE SET
        best = GREATEST(user_stats.best, EXCLUDED.best),
        sessions = user_stats.sessions + 1,
        highest_night = GREATEST(user_stats.highest_night, EXCLUDED.highest_night),
        total_score = user_stats.total_score + EXCLUDED.total_score,
        updated_at = NOW()
    `;
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Submit failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
