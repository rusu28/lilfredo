const { getSql, ensureSchema, json } = require("./_db");

const getSeasonId = () => {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const s = getSql();
    const seasonId = getSeasonId();
    const seasonStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1, 0, 0, 0));
    const seasonEnd = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1, 0, 0, 0));
    await s`
      INSERT INTO seasons (id, starts_at, ends_at)
      VALUES (${seasonId}, ${seasonStart.toISOString()}, ${seasonEnd.toISOString()})
      ON CONFLICT (id) DO NOTHING
    `;
    return json(200, { seasonId, startsAt: seasonStart.toISOString(), endsAt: seasonEnd.toISOString() });
  } catch (e) {
    return json(400, { error: String(e?.message || "Load failed") });
  }
};
