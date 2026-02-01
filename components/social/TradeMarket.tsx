import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const BG = "#0b1118";
const CARD = "#131c28";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#e7edf5";
const MUTED = "#9aa6b2";
const PRIMARY = "#4f9cff";

export type TradeCard = {
  id: string;
  creator: string;
  items: string[];
  wants: string[];
  fee: number;
  status: string;
  created_at?: string;
};

type Props = {
  trades: TradeCard[];
  onOpenTrade: (id: string) => void;
  onCreateTrade: () => void;
  onBack: () => void;
};

export default function TradeMarketScreen({ trades, onOpenTrade, onCreateTrade, onBack }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "mine">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trades.filter((t) => {
      if (filter === "open" && t.status !== "open") return false;
      if (q) {
        const hay = [t.creator, ...(t.items || []), ...(t.wants || [])].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [trades, query, filter]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Trade Market</Text>
            <Text style={styles.sub}>Listari active ?i schimburi rapide.</Text>
          </View>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={18} color={TEXT} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <MaterialIcons name="search" size={18} color={MUTED} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search items/creator..."
            placeholderTextColor={MUTED}
            style={styles.searchInput}
          />
          <Pressable onPress={onCreateTrade} style={styles.createBtn}>
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text style={styles.createText}>Create</Text>
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          {([
            { id: "all", label: "All" },
            { id: "open", label: "Open" },
            { id: "mine", label: "Mine" },
          ] as const).map((f) => (
            <Pressable key={f.id} onPress={() => setFilter(f.id)} style={[styles.filterChip, filter === f.id && styles.filterChipActive]}>
              <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>{f.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.grid}>
          {filtered.map((t) => (
            <Pressable key={t.id} onPress={() => onOpenTrade(t.id)} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{t.creator}</Text>
                <View style={[styles.statusPill, t.status === "open" && styles.statusOpen]}>
                  <Text style={styles.statusText}>{t.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.cardLabel}>Offering</Text>
              <View style={styles.tagsRow}>
                {(t.items || []).slice(0, 4).map((it, idx) => (
                  <View key={`${t.id}-i-${idx}`} style={styles.tag}>
                    <Text style={styles.tagText}>{it}</Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.cardLabel, { marginTop: 10 }]}>Wants</Text>
              <View style={styles.tagsRow}>
                {(t.wants || []).slice(0, 4).map((it, idx) => (
                  <View key={`${t.id}-w-${idx}`} style={styles.tagAlt}>
                    <Text style={styles.tagText}>{it}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.fee}>Fee: {Number(t.fee || 0).toLocaleString()} credits</Text>
                <MaterialIcons name="chevron-right" size={18} color={MUTED} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  wrap: { padding: 16, paddingBottom: 30 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: TEXT, fontSize: 26, fontWeight: "900" },
  sub: { color: MUTED, marginTop: 4 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
  },
  backText: { color: TEXT, fontWeight: "800" },

  searchRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, color: TEXT, fontSize: 14 },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: PRIMARY,
  },
  createText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  filterRow: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
  },
  filterChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  filterText: { color: MUTED, fontWeight: "800", fontSize: 12 },
  filterTextActive: { color: "#fff" },

  grid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "100%",
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { color: TEXT, fontWeight: "900", fontSize: 16 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  statusOpen: { backgroundColor: "rgba(79,156,255,0.25)" },
  statusText: { color: TEXT, fontSize: 10, fontWeight: "900" },

  cardLabel: { color: MUTED, fontSize: 11, marginTop: 8, fontWeight: "800", letterSpacing: 1 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(79,156,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(79,156,255,0.35)",
  },
  tagAlt: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: BORDER,
  },
  tagText: { color: TEXT, fontSize: 12, fontWeight: "800" },
  cardFooter: { marginTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fee: { color: MUTED, fontSize: 12, fontWeight: "800" },
});
