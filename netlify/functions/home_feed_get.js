const { getSql, ensureSchema, json } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const s = getSql();
    const rows = await s`SELECT value FROM site_config WHERE key = 'home_feed' LIMIT 1`;
    const items = rows?.[0]?.value || [];
    return json(200, { items });
  } catch (e) {
    const msg = String(e?.message || "Failed");
    return json(400, { error: msg });
  }
};
