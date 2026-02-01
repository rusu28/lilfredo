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

    const {
      title,
      type,
      description,
      settings,
      expiresAt,
      rewardCredits,
      rewardGadget,
      gearLock,
      presetName,
      difficultyScore,
      pinned,
      isPrivate,
      accessCode,
    } = JSON.parse(event.body || "{}");
    if (!title || !type) return json(400, { error: "Missing title or type" });

    const s = getSql();
    const id = randomUUID();
    const expires = expiresAt
      ? new Date(expiresAt)
      : new Date(Date.now() + 1000 * 60 * 60 * 24 * (type === "weekly" ? 7 : 1));

    const cfg = settings ? JSON.parse(JSON.stringify(settings)) : {};
    await s`
      INSERT INTO challenges (id, creator_id, title, type, description, settings, expires_at, reward_credits, reward_gadget, gear_lock, preset_name, difficulty_score, pinned, is_private, access_code)
      VALUES (
        ${id},
        ${user.id},
        ${title},
        ${type},
        ${description || null},
        ${cfg},
        ${expires.toISOString()},
        ${Number(rewardCredits) || 0},
        ${rewardGadget || null},
        ${gearLock || null},
        ${presetName || null},
        ${Number.isFinite(difficultyScore) ? difficultyScore : null},
        ${!!(pinned && user.role === "admin")},
        ${!!isPrivate},
        ${accessCode || null}
      )
    `;

    return json(200, { ok: true, id });
  } catch (e) {
    const msg = String(e?.message || "Create failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
