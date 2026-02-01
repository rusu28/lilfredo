const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    await requireAuth(token);

    const tradeId = event.queryStringParameters?.tradeId;
    if (!tradeId) return json(400, { error: "Missing tradeId" });

    const s = getSql();
    const rows = await s`
      SELECT o.id, o.trade_id, o.offeror_id, o.items_offer, o.status, o.accepted_by_creator, o.accepted_by_offeror, o.created_at,
             u.username AS offeror_username
      FROM trade_offers o
      JOIN users u ON u.id = o.offeror_id
      WHERE o.trade_id = ${tradeId}
      ORDER BY o.created_at DESC
      LIMIT 200
    `;
    return json(200, { offers: rows || [] });
  } catch (e) {
    const msg = String(e?.message || "Load failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
