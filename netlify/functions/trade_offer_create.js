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

    const { tradeId, items_offer } = JSON.parse(event.body || "{}");
    if (!tradeId) return json(400, { error: "Missing tradeId" });

    const s = getSql();
    const t = await s`SELECT id, creator_id, status, expires_at FROM trades WHERE id = ${tradeId} LIMIT 1`;
    if (!t || t.length === 0) return json(404, { error: "Trade not found" });
    if (t[0].expires_at && new Date(t[0].expires_at) < new Date()) return json(400, { error: "Trade expired" });

    const offerId = randomUUID();
    await s`
      INSERT INTO trade_offers (id, trade_id, offeror_id, items_offer, status)
      VALUES (${offerId}, ${tradeId}, ${user.id}, ${items_offer || []}, 'open')
    `;

    return json(200, { ok: true, id: offerId });
  } catch (e) {
    const msg = String(e?.message || "Offer failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
