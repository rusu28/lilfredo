const { getSql, ensureSchema, json, requireAuth, isAdmin } = require("./_db");
const { randomUUID } = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);

    const { items_creator, items_partner, fee_credits, expires_days } = JSON.parse(event.body || "{}");
    const fee = Number(fee_credits) || 0;
    const days = Math.max(1, Math.min(7, Number(expires_days) || 7));
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    const s = getSql();
    const id = randomUUID();
    await s`
      INSERT INTO trades (id, creator_id, status, items_creator, items_partner, fee_credits, expires_at)
      VALUES (${id}, ${user.id}, 'open', ${items_creator || []}, ${items_partner || []}, ${fee}, ${expiresAt})
    `;

    return json(200, { ok: true, id, expires_at: expiresAt });
  } catch (e) {
    const msg = String(e?.message || "Create failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
