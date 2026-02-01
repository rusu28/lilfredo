const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const s = getSql();
    const settings = await s`SELECT settings FROM user_settings WHERE user_id = ${user.id} LIMIT 1`;
    const seeds = await s`SELECT id, name, seed, mode, difficulty, config FROM seeds WHERE user_id = ${user.id}`;
    const presets = await s`SELECT id, name, config, is_public FROM presets WHERE user_id = ${user.id}`;
    return json(200, {
      ok: true,
      export: {
        user: { id: user.id, username: user.username },
        settings: settings[0]?.settings || {},
        seeds,
        presets,
      },
    });
  } catch (e) {
    const msg = String(e?.message || "Export failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
