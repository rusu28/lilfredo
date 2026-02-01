const { getSql, ensureSchema, json, requireAuth } = require("./_db");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    await ensureSchema();
    const auth = event.headers?.authorization || event.headers?.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const viewer = await requireAuth(token);
    const username = event.queryStringParameters?.username;
    if (!username) return json(400, { error: "Missing username" });
    const s = getSql();
    const rows = await s`
      SELECT u.id, u.username, u.role, pr.avatar_url, pr.bio, pr.display_name, pr.display_font, pr.display_color, pr.banner_url, pr.background_url, pr.theme, pr.verified
      FROM users u
      LEFT JOIN profiles pr ON pr.user_id = u.id
      WHERE u.username = ${String(username)}
      LIMIT 1
    `;
    const profile = rows?.[0];
    if (!profile) return json(404, { error: "Not found" });

    const statsRows = await s`
      SELECT best, sessions, highest_night, total_score
      FROM user_stats
      WHERE user_id = ${profile.id}
      LIMIT 1
    `;
    const settingsRows = await s`
      SELECT settings
      FROM user_settings
      WHERE user_id = ${profile.id}
      LIMIT 1
    `;
    const featured = settingsRows?.[0]?.settings?.featuredAchievements ?? null;
    const badges = settingsRows?.[0]?.settings?.badgesSelected ?? null;
    const followers = await s`SELECT COUNT(*)::int AS c FROM follows WHERE following_id = ${profile.id}`;
    const following = await s`SELECT COUNT(*)::int AS c FROM follows WHERE follower_id = ${profile.id}`;
    const isFollowing = await s`SELECT 1 FROM follows WHERE follower_id = ${viewer.id} AND following_id = ${profile.id} LIMIT 1`;
    const isFollowedBy = await s`SELECT 1 FROM follows WHERE follower_id = ${profile.id} AND following_id = ${viewer.id} LIMIT 1`;
    const polls = await s`
      SELECT id, question, options, poll_type, allow_multiple, correct_index, edited_at, closes_at, created_at
      FROM polls
      WHERE user_id = ${profile.id}
      ORDER BY created_at DESC
      LIMIT 20
    `;
    const pollIds = polls.map((p) => p.id);
    let votes = [];
    if (pollIds.length) {
      votes = await s`
        SELECT poll_id, option_index, COUNT(*) AS c
        FROM poll_votes
        WHERE poll_id = ANY(${pollIds})
        GROUP BY poll_id, option_index
      `;
    }
    const pollGrouped = {};
    polls.forEach((p) => {
      pollGrouped[p.id] = { ...p, counts: Array((p.options || []).length).fill(0) };
    });
    votes.forEach((v) => {
      if (pollGrouped[v.poll_id]) {
        const idx = v.option_index;
        const counts = pollGrouped[v.poll_id].counts;
        if (idx >= 0 && idx < counts.length) counts[idx] = Number(v.c);
      }
    });

    return json(200, {
      profile,
      stats: statsRows?.[0] ?? { best: 0, sessions: 0, highest_night: 0, total_score: 0 },
      featured_achievements: featured,
      badges,
      followers: followers?.[0]?.c ?? 0,
      following: following?.[0]?.c ?? 0,
      is_following: !!isFollowing?.length,
      is_followed_by: !!isFollowedBy?.length,
      is_friend: !!isFollowing?.length && !!isFollowedBy?.length,
      polls: Object.values(pollGrouped),
    });
  } catch (e) {
    const msg = String(e?.message || "Load failed");
    if (msg.includes("Unauthorized")) return json(401, { error: "Unauthorized" });
    return json(400, { error: msg });
  }
};
