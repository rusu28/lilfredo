import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const BG = "#0b1118";
const CARD = "#131c28";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#e7edf5";
const MUTED = "#9aa6b2";

export type BadgeItem = {
  id: string;
  name: string;
  type: "emoji" | "image" | "icon";
  value: string;
  desc?: string;
};

export default function BadgesScreen({
  items,
  selected,
  unlocked,
  onToggle,
  onBack,
}: {
  items: BadgeItem[];
  selected: string[];
  unlocked: Record<string, boolean>;
  onToggle: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Badges</Text>
          <Text style={styles.heroSub}>Choose any badges to show on your profile.</Text>
        </View>

        <View style={styles.grid}>
          {items.map((b) => {
            const isUnlocked = !!unlocked[b.id];
            const isOn = selected.includes(b.id);
            return (
              <Pressable
                key={b.id}
                onPress={() => (isUnlocked ? onToggle(b.id) : null)}
                style={[
                  styles.card,
                  isUnlocked && { borderColor: "rgba(120,210,255,0.35)" },
                  isOn && { borderColor: "#6ee7b7", shadowColor: "#6ee7b7", shadowOpacity: 0.55, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
                  !isUnlocked && { opacity: 0.5 },
                ]}
              >
                <View style={styles.iconWrap}>
                  {b.type === "emoji" ? (
                    <Text style={styles.emoji}>{b.value}</Text>
                  ) : b.type === "image" ? (
                    <Image source={b.value as any} style={styles.badgeImg} />
                  ) : b.type === "icon" ? (
                    <MaterialIcons name={b.value as any} size={20} color="#e7edf5" />
                  ) : (
                    <Text style={styles.emoji}>{b.value}</Text>
                  )}
                </View>
                <Text style={styles.name}>{b.name}</Text>
                {b.desc ? <Text style={styles.desc}>{b.desc}</Text> : null}
                <Text style={styles.meta}>{isOn ? "Selected" : isUnlocked ? "Tap to select" : "Locked"}</Text>
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
  heroTitle: { color: TEXT, fontSize: 30, fontWeight: "900", letterSpacing: 0.5 },
  heroSub: { color: MUTED, marginTop: 6, fontSize: 13 },
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
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emoji: { fontSize: 20 },
  badgeImg: { width: 24, height: 24, borderRadius: 6 },
  name: { color: TEXT, fontWeight: "900", fontSize: 15 },
  desc: { color: MUTED, fontSize: 12, marginTop: 4, lineHeight: 16 },
  meta: { color: MUTED, marginTop: 8, fontSize: 12 },
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
