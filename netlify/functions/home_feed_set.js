const { getSql, ensureSchema, json, isAdmin, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    if (!isAdmin(user)) return json(403, { error: "Forbidden" });

    const { items } = JSON.parse(event.body || "{}");
    if (!Array.isArray(items)) return json(400, { error: "Invalid items" });

    const cleaned = items
      .filter(Boolean)
      .map((it) => ({
        id: String(it.id || ""),
        tag: String(it.tag || ""),
        title: String(it.title || ""),
        desc: String(it.desc || ""),
        imageKey: it.imageKey ? String(it.imageKey) : null,
      }))
      .filter((it) => it.title || it.desc || it.tag);

    const s = getSql();
    await s`
      INSERT INTO site_config (key, value)
      VALUES ('home_feed', ${JSON.stringify(cleaned)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;

    return json(200, { ok: true, items: cleaned });
  } catch (e) {
    const msg = String(e?.message || "Failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
