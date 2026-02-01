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
    const { characterId, rarity = "normal", variant = null } = JSON.parse(event.body || "{}");
    if (!characterId) return json(400, { error: "Missing characterId" });
    const s = getSql();
    const id = randomUUID();
    await s`
      INSERT INTO collectibles (id, user_id, character_id, rarity, variant)
      VALUES (${id}, ${user.id}, ${String(characterId)}, ${String(rarity)}, ${variant ? String(variant) : null})
    `;
    return json(200, { ok: true, id });
  } catch (e) {
    const msg = String(e?.message || "Award failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
