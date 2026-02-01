import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import { Animated, SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable, TextInput, Image, useWindowDimensions, FlatList } from "react-native";

const BG = "#0b1118";
const CARD = "#131c28";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#e7edf5";
const MUTED = "#9aa6b2";
const PRIMARY = "#4f9cff";

export type CollectibleItem = {
  id: string;
  character_id: string;
  rarity: string;
  variant?: string | null;
};

type Props = {
  items: CollectibleItem[];
  onBack: () => void;
  isAdmin?: boolean;
  onAdminAdd?: (payload: { username?: string; character_id: string; rarity: string; amount: number }) => Promise<void> | void;
  allCharacters?: { id: string; name: string; image?: any }[];
  onSell?: (id: string, price: number) => Promise<{ price?: number; credits?: number } | void> | void;
};

type CardProps = {
  item: CollectibleItem;
  cardWidth: number;
  charMeta?: { id: string; name: string; image?: any };
  onSell?: (id: string, price: number) => void;
};

const CollectibleCard = memo(function CollectibleCard({ item, cardWidth, charMeta, onSell }: CardProps) {
  const rarity = item.rarity;
  const scale = useRef(new Animated.Value(1)).current;
  const flip = useRef(new Animated.Value(0)).current;
  const flipped = useRef(false);
  const isHover = useRef(false);
  const isPress = useRef(false);

  const onScale = (to: number) => {
    Animated.timing(scale, {
      toValue: to,
      duration: 140,
      useNativeDriver: true,
    }).start();
  };

  const onFlip = () => {
    flipped.current = !flipped.current;
    Animated.timing(flip, {
      toValue: flipped.current ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  const frontRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  const rarityStyle = rarityGlow(rarity);
  const price = Math.round(priceByRarity(rarity) * charMultiplier(item.character_id));
  return (
    <Pressable
      style={{ width: cardWidth }}
      onHoverIn={() => {
        if (isHover.current) return;
        isHover.current = true;
        if (!isPress.current) onScale(1.04);
      }}
      onHoverOut={() => {
        if (!isHover.current) return;
        isHover.current = false;
        if (!isPress.current) onScale(1);
      }}
      onPressIn={() => {
        isPress.current = true;
        onScale(0.98);
      }}
      onPressOut={() => {
        isPress.current = false;
        onScale(isHover.current ? 1.04 : 1);
      }}
      onPress={onFlip}
    >
      <Animated.View style={[styles.card, rarityStyle, { transform: [{ scale }], height: Math.floor(cardWidth * 1.35) }]}>
        <Animated.View
          style={[
            styles.cardFace,
            {
              transform: [{ perspective: 800 }, { rotateY: frontRotate }],
            },
          ]}
        >
          <View style={[styles.cardImgWrap, { height: Math.floor(cardWidth * 0.95) }]}>
            {charMeta?.image ? (
              <View style={styles.cardImgFill}>
                <Image source={charMeta.image} style={styles.cardImg} resizeMode="cover" />
                <View style={[styles.cardTint, rarityTint(rarity)]} />
              </View>
            ) : null}
          </View>
          <Text style={styles.cardTitle}>{charMeta?.name || item.character_id}</Text>
          <Text style={styles.cardMeta}>{rarity.toUpperCase()}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.cardFace,
            styles.cardBack,
            {
              transform: [{ perspective: 800 }, { rotateY: backRotate }],
            },
          ]}
        >
          <Text style={styles.backTitle}>{charMeta?.name || item.character_id}</Text>
          <Text style={styles.backMeta}>RARITY: {rarity.toUpperCase()}</Text>
          <Text style={styles.backMeta}>PRICE: {price} credits</Text>
          <Text style={styles.backMeta}>MULTI: x{charMultiplier(item.character_id)}</Text>
          {item.variant ? <Text style={styles.backMeta}>VARIANT: {item.variant}</Text> : null}
          <Pressable onPress={() => onSell?.(item.id, price)} style={styles.sellBtn}>
            <Text style={styles.sellText}>SELL</Text>
          </Pressable>
          <Text style={styles.backHint}>Tap to flip</Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
});

export default function CollectiblesScreen({ items, onBack, isAdmin, onAdminAdd, allCharacters, onSell }: Props) {
  const { width } = useWindowDimensions();
  const cols = Math.max(2, Math.min(10, Math.floor(width / 220)));
  const gap = 12;
  const pagePad = 16;
  const cardWidth = Math.max(
    120,
    Math.floor((width - pagePad * 2 - gap * (cols - 1)) / cols)
  );
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState<string>("all");
  const [adminUser, setAdminUser] = useState("");
  const [adminChar, setAdminChar] = useState("");
  const [adminRarity, setAdminRarity] = useState("normal");
  const [adminAmount, setAdminAmount] = useState("1");
  const [notice, setNotice] = useState<string>("");

  const [displayItems, setDisplayItems] = useState<CollectibleItem[]>(() => items || []);

  useEffect(() => {
    if (Array.isArray(items) && items.length) {
      setDisplayItems(items);
      return;
    }
    // keep last non-empty list to avoid flicker / re-mount
    if (!displayItems.length && Array.isArray(items)) {
      setDisplayItems(items);
    }
  }, [items, displayItems.length]);

  const charList = useMemo(() => {
    if (allCharacters?.length) return allCharacters;
    const ids = (displayItems || []).map((c) => c.character_id).filter((v, i, a) => a.indexOf(v) === i);
    return ids.map((id) => ({ id, name: id }));
  }, [allCharacters, displayItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (displayItems || []).filter((c) => {
      if (rarity !== "all" && c.rarity !== rarity) return false;
      if (q && !c.character_id.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [displayItems, query, rarity]);

  const charMap = useMemo(() => {
    const map: Record<string, { id: string; name: string; image?: any }> = {};
    charList.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [charList]);

  const handleSell = async (id: string, price: number) => {
    if (!onSell) return;
    setNotice("");
    try {
      const res = await onSell(id, price);
      if (res && typeof res === "object") {
        const p = typeof res.price === "number" ? res.price : price;
        const c = typeof res.credits === "number" ? res.credits : null;
        setNotice(`Vândut pentru ${p} credite${c !== null ? ` • Total ${c}` : ""}`);
      } else {
        setNotice(`Vândut pentru ${price} credite`);
      }
    } catch (e: any) {
      setNotice(`Eroare: ${e?.message || String(e)}`);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Collectibles</Text>
            <Text style={styles.sub}>Drop-uri de la animatronici. Colec?ia ta completa.</Text>
          </View>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search character..."
            placeholderTextColor={MUTED}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.filterRow}>
          {[
            "all",
            "normal",
            "silver",
            "gold",
            "mythic",
            "rainbow",
          ].map((r) => (
            <Pressable key={r} onPress={() => setRarity(r)} style={[styles.filterChip, rarity === r && styles.filterChipActive]}>
              <Text style={[styles.filterText, rarity === r && styles.filterTextActive]}>{r.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>

        {!!notice && <Text style={styles.notice}>{notice}</Text>}

        {isAdmin ? (
          <View style={styles.adminBox}>
            <Text style={styles.adminTitle}>Admin: Add Collectible</Text>
            <View style={styles.adminRow}>
              <TextInput
                value={adminUser}
                onChangeText={setAdminUser}
                placeholder="Username (optional)"
                placeholderTextColor={MUTED}
                style={[styles.searchInput, styles.adminInput]}
              />
            </View>
            <Text style={styles.adminLabel}>Animatronic</Text>
            <View style={styles.filterRow}>
              {charList.map((c) => (
                <Pressable key={c.id} onPress={() => setAdminChar(c.id)} style={[styles.filterChip, adminChar === c.id && styles.filterChipActive]}>
                  <Text style={[styles.filterText, adminChar === c.id && styles.filterTextActive]}>{c.name || c.id}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.adminLabel}>Rarity</Text>
            <View style={styles.filterRow}>
              {["normal", "silver", "gold", "mythic", "rainbow"].map((r) => (
                <Pressable key={r} onPress={() => setAdminRarity(r)} style={[styles.filterChip, adminRarity === r && styles.filterChipActive]}>
                  <Text style={[styles.filterText, adminRarity === r && styles.filterTextActive]}>{r.toUpperCase()}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.adminRow}>
              <TextInput
                value={adminAmount}
                onChangeText={setAdminAmount}
                placeholder="amount"
                placeholderTextColor={MUTED}
                keyboardType="numeric"
                style={[styles.searchInput, styles.adminInput]}
              />
            </View>
            <Pressable
              onPress={() => {
                const amount = Math.max(1, Math.min(200, parseInt(adminAmount, 10) || 1));
                const payload = {
                  username: adminUser.trim() || undefined,
                  character_id: adminChar.trim(),
                  rarity: adminRarity.trim() || "normal",
                  amount,
                };
                if (!payload.character_id) return;
                onAdminAdd?.(payload);
              }}
              style={styles.adminBtn}
            >
              <Text style={styles.adminBtnText}>ADD</Text>
            </Pressable>
          </View>
        ) : null}

        {filtered.length === 0 ? (
          <Text style={styles.empty}>No collectibles yet.</Text>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(c) => c.id}
            numColumns={cols}
            columnWrapperStyle={cols > 1 ? { gap } : undefined}
            contentContainerStyle={[styles.gridList, { gap }]}
            renderItem={({ item }) => (
              <CollectibleCard item={item} cardWidth={cardWidth} charMeta={charMap[item.character_id]} onSell={handleSell} />
            )}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const rarityGlow = (r: string) => {
  const base = {
    borderColor: BORDER,
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  };
  if (r === "silver") return { ...base, borderColor: "rgba(148,163,184,0.75)", shadowColor: "rgba(148,163,184,0.8)", shadowOpacity: 0.6, shadowRadius: 18 };
  if (r === "gold") return { ...base, borderColor: "rgba(245,158,11,0.85)", shadowColor: "rgba(245,158,11,0.9)", shadowOpacity: 0.65, shadowRadius: 22 };
  if (r === "mythic") return { ...base, borderColor: "rgba(244,114,182,0.85)", shadowColor: "rgba(244,114,182,0.95)", shadowOpacity: 0.7, shadowRadius: 26 };
  if (r === "rainbow") return { ...base, borderColor: "rgba(99,102,241,0.85)", shadowColor: "rgba(99,102,241,0.95)", shadowOpacity: 0.7, shadowRadius: 26 };
  return base;
};

const rarityTint = (r: string) => {
  switch (r) {
    case "silver":
      return { backgroundColor: "rgba(148,163,184,0.12)" };
    case "gold":
      return { backgroundColor: "rgba(245,158,11,0.12)" };
    case "mythic":
      return { backgroundColor: "rgba(244,114,182,0.12)" };
    case "rainbow":
      return { backgroundColor: "rgba(99,102,241,0.12)" };
    default:
      return { backgroundColor: "rgba(255,255,255,0.08)" };
  }
};

const charMultiplier = (id: string) => {
  const s = String(id || "");
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  const val = (hash % 9990) / 100 + 0.1; // 0.1 .. 100.0
  return Math.max(0.1, Math.min(100, Number(val.toFixed(2))));
};

const priceByRarity = (r: string) => {
  switch (r) {
    case "silver":
      return 75;
    case "gold":
      return 200;
    case "mythic":
      return 600;
    case "rainbow":
      return 1500;
    default:
      return 25;
  }
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  wrap: { padding: 16, paddingBottom: 30 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: TEXT, fontSize: 26, fontWeight: "900" },
  sub: { color: MUTED, marginTop: 4 },
  backBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
  },
  backText: { color: TEXT, fontWeight: "900" },
  searchRow: {
    marginTop: 14,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { color: TEXT, fontSize: 14 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
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
  notice: { color: "#8ef0ff", marginTop: 10, fontWeight: "800" },
  gridList: { marginTop: 12, paddingBottom: 4 },
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    overflow: "hidden",
  },
  cardImgWrap: {
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  cardImgFill: { flex: 1 },
  cardImg: { width: "100%", height: "100%" },
  cardTint: {
    ...StyleSheet.absoluteFillObject,
  },
  cardFace: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: "hidden",
    padding: 12,
  },
  cardBack: {
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { color: TEXT, fontWeight: "900", fontSize: 14 },
  cardMeta: { color: MUTED, fontSize: 12, marginTop: 4 },
  backTitle: { color: TEXT, fontSize: 16, fontWeight: "900", textAlign: "center" },
  backMeta: { color: MUTED, fontSize: 12, marginTop: 6, textAlign: "center" },
  backHint: { color: MUTED, fontSize: 11, marginTop: 10 },
  sellBtn: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: PRIMARY,
  },
  sellText: { color: "#fff", fontWeight: "900", fontSize: 12, letterSpacing: 1.2 },
  empty: { color: MUTED, marginTop: 12 },
  adminBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
    gap: 10,
  },
  adminTitle: { color: TEXT, fontWeight: "900" },
  adminLabel: { color: MUTED, fontSize: 12, fontWeight: "800" },
  adminRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  adminInput: { flex: 1, minWidth: 140 },
  adminBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: PRIMARY,
  },
  adminBtnText: { color: "#fff", fontWeight: "900" },
});
