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
    const rows = await s`SELECT best, sessions, highest_night, total_score FROM user_stats WHERE user_id = ${user.id} LIMIT 1`;
    return json(200, { stats: rows?.[0] ?? { best: 0, sessions: 0, highest_night: 0, total_score: 0 } });
  } catch (e) {
    return json(401, { error: "Unauthorized" });
  }
};
