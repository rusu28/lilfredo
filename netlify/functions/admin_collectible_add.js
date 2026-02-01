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
    if (!isAdmin(user)) return json(403, { error: "Forbidden" });

    const body = JSON.parse(event.body || "{}");
    const username = String(body.username || "").trim();
    const characterId = String(body.character_id || "").trim();
    const rarity = String(body.rarity || "normal").trim() || "normal";
    const amount = Math.max(1, Math.min(200, Number(body.amount || 1) || 1));
    if (!characterId) return json(400, { error: "Missing character_id" });

    const s = getSql();
    let target = user.id;
    if (username) {
      const rows = await s`SELECT id FROM users WHERE LOWER(username) = ${username.toLowerCase()} LIMIT 1`;
      if (!rows || rows.length === 0) return json(404, { error: "User not found" });
      target = rows[0].id;
    }

    for (let i = 0; i < amount; i++) {
      const id = randomUUID();
      await s`
        INSERT INTO collectibles (id, user_id, character_id, rarity, variant)
        VALUES (${id}, ${target}, ${characterId}, ${rarity}, NULL)
      `;
    }

    return json(200, { ok: true, added: amount });
  } catch (e) {
    const msg = String(e?.message || "Add failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
