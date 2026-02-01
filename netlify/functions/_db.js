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
        display_name TEXT,
        display_font TEXT,
        display_color TEXT,
        banner_url TEXT,
        background_url TEXT,
        theme JSONB,
        verified BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'`;
    await s`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT FALSE`;
    await s`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT`;
    await s`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_font TEXT`;
    await s`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_color TEXT`;
    await s`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_url TEXT`;
    await s`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_url TEXT`;
    await s`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme JSONB`;
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
        created_at TIMESTAMPTZ DEFAULT NOW(),
        edited_at TIMESTAMPTZ
      )
    `;
    await s`ALTER TABLE posts ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ`;
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
    await s`
      CREATE TABLE IF NOT EXISTS message_reads (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        last_read_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, with_user_id)
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        details JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS spin_logs (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        reward_id TEXT NOT NULL,
        reward_label TEXT NOT NULL,
        rarity TEXT,
        bet INT NOT NULL,
        seed TEXT,
        duration_ms INT,
        credits_before INT,
        credits_after INT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS presets (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        config JSONB NOT NULL,
        is_public BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS polls (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        options TEXT[] NOT NULL,
        poll_type TEXT NOT NULL DEFAULT 'single',
        allow_multiple BOOLEAN NOT NULL DEFAULT FALSE,
        correct_index INT,
        edited_at TIMESTAMPTZ,
        closes_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`ALTER TABLE polls ADD COLUMN IF NOT EXISTS poll_type TEXT NOT NULL DEFAULT 'single'`;
    await s`ALTER TABLE polls ADD COLUMN IF NOT EXISTS allow_multiple BOOLEAN NOT NULL DEFAULT FALSE`;
    await s`ALTER TABLE polls ADD COLUMN IF NOT EXISTS correct_index INT`;
    await s`ALTER TABLE polls ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ`;
    await s`
      CREATE TABLE IF NOT EXISTS poll_votes (
        poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        option_index INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (poll_id, user_id)
      )
    `;
    await s`ALTER TABLE poll_votes DROP CONSTRAINT IF EXISTS poll_votes_pkey`;
    await s`ALTER TABLE poll_votes ADD PRIMARY KEY (poll_id, user_id, option_index)`;
    await s`
      CREATE TABLE IF NOT EXISTS challenge_completions (
        challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        completed_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (challenge_id, user_id)
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS challenges (
        id UUID PRIMARY KEY,
        creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        settings JSONB,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS reward_credits INT NOT NULL DEFAULT 0`;
    await s`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS reward_gadget TEXT`;
    await s`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS gear_lock JSONB`;
    await s`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS preset_name TEXT`;
    await s`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS difficulty_score INT`;
    await s`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT FALSE`;
    await s`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT FALSE`;
    await s`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS access_code TEXT`;
    await s`
      CREATE TABLE IF NOT EXISTS challenge_scores (
        id UUID PRIMARY KEY,
        challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        score INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS seasons (
        id TEXT PRIMARY KEY,
        starts_at TIMESTAMPTZ NOT NULL,
        ends_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS season_badges (
        id UUID PRIMARY KEY,
        season_id TEXT REFERENCES seasons(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        badge_id TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS collectibles (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        character_id TEXT NOT NULL,
        rarity TEXT NOT NULL,
        variant TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS trades (
        id UUID PRIMARY KEY,
        creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
        partner_id UUID REFERENCES users(id) ON DELETE SET NULL,
        status TEXT NOT NULL DEFAULT 'open',
        items_creator JSONB,
        items_partner JSONB,
        fee_credits INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`
      CREATE TABLE IF NOT EXISTS site_config (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await s`ALTER TABLE scores ADD COLUMN IF NOT EXISTS season_id TEXT`;
    await s`CREATE INDEX IF NOT EXISTS challenge_scores_idx ON challenge_scores(challenge_id, score DESC, created_at ASC)`;
    await s`CREATE INDEX IF NOT EXISTS spin_logs_user_idx ON spin_logs(user_id, created_at DESC)`;
    await s`CREATE INDEX IF NOT EXISTS audit_logs_user_idx ON audit_logs(user_id, created_at DESC)`;
    await s`CREATE INDEX IF NOT EXISTS scores_created_at_idx ON scores(created_at DESC)`;
    await s`CREATE INDEX IF NOT EXISTS scores_season_idx ON scores(season_id, score DESC, created_at DESC)`;
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
