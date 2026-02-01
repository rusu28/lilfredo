const { getSql, ensureSchema, json, requireAuth } = require("./_db");

const charMultiplier = (id) => {
  const s = String(id || "");
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  const val = (hash % 9990) / 100 + 0.1; // 0.1 .. 100.0
  const clamped = Math.max(0.1, Math.min(100, Number(val.toFixed(2))));
  return clamped;
};

const priceByRarity = (r) => {
  switch (String(r || "").toLowerCase()) {
    case "silver":
      return 75;
    case "gold":
      return 200;
    case "mythic":
      return 600;
    case "rainbow":
      return 1500;
    default:
      return 25;
  }
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const { id } = JSON.parse(event.body || "{}");
    if (!id) return json(400, { error: "Missing id" });
    const s = getSql();
    const rows = await s`
      SELECT id, rarity, character_id FROM collectibles
      WHERE id = ${id} AND user_id = ${user.id}
      LIMIT 1
    `;
    if (!rows || rows.length === 0) return json(404, { error: "Not found" });
    const rarity = rows[0].rarity;
    const multi = charMultiplier(rows[0].character_id || "");
    const price = Math.round(priceByRarity(rarity) * multi);

    await s`DELETE FROM collectibles WHERE id = ${id} AND user_id = ${user.id}`;

    const updated = await s`
      UPDATE user_settings
      SET settings = jsonb_set(
        COALESCE(settings, '{}'::jsonb),
        '{credits}',
        to_jsonb(COALESCE((settings->>'credits')::int, 0) + ${price}),
        true
      )
      WHERE user_id = ${user.id}
      RETURNING settings
    `;

    if (!updated || updated.length === 0) {
      await s`
        INSERT INTO user_settings (user_id, settings)
        VALUES (${user.id}, jsonb_build_object('credits', ${price}))
      `;
    }

    const after = await s`SELECT settings FROM user_settings WHERE user_id = ${user.id} LIMIT 1`;
    const credits = Number(after?.[0]?.settings?.credits || 0);
    return json(200, { ok: true, credits, price, multiplier: multi });
  } catch (e) {
    const msg = String(e?.message || "Sell failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
