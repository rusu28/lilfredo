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
    const { body, snapshot } = JSON.parse(event.body || "{}");
    if (!body || String(body).trim().length < 1) return json(400, { error: "Empty post" });
    const s = getSql();
    const id = randomUUID();
    const snapJson = snapshot ? JSON.stringify(snapshot) : null;
    await s`INSERT INTO posts (id, user_id, body, snapshot) VALUES (${id}, ${user.id}, ${String(body)}, ${snapJson}::jsonb)`;
    const mentions = extractMentions(body);
    for (const uname of mentions) {
      const u = await s`SELECT id FROM users WHERE lower(username) = ${String(uname).toLowerCase()} LIMIT 1`;
      if (u?.[0]?.id && u[0].id !== user.id) {
        await s`
          INSERT INTO notifications (id, user_id, type, payload)
          VALUES (${randomUUID()}, ${u[0].id}, 'mention', ${JSON.stringify({ from: user.username, postId: id })}::jsonb)
        `;
      }
    }
    return json(200, { id });
  } catch (e) {
    const msg = String(e?.message || "Create failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
