const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const { avatarUrl, bio } = JSON.parse(event.body || "{}");
    const s = getSql();
    await s`
      INSERT INTO profiles (user_id, avatar_url, bio)
      VALUES (${user.id}, ${avatarUrl ?? null}, ${bio ?? null})
      ON CONFLICT (user_id) DO UPDATE SET avatar_url = EXCLUDED.avatar_url, bio = EXCLUDED.bio
    `;
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Update failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
