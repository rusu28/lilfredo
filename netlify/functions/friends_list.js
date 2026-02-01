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
      SELECT
        u.id,
        u.username,
        u.role,
        (SELECT settings->'badgesSelected' FROM user_settings us WHERE us.user_id = u.id) AS badges,
        (SELECT m.body
         FROM messages m
         WHERE (m.from_user_id = u.id AND m.to_user_id = ${user.id})
            OR (m.from_user_id = ${user.id} AND m.to_user_id = u.id)
         ORDER BY m.created_at DESC
         LIMIT 1) AS last_body,
        (SELECT m.created_at
         FROM messages m
         WHERE (m.from_user_id = u.id AND m.to_user_id = ${user.id})
            OR (m.from_user_id = ${user.id} AND m.to_user_id = u.id)
         ORDER BY m.created_at DESC
         LIMIT 1) AS last_at,
        (SELECT m.from_user_id
         FROM messages m
         WHERE (m.from_user_id = u.id AND m.to_user_id = ${user.id})
            OR (m.from_user_id = ${user.id} AND m.to_user_id = u.id)
         ORDER BY m.created_at DESC
         LIMIT 1) AS last_from_id,
        (SELECT COUNT(*)::int
         FROM messages m
         LEFT JOIN message_reads r ON r.user_id = ${user.id} AND r.with_user_id = u.id
         WHERE m.from_user_id = u.id
           AND m.to_user_id = ${user.id}
           AND m.created_at > COALESCE(r.last_read_at, '1970-01-01'::timestamptz)) AS unread_count
      FROM users u
      WHERE EXISTS (
        SELECT 1 FROM follows f1
        WHERE f1.follower_id = ${user.id} AND f1.following_id = u.id
      )
      AND EXISTS (
        SELECT 1 FROM follows f2
        WHERE f2.follower_id = u.id AND f2.following_id = ${user.id}
      )
      ORDER BY last_at DESC NULLS LAST, u.username ASC
      LIMIT 200
    `;
    return json(200, { friends: rows || [] });
  } catch (e) {
    const msg = String(e?.message || "Load failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
