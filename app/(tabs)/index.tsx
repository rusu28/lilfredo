import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import FeedScreen from "../../components/social/Feed";
import HomeScreen from "../../components/social/Home";
import LoginScreen from "../../components/social/Login";
import MessagesScreen from "../../components/social/Messages";
import NotificationsScreen from "../../components/social/Notifications";
import ProfileScreen from "../../components/social/Profile";
import TradeScreen from "../../components/social/Trade";
import TradeMarketScreen from "../../components/social/TradeMarket";
import AchievementsScreen from "../../components/social/Achievements";
import BadgesScreen from "../../components/social/Badges";
import CollectiblesScreen from "../../components/social/Collectibles";
import { CHARACTER_CHOICES, resolveAvatarSource } from "../../components/social/avatar-source";
import type { SocialPost, SocialRecentItem, SocialSoftButtonProps } from "../../components/social/types";

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);
const DISPLAY_FONTS = [
  "System",
  "serif",
  "sans-serif",
  "monospace",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Helvetica",
  "Trebuchet MS",
  "Comic Sans MS",
  "Impact",
  "Palatino",
  "Garamond",
  "Futura",
  "Avenir",
  "Didot",
  "Baskerville",
  "Copperplate",
  "Noteworthy",
  "Chalkboard",
];

let ExpoAudio: any;
try {
  ExpoAudio = require("expo-av").Audio;
} catch {
  ExpoAudio = null;
}

let ExpoAsset: any;
try {
  ExpoAsset = require("expo-asset").Asset;
} catch {
  ExpoAsset = null;
}

/**
 * ==========================================================
 * 5 Days in Parlamentul Romaniei (React Native) - Single App.tsx
 * Assets (local):
 *   ./assets/characters/*
 *   ./assets/rooms/*
 *   ./assets/jumpscare/*
 * ==========================================================
 *
 * NOTE about WEBP: If your setup can't display .webp, convert them to jpg/png.
 */

// ========= LOCAL ASSETS =========
const IMG = {
  characters: {
    tehnicianul: require("../../assets/characters/tehnicianul.jpg"),
    pazniculLuiFlutu: require("../../assets/characters/pazniculliftului.jpg"),
    umbraPlenului: require("../../assets/characters/umbraplenului.jpg"),
    fantomaArhivei: require("../../assets/characters/fantomaarhivei.webp"),

    cojocaru: require("../../assets/characters/cojocaru.jpg"),
    selly2: require("../../assets/characters/selly2.jpg"),
    micutzu: require("../../assets/characters/micutzu.jpg"),
    bromania: require("../../assets/characters/bromania.webp"),

    puya: require("../../assets/characters/puya.jpg"),
    antonia: require("../../assets/characters/antonia.jpg"),
    irinrimes: require("../../assets/characters/irinrimes.webp"),

    andra: require("../../assets/characters/andra.jpg"),
    inna: require("../../assets/characters/inna.jpg"),
    delia: require("../../assets/characters/delia.jpg"),
    smiley: require("../../assets/characters/smiley.jpg"),

    crinantonescu: require("../../assets/characters/crinantonescu.jpg"),
    victorPonta: require("../../assets/characters/victorponta.jpg"),
    gabrielaFirea: require("../../assets/characters/gabrielafirea.jpg"),

    kelemen: require("../../assets/characters/kelemen.jpg"),
    drula: require("../../assets/characters/drula.png"),
    georgeSimion: require("../../assets/characters/georgesimion.jpg"),

    ciolacu: require("../../assets/characters/ciolacu.jpg"),
    ioHannis: require("../../assets/characters/iohannis.jpg"),
    iliebolojan: require("../../assets/characters/iliebolojan.jpg"),
    nicusordan: require("../../assets/characters/nicusordan.png"),

    eugenionescu: require("../../assets/characters/eugenionescu.webp"),
    alecsandri: require("../../assets/characters/alecsandri.jpg"),
    cosbuc: require("../../assets/characters/cosbuc.jpg"),
    nichitaStanescu: require("../../assets/characters/nichitastanescu.jpg"),

    marinPreda: require("../../assets/characters/marinpreda.jpg"),
    eliade: require("../../assets/characters/eliade.jpg"),
    arghezi: require("../../assets/characters/arghezi.jpg"),
    blaga: require("../../assets/characters/blaga.jpg"),

    caragiale: require("../../assets/characters/caragiale.jpg"),
    creanga: require("../../assets/characters/creanga.jpg"),
    eminescu: require("../../assets/characters/eminescu.jpg"),

    traian: require("../../assets/characters/traian.jpg"),
    mirceaCelBatran: require("../../assets/characters/mirceacelbatran.jpg"),
    ferdinand: require("../../assets/characters/ferdinand.jpg"),

    carol1: require("../../assets/characters/carol1.jpg"),
    reginaMaria: require("../../assets/characters/reginamaria.jpg"),

    cuzaVoda: require("../../assets/characters/cuzavoda.jpg"),
    decebal: require("../../assets/characters/decebal.jpg"),

    mihaiViteazu: require("../../assets/characters/mihaiviteazul.png"),
    stefanCelMare: require("../../assets/characters/stefancelmare.webp"),
    vladtepes: require("../../assets/characters/vladtepes.jpg"),

    default: require("../../assets/characters/default.png"),
  } as Record<string, any>,

  rooms: {
    back1: require("../../assets/rooms/back1.jpg"),
    back2: require("../../assets/rooms/back2.jpeg"),
    back3: require("../../assets/rooms/back3.jpg"),

    holstanga: require("../../assets/rooms/holstanga.jpg"),
    holdreapta: require("../../assets/rooms/holdreapta.jpg"),
    holprincipal: require("../../assets/rooms/holprincipal.jpg"),

    vent1: require("../../assets/rooms/vent1.webp"), // if webp fails, convert
    vent2: require("../../assets/rooms/vent2.jpg"),

    basement: require("../../assets/rooms/basement.jpg"),
    arhiva: require("../../assets/rooms/arhiva.jpg"),
    saladercomisie: require("../../assets/rooms/saladecomisie.jpg"),

    cameratribunal: require("../../assets/rooms/cameratribunal.jpg"),
    cameradevorbit: require("../../assets/rooms/cameradevorbit.jpg"),
    cameradeputatilor: require("../../assets/rooms/cameradeputatilor.jpg"),
  } as Record<string, any>,

  jumpscare: [
    require("../../assets/jumpscare/jumpscare1.jpg"),
    require("../../assets/jumpscare/jumpscare2.webp"), // if webp fails, convert
    require("../../assets/jumpscare/jumpscare3.webp"),
  ] as any[],
};

const charImg = (id: string) => IMG.characters[id] ?? IMG.characters.default;

const JUMPSCARE_BY_ID: Record<string, any> = {
  tehnicianul: IMG.jumpscare[0],
  umbraPlenului: IMG.jumpscare[2],
  fantomaArhivei: IMG.jumpscare[1],
};

const HOME_FEED_LIBRARY = [
  { key: "holprincipal", label: "Hol Principal", source: IMG.rooms.holprincipal },
  { key: "holstanga", label: "Hol Stanga", source: IMG.rooms.holstanga },
  { key: "holdreapta", label: "Hol Dreapta", source: IMG.rooms.holdreapta },
  { key: "back1", label: "Back 1", source: IMG.rooms.back1 },
  { key: "back2", label: "Back 2", source: IMG.rooms.back2 },
  { key: "back3", label: "Back 3", source: IMG.rooms.back3 },
];

const resolveHomeFeedImage = (key?: string | null) => {
  if (!key) return null;
  const found = HOME_FEED_LIBRARY.find((i) => i.key === key);
  if (found) return found.source;
  if (key.startsWith("http")) return { uri: key };
  return null;
};

const SFX = {
  pressMusicButton: require("../../assets/sfx/pressmusicbutton.mp3"),
  seal: require("../../assets/sfx/seal.mp3"),
  open: require("../../assets/sfx/open.mp3"),
  flash: require("../../assets/sfx/flash.mp3"),
  jumpScare: require("../../assets/sfx/jumpscare.mp3"),
  door: require("../../assets/sfx/door.mp3"),
};

const SKY_BANDS = [
  "#5B1E90",
  "#6B2399",
  "#7D28A1",
  "#9430A6",
  "#B43AA8",
  "#D74A9E",
  "#F2657D",
  "#F98E57",
  "#FDBB5B",
  "#FDE3A6",
];

const STAR_POINTS = [
  { x: 0.12, y: 0.12, s: 2 },
  { x: 0.22, y: 0.18, s: 1 },
  { x: 0.34, y: 0.1, s: 1 },
  { x: 0.58, y: 0.16, s: 2 },
  { x: 0.72, y: 0.12, s: 1 },
  { x: 0.84, y: 0.22, s: 2 },
  { x: 0.18, y: 0.3, s: 1 },
  { x: 0.42, y: 0.28, s: 2 },
  { x: 0.64, y: 0.32, s: 1 },
  { x: 0.86, y: 0.34, s: 1 },
];

const CLOUDS = [
  { x: 0.15, y: 0.22, w: 90 },
  { x: 0.68, y: 0.2, w: 110 },
  { x: 0.32, y: 0.34, w: 70 },
  { x: 0.78, y: 0.38, w: 80 },
  { x: 0.12, y: 0.46, w: 100 },
  { x: 0.55, y: 0.5, w: 120 },
];

// ========= TYPES =========
type Screen =
  | "LOADING"
  | "LOGIN"
  | "MENU"
  | "SELECT"
  | "PLAY"
  | "SCORES"
  | "STATS"
  | "WORKSHOP"
  | "INTEL"
  | "ACCOUNT"
  | "SPIN"
  | "SEEDS"
  | "SOCIAL"
  | "NOTIFS"
  | "PROFILE"
  | "ACHIEVEMENTS"
  | "BADGES"
  | "MESSAGES"
  | "ADMIN"
  | "CHALLENGES"
  | "TRADE"
  | "TRADE_MARKET"
  | "COLLECTIBLES";
type GameMode = "STORY" | "CUSTOM" | "ENDLESS" | "CHALLENGE" | "STEALTH" | "RUSH";
type Gadget = "sealTape" | "flashCharge" | "batterySwap" | "signalJammer" | null;
type DifficultyPreset = "EASY" | "NORMAL" | "HARD" | "NIGHTMARE";
type Personality = "brave" | "shy" | "balanced" | "aggressive";
type ModePreset = "NORMAL" | "OLD_TIMES" | "BEST_LEADERS" | "ARTISTS" | "WRITERS" | "MODERN" | "SHADOWS";
type PowerRoute = "BALANCED" | "DOORS" | "CAMS";
type ModifierId = "fog" | "glitchStorm" | "lowPowerStart";
type SkillId = "scanRange" | "doorSpeed" | "camClarity";
type SkillTree = Record<SkillId, number>;
type Contract = { id: string; name: string; desc: string; target: number; progress: number; reward: number; done: boolean };
type GhostPoint = { viewId: ViewId; xPct: number; yPct: number };

type Ability =
  | "standard"
  | "glitch"
  | "jammer"
  | "phantom"
  | "ventCrawler"
  | "musicSensitive"
  | "lurable"
  | "speedy"
  | "stalker"
  | "tank"
  | "doorCamper"
  | "ventSneaker"
  | "heatLover"
  | "coldHunter"
  | "cameraPhasing"
  | "soundSensitive"
  | "generatorHacker"
  | "fakeRetreat"
  | "hallSprinter"
  | "mirror"
  | "shadow"
  | "flashOrDie"
  | "boss";

type Entry = "DOOR_LEFT" | "DOOR_RIGHT" | "VENT_LEFT" | "VENT_RIGHT" | "ANY";

type CharacterDef = {
  id: string; // slug (filename without extension ideally)
  name: string;
  difficulty: number; // 1..10
  ability: Ability;
  entry: Entry;
};

type ViewId =
  | "OFFICE"
  | "HOL_PRINCIPAL"
  | "HOL_STANGA_FAR"
  | "HOL_STANGA_NEAR"
  | "HOL_DREAPTA_FAR"
  | "HOL_DREAPTA_NEAR"
  | "VENT_LEFT_DEEP"
  | "VENT_LEFT_NEAR"
  | "VENT_RIGHT_DEEP"
  | "VENT_RIGHT_NEAR"
  | "ARHIVA"
  | "BASEMENT"
  | "COMISIE"
  | "TRIBUNAL"
  | "DEPUTATILOR"
  | "CAMERA_VORBIT";

type CameraView = {
  id: ViewId;
  name: string;
  bg: any; // require image
  type: "office" | "hall" | "vent" | "room";
  // sprite anchor and depth range for 2D->3D
  anchor: { xPct: number; yPct: number; depthMin: number; depthMax: number };
};

type CamPos = {
  xPct: number;
  yPct: number;
  depth?: number;
};

// ========= CAMERA VIEWS (rooms you already have) =========
const VIEWS: CameraView[] = [
  {
    id: "OFFICE",
    name: "Office (Bodyguard)",
    bg: null,
    type: "office",
    anchor: { xPct: 0.5, yPct: 0.66, depthMin: 0.55, depthMax: 1.0 },
  },
  {
    id: "HOL_PRINCIPAL",
    name: "Hol Principal",
    bg: IMG.rooms.holprincipal,
    type: "hall",
    anchor: { xPct: 0.5, yPct: 0.46, depthMin: 0.10, depthMax: 0.82 },
  },
  {
    id: "HOL_STANGA_FAR",
    name: "Hol Stânga (Far)",
    bg: IMG.rooms.holstanga,
    type: "hall",
    anchor: { xPct: 0.28, yPct: 0.42, depthMin: 0.10, depthMax: 0.48 },
  },
  {
    id: "HOL_STANGA_NEAR",
    name: "Hol Stânga (Near)",
    bg: IMG.rooms.holstanga,
    type: "hall",
    anchor: { xPct: 0.28, yPct: 0.66, depthMin: 0.48, depthMax: 0.95 },
  },
  {
    id: "HOL_DREAPTA_FAR",
    name: "Hol Dreapta (Far)",
    bg: IMG.rooms.holdreapta,
    type: "hall",
    anchor: { xPct: 0.72, yPct: 0.42, depthMin: 0.10, depthMax: 0.48 },
  },
  {
    id: "HOL_DREAPTA_NEAR",
    name: "Hol Dreapta (Near)",
    bg: IMG.rooms.holdreapta,
    type: "hall",
    anchor: { xPct: 0.72, yPct: 0.66, depthMin: 0.48, depthMax: 0.95 },
  },
  {
    id: "VENT_LEFT_DEEP",
    name: "Vent STG (Deep)",
    bg: IMG.rooms.vent1,
    type: "vent",
    anchor: { xPct: 0.22, yPct: 0.44, depthMin: 0.10, depthMax: 0.48 },
  },
  {
    id: "VENT_LEFT_NEAR",
    name: "Vent STG (Near)",
    bg: IMG.rooms.vent1,
    type: "vent",
    anchor: { xPct: 0.22, yPct: 0.68, depthMin: 0.48, depthMax: 0.95 },
  },
  {
    id: "VENT_RIGHT_DEEP",
    name: "Vent DR (Deep)",
    bg: IMG.rooms.vent2,
    type: "vent",
    anchor: { xPct: 0.78, yPct: 0.44, depthMin: 0.10, depthMax: 0.48 },
  },
  {
    id: "VENT_RIGHT_NEAR",
    name: "Vent DR (Near)",
    bg: IMG.rooms.vent2,
    type: "vent",
    anchor: { xPct: 0.78, yPct: 0.68, depthMin: 0.48, depthMax: 0.95 },
  },
  {
    id: "ARHIVA",
    name: "Arhivă",
    bg: IMG.rooms.arhiva,
    type: "room",
    anchor: { xPct: 0.5, yPct: 0.58, depthMin: 0.20, depthMax: 0.90 },
  },
  {
    id: "BASEMENT",
    name: "Subsol",
    bg: IMG.rooms.basement,
    type: "room",
    anchor: { xPct: 0.5, yPct: 0.58, depthMin: 0.20, depthMax: 0.90 },
  },
  {
    id: "COMISIE",
    name: "Sala de Comisie",
    bg: IMG.rooms.saladercomisie,
    type: "room",
    anchor: { xPct: 0.5, yPct: 0.60, depthMin: 0.20, depthMax: 0.92 },
  },
  {
    id: "TRIBUNAL",
    name: "Camera Tribunal",
    bg: IMG.rooms.cameratribunal,
    type: "room",
    anchor: { xPct: 0.52, yPct: 0.60, depthMin: 0.20, depthMax: 0.92 },
  },
  {
    id: "DEPUTATILOR",
    name: "Camera Deputaților",
    bg: IMG.rooms.cameradeputatilor,
    type: "room",
    anchor: { xPct: 0.52, yPct: 0.60, depthMin: 0.20, depthMax: 0.92 },
  },
  {
    id: "CAMERA_VORBIT",
    name: "Camera de Vorbit",
    bg: IMG.rooms.cameradevorbit,
    type: "room",
    anchor: { xPct: 0.52, yPct: 0.60, depthMin: 0.20, depthMax: 0.92 },
  },
];

const ROOM_VIEWS = VIEWS.filter((v) => v.type === "room").map((v) => v.id);
const HALL_VIEWS = VIEWS.filter((v) => v.type === "hall").map((v) => v.id);
const WANDER_VIEWS = [...ROOM_VIEWS, ...HALL_VIEWS];

// Manual overrides per camera (useful for key characters)
const CAM_POSITIONS: Record<ViewId, Record<string, CamPos>> = {
  HOL_DREAPTA_NEAR: {
    tehnicianul: { xPct: 0.72, yPct: 0.64, depth: 0.86 },
  },
  HOL_STANGA_NEAR: {
    pazniculLuiFlutu: { xPct: 0.30, yPct: 0.64, depth: 0.84 },
  },
  VENT_LEFT_NEAR: {
    umbraPlenului: { xPct: 0.22, yPct: 0.70, depth: 0.88 },
  },
  HOL_PRINCIPAL: {
    bromania: { xPct: 0.52, yPct: 0.52, depth: 0.42 },
  },
  OFFICE: {
    tehnicianul: { xPct: 0.54, yPct: 0.70, depth: 0.95 },
  },
  ARHIVA: {},
  BASEMENT: {},
  COMISIE: {},
  TRIBUNAL: {},
  DEPUTATILOR: {},
  CAMERA_VORBIT: {},
  HOL_STANGA_FAR: {},
  HOL_DREAPTA_FAR: {},
  VENT_LEFT_DEEP: {},
  VENT_RIGHT_DEEP: {},
  VENT_RIGHT_NEAR: {},
};

const CAM_MAP_NODES: Record<ViewId, { x: number; y: number }> = {
  OFFICE: { x: 0.5, y: 0.9 },
  HOL_PRINCIPAL: { x: 0.5, y: 0.68 },
  HOL_STANGA_FAR: { x: 0.25, y: 0.52 },
  HOL_STANGA_NEAR: { x: 0.28, y: 0.68 },
  HOL_DREAPTA_FAR: { x: 0.75, y: 0.52 },
  HOL_DREAPTA_NEAR: { x: 0.72, y: 0.68 },
  VENT_LEFT_DEEP: { x: 0.16, y: 0.36 },
  VENT_LEFT_NEAR: { x: 0.2, y: 0.56 },
  VENT_RIGHT_DEEP: { x: 0.84, y: 0.36 },
  VENT_RIGHT_NEAR: { x: 0.8, y: 0.56 },
  ARHIVA: { x: 0.5, y: 0.18 },
  BASEMENT: { x: 0.12, y: 0.18 },
  COMISIE: { x: 0.88, y: 0.18 },
  TRIBUNAL: { x: 0.62, y: 0.3 },
  DEPUTATILOR: { x: 0.38, y: 0.3 },
  CAMERA_VORBIT: { x: 0.5, y: 0.36 },
};

// ========= ROUTES =========
// (FNaF feel: far -> near -> office)
const ROUTES: Record<Entry, ViewId[]> = {
  DOOR_LEFT: ["HOL_STANGA_FAR", "HOL_STANGA_NEAR", "OFFICE"],
  DOOR_RIGHT: ["HOL_DREAPTA_FAR", "HOL_DREAPTA_NEAR", "OFFICE"],
  VENT_LEFT: ["VENT_LEFT_DEEP", "VENT_LEFT_NEAR", "OFFICE"],
  VENT_RIGHT: ["VENT_RIGHT_DEEP", "VENT_RIGHT_NEAR", "OFFICE"],
  ANY: ["HOL_PRINCIPAL", "HOL_DREAPTA_FAR", "HOL_DREAPTA_NEAR", "OFFICE"], // randomized per character
};

// ========= 50 ANIMATRONICI (Romanian personalities) =========
// Important: id = filename slug for character image (if exists). If not exists => default.png used.
const CHARACTERS_50: CharacterDef[] = [
  { id: "tehnicianul", name: "Tehnicianul", difficulty: 8, ability: "flashOrDie", entry: "DOOR_RIGHT" },
  { id: "pazniculLuiFlutu", name: "Paznicul lui Flutu", difficulty: 7, ability: "doorCamper", entry: "DOOR_LEFT" },
  { id: "umbraPlenului", name: "Umbra Plenului", difficulty: 9, ability: "shadow", entry: "ANY" },
  { id: "fantomaArhivei", name: "Fantoma Arhivei", difficulty: 8, ability: "phantom", entry: "ANY" },

  { id: "cojocaru", name: "Cojocaru", difficulty: 6, ability: "standard", entry: "ANY" },
  { id: "selly2", name: "Selly 2", difficulty: 8, ability: "glitch", entry: "DOOR_RIGHT" },
  { id: "micutzu", name: "Micutzu", difficulty: 7, ability: "fakeRetreat", entry: "DOOR_LEFT" },
  { id: "bromania", name: "Bromania", difficulty: 8, ability: "cameraPhasing", entry: "ANY" },

  { id: "puya", name: "Puya", difficulty: 7, ability: "stalker", entry: "DOOR_LEFT" },
  { id: "antonia", name: "Antonia", difficulty: 7, ability: "lurable", entry: "DOOR_RIGHT" },
  { id: "irinrimes", name: "Irina Rimes", difficulty: 7, ability: "phantom", entry: "ANY" },

  { id: "andra", name: "Andra", difficulty: 6, ability: "musicSensitive", entry: "ANY" },
  { id: "inna", name: "INNA", difficulty: 7, ability: "speedy", entry: "DOOR_RIGHT" },
  { id: "delia", name: "Delia", difficulty: 7, ability: "phantom", entry: "ANY" },
  { id: "smiley", name: "Smiley", difficulty: 6, ability: "musicSensitive", entry: "ANY" },

  { id: "crinantonescu", name: "Crin Antonescu", difficulty: 6, ability: "standard", entry: "DOOR_LEFT" },
  { id: "victorPonta", name: "Victor Ponta", difficulty: 7, ability: "stalker", entry: "DOOR_RIGHT" },
  { id: "gabrielaFirea", name: "Gabriela Firea", difficulty: 7, ability: "glitch", entry: "ANY" },

  { id: "kelemen", name: "Kelemen", difficulty: 6, ability: "lurable", entry: "DOOR_LEFT" },
  { id: "drula", name: "Drul?", difficulty: 6, ability: "standard", entry: "ANY" },
  { id: "georgeSimion", name: "George Simion", difficulty: 8, ability: "heatLover", entry: "DOOR_RIGHT" },

  { id: "ciolacu", name: "Ciolacu", difficulty: 7, ability: "tank", entry: "DOOR_LEFT" },
  { id: "ioHannis", name: "Iohannis", difficulty: 7, ability: "coldHunter", entry: "ANY" },

  { id: "eugenionescu", name: "Eugen Ionescu", difficulty: 8, ability: "glitch", entry: "ANY" },
  { id: "alecsandri", name: "Alecsandri", difficulty: 5, ability: "lurable", entry: "DOOR_RIGHT" },
  { id: "cosbuc", name: "Co?buc", difficulty: 5, ability: "standard", entry: "DOOR_LEFT" },
  { id: "nichitaStanescu", name: "Nichita St?nescu", difficulty: 7, ability: "phantom", entry: "ANY" },

  { id: "marinPreda", name: "Marin Preda", difficulty: 7, ability: "tank", entry: "DOOR_LEFT" },
  { id: "eliade", name: "Eliade", difficulty: 7, ability: "stalker", entry: "ANY" },
  { id: "arghezi", name: "Arghezi", difficulty: 6, ability: "musicSensitive", entry: "DOOR_RIGHT" },
  { id: "blaga", name: "Blaga", difficulty: 6, ability: "phantom", entry: "ANY" },

  { id: "caragiale", name: "Caragiale", difficulty: 6, ability: "fakeRetreat", entry: "ANY" },
  { id: "creanga", name: "Creang?", difficulty: 5, ability: "lurable", entry: "DOOR_LEFT" },
  { id: "eminescu", name: "Eminescu", difficulty: 6, ability: "musicSensitive", entry: "DOOR_RIGHT" },

  { id: "traian", name: "Traian", difficulty: 6, ability: "standard", entry: "ANY" },
  { id: "mirceaCelBatran", name: "Mircea cel B?tr?n", difficulty: 8, ability: "mirror", entry: "DOOR_LEFT" },
  { id: "ferdinand", name: "Ferdinand", difficulty: 6, ability: "standard", entry: "DOOR_LEFT" },

  { id: "carol1", name: "Carol I", difficulty: 6, ability: "standard", entry: "DOOR_RIGHT" },
  { id: "reginaMaria", name: "Regina Maria", difficulty: 7, ability: "phantom", entry: "ANY" },

  { id: "cuzaVoda", name: "Cuza Vod?", difficulty: 7, ability: "lurable", entry: "DOOR_LEFT" },
  { id: "decebal", name: "Decebal", difficulty: 8, ability: "stalker", entry: "ANY" },

  { id: "mihaiViteazu", name: "Mihai Viteazu", difficulty: 9, ability: "hallSprinter", entry: "DOOR_RIGHT" },
  { id: "stefanCelMare", name: "?tefan cel Mare", difficulty: 9, ability: "tank", entry: "DOOR_LEFT" },
  { id: "vladtepes", name: "Vlad Tepes (Boss)", difficulty: 12, ability: "boss", entry: "ANY" },
];

type RunningChar = {
  def: CharacterDef;
  route: ViewId[];
  idx: number;
  depth: number; // 0..1 within segment
  nextMoveIn: number; // seconds
  jammerCharge: number; // camera jam chance
  phantomRevealUntil: number; // timestamp ms
  shadowRevealUntil: number; // timestamp ms
  doorPressure: number; // seconds spent blocked at door/vent
  fakeRetreatReadyUntil: number; // timestamp ms
  phaseRevealUntil: number; // timestamp ms
  state: "HUNT" | "COOLDOWN";
  cooldownUntil: number;
  home: ViewId;
  patrol: ViewId[];
  personality: Personality;
};

const PATROL_PATHS: ViewId[][] = [
  ["ARHIVA", "CAMERA_VORBIT", "HOL_PRINCIPAL", "HOL_DREAPTA_FAR"],
  ["BASEMENT", "HOL_STANGA_FAR", "HOL_STANGA_NEAR", "HOL_PRINCIPAL"],
  ["COMISIE", "TRIBUNAL", "HOL_DREAPTA_FAR", "HOL_PRINCIPAL"],
  ["DEPUTATILOR", "TRIBUNAL", "HOL_STANGA_FAR", "HOL_PRINCIPAL"],
  ["CAMERA_VORBIT", "HOL_PRINCIPAL", "HOL_DREAPTA_NEAR", "HOL_STANGA_NEAR"],
];

type TaskDef = {
  id: string;
  name: string;
  desc: string;
  steps: number;
  reward: number;
  drain: number;
};

type TaskState = {
  id: string;
  progress: number; // 0..1
  done: boolean;
};

type AchievementDef = {
  id: string;
  name: string;
  desc: string;
  tier: "common" | "rare" | "epic" | "legendary" | "mythic";
};

const BEST_KEY = "FIVE_DAYS_BEST_SCORE_V2";
const PROFILE_KEY = "FIVE_DAYS_PROFILE_V1";
const SCORE_LOG_KEY = "FIVE_DAYS_SCORE_LOG_V1";
const CREDITS_KEY = "FIVE_DAYS_CREDITS_V1";
const INTEL_KEY = "FIVE_DAYS_INTEL_V1";
const ACHIEVE_KEY = "FIVE_DAYS_ACHIEVE_V1";
const INVENTORY_KEY = "FIVE_DAYS_INVENTORY_V1";
const DAILY_KEY = "FIVE_DAYS_DAILY_SCORES_V1";
const ADAPT_KEY = "FIVE_DAYS_ADAPT_V1";
const GHOST_KEY = "FIVE_DAYS_GHOST_V1";
const SKILL_KEY = "FIVE_DAYS_SKILL_V1";
const CONTRACT_KEY = "FIVE_DAYS_CONTRACT_V1";
const AUTH_KEY = "FIVE_DAYS_AUTH_V1";
const RECENTS_KEY = "FIVE_DAYS_SOCIAL_RECENTS_V1";
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || "";
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
let randGlobal = () => Math.random();
const pick = <T,>(arr: T[]) => arr[Math.floor(randGlobal() * arr.length)];
const hash01 = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (Math.abs(h) % 1000) / 1000;
};

const challengeMultiplier = (c: any) => {
  if (!c) return 1;
  let mult = 1;
  if (c.noCams) mult += 0.15;
  if (c.noFlash) mult += 0.1;
  if (c.noOverclock) mult += 0.1;
  if (c.noDoors) mult += 0.12;
  if (c.onlyVents) mult += 0.08;
  if (c.doubleDrain) mult += 0.12;
  if (c.oneBattery) mult += 0.1;
  return mult;
};

const { width: SW, height: SH } = Dimensions.get("window");
const uiCompact = SW < 1100 || SH < 860;
const ultraCompact = SW < 520 || SH < 720;
const microCompact = SW < 360 || SH < 640;
const dockCols = microCompact ? 1 : SW < 520 || SH < 700 ? 2 : SW < 900 ? 3 : 4;
const gameScale = Math.min(1, Math.max(0.75, Math.min(SW / 900, SH / 700)));

// 2D -> 3D effect
const depthToScale = (depth: number) => 0.35 + depth * 0.95; // 0.35..1.3
const depthToYOffset = (depth: number) => depth * 140;

// Night settings (6 hours per night)
const NIGHT_LEN_MS = [210_000, 210_000, 210_000, 210_000, 210_000];
const NIGHT_FACTOR = [1.0, 1.08, 1.16, 1.24, 1.32];
const HOURS_PER_NIGHT = 6;
const SAFE_HOURS = 2;

const DIFFICULTY_ORDER: DifficultyPreset[] = ["EASY", "NORMAL", "HARD", "NIGHTMARE"];
const DIFFICULTY_LABEL: Record<DifficultyPreset, string> = {
  EASY: "Easy",
  NORMAL: "Normal",
  HARD: "Hard",
  NIGHTMARE: "Nightmare",
};
const DIFFICULTY_OFFSET: Record<DifficultyPreset, number> = {
  EASY: -3,
  NORMAL: 0,
  HARD: 3,
  NIGHTMARE: 6,
};
const DIFFICULTY_SPEED: Record<DifficultyPreset, number> = {
  EASY: 0.86,
  NORMAL: 1,
  HARD: 1.12,
  NIGHTMARE: 1.26,
};

const TASK_DEFS: TaskDef[] = [
  { id: "reboot", name: "Reboot Server", desc: "Stabilizează sistemul de camere.", steps: 4, reward: 120, drain: 0.02 },
  { id: "calibrate", name: "Calibrate Sensors", desc: "Recalibrează senzorii de pe holuri.", steps: 5, reward: 140, drain: 0.02 },
  { id: "purge", name: "Purge Logs", desc: "Curăță logurile pentru a reduce glitch-urile.", steps: 3, reward: 90, drain: 0.015 },
  { id: "ventcheck", name: "Vent Check", desc: "Verifică venturile pentru scurgeri.", steps: 4, reward: 110, drain: 0.02 },
  { id: "powergrid", name: "Power Grid Sync", desc: "Sincronizează grid-ul pentru stabilitate.", steps: 5, reward: 160, drain: 0.025 },
];

const SKILL_DEFS: { id: SkillId; name: string; desc: string; cost: number; tier: 1 | 2 | 3 }[] = [
  { id: "scanRange", name: "Scan Range I", desc: "+durata scan", cost: 120, tier: 1 },
  { id: "scanRangeT2", name: "Scan Range II", desc: "+ și mai mult range", cost: 180, tier: 2 },
  { id: "scanRangeT3", name: "Scan Range III", desc: "max range + reveal mai clar", cost: 260, tier: 3 },
  { id: "doorSpeed", name: "Door Speed I", desc: "+rezistență uși", cost: 140, tier: 1 },
  { id: "doorSpeedT2", name: "Door Speed II", desc: "uși se închid/deschid mai rapid", cost: 190, tier: 2 },
  { id: "doorSpeedT3", name: "Door Speed III", desc: "uși aproape instant, consum mai mic", cost: 260, tier: 3 },
  { id: "camClarity", name: "Cam Clarity I", desc: "-glitch / -dead zones", cost: 150, tier: 1 },
  { id: "camClarityT2", name: "Cam Clarity II", desc: "claritate + reducere noise", cost: 210, tier: 2 },
  { id: "camClarityT3", name: "Cam Clarity III", desc: "anti-fog, anti-glitch", cost: 280, tier: 3 },
];

const BADGES: {
  id: string;
  name: string;
  type: "emoji" | "image" | "icon";
  value: any;
  desc?: string;
}[] = [
  { id: "verified", name: "Verified", type: "icon", value: "verified", desc: "Verified user" },
  { id: "moderator", name: "Moderator", type: "icon", value: "gavel", desc: "Moderator badge" },
  { id: "early_bird", name: "Early Access", type: "emoji", value: "??", desc: "Available until March" },
  { id: "bolojan", name: "Bolojan", type: "image", value: IMG.characters.iliebolojan, desc: "Seen Bolojan" },
  { id: "nicusor", name: "Nicusor Dan", type: "image", value: IMG.characters.nicusordan, desc: "Seen Nicusor Dan" },
  { id: "rose", name: "Rose", type: "emoji", value: "??", desc: "Finish a match at least once" },
  { id: "season_top1", name: "Season #1", type: "emoji", value: "??", desc: "Season #1 leaderboard" },
  { id: "season_top2", name: "Season #2", type: "emoji", value: "??", desc: "Season #2 leaderboard" },
  { id: "season_top3", name: "Season #3", type: "emoji", value: "??", desc: "Season #3 leaderboard" },
];


const CONTRACT_DEFS: { id: string; name: string; desc: string; target: number; reward: number }[] = [
  { id: "scan3", name: "Operator Scan", desc: "Folosește scan de 3 ori într-o noapte.", target: 3, reward: 90 },
  { id: "noDoors", name: "Silent Night", desc: "Supraviețuiește fără uși.", target: 1, reward: 120 },
  { id: "tasks2", name: "Maintenance", desc: "Completează 2 task-uri.", target: 2, reward: 110 },
];

const GADGET_SHOP: {
  id: Gadget;
  name: string;
  cost: number;
  desc: string;
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
}[] = [
  { id: "sealTape", name: "Seal Tape", cost: 6, desc: "Sigilează vent 6s fără power.", rarity: "common" },
  { id: "flashCharge", name: "Flash Charge", cost: 7, desc: "Flash instant, consum redus.", rarity: "common" },
  { id: "batterySwap", name: "Battery Swap", cost: 8, desc: "Reumple +20% power.", rarity: "rare" },
  { id: "signalJammer", name: "Signal Jammer", cost: 9, desc: "Încetinește AI 6s.", rarity: "rare" },
  { id: "ventFoam", name: "Vent Foam", cost: 10, desc: "Scade viteza pe vent 10s.", rarity: "rare" },
  { id: "coolMist", name: "Cool Mist", cost: 11, desc: "-10 heat, -noise 5s.", rarity: "rare" },
  { id: "lureBeacon", name: "Lure Beacon", cost: 12, desc: "Atrage spre view selectat 5s.", rarity: "epic" },
  { id: "shockMine", name: "Shock Mine", cost: 14, desc: "Stun în hol/vent o dată.", rarity: "epic" },
  { id: "overclockCore", name: "Overclock Core", cost: 16, desc: "+100% scan 6s, +heat.", rarity: "epic" },
  { id: "batteryPlus", name: "Battery 100%", cost: 18, desc: "Reumple power la 100%.", rarity: "legendary" },
  { id: "artifactShard", name: "Artifact Shard", cost: 22, desc: "Oprește boss 1 dată/noapte.", rarity: "mythic" },
];

const RADIO_LINES = [
  "Semnal slab... verifică holul principal.",
  "Raport: mișcare la dreapta.",
  "Zgomot în venturi... rămâi calm.",
  "Senzori fluctuează. Verifică camerele.",
  "Nu lăsa ușile prea mult închise.",
  "Stabilitate OK. Ține ritmul.",
];

const HELP_LINES = [
  "UȘĂ STG/DR: oprește intrarea pe uși (consumă power).",
  "SEAL STG/DR: blochează venturile temporar.",
  "CAMERA: vezi camerele; LURE atrage spre view.",
  "MUSIC: calmează musicSensitive; RESET curăță JAM.",
  "LIGHT: reveal phantom/shadow; GEN = mini-game power.",
  "TASKS: completează pentru bonus score.",
  "ALARM: sperie AI dar scade power; PING arată STG/DR.",
  "NOISE mare = AI mai agresiv.",
  "BLACKOUT / FALSE ALARM / SURGE = evenimente rare.",
  "Look left/right: mișcă mouse sau ține apăsat pe margini.",
];

const STORY_EVENTS: Record<number, { t: number; line: string }[]> = {
  1: [
    { t: 10, line: "Bine ai venit. Tine usile sub control." },
    { t: 28, line: "Zgomote la holul principal..." },
  ],
  2: [
    { t: 12, line: "Senzorii sunt instabili. Foloseste camerele." },
    { t: 36, line: "Venturile par mai active in seara asta." },
  ],
  3: [
    { t: 15, line: "Nu te baza doar pe usi. Fii atent la venturi." },
    { t: 40, line: "Inca putin pana la 1 AM. Rezista." },
  ],
  4: [
    { t: 8, line: "Azi e noaptea grea..." },
    { t: 22, line: "Ai grija. Un boss e aproape." },
  ],
};

const ACHIEVEMENTS: AchievementDef[] = [
  { id: "firstNight", name: "First Night", desc: "Supravietuieste pana la 1 AM.", tier: "common" },
  { id: "firstTask", name: "Task Runner", desc: "Completeaza primul task.", tier: "common" },
  { id: "watchful", name: "Watchful", desc: "Verifica camerele de 10 ori intr-o noapte.", tier: "common" },
  { id: "quickSeal", name: "Quick Seal", desc: "Foloseste un SEAL la timp.", tier: "common" },
  { id: "calmMind", name: "Calm Mind", desc: "Termina o noapte cu sanity peste 60%.", tier: "common" },
  { id: "noPanic", name: "No Panic", desc: "Nu declansa ALARM intr-o noapte.", tier: "common" },

  { id: "night2", name: "Night Two", desc: "Supravietuieste Night 2.", tier: "rare" },
  { id: "powerSurge", name: "Power Surge", desc: "Supravietuieste unui power surge.", tier: "rare" },
  { id: "blackout", name: "In the Dark", desc: "Treci printr-un blackout.", tier: "rare" },
  { id: "ventMaster", name: "Vent Master", desc: "Blocheaza venturile de 5 ori.", tier: "rare" },
  { id: "doorTech", name: "Door Technician", desc: "Foloseste usa stanga/dreapta perfect.", tier: "rare" },
  { id: "firstDeal", name: "Risk Taker", desc: "Accepta un deal si supravietuieste.", tier: "rare" },

  { id: "night3", name: "Night Three", desc: "Supravietuieste Night 3.", tier: "epic" },
  { id: "taskMaster", name: "Task Master", desc: "Completeaza 3 task-uri intr-o noapte.", tier: "epic" },
  { id: "stealthRun", name: "Stealth Run", desc: "Termina o noapte fara camere.", tier: "epic" },
  { id: "zeroJams", name: "Clean Signal", desc: "Nu ai niciun camera jam intr-o noapte.", tier: "epic" },
  { id: "ghostHunter", name: "Ghost Hunter", desc: "Revealeaza 10 phantom/shadow.", tier: "epic" },
  { id: "powerManager", name: "Power Manager", desc: "Termina cu power peste 50%.", tier: "epic" },

  { id: "night5", name: "Night Five", desc: "Supravietuieste Night 5.", tier: "legendary" },
  { id: "noDoorsWin", name: "Silent Night", desc: "Castiga fara a folosi usile.", tier: "legendary" },
  { id: "perfectPower", name: "Perfect Power", desc: "Termina cu power peste 80%.", tier: "legendary" },
  { id: "bossSurvivor", name: "Boss Survivor", desc: "Invinge noaptea cu boss.", tier: "legendary" },
  { id: "speedRunner", name: "Speed Runner", desc: "Termina o noapte in sub 2:30.", tier: "legendary" },
  { id: "ironWill", name: "Iron Will", desc: "Termina o noapte cu sanity sub 20%.", tier: "legendary" },

  { id: "night6", name: "Night 6", desc: "Termina Night 6.", tier: "mythic" },
  { id: "hardcore", name: "Hardcore", desc: "Castiga in Hardcore.", tier: "mythic" },
  { id: "noCamsWin", name: "Blind Run", desc: "Termina fara camere sau flash.", tier: "mythic" },
  { id: "ultimateHunter", name: "Ultimate Hunter", desc: "Supravietuieste cu toti pe L20.", tier: "mythic" },
  { id: "shadowBreaker", name: "Shadow Breaker", desc: "Revealeaza 5 shadow in aceeasi noapte.", tier: "mythic" },
  { id: "mythicEndless", name: "Endless Legend", desc: "Ajungi la H+10 in Endless.", tier: "mythic" },
];

const ABILITY_DESC: Record<Ability, string> = {
  standard: "Comportament standard pe rută.",
  glitch: "Schimbă ruta aleator și poate apărea neașteptat.",
  jammer: "Poate bloca camerele (Camera Jam).",
  phantom: "Vizibil doar cu LIGHT pe camere.",
  ventCrawler: "Preferă venturile și se mișcă mai rapid acolo.",
  musicSensitive: "Se retrage când folosești MUSIC.",
  lurable: "Răspunde la LURE și se abate din rută.",
  speedy: "Viteză crescută.",
  stalker: "Presiune constantă, se apropie încet dar sigur.",
  tank: "Greu de oprit, avansează chiar dacă îl încetinești.",
  doorCamper: "Stă la ușă și forțează intrarea dacă îl ții blocat.",
  ventSneaker: "Ignoră ușile, vine prin venturi.",
  heatLover: "Vine mai repede când e cald.",
  coldHunter: "Vine mai repede când e rece.",
  cameraPhasing: "Poate sări segmente când camerele sunt active.",
  soundSensitive: "Devine agresiv dacă folosești RESET des.",
  generatorHacker: "Poate opri generatorul în timpul mini-game.",
  fakeRetreat: "Se retrage dar revine rapid.",
  hallSprinter: "Sare rapid prin holuri către birou.",
  mirror: "Apare doar când NU te uiți la cameră.",
  shadow: "Se vede doar cu LIGHT (shadow reveal).",
  flashOrDie: "Stă în față și trebuie FLASH rapid, altfel te omoară.",
  boss: "Boss: forțează intrarea și crește presiunea.",
};

const MODE_PRESETS: Record<ModePreset, string[]> = {
  NORMAL: [],
  OLD_TIMES: ["carol1", "reginaMaria", "ferdinand", "mirceaCelBatran", "stefanCelMare", "mihaiViteazu", "decebal", "cuzaVoda"],
  BEST_LEADERS: ["carol1", "reginaMaria", "ferdinand", "mirceaCelBatran", "stefanCelMare", "mihaiViteazu", "cuzaVoda", "decebal", "traian"],
  ARTISTS: ["smiley", "delia", "inna", "andra", "irinrimes", "antonia", "puya", "bromania", "micutzu"],
  WRITERS: ["eminescu", "creanga", "caragiale", "blaga", "eliade", "arghezi", "marinPreda", "nichitaStanescu", "alecsandri", "cosbuc"],
  MODERN: ["ciolacu", "ioHannis", "georgeSimion", "drula", "kelemen", "gabrielaFirea", "victorPonta", "crinantonescu", "cojocaru"],
  SHADOWS: ["umbraPlenului", "fantomaArhivei", "tehnicianul", "pazniculLuiFlutu", "bromania"],
};

const NIGHT_MODIFIERS: { id: ModifierId; name: string; desc: string }[] = [
  { id: "fog", name: "Fog", desc: "Vizibilitate redusă." },
  { id: "glitchStorm", name: "Glitch Storm", desc: "Camerele dau glitch mai des." },
  { id: "lowPowerStart", name: "Low Power Start", desc: "Începi cu power redus." },
];
const DEALER_ID = "tehnicianul";
const SPIN_REWARDS: { id: string; label: string; type: "credits" | "gadget"; value: number; rarity: string }[] = [
  { id: "c25", label: "+25 Credits", type: "credits", value: 25, rarity: "common" },
  { id: "c75", label: "+75 Credits", type: "credits", value: 75, rarity: "rare" },
  { id: "c200", label: "+200 Credits", type: "credits", value: 200, rarity: "epic" },
  { id: "g_overclock", label: "Overclock Core", type: "gadget", value: 1, rarity: "epic" },
  { id: "g_battery", label: "Battery+", type: "gadget", value: 1, rarity: "rare" },
  { id: "g_artifact", label: "Artifact Shard", type: "gadget", value: 1, rarity: "legendary" },
  { id: "c500", label: "+500 Credits", type: "credits", value: 500, rarity: "mythic" },
];

// UI helpers
const shadow = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  android: { elevation: 12 },
  default: {},
});

export default function App() {
  const [screen, setScreen] = useState<Screen>("LOADING");
  const [uiTick, setUiTick] = useState(0);
  const [profileName, setProfileName] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [scoreLog, setScoreLog] = useState<{ score: number; night: number; who: string; ts: number }[]>([]);
  const [authToken, setAuthToken] = useState("");
  const [authUser, setAuthUser] = useState<{ id?: string; username: string; email?: string; role?: string; verified?: boolean } | null>(null);
  const [userStats, setUserStats] = useState<{ best: number; sessions: number; highest_night: number; total_score: number } | null>(null);
  const [loginUser, setLoginUser] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [registerMode, setRegisterMode] = useState(false);
  const [remoteScores, setRemoteScores] = useState<{ username: string; score: number; night: number }[]>([]);
  const [remoteCoins, setRemoteCoins] = useState<{ username: string; credits: number }[]>([]);
  const [remoteChallenges, setRemoteChallenges] = useState<{ username: string; count: number }[]>([]);
  const [scoreTab, setScoreTab] = useState<"score" | "coins" | "challenges">("score");
  const [seasonId, setSeasonId] = useState("");
  const [seasonScores, setSeasonScores] = useState<{ username: string; score: number; night: number }[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [displayFont, setDisplayFont] = useState("System");
  const [displayColor, setDisplayColor] = useState("#EAF2FF");
  const [profileBanner, setProfileBanner] = useState("back1");
  const [profileBackground, setProfileBackground] = useState("back1");
  const [seedName, setSeedName] = useState("");
  const [seeds, setSeeds] = useState<any[]>([]);
  const [seedBusy, setSeedBusy] = useState(false);
  const [currentSeed, setCurrentSeed] = useState("");
  const [publicSeeds, setPublicSeeds] = useState<any[]>([]);
  const [seedSearch, setSeedSearch] = useState("");
  const [postBody, setPostBody] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [homeFeedItems, setHomeFeedItems] = useState<any[]>([]);
  const [adminFeedDraft, setAdminFeedDraft] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [collectibles, setCollectibles] = useState<any[]>([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, any[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [commentReplyTo, setCommentReplyTo] = useState<Record<string, string | null>>({});
  const [profileSearch, setProfileSearch] = useState("");
  const [profileResults, setProfileResults] = useState<any[]>([]);
  const [messageFriends, setMessageFriends] = useState<any[]>([]);
  const [profileView, setProfileView] = useState<any | null>(null);
  const [profileStats, setProfileStats] = useState<any | null>(null);
  const [profileFollowers, setProfileFollowers] = useState(0);
  const [profileFollowing, setProfileFollowing] = useState(0);
  const [profileIsFollowing, setProfileIsFollowing] = useState(false);
  const [profileIsFriend, setProfileIsFriend] = useState(false);
  const [profileFeatured, setProfileFeatured] = useState<string[]>([]);
  const [profileLikedPosts, setProfileLikedPosts] = useState<SocialPost[]>([]);
  const [profileFavoritePosts, setProfileFavoritePosts] = useState<SocialPost[]>([]);
  const [profilePosts, setProfilePosts] = useState<SocialPost[]>([]);
  const [profilePolls, setProfilePolls] = useState<any[]>([]);
  const [dmDraft, setDmDraft] = useState("");
  const [dmMessages, setDmMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messageUser, setMessageUser] = useState<any | null>(null);
  const [messageSearch, setMessageSearch] = useState("");
  const [featuredAchievements, setFeaturedAchievements] = useState<string[]>([]);
  const [badgesSelected, setBadgesSelected] = useState<string[]>([]);
  const [seasonBadges, setSeasonBadges] = useState<string[]>([]);
  const [pinnedPostId, setPinnedPostId] = useState<string>("");
  const [spinPity, setSpinPity] = useState(0);
  const [spinLog, setSpinLog] = useState<
    { ts: number; seed: string; bet: number; reward: string; rarity: string }[]
  >([]);
  const [accountUsername, setAccountUsername] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountCurrentPass, setAccountCurrentPass] = useState("");
  const [accountNewPass, setAccountNewPass] = useState("");
  const [accountMsg, setAccountMsg] = useState("");
  const [adminNoticeTitle, setAdminNoticeTitle] = useState("");
  const [adminNoticeBody, setAdminNoticeBody] = useState("");
  const [adminNoticeFrom, setAdminNoticeFrom] = useState("");
  const [adminNoticeMinutes, setAdminNoticeMinutes] = useState("");
  const [adminCreditUser, setAdminCreditUser] = useState("");
  const [adminCreditAmount, setAdminCreditAmount] = useState("1000");
  const [adminStatus, setAdminStatus] = useState("");
  const [achievementSearch, setAchievementSearch] = useState("");
  const [feedSearch, setFeedSearch] = useState("");
  const [recents, setRecents] = useState<SocialRecentItem[]>([]);
  const [spinRunning, setSpinRunning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [spinBet, setSpinBet] = useState(25);
  const [spinHitId, setSpinHitId] = useState<string | null>(null);
  const spinCooldownUntil = useRef(0);
  const lastSpinTs = useRef(0);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDesc, setChallengeDesc] = useState("");
  const [challengeType, setChallengeType] = useState<"daily" | "weekly" | "custom">("daily");
  const [challengeStatus, setChallengeStatus] = useState("");
  const [challengeReward, setChallengeReward] = useState("0");
  const [challengePreset, setChallengePreset] = useState("");
  const [challengeDiff, setChallengeDiff] = useState("50");
  const [challengeGear, setChallengeGear] = useState("");
  const [challengeGearAllowed, setChallengeGearAllowed] = useState<string[]>([]);
  const [challengeGearFree, setChallengeGearFree] = useState<string[]>([]);
  const [challengeChars, setChallengeChars] = useState<string[]>([]);
  const [challengePinned, setChallengePinned] = useState(false);
  const [challengeSelected, setChallengeSelected] = useState<any | null>(null);
  const [challengeJoinedIds, setChallengeJoinedIds] = useState<string[]>([]);
  const [challengeJoinCode, setChallengeJoinCode] = useState("");
  const gearOverrideRef = useRef<any[] | null>(null);
  const challengeRunRef = useRef<string | null>(null);
  const [challengeTab, setChallengeTab] = useState<"list" | "create" | "detail">("list");
  const [challengeFont, setChallengeFont] = useState("System");
  const [challengeRewardGadget, setChallengeRewardGadget] = useState("");
  const [challengeThumb, setChallengeThumb] = useState("back1");
  const [challengeIcon, setChallengeIcon] = useState("back2");
  const [challengePrivate, setChallengePrivate] = useState(false);
  const [challengeAccessCode, setChallengeAccessCode] = useState("");
  const [challengeFlags, setChallengeFlags] = useState({
    camera: true,
    doorL: true,
    doorR: true,
    music: true,
    vents: true,
  });
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spinStrip = useMemo(() => Array.from({ length: 600 }, (_, i) => SPIN_REWARDS[i % SPIN_REWARDS.length]), []);
  const spinTargetRef = useRef<number>(0);

  const runSpin = (reward: (typeof SPIN_REWARDS)[number], bet: number, onFinish?: () => void) => {
    if (spinRunning) return;
    setSpinRunning(true);
    setSpinResult(null);
    const spinSeed = `${Date.now()}-${Math.random()}`;
    const creditsBefore = credits;
    const startTs = Date.now();
    setTimeout(() => {
      if (reward.type === "credits") {
        setCredits((c) => {
          const mult = Math.max(1, bet / 50);
          const next = c + Math.round(reward.value * mult);
          saveSettingsImmediate({ credits: next });
          persistLocal(CREDITS_KEY, String(next));
          return next;
        });
      } else {
        const amount = bet >= 200 ? 2 : 1;
        addInventory(reward.id.replace("g_", "") as any, amount);
      }
      const endTs = Date.now();
      setSpinResult(reward.label);
      setSpinRunning(false);
      setSpinPity((prev) => {
        const isBig = reward.rarity === "epic" || reward.rarity === "legendary" || reward.rarity === "mythic";
        const next = isBig ? 0 : prev + 1;
        saveSettingsImmediate({ spinPity: next });
        return next;
      });
      setSpinLog((prev) => {
        const next = [
          { ts: Date.now(), seed: spinSeed, bet, reward: reward.label, rarity: reward.rarity },
          ...(prev || []),
        ].slice(0, 30);
        saveSettingsImmediate({ spinLog: next });
        return next;
      });
      spinCooldownUntil.current = Date.now() + 3000;
      apiPost("spin_log", {
        rewardId: reward.id,
        rewardLabel: reward.label,
        rarity: reward.rarity,
        bet,
        seed: spinSeed,
        durationMs: endTs - startTs,
        creditsBefore,
        creditsAfter: reward.type === "credits" ? creditsBefore + Math.round(reward.value * Math.max(1, bet / 50)) : creditsBefore,
      }).catch(() => {});
      onFinish?.();
    }, 1200);
  };

  // local-only persistence helper (guests). Auth users save to DB instead.
  const persistLocal = useCallback(
    (key: string, value: string) => {
      if (authToken) return;
      AsyncStorage.setItem(key, value).catch(() => {});
    },
    [authToken]
  );

  // menu selection
  const [bgPick, setBgPick] = useState<"back1" | "back2" | "back3">("back1");
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const s: Record<string, boolean> = {};
    CHARACTERS_50.slice(0, 4).forEach((c) => (s[c.id] = true));
    return s;
  });
  const [selectedInfoId, setSelectedInfoId] = useState<string | null>(CHARACTERS_50[0]?.id ?? null);
  const [mode, setMode] = useState<GameMode>("STORY");
  const [difficultyPreset, setDifficultyPreset] = useState<DifficultyPreset>("NORMAL");
  const [modePreset, setModePreset] = useState<ModePreset>("NORMAL");
  const [modeTier, setModeTier] = useState(1);
  const [dailyRun, setDailyRun] = useState(false);
  const [dailyScores, setDailyScores] = useState<{ date: string; score: number; night: number }[]>([]);
  const [adaptiveDeaths, setAdaptiveDeaths] = useState(0);
  const [ghostByView, setGhostByView] = useState<Record<string, GhostPoint[]>>({});
  const [skills, setSkills] = useState<SkillTree>({ scanRange: 0, doorSpeed: 0, camClarity: 0 });
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [cutsceneOpen, setCutsceneOpen] = useState(false);
  const [cutsceneUntil, setCutsceneUntil] = useState(0);
  const [rareRoomId, setRareRoomId] = useState<ViewId | null>(null);
  const [rareRoomUntil, setRareRoomUntil] = useState(0);
  const [rareLooted, setRareLooted] = useState(false);
  const [night6, setNight6] = useState(false);
  const [hardcore, setHardcore] = useState(false);
  const [customLevels, setCustomLevels] = useState<Record<string, number>>({});
  const [challenge, setChallenge] = useState({
    noCams: false,
    noDoors: false,
    doubleDrain: false,
    onlyVents: false,
    oneBattery: false,
    noFlash: false,
    noOverclock: false,
  });
  const [gadgets, setGadgets] = useState<Gadget[]>(["sealTape", "flashCharge"]);
  const [ventHealth, setVentHealth] = useState(100);
  const [sanity, setSanity] = useState(100);
  const [signalJammerUntil, setSignalJammerUntil] = useState(0);
  const [falseCueUntil, setFalseCueUntil] = useState(0);
  const [lastPingAt, setLastPingAt] = useState(0);
  const selectedList = useMemo(() => CHARACTERS_50.filter((c) => !!selected[c.id]), [selected]);
  const bossDef = useMemo(() => CHARACTERS_50.find((c) => c.id === "vladtepes"), []);
  const presetActive = modePreset !== "NORMAL";
  const canStart = selectedList.length >= 4;

  // async score
  const [best, setBest] = useState(0);
  const [credits, setCredits] = useState(0);
  const [intel, setIntel] = useState<Record<string, number>>({});
  const [achievements, setAchievements] = useState<Record<string, boolean>>({});
  const [achievementToast, setAchievementToast] = useState("");
  const [achievementUntil, setAchievementUntil] = useState(0);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [equipPick, setEquipPick] = useState<{ id: Gadget; slot: number | null } | null>(null);

  // game state
  const [night, setNight] = useState(1); // 1..5
  const [score, setScore] = useState(0);
  const [nightHour, setNightHour] = useState(0);

  const [power, setPower] = useState(100);
  const [heat, setHeat] = useState(22);
  const [air, setAir] = useState(100);
  const [powerOutAt, setPowerOutAt] = useState(0);
  const [powerRoute, setPowerRoute] = useState<PowerRoute>("BALANCED");
  const [powerSpikeUntil, setPowerSpikeUntil] = useState(0);
  const [powerSpikeChoice, setPowerSpikeChoice] = useState<PowerRoute | null>(null);

  const [doorL, setDoorL] = useState(false);
  const [doorR, setDoorR] = useState(false);

  const [sealLUntil, setSealLUntil] = useState(0);
  const [sealRUntil, setSealRUntil] = useState(0);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [camIndex, setCamIndex] = useState(0);

  const [camJamUntil, setCamJamUntil] = useState(0);
  const [camGlitchUntil, setCamGlitchUntil] = useState(0);
  const [camDeadUntil, setCamDeadUntil] = useState<Record<string, number>>({});

  // cooldowns
  const [musicCdUntil, setMusicCdUntil] = useState(0);
  const [resetCdUntil, setResetCdUntil] = useState(0);
  const [lureCdUntil, setLureCdUntil] = useState(0);
  const [lightCdUntil, setLightCdUntil] = useState(0);
  const [scanCdUntil, setScanCdUntil] = useState(0);
  const [scanUntil, setScanUntil] = useState(0);
  const [overclockCdUntil, setOverclockCdUntil] = useState(0);

  // fan
  const [fan, setFan] = useState(0.55);

  // generator
  const [genOpen, setGenOpen] = useState(false);
  const [genSeq, setGenSeq] = useState<number[]>([]);
  const [genStep, setGenStep] = useState(0);
  const [genCdUntil, setGenCdUntil] = useState(0);
  const [genOnUntil, setGenOnUntil] = useState(0);

  // jumpscare
  const [jump, setJump] = useState<{ visible: boolean; who?: string; img?: any; reason?: string; win?: boolean }>({ visible: false });
  const [damageInfo, setDamageInfo] = useState("");

  // tasks / events / extras
  const [tasks, setTasks] = useState<TaskState[]>([]);
  const [taskOpen, setTaskOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [taskWorkUntil, setTaskWorkUntil] = useState(0);
  const [blackoutUntil, setBlackoutUntil] = useState(0);
  const [falseAlarmUntil, setFalseAlarmUntil] = useState(0);
  const [surgeUntil, setSurgeUntil] = useState(0);
  const [radioMsg, setRadioMsg] = useState("");
  const [radioUntil, setRadioUntil] = useState(0);
  const [alarmCdUntil, setAlarmCdUntil] = useState(0);
  const [motionPingUntil, setMotionPingUntil] = useState(0);
  const [noise, setNoise] = useState(0);
  const [doorLLockUntil, setDoorLLockUntil] = useState(0);
  const [doorRLockUntil, setDoorRLockUntil] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [lookDir, setLookDir] = useState<-1 | 0 | 1>(0);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [maintenancePoints, setMaintenancePoints] = useState(0);
  const [upgradeVentSeal, setUpgradeVentSeal] = useState(0);
  const [upgradeCamClarity, setUpgradeCamClarity] = useState(0);
  const [upgradeDoorStrength, setUpgradeDoorStrength] = useState(0);
  const [upgradeScan, setUpgradeScan] = useState(0);
  const [nightModifiers, setNightModifiers] = useState<ModifierId[]>([]);
  const [decoyUntil, setDecoyUntil] = useState(0);
  const [decoyViewId, setDecoyViewId] = useState<ViewId | null>(null);
  const [fuseOpen, setFuseOpen] = useState(false);
  const [fuseSeq, setFuseSeq] = useState<number[]>([]);
  const [fuseStep, setFuseStep] = useState(0);
  const [fuseLockUntil, setFuseLockUntil] = useState(0);
  const [dealOpen, setDealOpen] = useState(false);
  const [dealChoice, setDealChoice] = useState<"POWER" | "HEAT" | null>(null);
  const [dealUntil, setDealUntil] = useState(0);

  const settingsReadyRef = useRef(false);
  const settingsLoadedRef = useRef(false);
  const settingsSaveTimeout = useRef<any>(null);

  // refs
  const charsRef = useRef<RunningChar[]>([]);
  const tickRef = useRef<any>(null);
  const nightStartRef = useRef<number>(0);
  const heatRef = useRef(heat);
  const powerRef = useRef(power);
  const sanityRef = useRef(sanity);
  const noiseRef = useRef(noise);
  const resetSpamRef = useRef(0);
  const doorLHoldRef = useRef(0);
  const doorRHoldRef = useRef(0);
  const sfxRef = useRef<Record<string, any>>({});
  const prevDoorLRef = useRef(doorL);
  const prevDoorRRef = useRef(doorR);
  const resultLoggedRef = useRef(false);
  const bootedRef = useRef(false);
  const creditsAwardedRef = useRef(false);
  const lastCueAtRef = useRef(0);
  const lastIntelAtRef = useRef(0);
  const lastFlashAtRef = useRef(0);
  const lastGhostAtRef = useRef(0);
  const powerStressRef = useRef(0);
  const sealLStartRef = useRef(0);
  const sealRStartRef = useRef(0);
  const camWatchRef = useRef<Record<string, number>>({});
  const avoidViewUntilRef = useRef<Record<string, number>>({});
  const dealUsedRef = useRef(false);
  const doorsUsedRef = useRef(false);
  const ghostBufferRef = useRef<Record<string, GhostPoint[]>>({});
  const scanCountRef = useRef(0);
  const tasksDoneRef = useRef(0);
  const storyFiredRef = useRef<Record<string, boolean>>({});
  const fuseLastAtRef = useRef(0);
  const bossArtifactUsedRef = useRef(false);
  const eventLogRef = useRef<{ t: number; msg: string }[]>([]);
  const audioInitRef = useRef(false);
  const sfxLoadingRef = useRef<Record<string, Promise<any> | null>>({});
  const maintenancePausedAtRef = useRef(0);

  // animations
  const menuPulse = useRef(new Animated.Value(0)).current;
  const menuIntro = useRef(new Animated.Value(0)).current;
  const camFlicker = useRef(new Animated.Value(0)).current;
  const vignette = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const lookX = useRef(new Animated.Value(0)).current;
  const selectPulse = useRef(new Animated.Value(0)).current;
  const radarPulse = useRef(new Animated.Value(0)).current;

  const now = () => Date.now();
  const uiNow = now() + uiTick;
  const dateKey = () => new Date().toISOString().slice(0, 10);
  const seedFromDate = (d: string) => {
    let h = 2166136261;
    for (let i = 0; i < d.length; i++) {
      h ^= d.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  const mulberry32 = (a: number) => {
    let t = a >>> 0;
    return () => {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  };
  const rngRef = useRef<() => number>(() => Math.random());
  const rand = () => (dailyRun ? rngRef.current() : Math.random());
  const isCd = (until: number) => uiNow < until;
  const cdLeft = (until: number) => Math.max(0, (until - uiNow) / 1000);

  const sealL = now() < sealLUntil;
  const sealR = now() < sealRUntil;
  const jam = now() < camJamUntil;
  const genOn = now() < genOnUntil;
  const camGlitch = now() < camGlitchUntil;
  const signalJammer = now() < signalJammerUntil;
  const falseCue = now() < falseCueUntil;
  const blackout = now() < blackoutUntil;
  const falseAlarm = now() < falseAlarmUntil;
  const surge = now() < surgeUntil;
  const alarmCd = isCd(alarmCdUntil);
  const motionPing = now() < motionPingUntil;
  const taskWorking = now() < taskWorkUntil;
  const doorLLocked = now() < doorLLockUntil;
  const doorRLocked = now() < doorRLockUntil;
  const scanActive = now() < scanUntil;
  const scanCd = isCd(scanCdUntil);
  const overclockCd = isCd(overclockCdUntil);
  const powerSpike = now() < powerSpikeUntil;
  const decoyActive = now() < decoyUntil && !!decoyViewId;
  const fuseLocked = now() < fuseLockUntil;
  const fuseActive = fuseOpen || fuseLocked;
  const dealActive = dealOpen && now() < dealUntil;
  const nightMax = night6 ? 6 : 5;
  const isStealth = mode === "STEALTH";
  const isRush = mode === "RUSH";
  const noCamsMode = challenge.noCams || isStealth;
  const noFlash = challenge.noFlash;
  const noOverclock = challenge.noOverclock;

  const camView = VIEWS[camIndex] ?? VIEWS[0];
  const camDead = cameraOpen && (camDeadUntil[camView.id] ?? 0) > now();
  const powerDead = power <= 0;
  const systemDisabled = powerDead || blackout || fuseActive;
  const glitchStorm = nightModifiers.includes("glitchStorm");
  const spikeBlocksCams = powerSpike && powerSpikeChoice === "DOORS";
  const spikeBlocksDoors = powerSpike && powerSpikeChoice === "CAMS";

  // Load local (guest) fallback + resume token; account data overrides from API once logged in
  useEffect(() => {
    (async () => {
      try {
        const profile = await AsyncStorage.getItem(PROFILE_KEY);
        const auth = await AsyncStorage.getItem(AUTH_KEY);
        const recentsRaw = await AsyncStorage.getItem(RECENTS_KEY);
        if (recentsRaw) setRecents(JSON.parse(recentsRaw));
        if (profile) setProfileName(profile);
        if (auth) setAuthToken(auth);

        // Load guest cache only if no auth token
        if (!auth) {
          const v = await AsyncStorage.getItem(BEST_KEY);
          if (v) setBest(parseInt(v, 10) || 0);
          const log = await AsyncStorage.getItem(SCORE_LOG_KEY);
          if (log) setScoreLog(JSON.parse(log));
          const c = await AsyncStorage.getItem(CREDITS_KEY);
          if (c) setCredits(parseInt(c, 10) || 0);
          const intelRaw = await AsyncStorage.getItem(INTEL_KEY);
          if (intelRaw) setIntel(JSON.parse(intelRaw));
          const achRaw = await AsyncStorage.getItem(ACHIEVE_KEY);
          if (achRaw) setAchievements(JSON.parse(achRaw));
          const invRaw = await AsyncStorage.getItem(INVENTORY_KEY);
          if (invRaw) setInventory(JSON.parse(invRaw));
          const dailyRaw = await AsyncStorage.getItem(DAILY_KEY);
          if (dailyRaw) setDailyScores(JSON.parse(dailyRaw));
          const adaptRaw = await AsyncStorage.getItem(ADAPT_KEY);
          if (adaptRaw) setAdaptiveDeaths(parseInt(adaptRaw, 10) || 0);
          const ghostRaw = await AsyncStorage.getItem(GHOST_KEY);
          if (ghostRaw) setGhostByView(JSON.parse(ghostRaw));
          const skillRaw = await AsyncStorage.getItem(SKILL_KEY);
          if (skillRaw) setSkills(JSON.parse(skillRaw));
          const contractRaw = await AsyncStorage.getItem(CONTRACT_KEY);
          if (contractRaw) setContracts(JSON.parse(contractRaw));
        }
      } catch {}
      setProfileLoaded(true);
    })();
  }, []);

  useEffect(() => {
    const preload = async () => {
      const assets: any[] = [];
      Object.values(IMG.characters).forEach((v) => assets.push(v));
      Object.values(IMG.rooms).forEach((v) => assets.push(v));
      IMG.jumpscare.forEach((v) => assets.push(v));
      Object.values(SFX).forEach((v) => assets.push(v));

      if (ExpoAsset?.loadAsync) {
        try {
          await ExpoAsset.loadAsync(assets);
        } catch {}
      } else {
        await new Promise((r) => setTimeout(r, 350));
      }
    };

    preload().finally(() => {
      if (profileLoaded && !bootedRef.current) {
        setScreen(profileName ? "MENU" : "LOGIN");
        bootedRef.current = true;
      }
    });
  }, [profileLoaded, profileName]);

  // pulses
  useEffect(() => {
    if (screen !== "MENU") return;
    menuIntro.setValue(0);
    Animated.timing(menuIntro, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(menuPulse, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(menuPulse, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [menuPulse, menuIntro, screen]);

  useEffect(() => {
    if (screen !== "SELECT") return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(selectPulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(selectPulse, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [selectPulse, screen]);

  useEffect(() => {
    if (!cameraOpen) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(camFlicker, { toValue: 1, duration: 90, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(camFlicker, { toValue: 0, duration: 110, easing: Easing.linear, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [camFlicker, cameraOpen]);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(radarPulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(radarPulse, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [radarPulse]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(vignette, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(vignette, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [vignette]);

  useEffect(() => {
    Animated.timing(lookX, {
      toValue: lookDir,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [lookDir, lookX]);

  useEffect(() => {
    heatRef.current = heat;
    powerRef.current = power;
    sanityRef.current = sanity;
    noiseRef.current = noise;
  }, [heat, power, sanity, noise]);

  const audioEnabled = !!ExpoAudio;
  const loadSfx = async (key: keyof typeof SFX) => {
    if (!audioEnabled) return null;
    const k = key as string;
    if (sfxRef.current[k]) return sfxRef.current[k];
    if (!sfxLoadingRef.current[k]) {
      sfxLoadingRef.current[k] = (async () => {
        const sound = new ExpoAudio.Sound();
        await sound.loadAsync(SFX[key]);
        sfxRef.current[k] = sound;
        sfxLoadingRef.current[k] = null;
        return sound;
      })().catch(() => {
        sfxLoadingRef.current[k] = null;
        return null;
      });
    }
    return sfxLoadingRef.current[k];
  };

  const playSfx = async (key: keyof typeof SFX, volume?: number) => {
    if (!audioEnabled) return;
    try {
      const snd = sfxRef.current[key as string] ?? (await loadSfx(key));
      if (snd) {
        if (typeof volume === "number") await snd.setVolumeAsync(clamp(volume, 0.05, 1));
        await snd.replayAsync();
      }
    } catch {}
  };

  useEffect(() => {
    if (!audioEnabled || audioInitRef.current) return;
    audioInitRef.current = true;
    ExpoAudio.setAudioModeAsync?.({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: ExpoAudio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      interruptionModeAndroid: ExpoAudio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(() => {});
  }, [audioEnabled]);

  useEffect(() => {
    if (screen !== "SCORES") return;
    setRemoteLoading(true);
    fetch(apiUrl("score_leaderboard"))
      .then((r) => r.json())
      .then((d) => {
        const arr = Array.isArray(d?.scores) ? d.scores : [];
        const bestByUser = new Map<string, { username: string; score: number; night: number }>();
        for (const s of arr) {
          const key = String(s.username || "unknown");
          const prev = bestByUser.get(key);
          if (!prev || Number(s.score) > Number(prev.score)) {
            bestByUser.set(key, { username: key, score: Number(s.score) || 0, night: Number(s.night) || 0 });
          }
        }
        const deduped = Array.from(bestByUser.values()).sort((a, b) => b.score - a.score);
        setRemoteScores(deduped);
      })
      .catch(() => setRemoteScores([]))
      .finally(() => setRemoteLoading(false));

    fetch(apiUrl("leaderboard_credits"))
      .then((r) => r.json())
      .then((d) => {
        const arr = Array.isArray(d?.scores) ? d.scores : [];
        setRemoteCoins(
          arr.map((x) => ({ username: String(x.username || "unknown"), credits: Number(x.credits) || 0 }))
        );
      })
      .catch(() => setRemoteCoins([]));

    fetch(apiUrl("leaderboard_challenges"))
      .then((r) => r.json())
      .then((d) => {
        const arr = Array.isArray(d?.scores) ? d.scores : [];
        setRemoteChallenges(
          arr.map((x) => ({ username: String(x.username || "unknown"), count: Number(x.count) || 0 }))
        );
      })
      .catch(() => setRemoteChallenges([]));
    fetch(apiUrl("season_current"))
      .then((r) => r.json())
      .then((d) => {
        const sid = String(d?.seasonId || "");
        if (!sid) return;
        setSeasonId(sid);
        return fetch(apiUrl(`season_leaderboard?season=${encodeURIComponent(sid)}`));
      })
      .then((r) => (r ? r.json() : null))
      .then((d) => {
        const arr = Array.isArray(d?.scores) ? d.scores : [];
        const bestByUser = new Map<string, { username: string; score: number; night: number }>();
        for (const s of arr) {
          const key = String(s.username || "unknown");
          const current = bestByUser.get(key);
          if (!current || s.score > current.score) {
            bestByUser.set(key, { username: key, score: s.score, night: s.night || 1 });
          }
        }
        const deduped = Array.from(bestByUser.values()).sort((a, b) => b.score - a.score);
        setSeasonScores(deduped);
      })
      .catch(() => setSeasonScores([]));
  }, [screen]);

  useEffect(() => {
    if (!authToken) {
      setAuthUser(null);
      return;
    }
    fetch(apiUrl("auth_me"), { headers: { Authorization: `Bearer ${authToken}` } })
      .then((r) => r.json())
      .then(async (d) => {
        setAuthUser(d?.user ?? null);
        const uname = d?.user?.username;
        if (d?.user?.username) setAccountUsername(d.user.username);
        if (d?.user?.email) setAccountEmail(d.user.email);
        if (uname) {
          try {
            const prof = await apiGet(`profile_get?username=${encodeURIComponent(uname)}`);
            setProfileAvatar(prof?.profile?.avatar_url ?? "");
            setProfileBio(prof?.profile?.bio ?? "");
            setDisplayName(prof?.profile?.display_name || prof?.profile?.username || uname);
            setDisplayFont(prof?.profile?.display_font || "System");
            setDisplayColor(prof?.profile?.display_color || "#EAF2FF");
            setProfileBanner(prof?.profile?.banner_url || "back1");
            setProfileBackground(prof?.profile?.background_url || "back1");
          } catch {}
        }
      })
      .catch(() => {});
  }, [authToken]);

  // Web deep-link: /profile/{username}
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const path = window.location.pathname || "";
    const m = path.match(/\/profile\/([^/]+)/);
    if (m && m[1]) {
      const u = decodeURIComponent(m[1]);
      openProfile(u);
      setScreen("PROFILE");
    }
  }, [authToken]);

  useEffect(() => {
    if (!authToken) {
      setUserStats(null);
      setHomeFeedItems([]);
      setTrades([]);
      setCollectibles([]);
      settingsReadyRef.current = false;
      settingsLoadedRef.current = false;
      return;
    }
    settingsReadyRef.current = false;
    settingsLoadedRef.current = false;
    (async () => {
      let settingsFetched = false;
      try {
        const s = await apiGet("settings_get");
        settingsFetched = true;
        if (s?.settings) applySettings(s.settings);
        else {
          await apiPost("settings_update", { settings: buildSettings() });
        }
        const st = await apiGet("stats_get");
        setUserStats(st?.stats ?? null);
        const sl = await apiGet("seeds_list");
        setSeeds(sl?.seeds ?? []);
        const sb = await apiGet("season_badges_list");
        const ids = Array.isArray(sb?.badges) ? sb.badges.map((b: any) => String(b.badge_id || b.id || "")) : [];
        setSeasonBadges(ids.filter((x: string) => x));
        const hf = await apiGet("home_feed_get");
        const feedItems = Array.isArray(hf?.items) ? hf.items : [];
        setHomeFeedItems(feedItems);
        setAdminFeedDraft(feedItems);
        const tl = await apiGet("trade_list");
        setTrades(Array.isArray(tl?.trades) ? tl.trades : []);
        const cl = await apiGet("collectible_list");
        setCollectibles(Array.isArray(cl?.collectibles) ? cl.collectibles : []);
      } catch {}
      setTimeout(() => {
        settingsReadyRef.current = true;
        settingsLoadedRef.current = settingsFetched;
      }, 800);
    })();
  }, [authToken]);

  useEffect(() => {
    apiGet("home_feed_get")
      .then((d) => {
        const items = Array.isArray(d?.items) ? d.items : [];
        setHomeFeedItems(items);
        setAdminFeedDraft(items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!authToken || !settingsReadyRef.current || !settingsLoadedRef.current) return;
    if (settingsSaveTimeout.current) clearTimeout(settingsSaveTimeout.current);
    settingsSaveTimeout.current = setTimeout(() => {
      apiPost("settings_update", { settings: buildSettings() }).catch(() => {});
    }, 900);
  }, [
    authToken,
    bgPick,
    difficultyPreset,
    mode,
    modePreset,
    modeTier,
    dailyRun,
    night6,
    hardcore,
    selected,
    customLevels,
    challenge,
    featuredAchievements,
    badgesSelected,
    pinnedPostId,
    spinPity,
    spinLog,
    pinnedPostId,
    spinPity,
    spinLog,
    best,
    credits,
    scoreLog,
    dailyScores,
    adaptiveDeaths,
    ghostByView,
    intel,
    achievements,
    inventory,
    gadgets,
    skills,
    contracts,
    scoreLog,
  ]);

  useEffect(() => {
    if (screen !== "SOCIAL") return;
    setSocialLoading(true);
    const feedEndpoint = authToken ? "posts_list" : "posts_public_list";
    apiGet(feedEndpoint)
      .then((d) => setPosts(d?.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setSocialLoading(false));
    apiGet("poll_list")
      .then((d) => setPolls(d?.polls ?? []))
      .catch(() => setPolls([]));
    apiGet("profiles_top")
      .then((d) => setProfileResults(d?.results ?? []))
      .catch(() => setProfileResults([]));
  }, [screen, authToken]);

  useEffect(() => {
    const query = profileSearch.trim();
    if (!query) return;
    const timer = setTimeout(() => {
      apiGet(`profiles_search?q=${encodeURIComponent(query)}`)
        .then((d) => setProfileResults(d?.results ?? []))
        .catch(() => setProfileResults([]));
    }, 420);
    return () => clearTimeout(timer);
  }, [profileSearch]);

  useEffect(() => {
    if (screen !== "SEEDS") return;
    apiGet("seeds_public_list")
      .then((d) => setPublicSeeds(d?.seeds ?? []))
      .catch(() => setPublicSeeds([]));
    if (authToken) {
      apiGet("seeds_list")
        .then((d) => setSeeds(d?.seeds ?? []))
        .catch(() => setSeeds([]));
    }
  }, [screen, authToken]);

  useEffect(() => {
    if (screen !== "MESSAGES") return;
    if (!authToken) {
      setMessageFriends([]);
      return;
    }
    apiGet("friends_list")
      .then((d) => setMessageFriends(d?.friends ?? []))
      .catch(() => setMessageFriends([]));
  }, [screen, authToken]);

  useEffect(() => {
    if (screen !== "NOTIFS") return;
    if (!authToken) return;
    apiGet("notifications_list")
      .then((d) => setNotifications(d?.notifications ?? []))
      .catch(() => setNotifications([]));
  }, [screen, authToken]);

  useEffect(() => {
    if (!cutsceneOpen) return;
    const id = setTimeout(() => {
      if (now() >= cutsceneUntil) setCutsceneOpen(false);
    }, 200);
    return () => clearTimeout(id);
  }, [cutsceneOpen, cutsceneUntil]);

  useEffect(() => {
    if (!audioEnabled) return;
    let active = true;

    const setup = async () => {
      if (screen !== "PLAY") return;
      await Promise.all([
        loadSfx("door"),
        loadSfx("seal"),
        loadSfx("open"),
        loadSfx("flash"),
        loadSfx("pressMusicButton"),
        loadSfx("jumpScare"),
      ]);
    };

    setup();

    return () => {
      active = false;
      if (screen !== "PLAY") {
        Object.values(sfxRef.current).forEach((s: any) => s?.unloadAsync?.());
        sfxRef.current = {};
        sfxLoadingRef.current = {};
      }
    };
  }, [audioEnabled, screen]);

  useEffect(() => {
    if (!audioEnabled) return;
    if (prevDoorLRef.current !== doorL && doorL) playSfx("door");
    if (prevDoorRRef.current !== doorR && doorR) playSfx("door");
    prevDoorLRef.current = doorL;
    prevDoorRRef.current = doorR;
  }, [audioEnabled, doorL, doorR]);

  const buildRoute = (entry: Entry): ViewId[] => {
    if (entry !== "ANY") return ROUTES[entry];
    // random entry for ANY
    const r = pick<Entry>(["DOOR_LEFT", "DOOR_RIGHT", "VENT_LEFT", "VENT_RIGHT"]);
    return ROUTES[r];
  };

  const buildRouteForDef = (def: CharacterDef): ViewId[] => {
    if (challenge.onlyVents || def.ability === "ventSneaker") {
      return ROUTES[rand() < 0.5 ? "VENT_LEFT" : "VENT_RIGHT"];
    }
    return buildRoute(def.entry);
  };

  const pickHome = () => pick(ROOM_VIEWS.length ? ROOM_VIEWS : (["HOL_PRINCIPAL"] as ViewId[]));
  const pickWanderTarget = (current?: ViewId) => {
    const pool = WANDER_VIEWS.filter((v) => v !== current);
    return pick(pool.length ? pool : (["HOL_PRINCIPAL"] as ViewId[]));
  };

  const calcCooldownMs = (diff: number) => {
    const base = 6000 + rand() * 7000;
    const diffAdj = clamp(12 - diff, 0, 12) * 260;
    return base + diffAdj;
  };

  const applyCooldown = (rc: RunningChar, t: number, diff: number) => {
    const home = rc.home ?? pickHome();
    const currentView = rc.route[rc.idx] ?? home;
    const route = currentView === home ? [home] : [currentView, home];
    return {
      ...rc,
      state: "COOLDOWN",
      cooldownUntil: t + calcCooldownMs(diff),
      route,
      idx: 0,
      depth: 0.18 + rand() * 0.12,
      nextMoveIn: 1.4 + rand() * 1.2,
      doorPressure: 0,
      fakeRetreatReadyUntil: 0,
      phaseRevealUntil: 0,
    };
  };

  const getPersonality = (def: CharacterDef): Personality => {
    if (["doorCamper", "tank"].includes(def.ability)) return "brave";
    if (["phantom", "shadow", "mirror"].includes(def.ability)) return "shy";
    if (["speedy", "hallSprinter", "stalker", "boss"].includes(def.ability)) return "aggressive";
    return def.difficulty >= 8 ? "aggressive" : def.difficulty <= 5 ? "shy" : "balanced";
  };

  const getPatrol = (def: CharacterDef): ViewId[] => {
    const seed = hash01(def.id) * 1000;
    const idx = Math.floor(seed) % PATROL_PATHS.length;
    const base = PATROL_PATHS[idx] ?? PATROL_PATHS[0];
    return [...base];
  };

  const applyQuickSetup = (preset?: DifficultyPreset) => {
    const tier = preset ?? difficultyPreset;
    const count = tier === "EASY" ? 4 : tier === "NORMAL" ? 6 : tier === "HARD" ? 8 : 10;
    const sorted = [...CHARACTERS_50].sort((a, b) => a.difficulty - b.difficulty);
    const pool =
      tier === "EASY"
        ? sorted.slice(0, 20)
        : tier === "NORMAL"
          ? sorted.slice(10, 35)
          : tier === "HARD"
            ? sorted.slice(-25)
            : sorted.slice(-35);
    const shuffled = [...pool].sort(() => rand() - 0.5);
    const chosen = shuffled.slice(0, Math.max(4, count));
    const next: Record<string, boolean> = {};
    chosen.forEach((c) => (next[c.id] = true));
    setSelected(next);
    setSelectedInfoId(chosen[0]?.id ?? CHARACTERS_50[0]?.id ?? null);
  };

  const getTaskDef = (id: string) => TASK_DEFS.find((t) => t.id === id);

  const getDiff = (def: CharacterDef) => {
    const tierLevel = modeTier === 1 ? 1 : modeTier === 2 ? 10 : 20;
    const custom = customLevels[def.id];
    const base =
      typeof custom === "number"
        ? clamp(custom, 0, 20)
        : presetActive
          ? tierLevel
          : def.difficulty;
    const intelBonus = (intel[def.id] ?? 0) >= 3 ? -1 : 0;
    const adaptive = -Math.min(3, Math.floor(adaptiveDeaths / 2));
    return clamp(base + intelBonus + adaptive + DIFFICULTY_OFFSET[difficultyPreset], 0, 20);
  };

  const getInitialMoveIn = (diff: number) => clamp(2.4 - diff * 0.06 + rand() * 1.4, 0.4, 3.2);

  const makeRunningChar = (def: CharacterDef): RunningChar => {
    const home = pickHome();
    const patrol = getPatrol(def);
    const personality = getPersonality(def);
    const diff = getDiff(def);
    const baseRoute = buildRouteForDef(def);
    const route = rand() < 0.45 ? [...patrol, ...baseRoute] : baseRoute;
    return {
      def,
      route,
      idx: 0,
      depth: rand() * 0.2,
      nextMoveIn: getInitialMoveIn(diff),
      jammerCharge: 0,
      phantomRevealUntil: 0,
      shadowRevealUntil: 0,
      doorPressure: 0,
      fakeRetreatReadyUntil: 0,
      phaseRevealUntil: 0,
      state: "HUNT",
      cooldownUntil: 0,
      home,
      patrol,
      personality,
    };
  };

  const startGame = () => {
    if (!canStart) return;
    // enforce gear lock from selected challenge (if any)
    if (
      challengeSelected?.gear_lock?.allowed?.length ||
      challengeSelected?.gear_lock?.free?.length ||
      challengeSelected?.settings?.allowedGear?.length ||
      challengeSelected?.settings?.freeGear?.length
    ) {
      const allowed = (challengeSelected.gear_lock?.allowed as string[]) || challengeSelected.settings?.allowedGear || [];
      const free = (challengeSelected.gear_lock?.free as string[]) || challengeSelected.settings?.freeGear || [];
      if (!gearOverrideRef.current) gearOverrideRef.current = gadgets;
      setGadgets((prev) => {
        const prevList = Array.isArray(prev) ? prev : [];
        const allowedSet = new Set(allowed);
        const freeSet = new Set(free);
        const next: (Gadget | null)[] = [];
        const pushUnique = (g: Gadget | null) => {
          if (!g) return;
          if (next.includes(g)) return;
          next.push(g);
        };
        // Free gears are always granted first (up to 2 slots)
        free.forEach((g) => pushUnique(g as Gadget));
        // If allowed list exists, fill remaining slots with previously equipped allowed gears
        if (allowedSet.size > 0) {
          prevList.forEach((g) => {
            if (!g) return;
            if (!allowedSet.has(g)) return;
            if (freeSet.has(g)) return;
            pushUnique(g);
          });
        }
        while (next.length < 2) next.push(null);
        return next.slice(0, 2) as Gadget[];
      });
    }

    const seed = dailyRun ? seedFromDate(dateKey()) : Math.floor(Math.random() * 1_000_000_000);
    rngRef.current = mulberry32(seed);
    randGlobal = rngRef.current;
    setCurrentSeed(String(seed));
    ghostBufferRef.current = {};
    scanCountRef.current = 0;
    tasksDoneRef.current = 0;
    storyFiredRef.current = {};
    bossArtifactUsedRef.current = false;
    eventLogRef.current = [];

    setNight(1);
    setScore(0);
    setNightHour(0);
    if (mode === "STEALTH") {
      setChallenge((c) => ({ ...c, noCams: true }));
    }
    setPower(100);
    setHeat(22);
    setAir(100);
    setVentHealth(100);
    setSanity(100);
    setNoise(0);
    setSignalJammerUntil(0);
    setFalseCueUntil(0);
    setLastPingAt(now());
    setPowerOutAt(0);

    setDoorL(false);
    setDoorR(false);
    setSealLUntil(0);
    setSealRUntil(0);
    setCamJamUntil(0);
    setCamGlitchUntil(0);
    setBlackoutUntil(0);
    setFalseAlarmUntil(0);
    setSurgeUntil(0);
    setPowerSpikeUntil(0);
    setPowerSpikeChoice(null);
    setDecoyUntil(0);
    setDecoyViewId(null);
    setRadioMsg("");
    setRadioUntil(0);
    setAlarmCdUntil(0);
    setMotionPingUntil(0);
    setDoorLLockUntil(0);
    setDoorRLockUntil(0);
      setTaskOpen(false);
      setActiveTaskId(null);
      setTaskWorkUntil(0);
      setLookDir(0);
      setMaintenanceOpen(false);
      setMaintenancePoints(0);
      setNightModifiers([]);
    setPowerRoute("BALANCED");
    setCamDeadUntil({});
    setOverclockCdUntil(0);
      setFuseOpen(false);
      setFuseSeq([]);
      setFuseStep(0);
      setFuseLockUntil(0);
      setDealOpen(false);
      setDealChoice(null);
      setDealUntil(0);
      powerStressRef.current = 0;
      camWatchRef.current = {};
      avoidViewUntilRef.current = {};
      sealLStartRef.current = 0;
      sealRStartRef.current = 0;
    dealUsedRef.current = false;
    doorsUsedRef.current = false;
    setDamageInfo("");

    setMusicCdUntil(0);
    setResetCdUntil(0);
    setLureCdUntil(0);
    setLightCdUntil(0);
    setScanCdUntil(0);
    setScanUntil(0);

    setFan(0.55);

    setGenOpen(false);
    setGenSeq([]);
    setGenStep(0);
    setGenCdUntil(0);
    setGenOnUntil(0);

    setCameraOpen(false);
    setCamIndex(0);
    setCutsceneOpen(mode === "STORY");
    setCutsceneUntil(now() + 3500);
    setRareRoomId(null);
    setRareRoomUntil(0);
    setRareLooted(false);

    setJump({ visible: false });
    resultLoggedRef.current = false;
    setHelpOpen(false);
    setLookDir(0);
    setUpgradeVentSeal(0);
    setUpgradeCamClarity(0);
    setUpgradeDoorStrength(0);
    setUpgradeScan(0);
    creditsAwardedRef.current = false;
    resetSpamRef.current = 0;
    doorLHoldRef.current = 0;
    doorRHoldRef.current = 0;

    const roster = selectedList;

    // spawn selected
    const runtime: RunningChar[] = roster.map((def) => makeRunningChar(def));
    charsRef.current = runtime;

    const shuffledTasks = [...TASK_DEFS].sort(() => rand() - 0.5).slice(0, 2 + (night6 ? 1 : 0));
    setTasks(shuffledTasks.map((t) => ({ id: t.id, progress: 0, done: false })));
    if (!contracts.length) {
      setContractsSafe(CONTRACT_DEFS.map((c) => ({ ...c, progress: 0, done: false })));
    } else {
      setContractsSafe(contracts.map((c) => ({ ...c, progress: 0, done: false })));
    }

    nightStartRef.current = now();
    if (rand() < 0.25) {
      const candidate = pick(ROOM_VIEWS);
      setRareRoomId(candidate);
      setRareRoomUntil(now() + 45_000);
      setRareLooted(false);
    }
    applyNightModifiers();
    setScreen("PLAY");
  };

  const goMenu = () => {
    if (screen === "PLAY" && score > 0 && !resultLoggedRef.current) {
      resultLoggedRef.current = true;
      submitScore(score, night);
      if (challengeRunRef.current) {
        const challengeId = challengeRunRef.current;
        challengeRunRef.current = null;
        apiPost("challenge_submit", { challengeId, score }).then(
          () => fetchChallenges(),
          () => {}
        );
      }
    }
    if (gearOverrideRef.current) {
      setGadgets(gearOverrideRef.current);
      gearOverrideRef.current = null;
    }
    setJump({ visible: false });
    resultLoggedRef.current = false;
    setGenOpen(false);
    setCameraOpen(false);
    setPowerOutAt(0);
    setCamGlitchUntil(0);
    setCamDeadUntil({});
    setOverclockCdUntil(0);
    setTaskOpen(false);
    setActiveTaskId(null);
    setTaskWorkUntil(0);
    setHelpOpen(false);
    setMaintenanceOpen(false);
    setFuseOpen(false);
    setFuseSeq([]);
    setFuseStep(0);
    setFuseLockUntil(0);
    setDealOpen(false);
    setDealChoice(null);
    setDealUntil(0);
    setCutsceneOpen(false);
    setRareRoomId(null);
    setRareRoomUntil(0);
    setRareLooted(false);
    setDamageInfo("");
    setScreen("MENU");
  };

  const triggerJump = (whoId: string, label?: string, reason?: string) => {
    const img = JUMPSCARE_BY_ID[whoId] ?? pick(IMG.jumpscare) ?? IMG.jumpscare[0];
    const win = (label ?? "").toUpperCase().includes("WIN");
    setJump({ visible: true, who: label ?? whoId, img, reason, win });
    if (reason) {
      setDamageInfo(reason);
      logEvent(`Death: ${reason}`);
    }
    playSfx("jumpScare");
    if (whoId !== "system") {
      setIntel((prev) => {
        const next = { ...prev, [whoId]: Math.min(3, (prev[whoId] ?? 0) + 2) };
        saveSettingsImmediate({ intel: next });
        return next;
      });
    }

    // shake
    shake.setValue(0);
    Animated.timing(shake, { toValue: 1, duration: 700, easing: Easing.out(Easing.exp), useNativeDriver: true }).start();

    try {
      Vibration.vibrate(Platform.OS === "ios" ? 200 : [0, 60, 40, 90, 40, 90]);
    } catch {}
  };

  const saveBest = async (value: number) => {
    try {
      if (value > best) {
        setBest(value);
        saveSettingsImmediate({ best: value });
        persistLocal(BEST_KEY, String(value));
      }
    } catch {}
  };

  const bumpNoise = (amt: number) => {
    setNoise((n) => clamp(n + amt, 0, 100));
  };

  const pushRadio = (msg: string, ms = 3500) => {
    setRadioMsg(msg);
    setRadioUntil(now() + ms);
  };

  const unlockAchievement = (id: string) => {
    setAchievements((prev) => {
      if (prev[id]) return prev;
      const next = { ...prev, [id]: true };
      saveSettingsImmediate({ achievements: next });
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      if (def) {
        setAchievementToast(`Achievement: ${def.name}`);
        setAchievementUntil(now() + 2500);
      }
      return next;
    });
  };

  const logEvent = (msg: string) => {
    const t = now();
    const next = [...eventLogRef.current, { t, msg }].slice(-40);
    eventLogRef.current = next;
  };

  const apiUrl = (path: string) => {
    if (API_BASE) return `${API_BASE}${path}`;
    return `/.netlify/functions/${path}`;
  };

  const apiGet = async (path: string) => {
    const res = await fetch(apiUrl(path), { headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Request failed");
    return data;
  };

  const apiPost = async (path: string, body: any) => {
    const res = await fetch(apiUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify(body ?? {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Request failed");
    return data;
  };

  const authRequest = async (path: string, body: any) => {
    const res = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Auth failed");
    return data;
  };

  const buildGuestTransfer = () => {
    const localTotal = scoreLog.reduce((s, x) => s + x.score, 0);
    const localBestNight = scoreLog.reduce((m, x) => Math.max(m, x.night), 0);
    return {
      settings: buildSettings(),
      stats: {
        best,
        sessions: scoreLog.length,
        highest_night: localBestNight,
        total_score: localTotal,
      },
      seeds,
    };
  };

  const rollCollectibleFor = (characterId: string) => {
    const r = Math.random();
    if (r < 0.001) return { characterId, rarity: "rainbow" };
    if (r < 0.031) return { characterId, rarity: "mythic" };
    if (r < 0.081) return { characterId, rarity: "gold" };
    if (r < 0.151) return { characterId, rarity: "silver" };
    if (r < 0.401) return { characterId, rarity: "normal" };
    return null;
  };

  const buildCollectibleDrops = () => {
    if (!selectedList.length) return [];
    const pickChar = selectedList[Math.floor(Math.random() * selectedList.length)]?.id;
    if (!pickChar) return [];
    const drop = rollCollectibleFor(pickChar);
    return drop ? [drop] : [];
  };

  const submitScore = async (scoreVal: number, nightVal: number) => {
    if (!authToken) return;
    try {
      const collectiblesPayload = buildCollectibleDrops();
      await fetch(apiUrl("score_submit"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ score: scoreVal, night: nightVal, collectibles: collectiblesPayload }),
      });
      const st = await apiGet("stats_get");
      setUserStats(st?.stats ?? null);
      if (collectiblesPayload.length) {
        try {
          const cl = await apiGet("collectible_list");
          setCollectibles(Array.isArray(cl?.collectibles) ? cl.collectibles : []);
        } catch {}
      }
    } catch {}
  };

  const doLogout = async () => {
    setAuthToken("");
    setAuthUser(null);
    setUserStats(null);
    setSeasonBadges([]);
    setSeeds([]);
    setPosts([]);
    setProfileName("");
    setRecents([]);
    setMessageFriends([]);
    setProfileIsFriend(false);
    setProfileLikedPosts([]);
    setProfileFavoritePosts([]);
    setCommentDraft({});
    setCommentReplyTo({});
    setScoreLog([]);
    setMessageUser(null);
    setDmMessages([]);
    try {
      await AsyncStorage.multiRemove([AUTH_KEY, PROFILE_KEY, RECENTS_KEY]);
    } catch {}
    setScreen("LOGIN");
  };

  const spendCredits = (cost: number) => {
    setCredits((c) => {
      const next = Math.max(0, c - cost);
      saveSettingsImmediate({ credits: next });
      persistLocal(CREDITS_KEY, String(next));
      return next;
    });
  };

  const buildSettings = () => ({
    bgPick,
    difficultyPreset,
    mode,
    modePreset,
    modeTier,
    dailyRun,
    night6,
    hardcore,
    selected,
    customLevels,
    challenge,
    featuredAchievements,
    badgesSelected,
    pinnedPostId,
    spinPity,
    spinLog,
    best,
    credits,
    scoreLog,
    dailyScores,
    adaptiveDeaths,
    ghostByView,
    intel,
    achievements,
    inventory,
    gadgets,
    skills,
    contracts,
  });

  const saveSettingsImmediate = (overrides?: Partial<ReturnType<typeof buildSettings>>) => {
    if (!authToken || !settingsLoadedRef.current) return;
    const base = buildSettings();
    const payload = overrides ? { ...base, ...overrides } : base;
    apiPost("settings_update", { settings: payload }).catch(() => {});
  };

  const applySettings = (s: any) => {
    if (!s || typeof s !== "object") return;
    if (s.bgPick) setBgPick(s.bgPick);
    if (s.difficultyPreset) setDifficultyPreset(s.difficultyPreset);
    if (s.mode) setMode(s.mode);
    if (s.modePreset) setModePreset(s.modePreset);
    if (typeof s.modeTier === "number") setModeTier(s.modeTier);
    if (typeof s.dailyRun === "boolean") setDailyRun(s.dailyRun);
    if (typeof s.night6 === "boolean") setNight6(s.night6);
    if (typeof s.hardcore === "boolean") setHardcore(s.hardcore);
    if (s.selected && typeof s.selected === "object") setSelected(s.selected);
    if (s.customLevels && typeof s.customLevels === "object") setCustomLevels(s.customLevels);
    if (s.challenge && typeof s.challenge === "object") setChallenge((c) => ({ ...c, ...s.challenge }));
    if (Array.isArray(s.featuredAchievements)) setFeaturedAchievements(s.featuredAchievements);
    if (Array.isArray(s.badgesSelected)) setBadgesSelected(s.badgesSelected);
    if (typeof s.pinnedPostId === "string") setPinnedPostId(s.pinnedPostId);
    if (Number.isFinite(s.spinPity)) setSpinPity(s.spinPity);
    if (Array.isArray(s.spinLog)) setSpinLog(s.spinLog);
    if (Number.isFinite(s.best)) setBest(s.best);
    if (Number.isFinite(s.credits)) setCredits(s.credits);
    if (Array.isArray(s.scoreLog)) setScoreLog(s.scoreLog);
    if (Array.isArray(s.dailyScores)) setDailyScores(s.dailyScores);
    if (Number.isFinite(s.adaptiveDeaths)) setAdaptiveDeaths(s.adaptiveDeaths);
    if (s.ghostByView && typeof s.ghostByView === "object") setGhostByView(s.ghostByView);
    if (s.intel && typeof s.intel === "object") setIntel(s.intel);
    if (s.achievements && typeof s.achievements === "object") setAchievements(s.achievements);
    if (s.inventory && typeof s.inventory === "object") setInventory(s.inventory);
    if (Array.isArray(s.gadgets)) setGadgets(s.gadgets);
    if (s.skills && typeof s.skills === "object") setSkills(s.skills);
    if (Array.isArray(s.contracts)) setContractsSafe(s.contracts);
  };

  const fetchChallenges = useCallback(async () => {
    try {
      const d = await apiGet("challenge_list");
      setChallenges(d?.challenges ?? []);
    } catch {}
  }, []);

  const createChallenge = useCallback(async () => {
    if (!authToken) {
      setChallengeStatus("Trebuie să fii logat.");
      return;
    }
    const diffVal = Number(challengeDiff) || 0;
    const rewardVal = challengeRewardGadget ? 10 : 0;
    const gearPenalty = Math.max(0, challengeGearAllowed.length - 2) * 5 + challengeGearFree.length * 2;
    const charPenalty = Math.min(120, challengeChars.length * 8);
    const flagPenalty =
      (challengeFlags.camera ? 0 : 8) +
      (challengeFlags.doorL ? 0 : 10) +
      (challengeFlags.doorR ? 0 : 10) +
      (challengeFlags.music ? 0 : 6) +
      (challengeFlags.vents ? 0 : 8);
    const computedDifficulty = Math.min(200, diffVal + rewardVal + gearPenalty + charPenalty + flagPenalty);
    const title = challengeTitle.trim();
    if (!title) {
      setChallengeStatus("Titlu lipsă");
      return;
    }
    setChallengeStatus("...");
    try {
      await apiPost("challenge_create", {
        title,
        type: challengeType,
        description: challengeDesc.trim(),
        rewardCredits: 0,
        rewardGadget: challengeRewardGadget || null,
        presetName: challengePreset.trim(),
        difficultyScore: computedDifficulty,
        settings: {
          font: challengeFont,
          animatronics: challengeChars,
          allowedGear: challengeGearAllowed,
          freeGear: challengeGearFree,
          flags: challengeFlags,
          thumb: challengeThumb,
          icon: challengeIcon,
        },
        gearLock:
          challengeGearAllowed.length || challengeGearFree.length
            ? { allowed: challengeGearAllowed, free: challengeGearFree }
            : null,
        pinned: challengePinned,
        isPrivate: challengePrivate,
        accessCode: challengePrivate ? challengeAccessCode.trim() : null,
      });
      setChallengeTitle("");
      setChallengeDesc("");
      setChallengeReward("0");
      setChallengePreset("");
      setChallengeDiff("50");
      setChallengeGear("");
      setChallengeGearAllowed([]);
      setChallengeGearFree([]);
      setChallengeChars([]);
      setChallengePinned(false);
      setChallengeRewardGadget("");
      setChallengeFont("System");
      setChallengeThumb("back1");
      setChallengeIcon("back2");
      setChallengeFlags({ camera: true, doorL: true, doorR: true, music: true, vents: true });
      setChallengePrivate(false);
      setChallengeAccessCode("");
      setChallengeStatus("Creat!");
      fetchChallenges();
    } catch (e: any) {
      setChallengeStatus(e?.message || "Eroare");
    }
  }, [authToken, challengeTitle, challengeDesc, challengeType, fetchChallenges]);

  useEffect(() => {
    if (!authToken) return;
    fetchChallenges();
  }, [authToken, fetchChallenges]);

  const kmpIndex = (text: string, pattern: string) => {
    if (!pattern) return 0;
    const t = text.toLowerCase();
    const p = pattern.toLowerCase();
    const lps = new Array(p.length).fill(0);
    let len = 0;
    for (let i = 1; i < p.length; ) {
      if (p[i] === p[len]) {
        lps[i++] = ++len;
      } else if (len) {
        len = lps[len - 1];
      } else {
        lps[i++] = 0;
      }
    }
    let i = 0;
    let j = 0;
    while (i < t.length) {
      if (t[i] === p[j]) {
        i++;
        j++;
        if (j === p.length) return i - j;
      } else if (j) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
    return -1;
  };

  const openMessageUser = async (user: any) => {
    if (!user?.id) return;
    setMessageUser(user);
    try {
      const d = await apiGet(`messages_list?withUserId=${encodeURIComponent(user.id)}`);
      setDmMessages(d?.messages ?? []);
    } catch {}
  };

  const handleAdminDeleteMessage = async (messageId: string) => {
    if (!authToken || !isAdminUser || !messageUser?.id) return;
    try {
      await apiPost("admin_delete_message", { messageId });
      const d = await apiGet(`messages_list?withUserId=${encodeURIComponent(messageUser.id)}`);
      setDmMessages(d?.messages ?? []);
    } catch {}
  };

  const handleAdminEditMessage = async (messageId: string, body: string) => {
    if (!authToken || !isAdminUser || !messageUser?.id) return;
    try {
      await apiPost("admin_edit_message", { messageId, body });
      const d = await apiGet(`messages_list?withUserId=${encodeURIComponent(messageUser.id)}`);
      setDmMessages(d?.messages ?? []);
    } catch {}
  };

  const handleAdminNotifyAll = async () => {
    if (!authToken || !isAdminUser) return;
    const title = adminNoticeTitle.trim();
    const body = adminNoticeBody.trim();
    const from = adminNoticeFrom.trim() || authUser?.username || "System";
    if (!title && !body) return;
    try {
      const minutes = parseInt(adminNoticeMinutes, 10);
      const expires_at = Number.isFinite(minutes) && minutes > 0 ? new Date(Date.now() + minutes * 60_000).toISOString() : null;
      await apiPost("admin_notify_all", { title, body, from, expires_at });
      setAdminNoticeTitle("");
      setAdminNoticeBody("");
      setAdminNoticeFrom("");
      setAdminNoticeMinutes("");
    } catch {}
  };

  const handleAdminSaveHomeFeed = async () => {
    if (!authToken || !isAdminUser) return;
    try {
      const payload = (adminFeedDraft || []).map((it: any, idx: number) => ({
        id: it?.id || `feed-${idx + 1}`,
        tag: String(it?.tag || ""),
        title: String(it?.title || ""),
        desc: String(it?.desc || ""),
        imageKey: it?.imageKey ? String(it.imageKey) : null,
      }));
      const d = await apiPost("home_feed_set", { items: payload });
      const items = Array.isArray(d?.items) ? d.items : payload;
      setHomeFeedItems(items);
      setAdminFeedDraft(items);
      setAdminStatus("Home feed updated.");
    } catch (e) {
      setAdminStatus("Home feed update failed.");
    }
  };

  const openProfile = async (username: string) => {
    try {
      if (username) {
        addRecent({ id: `profile:${username}`, type: "profile", label: username, ts: Date.now() });
      }
      const d = await apiGet(`profile_full?username=${encodeURIComponent(username)}`);
      setProfileView(d?.profile ?? null);
      if (d?.profile && authUser?.username && authUser.username === username) {
        setProfileAvatar(d.profile.avatar_url || "");
        setProfileBio(d.profile.bio || "");
        setDisplayName(d.profile.display_name || d.profile.username || "");
        setDisplayFont(d.profile.display_font || "System");
        setDisplayColor(d.profile.display_color || "#EAF2FF");
        setProfileBanner(d.profile.banner_url || "back1");
        setProfileBackground(d.profile.background_url || "back1");
      }
      setProfileStats(d?.stats ?? null);
      setProfileFollowers(d?.followers ?? 0);
      setProfileFollowing(d?.following ?? 0);
      setProfileIsFollowing(!!d?.is_following);
      setProfileIsFriend(!!d?.is_friend);
      const feat = parseJson(d?.featured_achievements);
      setProfileFeatured(Array.isArray(feat) ? feat : []);
      setProfilePolls(d?.polls ?? []);
      try {
        const p = await apiGet(`posts_user_list?username=${encodeURIComponent(username)}`);
        setProfilePosts(p?.posts ?? []);
      } catch {
        setProfilePosts([]);
      }
      if (authUser?.username && d?.profile?.username && authUser.username === d.profile.username) {
        try {
          const liked = await apiGet("posts_liked_list");
          setProfileLikedPosts(liked?.posts ?? []);
        } catch {
          setProfileLikedPosts([]);
        }
        try {
          const favs = await apiGet("posts_favorites_list");
          setProfileFavoritePosts(favs?.posts ?? []);
        } catch {
          setProfileFavoritePosts([]);
        }
      } else {
      setProfileLikedPosts([]);
      setProfileFavoritePosts([]);
      setProfilePolls([]);
      }
      setDmMessages([]);
      setDmDraft("");
      setScreen("PROFILE");
    } catch {}
  };

  const parseJson = (v: any) => {
    if (!v) return v;
    if (typeof v === "string") {
      try {
        return JSON.parse(v);
      } catch {
        return v;
      }
    }
    return v;
  };

  const rarityColor = (r: "common" | "rare" | "epic" | "legendary" | "mythic") => {
    if (r === "mythic") return "#E879F9";
    if (r === "legendary") return "#F59E0B";
    if (r === "epic") return "#C084FC";
    if (r === "rare") return "#60A5FA";
    return "#34D399";
  };

  const applyNightModifiers = () => {
    const pool = [...NIGHT_MODIFIERS];
    const picked: ModifierId[] = [];
    if (rand() < 0.7) picked.push(pick(pool).id);
    if (rand() < 0.35) picked.push(pick(pool.filter((m) => !picked.includes(m.id))).id);
    setNightModifiers(picked);
    if (picked.includes("lowPowerStart")) {
      setPower((p) => Math.min(p, 70));
    }
  };

  const openMaintenance = () => {
    setMaintenancePoints(1);
    setMaintenanceOpen(true);
    maintenancePausedAtRef.current = now();
  };

  const closeMaintenance = () => {
    if (maintenancePausedAtRef.current) {
      const delta = now() - maintenancePausedAtRef.current;
      nightStartRef.current += delta;
      maintenancePausedAtRef.current = 0;
    }
    setMaintenanceOpen(false);
  };

  const addInventory = (g: Gadget, count = 1) => {
    if (!g) return;
    setInventory((prev) => {
      const next = { ...prev, [g]: (prev[g] ?? 0) + count };
      saveSettingsImmediate({ inventory: next });
      return next;
    });
  };

  function setContractsSafe(next: Contract[]) {
    setContracts(next);
    saveSettingsImmediate({ contracts: next });
  }

  function bumpContract(id: string, inc = 1) {
    setContracts((prev) => {
      const next = prev.map((c) => {
        if (c.id !== id || c.done) return c;
        const progress = Math.min(c.target, c.progress + inc);
        const done = progress >= c.target;
        if (done) spendCredits(-c.reward);
        return { ...c, progress, done };
      });
      saveSettingsImmediate({ contracts: next });
      return next;
    });
  }

  const consumeInventory = (g: Gadget) => {
    if (!g) return false;
    let ok = false;
    setInventory((prev) => {
      const have = prev[g] ?? 0;
      if (have <= 0) return prev;
      ok = true;
      const next = { ...prev, [g]: have - 1 };
      saveSettingsImmediate({ inventory: next });
      return next;
    });
    return ok;
  };

  const upgradeSkill = (id: SkillId) => {
    const def = SKILL_DEFS.find((s) => s.id === id);
    if (!def) return;
    const level = skills[id] ?? 0;
    if (level >= 3) return;
    const cost = def.cost * (level + 1);
    if (credits < cost) return;
    spendCredits(cost);
    setSkills((prev) => {
      const next = { ...prev, [id]: level + 1 };
      saveSettingsImmediate({ skills: next });
      return next;
    });
  };

  const equipGadget = (g: Gadget, slot: number | null = null) => {
    setGadgets((prev) => {
      const next = [...prev];
      const target = slot !== null ? slot : next.findIndex((x) => !x);
      const idx = target !== -1 && target !== undefined ? target : 0;
      next[idx] = g;
      saveSettingsImmediate({ gadgets: next });
      return next;
    });
  };

  // ===== actions =====
  const doReset = () => {
    if (isCd(resetCdUntil)) return;
    setResetCdUntil(now() + 8500);
    resetSpamRef.current = Math.min(4, resetSpamRef.current + 1);
    bumpNoise(6);
    // clears jam
    setCamJamUntil(0);

    // push back near attackers
    charsRef.current = charsRef.current.map((rc) => {
      if (rc.idx >= rc.route.length - 2) {
        const diff = getDiff(rc.def);
        return applyCooldown(rc, now(), diff);
      }
      return rc;
    });
  };

  const doMusic = () => {
    if (isCd(musicCdUntil)) return;
    setMusicCdUntil(now() + 9500);
    playSfx("pressMusicButton");
    bumpNoise(4);
    charsRef.current = charsRef.current.map((rc) => {
      if (rc.def.ability !== "musicSensitive") return rc;
      if (rc.idx >= rc.route.length - 2) {
        const diff = getDiff(rc.def);
        return applyCooldown(rc, now(), diff);
      }
      return rc;
    });
  };

  const doLure = (targetView: ViewId) => {
    if (isCd(lureCdUntil)) return;
    setLureCdUntil(now() + 10_500);
    bumpNoise(5);

    // pull some toward that path
    charsRef.current = charsRef.current.map((rc) => {
      const abil = rc.def.ability;
      if (rc.state === "COOLDOWN") return rc;
      if (!["lurable", "standard", "musicSensitive"].includes(abil)) return rc;
      if (rand() < 0.55) {
        // re-route toward target side if possible
        const entry = inferEntryFromView(targetView) ?? rc.def.entry;
        const route = rc.def.ability === "ventSneaker" ? buildRouteForDef(rc.def) : buildRoute(entry);
        return { ...rc, route, idx: Math.min(rc.idx, route.length - 1), nextMoveIn: 0.9 };
      }
      return rc;
    });
  };

  const inferEntryFromView = (v: ViewId): Entry | null => {
    if (v.includes("DREAPTA")) return "DOOR_RIGHT";
    if (v.includes("STANGA")) return "DOOR_LEFT";
    if (v.includes("VENT_LEFT")) return "VENT_LEFT";
    if (v.includes("VENT_RIGHT")) return "VENT_RIGHT";
    return null;
  };

  const doFlash = () => {
    if (isCd(lightCdUntil)) return;
    const stressPenalty = sanity < 20 ? 4500 : sanity < 35 ? 2200 : 0;
    setLightCdUntil(now() + 7500 + stressPenalty);
    playSfx("flash");
    lastFlashAtRef.current = now();
    bumpNoise(3);
    const until = now() + 4500;
    charsRef.current = charsRef.current.map((rc) => {
      if (rc.def.ability === "phantom") return { ...rc, phantomRevealUntil: until };
      if (rc.def.ability === "shadow") return { ...rc, shadowRevealUntil: until };
      if (rc.personality === "shy" && rand() < 0.55) {
        const diff = getDiff(rc.def);
        return applyCooldown(rc, now(), diff);
      }
      return rc;
    });
  };

  const doSealL = () => {
    if (sealL) return;
    sealLStartRef.current = now();
    const duration = 6500 + upgradeVentSeal * 1200;
    setSealLUntil(now() + duration);
    bumpNoise(2);
    playSfx("seal");
  };
  const doSealR = () => {
    if (sealR) return;
    sealRStartRef.current = now();
    const duration = 6500 + upgradeVentSeal * 1200;
    setSealRUntil(now() + duration);
    bumpNoise(2);
    playSfx("seal");
  };

  const doOverclock = () => {
    if (overclockCd || systemDisabled || noOverclock) return;
    setOverclockCdUntil(now() + 12_000);
    setScanUntil(now() + 2000 + skills.scanRange * 200);
    setScanCdUntil(now() + 11_000);
    setPower((p) => clamp(p - 12, 0, 100));
    setHeat((h) => clamp(h + 0.5, 16, 34));
    scanCountRef.current += 1;
    bumpContract("scan3", 1);
    bumpNoise(4);
    playSfx("flash", 0.35);
  };

  const useArtifact = () => {
    if (bossArtifactUsedRef.current) return;
    const boss = charsRef.current.find((c) => c.def.ability === "boss");
    if (!boss) return;
    const cooled = applyCooldown(boss, now(), getDiff(boss.def));
    charsRef.current = charsRef.current.map((c) => (c.def.id === boss.def.id ? cooled : c));
    bossArtifactUsedRef.current = true;
    pushRadio("ARTIFACT: boss oprit temporar.", 2200);
    logEvent("Artifact used on boss");
  };

  const pressFuse = (i: number) => {
    if (fuseLocked) return;
    const correct = fuseSeq[fuseStep];
    if (i === correct) {
      const next = fuseStep + 1;
      setFuseStep(next);
      if (next >= 4) {
        setFuseOpen(false);
        setFuseSeq([]);
        setFuseStep(0);
        setPower((p) => clamp(p + 8, 0, 100));
        pushRadio("FUSE RESET: power stabilizat.", 2000);
      }
    } else {
      setFuseStep(0);
      pushRadio("FUSE ERROR: secvență greșită.", 1500);
    }
  };

  const resolveDeal = (choice: "POWER" | "HEAT") => {
    if (!dealActive) return;
    setDealOpen(false);
    setDealChoice(choice);
    if (rand() < 0.3) {
      triggerJump(DEALER_ID, "DEAL GONE WRONG", "Deal failure");
      return;
    }
    if (choice === "POWER") {
      setPower((p) => clamp(p + 5, 0, 100));
      pushRadio("DEAL: +5% power", 2000);
      logEvent("Deal reward: power");
    } else {
      setHeat((h) => clamp(h - 5, 16, 34));
      pushRadio("DEAL: -5 heat", 2000);
      logEvent("Deal reward: heat");
    }
  };

  const doAlarm = () => {
    if (alarmCd || powerDead) return;
    setAlarmCdUntil(now() + 18_000);
    bumpNoise(12);
    setPower((p) => clamp(p - 4, 0, 100));
    pushRadio("ALARM: sperie animatronicii, dar consumă power.", 3000);
    charsRef.current = charsRef.current.map((rc) => {
      const diff = getDiff(rc.def);
      if (rand() < 0.75) return applyCooldown(rc, now(), diff);
      return rc;
    });
  };

  const doPing = () => {
    if (motionPing || powerDead) return;
    setMotionPingUntil(now() + 4500);
    setLastPingAt(now());
    bumpNoise(4);
    setPower((p) => clamp(p - 2, 0, 100));
  };

  const doScan = () => {
    if (scanCd || systemDisabled) return;
    const dur = 1000 + upgradeScan * 300 + skills.scanRange * 300;
    setScanUntil(now() + dur);
    setScanCdUntil(now() + 9000);
    setSanity((s) => clamp(s - (8 - upgradeScan * 1), 0, 100));
    scanCountRef.current += 1;
    bumpContract("scan3", 1);
    playSfx("flash", 0.4);
  };

  const toggleCamera = () => {
    if (systemDisabled) return;
    if (noCamsMode) return;
    if (spikeBlocksCams) return;
    setCameraOpen((v) => {
      const next = !v;
      if (next) maybeDeadZone(camView.id);
      return next;
    });
    playSfx("open", 0.25);
    bumpNoise(2);
  };

  const handleLookMove = (evt: any) => {
    if (Platform.OS !== "web") return;
    if (cameraOpen) return;
    const x = evt?.nativeEvent?.locationX ?? evt?.nativeEvent?.pageX ?? 0;
    if (x < SW * 0.33) setLookDir(-1);
    else if (x > SW * 0.66) setLookDir(1);
    else setLookDir(0);
  };

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handler = (e: any) => {
      const tag = (e?.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      const key = String(e.key || "").toLowerCase();

      if (key === "h") {
        setHelpOpen((v) => !v);
        return;
      }

      if (screen !== "PLAY") return;

      if (key === "escape") {
        if (!hardcore) goMenu();
        return;
      }

      if (key === "q") {
        if (!systemDisabled && !doorLLocked && !challenge.noDoors && !spikeBlocksDoors) {
          setDoorL((v) => {
            const next = !v;
            if (next) doorsUsedRef.current = true;
            return next;
          });
          bumpNoise(2);
        }
        return;
      }
      if (key === "e") {
        if (!systemDisabled && !doorRLocked && !challenge.noDoors && !spikeBlocksDoors) {
          setDoorR((v) => {
            const next = !v;
            if (next) doorsUsedRef.current = true;
            return next;
          });
          bumpNoise(2);
        }
        return;
      }
      if (key === "z") {
        if (!systemDisabled && !sealL) doSealL();
        return;
      }
      if (key === "x") {
        if (!systemDisabled && !sealR) doSealR();
        return;
      }
      if (key === "c") {
        if (!systemDisabled && !noCamsMode && !spikeBlocksCams) toggleCamera();
        return;
      }
      if (key === "r") {
        if (!systemDisabled) doReset();
        return;
      }
      if (key === "m") {
        if (!systemDisabled) doMusic();
        return;
      }
      if (key === "l") {
        if (!systemDisabled && !noCamsMode && !spikeBlocksCams) doLure(cameraOpen ? camView.id : "OFFICE");
        return;
      }
      if (key === "f") {
        if (!systemDisabled && !spikeBlocksCams && !noCamsMode) doFlash();
        return;
      }
      if (key === "v") {
        if (!systemDisabled) doOverclock();
        return;
      }
      if (key === "g") {
        if (!systemDisabled && !spikeBlocksCams && !noCamsMode) openGenerator();
        return;
      }
      if (key === "t") {
        if (!systemDisabled) setTaskOpen((v) => !v);
        return;
      }
      if (key === "o") {
        if (!systemDisabled) doAlarm();
        return;
      }
      if (key === "p") {
        if (!systemDisabled) doPing();
        return;
      }
      if (key === "-" || key === "_") {
        if (!systemDisabled) setFan((f) => clamp(f - 0.08, 0, 1));
        return;
      }
      if (key === "=" || key === "+") {
        if (!systemDisabled) setFan((f) => clamp(f + 0.08, 0, 1));
        return;
      }
      if (key === "arrowleft") {
        if (cameraOpen) jumpToCam(camIndex - 1);
        return;
      }
      if (key === "arrowright") {
        if (cameraOpen) jumpToCam(camIndex + 1);
        return;
      }
    };

    // @ts-ignore web only
    document?.addEventListener?.("keydown", handler);
    return () => {
      // @ts-ignore web only
      document?.removeEventListener?.("keydown", handler);
    };
  }, [
    screen,
    cameraOpen,
    camIndex,
    camView.id,
    systemDisabled,
    challenge.noDoors,
    noCamsMode,
    sealL,
    sealR,
    doorLLocked,
    doorRLocked,
    hardcore,
    alarmCd,
    motionPing,
    toggleCamera,
    jumpToCam,
    maintenanceOpen,
    powerRoute,
    spikeBlocksCams,
    spikeBlocksDoors,
    scanActive,
    scanCd,
  ]);

  const gadgetLabel = (g: Gadget) => {
    if (g === "sealTape") return "SEAL TAPE";
    if (g === "flashCharge") return "FLASH+";
    if (g === "batterySwap") return "BATTERY";
    if (g === "signalJammer") return "JAMMER";
    return "EMPTY";
  };

  function maybeDeadZone(viewId: ViewId) {
    const roll = 0.1 + rand() * 0.1;
    const chance = Math.max(0.02, roll - skills.camClarity * 0.03);
    if (rand() < chance) {
      setCamDeadUntil((prev) => ({ ...prev, [viewId]: now() + 3000 }));
      pushRadio(`DEAD ZONE: ${viewId.replace(/_/g, " ")}`, 2000);
    }
  }

  function jumpToCam(index: number) {
    const next = clamp(index, 0, VIEWS.length - 1);
    setCamIndex(next);
    const view = VIEWS[next];
    if (view) maybeDeadZone(view.id);
  }

  const useGadget = (idx: number) => {
    const g = gadgets[idx];
    if (!g) return;
    bumpNoise(3);
    if (g === "sealTape") {
      sealLStartRef.current = now();
      sealRStartRef.current = now();
      setSealLUntil(now() + 30_000);
      setSealRUntil(now() + 30_000);
    } else if (g === "flashCharge") {
      setLightCdUntil(0);
      doFlash();
    } else if (g === "batterySwap") {
      setPower((p) => clamp(p + 20, 0, 100));
    } else if (g === "signalJammer") {
      setSignalJammerUntil(now() + 8000);
      setCamJamUntil(now() + 4000);
    }
    setGadgets((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
  };

  const openGenerator = () => {
    if (isCd(genCdUntil) || genOn) return;
    const seq = [0, 1, 2, 3].sort(() => rand() - 0.5);
    setGenSeq(seq);
    setGenStep(0);
    setGenOpen(true);
  };

  const pressGen = (i: number) => {
    const correct = genSeq[genStep];
    if (i === correct) {
      const next = genStep + 1;
      setGenStep(next);
      if (next >= 4) {
        setGenOpen(false);
        setGenCdUntil(now() + 18_000);
        setGenOnUntil(now() + 20_000);
      }
    } else {
      setGenStep(0);
    }
  };

  // ===== GAME LOOP =====
  useEffect(() => {
    const id = setInterval(() => {
      setUiTick((v) => (v + 1) % 1000000);
    }, 200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (screen !== "PLAY") {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }

    tickRef.current = setInterval(() => {
      if (jump.visible) return;
      if (maintenanceOpen) return;
      if (cutsceneOpen) return;

      const t = now();
      let nf = NIGHT_FACTOR[night - 1] ?? 1.2;
      if (isRush) nf *= 1.25;
      if (mode === "ENDLESS") {
        const hours = Math.floor((t - nightStartRef.current) / 15_000);
        nf = 1.1 + hours * 0.18;
      }

      // night progression
      const elapsed = t - nightStartRef.current;
      const baseLen = NIGHT_LEN_MS[night - 1] ?? 210_000;
      const len = isRush ? Math.max(90_000, baseLen * 0.65) : baseLen;
      const hourLen = mode === "ENDLESS" ? 45_000 : len / HOURS_PER_NIGHT;
      const hour = Math.min(HOURS_PER_NIGHT, Math.floor(elapsed / hourLen));
      const safeGateNow = mode !== "ENDLESS" && hour < SAFE_HOURS;
      if (hour !== nightHour) setNightHour(hour);
      if (hour >= 1) unlockAchievement("firstNight");
      if (mode === "STORY") {
        const events = STORY_EVENTS[night] ?? [];
        events.forEach((ev, idx) => {
          const key = `${night}-${idx}`;
          if (!storyFiredRef.current[key] && elapsed >= ev.t * 1000) {
            storyFiredRef.current[key] = true;
            pushRadio(ev.line, 2800);
          }
        });
      }
      if (powerSpike && !powerSpikeChoice && t - (powerSpikeUntil - 10_000) > 2000) {
        setPowerSpikeChoice(rand() < 0.5 ? "CAMS" : "DOORS");
      }
      if (elapsed >= len && mode !== "ENDLESS") {
        // survived night
        if (night >= nightMax) {
          // win - show "soft win overlay" using jumpscare layer
          const styleBonus = doorsUsedRef.current ? 0 : 180;
          if (!doorsUsedRef.current) pushRadio("STYLE BONUS: fara usi!", 2400);
          if (!doorsUsedRef.current) bumpContract("noDoors", 1);
          const winScore = score + 600 + styleBonus;
          setScore(winScore);
          saveBest(winScore);
          if (nightMax === 6) unlockAchievement("night6");
          if (hardcore) unlockAchievement("hardcore");
          triggerJump("system", "AI SUPRAVIEȚUIT (WIN)", "Win");
          return;
        } else {
            setNight((n) => n + 1);
            nightStartRef.current = t;
            setNightHour(0);
            setScore((s) => s + 280 + (doorsUsedRef.current ? 0 : 120));
            if (!doorsUsedRef.current) pushRadio("STYLE BONUS: fara usi!", 2400);
            if (!doorsUsedRef.current) bumpContract("noDoors", 1);
            openMaintenance();
            applyNightModifiers();
            dealUsedRef.current = false;
            doorsUsedRef.current = false;
            camWatchRef.current = {};
            avoidViewUntilRef.current = {};
            bossArtifactUsedRef.current = false;
            setRareRoomId(null);
            setRareRoomUntil(0);
            setRareLooted(false);
            if (rand() < 0.25) {
              const candidate = pick(ROOM_VIEWS);
              setRareRoomId(candidate);
              setRareRoomUntil(now() + 45_000);
            }
            // reset positions
            charsRef.current = charsRef.current.map((rc) => ({
            ...rc,
            route: buildRouteForDef(rc.def),
            idx: 0,
            depth: rand() * 0.2,
            nextMoveIn: getInitialMoveIn(getDiff(rc.def)),
            doorPressure: 0,
            fakeRetreatReadyUntil: 0,
            phaseRevealUntil: 0,
            state: "HUNT",
            cooldownUntil: 0,
          }));
        }
      }

      // power drain
      let drain = 0.022 * nf;
      const camMult = powerRoute === "CAMS" ? 0.75 : powerRoute === "DOORS" ? 1.25 : 1.0;
      const doorMult = powerRoute === "DOORS" ? 0.75 : powerRoute === "CAMS" ? 1.25 : 1.0;
      if (cameraOpen) drain += 0.03 * camMult;
      if (doorL) drain += 0.035 * doorMult;
      if (doorR) drain += 0.035 * doorMult;
      if (sealL) drain += 0.025;
      if (sealR) drain += 0.025;
      if (jam) drain += 0.015;

      drain += 0.05 * fan;

      if (doorL) doorLHoldRef.current += 0.1;
      else doorLHoldRef.current = 0;
      if (doorR) doorRHoldRef.current += 0.1;
      else doorRHoldRef.current = 0;

      if (doorLHoldRef.current > 12 && !doorLLocked) {
        setDoorL(false);
        setDoorLLockUntil(t + 6000);
        doorLHoldRef.current = 0;
        pushRadio("Lockout ușă stânga (overheat).", 2500);
      }
      if (doorRHoldRef.current > 12 && !doorRLocked) {
        setDoorR(false);
        setDoorRLockUntil(t + 6000);
        doorRHoldRef.current = 0;
        pushRadio("Lockout ușă dreapta (overheat).", 2500);
      }

      if (doorLHoldRef.current > 8) drain += 0.05;
      if (doorRHoldRef.current > 8) drain += 0.05;
      if (surge) drain *= 0.85;
      if (challenge.doubleDrain) drain *= 2;

      const heavyUse = drain > 0.2;
      const stressAdd = heavyUse ? (drain - 0.18) * 40 : -1.0;
      powerStressRef.current = clamp(powerStressRef.current + stressAdd, 0, 120);
      if (!fuseActive && powerStressRef.current > 115 && !powerDead && t - fuseLastAtRef.current > 120_000) {
        powerStressRef.current = 0;
        setFuseLockUntil(t + 1200);
        setFuseOpen(true);
        setFuseSeq([0, 1, 2, 3].sort(() => rand() - 0.5));
        setFuseStep(0);
        fuseLastAtRef.current = t;
        if (cameraOpen) setCameraOpen(false);
        if (doorL) setDoorL(false);
        if (doorR) setDoorR(false);
        pushRadio("FUSE BREAKER: overload, reset required.", 2800);
        logEvent("Fuse breaker");
      }

      // generator on
      if (genOn) {
        // recharge but side effects
        setHeat((h) => clamp(h + 0.05, 16, 34));
        setAir((a) => clamp(a - 0.04, 10, 100));
        drain += 0.06;
      }

      let nextPower = clamp(powerRef.current - drain + (genOn ? 0.25 : 0), 0, 100);
      if (challenge.oneBattery) nextPower = Math.min(nextPower, 50);
      powerRef.current = nextPower;
      setPower(nextPower);

      if (nextPower <= 0) {
        if (!powerOutAt) setPowerOutAt(t);
        if (doorL) setDoorL(false);
        if (doorR) setDoorR(false);
        if (cameraOpen) setCameraOpen(false);
        if (sealL) setSealLUntil(0);
        if (sealR) setSealRUntil(0);
      } else if (powerOutAt) {
        setPowerOutAt(0);
      }
      if (powerSpike && powerSpikeChoice === "CAMS") {
        if (doorL) setDoorL(false);
        if (doorR) setDoorR(false);
      }
      if (powerSpike && powerSpikeChoice === "DOORS" && cameraOpen) setCameraOpen(false);
      if (blackout && cameraOpen) setCameraOpen(false);
      if (challenge.noDoors) {
        if (doorL) setDoorL(false);
        if (doorR) setDoorR(false);
      }
      if ((challenge.noCams || isStealth) && cameraOpen) setCameraOpen(false);

      // heat / air
      setHeat((h) => {
        const camHeat = cameraOpen ? 0.03 : 0.01;
        const doorsHeat = doorL && doorR ? 0.03 : 0.0;
        const jamHeat = jam ? 0.02 : 0.0;
        const fanCooling = -0.10 * (fan - 0.45);
        return clamp(h + camHeat + doorsHeat + jamHeat + fanCooling, 16, 34);
      });

      const sealLLong = sealL && t - sealLStartRef.current > 6000;
      const sealRLong = sealR && t - sealRStartRef.current > 6000;
      setAir((a) => {
        let delta = 0.18 * (fan - 0.35);
        if (sealL) delta -= 0.05 + upgradeVentSeal * 0.01;
        if (sealR) delta -= 0.05 + upgradeVentSeal * 0.01;
        if (sealLLong) delta -= 0.04;
        if (sealRLong) delta -= 0.04;
        if (doorL && doorR) delta -= 0.02;
        return clamp(a + delta, 10, 100);
      });

      const ventThreat = charsRef.current.filter((rc) => (rc.route[rc.idx] ?? "").includes("VENT")).length;
      const hallThreat = charsRef.current.filter((rc) => (rc.route[rc.idx] ?? "").includes("HOL")).length;
      setVentHealth((v) => {
        let dv = -0.06 - ventThreat * 0.04;
        if (sealL || sealR) dv -= 0.02;
        if (signalJammer) dv -= 0.01;
        const next = clamp(v + dv, 0, 100);
        if (next <= 0) {
          setCamGlitchUntil(t + 1200);
          if (!falseCue) setFalseCueUntil(t + 6000);
        }
        return next;
      });

      setSanity((s) => {
        let ds = -0.04;
        if (jam) ds -= 0.08;
        if (powerDead) ds -= 0.12;
        if (ventHealth <= 0) ds -= 0.14;
        if (falseCue) ds -= 0.06;
        return clamp(s + ds, 0, 100);
      });

      if (falseCue && rand() < 0.01) {
        playSfx(rand() < 0.5 ? "door" : "open");
      }

      // noise decay
      setNoise((n) => clamp(n - 0.08, 0, 100));

      // noise trail -> ghost decoy
      if (!decoyActive && noise > 80 && rand() < 0.06) {
        const camViews = VIEWS.filter((v) => v.type !== "office");
        const target = pick(camViews);
        setDecoyViewId(target.id);
        setDecoyUntil(t + 4500);
      }

      // tasks progress
      if (taskWorking && activeTaskId) {
        const def = getTaskDef(activeTaskId);
        if (def) {
          setPower((p) => clamp(p - def.drain, 0, 100));
          let completed = false;
          setTasks((prev) =>
            prev.map((t) => {
              if (t.id !== activeTaskId || t.done) return t;
              const step = 1 / (def.steps * 12);
              const nextProg = clamp(t.progress + step, 0, 1);
              if (nextProg >= 1) completed = true;
              return { ...t, progress: nextProg, done: nextProg >= 1 };
            })
          );
          if (completed) {
            setActiveTaskId(null);
            setTaskWorkUntil(0);
            setScore((s) => s + def.reward);
            pushRadio(`Task complet: ${def.name} (+${def.reward})`, 3200);
            unlockAchievement("firstTask");
            tasksDoneRef.current += 1;
            bumpContract("tasks2", 1);
          }
        }
      }

      // random events
      const clarityMult = Math.max(0.5, 1 - skills.camClarity * 0.12);
      const glitchMult = (glitchStorm ? 1.7 : 1) * clarityMult;

      if (!blackout && rand() < 0.0007 * nf) {
        setBlackoutUntil(t + 4500);
        if (cameraOpen) setCameraOpen(false);
        pushRadio("BLACKOUT: sistem indisponibil.", 3000);
        unlockAchievement("blackout");
        logEvent("Blackout");
      }
      if (!falseAlarm && rand() < 0.0012 * nf * glitchMult) {
        setFalseAlarmUntil(t + 3500);
        const mult = Math.max(0.4, 1 - upgradeCamClarity * 0.15 - skills.camClarity * 0.08);
        setCamGlitchUntil(t + Math.max(400, 1500 * mult));
        playSfx("open", 0.2);
        pushRadio("FALSE ALARM: semnal perturbat.", 2800);
        logEvent("False alarm");
      }
      if (!surge && rand() < 0.0009 * nf) {
        setSurgeUntil(t + 3200);
        setPower((p) => clamp(p + 6, 0, 100));
        setHeat((h) => clamp(h + 0.6, 16, 34));
        pushRadio("POWER SURGE: boost temporar.", 2800);
        unlockAchievement("surge");
        logEvent("Power surge");
      }

      if (!powerSpike && rand() < 0.0007 * nf) {
        setPowerSpikeUntil(t + 10_000);
        setPowerSpikeChoice(null);
        pushRadio("POWER SPIKE: alege Cams sau Doors!", 3000);
        logEvent("Power spike");
      }
      if ((!radioMsg || t > radioUntil) && rand() < 0.0022) {
        pushRadio(pick(RADIO_LINES), 2800);
      }

      // camera audio cues
      if (cameraOpen && !jam && !blackout && !camDead) {
        if (t - lastCueAtRef.current > 2200 && rand() < 0.22) {
          if (ventThreat > 0) playSfx("open", 0.18);
          else if (hallThreat > 0) playSfx("door", 0.18);
          lastCueAtRef.current = t;
        }
      }

      if (cameraOpen && !jam && !blackout && !camDead) {
        const key = camView.id;
        camWatchRef.current[key] = (camWatchRef.current[key] ?? 0) + 100;
        if (camWatchRef.current[key] > 4800) {
          avoidViewUntilRef.current[key] = t + 7000;
          camWatchRef.current[key] = 0;
          pushRadio("STALKER: evita camera monitorizata.", 2000);
          logEvent("Stalker avoided watched cam");
        }
      }

      if (cameraOpen && !jam && !blackout && !camDead && t - lastIntelAtRef.current > 1200) {
        const seen = charsRef.current.filter((rc) => rc.route[rc.idx] === camView.id).map((rc) => rc.def.id);
        if (seen.length) {
          setIntel((prev) => {
        const next = { ...prev };
        seen.forEach((id) => {
          next[id] = Math.min(3, (next[id] ?? 0) + 1);
        });
        saveSettingsImmediate({ intel: next });
        return next;
      });
          lastIntelAtRef.current = t;
        }
      }

      // score tick
      const scoreMult = challengeMultiplier(challenge);
      setScore((s) => s + Math.round((1 + nf) * scoreMult));

      resetSpamRef.current = Math.max(0, resetSpamRef.current - 0.02);

      if (powerOutAt && t - powerOutAt > 6000) {
        triggerJump("system", "POWER OUT", "Power depleted");
        return;
      }

      if (mode === "STORY" && night >= 4 && bossDef && !charsRef.current.some((c) => c.def.id === bossDef.id)) {
        charsRef.current = [...charsRef.current, makeRunningChar(bossDef)];
        pushRadio("BOSS NIGHT: Vlad Tepes a intrat in joc.", 2600);
        logEvent("Boss spawned");
      }

      if (dealOpen && t > dealUntil) {
        setDealOpen(false);
      }
      if (!dealOpen && !dealUsedRef.current) {
        const dealerHere = charsRef.current.some((rc) => rc.def.id === DEALER_ID && rc.route[rc.idx] === "OFFICE");
        if (dealerHere && !safeGateNow) {
          dealUsedRef.current = true;
          setDealChoice(null);
          setDealOpen(true);
          setDealUntil(t + 4500);
          pushRadio("DEAL: alege rapid recompensa (30% risc).", 2400);
          logEvent("Deal offer");
        }
      }

      // AI update (paused if generator modal open)
      if (genOpen) return;

      const camJamActive = jam;

      charsRef.current = charsRef.current.map((rc) => {
        const def = rc.def;
        let route = rc.route;
        let idx = rc.idx;
        let depth = rc.depth;
        let doorPressure = rc.doorPressure;
        let fakeRetreatReadyUntil = rc.fakeRetreatReadyUntil;
        let phaseRevealUntil = rc.phaseRevealUntil;
        let state = rc.state;
        let cooldownUntil = rc.cooldownUntil;

        // random glitch route
        if (def.ability === "glitch" && rand() < 0.015 * nf) {
          route = buildRouteForDef(def);
        }

        // speed factor
        const diff = getDiff(def);
        let speed = 1.0 + (diff - 1) * 0.085;
        speed *= nf * DIFFICULTY_SPEED[difficultyPreset];

        if (def.ability === "speedy") speed *= 1.12;
        if (def.ability === "tank") speed *= 0.92;
        if (def.ability === "heatLover") speed *= clamp(1 + (heatRef.current - 22) / 18, 0.9, 1.45);
        if (def.ability === "coldHunter") speed *= clamp(1 + (22 - heatRef.current) / 16, 0.9, 1.45);
        if (def.ability === "soundSensitive") speed *= 1 + resetSpamRef.current * 0.12 + (noiseRef.current / 100) * 0.35;
        if (def.ability === "mirror" && cameraOpen) speed *= 1.18;
        if (def.ability === "ventCrawler" && (route[idx]?.includes("VENT") || route[Math.max(0, idx - 1)]?.includes("VENT"))) {
          speed *= 1.18;
        }
        const bossPhase = def.ability === "boss" && (sanityRef.current < 50 || hour >= 2);
        if (def.ability === "boss") speed *= bossPhase ? 1.45 : 1.25;
        const safeGate = mode !== "ENDLESS" && hour < SAFE_HOURS;
        if (safeGate) speed *= 0.75;
        const panic = sanityRef.current < 28;
        if (panic) {
          if (rc.personality === "aggressive") speed *= 1.15;
          if (rc.personality === "shy") speed *= 0.9;
        }

        // base move timer
        let nextMoveIn = rc.nextMoveIn - 0.10;
        if (def.ability === "fakeRetreat" && t < fakeRetreatReadyUntil) nextMoveIn -= 0.12;

        // depth within view increases slowly (2D->3D)
        depth = clamp(depth + 0.02 * speed, 0, 1);

        // jammer charge while cameras used
        let jammerCharge = rc.jammerCharge;
        if (def.ability === "jammer" && cameraOpen) jammerCharge += 0.07 * speed;

        // trigger jam
        if (def.ability === "jammer" && jammerCharge > 1.9 && !camJamActive) {
          setCamJamUntil(t + (7000 + rand() * 6000));
          jammerCharge = 0;
        }

        if (def.ability === "generatorHacker" && (genOpen || genOn) && rand() < 0.006 * nf) {
          setGenOpen(false);
          setGenOnUntil(0);
          setGenCdUntil(t + 15_000);
        }

          if (
            cameraOpen &&
            (def.ability === "glitch" || def.ability === "cameraPhasing") &&
            rand() < 0.01 * nf * (glitchStorm ? 1.5 : 1)
          ) {
            const mult = Math.max(0.4, 1 - upgradeCamClarity * 0.15 - skills.camClarity * 0.08);
            const stormBoost = glitchStorm ? 1.2 : 1;
            setCamGlitchUntil(t + Math.max(400, 1200 * mult * stormBoost));
          }

        // cooldown state
        if (state === "COOLDOWN") {
          if (t >= cooldownUntil) {
            state = "HUNT";
            route = buildRouteForDef(def);
            idx = 0;
            depth = rand() * 0.2;
            nextMoveIn = 1.2 + rand() * 1.6;
            doorPressure = 0;
            cooldownUntil = 0;
          } else {
            if (nextMoveIn <= 0) {
              nextMoveIn = clamp(2.6 / speed + rand() * 2.8, 0.9, 6.0);
              if (idx < route.length - 1) {
                idx = Math.min(route.length - 1, idx + 1);
                depth = 0.1 + rand() * 0.2;
              } else {
                const currentView = route[route.length - 1] ?? rc.home;
                const nextView = pickWanderTarget(currentView);
                route = [currentView, nextView];
                idx = 0;
                depth = 0.1 + rand() * 0.2;
              }
            }
            return {
              ...rc,
              route,
              idx,
              depth,
              nextMoveIn,
              jammerCharge,
              doorPressure: 0,
              fakeRetreatReadyUntil,
              phaseRevealUntil,
              state,
              cooldownUntil,
            };
          }
        }

        // move step
        if (state === "HUNT" && idx === 0 && rand() < 0.015) {
          const base = buildRouteForDef(def);
          route = [...rc.patrol, ...base];
          idx = 0;
        }
        if (nextMoveIn <= 0) {
          // new cooldown (faster on high diff)
          nextMoveIn = clamp(2.2 / speed + rand() * 1.4, 0.5, 4.0);

          const nextView = route[Math.min(route.length - 1, idx + 1)];
          const avoidUntil = nextView ? avoidViewUntilRef.current[nextView] ?? 0 : 0;
          if (nextView && t < avoidUntil && rand() < 0.75) {
            nextMoveIn = clamp(1.4 / speed + rand() * 1.6, 0.6, 3.4);
            return {
              ...rc,
              route,
              idx,
              depth,
              nextMoveIn,
              jammerCharge,
              doorPressure,
              fakeRetreatReadyUntil,
              phaseRevealUntil,
              state,
              cooldownUntil,
            };
          }

          const atEnd = idx >= route.length - 1;
          if (!atEnd) {
            let step = 1;
            const currentView = route[idx] ?? route[0];
            const isHall = currentView.includes("HOL");
            if (!safeGate && def.ability === "hallSprinter" && isHall && rand() < 0.25) step = 2;
            if (def.ability === "cameraPhasing" && cameraOpen && rand() < 0.18) {
              step = Math.max(step, 2);
              phaseRevealUntil = t + 1200;
              nextMoveIn = 0.6;
            }
            idx = Math.min(route.length - 1, idx + step);
            depth = 0.06 + rand() * 0.12;
          } else {
            // attempt to enter OFFICE
            const prev = route[route.length - 2] ?? route[0];
            const viaLeftDoor = prev === "HOL_STANGA_NEAR";
            const viaRightDoor = prev === "HOL_DREAPTA_NEAR";
            const viaVentL = prev === "VENT_LEFT_NEAR";
            const viaVentR = prev === "VENT_RIGHT_NEAR";

            const blocked =
              (viaLeftDoor && doorL) ||
              (viaRightDoor && doorR) ||
              (viaVentL && sealL) ||
              (viaVentR && sealR);

              if (blocked) {
              const bossPhase = def.ability === "boss" && (sanityRef.current < 50 || hour >= 2);
              const pressureScale =
                (rc.personality === "brave" ? 0.32 : rc.personality === "shy" ? 0.18 : 0.25) + (def.ability === "boss" ? (bossPhase ? 0.32 : 0.18) : 0);
              doorPressure += pressureScale * speed;
              const baseThreshold = def.ability === "doorCamper" ? 5.5 : def.ability === "boss" ? (bossPhase ? 5.8 : 6.5) : 9.0;
              const forceThreshold =
                (rc.personality === "brave" ? baseThreshold - 1.2 : rc.personality === "shy" ? baseThreshold + 1.4 : baseThreshold) +
                upgradeDoorStrength * 1.2 +
                skills.doorSpeed * 1.2;
              if (doorPressure >= forceThreshold) {
                if (viaLeftDoor) setDoorL(false);
                if (viaRightDoor) setDoorR(false);
                if (viaVentL) setSealLUntil(0);
                if (viaVentR) setSealRUntil(0);
                triggerJump(def.id, def.name, "Forced entry");
              } else {
                const cooled = applyCooldown({ ...rc, route, idx }, t, diff);
                return { ...cooled, jammerCharge, phaseRevealUntil, fakeRetreatReadyUntil };
              }
            } else {
              if (!safeGate) {
                doorPressure = 0;
                if (def.ability === "flashOrDie") {
                  if (t - lastFlashAtRef.current <= 1400) {
                    const cooled = applyCooldown({ ...rc, route, idx }, t, diff);
                    return { ...cooled, jammerCharge, phaseRevealUntil, fakeRetreatReadyUntil };
                  }
                  triggerJump(def.id, def.name, "Flash failed");
                } else {
                  // ATTACK
                  triggerJump(def.id, def.name, "Direct attack");
                  // save best after jump appears (also in effect below)
                }
              } else {
                const cooled = applyCooldown({ ...rc, route, idx }, t, diff);
                return { ...cooled, jammerCharge, phaseRevealUntil, fakeRetreatReadyUntil };
              }
            }
          }
        }

        doorPressure = Math.max(0, doorPressure - 0.04);
        return {
          ...rc,
          route,
          idx,
          depth,
          nextMoveIn,
          jammerCharge,
          doorPressure,
          fakeRetreatReadyUntil,
          phaseRevealUntil,
          state,
          cooldownUntil,
        };
      });

      if (t - lastGhostAtRef.current > 900) {
        const buffer = ghostBufferRef.current;
        charsRef.current.forEach((rc) => {
          const viewId = rc.route[rc.idx] ?? rc.home;
          const view = VIEWS.find((v) => v.id === viewId);
          if (!view) return;
          const pos = getCamPosition(view, rc.def.id);
          const list = buffer[viewId] ?? [];
          list.push({ viewId, xPct: pos.xPct, yPct: pos.yPct });
          if (list.length > 30) list.shift();
          buffer[viewId] = list;
        });
        lastGhostAtRef.current = t;
      }

      // soft lethal systems (if extreme)
      // if heat too high or air too low for too long -> jumpscare "SYSTEM"
      // Here: if heat >= 32 OR air <= 15 => end.
      // (Simple, but scary.)
      // We read current values via closure? Not exact; so we keep thresholds high:
      // We'll check using refs-like trick: not needed; just keep in UI now.
    }, 100);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [
    screen,
    night,
    cameraOpen,
    camIndex,
    doorL,
    doorR,
    sealLUntil,
    sealRUntil,
    genOpen,
    genOnUntil,
    camJamUntil,
    fan,
    powerOutAt,
    jump.visible,
    score,
    mode,
    challenge,
    customLevels,
    intel,
    difficultyPreset,
    nightHour,
    night6,
    hardcore,
    modePreset,
    modeTier,
    cutsceneOpen,
    skills,
    ventHealth,
    sanity,
    signalJammerUntil,
    falseCueUntil,
    blackoutUntil,
    falseAlarmUntil,
    surgeUntil,
    radioMsg,
    radioUntil,
    alarmCdUntil,
    motionPingUntil,
    taskWorkUntil,
    activeTaskId,
    noise,
    doorLLockUntil,
    doorRLockUntil,
    maintenanceOpen,
    camDeadUntil,
    powerRoute,
    powerSpikeUntil,
    powerSpikeChoice,
    scanCdUntil,
    scanUntil,
    overclockCdUntil,
    upgradeVentSeal,
    upgradeCamClarity,
    upgradeDoorStrength,
    upgradeScan,
    nightModifiers,
    decoyUntil,
    decoyViewId,
    fuseOpen,
    fuseLockUntil,
    dealOpen,
    dealUntil,
  ]);

  // Save best when jump shows
  useEffect(() => {
    if (!jump.visible) return;
    saveBest(score);
    if (resultLoggedRef.current) return;
    resultLoggedRef.current = true;
    const isWin = !!jump.win;
    const entry = { score, night, who: jump.who ?? "Unknown", ts: now() };
    setScoreLog((prev) => {
      const next = [entry, ...prev].slice(0, 20);
      persistLocal(SCORE_LOG_KEY, JSON.stringify(next));
      saveSettingsImmediate({ scoreLog: next });
      return next;
    });
    if (!isWin) {
      setAdaptiveDeaths((d) => {
        const next = d + 1;
        persistLocal(ADAPT_KEY, String(next));
        saveSettingsImmediate({ adaptiveDeaths: next });
        return next;
      });
    } else {
      setAdaptiveDeaths((d) => {
        const next = Math.max(0, d - 1);
        persistLocal(ADAPT_KEY, String(next));
        saveSettingsImmediate({ adaptiveDeaths: next });
        return next;
      });
    }
    if (dailyRun) {
      setDailyScores((prev) => {
        const date = dateKey();
        const next = [{ date, score, night }, ...prev].slice(0, 20);
        persistLocal(DAILY_KEY, JSON.stringify(next));
        saveSettingsImmediate({ dailyScores: next });
        return next;
      });
    }
    const ghostNext = ghostBufferRef.current;
    if (ghostNext && Object.keys(ghostNext).length) {
      setGhostByView(ghostNext);
      persistLocal(GHOST_KEY, JSON.stringify(ghostNext));
      saveSettingsImmediate({ ghostByView: ghostNext });
    }
    if (!creditsAwardedRef.current) {
      const add = Math.max(1, Math.floor(score / 60));
      setCredits((c) => {
        const next = c + add;
        saveSettingsImmediate({ credits: next });
        persistLocal(CREDITS_KEY, String(next));
        return next;
      });
      creditsAwardedRef.current = true;
    }
    submitScore(score, night);
    if (challengeRunRef.current) {
      const challengeId = challengeRunRef.current;
      challengeRunRef.current = null;
      apiPost("challenge_submit", { challengeId, score }).then(
        () => fetchChallenges(),
        () => {}
      );
    }
  }, [jump.visible]);

  const getCamPosition = (view: CameraView, charId: string): CamPos => {
    const manual = CAM_POSITIONS[view.id]?.[charId];
    if (manual) return manual;
    const seed = hash01(`${view.id}:${charId}`);
    const seed2 = hash01(`${charId}:${view.id}`);
    const jitterX = (seed - 0.5) * 0.18;
    const jitterY = (seed2 - 0.5) * 0.16;
    return {
      xPct: clamp(view.anchor.xPct + jitterX, 0.08, 0.92),
      yPct: clamp(view.anchor.yPct + jitterY, 0.18, 0.88),
      depth: 0.15 + seed * 0.7,
    };
  };

  // ===== rendering characters in current view =====
  const renderChars = (viewId: ViewId) => {
    const t = now();
    const view = VIEWS.find((v) => v.id === viewId);
    if (!view) return null;

    const list = charsRef.current.filter((rc) => rc.route[rc.idx] === viewId);

    return list.map((rc) => {
      const def = rc.def;
      if (!scanActive) {
        if (def.ability === "phantom" && t > rc.phantomRevealUntil) return null;
        if (def.ability === "shadow" && t > rc.shadowRevealUntil) return null;
        if (def.ability === "mirror" && cameraOpen) return null;
        if (def.ability === "cameraPhasing" && t > rc.phaseRevealUntil && cameraOpen) return null;
      }

      const pos = getCamPosition(view, def.id);
      const x = SW * pos.xPct;
      const baseY = SH * pos.yPct;

      const dMin = view.anchor.depthMin;
      const dMax = view.anchor.depthMax;
      const depthBlend = clamp((pos.depth ?? rc.depth) * 0.4 + rc.depth * 0.6, 0, 1);
      const depth = clamp(dMin + (dMax - dMin) * depthBlend, 0, 1);

      const scale = depthToScale(depth);
      const y = baseY + depthToYOffset(depth);

      const sway = Math.sin((t / 220) + def.difficulty) * (2 + def.difficulty * 0.2);
      const size = 120 + depth * 120;

      return (
        <View
          key={def.id}
          style={[
            styles.spriteWrap,
            {
              width: size,
              height: size * 1.25,
              left: x - size / 2 + sway,
              top: y - size,
              transform: [{ scale }],
            },
          ]}
          pointerEvents="none"
        >
          <Image source={charImg(def.id)} style={[styles.sprite, { width: size, height: size * 1.1 }]} resizeMode="contain" />
          <Text style={styles.spriteLabel}>{def.name}</Text>
        </View>
      );
    });
  };

  // ===== UI components =====
  const SoftButton: React.FC<SocialSoftButtonProps> = ({
    title,
    sub,
    onPress,
    disabled,
    tone = "neutral",
    powerGate,
  }) => {
    const bg =
      tone === "danger" ? "rgba(220,70,70,0.18)" : tone === "good" ? "rgba(70,220,140,0.16)" : "rgba(255,255,255,0.10)";
    const border =
      tone === "danger" ? "rgba(255,90,90,0.35)" : tone === "good" ? "rgba(90,255,180,0.30)" : "rgba(255,255,255,0.18)";
    const hardDisabled = disabled || (powerGate && powerDead);
    const handlePress = () => {
      if (hardDisabled) return;
      onPress();
    };
    return (
      <Pressable
        onPressIn={handlePress}
        disabled={hardDisabled}
        hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
        pressRetentionOffset={{ top: 20, bottom: 20, left: 20, right: 20 }}
        delayPressIn={0}
        style={({ pressed }) => [
          styles.softBtn,
          uiCompact && styles.softBtnCompact,
          ultraCompact && styles.softBtnUltra,
          ultraCompact ? { width: "100%" } : uiCompact ? { width: `${Math.floor(100 / dockCols)}%` } : null,
          { backgroundColor: bg, borderColor: border, opacity: hardDisabled ? 0.45 : pressed ? 0.82 : 1 },
          pressed && styles.softBtnPressed,
        ]}
      >
        <Text style={[styles.softBtnTitle, uiCompact && styles.softBtnTitleCompact, ultraCompact && styles.softBtnTitleUltra]}>{title}</Text>
        {!!sub && <Text style={[styles.softBtnSub, uiCompact && styles.softBtnSubCompact, ultraCompact && styles.softBtnSubUltra]}>{sub}</Text>}
      </Pressable>
    );
  };

  const isAdminUser = authUser?.role === "admin";
  const badgeUnlocked = useMemo(() => {
    const earlyAccessActive = new Date() < new Date("2026-03-01T00:00:00");
    return {
      verified: !!authUser?.verified,
      moderator: isAdminUser,
      early_bird: earlyAccessActive,
      bolojan: true,
      nicusor: true,
      rose: (scoreLog?.length ?? 0) > 0 || (userStats?.sessions ?? 0) > 0,
      season_top1: seasonBadges.includes("season_top1"),
      season_top2: seasonBadges.includes("season_top2"),
      season_top3: seasonBadges.includes("season_top3"),
    } as Record<string, boolean>;
  }, [authUser?.verified, isAdminUser, scoreLog, userStats, seasonBadges]);
  const badgeMeta = useMemo(
    () =>
      BADGES.reduce((acc, b) => {
        acc[b.id] = { id: b.id, name: b.name, type: b.type, value: b.value };
        return acc;
      }, {} as Record<string, { id: string; name: string; type: "emoji" | "image" | "icon"; value: any }>),
    []
  );

  const handleCreatePost = async () => {
    if (!authToken || !postBody.trim()) return;
    try {
      const snapshot = {
        best: userStats?.best ?? best,
        last: scoreLog[0]?.score ?? 0,
        night: scoreLog[0]?.night ?? 0,
      };
      await apiPost("post_create", { body: postBody.trim(), snapshot });
      setPostBody("");
      const d = await apiGet("posts_list");
      setPosts(d?.posts ?? []);
    } catch {}
  };

  const handleAdminDeleteChallenge = async (challengeId: string) => {
    if (!authToken || !isAdminUser) return;
    try {
      await apiPost("admin_delete_challenge", { challengeId });
      fetchChallenges();
    } catch {}
  };

  const handleCreatePoll = async (question: string, options: string[], pollType: "single" | "multi" | "quiz", correctIndex: number | null) => {
    if (!authToken) {
      alert("Trebuie să fii logat pentru poll.");
      return;
    }
    const q = (question || "").trim();
    const opts = (options || []).map((o) => String(o).trim()).filter(Boolean);
    if (!q || opts.length < 2) return;
    try {
      await apiPost("poll_create", { question: q, options: opts, pollType, correctIndex });
      const d = await apiGet("poll_list");
      setPolls(d?.polls ?? []);
    } catch (e: any) {
      alert(e?.message || "Eroare poll");
    }
  };

  const handleVotePoll = async (pollId: string, optionIndex: number) => {
    if (!authToken) return alert("Trebuie să fii logat pentru a vota.");
    try {
      await apiPost("poll_vote", { pollId, optionIndex });
      const d = await apiGet("poll_list");
      setPolls(d?.polls ?? []);
    } catch (e: any) {
      alert(e?.message || "Eroare vot");
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!authToken || !isAdminUser) return;
    try {
      await apiPost("admin_delete_poll", { pollId });
      const d = await apiGet("poll_list");
      setPolls(d?.polls ?? []);
    } catch {}
  };

  const handleFollowToggle = async (post: SocialPost) => {
    if (!authToken || !post.user_id) return;
    try {
      const d = await apiPost("follow_toggle", { userId: post.user_id });
      setPosts((arr) => arr.map((it) => (it.id === post.id ? { ...it, following: d?.following } : it)));
    } catch {}
  };

  const handleLikeToggle = async (postId: string) => {
    if (!authToken) return;
    try {
      const d = await apiPost("like_toggle", { postId });
      setPosts((arr) =>
        arr.map((it) =>
          it.id === postId
            ? {
                ...it,
                liked: d?.liked,
                likes_count: Math.max(0, Number.isFinite(d?.likesCount) ? d.likesCount : it.likes_count ?? 0),
              }
            : it
        )
      );
    } catch {}
  };

  const handleFavoriteToggle = async (postId: string) => {
    if (!authToken) return;
    try {
      const d = await apiPost("favorite_toggle", { postId });
      setPosts((arr) =>
        arr.map((it) =>
          it.id === postId
            ? {
                ...it,
                favorited: d?.favorited,
                favorites_count: Math.max(0, Number.isFinite(d?.favoritesCount) ? d.favoritesCount : it.favorites_count ?? 0),
              }
            : it
        )
      );
    } catch {}
  };

  const handleFetchComments = async (postId: string) => {
    if (!authToken) return;
    try {
      const d = await apiGet(`comments_list?postId=${encodeURIComponent(postId)}`);
      setCommentsByPost((c) => ({ ...c, [postId]: d?.comments ?? [] }));
    } catch {}
  };

  const handleAddComment = async (postId: string) => {
    if (!authToken) return;
    const body = commentDraft[postId]?.trim();
    if (!body) return;
    const parentId = commentReplyTo[postId] ?? null;
    try {
      await apiPost("comment_add", { postId, body, parentId });
      setCommentDraft((d) => ({ ...d, [postId]: "" }));
      setCommentReplyTo((r) => ({ ...r, [postId]: null }));
      const d = await apiGet(`comments_list?postId=${encodeURIComponent(postId)}`);
      setCommentsByPost((c) => ({ ...c, [postId]: d?.comments ?? [] }));
    } catch {}
  };

  const handleDeletePost = async (postId: string) => {
    if (!authToken || !isAdminUser) return;
    try {
      await apiPost("admin_delete_post", { postId });
      setPosts((arr) => arr.filter((it) => it.id !== postId));
    } catch {}
  };

  const handleEditPost = async (postId: string, body: string) => {
    if (!authToken || !isAdminUser) return;
    const trimmed = body.trim();
    if (!trimmed) return;
    try {
      await apiPost("admin_edit_post", { postId, body: trimmed });
      setPosts((arr) => arr.map((it) => (it.id === postId ? { ...it, body: trimmed } : it)));
    } catch {}
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!authToken || !isAdminUser) return;
    try {
      await apiPost("admin_delete_comment", { commentId });
      const d = await apiGet(`comments_list?postId=${encodeURIComponent(postId)}`);
      setCommentsByPost((s) => ({ ...s, [postId]: d?.comments ?? [] }));
    } catch {}
  };

  const saveRecents = (next: SocialRecentItem[]) => {
    setRecents(next);
    AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(next)).catch(() => {});
  };

  const addRecent = (item: SocialRecentItem) => {
    setRecents((prev) => {
      const next = [item, ...prev.filter((r) => r.id !== item.id)]
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 12);
      persistLocal(RECENTS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeRecent = (id: string) => {
    setRecents((prev) => {
      const next = prev.filter((r) => r.id !== id);
      persistLocal(RECENTS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleProfileFollowToggle = async () => {
    if (!authToken || !profileView?.id) return;
    try {
      const d = await apiPost("follow_toggle", { userId: profileView.id });
      setProfileIsFollowing(!!d?.following);
      if (Number.isFinite(d?.followers)) setProfileFollowers(Math.max(0, d.followers));
    } catch {}
  };

  const handleRefreshProfile = () => {
    if (profileView?.username) openProfile(profileView.username);
  };

  const handleLoadProfileMessages = async () => {
    if (!authToken || !profileView?.id || !profileIsFriend) return;
    try {
      const d = await apiGet(`messages_list?withUserId=${encodeURIComponent(profileView.id)}`);
      setDmMessages(d?.messages ?? []);
    } catch {}
  };

  const handleSendMessageToProfile = async () => {
    if (!authToken || !profileView?.id || !dmDraft.trim() || !profileIsFriend) return;
    try {
      await apiPost("message_send", { toUserId: profileView.id, body: dmDraft.trim() });
      setDmDraft("");
      await handleLoadProfileMessages();
    } catch {}
  };

  const handleSendMessageInChat = async () => {
    if (!authToken || !messageUser?.id || !dmDraft.trim()) return;
    try {
      await apiPost("message_send", { toUserId: messageUser.id, body: dmDraft.trim() });
      setDmDraft("");
      await openMessageUser(messageUser);
    } catch {}
  };

  const handleAdminAction = async (action: "admin" | "user" | "verify" | "unverify") => {
    if (!authToken || !isAdminUser || !profileView?.id) return;
    try {
      if (action === "admin" || action === "user") {
        await apiPost("admin_user_role", { userId: profileView.id, role: action === "admin" ? "admin" : "user" });
      } else {
        await apiPost("admin_verify_user", { userId: profileView.id, verified: action === "verify" });
      }
      openProfile(profileView.username);
    } catch {}
  };

  const navHome = () => setScreen("MENU");
  const navMessages = () => setScreen("MESSAGES");
  const navExplore = () => setScreen("SOCIAL");
  const navSettings = () => setScreen("ACCOUNT");

  const MenuNavButton = ({
    title,
    sub,
    active,
    onPress,
  }: {
    title: string;
    sub: string;
    active?: boolean;
    onPress: () => void;
  }) => {
    return (
      <Pressable onPress={onPress} style={[styles.menuNavBtn, active && styles.menuNavBtnActive]}>
        <View style={styles.menuNavLeft}>
          <View style={[styles.menuNavIcon, active && styles.menuNavIconActive]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.menuNavTitle}>{title}</Text>
            <Text style={styles.menuNavSub}>{sub}</Text>
          </View>
        </View>
        <Text style={styles.menuNavKbd}>•</Text>
      </Pressable>
    );
  };

  const HelpModal = () => {
    if (!helpOpen) return null;
    return (
      <View style={styles.modalWrap}>
        <View style={[styles.modalCard, shadow as any]}>
          <Text style={styles.modalTitle}>HELP</Text>
          <Text style={styles.modalSub}>Controls & tips</Text>
          <View style={{ height: 8 }} />
          {HELP_LINES.map((line, i) => (
            <Text key={`${line}-${i}`} style={styles.helpLine}>• {line}</Text>
          ))}
          {Platform.OS === "web" && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.helpLine}>Keybinds: Q/E uși, Z/X vent, C cam, L lure, M music, R reset, F light, G gen, V overclock.</Text>
              <Text style={styles.helpLine}>T tasks, O alarm, P ping, +/- fan, ←/→ camere, H help, Esc meniu.</Text>
            </View>
          )}
          <View style={{ height: 10 }} />
          <SoftButton title="Închide" onPress={() => setHelpOpen(false)} />
        </View>
      </View>
    );
  };

  const Bar = ({
    label,
    value,
    warn,
    rightText,
    good,
    bad,
  }: {
    label: string;
    value: number; // 0..100
    warn?: boolean;
    rightText?: string;
    good: string;
    bad: string;
  }) => {
    const v = clamp(value, 0, 100);
    const danger = warn || v <= 20;
    const col = danger ? bad : good;
    return (
      <View style={[styles.barRow, compactHud && styles.barRowCompact, ultraCompact && styles.barRowUltra]}>
        <Text style={[styles.barLabel, compactHud && styles.barLabelCompact, ultraCompact && styles.barLabelUltra]}>{label}</Text>
        <View style={[styles.barTrack, compactHud && styles.barTrackCompact, ultraCompact && styles.barTrackUltra]}>
          <View style={[styles.barFill, compactHud && styles.barFillCompact, ultraCompact && styles.barFillUltra, { width: `${v}%`, backgroundColor: col }]} />
        </View>
        <Text style={[styles.barVal, compactHud && styles.barValCompact, ultraCompact && styles.barValUltra, danger && { color: "#FFB86B" }]}>
          {rightText ?? `${Math.round(v)}%`}
        </Text>
      </View>
    );
  };

  // ====== SCREENS ======
  if (screen === "LOADING") {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingWrap}>
          <View style={styles.loadingOrb} />
          <Text style={styles.loadingTitle}>5 DAYS</Text>
          <Text style={styles.loadingSub}>Se încarcă resursele...</Text>
        </View>
      </SafeAreaView>
    );
  }


  if (screen === "LOGIN") {
    return (
      <LoginScreen
        loginUser={loginUser}
        loginEmail={loginEmail}
        loginPass={loginPass}
        registerMode={registerMode}
        authLoading={authLoading}
        authError={authError}
        onUserChange={setLoginUser}
        onEmailChange={setLoginEmail}
        onPassChange={setLoginPass}
        onToggleRegister={() => setRegisterMode((v) => !v)}
        onGuest={async () => {
          setAuthError("");
          setAuthToken("");
          setAuthUser(null);
          setProfileName("Guest");
          setScoreLog([]);
          try {
            await AsyncStorage.multiRemove([AUTH_KEY, PROFILE_KEY]);
          } catch {}
          setScreen("MENU");
        }}
        onSubmit={async () => {
          try {
            setAuthError("");
            setAuthLoading(true);
            const body =
              registerMode && !authToken
                ? {
                    username: loginUser.trim(),
                    email: loginEmail.trim(),
                    password: loginPass,
                    guestTransfer: buildGuestTransfer(),
                  }
                : {
                    username: loginUser.trim(),
                    email: loginEmail.trim(),
                    password: loginPass,
                  };
            const data = await authRequest(registerMode ? "auth_register" : "auth_login", body);
            const token = data?.token;
            const user = data?.user;
            if (token) {
              setAuthToken(token);
              await AsyncStorage.setItem(AUTH_KEY, token);
            }
            if (user) {
              setAuthUser(user);
            }
            if (user?.username) {
              setProfileName(user.username);
              await AsyncStorage.setItem(PROFILE_KEY, user.username);
            }
            setScoreLog([]);
            setLoginPass("");
            setScreen("MENU");
          } catch (e) {
            setAuthError(e?.message || "Auth failed");
          } finally {
            setAuthLoading(false);
          }
        }}
      />
    );
  }

  if (screen === "SCORES") {
    const today = dateKey();
    const todayScores = [...dailyScores]
      .filter((s) => s.date === today)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={IMG.rooms[bgPick]} style={styles.bg} resizeMode="cover">
          <View style={styles.overlay} />
          <ScrollView contentContainerStyle={styles.socialWrap}>
            <View style={[styles.scoreCard, shadow as any]}>
              <Text style={styles.scoreTitle}>Scoreboard</Text>
              
<Text style={styles.scoreSub}>Alege leaderboard: scor / coins / challenge-uri</Text>
              <View style={styles.scoreTabs}>
                {[
                  { id: "score", label: "Score" },
                  { id: "coins", label: "Coins" },
                  { id: "challenges", label: "Challenges" },
                ].map((t) => {
                  const active = scoreTab === t.id;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => setScoreTab(t.id as any)}
                      style={[styles.scoreTabBtn, active && styles.scoreTabBtnActive]}
                    >
                      <Text style={[styles.scoreTabText, active && styles.scoreTabTextActive]}>{t.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {scoreTab === "score" && (
                <>
                  <View style={{ height: 12 }} />
                  {scoreLog.length === 0 && <Text style={styles.scoreEmpty}>Niciun scor ?nc?.</Text>}
                  {scoreLog.map((it, i) => (
                    <View key={`${it.ts}-${i}`} style={styles.scoreRow}>
                      <Text style={styles.scoreIdx}>#{i + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.scoreName}>{it.who}</Text>
                        <Text style={styles.scoreMeta}>Night {it.night}</Text>
                      </View>
                      <Text style={styles.scoreVal}>{it.score}</Text>
                    </View>
                  ))}

                  <View style={{ height: 14 }} />
                  <Text style={styles.scoreSub}>Daily Run (ast?zi)</Text>
                  <View style={{ height: 6 }} />
                  {todayScores.length === 0 && <Text style={styles.scoreEmpty}>Niciun scor daily.</Text>}
                  {todayScores.map((it, i) => (
                    <View key={`daily-${it.date}-${i}`} style={styles.scoreRow}>
                      <Text style={styles.scoreIdx}>#{i + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.scoreName}>Daily Seed</Text>
                        <Text style={styles.scoreMeta}>Night {it.night}</Text>
                      </View>
                      <Text style={styles.scoreVal}>{it.score}</Text>
                    </View>
                  ))}

                  <View style={{ height: 14 }} />
                  <Text style={styles.scoreSub}>Leaderboard (global)</Text>
                  <View style={{ height: 10 }} />
                  {remoteLoading && <Text style={styles.scoreEmpty}>Se ?ncarc?...</Text>}
                  {!remoteLoading && remoteScores.length === 0 && <Text style={styles.scoreEmpty}>Niciun scor global.</Text>}
                  {!remoteLoading && remoteScores.length >= 1 && (
                    <View style={styles.podium}>
                      {[1, 0, 2].map((idxPos, col) => {
                        const it = remoteScores[idxPos];
                        if (!it) return <View key={`pod-empty-${col}`} style={styles.podiumCol} />;
                        const place = idxPos + 1;
                        return (
                          <View key={`pod-${place}`} style={[styles.podiumCol, styles[`pod${place}`] as any]}>
                            <Text style={styles.podPlace}>#{place}</Text>
                            <Text style={styles.podName}>{it.username}</Text>
                            <Text style={styles.podScore}>{it.score}</Text>
                            <Text style={styles.podMeta}>Night {it.night}</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                  {!remoteLoading &&
                    remoteScores.slice(3).map((it, i) => (
                      <View key={`remote-${it.username}-${i}`} style={styles.scoreRow}>
                        <Text style={styles.scoreIdx}>#{i + 4}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.scoreName}>{it.username}</Text>
                          <Text style={styles.scoreMeta}>Night {it.night}</Text>
                        </View>
                        <Text style={styles.scoreVal}>{it.score}</Text>
                      </View>
                    ))}

                  <View style={{ height: 14 }} />
                  <Text style={styles.scoreSub}>Ranked Season {seasonId || "(loading...)"}</Text>
                  <View style={{ height: 6 }} />
                  {seasonScores.length === 0 && <Text style={styles.scoreEmpty}>Niciun scor sezon.</Text>}
                  {seasonScores.slice(0, 5).map((it, i) => (
                    <View key={`season-${it.username}-${i}`} style={styles.scoreRow}>
                      <Text style={styles.scoreIdx}>#{i + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.scoreName}>{it.username}</Text>
                        <Text style={styles.scoreMeta}>Night {it.night}</Text>
                      </View>
                      <Text style={styles.scoreVal}>{it.score}</Text>
                    </View>
                  ))}
                </>
              )}

              {scoreTab === "coins" && (
                <>
                  <View style={{ height: 12 }} />
                  <Text style={styles.scoreSub}>Leaderboard Coins</Text>
                  <View style={{ height: 10 }} />
                  {remoteCoins.length === 0 && <Text style={styles.scoreEmpty}>Niciun scor coins.</Text>}
                  {remoteCoins.length >= 1 && (
                    <View style={styles.podium}>
                      {[1, 0, 2].map((idxPos, col) => {
                        const it = remoteCoins[idxPos];
                        if (!it) return <View key={`podc-empty-${col}`} style={styles.podiumCol} />;
                        const place = idxPos + 1;
                        return (
                          <View key={`podc-${place}`} style={[styles.podiumCol, styles[`pod${place}`] as any]}>
                            <Text style={styles.podPlace}>#{place}</Text>
                            <Text style={styles.podName}>{it.username}</Text>
                            <Text style={styles.podScore}>{it.credits}</Text>
                            <Text style={styles.podMeta}>Coins</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                  {remoteCoins.slice(3).map((it, i) => (
                    <View key={`coins-${it.username}-${i}`} style={styles.scoreRow}>
                      <Text style={styles.scoreIdx}>#{i + 4}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.scoreName}>{it.username}</Text>
                        <Text style={styles.scoreMeta}>Coins</Text>
                      </View>
                      <Text style={styles.scoreVal}>{it.credits}</Text>
                    </View>
                  ))}
                </>
              )}

              {scoreTab === "challenges" && (
                <>
                  <View style={{ height: 12 }} />
                  <Text style={styles.scoreSub}>Leaderboard Challenges</Text>
                  <View style={{ height: 10 }} />
                  {remoteChallenges.length === 0 && <Text style={styles.scoreEmpty}>Niciun challenge completat.</Text>}
                  {remoteChallenges.length >= 1 && (
                    <View style={styles.podium}>
                      {[1, 0, 2].map((idxPos, col) => {
                        const it = remoteChallenges[idxPos];
                        if (!it) return <View key={`podch-empty-${col}`} style={styles.podiumCol} />;
                        const place = idxPos + 1;
                        return (
                          <View key={`podch-${place}`} style={[styles.podiumCol, styles[`pod${place}`] as any]}>
                            <Text style={styles.podPlace}>#{place}</Text>
                            <Text style={styles.podName}>{it.username}</Text>
                            <Text style={styles.podScore}>{it.count}</Text>
                            <Text style={styles.podMeta}>Completed</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                  {remoteChallenges.slice(3).map((it, i) => (
                    <View key={`ch-${it.username}-${i}`} style={styles.scoreRow}>
                      <Text style={styles.scoreIdx}>#{i + 4}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.scoreName}>{it.username}</Text>
                        <Text style={styles.scoreMeta}>Completed</Text>
                      </View>
                      <Text style={styles.scoreVal}>{it.count}</Text>
                    </View>
                  ))}
                </>
              )}
<SoftButton title="ÎNAPOI" onPress={() => setScreen("MENU")} />
            </View>
          </ScrollView>
        </ImageBackground>
        <HelpModal />
      </SafeAreaView>
    );
  }

  if (screen === "STATS") {
    const localTotal = scoreLog.reduce((s, x) => s + x.score, 0);
    const localBestNight = scoreLog.reduce((m, x) => Math.max(m, x.night), 0);
    const s = authToken && userStats
      ? {
          best: userStats.best,
          sessions: userStats.sessions,
          highestNight: userStats.highest_night,
          totalScore: userStats.total_score,
        }
      : {
          best,
          sessions: scoreLog.length,
          highestNight: localBestNight,
          totalScore: localTotal,
        };
    const avg = s.sessions ? Math.round(s.totalScore / s.sessions) : 0;
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={IMG.rooms[bgPick]} style={styles.bg} resizeMode="cover">
          <View style={styles.overlay} />
          <ScrollView contentContainerStyle={styles.socialWrap}>
            <View style={[styles.statsCard, shadow as any]}>
              <Text style={styles.scoreTitle}>Statistici</Text>
              <Text style={styles.scoreSub}>Profil: {profileName || "Anonim"}</Text>
              <View style={{ height: 14 }} />
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Best</Text>
                <Text style={styles.statsVal}>{s.best}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Avg Score</Text>
                <Text style={styles.statsVal}>{avg}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Highest Night</Text>
                <Text style={styles.statsVal}>{s.highestNight}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Sessions</Text>
                <Text style={styles.statsVal}>{s.sessions}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Total Score</Text>
                <Text style={styles.statsVal}>{s.totalScore}</Text>
              </View>
              <View style={{ height: 12 }} />
              <Text style={styles.scoreSub}>Achievements</Text>
              <View style={{ height: 6 }} />
              {ACHIEVEMENTS.filter((a) => (a.name || "").toLowerCase().includes(achievementSearch.trim().toLowerCase()) || !achievementSearch.trim()).map((a) => {
                const on = achievements[a.id];
                return (
                  <View key={a.id} style={styles.achRow}>
                    <Text style={[styles.achName, on && styles.achNameOn]}>{on ? a.name : "??? Locked"}</Text>
                    <Text style={styles.achDesc}>{on ? a.desc : "Deblochează în joc."}</Text>
                  </View>
                );
              })}
              <View style={{ height: 12 }} />
              <Text style={styles.scoreSub}>Contracts</Text>
              <View style={{ height: 6 }} />
              {contracts.length === 0 && <Text style={styles.scoreEmpty}>Niciun contract activ.</Text>}
              {contracts.map((c) => (
                <View key={c.id} style={styles.contractRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contractName}>{c.name}</Text>
                    <Text style={styles.contractDesc}>{c.desc}</Text>
                  </View>
                  <Text style={styles.contractMeta}>
                    {c.progress}/{c.target} • +{c.reward}
                  </Text>
                </View>
              ))}
              <View style={{ height: 10 }} />
              <SoftButton title="ÎNAPOI" onPress={() => setScreen("MENU")} />
            </View>
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (screen === "WORKSHOP") {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={IMG.rooms.holprincipal} style={styles.bg} resizeMode="cover">
          <View style={styles.workshopBackdrop} />
          <ScrollView contentContainerStyle={styles.workshopScroll}>
            <View style={styles.workshopWrap}>
              <View style={styles.workshopHero}>
                <Text style={styles.workshopKicker}>WORKSHOP</Text>
                <Text style={styles.workshopTitle}>Forge & Loadout</Text>
                <Text style={styles.workshopDesc}>Construiește, gestionează inventarul și echipează gadgeturi.</Text>
                <View style={styles.workshopMetaRow}>
                  <View style={styles.workshopMetaPill}>
                    <Text style={styles.workshopMetaTxt}>Credits</Text>
                    <Text style={styles.workshopMetaVal}>{credits}</Text>
                  </View>
                  <View style={styles.workshopMetaPill}>
                    <Text style={styles.workshopMetaTxt}>Inventory</Text>
                    <Text style={styles.workshopMetaVal}>{Object.values(inventory).reduce((s, v) => s + v, 0)}</Text>
                  </View>
                </View>
                <View style={styles.workshopHeroActions}>
                  <SoftButton title="BACK" onPress={() => setScreen("MENU")} />
                  <SoftButton title={spinRunning ? "SPINNING..." : "LUCKY SPIN"} disabled={spinRunning} onPress={runSpin} />
                  {spinResult && <Text style={styles.spinResult}>{spinResult}</Text>}
                </View>
              </View>

              <View style={styles.workshopMain}>
                <View style={styles.workshopSection}>
                  <Text style={styles.sectionTitle}>Craft</Text>
                  <View style={styles.cardGrid}>
                    {GADGET_SHOP.map((g) => {
                      const glow = rarityColor(g.rarity);
                      return (
                        <View key={g.id} style={[styles.itemCard, { borderColor: `${glow}55`, shadowColor: glow }]}>
                          <View style={styles.itemIconWrap}>
                            <View style={[styles.itemIcon, { backgroundColor: `${glow}22`, borderColor: `${glow}66` }]} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={styles.itemTitleRow}>
                              <Text style={styles.itemTitle}>{g.name}</Text>
                              <View style={[styles.rarityPill, { borderColor: glow }]}>
                                <Text style={[styles.rarityTxt, { color: glow }]}>{g.rarity.toUpperCase()}</Text>
                              </View>
                            </View>
                            <Text style={styles.itemDesc}>{g.desc}</Text>
                            <Text style={styles.itemCost}>Cost: {g.cost}</Text>
                          </View>
                          <SoftButton
                            title={credits >= g.cost ? "CRAFT" : "LOW"}
                            disabled={credits < g.cost}
                            onPress={() => {
                              if (credits < g.cost) return;
                              spendCredits(g.cost);
                              addInventory(g.id, 1);
                            }}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>

              <View style={styles.workshopSection}>
                <Text style={styles.sectionTitle}>Loadout</Text>
                <View style={styles.loadoutRow}>
                  {[0, 1].map((slot) => {
                    const g = gadgets[slot];
                    const glow = g ? rarityColor((GADGET_SHOP.find((x) => x.id === g)?.rarity as any) || "common") : "rgba(255,255,255,0.25)";
                    const selected = slot === equipPick?.slot;
                    return (
                      <Pressable
                        key={`slot-${slot}`}
                        style={[
                          styles.slotCard,
                          { borderColor: glow },
                          selected && { shadowColor: glow, shadowOpacity: 0.7, shadowRadius: 14 },
                        ]}
                        onPress={() => {
                          if (equipPick && equipPick.id) {
                            setGadgets((prev) => {
                              const next = [...prev] as Gadget[];
                              next[slot] = equipPick.id;
                              saveSettingsImmediate({ gadgets: next });
                              return next;
                            });
                            setEquipPick(null);
                          }
                        }}
                      >
                        <Text style={styles.slotLabel}>Slot {slot + 1}</Text>
                        <Text style={styles.slotName}>{g ? gadgetLabel(g) : "Empty"}</Text>
                        {selected && <Text style={styles.slotHint}>Tap inventory to assign</Text>}
                        {g && (
                          <Pressable
                            style={styles.slotClear}
                            onPress={() => {
                              setGadgets((prev) => {
                                const next = [...prev] as Gadget[];
                                next[slot] = null;
                                saveSettingsImmediate({ gadgets: next });
                                return next;
                              });
                            }}
                          >
                            <Text style={styles.slotClearTxt}>Remove</Text>
                          </Pressable>
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Inventory</Text>
                <View style={styles.cardGrid}>
                  {GADGET_SHOP.map((g) => {
                    const count = inventory[g.id] ?? 0;
                    const glow = rarityColor(g.rarity);
                    const picked = equipPick && equipPick.id === g.id;
                    const emptySlot = gadgets.findIndex((s) => !s);
                    return (
                      <Pressable
                        key={`inv-${g.id}`}
                        style={[
                          styles.itemCard,
                          styles.itemCardCompact,
                          { borderColor: `${glow}55`, shadowColor: glow },
                          picked && { borderColor: glow, shadowOpacity: 0.8 },
                        ]}
                        onPress={() => {
                          if (count <= 0) return;
                          if (emptySlot !== -1) {
                            setGadgets((prev) => {
                              const next = [...prev] as Gadget[];
                              next[emptySlot] = g.id as Gadget;
                              saveSettingsImmediate({ gadgets: next });
                              return next;
                            });
                            setEquipPick(null);
                          } else {
                            setEquipPick({ id: g.id as Gadget, slot: null });
                          }
                        }}
                        onLongPress={() => {
                          if (count <= 0) return;
                          setEquipPick({ id: g.id as Gadget, slot: null });
                        }}
                      >
                        <View style={[styles.itemIcon, { backgroundColor: `${glow}22`, borderColor: `${glow}66` }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemTitle}>{g.name}</Text>
                          <Text style={styles.itemDesc}>Owned: {count}</Text>
                        </View>
                        <View style={[styles.rarityPill, { borderColor: glow }]}>
                          <Text style={[styles.rarityTxt, { color: glow }]}>{g.rarity.toUpperCase()}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
                {equipPick && (
                  <Text style={styles.pickHint}>Select a slot above to equip {gadgetLabel(equipPick.id)}</Text>
                )}
              </View>

              <View style={styles.workshopSection}>
                <Text style={styles.sectionTitle}>Skill Tree</Text>
                {SKILL_DEFS.map((s) => {
                  const level = skills[s.id] ?? 0;
                  const cost = s.cost * (level + 1);
                  return (
                    <View key={s.id} style={styles.skillRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.skillTitle}>{s.name}</Text>
                        <Text style={styles.skillDesc}>{s.desc}</Text>
                        <Text style={styles.skillMeta}>Level: {level}/3 • Cost: {cost}</Text>
                      </View>
                      <SoftButton
                        title={level >= 3 ? "MAX" : credits >= cost ? "UP" : "LOW"}
                        disabled={level >= 3 || credits < cost}
                        onPress={() => upgradeSkill(s.id)}
                      />
                    </View>
                  );
                })}
              </View>

              {false && (
                <View style={styles.workshopSection}>
                  <Text style={styles.sectionTitle}>Loadout</Text>
                  <View style={styles.loadoutRow}>
                    <View style={styles.loadoutCard}>
                      <Text style={styles.shopMeta}>Slot 1</Text>
                      <Text style={styles.shopSlotVal}>{gadgets[0] ? gadgetLabel(gadgets[0]) : "Empty"}</Text>
                      <SoftButton title="CLEAR" onPress={() => setGadgets((g) => [null, g[1]])} />
                    </View>
                    <View style={styles.loadoutCard}>
                      <Text style={styles.shopMeta}>Slot 2</Text>
                      <Text style={styles.shopSlotVal}>{gadgets[1] ? gadgetLabel(gadgets[1]) : "Empty"}</Text>
                      <SoftButton title="CLEAR" onPress={() => setGadgets((g) => [g[0], null])} />
                    </View>
                  </View>
                </View>
              )}
              </View> {/* end workshopMain */}
            </View>
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (screen === "INTEL") {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={IMG.rooms.holprincipal} style={styles.bg} resizeMode="cover">
          <View style={styles.overlay} />
          <ScrollView contentContainerStyle={styles.intelScroll}>
            <View style={styles.statsWrap}>
              <View style={[styles.statsCard, shadow as any]}>
                <Text style={styles.scoreTitle}>Intel / Bestiary</Text>
                <Text style={styles.scoreSub}>Dezvăluie animatronicii urmărindu-i pe camere.</Text>
                <View style={{ height: 12 }} />
                {CHARACTERS_50.map((c) => {
                  const level = intel[c.id] ?? 0;
                  return (
                    <View key={c.id} style={styles.intelRow}>
                      <Image source={charImg(c.id)} style={styles.intelImg} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.intelName}>{level > 0 ? c.name : "??? Locked"}</Text>
                        <Text style={styles.intelMeta}>Level: {level}/3</Text>
                        <Text style={styles.intelDesc}>
                          {level > 0 ? `${ABILITY_DESC[c.ability]} • Entry: ${c.entry}` : "Urmărește pe camere pentru a debloca."}
                        </Text>
                      </View>
                    </View>
                  );
                })}
                <View style={{ height: 10 }} />
                <SoftButton title="ÎNAPOI" onPress={() => setScreen("MENU")} />
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    );
  }
  if (screen === "ACCOUNT") {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={IMG.rooms[bgPick]} style={styles.bg} resizeMode="cover">
          <View style={styles.overlay} />
          <ScrollView contentContainerStyle={styles.socialWrap}>
            <View style={[styles.statsCard, shadow as any]}>
              <Text style={styles.scoreTitle}>Account</Text>
              <Text style={styles.scoreSub}>Sesiune securizată (server)</Text>
              <View style={{ height: 14 }} />
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Username</Text>
                <Text style={styles.statsVal}>{authUser?.username || profileName || "Anonim"}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Email</Text>
                <Text style={styles.statsVal}>{authUser?.email || "-"}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Status</Text>
                <Text style={styles.statsVal}>{authToken ? "Autentificat" : "Guest"}</Text>
              </View>
              <View style={{ height: 12 }} />
              <Text style={styles.scoreSub}>Profil public</Text>
              <View style={{ height: 8 }} />
              <Image source={resolveAvatarSource(profileAvatar)} style={styles.profileAvatar} />
              <View style={{ height: 8 }} />
              <Text style={styles.loginLabel}>Choose Avatar</Text>
              <View style={styles.avatarGrid}>
                {CHARACTER_CHOICES.map((c) => {
                  const token = `local:${c.id}`;
                  const isOn = profileAvatar === token;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={async () => {
                        setProfileAvatar(token);
                        if (!authToken) return;
                        try {
                          await apiPost("profile_update", { avatarUrl: token, bio: profileBio });
                        } catch {}
                      }}
                      style={[styles.avatarTile, isOn && styles.avatarTileOn]}
                    >
                      <Image source={c.source} style={styles.avatarTileImg} resizeMode="cover" />
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.loginLabel}>Bio</Text>
              <TextInput
                value={profileBio}
                onChangeText={setProfileBio}
                placeholder="Scrie ceva despre tine..."
                placeholderTextColor="rgba(220,220,230,0.45)"
                style={[styles.loginInput, { height: 90, textAlignVertical: "top" }]}
                multiline
              />
              <View style={{ height: 8 }} />
              <Text style={styles.loginLabel}>Display name</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Cum vrei să apari"
                placeholderTextColor="rgba(220,220,230,0.45)"
                style={styles.loginInput}
              />
              <Text style={styles.loginLabel}>Font</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {DISPLAY_FONTS.map((f) => {
                  const on = displayFont === f;
                  return (
                    <Pressable
                      key={f}
                      onPress={() => setDisplayFont(f)}
                      style={[styles.fontChip, on && styles.fontChipOn]}
                    >
                      <Text style={[styles.fontChipTxt, { fontFamily: f === "System" ? undefined : f }]}>{f}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Text style={styles.loginLabel}>Name color (hex)</Text>
              <TextInput
                value={displayColor}
                onChangeText={setDisplayColor}
                placeholder="#EAF2FF"
                placeholderTextColor="rgba(220,220,230,0.45)"
                style={styles.loginInput}
              />
              <Text style={styles.loginLabel}>Banner</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {Object.keys(IMG.rooms).map((k) => {
                  const on = profileBanner === k;
                  return (
                    <Pressable
                      key={k}
                      onPress={() => setProfileBanner(k as any)}
                      style={[styles.bannerTile, on && styles.bannerTileOn]}
                    >
                      <Image source={IMG.rooms[k]} style={styles.bannerImg} />
                      <Text style={styles.bannerLabel}>{k}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Text style={styles.loginLabel}>Background</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {Object.keys(IMG.rooms).map((k) => {
                  const on = profileBackground === k;
                  return (
                    <Pressable
                      key={`bg-${k}`}
                      onPress={() => setProfileBackground(k as any)}
                      style={[styles.bannerTile, on && styles.bannerTileOn]}
                    >
                      <Image source={IMG.rooms[k]} style={styles.bannerImg} />
                      <Text style={styles.bannerLabel}>{k}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <SoftButton
                title="SAVE PROFILE"
                onPress={async () => {
                  try {
                    await apiPost("profile_update", {
                      avatarUrl: profileAvatar,
                      bio: profileBio,
                      displayName,
                      displayFont,
                      displayColor,
                      bannerUrl: profileBanner,
                      backgroundUrl: profileBackground,
                    });
                  } catch {}
                }}
                disabled={!authToken}
              />

              {authUser?.role === "admin" && authUser?.id && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.scoreSub}>Admin tools</Text>
                  <View style={{ height: 6 }} />
                  <Text style={styles.loginHint}>Admin actions sunt in Profile (user).</Text>
                  <View style={{ height: 8 }} />
                  <Text style={styles.loginLabel}>System notice title</Text>
                  <TextInput
                    value={adminNoticeTitle}
                    onChangeText={setAdminNoticeTitle}
                    placeholder="FNAP system update"
                    placeholderTextColor="rgba(220,220,230,0.45)"
                    style={styles.loginInput}
                  />
                  <Text style={styles.loginLabel}>System notice body</Text>
                  <TextInput
                    value={adminNoticeBody}
                    onChangeText={setAdminNoticeBody}
                    placeholder="Message to all players..."
                    placeholderTextColor="rgba(220,220,230,0.45)"
                    style={[styles.loginInput, { height: 90, textAlignVertical: "top" }]}
                    multiline
                  />
                  <Text style={styles.loginLabel}>From</Text>
                  <TextInput
                    value={adminNoticeFrom}
                    onChangeText={setAdminNoticeFrom}
                    placeholder={authUser?.username || "System"}
                    placeholderTextColor="rgba(220,220,230,0.45)"
                    style={styles.loginInput}
                  />
                  <View style={{ height: 6 }} />
                  <SoftButton title="SEND SYSTEM NOTICE" onPress={handleAdminNotifyAll} disabled={!authToken} />
                </View>
              )}

              <View style={{ height: 10 }} />
              <Text style={styles.scoreSub}>Account settings</Text>
              <View style={{ height: 6 }} />
              <Text style={styles.loginLabel}>Username</Text>
              <TextInput
                value={accountUsername}
                onChangeText={setAccountUsername}
                placeholder="username"
                placeholderTextColor="rgba(220,220,230,0.45)"
                style={styles.loginInput}
                autoCapitalize="none"
              />
              <Text style={styles.loginLabel}>Email</Text>
              <TextInput
                value={accountEmail}
                onChangeText={setAccountEmail}
                placeholder="email@domain.com"
                placeholderTextColor="rgba(220,220,230,0.45)"
                style={styles.loginInput}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Text style={styles.loginLabel}>Current password</Text>
              <TextInput
                value={accountCurrentPass}
                onChangeText={setAccountCurrentPass}
                placeholder="current password"
                placeholderTextColor="rgba(220,220,230,0.45)"
                style={styles.loginInput}
                secureTextEntry
              />
              <Text style={styles.loginLabel}>New password</Text>
              <TextInput
                value={accountNewPass}
                onChangeText={setAccountNewPass}
                placeholder="new password"
                placeholderTextColor="rgba(220,220,230,0.45)"
                style={styles.loginInput}
                secureTextEntry
              />
              <View style={{ height: 8 }} />
              {!!accountMsg && <Text style={styles.loginHint}>{accountMsg}</Text>}
              <SoftButton
                title="SAVE ACCOUNT"
                onPress={async () => {
                  if (!authToken) return setScreen("LOGIN");
                  try {
                    setAccountMsg("");
                    const payload = {
                      username: accountUsername.trim() || undefined,
                      email: accountEmail.trim() || undefined,
                      currentPassword: accountCurrentPass || undefined,
                      newPassword: accountNewPass || undefined,
                    };
                    const d = await apiPost("account_update", payload);
                    if (d?.user) setAuthUser((u) => ({ ...(u ?? {}), ...d.user }));
                    if (d?.user?.username) setProfileName(d.user.username);
                    setAccountCurrentPass("");
                    setAccountNewPass("");
                    setAccountMsg("Saved");
                  } catch (e) {
                    setAccountMsg(e?.message || "Update failed");
                  }
                }}
                disabled={!authToken}
              />
              <View style={{ height: 10 }} />
              <Text style={styles.scoreSub}>Featured achievements</Text>
              <View style={{ height: 6 }} />
              <Text style={styles.loginHint}>Select up to 5 in Achievements.</Text>
              <View style={styles.profileStatsRow}>
                {featuredAchievements.map((id) => (
                  <Text key={id} style={styles.profileMeta}>? {ACHIEVEMENTS.find((a) => a.id === id)?.name ?? id}</Text>
                ))}
              </View>
              <SoftButton title="OPEN ACHIEVEMENTS" onPress={() => setScreen("ACHIEVEMENTS")} />
              <Text style={styles.scoreSub}>Acțiuni</Text>
              <View style={{ height: 8 }} />
              <SoftButton title="LOGOUT" tone="bad" onPress={doLogout} disabled={!authToken} />
              <SoftButton title="ÎNAPOI" onPress={() => setScreen("MENU")} />
            </View>
          </ScrollView>
        </ImageBackground>
        <HelpModal />
      </SafeAreaView>
    );
  }

  if (screen === "SEEDS") {
    const canSave = !!authToken && !!seedName.trim();
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={IMG.rooms[bgPick]} style={styles.bg} resizeMode="cover">
          <View style={styles.overlay} />
          <ScrollView contentContainerStyle={styles.seedWrap}>
            <View style={[styles.seedCard, shadow as any]}>
              <Text style={styles.scoreTitle}>Seeds</Text>
              <Text style={styles.scoreSub}>Salveaz? set?rile tale ca seed.</Text>
              <View style={{ height: 10 }} />
              <Text style={styles.loginLabel}>Seed name</Text>
              <TextInput
                value={seedName}
                onChangeText={setSeedName}
                placeholder="Night 2 - Hard"
                placeholderTextColor="rgba(220,220,230,0.45)"
                style={styles.loginInput}
              />
              <View style={{ height: 8 }} />
              <View style={styles.seedMetaRow}>
                <Text style={styles.seedMeta}>Current seed: {currentSeed || "-"}</Text>
                <Text style={styles.seedMeta}>Mode: {mode}</Text>
                <Text style={styles.seedMeta}>Difficulty: {difficultyPreset}</Text>
              </View>
              <View style={{ height: 8 }} />
              <SoftButton
                title={seedBusy ? "SAVING..." : "SAVE SEED"}
                tone="good"
                disabled={!canSave || seedBusy}
                onPress={async () => {
                  if (!authToken) return setScreen("LOGIN");
                  try {
                    setSeedBusy(true);
                    const cfg = buildSettings();
                    const seedVal = currentSeed || String(seedFromDate(dateKey()));
                    await apiPost("seed_create", {
                      name: seedName.trim(),
                      seed: seedVal,
                      mode,
                      difficulty: difficultyPreset,
                      config: cfg,
                    });
                    setSeedName("");
                    const sl = await apiGet("seeds_list");
                    setSeeds(sl?.seeds ?? []);
                  } catch {}
                  setSeedBusy(false);
                }}
              />
              {!authToken && <Text style={styles.loginHint}>Trebuie s? fii logat.</Text>}
            </View>

            <View style={[styles.seedCard, shadow as any]}>
              <Text style={styles.scoreSub}>Seeds saved</Text>
              <View style={{ height: 8 }} />
              {seeds.length === 0 && <Text style={styles.scoreEmpty}>Niciun seed salvat.</Text>}
              {seeds.map((s) => (
                <View key={s.id} style={styles.seedRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.seedName}>{s.name}</Text>
                    <Text style={styles.seedMeta}>Seed: {s.seed} | {s.mode} | {s.difficulty}</Text>
                  </View>
                  <SoftButton
                    title="LOAD"
                    onPress={() => {
                      const cfg = parseJson(s.config);
                      if (cfg) applySettings(cfg);
                      setCurrentSeed(String(s.seed));
                      setScreen("MENU");
                    }}
                  />
                </View>
              ))}
              <View style={{ height: 8 }} />
              <SoftButton title="?NAPOI" onPress={() => setScreen("MENU")} />
            </View>
            <View style={[styles.seedCard, shadow as any]}>
              <Text style={styles.scoreSub}>Public Seeds</Text>
              <View style={{ height: 8 }} />
              <TextInput
                value={seedSearch}
                onChangeText={setSeedSearch}
                placeholder="Search seeds..."
                placeholderTextColor="rgba(220,220,230,0.45)"
                style={styles.loginInput}
                autoCapitalize="none"
              />
              <View style={{ height: 8 }} />
              {publicSeeds
                .filter((s) => {
                  const q = seedSearch.trim().toLowerCase();
                  if (!q) return true;
                  return String(s.name).toLowerCase().includes(q) || String(s.username || "").toLowerCase().includes(q);
                })
                .map((s) => (
                  <View key={s.id} style={styles.seedRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.seedName}>
                        {s.name}{s.verified ? " [V]" : ""}
                      </Text>
                      <Text style={styles.seedMeta}>by {s.username} | {s.mode} | {s.difficulty}</Text>
                    </View>
                    <SoftButton
                      title="LOAD"
                      onPress={() => {
                        const cfg = parseJson(s.config);
                        if (cfg) applySettings(cfg);
                        setCurrentSeed(String(s.seed));
                        setScreen("MENU");
                      }}
                    />
                  </View>
                ))}
            </View>
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    );
  }




  if (screen === "SOCIAL") {
    const isWide = SW > 1100;
    const isMid = SW > 900;
    return (
      <>
        <FeedScreen
          profileSearch={profileSearch}
          feedSearch={feedSearch}
          postBody={postBody}
          posts={posts}
          polls={polls}
          socialLoading={socialLoading}
          profileResults={profileResults}
          commentsByPost={commentsByPost}
          commentDrafts={commentDraft}
          commentReplyTo={commentReplyTo}
          authToken={authToken}
          authUserId={authUser?.id}
          authUsername={authUser?.username}
          authBadges={badgesSelected}
          isWide={isWide}
          isMid={isMid}
          isAdmin={isAdminUser}
          badgeMeta={badgeMeta}
          recents={recents}
          onProfileSearchChange={setProfileSearch}
          onFeedSearchChange={setFeedSearch}
          onPostBodyChange={setPostBody}
          onCreatePost={handleCreatePost}
          onCreatePoll={handleCreatePoll}
          onVotePoll={handleVotePoll}
          onDeletePoll={handleDeletePoll}
          onFollowToggle={handleFollowToggle}
          onLikeToggle={handleLikeToggle}
          onFavoriteToggle={handleFavoriteToggle}
          onFetchComments={handleFetchComments}
          onAddComment={handleAddComment}
          onCommentDraftChange={(postId, value) => setCommentDraft((d) => ({ ...d, [postId]: value }))}
          onSetCommentReplyTo={(postId, commentId) => setCommentReplyTo((r) => ({ ...r, [postId]: commentId }))}
          onOpenProfile={openProfile}
          onAddRecent={addRecent}
          onRemoveRecent={removeRecent}
          onOpenMessages={() => setScreen("MESSAGES")}
          onOpenNotifications={() => setScreen("NOTIFS")}
          onDeletePost={handleDeletePost}
          onEditPost={handleEditPost}
          onDeleteComment={handleDeleteComment}
          onBack={() => setScreen("MENU")}
          onNavHome={navHome}
          onNavMessages={navMessages}
          onNavExplore={navExplore}
          onNavSettings={navSettings}
        />
        <HelpModal />
      </>
    );
  }

  if (screen === "SPIN") {
    const itemW = 150;
  const startAnimatedSpin = () => {
    if (spinRunning) return;
    const now = Date.now();
    if (spinCooldownUntil.current && now < spinCooldownUntil.current) {
      setSpinResult("Așteaptă 3s între spin-uri");
      return;
    }
    if (now - lastSpinTs.current < 500) return; // debounce accidental double tap
    if (credits < spinBet) {
      setSpinResult("Insufficient credits");
      return;
    }
    lastSpinTs.current = now;
    // pick an index directly (keeps visual stop in sync with reward)
      const weights = spinStrip.map((r) => {
        const base =
          r.rarity === "mythic" ? 1 : r.rarity === "legendary" ? 2 : r.rarity === "epic" ? 4 : r.rarity === "rare" ? 8 : 12;
        const boost = 1 + spinBet / 200; // higher bet => higher chance high tiers
        const high = r.rarity === "mythic" || r.rarity === "legendary" ? boost : 1;
        return base * high;
      });
      const total = weights.reduce((a, b) => a + b, 0);
      let roll = rand() * total;
      let pickIndex = 0;
      for (let i = 0; i < spinStrip.length; i++) {
        if ((roll -= weights[i]) <= 0) {
          pickIndex = i;
          break;
        }
      }
      const reward = spinStrip[pickIndex];
      setCredits((c) => {
        const next = Math.max(0, c - spinBet);
        saveSettingsImmediate({ credits: next });
        return next;
      });
      // add extra distance before landing for visual spin
      const loopOffset = Math.floor(spinStrip.length * 0.5);
      const targetIndex = loopOffset + pickIndex;
      const target = -(targetIndex * itemW) + 240;
      spinTargetRef.current = target;
      spinAnim.setValue(0);
      Animated.timing(spinAnim, {
        toValue: target,
        duration: 5200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setSpinHitId(reward.id);
        runSpin(reward, spinBet);
      });
    };
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={IMG.rooms.holprincipal} style={styles.bg} resizeMode="cover">
          <View style={styles.overlayStrong} />
          <View style={styles.spinWrap}>
            <Text style={styles.spinTitle}>Lucky Spin</Text>
            <Text style={styles.spinSub}>Rulează roata pentru credite & gadgeturi</Text>

            <View style={styles.spinWindow}>
              <Animated.View style={{ flexDirection: "row", transform: [{ translateX: spinAnim }] }}>
                {spinStrip.map((r, i) => {
                  const glow = rarityColor(r.rarity as any);
                  return (
                    <View
                      key={`${r.id}-${i}`}
                      style={[
                        styles.spinItem,
                        { width: itemW, borderColor: `${glow}66` },
                        spinHitId === r.id && { transform: [{ scale: 1.08 }], shadowColor: glow, shadowOpacity: 0.8, shadowRadius: 14 },
                      ]}
                    >
                      <Text style={[styles.spinItemName, { color: glow }]}>{r.label}</Text>
                      <Text style={styles.spinItemRarity}>{r.rarity.toUpperCase()}</Text>
                    </View>
                  );
                })}
              </Animated.View>
              <View style={styles.spinIndicator} />
            </View>

            <View style={styles.spinActions}>
              <SoftButton title="Back" onPress={() => setScreen("MENU")} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <SoftButton title="−" onPress={() => setSpinBet((b) => Math.max(25, b - 25))} />
                <Text style={styles.spinBetText}>Bet: {spinBet}</Text>
                <SoftButton title="+" onPress={() => setSpinBet((b) => Math.min(credits, b + 25))} />
                <SoftButton title="MAX" onPress={() => setSpinBet(Math.max(25, credits))} />
                <SoftButton
                  title="SKIP"
                  onPress={() => {
                    if (spinRunning) {
                      spinAnim.stopAnimation((cur) => {
                        Animated.timing(spinAnim, {
                          toValue: spinTargetRef.current || cur || 0,
                          duration: 600,
                          easing: Easing.out(Easing.cubic),
                          useNativeDriver: true,
                        }).start();
                      });
                    }
                  }}
                  disabled={!spinRunning}
                />
              </View>
              <SoftButton title={spinRunning ? "Spinning..." : "Spin"} onPress={startAnimatedSpin} disabled={spinRunning} />
            </View>
            <Text style={styles.spinPity}>Pity: {spinPity}</Text>
            {spinResult && <Text style={styles.spinResult}>{spinResult}</Text>}
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (screen === "ADMIN") {
    if (!isAdminUser) {
      return (
        <SafeAreaView style={styles.root}>
          <StatusBar barStyle="light-content" />
          <ImageBackground source={IMG.rooms[bgPick]} style={styles.bg} resizeMode="cover">
            <View style={styles.overlayStrong} />
            <View style={[styles.socialWrap, { flex: 1, justifyContent: "center" }]}>
              <View style={[styles.statsCard, shadow as any]}>
                <Text style={styles.scoreTitle}>Admin Panel</Text>
                <Text style={styles.scoreSub}>Acces doar pentru admini.</Text>
                <View style={{ height: 12 }} />
                <SoftButton title="Înapoi" onPress={() => setScreen("MENU")} />
              </View>
            </View>
          </ImageBackground>
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={IMG.rooms[bgPick]} style={styles.bg} resizeMode="cover">
          <View style={styles.overlayStrong} />
          <ScrollView contentContainerStyle={styles.socialWrap}>
            <View style={[styles.statsCard, shadow as any]}>
              <Text style={styles.scoreTitle}>Admin Panel</Text>
              <Text style={styles.scoreSub}>Doar pentru admini</Text>
              <View style={{ height: 12 }} />

              <Text style={styles.sectionTitle}>System notice</Text>
              <Text style={styles.loginLabel}>Title</Text>
              <TextInput
                value={adminNoticeTitle}
                onChangeText={setAdminNoticeTitle}
                placeholder="FNAP system update"
                placeholderTextColor="rgba(220,220,230,0.45)"
                style={styles.loginInput}
              />
              <Text style={styles.loginLabel}>Body</Text>
              <TextInput
                value={adminNoticeBody}
                onChangeText={setAdminNoticeBody}
                placeholder="Mesaj pentru toți utilizatorii"
                placeholderTextColor="rgba(220,220,230,0.45)"
                style={[styles.loginInput, { height: 90, textAlignVertical: "top" }]}
                multiline
              />
              <View style={styles.adminActionsRow}>
                <SoftButton title="TRIMITE" onPress={handleAdminNotifyAll} disabled={!adminNoticeBody.trim()} />
              </View>

              <View style={{ height: 18 }} />
              <Text style={styles.sectionTitle}>Set credits</Text>
              <Text style={styles.loginLabel}>Username</Text>
              <TextInput
                value={adminCreditUser}
                onChangeText={setAdminCreditUser}
                placeholder="user"
                placeholderTextColor="rgba(220,220,230,0.45)"
                style={styles.loginInput}
              />
              <Text style={styles.loginLabel}>Credits</Text>
              <TextInput
                value={adminCreditAmount}
                onChangeText={setAdminCreditAmount}
                keyboardType="numeric"
                placeholder="1000"
                placeholderTextColor="rgba(220,220,230,0.45)"
                style={styles.loginInput}
              />
              <View style={styles.adminActionsRow}>
                <SoftButton
                  title="APLICĂ"
                  onPress={async () => {
                    if (!adminCreditUser.trim()) return;
                    const amount = parseInt(adminCreditAmount, 10) || 0;
                    setAdminStatus("...");
                    try {
                      await apiPost("admin_set_credits", { username: adminCreditUser.trim(), credits: amount });
                      setAdminStatus(`Setat ${amount} credite pentru ${adminCreditUser.trim()}`);
                    } catch (e: any) {
                      setAdminStatus(e?.message || "Eroare");
                    }
                  }}
                />
              </View>

              <View style={{ height: 18 }} />
              <Text style={styles.sectionTitle}>Home feed</Text>
              <Text style={styles.scoreSub}>Admin edit pentru COMM_FEED (op?ional imagine din site).</Text>
              <View style={{ height: 10 }} />
              {(adminFeedDraft.length ? adminFeedDraft : [{ id: "feed-1", tag: "", title: "", desc: "", imageKey: "" }]).map(
                (item: any, idx: number) => (
                  <View key={item?.id || idx} style={styles.adminFeedCard}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <Text style={styles.loginLabel}>Item #{idx + 1}</Text>
                      <Pressable
                        onPress={() =>
                          setAdminFeedDraft((arr) =>
                            (arr.length ? arr : [{ id: `feed-${idx + 1}` }]).filter((_, i) => i !== idx)
                          )
                        }
                        style={[styles.menuPill, { borderColor: "#ff6b6b", backgroundColor: "rgba(255,107,107,0.12)" }]}
                      >
                        <Text style={styles.menuPillText}>REMOVE</Text>
                      </Pressable>
                    </View>
                    <Text style={styles.loginLabel}>Tag</Text>
                    <TextInput
                      value={item?.tag || ""}
                      onChangeText={(v) =>
                        setAdminFeedDraft((arr) =>
                          (arr.length ? arr : [{ id: `feed-${idx + 1}` }]).map((it, i) =>
                            i === idx ? { ...it, tag: v } : it
                          )
                        )
                      }
                      placeholder="SYSTEM UPDATE"
                      placeholderTextColor="rgba(220,220,230,0.45)"
                      style={styles.loginInput}
                    />
                    <Text style={styles.loginLabel}>Title</Text>
                    <TextInput
                      value={item?.title || ""}
                      onChangeText={(v) =>
                        setAdminFeedDraft((arr) =>
                          (arr.length ? arr : [{ id: `feed-${idx + 1}` }]).map((it, i) =>
                            i === idx ? { ...it, title: v } : it
                          )
                        )
                      }
                      placeholder="PATCH 2.0.4"
                      placeholderTextColor="rgba(220,220,230,0.45)"
                      style={styles.loginInput}
                    />
                    <Text style={styles.loginLabel}>Desc</Text>
                    <TextInput
                      value={item?.desc || ""}
                      onChangeText={(v) =>
                        setAdminFeedDraft((arr) =>
                          (arr.length ? arr : [{ id: `feed-${idx + 1}` }]).map((it, i) =>
                            i === idx ? { ...it, desc: v } : it
                          )
                        )
                      }
                      placeholder="Text scurt..."
                      placeholderTextColor="rgba(220,220,230,0.45)"
                      style={[styles.loginInput, { height: 70, textAlignVertical: "top" }]}
                      multiline
                    />
                    <Text style={styles.loginLabel}>Image key (optional)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                      {HOME_FEED_LIBRARY.map((opt) => (
                        <Pressable
                          key={opt.key}
                          onPress={() =>
                            setAdminFeedDraft((arr) =>
                              (arr.length ? arr : [{ id: `feed-${idx + 1}` }]).map((it, i) =>
                                i === idx ? { ...it, imageKey: opt.key } : it
                              )
                            )
                          }
                          style={[
                            styles.menuPill,
                            item?.imageKey === opt.key && { borderColor: "#58f1c2", backgroundColor: "rgba(88,241,194,0.16)" },
                          ]}
                        >
                          <Text style={styles.menuPillText}>{opt.label}</Text>
                        </Pressable>
                      ))}
                      <Pressable
                        onPress={() =>
                          setAdminFeedDraft((arr) =>
                            (arr.length ? arr : [{ id: `feed-${idx + 1}` }]).map((it, i) =>
                              i === idx ? { ...it, imageKey: "" } : it
                            )
                          )
                        }
                        style={[
                          styles.menuPill,
                          !item?.imageKey && { borderColor: "#ffc857", backgroundColor: "rgba(255,200,87,0.18)" },
                        ]}
                      >
                        <Text style={styles.menuPillText}>No image</Text>
                      </Pressable>
                    </ScrollView>
                  </View>
                )
              )}
              <View style={styles.adminActionsRow}>
                <SoftButton
                  title="ADD ITEM"
                  onPress={() =>
                    setAdminFeedDraft((arr) => [
                      ...(arr || []),
                      { id: `feed-${(arr?.length || 0) + 1}`, tag: "", title: "", desc: "", imageKey: "" },
                    ])
                  }
                />
                <SoftButton title="SAVE FEED" onPress={handleAdminSaveHomeFeed} />
              </View>

              {adminStatus ? <Text style={styles.loginHint}>{adminStatus}</Text> : null}
            </View>
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (screen === "CHALLENGES") {
    const diffVal = Number(challengeDiff) || 0;
    const rewardVal = challengeRewardGadget ? 10 : 0;
    const gearPenalty = Math.max(0, challengeGearAllowed.length - 2) * 5 + challengeGearFree.length * 2;
    const charPenalty = Math.min(120, challengeChars.length * 8);
    const flagPenalty =
      (challengeFlags.camera ? 0 : 8) +
      (challengeFlags.doorL ? 0 : 10) +
      (challengeFlags.doorR ? 0 : 10) +
      (challengeFlags.music ? 0 : 6) +
      (challengeFlags.vents ? 0 : 8);
    const autoDifficulty = Math.min(200, diffVal + gearPenalty + charPenalty + flagPenalty);
    const tier =
      autoDifficulty >= 170
        ? "IMPOSSIBLE DEMON"
        : autoDifficulty >= 150
        ? "EXTREME"
        : autoDifficulty >= 130
        ? "INSANE"
        : autoDifficulty >= 110
        ? "DEMON"
        : autoDifficulty >= 90
        ? "HARD"
        : autoDifficulty >= 60
        ? "MEDIUM"
        : "EASY";
    const tierColor =
      tier === "IMPOSSIBLE DEMON"
        ? "#ff4d6d"
        : tier === "EXTREME"
        ? "#ff784f"
        : tier === "INSANE"
        ? "#ff9f1c"
        : tier === "DEMON"
        ? "#f72585"
        : tier === "HARD"
        ? "#ffb703"
        : tier === "MEDIUM"
        ? "#4cc9f0"
        : "#8bc34a";
    const charNameSize = SW < 600 ? 10 : SW < 900 ? 11 : 12;
    const charMetaSize = SW < 600 ? 9 : SW < 900 ? 10 : 11;
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={IMG.rooms[bgPick]} style={styles.bg} resizeMode="cover">
          <View style={styles.overlayStrong} />
          <ScrollView contentContainerStyle={styles.socialWrap}>
            <View style={[styles.statsCard, shadow as any]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <View>
                  <Text style={styles.scoreTitle}>Challenges</Text>
                  <Text style={styles.scoreSub}>Daily / weekly / custom cu leaderboard</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  <SoftButton title="Listă" onPress={() => setChallengeTab("list")} disabled={challengeTab === "list"} />
                  <SoftButton title="Create" onPress={() => setChallengeTab("create")} disabled={challengeTab === "create"} />
                  <SoftButton title="Înapoi" onPress={() => setScreen("MENU")} />
                </View>
              </View>
            </View>

            {challengeTab === "create" && authToken && (
              <View style={[styles.statsCard, shadow as any]}>
                <Text style={styles.sectionTitle}>Creează challenge</Text>
                <TextInput
                  value={challengeTitle}
                  onChangeText={setChallengeTitle}
                  placeholder="Titlu"
                  placeholderTextColor="rgba(220,220,230,0.45)"
                  style={styles.loginInput}
                />
                <Text style={styles.loginLabel}>Font titlu</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                  {DISPLAY_FONTS.map((f) => (
                    <Pressable
                      key={f}
                      onPress={() => setChallengeFont(f)}
                      style={[
                        styles.menuPill,
                        challengeFont === f && { borderColor: "#7ee0ff", backgroundColor: "rgba(126,224,255,0.16)" },
                      ]}
                    >
                      <Text style={[styles.menuPillText, { fontFamily: f }]}>{f}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <TextInput
                  value={challengeDesc}
                  onChangeText={setChallengeDesc}
                  placeholder="Descriere (opțional)"
                  placeholderTextColor="rgba(220,220,230,0.45)"
                  style={[styles.loginInput, { height: 70, textAlignVertical: "top" }]}
                  multiline
                />
                <Text style={styles.loginLabel}>Reward (alege gadget)</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {GADGET_SHOP.map((g) => {
                    const active = challengeRewardGadget === g.id;
                    return (
                      <Pressable
                        key={g.id}
                        onPress={() => setChallengeRewardGadget(active ? "" : g.id)}
                        style={[
                          styles.menuPill,
                          active && { borderColor: "#58f1c2", backgroundColor: "rgba(88,241,194,0.16)" },
                        ]}
                      >
                        <Text style={styles.menuPillText}>{g.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.loginLabel}>Preset name (opțional)</Text>
                <TextInput
                  value={challengePreset}
                  onChangeText={setChallengePreset}
                  placeholder="Preset de pornire"
                  placeholderTextColor="rgba(220,220,230,0.45)"
                  style={styles.loginInput}
                />
                <Text style={styles.loginLabel}>Animatronici (selectează)</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  {CHARACTERS_50.map((c) => {
                    const active = challengeChars.includes(c.id);
                    const img = charImg(c.id);
                    return (
                      <Pressable
                        key={c.id}
                        onPress={() =>
                          setChallengeChars((prev) => (prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id]))
                        }
                        style={[
                          styles.statsCard,
                          {
                            width: "10%",
                            padding: 0,
                            overflow: "hidden",
                            borderColor: active ? "#7ee0ff" : "rgba(255,255,255,0.08)",
                          },
                        ]}
                      >
                        <ImageBackground source={img} style={{ height: 120, width: "100%" }} resizeMode="cover" />
                        <View style={{ padding: 10, gap: 4 }}>
                          <Text style={[styles.sectionTitle, { fontSize: charNameSize }]}>{c.name}</Text>
                          <Text style={[styles.loginHint, { fontSize: charMetaSize }]}>{ABILITY_DESC[c.ability]}</Text>
                          <Text style={[styles.loginHint, { fontSize: charMetaSize }]}>
                            Entry: {c.entry} • Diff {c.difficulty}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.loginLabel}>Allowed gear</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {GADGET_SHOP.map((g) => {
                    const active = challengeGearAllowed.includes(g.id);
                    return (
                      <Pressable
                        key={g.id}
                        onPress={() =>
                          setChallengeGearAllowed((prev) => (prev.includes(g.id) ? prev.filter((x) => x !== g.id) : [...prev, g.id]))
                        }
                        style={[
                          styles.menuPill,
                          active && { borderColor: "#58f1c2", backgroundColor: "rgba(88,241,194,0.16)" },
                        ]}
                      >
                        <Text style={styles.menuPillText}>{g.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.loginLabel}>Free gear (max 2)</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {GADGET_SHOP.map((g) => {
                    const active = challengeGearFree.includes(g.id);
                    return (
                      <Pressable
                        key={g.id}
                        onPress={() =>
                          setChallengeGearFree((prev) => {
                            if (prev.includes(g.id)) return prev.filter((x) => x !== g.id);
                            if (prev.length >= 2) return prev;
                            return [...prev, g.id];
                          })
                        }
                        style={[
                          styles.menuPill,
                          active && { borderColor: "#ffc857", backgroundColor: "rgba(255,200,87,0.18)" },
                        ]}
                      >
                        <Text style={styles.menuPillText}>{g.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.loginLabel}>Sisteme active</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {[
                    { id: "camera", label: "Camera" },
                    { id: "doorL", label: "Door L" },
                    { id: "doorR", label: "Door R" },
                    { id: "music", label: "Music" },
                    { id: "vents", label: "Vents" },
                  ].map((f) => {
                    const active = (challengeFlags as any)[f.id];
                    return (
                      <Pressable
                        key={f.id}
                        onPress={() => setChallengeFlags((p) => ({ ...p, [f.id]: !p[f.id] }))}
                        style={[
                          styles.menuPill,
                          active && { borderColor: "#7ee0ff", backgroundColor: "rgba(126,224,255,0.16)" },
                        ]}
                      >
                        <Text style={styles.menuPillText}>{active ? f.label : `No ${f.label}`}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.loginLabel}>Public / Privat</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable
                    onPress={() => setChallengePrivate(false)}
                    style={[
                      styles.menuPill,
                      !challengePrivate && { borderColor: "#58f1c2", backgroundColor: "rgba(88,241,194,0.16)" },
                    ]}
                  >
                    <Text style={styles.menuPillText}>Public</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setChallengePrivate(true)}
                    style={[
                      styles.menuPill,
                      challengePrivate && { borderColor: "#ffc857", backgroundColor: "rgba(255,200,87,0.18)" },
                    ]}
                  >
                    <Text style={styles.menuPillText}>Privat</Text>
                  </Pressable>
                </View>
                {challengePrivate && (
                  <>
                    <Text style={styles.loginLabel}>Cod acces</Text>
                    <TextInput
                      value={challengeAccessCode}
                      onChangeText={setChallengeAccessCode}
                      placeholder="ex: FNAP123"
                      placeholderTextColor="rgba(220,220,230,0.45)"
                      style={styles.loginInput}
                    />
                  </>
                )}
                <Text style={styles.loginLabel}>Thumbnail & icon</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {Object.keys(IMG.rooms).slice(0, 10).map((k) => (
                    <Pressable
                      key={k}
                      onPress={() => setChallengeThumb(k)}
                      style={[styles.menuPill, challengeThumb === k && { borderColor: "#58f1c2", backgroundColor: "rgba(88,241,194,0.16)" }]}
                    >
                      <Text style={styles.menuPillText}>{k}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                  {Object.keys(IMG.rooms).slice(10, 18).map((k) => (
                    <Pressable
                      key={k}
                      onPress={() => setChallengeIcon(k)}
                      style={[styles.menuPill, challengeIcon === k && { borderColor: "#ffc857", backgroundColor: "rgba(255,200,87,0.18)" }]}
                    >
                      <Text style={styles.menuPillText}>{k}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.loginLabel}>Dificultate de bază (0-200)</Text>
                <TextInput
                  value={challengeDiff}
                  onChangeText={setChallengeDiff}
                  placeholder="50"
                  keyboardType="numeric"
                  placeholderTextColor="rgba(220,220,230,0.45)"
                  style={styles.loginInput}
                />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 }}>
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: `${tierColor}80`,
                      backgroundColor: `${tierColor}20`,
                    }}
                  >
                    <Text style={{ color: tierColor, fontWeight: "900" }}>
                      {tier} • scor {autoDifficulty}
                    </Text>
                    <Text style={styles.loginHint}>+{Math.floor(rewardVal / 50)} (reward) +{gearPenalty} (gear lock)</Text>
                  </View>
                </View>
                <View style={{ height: 12 }} />
                <Text style={styles.loginLabel}>Preview competiție</Text>
                <View style={[styles.statsCard, shadow as any, { padding: 10 }]}>
                  <ImageBackground
                    source={IMG.rooms[challengeThumb] ?? IMG.rooms.back1}
                    style={{ height: 110, borderRadius: 12, overflow: "hidden", justifyContent: "flex-end" }}
                    resizeMode="cover"
                  >
                    <View style={{ padding: 8, backgroundColor: "rgba(5,10,18,0.55)" }}>
                      <Text style={[styles.sectionTitle, { fontFamily: challengeFont, fontSize: 14 }]}>{challengeTitle || "Titlu challenge"}</Text>
                      <Text style={styles.loginHint}>
                        {challengeType.toUpperCase()} • {tier} • Reward: {challengeRewardGadget || "—"}
                      </Text>
                    </View>
                  </ImageBackground>
                  <Text style={[styles.loginHint, { marginTop: 6 }]}>
                    {challengeDesc || "Descriere…"} • Animatronici: {challengeChars.length} • Gear: {challengeGearAllowed.length} (+{challengeGearFree.length} free)
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {(["daily", "weekly", "custom"] as const).map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => setChallengeType(t)}
                      style={[
                        styles.menuPill,
                        challengeType === t && { borderColor: "#58f1c2", backgroundColor: "rgba(88,241,194,0.12)" },
                      ]}
                    >
                      <Text style={styles.menuPillText}>{t.toUpperCase()}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={{ height: 10 }} />
                <View style={styles.adminActionsRow}>
                  <SoftButton title="CREEAZĂ" onPress={createChallenge} />
                  <SoftButton title="REFRESH" onPress={fetchChallenges} />
                </View>
                {challengeStatus ? <Text style={styles.loginHint}>{challengeStatus}</Text> : null}
              </View>
            )}

            {challengeTab === "list" &&
              challenges.map((c) => {
                const diff = Number(c.difficulty_score) || 0;
                const tier =
                  diff >= 170
                  ? "IMPOSSIBLE DEMON"
                  : diff >= 150
                  ? "EXTREME"
                  : diff >= 130
                  ? "INSANE"
                  : diff >= 110
                  ? "DEMON"
                  : diff >= 90
                  ? "HARD"
                  : diff >= 60
                  ? "MEDIUM"
                  : "EASY";
              const tierColor =
                tier === "IMPOSSIBLE DEMON"
                  ? "#ff4d6d"
                  : tier === "EXTREME"
                  ? "#ff784f"
                  : tier === "INSANE"
                  ? "#ff9f1c"
                  : tier === "DEMON"
                  ? "#f72585"
                  : tier === "HARD"
                  ? "#ffb703"
                  : tier === "MEDIUM"
                  ? "#4cc9f0"
                  : "#8bc34a";
                return (
                  <Pressable
                    key={c.id}
                    style={[styles.statsCard, shadow as any]}
                    onPress={() => {
                      setChallengeSelected(c);
                      setChallengeTab("detail");
                    }}
                  >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View>
                      <Text style={styles.sectionTitle}>{c.title}</Text>
                      <Text style={styles.loginHint}>
                        {c.type?.toUpperCase()} • de {c.creator || "anon"} • expira {c.expires_at?.slice(0, 10)}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: `${tierColor}80`,
                        backgroundColor: `${tierColor}22`,
                      }}
                    >
                      <Text style={{ color: tierColor, fontWeight: "900", fontSize: 12 }}>{tier}</Text>
                    </View>
                  </View>
                  {c.pinned ? <Text style={[styles.loginHint, { color: "#ffc857" }]}>PINNED</Text> : null}
                  {c.description ? <Text style={styles.loginLabel}>{c.description}</Text> : null}
                  <View style={{ height: 6 }} />
                  <Text style={styles.loginHint}>
                    Reward: {c.reward_credits || 0} credits{c.reward_gadget ? ` + ${c.reward_gadget}` : ""} • Preset:{" "}
                    {c.preset_name || "liber"} {c.gear_lock ? "• Gear restricționat" : ""}
                  </Text>
                  <View style={{ height: 8 }} />
                  <Text style={styles.scoreSub}>Top</Text>
                  {Array.isArray(c.leaderboard) && c.leaderboard.length ? (
                    c.leaderboard.slice(0, 5).map((row, idx) => (
                      <View key={row.user_id + idx} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={styles.loginLabel}>
                          #{idx + 1} {row.username}
                        </Text>
                        <Text style={styles.loginHint}>{row.score}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.loginHint}>Nimic încă</Text>
                  )}
                  {isAdminUser && (
                    <View style={styles.adminActionsRow}>
                      <Pressable
                        onPress={async () => {
                          try {
                            await apiPost("challenge_pin", { challengeId: c.id, pinned: !c.pinned });
                            fetchChallenges();
                          } catch {}
                        }}
                        style={[styles.iconPill, { backgroundColor: "rgba(255,255,255,0.06)" }]}
                      >
                        <Text style={styles.menuPillText}>{c.pinned ? "UNPIN" : "PIN"}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleAdminDeleteChallenge(c.id)}
                        style={[styles.iconPill, { backgroundColor: "rgba(255,80,80,0.15)" }]}
                      >
                        <Text style={[styles.menuPillText, { color: "#ff8a8a" }]}>DELETE</Text>
                      </Pressable>
                    </View>
                  )}
                </Pressable>
              );
            })}
            {challengeTab === "detail" && challengeSelected && (
              <View style={[styles.statsCard, shadow as any]}>
                <Text style={styles.sectionTitle}>Detalii challenge</Text>
                <Text style={styles.loginLabel}>{challengeSelected.title}</Text>
                <Text style={styles.loginHint}>{challengeSelected.description || "Fără descriere"}</Text>
                <Text style={styles.loginHint}>
                  Reward: {challengeSelected.reward_credits || 0} credite{" "}
                  {challengeSelected.reward_gadget ? `+ ${challengeSelected.reward_gadget}` : ""}
                </Text>
                <Text style={styles.loginHint}>Preset: {challengeSelected.preset_name || "liber"}</Text>
                <Text style={styles.loginHint}>
                  Gear:{" "}
                  {challengeSelected.gear_lock?.allowed?.length
                    ? challengeSelected.gear_lock.allowed.join(", ")
                    : challengeSelected.settings?.allowedGear?.length
                    ? challengeSelected.settings.allowedGear.join(", ")
                    : "liber"}
                </Text>
                <Text style={styles.loginHint}>
                  Free gear:{" "}
                  {challengeSelected.gear_lock?.free?.length
                    ? challengeSelected.gear_lock.free.join(", ")
                    : challengeSelected.settings?.freeGear?.length
                    ? challengeSelected.settings.freeGear.join(", ")
                    : "none"}
                </Text>
                <Text style={styles.loginHint}>
                  Animatronici: {challengeSelected.settings?.animatronics ? challengeSelected.settings.animatronics.join(", ") : "liber"}
                </Text>
                {challengeSelected.is_private && (
                  <>
                    <Text style={styles.loginLabel}>Cod acces</Text>
                    <TextInput
                      value={challengeJoinCode}
                      onChangeText={setChallengeJoinCode}
                      placeholder="cod"
                      placeholderTextColor="rgba(220,220,230,0.45)"
                      style={styles.loginInput}
                    />
                  </>
                )}
                <View style={styles.adminActionsRow}>
                  {!challengeJoinedIds.includes(challengeSelected.id) ? (
                    <SoftButton
                      title={challengeSelected.is_private ? "JOIN (CODE)" : "JOIN CHALLENGE"}
                      onPress={async () => {
                        if (challengeSelected.is_private && !challengeJoinCode) {
                          setChallengeStatus("Cod necesar pentru private.");
                          return;
                        }
                        try {
                          await apiPost("challenge_join", {
                            challengeId: challengeSelected.id,
                            code: challengeSelected.is_private ? challengeJoinCode : null,
                          });
                          setChallengeJoinedIds((prev) => [...prev, challengeSelected.id]);
                          setChallengeStatus("Înscris!");
                        } catch (e: any) {
                          setChallengeStatus(e?.message || "Cod invalid.");
                        }
                      }}
                    />
                  ) : (
                    <SoftButton
                      title="PLAY"
                      onPress={() => {
                        challengeRunRef.current = challengeSelected.id;
                        if (challengeSelected?.settings) applySettings(challengeSelected.settings);
                        setScreen("GAME");
                        startGame();
                      }}
                    />
                  )}
                  <SoftButton title="LEADERBOARD" onPress={() => {}} />
                  <SoftButton
                    title="Înapoi"
                    onPress={() => {
                      setChallengeSelected(null);
                      setChallengeTab("list");
                    }}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (screen === "PROFILE") {
    const bannerSource = profileView?.banner_url ? IMG.rooms[profileView.banner_url] ?? IMG.rooms.back1 : IMG.rooms.back1;
    const bgSource = profileView?.background_url ? IMG.rooms[profileView.background_url] ?? IMG.rooms.back1 : IMG.rooms.back1;
    const isMeProfile = authUser?.username && profileView?.username === authUser.username;
    const profileBadges = isMeProfile ? badgesSelected : profileView?.badges ?? [];
    return (
      <>
        <ProfileScreen
          profileView={profileView}
          profileFollowers={profileFollowers}
          profileFollowing={profileFollowing}
          profileStats={profileStats}
          profileFeatured={profileFeatured}
          profileBadges={profileBadges}
          badgeMeta={badgeMeta}
          profileIsFollowing={profileIsFollowing}
          profileIsFriend={profileIsFriend}
          profileLikedPosts={profileLikedPosts}
          profileFavoritePosts={profileFavoritePosts}
          profilePosts={profilePosts}
          profilePolls={profilePolls}
          bannerSource={bannerSource}
          backgroundSource={bgSource}
          authUser={authUser}
          authToken={authToken}
          dmDraft={dmDraft}
          dmMessages={dmMessages}
          isAdmin={isAdminUser}
          onBack={() => setScreen("MENU")}
          onFollowToggle={handleProfileFollowToggle}
          onRefreshProfile={handleRefreshProfile}
          onLoadProfileMessages={handleLoadProfileMessages}
          onDmDraftChange={setDmDraft}
          onSendMessage={handleSendMessageToProfile}
          onAdminAction={handleAdminAction}
        />
        <HelpModal />
      </>
    );
  }

  if (screen === "NOTIFS") {
    return (
      <>
        <NotificationsScreen
          items={notifications}
          onMarkAll={async () => {
            if (!authToken) return setScreen("LOGIN");
            try {
              await apiPost("notifications_mark", {});
              const d = await apiGet("notifications_list");
              setNotifications(d?.notifications ?? []);
            } catch {}
          }}
          onBack={() => setScreen("MENU")}
        />
        <HelpModal />
      </>
    );
  }

  if (screen === "ACHIEVEMENTS") {
    return (
      <>
        <AchievementsScreen
          items={ACHIEVEMENTS}
          achievements={achievements}
          featured={featuredAchievements}
          search={achievementSearch}
          onSearchChange={setAchievementSearch}
          onToggleFeatured={(id) =>
            setFeaturedAchievements((arr) => {
              if (arr.includes(id)) return arr.filter((x) => x !== id);
              if (arr.length >= 5) return arr;
              return [...arr, id];
            })
          }
          badges={BADGES}
          badgesSelected={badgesSelected}
          badgeUnlocked={badgeUnlocked}
          onToggleBadge={(id) =>
            setBadgesSelected((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]))
          }
          onBack={() => setScreen("MENU")}
        />
        <HelpModal />
      </>
    );
  }

  if (screen === "BADGES") {
    return (
      <>
        <BadgesScreen
          items={BADGES}
          selected={badgesSelected}
          unlocked={badgeUnlocked}
          onToggle={(id) =>
            setBadgesSelected((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]))
          }
          onBack={() => setScreen("ACHIEVEMENTS")}
        />
        <HelpModal />
      </>
    );
  }


  if (screen === "MESSAGES") {
    return (
      <>
        <MessagesScreen
          profileResults={messageFriends}
          messageUser={messageUser}
          dmMessages={dmMessages}
          dmDraft={dmDraft}
          messageSearch={messageSearch}
          authUsername={authUser?.username}
          isAdmin={isAdminUser}
          badgeMeta={badgeMeta}
          onAdminDeleteMessage={handleAdminDeleteMessage}
          onAdminEditMessage={handleAdminEditMessage}
          onMessageSearchChange={setMessageSearch}
          onSelectMessageUser={openMessageUser}
          onDmDraftChange={setDmDraft}
          onSendMessage={handleSendMessageInChat}
          onBack={() => setScreen("MENU")}
        />
        <HelpModal />
      </>
    );
  }

  if (screen === "MENU") {
    return (
      <>
        <HomeScreen
          profileName={profileName || "Guest"}
          profileAvatar={profileAvatar}
          credits={credits}
          highestScore={userStats?.best ?? best}
          isAdmin={isAdminUser}
          backgroundSource={IMG.rooms.holprincipal}
          feedItems={(homeFeedItems || []).map((it: any, idx: number) => ({
            id: it?.id || `feed-${idx + 1}`,
            tag: String(it?.tag || "UPDATE"),
            title: String(it?.title || "Update"),
            desc: String(it?.desc || ""),
            imageSource: resolveHomeFeedImage(it?.imageKey || null),
          }))}
          onStart={startGame}
          onSelect={() => setScreen("SELECT")}
          onWorkshop={() => setScreen("WORKSHOP")}
          onSocial={() => setScreen("SOCIAL")}
          onAchievements={() => setScreen("ACHIEVEMENTS")}
          onChallenges={() => setScreen("CHALLENGES")}
          onSpin={() => setScreen("SPIN")}
          onScores={() => setScreen("SCORES")}
          onMessages={() => setScreen("MESSAGES")}
          onNotifs={() => (authToken ? setScreen("NOTIFS") : setScreen("LOGIN"))}
          onGoAccount={() => (authToken ? setScreen("ACCOUNT") : setScreen("LOGIN"))}
          onTrade={() => setScreen("TRADE_MARKET")}
          onCollectibles={() => setScreen("COLLECTIBLES")}
          onAdmin={() => setScreen("ADMIN")}
        />
        <HelpModal />
      </>
    );
  }

  if (screen === "TRADE_MARKET") {
    return (
      <>
        <TradeMarketScreen
          trades={Array.isArray(trades) ? trades.map((t: any) => ({
            id: String(t.id || ""),
            creator: t.creator_username || t.creator || "User",
            items: t.items_creator || [],
            wants: t.items_partner || [],
            fee: Number(t.fee_credits || 0),
            status: t.status || "open",
          })) : []}
          onOpenTrade={() => setScreen("TRADE")}
          onCreateTrade={() => setScreen("TRADE")}
          onBack={() => setScreen("MENU")}
        />
        <HelpModal />
      </>
    );
  }

  if (screen === "TRADE") {
    return (
      <>
        <TradeScreen onBack={() => setScreen("TRADE_MARKET")} />
        <HelpModal />
      </>
    );
  }

  if (screen === "COLLECTIBLES") {
    return (
      <>
        <CollectiblesScreen
          items={collectibles || []}
          allCharacters={CHARACTERS_50.map((c) => ({ id: c.id, name: c.name, image: charImg(c.id) }))}
          isAdmin={!!isAdminUser}
          onAdminAdd={async ({ username, character_id, rarity, amount }) => {
            await apiPost("admin_collectible_add", {
              username,
              character_id,
              rarity,
              amount,
            });
            const cl = await apiGet("collectible_list");
            setCollectibles(Array.isArray(cl?.collectibles) ? cl.collectibles : []);
          }}
          onSell={async (id, price) => {
            const res = await apiPost("collectible_sell", { id });
            if (typeof res?.credits === "number") {
              setCredits(res.credits);
              saveSettingsImmediate({ credits: res.credits });
            }
            setCollectibles((prev) => (prev || []).filter((c: any) => c.id !== id));
            return res;
          }}
          onBack={() => setScreen("MENU")}
        />
        <HelpModal />
      </>
    );
  }

  if (screen === "SELECT") {
    const selectedCount = selectedList.length;
    const info = CHARACTERS_50.find((c) => c.id === selectedInfoId) ?? CHARACTERS_50[0];
    const selectCompact = SW < 1100 || SH < 800;
    const selectTopStack = SW < 860 || SH < 720;
    const selectCols = SW < 360 ? 2 : SW < 520 ? 3 : SW < 780 ? 4 : SW < 1100 ? 5 : SW < 1400 ? 7 : 10;
    const showTileMeta = SW >= 1500;
    const bonusPct = Math.max(0, Math.round((challengeMultiplier(challenge) - 1) * 100));
    const selectTitleSize = SW < 520 || SH < 700 ? 24 : SW < 900 ? 32 : 44;
    const selectSubSize = SW < 520 || SH < 700 ? 12 : SW < 900 ? 15 : 18;
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={IMG.rooms.holprincipal} style={styles.bg} resizeMode="cover">
          <View style={styles.overlayStrong} />
          <View style={styles.selectShell}>
            <View style={[styles.selectTopbar, selectTopStack && styles.selectTopbarStack]}>
              <View>
                <Text style={[styles.selectTitleAlt, { fontSize: selectTitleSize }]}>CUSTOM NIGHT</Text>
                <Text style={[styles.selectSubAlt, { fontSize: selectSubSize }]}>Selecteaz? animatronici (minim 4)</Text>
              </View>
              <View style={[styles.selectTopActions, selectTopStack && styles.selectTopActionsStack]}>
                <View style={styles.selectStatPill}>
                  <Text style={styles.selectStatLabel}>Selectate</Text>
                  <Text style={styles.selectStatValue}>
                    {selectedCount}/{CHARACTERS_50.length}
                  </Text>
                </View>
                <View style={styles.selectStatPill}>
                  <Text style={styles.selectStatLabel}>Bonus score</Text>
                  <Text style={styles.selectStatValue}>+{bonusPct}%</Text>
                </View>
                <SoftButton title={selectedCount >= 4 ? "GO!" : "MIN 4"} tone="good" disabled={selectedCount < 4} onPress={startGame} />
                <SoftButton title="?NAPOI" onPress={() => setScreen("MENU")} />
              </View>
            </View>

            <View style={[styles.selectLayoutNew, selectCompact && styles.selectLayoutStack]}>
              <View style={[styles.selectPanel, styles.selectGridPanel, shadow as any, selectCompact && { maxHeight: Math.max(220, Math.floor(SH * 0.55)) }]}>
                <View style={styles.panelHeader}>
                  <Text style={styles.panelTitle}>Animatronics</Text>
                  <Text style={styles.panelMeta}>Tap pentru ON/OFF ? L1?L20</Text>
                </View>
                <FlatList
                  key={selectCols}
                  data={CHARACTERS_50}
                  numColumns={selectCols}
                  keyExtractor={(it) => it.id}
                  contentContainerStyle={{ padding: selectCols <= 4 ? 6 : 10 }}
                  scrollEnabled
                  renderItem={({ item }) => {
                    const on = !!selected[item.id];
                    const glowOpacity = selectPulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.7] });
                    const lvl = clamp(customLevels[item.id] ?? item.difficulty, 0, 20);
                    const threatPct = Math.round((lvl / 20) * 100);
                    const cooldownBase = clamp(2.4 - lvl * 0.06, 0.4, 3.2);
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedInfoId(item.id);
                          setSelected((p) => ({ ...p, [item.id]: !p[item.id] }));
                        }}
                        activeOpacity={0.86}
                        style={[styles.charTile, { width: `${100 / selectCols}%` }, on && styles.charTileOn]}
                      >
                        <Image source={charImg(item.id)} style={styles.charTileImg} resizeMode="cover" />
                        {on && <Animated.View pointerEvents="none" style={[styles.charTileGlow, { opacity: glowOpacity }]} />}
                        {showTileMeta ? (
                          <>
                            <View style={styles.cooldownBadge}>
                              <Text style={styles.cooldownText}>CD {cooldownBase.toFixed(1)}s</Text>
                            </View>
                            <View style={styles.threatBar}>
                              <View style={[styles.threatFill, { width: `${threatPct}%` }]} />
                            </View>
                            <View style={styles.charTileFooter}>
                              <Text style={styles.charTileTxt}>{on ? `ON ? L${lvl}` : `OFF ? L${lvl}`}</Text>
                            </View>
                          </>
                        ) : (
                          <View style={styles.charTileFooterCompact}>
                            <Text style={styles.charTileTxtCompact}>{on ? `L${lvl}` : "OFF"}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>

              <ScrollView
                style={[styles.selectPanel, styles.selectSidePanel, shadow as any, selectCompact && styles.selectSideStack]}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.sideTitle}>SETTINGS</Text>
                <SoftButton
                  title={`MODE: ${mode}`}
                  onPress={() => {
                    const order = ["STORY", "CUSTOM", "ENDLESS", "CHALLENGE", "STEALTH", "RUSH"];
                    const idx = order.indexOf(mode);
                    setMode(order[(idx + 1) % order.length]);
                  }}
                />
                <SoftButton
                  title={`DIFFICULTY: ${DIFFICULTY_LABEL[difficultyPreset].toUpperCase()}`}
                  onPress={() => {
                    const idx = DIFFICULTY_ORDER.indexOf(difficultyPreset);
                    setDifficultyPreset(DIFFICULTY_ORDER[(idx + 1) % DIFFICULTY_ORDER.length]);
                  }}
                />
                <SoftButton
                  title={`PRESET: ${modePreset}`}
                  onPress={() => {
                    const order = ["NORMAL", "OLD_TIMES", "BEST_LEADERS", "ARTISTS", "WRITERS", "MODERN", "SHADOWS"];
                    const idx = order.indexOf(modePreset);
                    const next = order[(idx + 1) % order.length] as ModePreset;
                    setModePreset(next);
                    if (next !== "NORMAL") {
                      const presetList = MODE_PRESETS[next] ?? [];
                      const s: Record<string, boolean> = {};
                      CHARACTERS_50.forEach((c) => (s[c.id] = presetList.includes(c.id)));
                      setSelected(s);
                    }
                  }}
                />
                <SoftButton title={`TIER: ${modeTier}`} onPress={() => setModeTier((t) => (t % 3) + 1)} />
                <SoftButton title={`DAILY: ${dailyRun ? "ON" : "OFF"}`} onPress={() => setDailyRun((v) => !v)} />
                <SoftButton title={`NIGHT 6: ${night6 ? "ON" : "OFF"}`} onPress={() => setNight6((v) => !v)} />
                <SoftButton title={`HARDCORE: ${hardcore ? "ON" : "OFF"}`} onPress={() => setHardcore((v) => !v)} />
                <View style={{ height: 10 }} />
                <Text style={styles.sideTitle}>CUSTOM RULES</Text>
                <SoftButton
                  title={`CAMERAS: ${challenge.noCams ? "OFF" : "ON"}`}
                  onPress={() => setChallenge((c) => ({ ...c, noCams: !c.noCams }))}
                />
                <SoftButton
                  title={`FLASHLIGHT: ${challenge.noFlash ? "OFF" : "ON"}`}
                  onPress={() => setChallenge((c) => ({ ...c, noFlash: !c.noFlash }))}
                />
                <SoftButton
                  title={`OVERCLOCK: ${challenge.noOverclock ? "OFF" : "ON"}`}
                  onPress={() => setChallenge((c) => ({ ...c, noOverclock: !c.noOverclock }))}
                />
                <View style={{ height: 12 }} />
                <Text style={styles.sideTitle}>SET ALL</Text>
                <SoftButton
                  title="ALL ON"
                  onPress={() => {
                    const s: Record<string, boolean> = {};
                    CHARACTERS_50.forEach((c) => (s[c.id] = true));
                    setSelected(s);
                  }}
                />
                <SoftButton title="CLEAR" tone="danger" onPress={() => setSelected({})} />
                <View style={{ height: 12 }} />
                <Text style={styles.sideTitle}>STATUS</Text>
                <Text style={styles.sideMeta}>Selectate: {selectedCount}/{CHARACTERS_50.length}</Text>
                <Text style={styles.sideMeta}>Profil: {profileName || "Anonim"}</Text>
                <Text style={styles.sideMeta}>Global difficulty: {DIFFICULTY_LABEL[difficultyPreset]}</Text>
                <Text style={styles.sideMeta}>Preset: {modePreset} (Tier {modeTier})</Text>
                <Text style={styles.sideMeta}>Bonus Score: +{bonusPct}%</Text>
                <View style={{ height: 12 }} />
                <Text style={styles.sideTitle}>INFO</Text>
                {!!info && (
                  <View style={styles.infoCard}>
                    <Text style={styles.infoName}>{info.name}</Text>
                    <Text style={styles.infoMeta}>Dificultate: {info.difficulty}</Text>
                    <Text style={styles.infoMeta}>Intrare: {info.entry}</Text>
                    <Text style={styles.infoMeta}>Ability: {info.ability}</Text>
                    <View style={styles.customRow}>
                      <Text style={styles.infoMeta}>Level: {customLevels[info.id] ?? info.difficulty}</Text>
                      <View style={styles.customBtns}>
                        <Pressable
                          style={styles.customBtn}
                          onPress={() =>
                            setCustomLevels((p) => ({ ...p, [info.id]: clamp((p[info.id] ?? info.difficulty) - 1, 0, 20) }))
                          }
                        >
                          <Text style={styles.customBtnTxt}>-</Text>
                        </Pressable>
                        <Pressable
                          style={styles.customBtn}
                          onPress={() =>
                            setCustomLevels((p) => ({ ...p, [info.id]: clamp((p[info.id] ?? info.difficulty) + 1, 0, 20) }))
                          }
                        >
                          <Text style={styles.customBtnTxt}>+</Text>
                        </Pressable>
                      </View>
                    </View>
                    <Text style={styles.infoDesc}>{ABILITY_DESC[info.ability]}</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }
// PLAY screen
// PLAY screen
  const view = cameraOpen ? camView : VIEWS[0];
  const dockCompact = SW < 1100 || SH < 900;
  const dockMax = Math.max(90, Math.min(240, Math.floor(SH * (ultraCompact ? 0.2 : dockCompact ? 0.26 : 0.28))));
  const compactHud = uiCompact || SH < 900;
  const tightHud = ultraCompact || SH < 760;
  const officeBg = IMG.rooms[bgPick];
  const bg = cameraOpen ? (view.id === "OFFICE" ? officeBg : view.bg ?? officeBg) : officeBg;
  const lookShift = lookX.interpolate({ inputRange: [-1, 0, 1], outputRange: [-70, 0, 70] });

  const flickerOpacity = camFlicker.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.16] });

  const shakeX = shake.interpolate({ inputRange: [0, 1], outputRange: [0, 16] });
  const shakeY = shake.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  const heatCrit = heat >= 30;
  const airCrit = air <= 25;
  const viewCounts: Partial<Record<ViewId, number>> = {};
  charsRef.current.forEach((rc) => {
    const vid = rc.route[rc.idx];
    if (!vid) return;
    viewCounts[vid] = (viewCounts[vid] ?? 0) + 1;
  });
  const hourLabel = mode === "ENDLESS" ? `H+${nightHour}` : `${nightHour === 0 ? 12 : nightHour} AM`;
  const nowTs = now();
  const rareActive = !!rareRoomId && nowTs < rareRoomUntil && !rareLooted;
  const recap = eventLogRef.current.filter((e) => nowTs - e.t <= 10_000);
  const radioActive = !!radioMsg && nowTs < radioUntil;
  const achievementActive = !!achievementToast && nowTs < achievementUntil;
  const modifierLabel = nightModifiers.map((m) => NIGHT_MODIFIERS.find((x) => x.id === m)?.name).filter(Boolean).join(", ");
  const tasksDone = tasks.filter((t) => t.done).length;
  const bossPresent = charsRef.current.some((c) => c.def.ability === "boss");
  const estNf = (NIGHT_FACTOR[night - 1] ?? 1.2) * (isRush ? 1.25 : 1);
  let estDrain = 0.022 * estNf;
  if (cameraOpen) estDrain += 0.03;
  if (doorL) estDrain += 0.035;
  if (doorR) estDrain += 0.035;
  if (sealL) estDrain += 0.025;
  if (sealR) estDrain += 0.025;
  if (jam) estDrain += 0.015;
  estDrain += 0.05 * fan;
  if (surge) estDrain *= 0.85;
  if (challenge.doubleDrain) estDrain *= 2;
  const secLeft = power / Math.max(estDrain * 10, 0.01);
  const powerForecast = `${Math.max(0, Math.floor(secLeft / 60))}m ${Math.max(0, Math.floor(secLeft % 60))}s`;
  const leftThreat =
    (viewCounts.HOL_STANGA_FAR ?? 0) +
    (viewCounts.HOL_STANGA_NEAR ?? 0) +
    (viewCounts.VENT_LEFT_DEEP ?? 0) +
    (viewCounts.VENT_LEFT_NEAR ?? 0);
  const rightThreat =
    (viewCounts.HOL_DREAPTA_FAR ?? 0) +
    (viewCounts.HOL_DREAPTA_NEAR ?? 0) +
    (viewCounts.VENT_RIGHT_DEEP ?? 0) +
    (viewCounts.VENT_RIGHT_NEAR ?? 0);
  const panic = sanity < 28;

  return (
    <SafeAreaView style={styles.root} onMouseMove={handleLookMove}>
      <StatusBar barStyle="light-content" />
      <AnimatedImageBackground
        source={bg}
        style={[styles.bg, !cameraOpen && { transform: [{ translateX: lookShift }] }]}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.vignette,
            { opacity: vignette.interpolate({ inputRange: [0, 1], outputRange: [0.50, 0.70] }) },
          ]}
        />

        {!cameraOpen && (
          <View style={styles.lookZones} pointerEvents="box-none">
            <Pressable
              style={styles.lookZoneLeft}
              onPressIn={() => setLookDir(-1)}
              onPressOut={() => setLookDir(0)}
            >
              <Text style={[styles.lookZoneTxt, ultraCompact && styles.lookZoneTxtSmall]}>◀</Text>
            </Pressable>
            <Pressable
              style={styles.lookZoneRight}
              onPressIn={() => setLookDir(1)}
              onPressOut={() => setLookDir(0)}
            >
              <Text style={[styles.lookZoneTxt, ultraCompact && styles.lookZoneTxtSmall]}>▶</Text>
            </Pressable>
          </View>
        )}

        {cutsceneOpen && (
          <View style={styles.modalWrap}>
            <View style={[styles.modalCard, shadow as any]}>
              <Text style={styles.modalTitle}>NIGHT 1</Text>
              <Text style={styles.modalSub}>Cutscene: Stabilizeaza sistemul si fii atent la holuri.</Text>
              <View style={{ height: 10 }} />
              <SoftButton title="SKIP" onPress={() => setCutsceneOpen(false)} />
            </View>
          </View>
        )}

        {/* HUD */}
        <View
          style={[
            styles.hud,
            compactHud && styles.hudCompact,
            ultraCompact && styles.hudUltra,
            { marginBottom: dockMax + 16, transform: [{ scale: gameScale }], alignSelf: "center" },
          ]}
        >
          <View style={[styles.hudTop, compactHud && styles.hudTopWrap]}>
            <View style={[styles.hudPill, compactHud && styles.hudPillCompact, ultraCompact && styles.hudPillUltra]}>
              <Text style={[styles.hudKey, compactHud && styles.hudKeyCompact, ultraCompact && styles.hudKeyUltra]}>Night</Text>
              <Text style={[styles.hudVal, compactHud && styles.hudValCompact, ultraCompact && styles.hudValUltra]}>{night}/{nightMax}</Text>
            </View>
            <View style={[styles.hudPill, compactHud && styles.hudPillCompact, ultraCompact && styles.hudPillUltra]}>
              <Text style={[styles.hudKey, compactHud && styles.hudKeyCompact, ultraCompact && styles.hudKeyUltra]}>Time</Text>
              <Text style={[styles.hudVal, compactHud && styles.hudValCompact, ultraCompact && styles.hudValUltra]}>{hourLabel}</Text>
            </View>
            <View style={[styles.hudPill, compactHud && styles.hudPillCompact, ultraCompact && styles.hudPillUltra]}>
              <Text style={[styles.hudKey, compactHud && styles.hudKeyCompact, ultraCompact && styles.hudKeyUltra]}>Score</Text>
              <Text style={[styles.hudVal, compactHud && styles.hudValCompact, ultraCompact && styles.hudValUltra]}>{score}</Text>
            </View>
            <View style={[styles.hudPill, compactHud && styles.hudPillCompact, ultraCompact && styles.hudPillUltra]}>
              <Text style={[styles.hudKey, compactHud && styles.hudKeyCompact, ultraCompact && styles.hudKeyUltra]}>Best</Text>
              <Text style={[styles.hudVal, compactHud && styles.hudValCompact, ultraCompact && styles.hudValUltra]}>{best}</Text>
            </View>
            <View style={[styles.hudPill, compactHud && styles.hudPillCompact, ultraCompact && styles.hudPillUltra]}>
              <Text style={[styles.hudKey, compactHud && styles.hudKeyCompact, ultraCompact && styles.hudKeyUltra]}>Tasks</Text>
              <Text style={[styles.hudVal, compactHud && styles.hudValCompact, ultraCompact && styles.hudValUltra]}>{tasksDone}/{tasks.length}</Text>
            </View>
            <View style={[styles.hudPill, { flex: 1 }, compactHud && styles.hudPillCompact, ultraCompact && styles.hudPillUltra]}>
              <Text style={[styles.hudKey, compactHud && styles.hudKeyCompact, ultraCompact && styles.hudKeyUltra]}>View</Text>
              <Text style={[styles.hudVal, compactHud && styles.hudValCompact, ultraCompact && styles.hudValUltra]}>{cameraOpen ? view.name : "Office"}</Text>
            </View>
          </View>

          <View style={[styles.bars, compactHud && styles.barsCompact, ultraCompact && styles.barsUltra]}>
            <Bar label="Power" value={power} good="#66F3B3" bad="#FF6B6B" rightText={`${Math.round(power)}% ? ${powerForecast}`} />
            {!tightHud && (
              <Bar
                label="Heat"
                value={((heat - 16) / (34 - 16)) * 100}
                good="#DADADA"
                bad="#FFB86B"
                warn={heatCrit}
                rightText={`${heat.toFixed(1)}?C`}
              />
            )}
            <Bar label="Air" value={air} good="#62D6FF" bad="#FFB86B" warn={airCrit} rightText={`${Math.round(air)}%`} />
            {!compactHud && !tightHud && <Bar label="Vent" value={ventHealth} good="#8CF7FF" bad="#FF6B6B" rightText={`${Math.round(ventHealth)}%`} />}
            <Bar label="Sanity" value={sanity} good="#C1B7FF" bad="#FF6B6B" rightText={`${Math.round(sanity)}%`} />
            {!compactHud && !tightHud && <Bar label="Noise" value={noise} good="#9AD5FF" bad="#FFB86B" rightText={`${Math.round(noise)}%`} />}
          </View>

          <View style={[styles.statusRow, compactHud && styles.statusRowWrap]}>
            <View style={[styles.statusPill, compactHud && styles.statusPillCompact, ultraCompact && styles.statusPillUltra, doorL && styles.statusPillOn]}>
              <Text style={[styles.statusKey, compactHud && styles.statusKeyCompact, ultraCompact && styles.statusKeyUltra]}>UȘĂ STG</Text>
              <Text style={[styles.statusVal, compactHud && styles.statusValCompact, ultraCompact && styles.statusValUltra]}>{doorL ? "ON" : doorLLocked ? "LOCK" : "OFF"}</Text>
            </View>
            <View style={[styles.statusPill, compactHud && styles.statusPillCompact, ultraCompact && styles.statusPillUltra, doorR && styles.statusPillOn]}>
              <Text style={[styles.statusKey, compactHud && styles.statusKeyCompact, ultraCompact && styles.statusKeyUltra]}>UȘĂ DR</Text>
              <Text style={[styles.statusVal, compactHud && styles.statusValCompact, ultraCompact && styles.statusValUltra]}>{doorR ? "ON" : doorRLocked ? "LOCK" : "OFF"}</Text>
            </View>
            {!tightHud && (
              <View style={[styles.statusPill, compactHud && styles.statusPillCompact, ultraCompact && styles.statusPillUltra, sealL && styles.statusPillOn]}>
                <Text style={[styles.statusKey, compactHud && styles.statusKeyCompact, ultraCompact && styles.statusKeyUltra]}>VENT STG</Text>
                <Text style={[styles.statusVal, compactHud && styles.statusValCompact, ultraCompact && styles.statusValUltra]}>{sealL ? "SEALED" : "OPEN"}</Text>
              </View>
            )}
            {!tightHud && (
              <View style={[styles.statusPill, compactHud && styles.statusPillCompact, ultraCompact && styles.statusPillUltra, sealR && styles.statusPillOn]}>
                <Text style={[styles.statusKey, compactHud && styles.statusKeyCompact, ultraCompact && styles.statusKeyUltra]}>VENT DR</Text>
                <Text style={[styles.statusVal, compactHud && styles.statusValCompact, ultraCompact && styles.statusValUltra]}>{sealR ? "SEALED" : "OPEN"}</Text>
              </View>
            )}
            <View style={[styles.statusPill, compactHud && styles.statusPillCompact, ultraCompact && styles.statusPillUltra]}>
              <Text style={[styles.statusKey, compactHud && styles.statusKeyCompact, ultraCompact && styles.statusKeyUltra]}>ROUTE</Text>
              <Text style={[styles.statusVal, compactHud && styles.statusValCompact, ultraCompact && styles.statusValUltra]}>{powerRoute}</Text>
            </View>
          {!!modifierLabel && !tightHud && (
              <View style={[styles.statusPill, compactHud && styles.statusPillCompact, ultraCompact && styles.statusPillUltra]}>
                <Text style={[styles.statusKey, compactHud && styles.statusKeyCompact, ultraCompact && styles.statusKeyUltra]}>MODS</Text>
                <Text style={[styles.statusVal, compactHud && styles.statusValCompact, ultraCompact && styles.statusValUltra]}>{modifierLabel}</Text>
              </View>
            )}
          </View>
          {!!damageInfo && (
            <View style={styles.damagePill}>
              <Text style={styles.damageKey}>Last Damage</Text>
              <Text style={styles.damageVal}>{damageInfo}</Text>
            </View>
          )}
        </View>

          {/* camera static overlay */}
          {cameraOpen && <Animated.View pointerEvents="none" style={[styles.staticOverlay, { opacity: flickerOpacity }]} />}
          {cameraOpen && (camGlitch || falseAlarm) && <View pointerEvents="none" style={styles.glitchOverlay} />}
          {cameraOpen && camDead && (
            <View pointerEvents="none" style={styles.deadZoneOverlay}>
              <Text style={styles.deadZoneText}>DEAD ZONE • SIGNAL LOST</Text>
            </View>
          )}
          {sanity < 30 && <View pointerEvents="none" style={styles.sanityOverlay} />}

        {powerDead && (
          <View pointerEvents="none" style={styles.powerOutOverlay}>
            <View style={styles.powerOutLight} />
          </View>
        )}

        {/* jam banner */}
        {cameraOpen && jam && (
          <View style={styles.jamBanner}>
            <Text style={styles.jamTitle}>📡 CAMERA JAMMED</Text>
            <Text style={styles.jamSub}>Apasă RESET ca să cureți</Text>
          </View>
        )}

        {falseAlarm && (
          <View style={styles.falseAlarmBanner}>
            <Text style={styles.jamTitle}>⚠️ FALSE ALARM</Text>
            <Text style={styles.jamSub}>Semnal instabil</Text>
          </View>
        )}

        {blackout && (
          <View style={styles.blackoutOverlay}>
            <Text style={styles.blackoutTitle}>BLACKOUT</Text>
            <Text style={styles.blackoutSub}>Sistem indisponibil</Text>
          </View>
        )}

        {nightModifiers.includes("fog") && (
          <View pointerEvents="none" style={styles.fogOverlay} />
        )}

        {radioActive && (
          <View style={styles.radioBanner}>
            <Text style={styles.radioText}>{radioMsg}</Text>
          </View>
        )}

        {achievementActive && (
          <View style={styles.achieveBanner}>
            <Text style={styles.achieveText}>{achievementToast}</Text>
          </View>
        )}

        {powerSpike && !powerSpikeChoice && (
          <View style={styles.spikeBanner}>
            <Text style={styles.spikeTitle}>POWER SPIKE</Text>
            <View style={styles.spikeRow}>
              <SoftButton title="CAMS" onPress={() => setPowerSpikeChoice("CAMS")} />
              <SoftButton title="DOORS" onPress={() => setPowerSpikeChoice("DOORS")} />
            </View>
          </View>
        )}

        {motionPing && (
          <View style={styles.motionBanner}>
            <Text style={styles.motionText}>PING • STG {leftThreat} | DR {rightThreat}</Text>
          </View>
        )}

        {panic && (
          <View style={styles.panicBanner}>
            <Text style={styles.panicText}>PANIC</Text>
          </View>
        )}

        {cameraOpen && !compactHud && (
          <View style={styles.miniMap}>
            <Text style={styles.miniMapTitle}>MAP</Text>
            <View style={styles.miniMapCanvas}>
              {VIEWS.filter((v) => v.type !== "office").map((v) => {
                const node = CAM_MAP_NODES[v.id];
                if (!node) return null;
                const active = v.id === view.id;
                const count = viewCounts[v.id] ?? 0;
                const rare = rareRoomId === v.id && nowTs < rareRoomUntil && !rareLooted;
                return (
                  <Pressable
                    key={v.id}
                    onPress={() => {
                      const idx = VIEWS.findIndex((x) => x.id === v.id);
                      if (idx < 0) return;
                      if (!cameraOpen) toggleCamera();
                      jumpToCam(idx);
                    }}
                    style={[
                      styles.mapNode,
                      {
                        left: `${node.x * 100}%`,
                        top: `${node.y * 100}%`,
                        borderColor: active ? "rgba(120,255,190,0.75)" : "rgba(255,255,255,0.18)",
                      },
                    ]}
                  >
                    {count > 0 && (
                      <Animated.View
                        style={[
                          styles.mapPulse,
                          {
                            transform: [{ scale: radarPulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] }) }],
                            opacity: radarPulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0] }),
                          },
                        ]}
                      />
                    )}
                    {count > 0 && <View style={styles.mapDot} />}
                    {rare && <Text style={styles.mapStar}>★</Text>}
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.miniMapLegend}>
              <Text style={styles.miniMapLegendText}>STG</Text>
              <Text style={styles.miniMapLegendText}>DR</Text>
            </View>
          </View>
        )}

        {/* characters */}
        {!jam && !blackout && !camDead && renderChars(cameraOpen ? view.id : "OFFICE")}
        {cameraOpen && !!ghostByView[view.id]?.length && (
          <View pointerEvents="none">
            {ghostByView[view.id].map((p, i) => (
              <View
                key={`ghost-${view.id}-${i}`}
                style={[
                  styles.ghostDot,
                  { left: SW * p.xPct - 4, top: SH * p.yPct - 4, opacity: 0.25 + (i / 40) },
                ]}
              />
            ))}
          </View>
        )}
        {cameraOpen && decoyActive && decoyViewId === view.id && (
          <View pointerEvents="none" style={[styles.spriteWrap, { left: SW * 0.5 - 60, top: SH * 0.45 }]}>
            <Image source={IMG.characters.default} style={[styles.sprite, { width: 120, height: 150, opacity: 0.5 }]} resizeMode="contain" />
            <Text style={styles.spriteLabel}>UNKNOWN</Text>
          </View>
        )}

        {/* DOCK */}
        <View style={[styles.dock, dockCompact && styles.dockCompact, { transform: [{ scale: gameScale }], alignSelf: "center" }]}>
          <ScrollView
            style={[styles.dockScroll, { maxHeight: dockMax }]}
            contentContainerStyle={[styles.dockScrollContent, dockCompact && { gap: 6 }]}
            showsVerticalScrollIndicator={false}
          >
          <View style={[styles.dockRow, dockCompact && styles.dockRowCompact]}>
            <SoftButton
              title={`UȘĂ STG ${doorL ? "ON" : "OFF"}`}
              tone={doorL ? "good" : "danger"}
              onPress={() => {
                if (doorLLocked || systemDisabled) return;
                setDoorL((v) => {
                  const next = !v;
                  if (next) doorsUsedRef.current = true;
                  return next;
                });
                bumpNoise(2);
              }}
              disabled={challenge.noDoors || doorLLocked || systemDisabled || spikeBlocksDoors}
              powerGate
            />
            <SoftButton
              title={`SEAL STG ${sealL ? `${Math.ceil((sealLUntil - now()) / 1000)}s` : ""}`}
              disabled={sealL || systemDisabled}
              onPress={doSealL}
             powerGate />
            <SoftButton
              title={cameraOpen ? "ÎNCHIDE CAM" : "CAMERA"}
              onPress={toggleCamera}
              disabled={noCamsMode || systemDisabled || spikeBlocksCams}
              powerGate
            />
            <SoftButton
              title={`SEAL DR ${sealR ? `${Math.ceil((sealRUntil - now()) / 1000)}s` : ""}`}
              disabled={sealR || systemDisabled}
              onPress={doSealR}
             powerGate />
            <SoftButton
              title={`UȘĂ DR ${doorR ? "ON" : "OFF"}`}
              tone={doorR ? "good" : "danger"}
              onPress={() => {
                if (doorRLocked || systemDisabled) return;
                setDoorR((v) => {
                  const next = !v;
                  if (next) doorsUsedRef.current = true;
                  return next;
                });
                bumpNoise(2);
              }}
              disabled={challenge.noDoors || doorRLocked || systemDisabled || spikeBlocksDoors}
              powerGate
            />
          </View>

          <View style={[styles.dockRow, dockCompact && styles.dockRowCompact]}>
            <SoftButton title="LURE" sub={isCd(lureCdUntil) ? `${cdLeft(lureCdUntil).toFixed(1)}s` : "atrage spre view"} disabled={isCd(lureCdUntil) || noCamsMode || systemDisabled || spikeBlocksCams} onPress={() => doLure(cameraOpen ? view.id : "OFFICE")}  powerGate />
            <SoftButton title="MUSIC" sub={isCd(musicCdUntil) ? `${cdLeft(musicCdUntil).toFixed(1)}s` : "calmează unii"} disabled={isCd(musicCdUntil) || systemDisabled} onPress={doMusic}  powerGate />
            <SoftButton title="RESET" sub={isCd(resetCdUntil) ? `${cdLeft(resetCdUntil).toFixed(1)}s` : jam ? "curăță JAM" : "pulse"} disabled={isCd(resetCdUntil) || systemDisabled} onPress={doReset}  powerGate />
            <SoftButton title="LIGHT" sub={isCd(lightCdUntil) ? `${cdLeft(lightCdUntil).toFixed(1)}s` : "reveal phantom"} disabled={isCd(lightCdUntil) || noCamsMode || noFlash || systemDisabled || spikeBlocksCams} onPress={doFlash}  powerGate />
            <SoftButton
              title={genOn ? `GEN ON ${Math.ceil((genOnUntil - now()) / 1000)}s` : "GEN"}
              sub={isCd(genCdUntil) ? `${cdLeft(genCdUntil).toFixed(1)}s` : "mini-game"}
              disabled={genOn || isCd(genCdUntil) || systemDisabled || spikeBlocksCams || noCamsMode}
              onPress={openGenerator}
             powerGate />
          </View>

          <View style={[styles.dockRow, dockCompact && styles.dockRowCompact]}>
            <SoftButton title={`G1 ${gadgetLabel(gadgets[0])}`} onPress={() => useGadget(0)} disabled={!gadgets[0] || systemDisabled} powerGate />
            <SoftButton title={`G2 ${gadgetLabel(gadgets[1])}`} onPress={() => useGadget(1)} disabled={!gadgets[1] || systemDisabled} powerGate />
            <SoftButton title="TASKS" onPress={() => setTaskOpen(true)} disabled={systemDisabled} powerGate />
            <SoftButton title={scanActive ? "SCAN" : "SCAN"} sub={scanCd ? `${cdLeft(scanCdUntil).toFixed(1)}s` : "see thru"} onPress={doScan} disabled={scanCd || systemDisabled} powerGate />
            <SoftButton title="OVERCLOCK" sub={overclockCd ? `${cdLeft(overclockCdUntil).toFixed(1)}s` : "+2s scan"} onPress={doOverclock} disabled={overclockCd || noOverclock || systemDisabled} powerGate />
            <SoftButton title="ARTIFACT" sub={bossArtifactUsedRef.current ? "used" : "boss stop"} onPress={useArtifact} disabled={!bossPresent || bossArtifactUsedRef.current || systemDisabled} powerGate />
            <SoftButton title="ALARM" sub={alarmCd ? `${cdLeft(alarmCdUntil).toFixed(1)}s` : "scare"} onPress={doAlarm} disabled={alarmCd || systemDisabled} powerGate />
            <SoftButton title="PING" sub={motionPing ? `${cdLeft(motionPingUntil).toFixed(1)}s` : "motion"} onPress={doPing} disabled={motionPing || systemDisabled} powerGate />
            <SoftButton title="HELP" onPress={() => setHelpOpen(true)} powerGate />
          </View>

          <View style={[styles.dockRow, dockCompact && styles.dockRowCompact]}>
            <SoftButton title="FAN -" onPress={() => setFan((f) => clamp(f - 0.08, 0, 1))} disabled={systemDisabled} powerGate />
            <View style={styles.fanPill}>
              <Text style={styles.fanTxt}>FAN {Math.round(fan * 100)}%</Text>
            </View>
            <SoftButton title="FAN +" onPress={() => setFan((f) => clamp(f + 0.08, 0, 1))} disabled={systemDisabled} powerGate />
            <SoftButton title="MENU" onPress={goMenu} disabled={hardcore} />
          </View>
          <View style={[styles.dockRow, dockCompact && styles.dockRowCompact]}>
            <SoftButton title="ROUTE: BAL" onPress={() => setPowerRoute("BALANCED")} disabled={systemDisabled} powerGate />
            <SoftButton title="ROUTE: DOORS" onPress={() => setPowerRoute("DOORS")} disabled={systemDisabled} powerGate />
            <SoftButton title="ROUTE: CAMS" onPress={() => setPowerRoute("CAMS")} disabled={systemDisabled} powerGate />
          </View>

          {cameraOpen && (
            <View style={styles.camStrip}>
              <FlatList
                data={VIEWS}
                horizontal
                keyExtractor={(v) => v.id}
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: 10 }}
                renderItem={({ item, index }) => {
                  const active = index === camIndex;
                  return (
                    <TouchableOpacity
                      onPress={() => jumpToCam(index)}
                      style={[styles.camChip, active && styles.camChipActive]}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.camChipTxt, active && styles.camChipTxtActive]}>{item.name}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}
          </ScrollView>
        </View>

        {/* FUSE BREAKER */}
        {fuseOpen && (
          <View style={styles.modalWrap}>
            <View style={[styles.modalCard, shadow as any]}>
              <Text style={styles.modalTitle}>FUSE BREAKER</Text>
              <Text style={styles.modalSub}>Resetează siguranța (4 pași).</Text>
              <Text style={styles.modalProgress}>Progres: {fuseStep}/4</Text>
              <View style={styles.genRow}>
                {[0, 1, 2, 3].map((i) => {
                  const hint = fuseSeq[fuseStep] === i;
                  return (
                    <TouchableOpacity
                      key={`fuse-${i}`}
                      onPress={() => pressFuse(i)}
                      style={[styles.genSwitch, hint && styles.genSwitchHint, fuseLocked && styles.genSwitchDisabled]}
                      activeOpacity={0.88}
                      disabled={fuseLocked}
                    >
                      <Text style={styles.genSwitchTitle}>F{i + 1}</Text>
                      <View style={styles.genLever} />
                      <View style={[styles.genDot, hint && styles.genDotHint]} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {dealActive && (
          <View style={styles.modalWrap}>
            <View style={[styles.modalCard, shadow as any]}>
              <Text style={styles.modalTitle}>DEAL OFFER</Text>
              <Text style={styles.modalSub}>Alege rapid: 70% supraviețuire, 30% moarte.</Text>
              <View style={{ height: 8 }} />
              <View style={styles.spikeRow}>
                <SoftButton title="+5% POWER" onPress={() => resolveDeal("POWER")} />
                <SoftButton title="-5 HEAT" onPress={() => resolveDeal("HEAT")} />
                <SoftButton title="NU" tone="neutral" onPress={() => setDealOpen(false)} />
              </View>
            </View>
          </View>
        )}

        {cameraOpen && rareActive && view.id === rareRoomId && (
          <View style={styles.rareLootWrap}>
            <SoftButton
              title="LOOT"
              tone="good"
              onPress={() => {
                if (!rareActive) return;
                setRareLooted(true);
                spendCredits(-6);
                if (rand() < 0.6) addInventory(pick(GADGET_SHOP).id, 1);
                pushRadio("RARE ROOM: loot gasit!", 2200);
                logEvent("Rare loot claimed");
              }}
            />
          </View>
        )}

        {/* GENERATOR MODAL */}
        {genOpen && (
          <View style={styles.modalWrap}>
            <View style={[styles.modalCard, shadow as any]}>
              <Text style={styles.modalTitle}>GENERATOR</Text>
              <Text style={styles.modalSub}>Apasă switch-urile în ordinea corectă (4 pași). Greșit = reset.</Text>
              <Text style={styles.modalProgress}>Progres: {genStep}/4</Text>

              <View style={styles.genRow}>
                {[0, 1, 2, 3].map((i) => {
                  const hint = genSeq[genStep] === i;
                  return (
                    <TouchableOpacity key={i} onPress={() => pressGen(i)} style={[styles.genSwitch, hint && styles.genSwitchHint]} activeOpacity={0.88}>
                      <Text style={styles.genSwitchTitle}>SW{i + 1}</Text>
                      <View style={styles.genLever} />
                      <View style={[styles.genDot, hint && styles.genDotHint]} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ height: 12 }} />
              <SoftButton title="Închide" onPress={() => setGenOpen(false)} />
            </View>
          </View>
        )}

        {taskOpen && (
          <View style={styles.modalWrap}>
            <View style={[styles.modalCard, shadow as any]}>
              <Text style={styles.modalTitle}>TASKS</Text>
              <Text style={styles.modalSub}>Completează task-uri pentru bonus score.</Text>
              <View style={{ height: 8 }} />
              {tasks.map((t) => {
                const def = getTaskDef(t.id);
                if (!def) return null;
                const working = taskWorking && activeTaskId === t.id;
                return (
                  <View key={t.id} style={styles.taskRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.taskTitle}>{def.name}</Text>
                      <Text style={styles.taskDesc}>{def.desc}</Text>
                      <Text style={styles.taskMeta}>{Math.round(t.progress * 100)}% • +{def.reward} score</Text>
                    </View>
                    <SoftButton
                      title={t.done ? "DONE" : working ? "WORKING" : "WORK"}
                      disabled={t.done || (taskWorking && !working) || systemDisabled}
                      onPress={() => {
                        if (t.done) return;
                        setActiveTaskId(t.id);
                        setTaskWorkUntil(now() + 4200);
                      }}
                    />
                  </View>
                );
              })}
              <View style={{ height: 10 }} />
              <SoftButton title="Închide" onPress={() => setTaskOpen(false)} />
            </View>
          </View>
        )}
        {maintenanceOpen && (
          <View style={styles.modalWrap}>
            <View style={[styles.modalCard, shadow as any]}>
              <Text style={styles.modalTitle}>MAINTENANCE</Text>
              <Text style={styles.modalSub}>Alege un upgrade ?nainte de urm?toarea noapte.</Text>
              <Text style={styles.modalProgress}>Puncte: {maintenancePoints}</Text>
              <View style={{ height: 8 }} />
              <View style={styles.taskRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskTitle}>Vent Seal</Text>
                  <Text style={styles.taskDesc}>+durat? la SEAL</Text>
                </View>
                <SoftButton
                  title={`UP ${upgradeVentSeal}`}
                  disabled={maintenancePoints <= 0}
                  onPress={() => {
                    if (maintenancePoints <= 0) return;
                    setUpgradeVentSeal((v) => v + 1);
                    setMaintenancePoints((p) => p - 1);
                  }}
                />
              </View>
              <View style={styles.taskRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskTitle}>Cam Clarity</Text>
                  <Text style={styles.taskDesc}>Glitch-uri mai scurte</Text>
                </View>
                <SoftButton
                  title={`UP ${upgradeCamClarity}`}
                  disabled={maintenancePoints <= 0}
                  onPress={() => {
                    if (maintenancePoints <= 0) return;
                    setUpgradeCamClarity((v) => v + 1);
                    setMaintenancePoints((p) => p - 1);
                  }}
                />
              </View>
              <View style={styles.taskRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskTitle}>Door Strength</Text>
                  <Text style={styles.taskDesc}>Rezisten?? u?i</Text>
                </View>
                <SoftButton
                  title={`UP ${upgradeDoorStrength}`}
                  disabled={maintenancePoints <= 0}
                  onPress={() => {
                    if (maintenancePoints <= 0) return;
                    setUpgradeDoorStrength((v) => v + 1);
                    setMaintenancePoints((p) => p - 1);
                  }}
                />
              </View>
              <View style={styles.taskRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskTitle}>Scan Mode</Text>
                  <Text style={styles.taskDesc}>Scan mai lung</Text>
                </View>
                <SoftButton
                  title={`UP ${upgradeScan}`}
                  disabled={maintenancePoints <= 0}
                  onPress={() => {
                    if (maintenancePoints <= 0) return;
                    setUpgradeScan((v) => v + 1);
                    setMaintenancePoints((p) => p - 1);
                  }}
                />
              </View>
              <View style={{ height: 10 }} />
              <SoftButton title="CONTINUE" onPress={closeMaintenance} />
            </View>
          </View>
        )}



        <HelpModal />

        {/* JUMPSCARE OVERLAY */}
        {jump.visible && (
          <View style={styles.jumpWrap}>
            <Animated.View style={{ transform: [{ translateX: shakeX }, { translateY: shakeY }] }}>
              <Image source={jump.img ?? IMG.jumpscare[0]} style={styles.jumpImg} resizeMode="cover" />
            </Animated.View>
            <View style={styles.jumpCaption}>
              <Text style={styles.jumpWho}>{jump.who || "???"}</Text>
              {!!jump.reason && <Text style={styles.jumpReason}>{jump.reason}</Text>}
              {recap.length > 0 && (
                <View style={styles.recapBox}>
                  {recap.map((e, i) => (
                    <Text key={`${e.t}-${i}`} style={styles.recapLine}>
                      â€¢ {e.msg}
                    </Text>
                  ))}
                </View>
              )}
              <Text style={styles.jumpSmall}>Tap oriunde ca să revii la meniu</Text>
            </View>
            <Pressable style={StyleSheet.absoluteFill} onPress={goMenu} />
          </View>
        )}
      </AnimatedImageBackground>
    </SafeAreaView>
  );
}

// ===================== STYLES =====================
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050509" },
  bg: { width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(4,6,10,0.88)" },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.85,
    shadowRadius: 40,
  },

  // MENU
  menuCave: { width: "100%", height: "100%", backgroundColor: "#0B0C0F" },
  menuCaveShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  menuFog: { position: "absolute", left: -40, right: -40, bottom: -30, height: 200, backgroundColor: "rgba(60,70,60,0.15)" },
  menuWrapAlt: { flex: 1, padding: 20, justifyContent: "center" },
  menuTitleBlock: { marginBottom: 18 },
  menuTitleBig: {
    fontSize: 54,
    fontWeight: "900",
    color: "#F2F2F2",
    letterSpacing: 2,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 3, height: 4 },
    textShadowRadius: 2,
  },
  menuTitleSub: { color: "rgba(220,220,230,0.75)", fontWeight: "800", marginTop: 2 },
  menuLeftActions: { width: 220, gap: 8 },
  glass: {
    backgroundColor: "#0F1421",
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.18)",
    borderRadius: 20,
  },
  menuBg: { width: "100%", height: "100%" },
  menuBgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(7,10,16,0.9)" },
  menuBgGlow: { position: "absolute", left: -40, right: -40, top: -40, height: 240, backgroundColor: "rgba(80,160,255,0.12)" },
  menuLayout: { flex: 1, flexDirection: "row", gap: 16, padding: 18 },
  menuSidebar: { width: 300, padding: 14, gap: 14 },
  menuProfile: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: 16, backgroundColor: "#121827" },
  menuAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(94,252,232,0.25)" },
  menuProfileName: { color: "#F2F2F2", fontWeight: "900" },
  menuProfileSub: { color: "rgba(220,220,230,0.6)", fontSize: 12 },
  menuNav: { gap: 10 },
  menuNavBtn: { padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "rgba(120,255,220,0.14)", backgroundColor: "#0F1524" },
  menuNavBtnActive: { borderColor: "rgba(120,255,220,0.35)", backgroundColor: "rgba(90,220,190,0.12)" },
  menuNavLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuNavIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#141A2A" },
  menuNavIconActive: { backgroundColor: "rgba(120,255,220,0.2)" },
  menuNavTitle: { color: "#F2F2F2", fontWeight: "800" },
  menuNavSub: { color: "rgba(220,220,230,0.6)", fontSize: 12 },
  menuNavKbd: { position: "absolute", right: 12, top: 12, color: "rgba(220,220,230,0.4)" },
  menuSidebarFooter: { marginTop: "auto" },

  menuMain: { flex: 1, gap: 14 },
  menuTopbar: { padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  menuBrand: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuBrandMark: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(94,252,232,0.22)" },
  menuBrandTitle: { color: "#F2F2F2", fontWeight: "900", fontSize: 18 },
  menuBrandSub: { color: "rgba(220,220,230,0.6)", fontSize: 12 },
  menuStatusRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  menuPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(120,255,220,0.18)", backgroundColor: "#101826" },
  adminActionsRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  adminFeedCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(12,18,28,0.65)",
    gap: 8,
  },
  menuPillText: { color: "rgba(220,220,230,0.8)", fontSize: 12 },
  menuPillStrong: { color: "#F2F2F2", fontWeight: "900" },
  menuDot: { width: 8, height: 8, borderRadius: 8, backgroundColor: "#34d399" },

  menuContentGrid: { flex: 1, flexDirection: "row", gap: 14 },
  menuHero: { flex: 1, padding: 16, minHeight: 240, gap: 8 },
  menuKicker: { color: "rgba(220,220,230,0.6)", fontSize: 12, letterSpacing: 4, textTransform: "uppercase" },
  menuHeroTitle: { color: "#F2F2F2", fontSize: 26, fontWeight: "900" },
  menuHeroDesc: { color: "rgba(220,220,230,0.65)", lineHeight: 18 },
  menuHeroActions: { marginTop: "auto", gap: 8 },
  menuRightCol: { width: 320, gap: 12 },
  menuPanel: { padding: 14 },
  menuPanelTitleRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  menuPanelTitle: { color: "#F2F2F2", fontWeight: "800" },
  menuPanelHint: { color: "rgba(220,220,230,0.5)", fontSize: 12 },
  menuStatGrid: { flexDirection: "row", gap: 10 },
  menuStatBox: { flex: 1, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: "rgba(120,255,220,0.14)", backgroundColor: "#0F1524" },
  menuStatLabel: { color: "rgba(220,220,230,0.6)", fontSize: 12 },
  menuStatValue: { color: "#F2F2F2", fontWeight: "900", fontSize: 18, marginTop: 6 },
  menuChallengeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 6 },
  menuCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.16)",
    padding: 20,
    backgroundColor: "#0F1421",
  },
  menuTag: { marginTop: 8, color: "rgba(220,220,235,0.7)" },
  menuStats: { flexDirection: "row", gap: 10, marginTop: 16 },
  menuStat: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#0F1524",
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.16)",
  },
  menuStatKey: { color: "rgba(220,220,230,0.75)", fontSize: 11, fontWeight: "800" },
  menuStatVal: { color: "#F1F1F1", fontSize: 16, fontWeight: "900", marginTop: 2 },
  menuActions: { marginTop: 16, gap: 8 },
  hint: { marginTop: 8, color: "rgba(230,230,240,0.62)", lineHeight: 20 },
  mono: { fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), color: "#D6D6FF" },

  menuHub: { flex: 1, gap: 14, padding: 16 },
  menuHeader: { padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  menuHeaderRight: { alignItems: "flex-end", gap: 8 },
  menuGrid: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  menuGridMobile: { flexDirection: "column" },
  menuCardBig: { width: "48%", minHeight: 240, padding: 18, gap: 8, borderRadius: 26 },
  menuCard: { width: "24%", minHeight: 200, padding: 14, gap: 8, borderRadius: 22 },
  menuCardMobile: { width: "100%" },

  quickActions: { padding: 12, borderRadius: 20 },
  quickTitle: { color: "rgba(230,230,240,0.75)", fontWeight: "900", marginBottom: 8, letterSpacing: 1 },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  row: { flexDirection: "row", gap: 10 },
  statPill: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#101826",
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.16)",
  },
  statKey: { color: "rgba(220,220,230,0.75)", fontSize: 12, fontWeight: "700" },
  statVal: { color: "#F1F1F1", fontSize: 18, fontWeight: "900", marginTop: 2 },

  bgPicker: {
    marginTop: 16,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#0F1421",
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.16)",
  },
  bgPickerTitle: { color: "rgba(230,230,240,0.72)", fontWeight: "800", marginBottom: 8 },
  bgThumbWrap: {
    width: 120,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.16)",
    backgroundColor: "#121827",
  },
  bgThumbActive: { borderColor: "rgba(140,255,210,0.35)" },
  bgThumb: { width: "100%", height: 70 },
  bgThumbLabel: { padding: 8, color: "rgba(240,240,245,0.85)", fontWeight: "700", textAlign: "center" },

  // LOADING / LOGIN / SCORE / STATS
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#07080B" },
  loadingOrb: { width: 120, height: 120, borderRadius: 120, backgroundColor: "rgba(120,255,190,0.08)" },
  loadingTitle: { color: "#F2F2F2", fontSize: 32, fontWeight: "900", letterSpacing: 1.2 },
  loadingSub: { color: "rgba(220,220,230,0.7)" },

  loginBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(4,6,10,0.9)" },
  loginWrap: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
  loginCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#0E121C",
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.18)",
  },
  loginKicker: { color: "rgba(220,220,230,0.6)", letterSpacing: 3, textTransform: "uppercase", fontSize: 11 },
  loginTitle: { color: "#F2F2F2", fontSize: 30, fontWeight: "900", marginTop: 6 },
  loginSub: { color: "rgba(220,220,230,0.7)", marginBottom: 10, marginTop: 6 },
  loginLabel: { color: "rgba(220,220,230,0.75)", fontSize: 12, fontWeight: "800", marginBottom: 6, marginTop: 8 },
  loginInput: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.2)",
    backgroundColor: "#131A2B",
    color: "#F2F2F2",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  loginHint: { color: "rgba(220,220,230,0.55)", fontSize: 12, marginTop: 10, marginBottom: 8 },
  fontChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
    marginRight: 8,
  },
  fontChipOn: { borderColor: "#4f9cff", backgroundColor: "rgba(79,156,255,0.12)" },
  fontChipTxt: { color: "#EAF2FF", fontWeight: "800" },
  bannerTile: {
    width: 120,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  bannerTileOn: { borderColor: "#4f9cff", shadowColor: "#4f9cff", shadowOpacity: 0.6, shadowRadius: 10 },
  bannerImg: { width: "100%", height: 70 },
  bannerLabel: { color: "#EAF2FF", textAlign: "center", paddingVertical: 4, fontSize: 12, fontWeight: "800" },
  loginActionRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  loginActionBtn: { flex: 1 },
  loginOr: { color: "rgba(220,220,230,0.55)", fontSize: 12, fontWeight: "800", letterSpacing: 1 },

  seedWrap: { padding: 18, gap: 12 },
  seedCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.16)",
    padding: 16,
    backgroundColor: "#0F1421",
  },
  seedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  seedName: { color: "#F2F2F2", fontWeight: "900" },
  seedMetaRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  seedMeta: { color: "rgba(220,220,230,0.7)", fontSize: 12 },
  spinResult: { color: "#EAF2FF", fontWeight: "900", marginLeft: 10 },
  spinPity: { color: "rgba(230,230,240,0.8)", fontWeight: "800", marginLeft: 10, marginTop: 6 },
  spinBetText: { color: "#EAF2FF", fontWeight: "900" },
  spinWrap: { paddingHorizontal: 18, paddingTop: 40, gap: 16, flex: 1 },
  spinTitle: { color: "#F2F2F2", fontSize: 26, fontWeight: "900" },
  spinSub: { color: "rgba(220,220,230,0.7)" },
  spinWindow: {
    marginTop: 12,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(0,0,0,0.35)",
    overflow: "hidden",
    justifyContent: "center",
  },
  spinItem: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "rgba(15,20,30,0.85)",
    marginHorizontal: 6,
    alignItems: "center",
  },
  spinItemName: { color: "#EAF2FF", fontWeight: "900", textAlign: "center" },
  spinItemRarity: { color: "rgba(220,220,230,0.7)", fontSize: 12, marginTop: 4 },
  spinIndicator: {
    position: "absolute",
    left: "50%",
    width: 6,
    height: "100%",
    marginLeft: -3,
    backgroundColor: "#4f9cff",
    opacity: 0.75,
  },
  spinActions: { flexDirection: "row", gap: 10, alignItems: "center" },

  profileAvatar: { width: 72, height: 72, borderRadius: 18, alignSelf: "flex-start" },
  profileAvatarPlaceholder: { width: 72, height: 72, borderRadius: 18, backgroundColor: "#141A2A" },
  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  avatarTile: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#0F1421",
    overflow: "hidden",
  },
  avatarTileOn: { borderColor: "rgba(79,156,255,0.7)", shadowColor: "#4f9cff", shadowOpacity: 0.5, shadowRadius: 10 },
  avatarTileImg: { width: "100%", height: "100%" },
  profileList: { marginTop: 6, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  profileName: { color: "#F2F2F2", fontWeight: "900" },
  profileNameLarge: { color: "#F2F2F2", fontWeight: "900", fontSize: 18, marginTop: 8 },
  profileMeta: { color: "rgba(220,220,230,0.7)", fontSize: 12, marginTop: 2 },
  profileStatsRow: { flexDirection: "row", gap: 12, flexWrap: "wrap", marginTop: 6 },

  socialWrap: { padding: 18, gap: 12 },
  socialCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.16)",
    padding: 16,
    backgroundColor: "#0F1421",
  },
  socialHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  socialName: { color: "#F2F2F2", fontWeight: "900", fontSize: 16 },
  socialBody: { color: "rgba(230,230,240,0.9)", marginTop: 6, lineHeight: 18 },
  socialMeta: { color: "rgba(220,220,230,0.7)", marginTop: 6, fontSize: 12 },
  socialActions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  commentBox: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  commentLine: { color: "rgba(220,220,230,0.75)", fontSize: 12, marginTop: 4 },

  menuSimpleWrap: { padding: 20, gap: 12 },
  menuSimpleCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.16)",
    padding: 16,
    backgroundColor: "#0F1421",
  },
  menuProfileRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  hubShell: { flex: 1, flexDirection: "row", gap: 12, padding: 16 },
  hubSidebar: { width: 220, padding: 12, backgroundColor: "#0F1421", borderRadius: 18, borderWidth: 1, borderColor: "rgba(120,255,220,0.16)" },
  hubMain: { flex: 1, gap: 12 },
  hubRight: { width: 240, padding: 12, backgroundColor: "#0F1421", borderRadius: 18, borderWidth: 1, borderColor: "rgba(120,255,220,0.16)" },
  hubTopbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  hubTitle: { color: "#F2F2F2", fontWeight: "900", fontSize: 20 },
  hubSearch: { flex: 1, borderRadius: 999, backgroundColor: "#131A2B", color: "#F2F2F2", paddingHorizontal: 14, paddingVertical: 10 },
  hubSearchAlt: { borderRadius: 16, backgroundColor: "#131A2B", color: "#F2F2F2", paddingHorizontal: 14, paddingVertical: 10 },
  hubComposer: { borderRadius: 18, backgroundColor: "#0F1421", borderWidth: 1, borderColor: "rgba(120,255,220,0.16)", padding: 12, gap: 8 },
  hubComposerInput: { minHeight: 60, color: "#F2F2F2", backgroundColor: "#131A2B", borderRadius: 14, padding: 10 },
  hubFeed: { paddingVertical: 8, gap: 12 },
  hubCard: { backgroundColor: "#0F1421", borderRadius: 18, borderWidth: 1, borderColor: "rgba(120,255,220,0.16)", padding: 12, gap: 6 },
  hubCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hubCardTitle: { color: "#F2F2F2", fontWeight: "900" },
  hubCardBody: { color: "rgba(230,230,240,0.9)" },
  hubCardMeta: { color: "rgba(220,220,230,0.7)", fontSize: 12 },
  hubNavItem: { paddingVertical: 8 },
  hubNavText: { color: "#E8E8F0" },
  hubBody: { flex: 1, flexDirection: "row", gap: 12 },
  hubContent: { flex: 1, backgroundColor: "#0F1421", borderRadius: 18, borderWidth: 1, borderColor: "rgba(120,255,220,0.16)" },

  loginShell: { flex: 1, flexDirection: "row", padding: 24, gap: 16 },
  loginHero: { flex: 1.2, borderRadius: 24, backgroundColor: "rgba(37,140,244,0.12)", padding: 24, justifyContent: "center" },
  loginHeroTitle: { color: "#EAF2FF", fontSize: 32, fontWeight: "900" },
  loginHeroSub: { color: "rgba(220,230,255,0.7)", marginTop: 8 },
  loginHeroCard: { height: 200, borderRadius: 18, backgroundColor: "rgba(15,20,33,0.5)", marginTop: 16 },
  loginPanel: { flex: 1, borderRadius: 24, backgroundColor: "#0E121C", borderWidth: 1, borderColor: "rgba(120,255,220,0.18)", padding: 18 },

  scoreWrap: { flex: 1, padding: 18, justifyContent: "center" },
  scoreCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.16)",
    padding: 16,
    backgroundColor: "#0F1421",
  },
  scoreTitle: { fontSize: 26, fontWeight: "900", color: "#F2F2F2" },
  scoreSub: { color: "rgba(220,220,230,0.7)", marginTop: 2 },
  scoreTabs: { flexDirection: "row", gap: 8, marginTop: 10, marginBottom: 6, flexWrap: "wrap" },
  scoreTabBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  scoreTabBtnActive: { backgroundColor: "rgba(79,156,255,0.18)", borderColor: "rgba(79,156,255,0.65)" },
  scoreTabText: { color: "rgba(220,220,230,0.7)", fontWeight: "800" },
  scoreTabTextActive: { color: "#9ad5ff" },
  scoreEmpty: { color: "rgba(220,220,230,0.6)", marginTop: 8 },
  podium: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", paddingVertical: 12, gap: 10 },
  podiumCol: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(15,15,20,0.7)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    minWidth: 90,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  pod1: { transform: [{ translateY: -12 }], backgroundColor: "rgba(255,215,0,0.12)", borderColor: "rgba(255,215,0,0.35)" },
  pod2: { transform: [{ translateY: 0 }], backgroundColor: "rgba(192,192,192,0.12)", borderColor: "rgba(192,192,192,0.30)" },
  pod3: { transform: [{ translateY: 8 }], backgroundColor: "rgba(205,127,50,0.12)", borderColor: "rgba(205,127,50,0.30)" },
  podPlace: { color: "rgba(255,255,255,0.9)", fontWeight: "900", fontSize: 16 },
  podName: { color: "#EAF2FF", fontWeight: "900", marginTop: 4 },
  podScore: { color: "#9ad5ff", fontWeight: "900", fontSize: 18 },
  podMeta: { color: "rgba(220,220,230,0.75)", fontSize: 12 },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  scoreIdx: { color: "rgba(220,220,230,0.6)", width: 30 },
  scoreName: { color: "#F2F2F2", fontWeight: "800" },
  scoreMeta: { color: "rgba(220,220,230,0.6)", fontSize: 12 },
  scoreVal: { color: "#FFB86B", fontWeight: "900", fontSize: 16 },

  statsWrap: { flex: 1, padding: 18, justifyContent: "center" },
  intelScroll: { paddingBottom: 32 },
  statsCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.16)",
    padding: 16,
    backgroundColor: "#0F1421",
  },
  statsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  statsLabel: { color: "rgba(220,220,230,0.7)", fontWeight: "700" },
  statsVal: { color: "#F2F2F2", fontWeight: "900" },
  achRow: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  achName: { color: "rgba(220,220,230,0.65)", fontWeight: "900" },
  achNameOn: { color: "#B6FFD6" },
  achDesc: { color: "rgba(220,220,230,0.55)", fontSize: 12, marginTop: 2 },
  contractRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  contractName: { color: "#F2F2F2", fontWeight: "900" },
  contractDesc: { color: "rgba(220,220,230,0.55)", fontSize: 12, marginTop: 2 },
  contractMeta: { color: "#FFB86B", fontWeight: "900" },

  shopRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  shopTitle: { color: "#F2F2F2", fontWeight: "900" },
  shopDesc: { color: "rgba(220,220,230,0.7)", fontSize: 12, marginTop: 2 },
  shopMeta: { color: "rgba(255,200,120,0.8)", fontSize: 12, marginTop: 4, fontWeight: "800" },
  shopSlots: { flexDirection: "row", gap: 10, marginTop: 8 },
  shopSlot: { flex: 1, padding: 10, borderRadius: 12, backgroundColor: "#101826", borderWidth: 1, borderColor: "rgba(120,255,220,0.14)" },
  shopSlotVal: { color: "#F2F2F2", fontWeight: "900", marginTop: 6 },
  workshopHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  workshopBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(120,255,190,0.35)", backgroundColor: "rgba(90,255,180,0.08)" },
  workshopBadgeTxt: { color: "rgba(210,255,230,0.9)", fontWeight: "900", fontSize: 11, letterSpacing: 1 },
  workshopGrid: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  workshopCard: { flex: 1, minWidth: 260, padding: 14, borderRadius: 18 },
  workshopBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(6,8,14,0.94)" },
  workshopScroll: { paddingBottom: 32 },
  workshopWrap: { flex: 1, padding: 20, gap: 16 },
  workshopHero: {
    padding: 18,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.18)",
    backgroundColor: "#141B2D",
  },
  workshopKicker: { color: "rgba(220,220,235,0.7)", letterSpacing: 4, fontSize: 12 },
  workshopTitle: { color: "#F2F2F2", fontSize: 30, fontWeight: "900", marginTop: 6 },
  workshopDesc: { color: "rgba(220,220,230,0.7)", marginTop: 6, lineHeight: 18 },
  workshopMetaRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  workshopMetaPill: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#101826", borderWidth: 1, borderColor: "rgba(120,255,220,0.16)" },
  workshopMetaTxt: { color: "rgba(220,220,230,0.7)", fontSize: 11, fontWeight: "800" },
  workshopMetaVal: { color: "#F2F2F2", fontWeight: "900", marginTop: 2 },
  workshopHeroActions: { marginTop: 12, alignItems: "flex-start" },
  workshopMain: { flex: 1, gap: 14 },
  workshopSection: { padding: 14, borderRadius: 22, borderWidth: 1, borderColor: "rgba(120,255,220,0.14)", backgroundColor: "#0F1421" },
  sectionTitle: { color: "#F2F2F2", fontWeight: "900", marginBottom: 10 },
  cardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  itemCard: {
    width: "48%",
    minHeight: 120,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.16)",
    backgroundColor: "#101626",
    shadowOpacity: 0.45,
    shadowRadius: 16,
  },
  itemCardCompact: { minHeight: 90 },
  itemIconWrap: { marginBottom: 8 },
  itemIcon: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, backgroundColor: "rgba(120,255,190,0.15)" },
  itemTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  itemTitle: { color: "#F2F2F2", fontWeight: "900" },
  itemDesc: { color: "rgba(220,220,230,0.65)", fontSize: 12, marginTop: 4 },
  itemCost: { color: "rgba(255,200,120,0.8)", fontSize: 12, marginTop: 6, fontWeight: "800" },
  rarityPill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  rarityTxt: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  loadoutRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  loadoutCard: { flex: 1, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.05)" },
  slotCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(15,18,28,0.8)",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  slotLabel: { color: "rgba(220,220,230,0.7)", fontWeight: "800", letterSpacing: 0.3 },
  slotName: { color: "#EAF2FF", fontWeight: "900", fontSize: 15, marginTop: 6 },
  slotHint: { marginTop: 6, color: "rgba(220,220,230,0.6)", fontSize: 11, fontStyle: "italic" },
  slotClear: { marginTop: 10, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  slotClearTxt: { color: "rgba(255,220,220,0.85)", fontWeight: "800", fontSize: 11 },
  pickHint: { color: "rgba(220,220,230,0.7)", marginTop: 8, fontStyle: "italic", textAlign: "center" },

  intelRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  intelImg: { width: 50, height: 50, borderRadius: 10 },
  intelName: { color: "#F2F2F2", fontWeight: "900" },
  intelMeta: { color: "rgba(220,220,230,0.7)", fontSize: 12, marginTop: 2 },
  intelDesc: { color: "rgba(220,220,230,0.6)", fontSize: 12, marginTop: 4 },

  // SELECT
  selectHeaderAlt: { paddingHorizontal: 18, paddingTop: 16 },
  selectShell: { flex: 1, paddingHorizontal: 16, paddingBottom: 12 },
  selectTopbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },
  selectTopActions: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  selectTopbarStack: { flexDirection: "column", alignItems: "flex-start" },
  selectTopActionsStack: { width: "100%", justifyContent: "flex-start" },
  selectStatPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(10,15,20,0.55)",
    minWidth: 110,
  },
  selectStatLabel: { color: "rgba(220,220,230,0.6)", fontSize: 11, fontWeight: "800" },
  selectStatValue: { color: "#F2F2F2", fontSize: 14, fontWeight: "900", marginTop: 2 },
  selectLayoutNew: { flex: 1, flexDirection: "row", gap: 12, paddingBottom: 14 },
  selectPanel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(10,15,20,0.55)",
    overflow: "hidden",
  },
  selectGridPanel: { flex: 1 },
  selectSidePanel: { width: 360, padding: 14 },
  panelHeader: { padding: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  panelTitle: { color: "#F2F2F2", fontSize: 16, fontWeight: "900" },
  panelMeta: { color: "rgba(220,220,230,0.6)", fontSize: 12, marginTop: 4 },
  selectTitleAlt: { fontSize: 28, fontWeight: "900", color: "#F2F2F2", letterSpacing: 1 },
  selectSubAlt: { marginTop: 4, color: "rgba(220,220,230,0.7)" },
  selectLayout: { flex: 1, flexDirection: "row", gap: 12, padding: 14 },
  selectLayoutStack: { flexDirection: "column" },
  selectGridCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#0F1421",
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.16)",
  },
  selectSide: {
    width: 200,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "#0F1421",
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.16)",
  },
  selectSideStack: { width: "100%" },
  sideTitle: { color: "rgba(230,230,240,0.8)", fontWeight: "900", marginBottom: 6 },
  sideMeta: { color: "rgba(220,220,230,0.7)", marginTop: 4 },
  infoCard: {
    marginTop: 6,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#0B0F1A",
    borderWidth: 1,
    borderColor: "rgba(120,255,220,0.14)",
  },
  infoName: { color: "#F2F2F2", fontWeight: "900", fontSize: 14 },
  infoMeta: { color: "rgba(220,220,230,0.7)", marginTop: 4, fontSize: 12 },
  infoDesc: { color: "rgba(240,240,245,0.85)", marginTop: 6, fontSize: 12, lineHeight: 16 },
  customRow: { marginTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  customBtns: { flexDirection: "row", gap: 6 },
  customBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  customBtnTxt: { color: "#F2F2F2", fontWeight: "900" },

  charTile: { aspectRatio: 1, padding: 4 },
  charTileOn: { transform: [{ scale: 0.96 }] },
  charTileImg: { width: "100%", height: "100%", borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  charTileGlow: {
    ...StyleSheet.absoluteFillObject,
    margin: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(120,255,190,0.9)",
    shadowColor: "#6BFFC8",
    shadowOpacity: 0.9,
    shadowRadius: 14,
  },
  threatBar: {
    position: "absolute",
    left: 6,
    right: 6,
    bottom: 26,
    height: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  threatFill: { height: 6, borderRadius: 6, backgroundColor: "#34D399" },
  cooldownBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cooldownText: { color: "#E6F2FF", fontSize: 9, fontWeight: "900" },
  charTileFooter: {
    position: "absolute",
    left: 6,
    right: 6,
    bottom: 6,
    height: 18,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  charTileTxt: { color: "#F2F2F2", fontSize: 10, fontWeight: "900" },
  charTileFooterCompact: {
    position: "absolute",
    left: 4,
    right: 4,
    bottom: 4,
    height: 16,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  charTileTxtCompact: { color: "#F2F2F2", fontSize: 9, fontWeight: "900" },

  // PLAY
  hud: { paddingHorizontal: 12, paddingTop: 10 },
  hudCompact: { paddingHorizontal: 8, paddingTop: 6 },
  hudUltra: { paddingHorizontal: 6, paddingTop: 4 },
  hudTop: { flexDirection: "row", gap: 10, alignItems: "center" },
  hudTopWrap: { flexWrap: "wrap" },
  hudPill: {
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(15,15,20,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  hudPillCompact: { flexBasis: "48%", paddingVertical: 6 },
  hudPillUltra: { flexBasis: "100%", paddingVertical: 5 },
  hudKey: { color: "rgba(220,220,230,0.70)", fontSize: 12, fontWeight: "800" },
  hudKeyCompact: { fontSize: 11 },
  hudKeyUltra: { fontSize: 10 },
  hudVal: { color: "#F2F2F2", fontSize: 16, fontWeight: "900", marginTop: 2 },
  hudValCompact: { fontSize: 14, marginTop: 1 },
  hudValUltra: { fontSize: 13, marginTop: 1 },

  bars: {
    marginTop: 10,
    borderRadius: 22,
    padding: 12,
    backgroundColor: "rgba(15,15,20,0.60)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  barsCompact: { padding: 10, borderRadius: 16 },
  barsUltra: { padding: 8, borderRadius: 14 },
  barRow: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  barRowCompact: { marginVertical: 4 },
  barRowUltra: { marginVertical: 3 },
  barLabel: { width: 62, color: "rgba(235,235,245,0.80)", fontWeight: "800" },
  barLabelCompact: { width: 52, fontSize: 10 },
  barLabelUltra: { width: 46, fontSize: 9 },
  barTrack: { flex: 1, height: 12, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.10)", overflow: "hidden" },
  barFill: { height: 12, borderRadius: 10 },
  barTrackCompact: { height: 10 },
  barTrackUltra: { height: 8 },
  barFillCompact: { height: 10 },
  barFillUltra: { height: 8 },
  barVal: { width: 70, textAlign: "right", color: "rgba(235,235,245,0.80)", fontWeight: "900" },
  barValCompact: { width: 58, fontSize: 11 },
  barValUltra: { width: 52, fontSize: 10 },

  statusRow: { marginTop: 8, flexDirection: "row", gap: 8, flexWrap: "wrap" },
  statusRowWrap: { flexWrap: "wrap" },
  statusPill: {
    flexGrow: 1,
    flexBasis: 120,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "rgba(15,15,20,0.60)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  statusPillOn: { borderColor: "rgba(120,255,190,0.35)", backgroundColor: "rgba(90,255,180,0.10)" },
  statusPillCompact: { flexBasis: 104, paddingVertical: 6 },
  statusPillUltra: { flexBasis: "100%", paddingVertical: 5 },
  statusKey: { color: "rgba(220,220,230,0.7)", fontSize: 11, fontWeight: "800" },
  statusKeyCompact: { fontSize: 10 },
  statusKeyUltra: { fontSize: 9 },
  statusVal: { color: "#F2F2F2", fontWeight: "900", marginTop: 2 },
  statusValCompact: { fontSize: 12, marginTop: 1 },
  statusValUltra: { fontSize: 11, marginTop: 1 },
  damagePill: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,90,90,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,90,90,0.35)",
  },
  damageKey: { color: "rgba(255,200,200,0.9)", fontSize: 11, fontWeight: "800" },
  damageVal: { color: "#FFD3D3", fontWeight: "900", marginTop: 2 },

  staticOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.18)" },
  overlayStrong: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(4,6,10,0.92)" },
  glitchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(120,255,190,0.35)",
  },
  deadZoneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,16,0.55)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,90,90,0.35)",
  },
  deadZoneText: { color: "#FF8B8B", fontWeight: "900", letterSpacing: 1 },
  sanityOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.06)" },
  ghostDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "rgba(160,200,255,0.6)",
    borderWidth: 1,
    borderColor: "rgba(200,230,255,0.8)",
  },

  lookZones: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lookZoneLeft: {
    width: "28%",
    height: "100%",
    justifyContent: "center",
    paddingLeft: 12,
  },
  lookZoneRight: {
    width: "28%",
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 12,
  },
  lookZoneTxt: { color: "rgba(230,230,240,0.45)", fontSize: 26, fontWeight: "900" },
  lookZoneTxtSmall: { fontSize: 18 },

  powerOutOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.88)", alignItems: "center", justifyContent: "center" },
  powerOutLight: { width: 120, height: 120, borderRadius: 80, backgroundColor: "rgba(255,255,220,0.08)" },

  jamBanner: {
    position: "absolute",
    top: 110,
    alignSelf: "center",
    backgroundColor: "rgba(20,20,26,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,184,107,0.28)",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  jamTitle: { color: "#FFB86B", fontWeight: "900", fontSize: 16, textAlign: "center" },
  jamSub: { color: "rgba(240,240,245,0.75)", marginTop: 4, textAlign: "center" },

  falseAlarmBanner: {
    position: "absolute",
    top: 160,
    alignSelf: "center",
    backgroundColor: "rgba(20,20,26,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,120,120,0.35)",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  blackoutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  blackoutTitle: { color: "#F1F1F1", fontWeight: "900", fontSize: 26, letterSpacing: 2 },
  blackoutSub: { color: "rgba(230,230,240,0.7)", marginTop: 6 },

  radioBanner: {
    position: "absolute",
    top: 70,
    alignSelf: "center",
    backgroundColor: "rgba(15,18,24,0.85)",
    borderWidth: 1,
    borderColor: "rgba(120,220,255,0.25)",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  radioText: { color: "rgba(210,230,255,0.9)", fontWeight: "800", fontSize: 12 },

  achieveBanner: {
    position: "absolute",
    top: 42,
    alignSelf: "center",
    backgroundColor: "rgba(20,24,18,0.9)",
    borderWidth: 1,
    borderColor: "rgba(120,255,190,0.35)",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  achieveText: { color: "#B6FFD6", fontWeight: "900", fontSize: 12 },

  motionBanner: {
    position: "absolute",
    top: 130,
    alignSelf: "center",
    backgroundColor: "rgba(15,18,24,0.85)",
    borderWidth: 1,
    borderColor: "rgba(120,255,190,0.25)",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  motionText: { color: "rgba(210,255,230,0.9)", fontWeight: "800", fontSize: 12 },
  panicBanner: {
    position: "absolute",
    top: 190,
    alignSelf: "center",
    backgroundColor: "rgba(60,20,20,0.85)",
    borderWidth: 1,
    borderColor: "rgba(255,120,120,0.35)",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  panicText: { color: "#FF8A8A", fontWeight: "900", letterSpacing: 2 },

  miniMap: {
    position: "absolute",
    right: 12,
    top: 190,
    width: 150,
    borderRadius: 16,
    padding: 10,
    backgroundColor: "rgba(15,15,20,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  miniMapTitle: { color: "rgba(220,220,230,0.75)", fontWeight: "900", fontSize: 11, marginBottom: 6, textAlign: "center" },
  miniMapCanvas: { width: "100%", aspectRatio: 1.15 },
  miniMapLegend: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  miniMapLegendText: { color: "rgba(220,220,230,0.6)", fontWeight: "800", fontSize: 10 },
  mapNode: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginLeft: -5,
    marginTop: -5,
  },
  mapDot: { width: 6, height: 6, borderRadius: 6, backgroundColor: "#FF6B6B", alignSelf: "center", marginTop: 1 },
  mapPulse: {
    position: "absolute",
    left: -6,
    top: -6,
    right: -6,
    bottom: -6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(120,255,190,0.6)",
  },
  mapStar: { position: "absolute", right: -4, top: -10, color: "#FFD166", fontSize: 12, fontWeight: "900" },
  rareLootWrap: { position: "absolute", right: 12, top: 86 },

  spriteWrap: {
    position: "absolute",
    width: 170,
    height: 210,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  sprite: { width: 170, height: 185, opacity: 0.96 },
  spriteLabel: {
    marginTop: -6,
    color: "rgba(245,245,255,0.88)",
    fontWeight: "900",
    fontSize: 12,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 10,
  },

  dock: { position: "absolute", left: 10, right: 10, bottom: 10, gap: 10 },
  dockCompact: { left: 6, right: 6, bottom: 6 },
  dockScroll: { maxHeight: 260 },
  dockScrollContent: { gap: 10 },
  dockRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  dockRowCompact: { gap: 6 },

  softBtn: {
    flexGrow: 1,
    flexBasis: 124,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  softBtnCompact: {
    flexBasis: 0,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  softBtnUltra: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 14,
  },
  softBtnPressed: { transform: [{ scale: 0.98 }] },
  softBtnTitle: { color: "#F3F3F3", fontWeight: "900", fontSize: 14 },
  softBtnTitleCompact: { fontSize: 12 },
  softBtnTitleUltra: { fontSize: 11 },
  softBtnSub: { marginTop: 4, color: "rgba(230,230,240,0.65)", fontWeight: "700", fontSize: 11 },
  softBtnSubCompact: { fontSize: 9, marginTop: 2 },
  softBtnSubUltra: { fontSize: 8, marginTop: 1 },

  fanPill: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  fanTxt: { color: "#EDEDED", fontWeight: "900" },

  camStrip: {
    borderRadius: 18,
    backgroundColor: "rgba(15,15,20,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingVertical: 10,
  },
  camChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  camChipActive: { borderColor: "rgba(90,255,180,0.30)", backgroundColor: "rgba(90,255,180,0.10)" },
  camChipTxt: { color: "rgba(235,235,245,0.78)", fontWeight: "800" },
  camChipTxtActive: { color: "#EFFFF6" },

  // modal
  modalWrap: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "center", padding: 18 },
  modalCard: {
    borderRadius: 26,
    padding: 16,
    backgroundColor: "rgba(15,15,20,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  modalTitle: { fontSize: 28, fontWeight: "900", color: "#F3F3F3" },
  modalSub: { marginTop: 6, color: "rgba(230,230,240,0.72)", lineHeight: 20 },
  modalProgress: { marginTop: 8, color: "#FFB86B", fontWeight: "900" },
  helpLine: { color: "rgba(230,230,240,0.8)", marginTop: 6, lineHeight: 18 },

  genRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  genSwitch: {
    flex: 1,
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  genSwitchHint: { borderColor: "rgba(90,255,180,0.30)", backgroundColor: "rgba(90,255,180,0.10)" },
  genSwitchDisabled: { opacity: 0.5 },
  genSwitchTitle: { color: "#F3F3F3", fontWeight: "900" },
  genLever: { width: 18, height: 90, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.12)", marginTop: 12 },
  genDot: { width: 12, height: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.22)", marginTop: 14 },
  genDotHint: { backgroundColor: "rgba(90,255,180,0.95)" },

  taskRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  taskTitle: { color: "#F2F2F2", fontWeight: "900" },
  taskDesc: { color: "rgba(220,220,230,0.7)", fontSize: 12, marginTop: 2 },
  taskMeta: { color: "rgba(255,200,120,0.8)", fontSize: 12, marginTop: 4, fontWeight: "800" },
  skillRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  skillTitle: { color: "#F2F2F2", fontWeight: "900" },
  skillDesc: { color: "rgba(220,220,230,0.7)", fontSize: 12, marginTop: 2 },
  skillMeta: { color: "rgba(120,255,190,0.8)", fontSize: 12, marginTop: 4, fontWeight: "800" },
  fogOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(200,200,210,0.10)" },
  spikeBanner: {
    position: "absolute",
    top: 230,
    alignSelf: "center",
    backgroundColor: "rgba(15,18,24,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,120,120,0.35)",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  spikeTitle: { color: "#FFB3B3", fontWeight: "900", textAlign: "center" },
  spikeRow: { marginTop: 8, flexDirection: "row", gap: 8, justifyContent: "center" },

  // jumpscare
  jumpWrap: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.92)", justifyContent: "center", alignItems: "center" },
  jumpImg: { width: SW * 0.92, height: SH * 0.62, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,120,120,0.25)" },
  jumpCaption: { marginTop: 14, alignItems: "center" },
  jumpWho: { color: "#FF6B6B", fontWeight: "900", fontSize: 24 },
  jumpReason: { marginTop: 6, color: "rgba(255,220,220,0.8)", fontWeight: "800" },
  recapBox: { marginTop: 8, padding: 8, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)" },
  recapLine: { color: "rgba(230,230,240,0.8)", fontSize: 12, marginTop: 2 },
  jumpSmall: { marginTop: 6, color: "rgba(235,235,245,0.72)" },
});






