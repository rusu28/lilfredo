const bcrypt = require("bcryptjs");
const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const user = await requireAuth(token);
    const { username, email, currentPassword, newPassword } = JSON.parse(event.body || "{}");
    const s = getSql();

    if (username) {
      const uname = String(username).trim();
      if (uname.length < 3) return json(400, { error: "Username too short" });
      await s`UPDATE users SET username = ${uname} WHERE id = ${user.id}`;
    }
    if (email) {
      const mail = String(email).trim().toLowerCase();
      if (!mail.includes("@")) return json(400, { error: "Invalid email" });
      await s`UPDATE users SET email = ${mail} WHERE id = ${user.id}`;
    }
    if (newPassword) {
      if (String(newPassword).length < 4) return json(400, { error: "Password too short" });
      const rows = await s`SELECT password_hash FROM users WHERE id = ${user.id} LIMIT 1`;
      const hash = rows?.[0]?.password_hash;
      if (!hash) return json(400, { error: "User not found" });
      const ok = await bcrypt.compare(String(currentPassword || ""), hash);
      if (!ok) return json(400, { error: "Wrong password" });
      const newHash = await bcrypt.hash(String(newPassword), 10);
      await s`UPDATE users SET password_hash = ${newHash} WHERE id = ${user.id}`;
    }

    const updated = await s`SELECT id, username, email, role FROM users WHERE id = ${user.id} LIMIT 1`;
    return json(200, { user: updated?.[0] ?? null });
  } catch (e) {
    const msg = String(e?.message || "Update failed");
    if (msg.includes("unique")) return json(409, { error: "Username or email already used" });
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
