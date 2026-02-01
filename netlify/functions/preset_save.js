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
    const { name, config, isPublic } = JSON.parse(event.body || "{}");
    if (!name || !config) return json(400, { error: "Missing name or config" });
    const s = getSql();
    const id = randomUUID();
    await s`
      INSERT INTO presets (id, user_id, name, config, is_public)
      VALUES (${id}, ${user.id}, ${name}, ${config}, ${!!isPublic})
    `;
    return json(200, { ok: true, id });
  } catch (e) {
    const msg = String(e?.message || "Save failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
