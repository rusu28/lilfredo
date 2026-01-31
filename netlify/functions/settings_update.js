const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const { settings } = JSON.parse(event.body || "{}");
    if (!settings || typeof settings !== "object") return json(400, { error: "Invalid settings" });
    const s = getSql();
    const settingsJson = JSON.stringify(settings);
    await s`
      INSERT INTO user_settings (user_id, settings)
      VALUES (${user.id}, ${settingsJson}::jsonb)
      ON CONFLICT (user_id) DO UPDATE SET settings = EXCLUDED.settings, updated_at = NOW()
    `;
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Save failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
