const { neon } = require("@netlify/neon");
const crypto = require("crypto");

let sql;
let schemaReady;

const getSql = () => {
  if (!sql) {
    sql = neon();
  }
  return sql;
};

const ensureSchema = async () => {
  if (schemaReady) return schemaReady;
  const s = getSql();
  schemaReady = (async () => {
    await s`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS profiles (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        avatar_url TEXT,
        bio TEXT,
        verified BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'`;
    await s`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT FALSE`;
    await s`
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS user_settings (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        settings JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS user_stats (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        best INT NOT NULL DEFAULT 0,
        sessions INT NOT NULL DEFAULT 0,
        highest_night INT NOT NULL DEFAULT 0,
        total_score INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS scores (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        score INT NOT NULL,
        night INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS seeds (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        seed TEXT NOT NULL,
        mode TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        config JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS follows (
        follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
        following_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (follower_id, following_id)
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        snapshot JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS post_likes (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, post_id)
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS post_favorites (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, post_id)
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS post_comments (
        id UUID PRIMARY KEY,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`ALTER TABLE post_comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE`;
    await s`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        payload JSONB,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY,
        from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`CREATE INDEX IF NOT EXISTS scores_created_at_idx ON scores(created_at DESC)`;
    await s`CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC)`;
    await s`CREATE INDEX IF NOT EXISTS seeds_created_at_idx ON seeds(created_at DESC)`;
    await s`CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC)`;
    await s`CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC)`;
  })();
  return schemaReady;
};

const json = (status, body) => ({
  statusCode: status,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  },
  body: JSON.stringify(body),
});

const requireAuth = async (token) => {
  if (!token) throw new Error("Unauthorized");
  const s = getSql();
  const rows = await s`
    SELECT u.id, u.username, u.email, u.role, pr.verified
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN profiles pr ON pr.user_id = u.id
    WHERE s.token = ${token}
      AND s.expires_at > NOW()
    LIMIT 1
  `;
  if (!rows || rows.length === 0) throw new Error("Unauthorized");
  return rows[0];
};

const makeToken = () => crypto.randomBytes(32).toString("hex");

const isAdmin = (user) => user?.role === "admin";

module.exports = { getSql, ensureSchema, json, requireAuth, makeToken, isAdmin };
