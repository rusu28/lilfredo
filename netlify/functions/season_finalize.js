const { getSql, ensureSchema, json, requireAuth, isAdmin } = require("./_db");
const { randomUUID } = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    if (!isAdmin(user)) return json(403, { error: "Admin only" });
    const { seasonId } = JSON.parse(event.body || "{}");
    if (!seasonId) return json(400, { error: "Missing seasonId" });
    const s = getSql();
    const top = await s`
      SELECT user_id, MAX(score) AS best
      FROM scores
      WHERE season_id = ${seasonId}
      GROUP BY user_id
      ORDER BY best DESC
      LIMIT 3
    `;
    const badges = ["season_top1", "season_top2", "season_top3"];
    for (let i = 0; i < top.length; i += 1) {
      const row = top[i];
      await s`
        INSERT INTO season_badges (id, season_id, user_id, badge_id)
        VALUES (${randomUUID()}, ${seasonId}, ${row.user_id}, ${badges[i]})
        ON CONFLICT DO NOTHING
      `;
    }
    return json(200, { ok: true, granted: top.length });
  } catch (e) {
    const msg = String(e?.message || "Finalize failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
