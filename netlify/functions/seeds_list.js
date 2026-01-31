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
    const rows = await s`
      SELECT id, name, seed, mode, difficulty, config, created_at
      FROM seeds
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return json(200, { seeds: rows || [] });
  } catch (e) {
    return json(401, { error: "Unauthorized" });
  }
};
