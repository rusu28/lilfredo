import React from "react";
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
  profileIsFollowing,
  profileIsFriend,
  profileLikedPosts,
  profileFavoritePosts,
  profilePosts,
  authUser,
  authToken,
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
  const [tab, setTab] = React.useState<"posts" | "likes" | "favorites">("posts");

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

        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Image source={resolveAvatarSource(profileView?.avatar_url)} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{profileView?.username ?? "Unknown"}</Text>
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
              {profileFeatured.map((f) => (
                <View key={f} style={styles.featuredChip}>
                  <Text style={styles.featuredText}>{f}</Text>
                </View>
              ))}
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
                  <Text style={styles.messageAuthor}>{m.username}</Text>
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

        {authUser?.username && profileView?.username === authUser.username && (
          <>
            <View style={styles.card}>
              <View style={styles.tabsRow}>
                <Pressable onPress={() => setTab("posts")} style={styles.tabBtn}>
                  <Text style={[styles.tabText, tab === "posts" && styles.tabTextActive]}>Posts</Text>
                </Pressable>
                <Pressable onPress={() => setTab("likes")} style={styles.tabBtn}>
                  <Text style={[styles.tabText, tab === "likes" && styles.tabTextActive]}>Likes</Text>
                </Pressable>
                <Pressable onPress={() => setTab("favorites")} style={styles.tabBtn}>
                  <Text style={[styles.tabText, tab === "favorites" && styles.tabTextActive]}>Favorites</Text>
                </Pressable>
              </View>

              {tab === "posts" ? (
                <>
                  {profilePosts.length === 0 && <Text style={styles.emptyText}>No posts yet.</Text>}
                  {profilePosts.map((p) => (
                    <View key={`post-${p.id}`} style={styles.postRow}>
                      <Text style={styles.postAuthor}>{p.username}</Text>
                      <Text style={styles.postBody} numberOfLines={2}>
                        {p.body}
                      </Text>
                    </View>
                  ))}
                </>
              ) : null}

              {tab === "likes" ? (
                <>
                  {profileLikedPosts.length === 0 && <Text style={styles.emptyText}>No likes yet.</Text>}
                  {profileLikedPosts.map((p) => (
                    <View key={`like-${p.id}`} style={styles.postRow}>
                      <Text style={styles.postAuthor}>{p.username}</Text>
                      <Text style={styles.postBody} numberOfLines={2}>
                        {p.body}
                      </Text>
                    </View>
                  ))}
                </>
              ) : null}

              {tab === "favorites" ? (
                <>
                  {profileFavoritePosts.length === 0 && <Text style={styles.emptyText}>No favorites yet.</Text>}
                  {profileFavoritePosts.map((p) => (
                    <View key={`fav-${p.id}`} style={styles.postRow}>
                      <Text style={styles.postAuthor}>{p.username}</Text>
                      <Text style={styles.postBody} numberOfLines={2}>
                        {p.body}
                      </Text>
                    </View>
                  ))}
                </>
              ) : null}
            </View>
          </>
        )}

        {!isMe && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Posts</Text>
            {profilePosts.length === 0 && <Text style={styles.emptyText}>No posts yet.</Text>}
            {profilePosts.map((p) => (
              <View key={`post-${p.id}`} style={styles.postRow}>
                <Text style={styles.postAuthor}>{p.username}</Text>
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
  heroTop: { flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: { width: 78, height: 78, borderRadius: 39, backgroundColor: SURFACE },
  avatarFallback: { width: 78, height: 78, borderRadius: 39, backgroundColor: SURFACE },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
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
  featuredChip: { backgroundColor: SURFACE, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: BORDER },
  featuredText: { fontSize: 12, color: MUTED },

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
