import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Platform,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type Side = "you" | "partner";
type Cell =
  | { kind: "empty" }
  | {
      kind: "item";
      label: string;
      rarityText: string;
      rarityColor: string;
      borderColor: string;
      accent: "primary" | "warning";
      isNew?: boolean;
    };

const COLORS = {
  bg: "#0a0a0a",
  panel: "#111812",
  border: "#28392b",
  textMuted: "#9cbaa1",
  primary: "#0df233",
  warning: "#f2a30d",
  black: "#000",
  white: "#fff",
};


function ShadowGlow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <View
      style={[
        {
          shadowColor: color,
          shadowOpacity: 0.25,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 0 },
        },
        Platform.OS === "android" ? { elevation: 4 } : null,
      ]}
    >
      {children}
    </View>
  );
}

function ScanlineOverlay() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.scanLines} />
      <View style={styles.scanRgb} />
    </View>
  );
}

function SignalBars() {
  return (
    <View style={styles.signalWrap}>
      <View style={[styles.signalBar, { backgroundColor: COLORS.primary }]} />
      <View style={[styles.signalBar, { backgroundColor: COLORS.primary }]} />
      <View style={[styles.signalBar, { backgroundColor: COLORS.primary }]} />
      <View style={[styles.signalBar, { backgroundColor: "rgba(13,242,51,0.25)" }]} />
    </View>
  );
}

