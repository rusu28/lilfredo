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

    const { challengeId, score } = JSON.parse(event.body || "{}");
    const s = getSql();
    const rows = await s`SELECT id, expires_at FROM challenges WHERE id = ${challengeId} LIMIT 1`;
    if (!rows.length) return json(404, { error: "Challenge not found" });
    if (rows[0].expires_at && new Date(rows[0].expires_at) < new Date()) {
      return json(400, { error: "Challenge ended" });
    }
    const sc = Number(score);
    if (!Number.isFinite(sc)) return json(400, { error: "Invalid score" });

    const existing = await s`
      SELECT id, score FROM challenge_scores
      WHERE challenge_id = ${challengeId} AND user_id = ${user.id}
      LIMIT 1
    `;

    if (existing.length) {
      if (sc > existing[0].score) {
        await s`
          UPDATE challenge_scores
          SET score = ${sc}, created_at = NOW()
          WHERE id = ${existing[0].id}
        `;
      }
    } else {
      await s`
        INSERT INTO challenge_scores (id, challenge_id, user_id, score)
        VALUES (${randomUUID()}, ${challengeId}, ${user.id}, ${sc})
      `;
    }

    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Submit failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
