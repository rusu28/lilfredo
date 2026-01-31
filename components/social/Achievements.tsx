import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const PRIMARY = "#4f9cff";
const BG = "#0b1118";
const CARD = "#131c28";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#e7edf5";
const MUTED = "#9aa6b2";
const MUTED2 = "#7b8796";

export default function AchievementsScreen({
  items,
  achievements,
  featured,
  search,
  onSearchChange,
  onToggleFeatured,
  onBack,
}: {
  items: { id: string; name: string }[];
  achievements: Record<string, boolean>;
  featured: string[];
  search: string;
  onSearchChange: (v: string) => void;
  onToggleFeatured: (id: string) => void;
  onBack: () => void;
}) {
  const q = search.trim().toLowerCase();
  const filtered = items.filter((a) => !q || a.name.toLowerCase().includes(q));
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Achievements</Text>
          <Text style={styles.heroSub}>Pick 5 to show on your profile.</Text>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            value={search}
            onChangeText={onSearchChange}
            placeholder="Search achievements..."
            placeholderTextColor={MUTED2}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.grid}>
          {filtered.map((a) => {
            const unlocked = !!achievements[a.id];
            const selected = featured.includes(a.id);
            const label = unlocked ? a.name : "??? Locked";
            return (
              <Pressable
                key={a.id}
                onPress={() => unlocked && onToggleFeatured(a.id)}
                style={[
                  styles.card,
                  unlocked && styles.cardUnlocked,
                  selected && styles.cardSelected,
                ]}
              >
                <Text style={[styles.cardTitle, !unlocked && styles.cardTitleLocked]}>
                  {label}
                </Text>
                <Text style={styles.cardMeta}>
                  {selected ? "Selected" : unlocked ? "Tap to select" : "Locked"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  wrap: { padding: 16, paddingBottom: 24 },
  hero: { marginBottom: 14 },
  heroTitle: { color: TEXT, fontSize: 28, fontWeight: "900" },
  heroSub: { color: MUTED, marginTop: 6 },
  searchRow: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { color: TEXT, fontSize: 14 },
  grid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "48%",
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
  },
  cardUnlocked: {
    borderColor: "rgba(79,156,255,0.35)",
    shadowColor: "rgba(79,156,255,0.6)",
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  cardSelected: {
    borderColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    backgroundColor: "rgba(79,156,255,0.08)",
  },
  cardTitle: { color: TEXT, fontWeight: "900" },
  cardTitleLocked: { color: MUTED2 },
  cardMeta: { color: MUTED2, marginTop: 6, fontSize: 12 },
  backBtn: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
  },
  backText: { color: TEXT, fontWeight: "900" },
});
