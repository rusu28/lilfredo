const { getSql, ensureSchema, json, requireAuth } = require("./_db");
const { randomUUID } = require("crypto");

const getSeasonId = () => {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);

    const { score, night, collectibles } = JSON.parse(event.body || "{}");
    const scoreVal = Number(score);
    const nightVal = Number(night);
    if (!Number.isFinite(scoreVal) || scoreVal < 0) return json(400, { error: "Invalid score" });
    if (!Number.isFinite(nightVal) || nightVal < 1) return json(400, { error: "Invalid night" });

    const s = getSql();
    const scoreInt = Math.floor(scoreVal);
    const nightInt = Math.floor(nightVal);
    const seasonId = getSeasonId();
    const seasonStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1, 0, 0, 0));
    const seasonEnd = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1, 0, 0, 0));
    await s`
      INSERT INTO seasons (id, starts_at, ends_at)
      VALUES (${seasonId}, ${seasonStart.toISOString()}, ${seasonEnd.toISOString()})
      ON CONFLICT (id) DO NOTHING
    `;
    await s`INSERT INTO scores (user_id, score, night, season_id) VALUES (${user.id}, ${scoreInt}, ${nightInt}, ${seasonId})`;
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
    if (Array.isArray(collectibles)) {
      for (const c of collectibles) {
        if (!c?.characterId) continue;
        await s`
          INSERT INTO collectibles (id, user_id, character_id, rarity, variant)
          VALUES (${randomUUID()}, ${user.id}, ${String(c.characterId)}, ${String(c.rarity || "normal")}, ${c.variant ? String(c.variant) : null})
        `;
      }
    }
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Submit failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
