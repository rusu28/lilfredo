const bcrypt = require("bcryptjs");
const { getSql, ensureSchema, json, makeToken } = require("./_db");
const { randomUUID } = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const { username, email, password, guestTransfer } = JSON.parse(event.body || "{}");
    if (!username || !email || !password) return json(400, { error: "Missing fields" });
    if (!String(email).includes("@")) return json(400, { error: "Invalid email" });
    if (String(password).length < 4) return json(400, { error: "Password too short" });
    const s = getSql();
    const hash = await bcrypt.hash(password, 10);
    const id = randomUUID();
    const uname = String(username).trim();
    const mail = String(email).trim().toLowerCase();
    const role = uname.toLowerCase() === "rva" ? "admin" : "user";
    const verified = uname.toLowerCase() === "rva";
    await s`INSERT INTO users (id, username, email, password_hash, role) VALUES (${id}, ${uname}, ${mail}, ${hash}, ${role})`;
    await s`INSERT INTO profiles (user_id, avatar_url, bio, verified) VALUES (${id}, NULL, NULL, ${verified})`;
    if (guestTransfer && typeof guestTransfer === "object") {
      const settings = guestTransfer.settings && typeof guestTransfer.settings === "object" ? guestTransfer.settings : null;
      if (settings) {
        await s`
          INSERT INTO user_settings (user_id, settings)
          VALUES (${id}, ${JSON.stringify(settings)}::jsonb)
          ON CONFLICT (user_id) DO UPDATE
            SET settings = COALESCE(user_settings.settings, '{}'::jsonb) || ${JSON.stringify(settings)}::jsonb,
                updated_at = NOW()
        `;
      }
      const stats = guestTransfer.stats && typeof guestTransfer.stats === "object" ? guestTransfer.stats : null;
      if (stats) {
        const best = Math.max(0, Math.floor(Number(stats.best) || 0));
        const sessions = Math.max(0, Math.floor(Number(stats.sessions) || 0));
        const highest = Math.max(0, Math.floor(Number(stats.highest_night) || 0));
        const total = Math.max(0, Math.floor(Number(stats.total_score) || 0));
        await s`
          INSERT INTO user_stats (user_id, best, sessions, highest_night, total_score)
          VALUES (${id}, ${best}, ${sessions}, ${highest}, ${total})
          ON CONFLICT (user_id) DO UPDATE SET
            best = GREATEST(user_stats.best, EXCLUDED.best),
            sessions = user_stats.sessions + EXCLUDED.sessions,
            highest_night = GREATEST(user_stats.highest_night, EXCLUDED.highest_night),
            total_score = user_stats.total_score + EXCLUDED.total_score,
            updated_at = NOW()
        `;
      }
      if (Array.isArray(guestTransfer.seeds)) {
        for (const seed of guestTransfer.seeds) {
          if (!seed?.seed || !seed?.name) continue;
          await s`
            INSERT INTO seeds (id, user_id, name, seed, mode, difficulty, config)
            VALUES (${randomUUID()}, ${id}, ${String(seed.name)}, ${String(seed.seed)}, ${String(seed.mode || "custom")}, ${String(seed.difficulty || "normal")}, ${JSON.stringify(seed.config || {})}::jsonb)
          `;
        }
      }
    }
    const token = makeToken();
    await s`INSERT INTO sessions (token, user_id, expires_at) VALUES (${token}, ${id}, NOW() + INTERVAL '30 days')`;
    return json(200, { token, user: { id, username: uname, email: mail } });
  } catch (e) {
    const msg = String(e?.message || "Register failed");
    if (msg.includes("unique")) return json(409, { error: "Username or email already used" });
    return json(400, { error: msg });
  }
};
