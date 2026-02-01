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
      SELECT t.id, t.creator_id, t.partner_id, t.status, t.items_creator, t.items_partner, t.fee_credits,
             t.created_at, t.updated_at, t.expires_at,
             u.username AS creator_username,
             p.username AS partner_username,
             CASE WHEN t.expires_at IS NOT NULL AND t.expires_at < NOW() THEN 'expired' ELSE t.status END AS effective_status
      FROM trades t
      JOIN users u ON u.id = t.creator_id
      LEFT JOIN users p ON p.id = t.partner_id
      WHERE t.creator_id = ${user.id} OR t.partner_id = ${user.id}
      ORDER BY t.created_at DESC
      LIMIT 200
    `;
    return json(200, { trades: rows || [] });
  } catch (e) {
    const msg = String(e?.message || "Load failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
