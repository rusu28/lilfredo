import React, { useRef, useEffect } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { SocialProfileProps } from "./types";
import { resolveAvatarSource } from "./avatar-source";

const PRIMARY = "#4f9cff";
const BG = "#0b1118";
const SURFACE = "#0f1621";
const CARD = "#131c28";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#e7edf5";
const MUTED = "#9aa6b2";
const MUTED2 = "#7b8796";

export default function ProfileScreen({
  profileView,
  profileFollowers,
  profileFollowing,
  profileStats,
  profileFeatured,
  profileBadges,
  badgeMeta,
  profileIsFollowing,
  profileIsFriend,
  profileLikedPosts,
  profileFavoritePosts,
  profilePosts,
  profilePolls,
  achievementMeta,
  authUser,
  authToken,
  bannerSource,
  backgroundSource,
  dmDraft,
  dmMessages,
  isAdmin,
  onBack,
  onFollowToggle,
  onRefreshProfile,
  onLoadProfileMessages,
  onDmDraftChange,
  onSendMessage,
  onAdminAction,
}: SocialProfileProps) {
  const canInteract = authToken && authUser?.id && profileView?.id && profileView.id !== authUser.id;
  const isMe = authUser?.username && profileView?.username === authUser.username;
  const [tab, setTab] = React.useState<"posts" | "likes" | "favorites" | "polls">("posts");
  const mythicPulse = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(mythicPulse, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(mythicPulse, { toValue: 0, duration: 1500, useNativeDriver: false }),
      ])
    ).start();
  }, [mythicPulse]);

  const mythicBorder = mythicPulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["#ff5fd7", "#5fd1ff", "#7dff8a"],
  });
  const displayName = profileView?.display_name || profileView?.username || "Unknown";
  const displayFont = profileView?.display_font || undefined;
  const displayColor = profileView?.display_color || TEXT;
  const BadgeInline = ({ ids, size = 14 }: { ids?: string[]; size?: number }) => {
    if (!ids?.length || !badgeMeta) return null;
    return (
      <View style={styles.badgeInlineRow}>
        {ids.map((id) => {
          const meta = badgeMeta[id];
          if (!meta) return null;
          if (meta.type === "emoji") {
            return (
              <Text key={id} style={[styles.badgeEmoji, { fontSize: size }]}>
                {meta.value}
              </Text>
            );
          }
          if (meta.type === "icon") {
            return <MaterialIcons key={id} name={meta.value as any} size={size} color="#e7edf5" />;
          }
          return <Image key={id} source={meta.value as any} style={{ width: size, height: size, borderRadius: 4 }} />;
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <MaterialIcons name="person" size={18} color="#fff" />
            </View>
            <Text style={styles.brandText}>FNAP Profile</Text>
          </View>
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
            <MaterialIcons name="arrow-back" size={18} color={TEXT} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>

        <View style={[styles.hero, backgroundSource ? { overflow: "hidden" } : null]}>
          {backgroundSource ? <Image source={backgroundSource} style={styles.heroBg} resizeMode="cover" /> : null}
          {backgroundSource ? <View style={styles.heroOverlay} /> : null}
          <View style={styles.heroTop}>
            <Image source={resolveAvatarSource(profileView?.avatar_url)} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: displayColor, fontFamily: displayFont }]} numberOfLines={2}>
                  {displayName}
                </Text>
                <BadgeInline ids={profileBadges} size={14} />
                {profileView?.verified ? (
                  <View style={styles.verifiedBadge}>
                    <MaterialIcons name="check" size={12} color="#fff" />
                  </View>
                ) : null}
                {profileView?.role === "admin" ? <Text style={styles.adminTag}>ADMIN</Text> : null}
              </View>
              {!!profileView?.bio && <Text style={styles.bio}>{profileView.bio}</Text>}
            </View>
            {canInteract && (
              <Pressable onPress={onFollowToggle} style={styles.followBtn}>
                <Text style={styles.followBtnText}>{profileIsFollowing ? "Unfollow" : "Follow"}</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.statsRow}>
            {[
              { label: "Followers", value: profileFollowers },
              { label: "Following", value: profileFollowing },
              { label: "Best", value: profileStats?.best ?? 0 },
            ].map((s) => (
              <View key={s.label} style={styles.statBox}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {profileFeatured?.length ? (
            <View style={styles.featuredRow}>
              {profileFeatured.map((f) => {
                const meta = achievementMeta?.[f];
                const tier = meta?.tier || "common";
                const label = meta?.name || f;
                const color =
                  tier === "rare"
                    ? "#63b7ff"
                    : tier === "epic"
                    ? "#9c7dff"
                    : tier === "legendary"
                    ? "#ffbd6a"
                    : tier === "mythic"
                    ? "#ff7ad7"
                    : "#8ea0b2";
                const baseStyle = [
                  styles.featuredChip,
                  { borderColor: color, shadowColor: color + "99", shadowOpacity: 0.7, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
                ];
                if (tier === "mythic") {
                  return (
                    <Animated.View key={f} style={[...baseStyle, { borderColor: mythicBorder, shadowColor: color, backgroundColor: "rgba(40,0,60,0.35)" }]}>
                      <Text style={styles.featuredText}>{label}</Text>
                    </Animated.View>
                  );
                }
                return (
                  <View key={f} style={[...baseStyle, { backgroundColor: "rgba(20,24,30,0.7)" }]}>
                    <Text style={styles.featuredText}>{label}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          {profileBadges?.length ? (
            <View style={styles.badgeRow}>
              {profileBadges.map((id) => {
                const meta = badgeMeta?.[id];
                if (!meta) return null;
                return (
                  <View key={id} style={styles.badgeChip}>
                    {meta.type === "emoji" || meta.type === "icon" ? (
                      <Text style={styles.badgeEmoji}>{meta.value}</Text>
                    ) : (
                      <Image source={meta.value} style={styles.badgeImg} />
                    )}
                    <Text style={styles.badgeLabel}>{meta.name}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionRow}>
            <Pressable onPress={onRefreshProfile} style={styles.actionBtn}>
              <MaterialIcons name="refresh" size={18} color={PRIMARY} />
              <Text style={styles.actionText}>Refresh</Text>
            </Pressable>
            {isAdmin && canInteract && (
              <>
                <Pressable onPress={() => onAdminAction("admin")} style={styles.actionBtn}>
                  <MaterialIcons name="verified" size={18} color={PRIMARY} />
                  <Text style={styles.actionText}>Make Admin</Text>
                </Pressable>
                <Pressable onPress={() => onAdminAction("user")} style={styles.actionBtn}>
                  <MaterialIcons name="person" size={18} color={PRIMARY} />
                  <Text style={styles.actionText}>Make User</Text>
                </Pressable>
                <Pressable onPress={() => onAdminAction("verify")} style={styles.actionBtn}>
                  <MaterialIcons name="check-circle" size={18} color={PRIMARY} />
                  <Text style={styles.actionText}>Verify</Text>
                </Pressable>
                <Pressable onPress={() => onAdminAction("unverify")} style={styles.actionBtn}>
                  <MaterialIcons name="block" size={18} color="#ff7070" />
                  <Text style={styles.actionText}>Unverify</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {canInteract && profileIsFriend && (
          <View style={styles.card}>
            <View style={styles.messagesHeader}>
              <Text style={styles.sectionTitle}>Messages</Text>
              <Pressable onPress={onLoadProfileMessages} style={styles.loadBtn}>
                <Text style={styles.loadBtnText}>Load</Text>
              </Pressable>
            </View>
            <View style={styles.messageList}>
              {dmMessages.map((m) => (
                <View key={m.id} style={styles.messageRow}>
                  <View style={styles.nameInlineRow}><Text style={styles.messageAuthor}>{m.username}</Text><BadgeInline ids={(m as any).from_badges || (m as any).badges} size={10} /></View>
                  <Text style={styles.messageText}>{m.body}</Text>
                </View>
              ))}
              {!dmMessages.length && <Text style={styles.emptyText}>No messages yet.</Text>}
            </View>
            <View style={styles.composerRow}>
              <TextInput
                value={dmDraft}
                onChangeText={onDmDraftChange}
                placeholder="Write a message..."
                placeholderTextColor={MUTED2}
                style={styles.input}
              />
              <Pressable onPress={onSendMessage} style={styles.sendBtn}>
                <MaterialIcons name="send" size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.tabsRow}>
            <Pressable onPress={() => setTab("posts")} style={styles.tabBtn}>
              <Text style={[styles.tabText, tab === "posts" && styles.tabTextActive]}>Posts</Text>
            </Pressable>
            {isMe ? (
              <Pressable onPress={() => setTab("likes")} style={styles.tabBtn}>
                <Text style={[styles.tabText, tab === "likes" && styles.tabTextActive]}>Likes</Text>
              </Pressable>
            ) : null}
            {isMe ? (
              <Pressable onPress={() => setTab("favorites")} style={styles.tabBtn}>
                <Text style={[styles.tabText, tab === "favorites" && styles.tabTextActive]}>Favorites</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={() => setTab("polls")} style={styles.tabBtn}>
              <Text style={[styles.tabText, tab === "polls" && styles.tabTextActive]}>Polls</Text>
            </Pressable>
          </View>

          {tab === "posts" ? (
            <>
              {profilePosts.length === 0 && <Text style={styles.emptyText}>No posts yet.</Text>}
              {profilePosts.map((p) => (
                <View key={`post-${p.id}`} style={styles.postRow}>
                  <View style={styles.nameInlineRow}><Text style={styles.postAuthor}>{p.username}</Text><BadgeInline ids={(p as any).badges || profileBadges} size={12} /></View>
                  <Text style={styles.postBody} numberOfLines={2}>
                    {p.body}
                  </Text>
                </View>
              ))}
            </>
          ) : null}

          {isMe && tab === "likes" ? (
            <>
              {profileLikedPosts.length === 0 && <Text style={styles.emptyText}>No likes yet.</Text>}
              {profileLikedPosts.map((p) => (
                <View key={`like-${p.id}`} style={styles.postRow}>
                  <View style={styles.nameInlineRow}><Text style={styles.postAuthor}>{p.username}</Text><BadgeInline ids={(p as any).badges || profileBadges} size={12} /></View>
                  <Text style={styles.postBody} numberOfLines={2}>
                    {p.body}
                  </Text>
                </View>
              ))}
            </>
          ) : null}

          {isMe && tab === "favorites" ? (
            <>
              {profileFavoritePosts.length === 0 && <Text style={styles.emptyText}>No favorites yet.</Text>}
              {profileFavoritePosts.map((p) => (
                <View key={`fav-${p.id}`} style={styles.postRow}>
                  <View style={styles.nameInlineRow}><Text style={styles.postAuthor}>{p.username}</Text><BadgeInline ids={(p as any).badges || profileBadges} size={12} /></View>
                  <Text style={styles.postBody} numberOfLines={2}>
                    {p.body}
                  </Text>
                </View>
              ))}
            </>
          ) : null}

          {tab === "polls" ? (
            <>
              {(profilePolls || []).length === 0 && <Text style={styles.emptyText}>No polls yet.</Text>}
              {(profilePolls || []).map((p: any) => (
                <View key={`poll-${p.id}`} style={styles.postRow}>
                  <Text style={styles.postAuthor}>{p.question}</Text>
                  <Text style={styles.postBody} numberOfLines={2}>
                    {(p.options || []).join(" • ")}
                  </Text>
                </View>
              ))}
            </>
          ) : null}
        </View>

        {!isMe && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Posts</Text>
            {profilePosts.length === 0 && <Text style={styles.emptyText}>No posts yet.</Text>}
            {profilePosts.map((p) => (
              <View key={`post-${p.id}`} style={styles.postRow}>
                <View style={styles.nameInlineRow}><Text style={styles.postAuthor}>{p.username}</Text><BadgeInline ids={(p as any).badges || profileBadges} size={12} /></View>
                <Text style={styles.postBody} numberOfLines={2}>
                  {p.body}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { paddingHorizontal: 16, paddingBottom: 24 },
  header: {
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { fontSize: 18, fontWeight: "900", color: TEXT },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: SURFACE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
  },
  backText: { color: TEXT, fontWeight: "800" },
  hero: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 14,
  },
  heroBg: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, width: "100%", height: "100%" },
  heroOverlay: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(10,12,18,0.65)" },
  heroTop: { flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: { width: 78, height: 78, borderRadius: 39, backgroundColor: SURFACE },
  avatarFallback: { width: 78, height: 78, borderRadius: 39, backgroundColor: SURFACE },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  nameInlineRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  name: { fontSize: 18, fontWeight: "900", color: TEXT },
  verifiedBadge: { width: 16, height: 16, borderRadius: 8, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center" },
  adminTag: { color: PRIMARY, fontWeight: "900", fontSize: 12 },
  bio: { marginTop: 4, color: MUTED },
  followBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  followBtnText: { color: "#fff", fontWeight: "900" },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  statBox: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  statValue: { fontSize: 16, fontWeight: "900", color: TEXT },
  statLabel: { fontSize: 11, color: MUTED2, textTransform: "uppercase" },
  featuredRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  featuredChip: {
    backgroundColor: SURFACE,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  featuredText: { fontSize: 12, color: MUTED },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  badgeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: SURFACE,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
  },
  badgeInlineRow: { flexDirection: "row", alignItems: "center", gap: 4, marginLeft: 4, flexWrap: "wrap" },
  badgeEmoji: { color: TEXT, fontSize: 14 },
  badgeImg: { width: 18, height: 18, borderRadius: 4 },
  badgeLabel: { fontSize: 11, color: TEXT, fontWeight: "800" },

  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: { fontWeight: "900", color: TEXT, marginBottom: 8 },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: SURFACE,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  actionText: { color: TEXT, fontWeight: "700" },
  messagesHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  loadBtn: {
    backgroundColor: SURFACE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  loadBtnText: { color: TEXT, fontWeight: "700" },
  messageList: { marginTop: 10 },
  messageRow: { marginBottom: 10 },
  messageAuthor: { color: MUTED2, fontSize: 11, marginBottom: 2 },
  messageText: { color: TEXT },
  emptyText: { color: MUTED2 },
  postRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: BORDER },
  postAuthor: { color: MUTED2, fontSize: 11, marginBottom: 4 },
  postBody: { color: TEXT },
  tabsRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  tabBtn: { paddingVertical: 6 },
  tabText: { color: MUTED2, fontWeight: "800" },
  tabTextActive: { color: PRIMARY },
  composerRow: { flexDirection: "row", gap: 10, marginTop: 8, alignItems: "center" },
  input: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: TEXT,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
});
