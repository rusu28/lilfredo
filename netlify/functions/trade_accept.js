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
    const { tradeId } = JSON.parse(event.body || "{}");
    if (!tradeId) return json(400, { error: "Missing tradeId" });
    const s = getSql();
    const rows = await s`SELECT id, creator_id, partner_id, status FROM trades WHERE id = ${tradeId} LIMIT 1`;
    if (!rows?.length) return json(404, { error: "Trade not found" });
    const trade = rows[0];
    if (trade.status !== "open") return json(400, { error: "Trade not open" });
    if (trade.partner_id && trade.partner_id !== user.id) return json(403, { error: "Not allowed" });
    await s`
      UPDATE trades
      SET status = 'accepted', partner_id = COALESCE(partner_id, ${user.id}), updated_at = NOW()
      WHERE id = ${tradeId}
    `;
    await s`
      INSERT INTO audit_logs (id, user_id, action, details)
      VALUES (${randomUUID()}, ${user.id}, 'trade_accept', ${JSON.stringify({ tradeId })}::jsonb)
    `;
    return json(200, { ok: true });
  } catch (e) {
    const msg = String(e?.message || "Accept failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
