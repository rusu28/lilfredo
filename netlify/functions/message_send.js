const { getSql, ensureSchema, json, requireAuth } = require("./_db");
const { randomUUID } = require("crypto");

const extractMentions = (text) => {
  const mentions = new Set();
  const re = /@([a-zA-Z0-9_\.]+)/g;
  let m;
  while ((m = re.exec(String(text))) !== null) {
    mentions.add(m[1]);
  }
  return [...mentions];
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const { toUserId, body } = JSON.parse(event.body || "{}");
    if (!toUserId || !body) return json(400, { error: "Missing fields" });
    const s = getSql();
    const f1 = await s`SELECT 1 FROM follows WHERE follower_id = ${user.id} AND following_id = ${toUserId} LIMIT 1`;
    const f2 = await s`SELECT 1 FROM follows WHERE follower_id = ${toUserId} AND following_id = ${user.id} LIMIT 1`;
    if (!f1?.length || !f2?.length) return json(403, { error: "Not friends" });
    const id = randomUUID();
    await s`INSERT INTO messages (id, from_user_id, to_user_id, body) VALUES (${id}, ${user.id}, ${toUserId}, ${String(body)})`;
    await s`
      INSERT INTO notifications (id, user_id, type, payload)
      VALUES (${randomUUID()}, ${toUserId}, 'message', ${JSON.stringify({ from: user.username })}::jsonb)
    `;
    const mentions = extractMentions(body);
    for (const uname of mentions) {
      const u = await s`SELECT id FROM users WHERE lower(username) = ${String(uname).toLowerCase()} LIMIT 1`;
      if (u?.[0]?.id && u[0].id !== user.id) {
        await s`
          INSERT INTO notifications (id, user_id, type, payload)
          VALUES (${randomUUID()}, ${u[0].id}, 'mention', ${JSON.stringify({ from: user.username, messageId: id })}::jsonb)
        `;
      }
    }
    return json(200, { id });
  } catch (e) {
    const msg = String(e?.message || "Send failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
