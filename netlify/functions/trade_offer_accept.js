const { getSql, ensureSchema, json, requireAuth } = require("./_db");

const getCredits = (settings) => {
  if (!settings || typeof settings !== "object") return 0;
  const c = Number(settings.credits || 0);
  return Number.isFinite(c) ? c : 0;
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);

    const { offerId } = JSON.parse(event.body || "{}");
    if (!offerId) return json(400, { error: "Missing offerId" });

    const s = getSql();
    const rows = await s`
      SELECT o.id, o.trade_id, o.offeror_id, o.accepted_by_creator, o.accepted_by_offeror,
             t.creator_id, t.status, t.fee_credits, t.expires_at
      FROM trade_offers o
      JOIN trades t ON t.id = o.trade_id
      WHERE o.id = ${offerId}
      LIMIT 1
    `;
    if (!rows || rows.length === 0) return json(404, { error: "Offer not found" });
    const r = rows[0];
    if (r.expires_at && new Date(r.expires_at) < new Date()) return json(400, { error: "Trade expired" });

    let acceptedByCreator = r.accepted_by_creator;
    let acceptedByOfferor = r.accepted_by_offeror;

    if (user.id === r.creator_id) acceptedByCreator = true;
    if (user.id === r.offeror_id) acceptedByOfferor = true;

    await s`
      UPDATE trade_offers
      SET accepted_by_creator = ${acceptedByCreator}, accepted_by_offeror = ${acceptedByOfferor}
      WHERE id = ${offerId}
    `;

    if (acceptedByCreator && acceptedByOfferor) {
      const fee = Number(r.fee_credits || 0);
      await s`UPDATE trades SET status = 'completed', updated_at = NOW() WHERE id = ${r.trade_id}`;
      if (fee > 0) {
        const creatorSettings = await s`SELECT settings FROM user_settings WHERE user_id = ${r.creator_id} LIMIT 1`;
        const offerorSettings = await s`SELECT settings FROM user_settings WHERE user_id = ${r.offeror_id} LIMIT 1`;
        const creatorCredits = getCredits(creatorSettings?.[0]?.settings);
        const offerorCredits = getCredits(offerorSettings?.[0]?.settings);
        await s`
          INSERT INTO user_settings (user_id, settings)
          VALUES (${r.creator_id}, ${JSON.stringify({ credits: Math.max(0, creatorCredits - fee) })})
          ON CONFLICT (user_id) DO UPDATE SET settings = jsonb_set(user_settings.settings, '{credits}', to_jsonb(${Math.max(0, creatorCredits - fee)}), true)
        `;
        await s`
          INSERT INTO user_settings (user_id, settings)
          VALUES (${r.offeror_id}, ${JSON.stringify({ credits: Math.max(0, offerorCredits - fee) })})
          ON CONFLICT (user_id) DO UPDATE SET settings = jsonb_set(user_settings.settings, '{credits}', to_jsonb(${Math.max(0, offerorCredits - fee)}), true)
        `;
      }
    }

    return json(200, { ok: true, accepted_by_creator: acceptedByCreator, accepted_by_offeror: acceptedByOfferor });
  } catch (e) {
    const msg = String(e?.message || "Accept failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
