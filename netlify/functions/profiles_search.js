const { getSql, ensureSchema, json } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    // public search
    const q = (event.queryStringParameters?.q || "").trim();
    if (!q) return json(200, { results: [] });
    const s = getSql();
    const rows = await s`
      SELECT u.id, u.username, u.role, pr.avatar_url, pr.verified
      FROM users u
      LEFT JOIN profiles pr ON pr.user_id = u.id
      WHERE u.username ILIKE ${"%" + q + "%"}
      ORDER BY u.username ASC
      LIMIT 10
    `;
    return json(200, { results: rows || [] });
  } catch (e) {
    const msg = String(e?.message || "Search failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