function TradeGrid({ side, cells, accent }: { side: Side; cells: Cell[]; accent: "primary" | "warning" }) {
  const accentColor = accent === "primary" ? COLORS.primary : COLORS.warning;

  return (
    <ShadowGlow color={accentColor}>
      <View style={[styles.gridWrap, { borderColor: `${accentColor}55` }]}
      >
        <FlatList
          data={cells}
          keyExtractor={(_, idx) => `${side}-${idx}`}
          numColumns={4}
          scrollEnabled={false}
          columnWrapperStyle={{ gap: 10 }}
          contentContainerStyle={{ gap: 10 }}
          renderItem={({ item }) => {
            if (item.kind === "empty") {
              return <View style={styles.emptyCell} />;
            }
            return (
              <TouchableOpacity activeOpacity={0.85} style={[styles.itemCell, { borderColor: item.borderColor }]}>
                {item.isNew ? (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                ) : null}
                <Text style={styles.itemLabel} numberOfLines={2}>
                  {item.label}
                </Text>
                <View style={styles.rarityBadge}>
                  <Text style={[styles.rarityBadgeText, { color: item.rarityColor }]}>{item.rarityText}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </ShadowGlow>
  );
}

function CurrencyBox({ label, accent, value, editable }: { label: string; accent: "primary" | "warning"; value: string; editable?: boolean }) {
  const accentColor = accent === "primary" ? COLORS.primary : COLORS.warning;

  return (
    <View style={{ marginTop: 18 }}>
      <Text style={styles.smallLabel}>{label}</Text>
      <View style={[styles.currencyBox, { borderColor: `${accentColor}55` }]}>
        <Text style={[styles.currencyDollar, { color: accentColor }]}>$</Text>
        <TextInput value={value} editable={!!editable} style={styles.currencyValue} placeholder="0" placeholderTextColor="#3b543f" />
        {editable ? <Text style={{ color: `${accentColor}66`, fontSize: 14 }}>?</Text> : null}
      </View>
    </View>
  );
}

type TradeProps = {
  onBack: () => void;
};

export default function SecureTradeScreen({ onBack }: TradeProps) {
  const [msg, setMsg] = useState("");

  const { width } = Dimensions.get("window");
  const isNarrow = width < 980;

  const yourCells: Cell[] = useMemo(() => {
    const filled: Cell[] = [
      {
        kind: "item",
        label: "Artifact Shard",
        rarityText: "LEGENDARY",
        rarityColor: COLORS.primary,
        borderColor: `${COLORS.primary}88`,
        accent: "primary",
      },
      {
        kind: "item",
        label: "Battery+",
        rarityText: "RARE",
        rarityColor: "#60a5fa",
        borderColor: `${COLORS.primary}88`,
        accent: "primary",
      },
    ];
    const empties = Array.from({ length: 16 - filled.length }).map(() => ({ kind: "empty" as const }));
    return [...filled, ...empties];
  }, []);

  const partnerCells: Cell[] = useMemo(() => {
    const filled: Cell[] = [
      {
        kind: "item",
        label: "Overclock Core",
        rarityText: "EXOTIC",
        rarityColor: "#f97316",
        borderColor: `${COLORS.warning}88`,
        accent: "warning",
        isNew: true,
      },
    ];
    const empties = Array.from({ length: 16 - filled.length }).map(() => ({ kind: "empty" as const }));
    return [...filled, ...empties];
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <MaterialIcons name="security" size={22} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>SECURE_TRADE_PROTOCOL_v2.0</Text>
              <Text style={styles.headerSub}>Status: Encrypted Peer-to-Peer Connection Active</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.headerMeta}>SIGNAL STRENGTH</Text>
              <SignalBars />
            </View>
            <View style={styles.headerBtns}>
              <TouchableOpacity style={styles.headerBtn} onPress={onBack}>
                <MaterialIcons name="arrow-back" size={18} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.powerBtn}>
                <MaterialIcons name="power-settings-new" size={18} color="#ff4d4d" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.main, isNarrow && styles.mainStack]}>
          <View style={[styles.sidePanel, styles.leftPanel, isNarrow && styles.sidePanelStack]}>
            <View style={styles.panelTopRow}>
              <View>
                <Text style={styles.panelHeading}>YOUR ASSETS</Text>
                <Text style={[styles.panelSub, { color: COLORS.primary }]}>Session ID: USER_7749</Text>
              </View>

              <View style={[styles.badge, { borderColor: COLORS.primary, backgroundColor: "rgba(13,242,51,0.10)" }]}>
                <Text style={[styles.badgeText, { color: COLORS.primary }]}>LOCKED</Text>
              </View>
            </View>

            <TradeGrid side="you" cells={yourCells} accent="primary" />

            <CurrencyBox label="CREDITS TRANSFER" accent="primary" value="1,250,000" editable={false} />
          </View>

          <View style={[styles.centerPillar, isNarrow && styles.centerPillarStack]}>
            <View style={styles.centerLine} />
            <View style={styles.centerContent}>
              <View style={{ alignItems: "center" }}>
                <ShadowGlow color={COLORS.warning}>
                  <View style={styles.warnDot}>
                    <MaterialIcons name="sync" size={20} color={COLORS.warning} />
                  </View>
                </ShadowGlow>
                <Text style={[styles.centerLabel, { color: COLORS.warning }]}>TRADE MODIFIED</Text>
              </View>

              <ShadowGlow color={COLORS.primary}>
                <TouchableOpacity activeOpacity={0.9} style={styles.acceptBtn}>
                  <Text style={styles.acceptText}>ACCEPT</Text>
                </TouchableOpacity>
              </ShadowGlow>

              <View style={{ alignItems: "center", opacity: 0.45 }}>
                <View style={styles.waitDot}>
                  <MaterialIcons name="hourglass-empty" size={18} color={COLORS.textMuted} />
                </View>
                <Text style={[styles.centerLabel, { color: COLORS.textMuted }]}>AWAITING VERIFICATION</Text>
              </View>
            </View>
          </View>

          <View style={[styles.sidePanel, styles.rightPanel, isNarrow && styles.sidePanelStack]}>
            <View style={styles.panelTopRow}>
              <View>
                <Text style={[styles.panelHeading, { color: COLORS.textMuted }]}>PARTNER ASSETS</Text>
                <Text style={[styles.panelSub, { color: COLORS.warning }]}>Session ID: X_PARTNER_991</Text>
              </View>

              <View style={[styles.badge, { borderColor: COLORS.warning, backgroundColor: "rgba(242,163,13,0.10)" }]}>
                <Text style={[styles.badgeText, { color: COLORS.warning }]}>MODIFIED</Text>
              </View>
            </View>

            <TradeGrid side="partner" cells={partnerCells} accent="warning" />

            <CurrencyBox label="PARTNER CREDITS" accent="warning" value="0" editable={false} />
          </View>
        </View>

        <View style={styles.footer}>
          <ScanlineOverlay />

          <View style={styles.chatBox}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ChatLine time="12:44:02" who="SYSTEM" whoColor={`${COLORS.primary}AA`} text="Handshake established. Security level 5." textColor={COLORS.textMuted} />
              <ChatLine time="12:44:15" who="YOU" whoColor={COLORS.primary} text="Adding the pulse rifle as discussed." textColor={COLORS.white} />
              <ChatLine time="12:44:30" who="PARTNER" whoColor={COLORS.warning} text="Adding the Bio-processor... one second." textColor={COLORS.white} />
              <ChatLine time="12:44:31" who="SYSTEM" whoColor={COLORS.warning} text="Partner updated their offer. Verification required." textColor={COLORS.warning} />
            </ScrollView>
          </View>

          <View style={styles.msgRow}>
            <TextInput value={msg} onChangeText={setMsg} placeholder="Type message to partner..." placeholderTextColor="#3b543f" style={styles.msgInput} />
            <TouchableOpacity activeOpacity={0.9} style={styles.sendBtn}>
              <MaterialIcons name="send" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function ChatLine({ time, who, whoColor, text, textColor }: { time: string; who: string; whoColor: string; text: string; textColor: string }) {
  return (
    <View style={styles.chatLine}>
      <Text style={[styles.chatTime, { color: `${COLORS.primary}99` }]}>{`[${time}]`}</Text>
      <Text style={[styles.chatWho, { color: whoColor }]}>{`${who}:`}</Text>
      <Text style={[styles.chatText, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  root: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    height: 66,
    paddingHorizontal: 18,
    backgroundColor: COLORS.panel,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: COLORS.white, fontSize: 14, fontWeight: "900", letterSpacing: 1.2 },
  headerSub: { color: "rgba(13,242,51,0.55)", fontSize: 10, marginTop: 2 },

  headerRight: { flexDirection: "row", alignItems: "center", gap: 16 },
  headerMeta: { color: COLORS.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  headerBtns: { flexDirection: "row", gap: 10 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnText: { color: COLORS.white, fontSize: 16 },
  powerBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(178,34,34,0.20)",
    borderWidth: 1,
    borderColor: "rgba(178,34,34,0.40)",
    alignItems: "center",
    justifyContent: "center",
  },
  powerBtnText: { color: "#ff4d4d", fontSize: 16 },

  signalWrap: { flexDirection: "row", gap: 2, marginTop: 4 },
  signalBar: { width: 14, height: 4 },

  main: { flex: 1, flexDirection: "row" },
  mainStack: { flexDirection: "column" },

  sidePanel: { flex: 1, padding: 18, backgroundColor: "rgba(17,24,18,0.30)" },
  sidePanelStack: { width: "100%" },

  leftPanel: { borderRightWidth: 1, borderRightColor: "rgba(40,57,43,0.50)" },
  rightPanel: {},

  panelTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  panelHeading: { color: COLORS.white, fontSize: 20, fontWeight: "900", letterSpacing: 0.8 },
  panelSub: { fontSize: 12, fontWeight: "700", marginTop: 4 },

  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: "900", letterSpacing: 2 },

  gridWrap: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.40)",
    borderWidth: 1,
  },

  emptyCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(0,0,0,0.20)",
    opacity: 0.95,
  },

  itemCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "rgba(13,242,51,0.06)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  itemLabel: { color: COLORS.white, fontSize: 12, fontWeight: "900", textAlign: "center" },

  rarityBadge: {
    position: "absolute",
    left: 6,
    bottom: 6,
    backgroundColor: "rgba(0,0,0,0.78)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rarityBadgeText: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },

  newBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: COLORS.warning,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  newBadgeText: { color: COLORS.black, fontSize: 10, fontWeight: "900", letterSpacing: 1 },

  smallLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: "900", letterSpacing: 2.4, marginBottom: 8 },

  currencyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.40)",
    borderWidth: 1,
  },
  currencyDollar: { fontSize: 16, fontWeight: "900" },
  currencyValue: {
    flex: 1,
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },

  centerPillar: {
    width: 180,
    backgroundColor: "rgba(10,10,10,0.80)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  centerPillarStack: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "rgba(40,57,43,0.50)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(40,57,43,0.50)",
    paddingVertical: 18,
  },
  centerLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(40,57,43,0.9)",
    opacity: 0.65,
  },
  centerContent: { gap: 18, alignItems: "center", width: "100%" },
  warnDot: {
    width: 54,
    height: 54,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.warning,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(242,163,13,0.08)",
  },
  waitDot: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  centerLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 2.2, marginTop: 8 },

  acceptBtn: {
    height: 64,
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: "rgba(13,242,51,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  acceptText: { color: COLORS.primary, fontWeight: "900", letterSpacing: 4, fontSize: 12 },

  footer: {
    height: 120,
    backgroundColor: "rgba(17,24,18,0.85)",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  chatBox: {
    flex: 1,
    height: 76,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(0,0,0,0.60)",
    padding: 10,
  },
  chatLine: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 6 },
  chatTime: { fontSize: 10, fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }) },
  chatWho: { fontSize: 10, fontWeight: "900" },
  chatText: { fontSize: 10 },

  msgRow: { width: 320, flexDirection: "row", alignItems: "center", gap: 10 },
  msgInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(0,0,0,0.60)",
    paddingHorizontal: 12,
    color: COLORS.white,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(13,242,51,0.40)",
    backgroundColor: "rgba(13,242,51,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },

  scanLines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.03)",
  },
  scanRgb: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.06,
    backgroundColor: "transparent",
  },
});
