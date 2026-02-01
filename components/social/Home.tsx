import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { resolveAvatarSource } from "./avatar-source";

const BG_DARK = "#101922";
const PRIMARY = "#258cf4";

const FALLBACK_FEED = [
  {
    id: "feed-1",
    tag: "SYSTEM UPDATE",
    title: "PATCH 2.0.4: BALANCE",
    desc: "Balansari la power drain ?i camera clarity.",
  },
  {
    id: "feed-2",
    tag: "EVENT",
    title: "WEEKEND RUN",
    desc: "Weekend event activ. Score multipliers + bonus shards.",
  },
  {
    id: "feed-3",
    tag: "STORE",
    title: "NEW GEAR DROP",
    desc: "Gear nou n Workshop pentru 24h.",
  },
];

type FeedItem = {
  id: string;
  tag: string;
  title: string;
  desc: string;
  imageSource?: any | null;
  tagColor?: string;
};

type HomeProps = {
  profileName: string;
  profileAvatar?: string;
  credits?: number;
  highestScore?: number;
  isAdmin?: boolean;
  backgroundSource?: any;
  feedItems?: FeedItem[];
  onStart: () => void;
  onSelect: () => void;
  onWorkshop: () => void;
  onSocial: () => void;
  onAchievements?: () => void;
  onChallenges: () => void;
  onSpin: () => void;
  onScores: () => void;
  onMessages: () => void;
  onNotifs: () => void;
  onGoAccount: () => void;
  onTrade: () => void;
  onAdmin?: () => void;
  onCollectibles?: () => void;
};

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

