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
import { resolveAvatarSource } from "./avatar-source";

type ProfileResult = { id: string; username: string };

type HomeProps = {
  profileName: string;
  profileEmail: string;
  profileAvatar?: string;
  profileSearch: string;
  profileResults: ProfileResult[];
  onProfileSearchChange: (v: string) => void;
  onSearchUsers: () => void;
  onOpenProfile: (username: string) => void;
  onGoAccount: () => void;
  onStart: () => void;
  onSelect: () => void;
  onWorkshop: () => void;
  onIntel: () => void;
  onScores: () => void;
  onStats: () => void;
  onSeeds: () => void;
  onSocial: () => void;
  onNotifs: () => void;
  onAchievements: () => void;
  onMessages: () => void;
};

const PRIMARY = "#4f9cff";
const BG = "#0b1118";
const SURFACE = "#0f1621";
const CARD = "#131c28";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#e7edf5";
const MUTED = "#9aa6b2";
const MUTED2 = "#7b8796";

function IconPill({ name, onPress }: { name: any; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.iconPill} hitSlop={8}>
      <MaterialIcons name={name} size={20} color={MUTED} />
    </Pressable>
  );
}

export default function HomeScreen({
  profileName,
  profileEmail,
  profileAvatar,
  profileSearch,
  profileResults,
  onProfileSearchChange,
  onSearchUsers,
  onOpenProfile,
  onGoAccount,
  onStart,
  onSelect,
  onWorkshop,
  onIntel,
  onScores,
  onStats,
  onSeeds,
  onSocial,
  onNotifs,
  onAchievements,
  onMessages,
}: HomeProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <MaterialIcons name="hub" size={20} color="#fff" />
            </View>
            <Text style={styles.brandText}>FNAP</Text>
          </View>

        <View style={styles.topRight}>
          <View style={styles.topIcons}>
            <IconPill name="notifications" onPress={onNotifs} />
            <IconPill name="chat-bubble" onPress={onMessages} />
          </View>
        </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Welcome back,</Text>
              <Text style={styles.heroName}>{profileName || "Guest"}</Text>
              <Text style={styles.heroMeta}>Main hub • Quick access to all FNAP systems</Text>
            </View>
            <View style={styles.avatarRing}>
              <Image source={resolveAvatarSource(profileAvatar)} style={styles.avatar} />
            </View>
          </View>
          <View style={styles.heroActions}>
            <Pressable onPress={onStart} style={[styles.primaryBtn, styles.heroBtn]}>
              <Text style={styles.primaryBtnText}>Start Night</Text>
            </Pressable>
            <Pressable onPress={onSelect} style={[styles.ghostBtn, styles.heroBtn]}>
              <Text style={styles.ghostBtnText}>Select</Text>
            </Pressable>
            <Pressable onPress={onWorkshop} style={[styles.ghostBtn, styles.heroBtn]}>
              <Text style={styles.ghostBtnText}>Workshop</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Profile</Text>
            <Pressable onPress={onGoAccount} style={styles.linkBtn}>
              <Text style={styles.linkBtnText}>Account</Text>
            </Pressable>
          </View>
          <View style={styles.profileRow}>
            <View style={styles.avatarRingSmall}>
              <Image source={resolveAvatarSource(profileAvatar)} style={styles.avatarSmall} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{profileName || "Guest"}</Text>
              <Text style={styles.profileMeta}>{profileEmail || "guest"}</Text>
            </View>
            <Pressable onPress={onSocial} style={styles.softBtn}>
              <MaterialIcons name="rss-feed" size={16} color={TEXT} />
              <Text style={styles.softBtnText}>Feed</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Search users</Text>
          <View style={styles.searchRow}>
            <MaterialIcons name="search" size={20} color={MUTED} />
            <TextInput
              placeholder="Search profiles..."
              placeholderTextColor={MUTED2}
              style={styles.searchInput}
              value={profileSearch}
              onChangeText={onProfileSearchChange}
            />
            <Pressable onPress={onSearchUsers} style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>Go</Text>
            </Pressable>
          </View>
          {!!profileSearch.trim() && !!profileResults.length && (
            <View style={styles.results}>
              {profileResults.map((r) => (
                <Pressable key={r.id} style={styles.resultRow} onPress={() => onOpenProfile(r.username)}>
                  <Text style={styles.resultName}>{r.username}</Text>
                  <MaterialIcons name="chevron-right" size={18} color={MUTED} />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionMeta}>Launch core systems fast</Text>
        </View>

        <View style={styles.moduleFeed}>
          {[
            { label: "Select", sub: "Characters, difficulty, special modes", onPress: onSelect, icon: "tune" },
            { label: "Workshop", sub: "Forge items, loadout, upgrades", onPress: onWorkshop, icon: "build" },
            { label: "Intel", sub: "Bestiary, hints, unlocked lore", onPress: onIntel, icon: "menu-book" },
            { label: "Seeds", sub: "Create, save, share runs", onPress: onSeeds, icon: "grain" },
            { label: "Achievements", sub: "Pick 5 to show on profile", onPress: onAchievements, icon: "emoji-events" },
            { label: "Scores", sub: "Global leaderboard", onPress: onScores, icon: "leaderboard" },
            { label: "Stats", sub: "Run history and personal bests", onPress: onStats, icon: "analytics" },
            { label: "Notifications", sub: "Replies, likes, system alerts", onPress: onNotifs, icon: "notifications" },
          ].map((c) => (
            <Pressable key={c.label} onPress={c.onPress} style={styles.moduleCard}>
              <View style={styles.moduleIcon}>
                <MaterialIcons name={c.icon as any} size={20} color={PRIMARY} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.moduleTitle}>{c.label}</Text>
                <Text style={styles.moduleSub}>{c.sub}</Text>
              </View>
              <View style={styles.moduleCta}>
                <MaterialIcons name="arrow-forward" size={18} color={TEXT} />
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
  wrap: { paddingHorizontal: 16, paddingBottom: 24 },
  topBar: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
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

  hero: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
  },
  heroRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  heroTitle: { color: MUTED2, fontWeight: "800" },
  heroName: { color: TEXT, fontSize: 22, fontWeight: "900", marginTop: 2 },
  heroMeta: { color: MUTED, marginTop: 6 },
  sectionHeader: { marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: TEXT, fontWeight: "900", fontSize: 16 },
  sectionMeta: { color: MUTED2, fontSize: 12, fontWeight: "700" },
  avatarRing: {
    padding: 3,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: PRIMARY,
  },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarFallback: { width: 64, height: 64, borderRadius: 32, backgroundColor: SURFACE },
  heroActions: { flexDirection: "row", gap: 10, marginTop: 14, flexWrap: "wrap" },
  heroBtn: { flexGrow: 1, flexBasis: 120 },
  primaryBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },
  ghostBtn: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  ghostBtnText: { color: TEXT, fontWeight: "900" },

  card: {
    marginTop: 14,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { color: TEXT, fontWeight: "900" },
  linkBtn: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  linkBtnText: { color: TEXT, fontWeight: "800" },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },
  avatarRingSmall: {
    padding: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
  },
  avatarSmall: { width: 44, height: 44, borderRadius: 22 },
  avatarFallbackSmall: { width: 44, height: 44, borderRadius: 22, backgroundColor: SURFACE },
  profileName: { color: TEXT, fontWeight: "900" },
  profileMeta: { color: MUTED2, marginTop: 2 },
  softBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  softBtnText: { color: TEXT, fontWeight: "800" },

  searchRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: SURFACE,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: { flex: 1, color: TEXT, fontSize: 14 },
  searchBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  searchBtnText: { color: "#fff", fontWeight: "900" },
  results: { marginTop: 10 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  resultName: { color: TEXT, fontWeight: "800" },

  moduleFeed: { marginTop: 12, gap: 12 },
  moduleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    padding: 14,
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleTitle: { color: TEXT, fontWeight: "900", fontSize: 14 },
  moduleSub: { color: MUTED2, marginTop: 4, fontSize: 12 },
  moduleCta: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
  },
});
