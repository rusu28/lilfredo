import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { SocialFeedProps, SocialPost, SocialRecentItem } from "./types";
import { resolveAvatarSource } from "./avatar-source";

const PRIMARY = "#4f9cff";
const BG = "#0b1118";
const SURFACE = "#0f1621";
const CARD = "#131c28";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#e7edf5";
const MUTED = "#9aa6b2";
const MUTED2 = "#7b8796";

const formatCount = (n?: number) => {
  const val = Number.isFinite(n) ? Number(n) : 0;
  if (val >= 1000) return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
  return String(val);
};

const Avatar = ({ uri, size = 44 }: { uri?: string; size?: number }) => (
  <View style={[styles.avatarWrap, { width: size, height: size, borderRadius: size / 2 }]}>
    <Image source={resolveAvatarSource(uri)} style={{ width: size, height: size, borderRadius: size / 2 }} />
  </View>
);

const TopBar = ({
  name,
  handle,
  avatar,
  onOpenMessages,
  onOpenNotifications,
  onOpenProfile,
  onBack,
}: {
  name: string;
  handle: string;
  avatar?: string;
  onOpenMessages?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onBack?: () => void;
}) => (
  <View style={styles.topBar}>
    <Pressable style={styles.backBtn} onPress={onBack} hitSlop={8}>
      <MaterialIcons name="arrow-back" size={18} color={TEXT} />
    </Pressable>
    <View style={styles.brand}>
      <View style={styles.brandIcon}>
        <MaterialIcons name="hub" size={20} color="#fff" />
      </View>
      <Text style={styles.brandText}>FNAP</Text>
    </View>

    <View style={styles.topRight}>
      <View style={styles.topIcons}>
        <Pressable style={styles.iconPill} hitSlop={8} onPress={onOpenNotifications}>
          <MaterialIcons name="notifications" size={20} color={MUTED} />
        </Pressable>
        <Pressable style={styles.iconPill} hitSlop={8} onPress={onOpenMessages}>
          <MaterialIcons name="chat-bubble" size={18} color={MUTED} />
        </Pressable>
      </View>

      <View style={styles.separator} />

      <Pressable style={styles.meRow} onPress={onOpenProfile} hitSlop={6}>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.meName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.meHandle} numberOfLines={1}>
            {handle}
          </Text>
        </View>
        <View style={styles.meAvatarRing}>
          <Avatar uri={avatar} size={40} />
        </View>
      </Pressable>
    </View>
  </View>
);

const SearchRow = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <View style={styles.searchRow}>
    <MaterialIcons name="search" size={20} color={MUTED} />
    <TextInput
      placeholder="Search for people or groups..."
      placeholderTextColor={MUTED2}
      style={styles.searchInput}
      value={value}
      onChangeText={onChange}
    />
  </View>
);

