import React from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { SocialMessagesProps } from "./types";

const PRIMARY = "#4f9cff";
const BG = "#0b1118";
const SURFACE = "#0f1621";
const CARD = "#131c28";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#e7edf5";
const MUTED = "#9aa6b2";
const MUTED2 = "#7b8796";

const formatTimeAgo = (iso?: string) => {
  if (!iso) return "";
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return "";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(diff / 86_400_000);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(diff / (7 * 86_400_000));
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.floor(diff / (30 * 86_400_000));
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(diff / (365 * 86_400_000));
  return `${years} year${years === 1 ? "" : "s"} ago`;
};

export default function MessagesScreen({
  profileResults,
  messageUser,
  dmMessages,
  dmDraft,
  messageSearch,
  authUsername,
  isAdmin,
  badgeMeta,
  onAdminDeleteMessage,
  onAdminEditMessage,
  onMessageSearchChange,
  onSelectMessageUser,
  onDmDraftChange,
  onSendMessage,
  onBack,
}: SocialMessagesProps) {
  const { height } = useWindowDimensions();
  const enableScroll = height < 780;
  const [menuId, setMenuId] = React.useState<string | null>(null);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState<string>("");
  const filtered = messageSearch.trim()
    ? profileResults.filter((p) => p.username.toLowerCase().includes(messageSearch.trim().toLowerCase()))
    : profileResults;

  const BadgeInline = ({
    ids,
    size = 12,
  }: {
    ids?: string[];
    size?: number;
  }) => {
    if (!ids?.length || !badgeMeta) return null;
    return (
      <View style={styles.badgeInlineRow}>
        {ids.map((id) => {
          const b = badgeMeta[id];
          if (!b) return null;
          if (b.type === "emoji") {
            return (
              <Text key={id} style={[styles.badgeEmoji, { fontSize: size }]}>
                {b.value}
              </Text>
            );
          }
          if (b.type === "icon") {
            return <MaterialIcons key={id} name={b.value as any} size={size} color="#e7edf5" />;
          }
          return <Image key={id} source={b.value as any} style={{ width: size, height: size, borderRadius: 4 }} />;
        })}
      </View>
    );
  };

  const content = (
    <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <MaterialIcons name="chat-bubble" size={18} color="#fff" />
            </View>
            <Text style={styles.brandText}>FNAP Messages</Text>
          </View>
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
            <MaterialIcons name="arrow-back" size={18} color={TEXT} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color={MUTED} />
          <TextInput
            value={messageSearch}
            onChangeText={onMessageSearchChange}
            placeholder="Search friends..."
            placeholderTextColor={MUTED2}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.contentRow}>
          <View style={styles.listCard}>
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => onSelectMessageUser(item)}
                  style={[
                    styles.friendRow,
                    messageUser?.id === item.id && styles.friendRowActive,
                  ]}
                >
                  <View style={styles.nameInlineRow}>
                    <Text style={styles.friendName}>{item.username}</Text>
                    <BadgeInline ids={(item as any).badges} />
                  </View>
                  <MaterialIcons name="chevron-right" size={18} color={MUTED} />
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No mutual friends yet.</Text>
              }
              showsVerticalScrollIndicator={false}
            />
          </View>

          <View style={styles.chatCard}>
            <View style={styles.chatHeader}>
              <View style={styles.nameInlineRow}>
                <Text style={styles.chatTitle}>
                  {messageUser ? messageUser.username : "Select a friend"}
                </Text>
                <BadgeInline ids={(messageUser as any)?.badges} size={12} />
              </View>
              <Text style={styles.chatMeta}>Friends only</Text>
            </View>

            <View style={styles.chatBody}>
              {messageUser ? (
                <FlatList
                  data={dmMessages}
                  keyExtractor={(m) => m.id}
                  renderItem={({ item }: any) => {
                    const fromName = item.from_username || item.username;
                    const mine = authUsername && fromName === authUsername;
                    return (
                      <View style={[styles.bubbleRow, mine ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
                        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                          <View style={styles.bubbleTopRow}>
                            <View style={styles.nameInlineRow}>
                              <Text style={[styles.bubbleAuthor, mine && styles.bubbleAuthorMine]}>
                                {fromName}
                              </Text>
                              <BadgeInline ids={(item as any).from_badges} size={10} />
                            </View>
                            {item.created_at ? (
                              <Text style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}>
                                {formatTimeAgo(item.created_at)}
                              </Text>
                            ) : null}
                            {isAdmin ? (
                              <Pressable onPress={() => setMenuId(menuId === item.id ? null : item.id)} hitSlop={8}>
                                <MaterialIcons name="more-horiz" size={18} color={mine ? "#eaf2ff" : MUTED} />
                              </Pressable>
                            ) : null}
                          </View>
                          {editId === item.id ? (
                            <View style={styles.editRow}>
                              <TextInput
                                value={editText}
                                onChangeText={setEditText}
                                style={styles.editInput}
                                placeholder="Edit message..."
                                placeholderTextColor={MUTED2}
                              />
                              <Pressable
                                onPress={() => {
                                  onAdminEditMessage(item.id, editText);
                                  setEditId(null);
                                  setMenuId(null);
                                }}
                                style={styles.editSave}
                              >
                                <Text style={styles.editSaveText}>Save</Text>
                              </Pressable>
                            </View>
                          ) : (
                            <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.body}</Text>
                          )}
                          {isAdmin && menuId === item.id ? (
                            <View style={styles.adminMenu}>
                              <Pressable
                                onPress={() => {
                                  setEditId(item.id);
                                  setEditText(String(item.body || ""));
                                }}
                                style={styles.adminMenuBtn}
                              >
                                <Text style={styles.adminMenuText}>Edit</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => {
                                  onAdminDeleteMessage(item.id);
                                  setMenuId(null);
                                }}
                                style={styles.adminMenuBtn}
                              >
                                <Text style={[styles.adminMenuText, { color: "#ff8a8a" }]}>Remove</Text>
                              </Pressable>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    );
                  }}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No messages yet.</Text>
                  }
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <Text style={styles.emptyText}>Pick someone from the left.</Text>
              )}
            </View>

            <View style={styles.chatComposer}>
              <TextInput
                value={dmDraft}
                onChangeText={onDmDraftChange}
                placeholder="Type a message..."
                placeholderTextColor={MUTED2}
                style={styles.chatInput}
              />
              <Pressable onPress={onSendMessage} style={styles.sendBtn}>
                <MaterialIcons name="send" size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {enableScroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, paddingHorizontal: 16, paddingBottom: 16 },

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

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: SURFACE,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: { flex: 1, color: TEXT, fontSize: 14 },

  contentRow: { flex: 1, flexDirection: "row", gap: 12 },
  listCard: {
    width: 220,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
  },
  friendRow: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  friendRowActive: { backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER },
  friendName: { color: TEXT, fontWeight: "800" },
  emptyText: { color: MUTED2, padding: 12 },

  chatCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
  },
  chatHeader: { paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: BORDER },
  chatTitle: { color: TEXT, fontWeight: "900" },
  nameInlineRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  badgeInlineRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  badgeEmoji: { color: TEXT },
  chatMeta: { color: MUTED2, fontSize: 11, marginTop: 4 },
  chatBody: { flex: 1, paddingVertical: 8 },
  bubbleRow: { marginBottom: 10, flexDirection: "row" },
  bubbleRowLeft: { justifyContent: "flex-start" },
  bubbleRowRight: { justifyContent: "flex-end" },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
  },
  bubbleMine: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  bubbleTheirs: { backgroundColor: SURFACE },
  bubbleTopRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  bubbleAuthor: { fontSize: 11, color: MUTED2 },
  bubbleAuthorMine: { color: "rgba(255,255,255,0.85)" },
  bubbleText: { color: TEXT, fontSize: 14 },
  bubbleTextMine: { color: "#fff" },
  bubbleTime: { fontSize: 10, color: MUTED2, marginLeft: "auto" },
  bubbleTimeMine: { color: "rgba(255,255,255,0.8)" },
  adminMenu: {
    marginTop: 8,
    flexDirection: "row",
    gap: 10,
  },
  adminMenuBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
  },
  adminMenuText: { color: TEXT, fontWeight: "800", fontSize: 12 },
  editRow: { marginTop: 6, gap: 8 },
  editInput: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: TEXT,
    fontSize: 13,
  },
  editSave: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: PRIMARY,
  },
  editSaveText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  chatComposer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
  chatInput: {
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
