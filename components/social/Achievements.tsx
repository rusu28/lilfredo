import React from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const PRIMARY = "#4f9cff";
const BG = "#0b1118";
const CARD = "#131c28";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#e7edf5";
const MUTED = "#9aa6b2";
const MUTED2 = "#7b8796";

type Tier = "common" | "rare" | "epic" | "legendary" | "mythic";
type AchItem = { id: string; name: string; tier?: Tier; desc?: string };

const TIER_META: Record<Tier, { color: string; glow: string; bg: string }> = {
  common: { color: "#8ea0b2", glow: "rgba(142,160,178,0.45)", bg: "linear-gradient(135deg, #0f1621, #131c28)" },
  rare: { color: "#63b7ff", glow: "rgba(99,183,255,0.55)", bg: "linear-gradient(135deg, #0f1d2f, #12345a)" },
  epic: { color: "#9c7dff", glow: "rgba(156,125,255,0.6)", bg: "linear-gradient(135deg, #1a1330, #2d1f4d)" },
  legendary: { color: "#ffbd6a", glow: "rgba(255,189,106,0.65)", bg: "linear-gradient(135deg, #2b1b00, #3c2500)" },
  mythic: { color: "#ff7ad7", glow: "rgba(255,122,215,0.7)", bg: "linear-gradient(135deg, #2b0034, #40004f)" },
};

export default function AchievementsScreen({
  items,
  achievements,
  featured,
  search,
  onSearchChange,
  onToggleFeatured,
  badges,
  badgesSelected,
  badgeUnlocked,
  onToggleBadge,
  onBack,
}: {
  items: AchItem[];
  achievements: Record<string, boolean>;
  featured: string[];
  search: string;
  onSearchChange: (v: string) => void;
  onToggleFeatured: (id: string) => void;
  badges: { id: string; name: string; type: "emoji" | "image" | "icon"; value: any; desc?: string }[];
  badgesSelected: string[];
  badgeUnlocked: Record<string, boolean>;
  onToggleBadge: (id: string) => void;
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
            const tier: Tier = a.tier || "common";
            const tm = TIER_META[tier];
            const cardGlow = selected ? tm.glow : unlocked ? `${tm.glow}` : "rgba(0,0,0,0)";
            return (
              <Pressable
                key={a.id}
                onPress={() => unlocked && onToggleFeatured(a.id)}
                style={[
                  styles.card,
                  { borderColor: unlocked ? tm.color + "66" : BORDER, backgroundColor: "rgba(19,28,40,0.7)" },
                  unlocked && {
                    shadowColor: tm.glow,
                    shadowOpacity: 0.55,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 8 },
                  },
                  selected && {
                    borderColor: tm.color,
                    shadowColor: cardGlow,
                    shadowOpacity: 0.9,
                    shadowRadius: 22,
                    shadowOffset: { width: 0, height: 10 },
                  },
                ]}
              >
                <View
                  style={[
                    styles.tierBadge,
                    { borderColor: tm.color, backgroundColor: tm.bg.startsWith("linear") ? "rgba(0,0,0,0.35)" : tm.bg },
                  ]}
                >
                  <Text style={[styles.tierTxt, { color: tm.color }]}>{tier.toUpperCase()}</Text>
                </View>
                <Text style={[styles.cardTitle, !unlocked && styles.cardTitleLocked]}>{label}</Text>
                {a.desc ? (
                  <Text numberOfLines={2} style={styles.cardDesc}>
                    {a.desc}
                  </Text>
                ) : null}
                <Text style={styles.cardMeta}>{selected ? "Selected" : unlocked ? "Tap to select" : "Locked"}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.badgesWrap}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <Text style={styles.sectionSub}>Equip any badges you unlocked.</Text>
          <View style={styles.badgesGrid}>
            {badges.map((b) => {
              const unlocked = !!badgeUnlocked[b.id];
              const selected = badgesSelected.includes(b.id);
              const label = unlocked ? b.name : "Locked";
              return (
                <Pressable
                  key={b.id}
                  onPress={() => unlocked && onToggleBadge(b.id)}
                  style={[
                    styles.badgeCard,
                    selected && styles.badgeCardSelected,
                    !unlocked && styles.badgeCardLocked,
                  ]}
                >
                  {b.type === "image" ? (
                    <Image source={b.value} style={styles.badgeImg} />
                  ) : b.type === "icon" ? (
                    <MaterialIcons name={b.value as any} size={18} color={TEXT} />
                  ) : (
                    <Text style={styles.badgeIcon}>{b.value}</Text>
                  )}
                  <Text style={[styles.badgeLabel, !unlocked && styles.badgeLabelLocked]}>{label}</Text>
                  {!!b.desc && (
                    <Text style={[styles.badgeDesc, !unlocked && styles.badgeLabelLocked]}>
                      {b.desc}
                    </Text>
                  )}
                  <Text style={styles.badgeMeta}>{selected ? "Selected" : unlocked ? "Tap to select" : "Locked"}</Text>
                </Pressable>
              );
            })}
          </View>
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
  heroTitle: { color: TEXT, fontSize: 30, fontWeight: "900", letterSpacing: 0.5 },
  heroSub: { color: MUTED, marginTop: 6, fontSize: 13 },
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    overflow: "hidden",
  },
  cardUnlocked: {},
  cardSelected: {},
  tierBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  tierTxt: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  cardTitle: { color: TEXT, fontWeight: "900", fontSize: 15 },
  cardTitleLocked: { color: MUTED2 },
  cardDesc: { color: MUTED, fontSize: 12, marginTop: 4, lineHeight: 16 },
  cardMeta: { color: MUTED2, marginTop: 8, fontSize: 12 },
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
  badgesWrap: {
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
  },
  sectionTitle: { color: TEXT, fontSize: 16, fontWeight: "900" },
  sectionSub: { color: MUTED, marginTop: 4, fontSize: 12 },
  badgesGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeCard: {
    width: "30%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingVertical: 12,
    alignItems: "center",
    gap: 6,
  },
  badgeCardSelected: {
    borderColor: "rgba(79,156,255,0.9)",
    shadowColor: "rgba(79,156,255,0.8)",
    shadowOpacity: 0.7,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  badgeCardLocked: { opacity: 0.5 },
  badgeIcon: { fontSize: 18 },
  badgeImg: { width: 24, height: 24, borderRadius: 4 },
  badgeLabel: { color: TEXT, fontSize: 11, fontWeight: "900", textAlign: "center" },
  badgeLabelLocked: { color: MUTED2 },
  badgeDesc: { color: MUTED, fontSize: 10, textAlign: "center", lineHeight: 14 },
  badgeMeta: { color: MUTED2, fontSize: 10 },
});
