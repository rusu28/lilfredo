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
    const { name, seed, mode, difficulty, config } = JSON.parse(event.body || "{}");
    if (!name || !seed || !mode || !difficulty) return json(400, { error: "Missing fields" });
    const s = getSql();
    const id = randomUUID();
    const configJson = config ? JSON.stringify(config) : null;
    await s`
      INSERT INTO seeds (id, user_id, name, seed, mode, difficulty, config)
      VALUES (${id}, ${user.id}, ${String(name)}, ${String(seed)}, ${String(mode)}, ${String(difficulty)}, ${configJson}::jsonb)
    `;
    return json(200, { id });
  } catch (e) {
    const msg = String(e?.message || "Save failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