const RecentsRow = ({
  items,
  onRemove,
  onOpen,
}: {
  items?: SocialRecentItem[];
  onRemove: (id: string) => void;
  onOpen: (item: SocialRecentItem) => void;
}) => {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return null;
  return (
    <View style={styles.recentsWrap}>
      <View style={styles.recentsHeader}>
        <Text style={styles.recentsTitle}>Recents</Text>
        <Text style={styles.recentsHint}>Local only</Text>
      </View>
      <View style={styles.recentsRow}>
        {list.map((r) => (
          <Pressable key={r.id} style={styles.recentChip} onPress={() => onOpen(r)}>
            <Text numberOfLines={1} style={styles.recentText}>
              {r.label}
            </Text>
            <Pressable onPress={() => onRemove(r.id)} hitSlop={8}>
              <MaterialIcons name="close" size={16} color={MUTED} />
            </Pressable>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const Composer = ({
  value,
  onChange,
  onPost,
  avatar,
  name,
}: {
  value: string;
  onChange: (v: string) => void;
  onPost: () => void;
  avatar?: string;
  name?: string;
}) => (
  <View style={styles.card}>
    <View style={styles.composerRow}>
      <Avatar uri={avatar} size={48} />
      <View style={{ flex: 1 }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={`What's on your mind, ${name?.split(" ")[0] ?? "friend"}?`}
          placeholderTextColor={MUTED2}
          style={styles.composerInput}
          multiline
        />
        <View style={styles.composerBottom}>
          <View style={styles.composerIcons}>
            {["image", "sentiment-satisfied", "location-on", "poll"].map((n) => (
              <Pressable key={n} style={styles.smallBtn} hitSlop={8}>
                <MaterialIcons name={n as any} size={20} color={MUTED} />
              </Pressable>
            ))}
          </View>
          <Pressable onPress={onPost} style={[styles.postBtn, !value.trim() && { opacity: 0.6 }]}>
            <Text style={styles.postBtnText}>Post</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </View>
);

const FeedHeader = ({
  tab,
  setTab,
}: {
  tab: "all" | "following" | "popular";
  setTab: (t: "all" | "following" | "popular") => void;
}) => (
  <View style={styles.feedHeader}>
    <Text style={styles.feedTitle}>Recent Activity</Text>
    <View style={styles.tabs}>
      {(["all", "following", "popular"] as const).map((t) => (
        <Pressable key={t} onPress={() => setTab(t)} style={styles.tabBtn}>
          <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
            {t === "all" ? "All Posts" : t === "following" ? "Following" : "Popular"}
          </Text>
          {tab === t ? <View style={styles.tabUnderline} /> : null}
        </Pressable>
      ))}
    </View>
  </View>
);

const PostCard = ({
  post,
  onToggleLike,
  onToggleFavorite,
  onComment,
  onOpenProfile,
  onAddRecent,
  comments,
  isAdmin,
  onDeleteComment,
  commentDraft,
  onCommentDraftChange,
  onAddComment,
  replyTo,
  onSetReplyTo,
  onDeletePost,
  onEditPost,
}: {
  post: SocialPost;
  onToggleLike: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onComment: (id: string) => void;
  onOpenProfile: (username: string) => void;
  onAddRecent: (item: SocialRecentItem) => void;
  comments?: { id: string; username: string; body: string }[];
  isAdmin: boolean;
  onDeleteComment: (postId: string, commentId: string) => void;
  commentDraft: string;
  onCommentDraftChange: (value: string) => void;
  onAddComment: () => void;
  replyTo: string | null;
  onSetReplyTo: (commentId: string | null) => void;
  onDeletePost?: (postId: string) => void;
  onEditPost?: (postId: string, body: string) => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState(String(post.body || ""));
  const label = `${post.username}: ${String(post.body || "").slice(0, 42)}`;
  return (
    <View style={styles.card}>
      <View style={styles.postTop}>
        <Pressable
          style={{ flexDirection: "row", gap: 10, flex: 1 }}
          onPress={() => {
            onAddRecent({ id: `profile:${post.username}`, type: "profile", label: post.username, ts: Date.now() });
            onOpenProfile(post.username);
          }}
        >
          <Avatar uri={(post as any).avatar_url || (post as any).avatar} size={44} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <Text style={styles.postAuthor}>{post.username}</Text>
              {post.verified ? (
                <View style={styles.verifiedBadge}>
                  <MaterialIcons name="check" size={12} color="#fff" />
                </View>
              ) : null}
              {(post as any).groupTag ? <Text style={styles.groupTag}>{(post as any).groupTag}</Text> : null}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
              <Text style={styles.postMeta}>just now</Text>
            </View>
          </View>
        </Pressable>

        <Pressable hitSlop={8} onPress={() => setMenuOpen((v) => !v)}>
          <MaterialIcons name="more-horiz" size={22} color={MUTED} />
        </Pressable>
      </View>

      {isAdmin && menuOpen ? (
        <View style={styles.postMenu}>
          <Pressable
            onPress={() => {
              setEditText(String(post.body || ""));
              setEditOpen(true);
              setMenuOpen(false);
            }}
            style={styles.postMenuItem}
          >
            <MaterialIcons name="edit" size={16} color="#8bb7ff" />
            <Text style={styles.postMenuText}>Edit post</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setMenuOpen(false);
              onDeletePost?.(post.id);
            }}
            style={styles.postMenuItem}
          >
            <MaterialIcons name="delete" size={16} color="#ff7a7a" />
            <Text style={styles.postMenuText}>Remove post</Text>
          </Pressable>
        </View>
      ) : null}

      {editOpen ? (
        <View style={styles.postEditWrap}>
          <TextInput
            value={editText}
            onChangeText={setEditText}
            placeholder="Edit post..."
            placeholderTextColor={MUTED2}
            style={styles.postEditInput}
            multiline
          />
          <View style={styles.postEditRow}>
            <Pressable
              style={styles.postEditSave}
              onPress={() => {
                const next = editText.trim();
                if (!next) return;
                onEditPost?.(post.id, next);
                setEditOpen(false);
              }}
            >
              <Text style={styles.postEditSaveText}>Save</Text>
            </Pressable>
            <Pressable style={styles.postEditCancel} onPress={() => setEditOpen(false)}>
              <Text style={styles.postEditCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Text style={styles.postBody}>{post.body}</Text>
      )}

      {(post as any).media ? <Image source={{ uri: (post as any).media }} style={styles.postMedia} /> : null}

      {(post as any).kind === "fontGrid" ? (
        <View style={styles.fontGrid}>
          <View style={styles.fontTile}>
            <Text style={[styles.fontTileText, { fontWeight: "900" }]}>Inter</Text>
          </View>
          <View style={styles.fontTile}>
            <Text style={[styles.fontTileText, { fontWeight: "300" }]}>Roboto</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            onAddRecent({ id: `post:${post.id}`, type: "post", label, ts: Date.now() });
            onToggleLike(post.id);
          }}
          style={styles.actionBtn}
          hitSlop={8}
        >
          <MaterialIcons name="favorite" size={20} color={post.liked ? PRIMARY : MUTED} />
          <Text style={[styles.actionText, post.liked && { color: PRIMARY, fontWeight: "900" }]}>
            {formatCount(post.likes_count)}
          </Text>
        </Pressable>

        <Pressable
          style={styles.actionBtn}
          hitSlop={8}
          onPress={() => {
            onAddRecent({ id: `post:${post.id}`, type: "post", label, ts: Date.now() });
            onComment(post.id);
          }}
        >
          <MaterialIcons name="mode-comment" size={20} color={MUTED} />
          <Text style={styles.actionText}>{formatCount(post.comments_count)}</Text>
        </Pressable>

        <View style={{ flex: 1 }} />

        <Pressable hitSlop={8} onPress={() => onToggleFavorite(post.id)}>
          <MaterialIcons name={post.favorited ? "bookmark" : "bookmark-border"} size={22} color={post.favorited ? PRIMARY : MUTED} />
        </Pressable>
      </View>

      {!!comments?.length && (
        <View style={styles.commentsBox}>
          {comments.map((c: any) => (
            <View key={c.id} style={[styles.commentRow, c.parent_id && styles.commentRowReply]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.commentAuthor}>{c.username}</Text>
                <Text style={styles.commentBody}>{c.body}</Text>
                <Pressable onPress={() => onSetReplyTo(c.id)} hitSlop={8}>
                  <Text style={styles.replyText}>Reply</Text>
                </Pressable>
              </View>
              {isAdmin && (
                <Pressable onPress={() => onDeleteComment(post.id, c.id)} hitSlop={8}>
                  <MaterialIcons name="delete" size={18} color="#ff7676" />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.commentComposer}>
        {!!replyTo && (
          <View style={styles.replyBanner}>
            <Text style={styles.replyBannerText}>Replying...</Text>
            <Pressable onPress={() => onSetReplyTo(null)} hitSlop={8}>
              <MaterialIcons name="close" size={16} color={MUTED} />
            </Pressable>
          </View>
        )}
        <View style={styles.commentInputRow}>
          <TextInput
            value={commentDraft}
            onChangeText={onCommentDraftChange}
            placeholder="Write a comment..."
            placeholderTextColor={MUTED2}
            style={styles.commentInput}
          />
          <Pressable onPress={onAddComment} style={styles.commentSend}>
            <MaterialIcons name="send" size={16} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

type Row =
  | { type: "top"; id: "top" }
  | { type: "search"; id: "search" }
  | { type: "recents"; id: "recents" }
  | { type: "composer"; id: "composer" }
  | { type: "header"; id: "header" }
  | { type: "post"; id: string; post: SocialPost };

export default function FeedScreen({
  posts,
  postBody,
  onPostBodyChange,
  onCreatePost,
  onLikeToggle,
  onFavoriteToggle,
  onFetchComments,
  onAddComment,
  onCommentDraftChange,
  onSetCommentReplyTo,
  onOpenProfile,
  feedSearch,
  onFeedSearchChange,
  recents,
  onAddRecent,
  onRemoveRecent,
  authUserId,
  authUsername,
  isAdmin,
  commentsByPost,
  commentDrafts,
  commentReplyTo,
  onDeleteComment,
  onOpenMessages,
  onOpenNotifications,
  onBack,
  onDeletePost,
  onEditPost,
}: SocialFeedProps) {
  const [tab, setTab] = useState<"all" | "following" | "popular">("all");
  const safePosts = Array.isArray(posts) ? posts : [];
  const search = (feedSearch || "").trim().toLowerCase();
  const filteredPosts = search
    ? safePosts.filter(
        (p) =>
          p.username?.toLowerCase().includes(search) ||
          String(p.body || "").toLowerCase().includes(search)
      )
    : safePosts;
  const mePost = safePosts.find((p) => p.user_id && p.user_id === authUserId) ?? safePosts[0];
  const meName = (authUsername || mePost?.username || "").trim() || "Player";
  const meHandle = `@${meName.toLowerCase().replace(/\s+/g, "")}`;
  const meAvatar = (mePost as any)?.avatar_url || (mePost as any)?.avatar;

  const rows: Row[] = useMemo(() => {
    return [
      { type: "top", id: "top" },
      { type: "search", id: "search" },
      { type: "recents", id: "recents" },
      { type: "composer", id: "composer" },
      { type: "header", id: "header" },
      ...filteredPosts.map((post) => ({ type: "post", id: post.id, post })),
    ];
  }, [filteredPosts]);

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        renderItem={({ item }) => {
          switch (item.type) {
            case "top":
              return (
                <TopBar
                  name={meName}
                  handle={meHandle}
                  avatar={meAvatar}
                  onOpenMessages={onOpenMessages}
                  onOpenNotifications={onOpenNotifications}
                  onOpenProfile={() => onOpenProfile(meName)}
                  onBack={onBack}
                />
              );
            case "search":
              return <SearchRow value={feedSearch} onChange={onFeedSearchChange} />;
            case "recents":
              return (
                <RecentsRow
                  items={recents}
                  onRemove={onRemoveRecent}
                  onOpen={(r) => {
                    if (r.type === "profile") onOpenProfile(r.label);
                  }}
                />
              );
            case "composer":
              return (
                <Composer
                  value={postBody}
                  onChange={onPostBodyChange}
                  onPost={onCreatePost}
                  avatar={meAvatar}
                  name={meName}
                />
              );
            case "header":
              return <FeedHeader tab={tab} setTab={setTab} />;
            case "post":
              return (
                <PostCard
                  post={item.post}
                  onToggleLike={onLikeToggle}
                  onToggleFavorite={onFavoriteToggle}
                  onComment={onFetchComments}
                  onOpenProfile={onOpenProfile}
                  onAddRecent={onAddRecent}
                  comments={commentsByPost?.[item.post.id]}
                  isAdmin={!!isAdmin}
                  onDeleteComment={onDeleteComment}
                  commentDraft={commentDrafts?.[item.post.id] ?? ""}
                  onCommentDraftChange={(v) => onCommentDraftChange(item.post.id, v)}
                  onAddComment={() => onAddComment(item.post.id)}
                  replyTo={commentReplyTo?.[item.post.id] ?? null}
                  onSetReplyTo={(cid) => onSetCommentReplyTo(item.post.id, cid)}
                  onDeletePost={onDeletePost}
                  onEditPost={onEditPost}
                />
              );
            default:
              return null;
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: Platform.select({ ios: 8, android: 10, default: 10 }),
  },

  topBar: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
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
  topRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  topIcons: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  separator: {
    width: 1,
    height: 28,
    backgroundColor: BORDER,
    marginHorizontal: 4,
  },
  meRow: { flexDirection: "row", alignItems: "center", gap: 10, maxWidth: 160 },
  meName: { fontSize: 12, fontWeight: "900", color: TEXT, lineHeight: 14 },
  meHandle: { fontSize: 11, color: MUTED2, marginTop: 2 },
  meAvatarRing: {
    padding: 2,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: PRIMARY,
  },
  avatarWrap: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f1722",
  },
  avatarFallback: { backgroundColor: "#1b2533" },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: SURFACE,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: { flex: 1, color: TEXT, fontSize: 14 },

  recentsWrap: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  recentsHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  recentsTitle: { fontWeight: "900", color: TEXT },
  recentsHint: { color: MUTED2, fontSize: 12 },
  recentsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  recentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  recentText: { color: TEXT, maxWidth: 180, fontSize: 12 },

  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },

  composerRow: { flexDirection: "row", gap: 12 },
  composerInput: {
    minHeight: 54,
    color: TEXT,
    fontSize: 16,
    paddingTop: 6,
    paddingBottom: 6,
  },
  composerBottom: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  composerIcons: { flexDirection: "row", alignItems: "center", gap: 6 },
  smallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  postBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  postBtnText: { color: "#fff", fontWeight: "900" },

  feedHeader: {
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  feedTitle: { fontSize: 18, fontWeight: "900", color: TEXT },
  tabs: { flexDirection: "row", alignItems: "flex-end", gap: 12 },
  tabBtn: { alignItems: "center" },
  tabText: { fontSize: 13, color: MUTED2, fontWeight: "700" },
  tabTextActive: { color: PRIMARY },
  tabUnderline: { height: 2, width: "100%", backgroundColor: PRIMARY, marginTop: 6, borderRadius: 2 },

  postTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  postAuthor: { fontSize: 15, fontWeight: "900", color: TEXT },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  groupTag: { fontSize: 12, color: PRIMARY, fontWeight: "700" },
  postMeta: { fontSize: 12, color: MUTED2, fontWeight: "600" },
  postBody: { marginTop: 10, color: "#cfd7e3", fontSize: 14, lineHeight: 20 },
  postMenu: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 8,
  },
  postMenuItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  postMenuText: { color: TEXT, fontWeight: "800" },
  postEditWrap: { marginTop: 10, gap: 8 },
  postEditInput: {
    minHeight: 70,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: TEXT,
    fontSize: 14,
  },
  postEditRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  postEditSave: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  postEditSaveText: { color: "#fff", fontWeight: "900" },
  postEditCancel: {
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  postEditCancelText: { color: MUTED2, fontWeight: "800" },

  postMedia: {
    marginTop: 12,
    width: "100%",
    height: 190,
    borderRadius: 14,
    backgroundColor: "#101826",
  },

  fontGrid: { marginTop: 12, flexDirection: "row", gap: 10 },
  fontTile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
  },
  fontTileText: { fontSize: 22, color: TEXT },

  actions: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionText: { color: MUTED, fontSize: 13, fontWeight: "800" },

  commentsBox: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: BORDER, gap: 8 },
  commentRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  commentRowReply: { marginLeft: 16 },
  commentAuthor: { color: MUTED2, fontSize: 11, marginBottom: 2 },
  commentBody: { color: TEXT, fontSize: 13 },
  replyText: { color: PRIMARY, fontSize: 12, fontWeight: "800", marginTop: 4 },
  commentComposer: { marginTop: 10, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 10 },
  commentInputRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  commentInput: {
    flex: 1,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: TEXT,
    fontSize: 13,
  },
  commentSend: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  replyBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  replyBannerText: { color: MUTED2, fontWeight: "800" },
});

