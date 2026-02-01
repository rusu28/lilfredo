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
    const { question, options, closesAt, pollType, allowMultiple, correctIndex } = JSON.parse(event.body || "{}");
    if (!question || !Array.isArray(options) || options.length < 2) return json(400, { error: "Need question + 2 options" });
    const s = getSql();
    const id = randomUUID();
    const type = pollType === "quiz" ? "quiz" : pollType === "multi" ? "multi" : "single";
    const multi = type === "multi" || !!allowMultiple;
    let correct = type === "quiz" && Number.isInteger(correctIndex) ? Number(correctIndex) : null;
    if (correct !== null && (correct < 0 || correct >= options.length)) correct = null;
    await s`
      INSERT INTO polls (id, user_id, question, options, poll_type, allow_multiple, correct_index, closes_at)
      VALUES (${id}, ${user.id}, ${question}, ${options}, ${type}, ${multi}, ${correct}, ${closesAt || null})
    `;
    return json(200, { ok: true, id });
  } catch (e) {
    const msg = String(e?.message || "Create failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
