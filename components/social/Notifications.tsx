import React, { useMemo, useState } from "react";
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const PRIMARY = "#4f9cff";
const BG = "#0b1118";
const CARD = "#131c28";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#e7edf5";
const MUTED = "#9aa6b2";
const MUTED2 = "#7b8796";

type NotificationItem = {
  id: string;
  type: string;
  payload?: any;
  is_read?: boolean;
  created_at?: string;
};

type TabKey = "all" | "mentions" | "likes" | "system";

export default function NotificationsScreen({
  items,
  onMarkAll,
  onBack,
}: {
  items: NotificationItem[];
  onMarkAll: () => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<TabKey>("all");

  const filtered = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    if (tab === "all") return list;
    if (tab === "likes") return list.filter((x) => x.type === "like");
    if (tab === "mentions") return list.filter((x) => x.type === "mention" || x.type === "reply");
    return list.filter((x) => x.type === "system");
  }, [items, tab]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={18} color={TEXT} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>

        <View style={styles.tabsRow}>
          {[
            { k: "all", label: "All" },
            { k: "mentions", label: "Mentions" },
            { k: "likes", label: "Likes" },
            { k: "system", label: "System" },
          ].map((t) => (
            <Pressable key={t.k} onPress={() => setTab(t.k as TabKey)} style={styles.tabBtn}>
              <Text style={[styles.tabText, tab === t.k && styles.tabTextActive]}>{t.label}</Text>
              {tab === t.k ? <View style={styles.tabUnderline} /> : null}
            </Pressable>
          ))}

          <Pressable onPress={onMarkAll} style={styles.markBtn}>
            <Text style={styles.markText}>Mark all</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <FlatList
            data={filtered}
            keyExtractor={(it) => it.id}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            renderItem={({ item }) => <NotificationRow item={item} />}
            ListEmptyComponent={<Text style={styles.empty}>No notifications.</Text>}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const unread = !item.is_read;
  const from = item.payload?.from || "System";
  const title =
    item.type === "like"
      ? `${from} liked your post`
      : item.type === "mention"
      ? `${from} mentioned you`
      : item.type === "reply"
      ? `${from} replied to you`
      : item.type === "comment"
      ? `${from} commented on your post`
      : item.payload?.title || "System update";
  const body = item.payload?.body || item.payload?.text || "";

  return (
    <View style={[styles.row, unread && styles.rowUnread]}>
      <View style={styles.iconWrap}>
        <MaterialIcons
          name={item.type === "like" ? "favorite" : item.type === "mention" ? "alternate-email" : "notifications"}
          size={18}
          color={item.type === "like" ? PRIMARY : MUTED}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {!!body && <Text style={styles.rowBody}>{body}</Text>}
      </View>
      {unread ? <View style={styles.dot} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  wrap: { flex: 1, padding: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: TEXT, fontSize: 26, fontWeight: "900" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  backText: { color: TEXT, fontWeight: "800" },
  tabsRow: { marginTop: 14, flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12 },
  tabBtn: { alignItems: "center" },
  tabText: { color: MUTED2, fontWeight: "800" },
  tabTextActive: { color: PRIMARY },
  tabUnderline: { height: 2, width: "100%", backgroundColor: PRIMARY, marginTop: 6, borderRadius: 2 },
  markBtn: {
    marginLeft: "auto",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  markText: { color: TEXT, fontWeight: "800" },
  card: {
    marginTop: 12,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    flex: 1,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  rowUnread: { backgroundColor: "rgba(79,156,255,0.08)", borderRadius: 10, paddingHorizontal: 8 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { color: TEXT, fontWeight: "800" },
  rowBody: { color: MUTED2, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: PRIMARY },
  sep: { height: 1, backgroundColor: BORDER },
  empty: { color: MUTED2, padding: 12 },
});
