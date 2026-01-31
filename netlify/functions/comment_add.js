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
    const { postId, body, parentId } = JSON.parse(event.body || "{}");
    if (!postId || !body) return json(400, { error: "Missing fields" });
    const s = getSql();
    const id = randomUUID();
    const parent = parentId ? String(parentId) : null;
    await s`INSERT INTO post_comments (id, post_id, user_id, body, parent_id) VALUES (${id}, ${postId}, ${user.id}, ${String(body)}, ${parent})`;
    const owner = await s`SELECT user_id FROM posts WHERE id = ${postId} LIMIT 1`;
    if (owner?.[0]?.user_id && owner[0].user_id !== user.id) {
      await s`
        INSERT INTO notifications (id, user_id, type, payload)
        VALUES (${require("crypto").randomUUID()}, ${owner[0].user_id}, 'comment', ${JSON.stringify({ from: user.username, postId })}::jsonb)
      `;
    }
    if (parent) {
      const parentRow = await s`SELECT user_id FROM post_comments WHERE id = ${parent} LIMIT 1`;
      if (parentRow?.[0]?.user_id && parentRow[0].user_id !== user.id) {
        await s`
          INSERT INTO notifications (id, user_id, type, payload)
          VALUES (${require("crypto").randomUUID()}, ${parentRow[0].user_id}, 'reply', ${JSON.stringify({ from: user.username, postId, parentId: parent })}::jsonb)
        `;
      }
    }
    const mentions = new Set();
    const re = /@([a-zA-Z0-9_\.]+)/g;
    let m;
    while ((m = re.exec(String(body))) !== null) {
      mentions.add(m[1]);
    }
    for (const uname of mentions) {
      const u = await s`SELECT id FROM users WHERE lower(username) = ${String(uname).toLowerCase()} LIMIT 1`;
      if (u?.[0]?.id && u[0].id !== user.id) {
        await s`
          INSERT INTO notifications (id, user_id, type, payload)
          VALUES (${require("crypto").randomUUID()}, ${u[0].id}, 'mention', ${JSON.stringify({ from: user.username, postId, commentId: id })}::jsonb)
        `;
      }
    }
    return json(200, { id });
  } catch (e) {
    const msg = String(e?.message || "Comment failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
