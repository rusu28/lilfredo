const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const body = JSON.parse(event.body || "{}");
    const payload = body?.export;
    if (!payload || typeof payload !== "object") return json(400, { error: "Invalid payload" });
    const s = getSql();
    if (payload.settings) {
      await s`
        INSERT INTO user_settings (user_id, settings)
        VALUES (${user.id}, ${payload.settings})
        ON CONFLICT (user_id) DO UPDATE SET settings = ${payload.settings}, updated_at = NOW()
      `;
    }
    if (Array.isArray(payload.seeds)) {
      for (const seed of payload.seeds) {
        await s`
          INSERT INTO seeds (id, user_id, name, seed, mode, difficulty, config)
          VALUES (${seed.id}, ${user.id}, ${seed.name}, ${seed.seed}, ${seed.mode}, ${seed.difficulty}, ${seed.config || {}})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }
    if (Array.isArray(payload.presets)) {
      for (const p of payload.presets) {
        await s`
          INSERT INTO presets (id, user_id, name, config, is_public)
          VALUES (${p.id}, ${user.id}, ${p.name}, ${p.config}, ${!!p.is_public})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Import failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