export default function FNAPHomeScreen({
  profileName,
  profileAvatar,
  credits = 0,
  highestScore = 0,
  isAdmin,
  backgroundSource,
  feedItems,
  onStart,
  onSelect,
  onWorkshop,
  onSocial,
  onAchievements,
  onChallenges,
  onSpin,
  onScores,
  onMessages,
  onNotifs,
  onGoAccount,
  onTrade,
  onAdmin,
  onCollectibles,
}: HomeProps) {
  const { width, height } = Dimensions.get("window");
  const isNarrow = width < 980;
  const layout = useMemo(() => (isNarrow ? "stack" : "row"), [isNarrow]);
  const enableScroll = height < 820 || isNarrow;

  const bgAnim = useRef(new Animated.Value(0)).current;
  const bgMouseX = useRef(new Animated.Value(0)).current;
  const bgMouseY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 9000,
          useNativeDriver: true,
        }),
        Animated.timing(bgAnim, {
          toValue: 0,
          duration: 9000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bgAnim]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const nx = e.clientX / w - 0.5;
      const ny = e.clientY / h - 0.5;
      bgMouseX.setValue(nx);
      bgMouseY.setValue(ny);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [bgMouseX, bgMouseY]);

  const bgScale = bgAnim.interpolate({ inputRange: [0, 1], outputRange: [1.02, 1.08] });
  const bgShift = bgAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const bgTranslateX = bgMouseX.interpolate({ inputRange: [-0.5, 0.5], outputRange: [-24, 24] });
  const bgTranslateY = bgMouseY.interpolate({ inputRange: [-0.5, 0.5], outputRange: [-18, 18] });

  const commFeed = (feedItems && feedItems.length ? feedItems : FALLBACK_FEED).map((item) => ({
    ...item,
    tagColor: item.tagColor || PRIMARY,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <AnimatedImageBackground
          source={backgroundSource}
          style={[
            styles.bg,
            {
              transform: [
                { scale: bgScale },
                { translateY: bgShift },
                { translateX: bgTranslateX },
                { translateY: bgTranslateY },
              ],
            },
          ]}
          resizeMode="cover"
        >
          <View style={styles.bgTintTopBottom} />
          <View pointerEvents="none" style={styles.scanlines} />
        </AnimatedImageBackground>

        {enableScroll ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.foreground}>
              <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity activeOpacity={0.85} style={styles.headerProfile} onPress={onGoAccount}>
                <Image source={resolveAvatarSource(profileAvatar)} style={styles.headerAvatar} />
                <View>
                  <Text style={styles.headerName}>{profileName || "Guest"}</Text>
                  <Text style={styles.headerSub}>Account</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.vDivider} />
              <View style={styles.headerRow}>
                <MaterialIcons name="emoji-events" size={16} color={PRIMARY} />
                <Text style={styles.headerMeta}>Score {highestScore.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <View style={styles.headerStat}>
                <Text style={styles.headerStatLabel}>Credits</Text>
                <View style={styles.coinRow}>
                  <MaterialIcons name="monetization-on" size={16} color={PRIMARY} />
                  <Text style={styles.headerStatValue}>{credits.toLocaleString()}</Text>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.85} style={styles.settingsBtn} onPress={onGoAccount}>
                <MaterialIcons name="account-circle" size={20} color={PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>

              <View style={[styles.body, layout === "stack" && styles.bodyStack]}>
            <View style={[styles.sidebar, layout === "stack" && styles.sidebarStack]}>
              <View style={{ gap: 18 }}>
                <View>
                  <Text style={styles.brand}>FNAP</Text>
                  <Text style={styles.build}>MAIN_HUB_V1.0</Text>
                </View>

                <View style={{ gap: 8 }}>
                  <NavItem active icon="play-arrow" label="Start" onPress={onStart} />
                  <NavItem icon="tune" label="Select" onPress={onSelect} />
                  <NavItem icon="build" label="Workshop" onPress={onWorkshop} />
                  <NavItem icon="forum" label="Social" onPress={onSocial} />
                  <NavItem icon="military-tech" label="Achievements" onPress={onAchievements} />
                  <NavItem icon="emoji-events" label="Challenges" onPress={onChallenges} />
                  <NavItem icon="casino" label="Lucky Spin" onPress={onSpin} />
                  <NavItem icon="leaderboard" label="Scores" onPress={onScores} />
                  <NavItem icon="swap-horiz" label="Trade Market" onPress={onTrade} />
                  <NavItem icon="collections" label="Collectibles" onPress={onCollectibles} />
                  {isAdmin ? <NavItem icon="shield" label="Admin Panel" onPress={onAdmin} /> : null}
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.9} style={styles.abortBtn} onPress={onGoAccount}>
                <MaterialIcons name="manage-accounts" size={16} color={PRIMARY} />
                <Text style={styles.abortText}>ACCOUNT</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.center, layout === "stack" && styles.centerStack]}>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.location}>LOCATION: PARLIAMENT HALL</Text>
                <Text style={styles.heroTitle}>START SHIFT</Text>
              </View>

              <View style={{ marginTop: 28, alignItems: "center" }}>
                <View style={styles.ringOuter} pointerEvents="none" />
                <View style={styles.ringInner} pointerEvents="none" />

                <TouchableOpacity activeOpacity={0.9} style={styles.startBtn} onPress={onStart}>
                  <MaterialIcons name="play-arrow" size={26} color="#fff" />
                  <Text style={styles.startText}>JOIN</Text>
                  <View style={styles.startBtnUnderline} />
                </TouchableOpacity>
              </View>

              <View style={styles.matchPill}>
                <View style={styles.greenDot} />
                <Text style={styles.matchText}>MATCHMAKING: OPTIMAL</Text>
              </View>

              <View style={styles.quickRow}>
                <QuickAction label="Messages" icon="chat" onPress={onMessages} />
                <QuickAction label="Notifications" icon="notifications" onPress={onNotifs} />
                <QuickAction label="Profile" icon="person" onPress={onGoAccount} />
              </View>
            </View>

                <View style={[styles.feed, layout === "stack" && styles.feedStack]}>
              <View style={styles.feedHeader}>
                <Text style={styles.feedTitle}>COMM_FEED</Text>
                <Text style={styles.feedLive}>ADMIN LIVE</Text>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                {commFeed.map((n) => (
                  <NewsCard
                    key={n.id}
                    tag={n.tag}
                    tagColor={n.tagColor || PRIMARY}
                    title={n.title}
                    desc={n.desc}
                    img={n.imageSource}
                  />
                ))}
              </ScrollView>
                </View>
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.foreground}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <TouchableOpacity activeOpacity={0.85} style={styles.headerProfile} onPress={onGoAccount}>
                  <Image source={resolveAvatarSource(profileAvatar)} style={styles.headerAvatar} />
                  <View>
                    <Text style={styles.headerName}>{profileName || "Guest"}</Text>
                    <Text style={styles.headerSub}>Account</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.vDivider} />
                <View style={styles.headerRow}>
                  <MaterialIcons name="emoji-events" size={16} color={PRIMARY} />
                  <Text style={styles.headerMeta}>Score {highestScore.toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.headerRight}>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatLabel}>Credits</Text>
                  <View style={styles.coinRow}>
                    <MaterialIcons name="monetization-on" size={16} color={PRIMARY} />
                    <Text style={styles.headerStatValue}>{credits.toLocaleString()}</Text>
                  </View>
                </View>

                <TouchableOpacity activeOpacity={0.85} style={styles.settingsBtn} onPress={onGoAccount}>
                  <MaterialIcons name="account-circle" size={20} color={PRIMARY} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.body, layout === "stack" && styles.bodyStack]}>
              <View style={[styles.sidebar, layout === "stack" && styles.sidebarStack]}>
                <View style={{ gap: 18 }}>
                  <View>
                    <Text style={styles.brand}>FNAP</Text>
                    <Text style={styles.build}>MAIN_HUB_V1.0</Text>
                  </View>

                  <View style={{ gap: 8 }}>
                    <NavItem active icon="play-arrow" label="Start" onPress={onStart} />
                    <NavItem icon="tune" label="Select" onPress={onSelect} />
                    <NavItem icon="build" label="Workshop" onPress={onWorkshop} />
                    <NavItem icon="forum" label="Social" onPress={onSocial} />
                    <NavItem icon="military-tech" label="Achievements" onPress={onAchievements} />
                    <NavItem icon="emoji-events" label="Challenges" onPress={onChallenges} />
                    <NavItem icon="casino" label="Lucky Spin" onPress={onSpin} />
                    <NavItem icon="leaderboard" label="Scores" onPress={onScores} />
                    <NavItem icon="swap-horiz" label="Trade Market" onPress={onTrade} />
                    <NavItem icon="collections" label="Collectibles" onPress={onCollectibles} />
                    {isAdmin ? <NavItem icon="shield" label="Admin Panel" onPress={onAdmin} /> : null}
                  </View>
                </View>

                <TouchableOpacity activeOpacity={0.9} style={styles.abortBtn} onPress={onGoAccount}>
                  <MaterialIcons name="manage-accounts" size={16} color={PRIMARY} />
                  <Text style={styles.abortText}>ACCOUNT</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.center, layout === "stack" && styles.centerStack]}>
                <View style={{ alignItems: "center" }}>
                  <Text style={styles.location}>LOCATION: PARLIAMENT HALL</Text>
                  <Text style={styles.heroTitle}>READY FOR SHIFT?</Text>
                </View>

                <View style={{ marginTop: 28, alignItems: "center" }}>
                  <View style={styles.ringOuter} pointerEvents="none" />
                  <View style={styles.ringInner} pointerEvents="none" />

                  <TouchableOpacity activeOpacity={0.9} style={styles.startBtn} onPress={onStart}>
                    <MaterialIcons name="play-arrow" size={26} color="#fff" />
                    <Text style={styles.startText}>START SHIFT</Text>
                    <View style={styles.startBtnUnderline} />
                  </TouchableOpacity>
                </View>

                <View style={styles.matchPill}>
                  <View style={styles.greenDot} />
                  <Text style={styles.matchText}>MATCHMAKING: INSTANTLY</Text>
                </View>

                <View style={styles.quickRow}>
                  <QuickAction label="Messages" icon="chat" onPress={onMessages} />
                  <QuickAction label="Notifications" icon="notifications" onPress={onNotifs} />
                  <QuickAction label="Profile" icon="person" onPress={onGoAccount} />
                </View>
              </View>

              <View style={[styles.feed, layout === "stack" && styles.feedStack]}>
                <View style={styles.feedHeader}>
                  <Text style={styles.feedTitle}>COMM_FEED</Text>
                  <Text style={styles.feedLive}>ADMIN LIVE</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                  {commFeed.map((n) => (
                    <NewsCard
                      key={n.id}
                      tag={n.tag}
                      tagColor={n.tagColor || PRIMARY}
                      title={n.title}
                      desc={n.desc}
                      img={n.imageSource}
                    />
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function NavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={[styles.navItem, active ? styles.navActive : styles.navInactive]} onPress={onPress}>
      <MaterialIcons name={icon} size={18} color="#fff" />
      <Text style={[styles.navLabel, active ? { color: "#fff" } : { color: "rgba(255,255,255,0.70)" }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function QuickAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.quickAction} onPress={onPress}>
      <MaterialIcons name={icon} size={16} color="#fff" />
      <Text style={styles.quickText}>{label}</Text>
    </TouchableOpacity>
  );
}

function NewsCard({
  tag,
  tagColor,
  title,
  desc,
  img,
}: {
  tag: string;
  tagColor: string;
  title: string;
  desc: string;
  img?: any | null;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.newsCard}>
      {img ? <Image source={img} style={styles.newsImg} /> : null}
      <View style={styles.newsBody}>
        <Text style={[styles.newsTag, { color: tagColor }]}>{tag}</Text>
        <Text style={styles.newsTitle}>{title}</Text>
        <Text style={styles.newsDesc} numberOfLines={2}>
          {desc}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_DARK },
  root: { flex: 1, backgroundColor: BG_DARK },

  bg: {
    ...StyleSheet.absoluteFillObject,
    width:"120%",
    height:"120%",
    opacity: 0.75,
  },
  bgTintTopBottom: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,12,18,0.55)",
  },

  scanlines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
    backgroundColor: "transparent",
  },

  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  foreground: { flex: 1 },

  header: {
    height: 72,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(16,25,34,0.72)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 16 },
  headerProfile: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  headerKicker: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.6,
  },
  headerName: { color: "#fff", fontSize: 18, fontWeight: "900" },
  headerSub: { color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 2 },
  vDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.20)" },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerMeta: { color: "#fff", fontSize: 14, fontWeight: "700" },

  headerRight: { flexDirection: "row", alignItems: "center", gap: 18 },
  headerStat: { alignItems: "flex-end" },
  headerStatLabel: { color: "rgba(255,255,255,0.50)", fontSize: 11, textTransform: "uppercase" },
  headerStatValue: { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 0.6 },
  coinRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(37,140,244,0.16)",
    borderWidth: 1,
    borderColor: "rgba(37,140,244,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  body: { flex: 1, flexDirection: "row" },
  bodyStack: { flexDirection: "column" },

  sidebar: {
    width: 260,
    padding: 16,
    justifyContent: "space-between",
    backgroundColor: "rgba(16,25,34,0.72)",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.10)",
  },
  sidebarStack: {
    width: "100%",
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)",
  },
  brand: {
    color: PRIMARY,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  build: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    marginTop: 4,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },

  navItem: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  navActive: { backgroundColor: PRIMARY },
  navInactive: { backgroundColor: "rgba(255,255,255,0.06)" },
  navLabel: { fontSize: 14, fontWeight: "700" },

  abortBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(79,156,255,0.55)",
    backgroundColor: "rgba(79,156,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  abortText: {
    color: PRIMARY,
    fontWeight: "900",
    letterSpacing: 1.6,
    fontSize: 12,
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  centerStack: { paddingVertical: 28 },

  location: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 5,
    textTransform: "uppercase",
    textAlign: "center",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: -1.2,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },

  ringOuter: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(37,140,244,0.18)",
    transform: [{ scale: 1.1 }],
  },
  ringInner: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(37,140,244,0.10)",
    transform: [{ scale: 1.35 }],
  },

  startBtn: {
    minWidth: 320,
    height: 80,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    shadowColor: PRIMARY,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    ...(Platform.OS === "android" ? { elevation: 8 } : null),
    overflow: "hidden",
  },
  startText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2.2,
  },
  startBtnUnderline: { position: "absolute", left: 0, right: 0, bottom: 0, height: 4, backgroundColor: "rgba(255,255,255,0.35)" },

  matchPill: {
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(16,25,34,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  greenDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: "#22c55e" },
  matchText: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  quickRow: { flexDirection: "row", gap: 10, marginTop: 18, flexWrap: "wrap" },
  quickAction: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
  },
  quickText: { color: "#fff", fontWeight: "900", fontSize: 12, letterSpacing: 1.2 },

  feed: {
    width: 320,
    padding: 12,
    backgroundColor: "rgba(16,25,34,0.72)",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.10)",
  },
  feedStack: { width: "100%", borderLeftWidth: 0, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.10)" },
  feedHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 6, marginBottom: 12 },
  feedTitle: { color: "#fff", fontSize: 18, fontWeight: "900" },
  feedLive: { color: PRIMARY, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },

  newsCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 12,
  },
  newsImg: { width: "100%", height: 120 },
  newsBody: { padding: 12 },
  newsTag: { fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  newsTitle: { color: "#fff", fontSize: 14, fontWeight: "900", marginTop: 6 },
  newsDesc: { color: "rgba(255,255,255,0.60)", fontSize: 12, marginTop: 8, lineHeight: 16 },
});
