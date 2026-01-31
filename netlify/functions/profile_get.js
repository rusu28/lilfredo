const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    await requireAuth(token);
    const username = event.queryStringParameters?.username;
    if (!username) return json(400, { error: "Missing username" });
    const s = getSql();
    const rows = await s`
      SELECT u.id, u.username, pr.avatar_url, pr.bio, pr.verified
      FROM users u
      LEFT JOIN profiles pr ON pr.user_id = u.id
      WHERE u.username = ${String(username)}
      LIMIT 1
    `;
    return json(200, { profile: rows?.[0] ?? null });
  } catch (e) {
    const msg = String(e?.message || "Load failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
