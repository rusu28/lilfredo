const { getSql, ensureSchema, json, requireAuth } = require("./_db");
const { randomUUID } = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const payload = JSON.parse(event.body || "{}");
    const { rewardId, rewardLabel, rarity, bet, seed, durationMs, creditsBefore, creditsAfter } = payload;
    const s = getSql();
    await s`
      INSERT INTO spin_logs (id, user_id, reward_id, reward_label, rarity, bet, seed, duration_ms, credits_before, credits_after)
      VALUES (${randomUUID()}, ${user.id}, ${rewardId}, ${rewardLabel}, ${rarity}, ${bet || 0}, ${seed || null}, ${durationMs || null}, ${creditsBefore || null}, ${creditsAfter || null})
    `;
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Log failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
