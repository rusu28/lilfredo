const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    if (user.role !== "admin") return json(403, { error: "Admin only" });
    const { username, credits } = JSON.parse(event.body || "{}");
    if (!username) return json(400, { error: "Missing username" });
    const c = Number(credits);
    if (!Number.isFinite(c) || c < 0) return json(400, { error: "Invalid credits" });
    const s = getSql();
    const rows = await s`SELECT id FROM users WHERE username = ${String(username)} LIMIT 1`;
    if (!rows.length) return json(404, { error: "User not found" });
    const userId = rows[0].id;
    await s`
      INSERT INTO user_settings (user_id, settings)
      VALUES (${userId}, jsonb_build_object('credits', ${c}::int))
      ON CONFLICT (user_id) DO UPDATE
        SET settings = COALESCE(user_settings.settings, '{}'::jsonb) || jsonb_build_object('credits', ${c}::int),
            updated_at = NOW()
    `;
    await s`
      INSERT INTO audit_logs (id, user_id, action, details)
      VALUES (gen_random_uuid(), ${user.id}, 'admin_set_credits', jsonb_build_object('target', ${userId}, 'username', ${username}, 'credits', ${c}))
    `;
    return json(200, { ok: true, userId, credits: c });
  } catch (e) {
    const msg = String(e?.message || "Update failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
