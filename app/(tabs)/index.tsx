import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

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
type Screen = "LOADING" | "LOGIN" | "MENU" | "SELECT" | "PLAY" | "SCORES" | "STATS" | "WORKSHOP" | "INTEL";
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
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
let randGlobal = () => Math.random();
const pick = <T,>(arr: T[]) => arr[Math.floor(randGlobal() * arr.length)];
const hash01 = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (Math.abs(h) % 1000) / 1000;
};

const { width: SW, height: SH } = Dimensions.get("window");

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

const SKILL_DEFS: { id: SkillId; name: string; desc: string; cost: number }[] = [
  { id: "scanRange", name: "Scan Range", desc: "+durata scan", cost: 120 },
  { id: "doorSpeed", name: "Door Speed", desc: "+rezistență uși", cost: 140 },
  { id: "camClarity", name: "Cam Clarity", desc: "-glitch / -dead zones", cost: 150 },
];

const CONTRACT_DEFS: { id: string; name: string; desc: string; target: number; reward: number }[] = [
  { id: "scan3", name: "Operator Scan", desc: "Folosește scan de 3 ori într-o noapte.", target: 3, reward: 90 },
  { id: "noDoors", name: "Silent Night", desc: "Supraviețuiește fără uși.", target: 1, reward: 120 },
  { id: "tasks2", name: "Maintenance", desc: "Completează 2 task-uri.", target: 2, reward: 110 },
];

const GADGET_SHOP: { id: Gadget; name: string; cost: number; desc: string; rarity: "common" | "rare" | "epic" }[] = [
  { id: "sealTape", name: "Seal Tape", cost: 6, desc: "Blochează venturile mai mult timp.", rarity: "common" },
  { id: "flashCharge", name: "Flash Charge", cost: 7, desc: "Reîncărcare extra pentru LIGHT.", rarity: "rare" },
  { id: "batterySwap", name: "Battery Swap", cost: 8, desc: "Mic boost instant la Power.", rarity: "rare" },
  { id: "signalJammer", name: "Signal Jammer", cost: 9, desc: "Blochează temporar semnalul AI.", rarity: "epic" },
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
  { id: "firstNight", name: "First Night", desc: "Supraviețuiește până la 1 AM." },
  { id: "firstTask", name: "Task Runner", desc: "Completează primul task." },
  { id: "surge", name: "Power Surge", desc: "Supraviețuiește unui power surge." },
  { id: "blackout", name: "In the Dark", desc: "Treci printr-un blackout." },
  { id: "night6", name: "Night 6", desc: "Termină Night 6." },
  { id: "hardcore", name: "Hardcore", desc: "Câștigă în Hardcore." },
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

// UI helpers
const shadow = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  android: { elevation: 12 },
  default: {},
});

export default function App() {
  const [screen, setScreen] = useState<Screen>("LOADING");
  const [profileName, setProfileName] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [scoreLog, setScoreLog] = useState<{ score: number; night: number; who: string; ts: number }[]>([]);

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
  const canStart = presetActive || selectedList.length >= 4;

  // async score
  const [best, setBest] = useState(0);
  const [credits, setCredits] = useState(0);
  const [intel, setIntel] = useState<Record<string, number>>({});
  const [achievements, setAchievements] = useState<Record<string, boolean>>({});
  const [achievementToast, setAchievementToast] = useState("");
  const [achievementUntil, setAchievementUntil] = useState(0);
  const [inventory, setInventory] = useState<Record<string, number>>({});

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

  const [profilePass, setProfilePass] = useState("");

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
  const isCd = (until: number) => now() < until;
  const cdLeft = (until: number) => Math.max(0, (until - now()) / 1000);

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

  const camView = VIEWS[camIndex] ?? VIEWS[0];
  const camDead = cameraOpen && (camDeadUntil[camView.id] ?? 0) > now();
  const powerDead = power <= 0;
  const systemDisabled = powerDead || blackout || fuseActive;
  const glitchStorm = nightModifiers.includes("glitchStorm");
  const spikeBlocksCams = powerSpike && powerSpikeChoice === "DOORS";
  const spikeBlocksDoors = powerSpike && powerSpikeChoice === "CAMS";

  // Load best
  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(BEST_KEY);
        if (v) setBest(parseInt(v, 10) || 0);
        const profile = await AsyncStorage.getItem(PROFILE_KEY);
        if (profile) setProfileName(profile);
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

    const seed = seedFromDate(dateKey());
    rngRef.current = dailyRun ? mulberry32(seed) : Math.random;
    randGlobal = dailyRun ? rngRef.current : Math.random;
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

    const presetList = MODE_PRESETS[modePreset] ?? [];
    const roster = presetActive ? CHARACTERS_50.filter((c) => presetList.includes(c.id)) : selectedList;

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
        AsyncStorage.setItem(INTEL_KEY, JSON.stringify(next)).catch(() => {});
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
        await AsyncStorage.setItem(BEST_KEY, String(value));
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
      AsyncStorage.setItem(ACHIEVE_KEY, JSON.stringify(next)).catch(() => {});
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

  const spendCredits = (cost: number) => {
    setCredits((c) => {
      const next = Math.max(0, c - cost);
      AsyncStorage.setItem(CREDITS_KEY, String(next)).catch(() => {});
      return next;
    });
  };

  const rarityColor = (r: "common" | "rare" | "epic") => {
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
      AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  function setContractsSafe(next: Contract[]) {
    setContracts(next);
    AsyncStorage.setItem(CONTRACT_KEY, JSON.stringify(next)).catch(() => {});
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
      AsyncStorage.setItem(CONTRACT_KEY, JSON.stringify(next)).catch(() => {});
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
      AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(next)).catch(() => {});
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
      AsyncStorage.setItem(SKILL_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const equipGadget = (g: Gadget) => {
    setGadgets((prev) => {
      const next = [...prev];
      const empty = next.findIndex((x) => !x);
      if (empty >= 0) {
        next[empty] = g;
        return next;
      }
      next[0] = g;
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
    if (overclockCd || systemDisabled) return;
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
            AsyncStorage.setItem(INTEL_KEY, JSON.stringify(next)).catch(() => {});
            return next;
          });
          lastIntelAtRef.current = t;
        }
      }

      // score tick
      setScore((s) => s + Math.round(1 + nf));

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
      AsyncStorage.setItem(SCORE_LOG_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    if (!isWin) {
      setAdaptiveDeaths((d) => {
        const next = d + 1;
        AsyncStorage.setItem(ADAPT_KEY, String(next)).catch(() => {});
        return next;
      });
    } else {
      setAdaptiveDeaths((d) => {
        const next = Math.max(0, d - 1);
        AsyncStorage.setItem(ADAPT_KEY, String(next)).catch(() => {});
        return next;
      });
    }
    if (dailyRun) {
      setDailyScores((prev) => {
        const date = dateKey();
        const next = [{ date, score, night }, ...prev].slice(0, 20);
        AsyncStorage.setItem(DAILY_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    }
    const ghostNext = ghostBufferRef.current;
    if (ghostNext && Object.keys(ghostNext).length) {
      setGhostByView(ghostNext);
      AsyncStorage.setItem(GHOST_KEY, JSON.stringify(ghostNext)).catch(() => {});
    }
    if (!creditsAwardedRef.current) {
      const add = Math.max(1, Math.floor(score / 60));
      setCredits((c) => {
        const next = c + add;
        AsyncStorage.setItem(CREDITS_KEY, String(next)).catch(() => {});
        return next;
      });
      creditsAwardedRef.current = true;
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
  const SoftButton = ({
    title,
    sub,
    onPress,
    disabled,
    tone = "neutral",
    powerGate,
  }: {
    title: string;
    sub?: string;
    onPress: () => void;
    disabled?: boolean;
    tone?: "neutral" | "danger" | "good";
    powerGate?: boolean;
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
          { backgroundColor: bg, borderColor: border, opacity: hardDisabled ? 0.45 : pressed ? 0.82 : 1 },
          pressed && styles.softBtnPressed,
        ]}
      >
        <Text style={styles.softBtnTitle}>{title}</Text>
        {!!sub && <Text style={styles.softBtnSub}>{sub}</Text>}
      </Pressable>
    );
  };

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
      <View style={styles.barRow}>
        <Text style={styles.barLabel}>{label}</Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${v}%`, backgroundColor: col }]} />
        </View>
        <Text style={[styles.barVal, danger && { color: "#FFB86B" }]}>{rightText ?? `${Math.round(v)}%`}</Text>
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
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={IMG.rooms.holprincipal} style={styles.bg} resizeMode="cover">
          <View style={styles.loginBackdrop} />
          <View style={styles.loginWrap}>
            <View style={[styles.loginCard, shadow as any]}>
              <Text style={styles.loginKicker}>Security Access</Text>
              <Text style={styles.loginTitle}>Acces Bodyguard</Text>
              <Text style={styles.loginSub}>Intră cu user + parolă pentru a salva scoruri.</Text>

              <Text style={styles.loginLabel}>Username</Text>
              <TextInput
                value={profileName}
                onChangeText={setProfileName}
                placeholder="Nume / Call-sign"
                placeholderTextColor="rgba(220,220,230,0.45)"
                style={styles.loginInput}
                autoCapitalize="none"
              />

              <Text style={styles.loginLabel}>Parolă</Text>
              <TextInput
                value={profilePass}
                onChangeText={setProfilePass}
                placeholder="••••••••"
                placeholderTextColor="rgba(220,220,230,0.45)"
                style={styles.loginInput}
                secureTextEntry
              />

              <Text style={styles.loginHint}>Tip: parola nu este salvată, e doar pentru atmosferă.</Text>

              <SoftButton
                title="LOGIN"
                tone="good"
                disabled={!profileName.trim() || !profilePass.trim()}
                onPress={async () => {
                  if (!profileName.trim()) return;
                  await AsyncStorage.setItem(PROFILE_KEY, profileName.trim());
                  setProfilePass("");
                  setScreen("MENU");
                }}
              />
            </View>
          </View>
        </ImageBackground>
        {helpOpen && (
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
              <SoftButton title="ÎNCHIDE" onPress={() => setHelpOpen(false)} />
            </View>
          </View>
        )}
      </SafeAreaView>
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
          <View style={styles.scoreWrap}>
            <View style={[styles.scoreCard, shadow as any]}>
              <Text style={styles.scoreTitle}>Scoreboard</Text>
              <Text style={styles.scoreSub}>Ultimele 20 de runde</Text>

              <View style={{ height: 12 }} />
              {scoreLog.length === 0 && <Text style={styles.scoreEmpty}>Niciun scor încă.</Text>}
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
              <Text style={styles.scoreSub}>Daily Run (astăzi)</Text>
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

              <View style={{ height: 10 }} />
              <SoftButton title="ÎNAPOI" onPress={() => setScreen("MENU")} />
            </View>
          </View>
        </ImageBackground>
        <HelpModal />
      </SafeAreaView>
    );
  }

  if (screen === "STATS") {
    const avg = scoreLog.length ? Math.round(scoreLog.reduce((s, x) => s + x.score, 0) / scoreLog.length) : 0;
    const bestNight = scoreLog.reduce((m, x) => Math.max(m, x.night), 0);
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={IMG.rooms[bgPick]} style={styles.bg} resizeMode="cover">
          <View style={styles.overlay} />
          <View style={styles.statsWrap}>
            <View style={[styles.statsCard, shadow as any]}>
              <Text style={styles.scoreTitle}>Statistici</Text>
              <Text style={styles.scoreSub}>Profil: {profileName || "Anonim"}</Text>
              <View style={{ height: 14 }} />
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Best</Text>
                <Text style={styles.statsVal}>{best}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Avg Score</Text>
                <Text style={styles.statsVal}>{avg}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Highest Night</Text>
                <Text style={styles.statsVal}>{bestNight}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Sessions</Text>
                <Text style={styles.statsVal}>{scoreLog.length}</Text>
              </View>
              <View style={{ height: 12 }} />
              <Text style={styles.scoreSub}>Achievements</Text>
              <View style={{ height: 6 }} />
              {ACHIEVEMENTS.map((a) => {
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
          </View>
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
                <Text style={styles.sectionTitle}>Inventory</Text>
                <View style={styles.cardGrid}>
                  {GADGET_SHOP.map((g) => {
                      const count = inventory[g.id] ?? 0;
                      const glow = rarityColor(g.rarity);
                      return (
                        <View key={`inv-${g.id}`} style={[styles.itemCard, styles.itemCardCompact, { borderColor: `${glow}55`, shadowColor: glow }]}>
                          <View style={[styles.itemIcon, { backgroundColor: `${glow}22`, borderColor: `${glow}66` }]} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.itemTitle}>{g.name}</Text>
                            <Text style={styles.itemDesc}>Owned: {count}</Text>
                          </View>
                          <SoftButton
                            title={count > 0 ? "EQUIP" : "EMPTY"}
                            disabled={count <= 0}
                            onPress={() => {
                              if (count <= 0) return;
                              if (consumeInventory(g.id)) equipGadget(g.id);
                            }}
                          />
                        </View>
                      );
                  })}
                </View>
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
              </View>
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
  if (screen === "MENU") {
    const pulse = menuPulse.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.22] });
    const isMobile = SW < 820;
    const cardRise = menuIntro.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
    const cardFade = menuIntro.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
    const cardDelay = (i: number) => ({
      transform: [{ translateY: Animated.add(cardRise, new Animated.Value(i * 4)) }],
      opacity: cardFade,
    });

    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={IMG.rooms.holprincipal} style={styles.menuBg} resizeMode="cover">
          <View style={styles.menuBgOverlay} />
          <View style={styles.menuBgGlow} />

          <View style={styles.menuHub}>
            <Animated.View style={[styles.menuHeader, styles.glass, cardDelay(0)]}>
              <View style={styles.menuBrand}>
                <View style={styles.menuBrandMark} />
                <View>
                  <Text style={styles.menuBrandTitle}>5 DAYS</Text>
                  <Text style={styles.menuBrandSub}>Birou bodyguard · Parlament</Text>
                </View>
              </View>
              <View style={styles.menuHeaderRight}>
                <View style={styles.menuProfile}>
                  <View style={styles.menuAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuProfileName}>{profileName || "Player_01"}</Text>
                    <Text style={styles.menuProfileSub}>Lobby · Credits {credits}</Text>
                  </View>
                </View>
                <View style={styles.menuStatusRow}>
                  <View style={styles.menuPill}><View style={styles.menuDot} /><Text style={styles.menuPillText}>Online</Text></View>
                  <View style={styles.menuPill}><Text style={styles.menuPillText}>Diff <Text style={styles.menuPillStrong}>{DIFFICULTY_LABEL[difficultyPreset]}</Text></Text></View>
                  <View style={styles.menuPill}><Text style={styles.menuPillText}>Night <Text style={styles.menuPillStrong}>{night6 ? 6 : 5}</Text></Text></View>
                </View>
              </View>
            </Animated.View>

            <Animated.View style={[styles.quickActions, styles.glass, cardDelay(1)]}>
              <Text style={styles.quickTitle}>Quick Actions</Text>
              <View style={styles.quickRow}>
                <SoftButton title="START" tone="good" disabled={!canStart} onPress={startGame} />
                <SoftButton title={`DAILY: ${dailyRun ? "ON" : "OFF"}`} onPress={() => setDailyRun((v) => !v)} />
                <SoftButton title="SELECT" onPress={() => setScreen("SELECT")} />
                <SoftButton title="WORKSHOP" onPress={() => setScreen("WORKSHOP")} />
                <SoftButton title="INTEL" onPress={() => setScreen("INTEL")} />
                <SoftButton title="SCORES" onPress={() => setScreen("SCORES")} />
                <SoftButton title="STATS" onPress={() => setScreen("STATS")} />
              </View>
            </Animated.View>

            <View style={[styles.menuGrid, isMobile && styles.menuGridMobile]}>
              <Animated.View style={[styles.menuCardBig, isMobile && styles.menuCardMobile, styles.glass, cardDelay(2)]}>
                <Text style={styles.menuKicker}>Start</Text>
                <Text style={styles.menuHeroTitle}>New Run</Text>
                <Text style={styles.menuHeroDesc}>Setări rapide și start instant. Selectează animatronicii sau folosește preset.</Text>
                <View style={styles.menuHeroActions}>
                  <SoftButton title="START" tone="good" disabled={!canStart} onPress={startGame} />
                  <SoftButton
                    title={`DIFFICULTY: ${DIFFICULTY_LABEL[difficultyPreset].toUpperCase()}`}
                    onPress={() => {
                      const idx = DIFFICULTY_ORDER.indexOf(difficultyPreset);
                      setDifficultyPreset(DIFFICULTY_ORDER[(idx + 1) % DIFFICULTY_ORDER.length]);
                    }}
                  />
                    <SoftButton title="SELECT" onPress={() => setScreen("SELECT")} />
                </View>
              </Animated.View>

              <Animated.View style={[styles.menuCard, isMobile && styles.menuCardMobile, styles.glass, cardDelay(3)]}>
                <Text style={styles.menuPanelTitle}>Mode / Preset</Text>
                <SoftButton
                  title={`MODE: ${mode}`}
                  onPress={() => {
                    const order: GameMode[] = ["STORY", "CUSTOM", "ENDLESS", "CHALLENGE", "STEALTH", "RUSH"];
                    const idx = order.indexOf(mode);
                    setMode(order[(idx + 1) % order.length]);
                  }}
                />
                <SoftButton
                  title={`PRESET: ${modePreset}`}
                  onPress={() => {
                    const order: ModePreset[] = ["NORMAL", "OLD_TIMES", "BEST_LEADERS", "ARTISTS", "WRITERS", "MODERN", "SHADOWS"];
                    const idx = order.indexOf(modePreset);
                    setModePreset(order[(idx + 1) % order.length]);
                  }}
                />
                <SoftButton title={`TIER: ${modeTier}`} onPress={() => setModeTier((t) => (t % 3) + 1)} />
              </Animated.View>

              <Animated.View style={[styles.menuCard, isMobile && styles.menuCardMobile, styles.glass, cardDelay(4)]}>
                <Text style={styles.menuPanelTitle}>Challenges</Text>
                <View style={styles.menuChallengeRow}>
                  <SoftButton title={`No Cams ${challenge.noCams ? "ON" : "OFF"}`} onPress={() => setChallenge((c) => ({ ...c, noCams: !c.noCams }))} />
                  <SoftButton title={`No Doors ${challenge.noDoors ? "ON" : "OFF"}`} onPress={() => setChallenge((c) => ({ ...c, noDoors: !c.noDoors }))} />
                </View>
                <View style={styles.menuChallengeRow}>
                  <SoftButton title={`Double Drain ${challenge.doubleDrain ? "ON" : "OFF"}`} onPress={() => setChallenge((c) => ({ ...c, doubleDrain: !c.doubleDrain }))} />
                  <SoftButton title={`Only Vents ${challenge.onlyVents ? "ON" : "OFF"}`} onPress={() => setChallenge((c) => ({ ...c, onlyVents: !c.onlyVents }))} />
                </View>
                <SoftButton title={`One Battery ${challenge.oneBattery ? "ON" : "OFF"}`} onPress={() => setChallenge((c) => ({ ...c, oneBattery: !c.oneBattery }))} />
                <View style={{ height: 6 }} />
                <View style={styles.menuChallengeRow}>
                  <SoftButton title={`Night 6 ${night6 ? "ON" : "OFF"}`} onPress={() => setNight6((v) => !v)} />
                  <SoftButton title={`Hardcore ${hardcore ? "ON" : "OFF"}`} onPress={() => setHardcore((v) => !v)} />
                </View>
              </Animated.View>

              <Animated.View style={[styles.menuCard, isMobile && styles.menuCardMobile, styles.glass, cardDelay(5)]}>
                <Text style={styles.menuPanelTitle}>Quick Actions</Text>
                <SoftButton title="WORKSHOP" onPress={() => setScreen("WORKSHOP")} />
                <SoftButton title="INTEL" onPress={() => setScreen("INTEL")} />
                <SoftButton title="SCORES" onPress={() => setScreen("SCORES")} />
                <SoftButton title="STATS" onPress={() => setScreen("STATS")} />
                <SoftButton title="HELP" onPress={() => setHelpOpen(true)} />
              </Animated.View>

              <Animated.View style={[styles.menuCard, isMobile && styles.menuCardMobile, styles.glass, cardDelay(6)]}>
                <Text style={styles.menuPanelTitle}>Office</Text>
                <Animated.View style={[styles.bgPicker, { opacity: pulse }]}>
                  <Text style={styles.bgPickerTitle}>Birou bodyguard:</Text>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    {(["back1", "back2", "back3"] as const).map((k) => {
                      const active = k === bgPick;
                      return (
                        <TouchableOpacity key={k} onPress={() => setBgPick(k)} activeOpacity={0.86} style={[styles.bgThumbWrap, active && styles.bgThumbActive]}>
                          <Image source={IMG.rooms[k]} style={styles.bgThumb} />
                          <Text style={styles.bgThumbLabel}>{k}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </Animated.View>
              </Animated.View>

              <Animated.View style={[styles.menuCard, isMobile && styles.menuCardMobile, styles.glass, cardDelay(7)]}>
                <Text style={styles.menuPanelTitle}>Overview</Text>
                <View style={styles.menuStatGrid}>
                  <View style={styles.menuStatBox}>
                    <Text style={styles.menuStatLabel}>Best</Text>
                    <Text style={styles.menuStatValue}>{best}</Text>
                  </View>
                  <View style={styles.menuStatBox}>
                    <Text style={styles.menuStatLabel}>Selected</Text>
                    <Text style={styles.menuStatValue}>{Object.values(selected).filter(Boolean).length}/{CHARACTERS_50.length}</Text>
                  </View>
                  <View style={styles.menuStatBox}>
                    <Text style={styles.menuStatLabel}>Credits</Text>
                    <Text style={styles.menuStatValue}>{credits}</Text>
                  </View>
                </View>
                <View style={{ height: 8 }} />
                <SoftButton
                  title="LOGOUT"
                  tone="danger"
                  onPress={async () => {
                    await AsyncStorage.removeItem(PROFILE_KEY);
                    setProfileName("");
                    setProfilePass("");
                    setScreen("LOGIN");
                  }}
                />
              </Animated.View>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

if (screen === "SELECT") {
    const selectedCount = selectedList.length;
    const info = CHARACTERS_50.find((c) => c.id === selectedInfoId) ?? CHARACTERS_50[0];
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={IMG.rooms.holprincipal} style={styles.bg} resizeMode="cover">
          <View style={styles.overlayStrong} />
          <View style={styles.selectHeaderAlt}>
            <Text style={styles.selectTitleAlt}>CUSTOM NIGHT</Text>
            <Text style={styles.selectSubAlt}>Selecteaz? animatronici (minim 4)</Text>
          </View>

          <View style={styles.selectLayout}>
            <View style={[styles.selectGridCard, shadow as any]}>
              <FlatList
                data={CHARACTERS_50}
                numColumns={6}
                keyExtractor={(it) => it.id}
                contentContainerStyle={{ padding: 10 }}
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
                        style={[styles.charTile, on && styles.charTileOn]}
                      >
                        <Image source={charImg(item.id)} style={styles.charTileImg} resizeMode="cover" />
                        {on && <Animated.View pointerEvents="none" style={[styles.charTileGlow, { opacity: glowOpacity }]} />}
                        <View style={styles.cooldownBadge}>
                          <Text style={styles.cooldownText}>CD {cooldownBase.toFixed(1)}s</Text>
                        </View>
                        <View style={styles.threatBar}>
                          <View style={[styles.threatFill, { width: `${threatPct}%` }]} />
                        </View>
                        <View style={styles.charTileFooter}>
                          <Text style={styles.charTileTxt}>{on ? `ON • L${lvl}` : `OFF • L${lvl}`}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            <View style={[styles.selectSide, shadow as any]}>
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
              <View style={{ height: 12 }} />
              <SoftButton
                title={selectedCount >= 4 ? "GO!" : "MIN 4"}
                tone={selectedCount >= 4 ? "good" : "neutral"}
                disabled={selectedCount < 4}
                onPress={startGame}
              />
              <SoftButton title="?NAPOI" onPress={() => setScreen("MENU")} />
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  // PLAY screen
// PLAY screen
  const view = cameraOpen ? camView : VIEWS[0];
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
              <Text style={styles.lookZoneTxt}>◀</Text>
            </Pressable>
            <Pressable
              style={styles.lookZoneRight}
              onPressIn={() => setLookDir(1)}
              onPressOut={() => setLookDir(0)}
            >
              <Text style={styles.lookZoneTxt}>▶</Text>
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
        <View style={styles.hud}>
          <View style={styles.hudTop}>
            <View style={styles.hudPill}>
              <Text style={styles.hudKey}>Night</Text>
              <Text style={styles.hudVal}>{night}/{nightMax}</Text>
            </View>
            <View style={styles.hudPill}>
              <Text style={styles.hudKey}>Time</Text>
              <Text style={styles.hudVal}>{hourLabel}</Text>
            </View>
            <View style={styles.hudPill}>
              <Text style={styles.hudKey}>Score</Text>
              <Text style={styles.hudVal}>{score}</Text>
            </View>
            <View style={styles.hudPill}>
              <Text style={styles.hudKey}>Best</Text>
              <Text style={styles.hudVal}>{best}</Text>
            </View>
            <View style={styles.hudPill}>
              <Text style={styles.hudKey}>Tasks</Text>
              <Text style={styles.hudVal}>{tasksDone}/{tasks.length}</Text>
            </View>
            <View style={[styles.hudPill, { flex: 1 }]}>
              <Text style={styles.hudKey}>View</Text>
              <Text style={styles.hudVal}>{cameraOpen ? view.name : "Office"}</Text>
            </View>
          </View>

          <View style={styles.bars}>
            <Bar label="Power" value={power} good="#66F3B3" bad="#FF6B6B" rightText={`${Math.round(power)}% • ${powerForecast}`} />
            <Bar label="Heat" value={((heat - 16) / (34 - 16)) * 100} good="#DADADA" bad="#FFB86B" warn={heatCrit} rightText={`${heat.toFixed(1)}°C`} />
            <Bar label="Air" value={air} good="#62D6FF" bad="#FFB86B" warn={airCrit} rightText={`${Math.round(air)}%`} />
            <Bar label="Vent" value={ventHealth} good="#8CF7FF" bad="#FF6B6B" rightText={`${Math.round(ventHealth)}%`} />
            <Bar label="Sanity" value={sanity} good="#C1B7FF" bad="#FF6B6B" rightText={`${Math.round(sanity)}%`} />
            <Bar label="Noise" value={noise} good="#9AD5FF" bad="#FFB86B" rightText={`${Math.round(noise)}%`} />
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusPill, doorL && styles.statusPillOn]}>
              <Text style={styles.statusKey}>UȘĂ STG</Text>
              <Text style={styles.statusVal}>{doorL ? "ON" : doorLLocked ? "LOCK" : "OFF"}</Text>
            </View>
            <View style={[styles.statusPill, doorR && styles.statusPillOn]}>
              <Text style={styles.statusKey}>UȘĂ DR</Text>
              <Text style={styles.statusVal}>{doorR ? "ON" : doorRLocked ? "LOCK" : "OFF"}</Text>
            </View>
            <View style={[styles.statusPill, sealL && styles.statusPillOn]}>
              <Text style={styles.statusKey}>VENT STG</Text>
              <Text style={styles.statusVal}>{sealL ? "SEALED" : "OPEN"}</Text>
            </View>
            <View style={[styles.statusPill, sealR && styles.statusPillOn]}>
              <Text style={styles.statusKey}>VENT DR</Text>
              <Text style={styles.statusVal}>{sealR ? "SEALED" : "OPEN"}</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusKey}>ROUTE</Text>
              <Text style={styles.statusVal}>{powerRoute}</Text>
            </View>
          {!!modifierLabel && (
              <View style={styles.statusPill}>
                <Text style={styles.statusKey}>MODS</Text>
                <Text style={styles.statusVal}>{modifierLabel}</Text>
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

        {cameraOpen && (
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
        <View style={styles.dock}>
          <View style={styles.dockRow}>
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

          <View style={styles.dockRow}>
            <SoftButton title="LURE" sub={isCd(lureCdUntil) ? `${cdLeft(lureCdUntil).toFixed(1)}s` : "atrage spre view"} disabled={isCd(lureCdUntil) || noCamsMode || systemDisabled || spikeBlocksCams} onPress={() => doLure(cameraOpen ? view.id : "OFFICE")}  powerGate />
            <SoftButton title="MUSIC" sub={isCd(musicCdUntil) ? `${cdLeft(musicCdUntil).toFixed(1)}s` : "calmează unii"} disabled={isCd(musicCdUntil) || systemDisabled} onPress={doMusic}  powerGate />
            <SoftButton title="RESET" sub={isCd(resetCdUntil) ? `${cdLeft(resetCdUntil).toFixed(1)}s` : jam ? "curăță JAM" : "pulse"} disabled={isCd(resetCdUntil) || systemDisabled} onPress={doReset}  powerGate />
            <SoftButton title="LIGHT" sub={isCd(lightCdUntil) ? `${cdLeft(lightCdUntil).toFixed(1)}s` : "reveal phantom"} disabled={isCd(lightCdUntil) || noCamsMode || systemDisabled || spikeBlocksCams} onPress={doFlash}  powerGate />
            <SoftButton
              title={genOn ? `GEN ON ${Math.ceil((genOnUntil - now()) / 1000)}s` : "GEN"}
              sub={isCd(genCdUntil) ? `${cdLeft(genCdUntil).toFixed(1)}s` : "mini-game"}
              disabled={genOn || isCd(genCdUntil) || systemDisabled || spikeBlocksCams || noCamsMode}
              onPress={openGenerator}
             powerGate />
          </View>

          <View style={styles.dockRow}>
            <SoftButton title={`G1 ${gadgetLabel(gadgets[0])}`} onPress={() => useGadget(0)} disabled={!gadgets[0] || systemDisabled} powerGate />
            <SoftButton title={`G2 ${gadgetLabel(gadgets[1])}`} onPress={() => useGadget(1)} disabled={!gadgets[1] || systemDisabled} powerGate />
            <SoftButton title="TASKS" onPress={() => setTaskOpen(true)} disabled={systemDisabled} powerGate />
            <SoftButton title={scanActive ? "SCAN" : "SCAN"} sub={scanCd ? `${cdLeft(scanCdUntil).toFixed(1)}s` : "see thru"} onPress={doScan} disabled={scanCd || systemDisabled} powerGate />
            <SoftButton title="OVERCLOCK" sub={overclockCd ? `${cdLeft(overclockCdUntil).toFixed(1)}s` : "+2s scan"} onPress={doOverclock} disabled={overclockCd || systemDisabled} powerGate />
            <SoftButton title="ARTIFACT" sub={bossArtifactUsedRef.current ? "used" : "boss stop"} onPress={useArtifact} disabled={!bossPresent || bossArtifactUsedRef.current || systemDisabled} powerGate />
            <SoftButton title="ALARM" sub={alarmCd ? `${cdLeft(alarmCdUntil).toFixed(1)}s` : "scare"} onPress={doAlarm} disabled={alarmCd || systemDisabled} powerGate />
            <SoftButton title="PING" sub={motionPing ? `${cdLeft(motionPingUntil).toFixed(1)}s` : "motion"} onPress={doPing} disabled={motionPing || systemDisabled} powerGate />
            <SoftButton title="HELP" onPress={() => setHelpOpen(true)} powerGate />
          </View>

          <View style={styles.dockRow}>
            <SoftButton title="FAN -" onPress={() => setFan((f) => clamp(f - 0.08, 0, 1))} disabled={systemDisabled} powerGate />
            <View style={styles.fanPill}>
              <Text style={styles.fanTxt}>FAN {Math.round(fan * 100)}%</Text>
            </View>
            <SoftButton title="FAN +" onPress={() => setFan((f) => clamp(f + 0.08, 0, 1))} disabled={systemDisabled} powerGate />
            <SoftButton title="MENU" onPress={goMenu} disabled={hardcore} />
          </View>
          <View style={styles.dockRow}>
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
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.62)" },
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
    backgroundColor: "rgba(18,20,26,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 20,
  },
  menuBg: { width: "100%", height: "100%" },
  menuBgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10,12,16,0.72)" },
  menuBgGlow: { position: "absolute", left: -40, right: -40, top: -40, height: 240, backgroundColor: "rgba(94,252,232,0.08)" },
  menuLayout: { flex: 1, flexDirection: "row", gap: 16, padding: 18 },
  menuSidebar: { width: 300, padding: 14, gap: 14 },
  menuProfile: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.04)" },
  menuAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(94,252,232,0.25)" },
  menuProfileName: { color: "#F2F2F2", fontWeight: "900" },
  menuProfileSub: { color: "rgba(220,220,230,0.6)", fontSize: 12 },
  menuNav: { gap: 10 },
  menuNavBtn: { padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)" },
  menuNavBtnActive: { borderColor: "rgba(94,252,232,0.24)", backgroundColor: "rgba(94,252,232,0.08)" },
  menuNavLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuNavIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)" },
  menuNavIconActive: { backgroundColor: "rgba(94,252,232,0.18)" },
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
  menuPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.04)" },
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
  menuStatBox: { flex: 1, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)" },
  menuStatLabel: { color: "rgba(220,220,230,0.6)", fontSize: 12 },
  menuStatValue: { color: "#F2F2F2", fontWeight: "900", fontSize: 18, marginTop: 6 },
  menuChallengeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 6 },
  menuCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    padding: 20,
    backgroundColor: "rgba(10,10,18,0.78)",
  },
  menuTag: { marginTop: 8, color: "rgba(220,220,235,0.7)" },
  menuStats: { flexDirection: "row", gap: 10, marginTop: 16 },
  menuStat: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
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
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  statKey: { color: "rgba(220,220,230,0.75)", fontSize: 12, fontWeight: "700" },
  statVal: { color: "#F1F1F1", fontSize: 18, fontWeight: "900", marginTop: 2 },

  bgPicker: {
    marginTop: 16,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(15,15,20,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  bgPickerTitle: { color: "rgba(230,230,240,0.72)", fontWeight: "800", marginBottom: 8 },
  bgThumbWrap: {
    width: 120,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  bgThumbActive: { borderColor: "rgba(140,255,210,0.35)" },
  bgThumb: { width: "100%", height: 70 },
  bgThumbLabel: { padding: 8, color: "rgba(240,240,245,0.85)", fontWeight: "700", textAlign: "center" },

  // LOADING / LOGIN / SCORE / STATS
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#07080B" },
  loadingOrb: { width: 120, height: 120, borderRadius: 120, backgroundColor: "rgba(120,255,190,0.08)" },
  loadingTitle: { color: "#F2F2F2", fontSize: 32, fontWeight: "900", letterSpacing: 1.2 },
  loadingSub: { color: "rgba(220,220,230,0.7)" },

  loginBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(5,6,8,0.75)" },
  loginWrap: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
  loginCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    padding: 18,
    backgroundColor: "rgba(10,12,16,0.86)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  loginKicker: { color: "rgba(220,220,230,0.6)", letterSpacing: 3, textTransform: "uppercase", fontSize: 11 },
  loginTitle: { color: "#F2F2F2", fontSize: 30, fontWeight: "900", marginTop: 6 },
  loginSub: { color: "rgba(220,220,230,0.7)", marginBottom: 10, marginTop: 6 },
  loginLabel: { color: "rgba(220,220,230,0.75)", fontSize: 12, fontWeight: "800", marginBottom: 6, marginTop: 8 },
  loginInput: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#F2F2F2",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  loginHint: { color: "rgba(220,220,230,0.55)", fontSize: 12, marginTop: 10, marginBottom: 8 },

  scoreWrap: { flex: 1, padding: 18, justifyContent: "center" },
  scoreCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    padding: 16,
    backgroundColor: "rgba(12,12,18,0.82)",
  },
  scoreTitle: { fontSize: 26, fontWeight: "900", color: "#F2F2F2" },
  scoreSub: { color: "rgba(220,220,230,0.7)", marginTop: 2 },
  scoreEmpty: { color: "rgba(220,220,230,0.6)", marginTop: 8 },
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
    borderColor: "rgba(255,255,255,0.10)",
    padding: 16,
    backgroundColor: "rgba(12,12,18,0.82)",
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
  shopSlot: { flex: 1, padding: 10, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  shopSlotVal: { color: "#F2F2F2", fontWeight: "900", marginTop: 6 },
  workshopHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  workshopBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(120,255,190,0.35)", backgroundColor: "rgba(90,255,180,0.08)" },
  workshopBadgeTxt: { color: "rgba(210,255,230,0.9)", fontWeight: "900", fontSize: 11, letterSpacing: 1 },
  workshopGrid: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  workshopCard: { flex: 1, minWidth: 260, padding: 14, borderRadius: 18 },
  workshopBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(8,10,18,0.85)" },
  workshopScroll: { paddingBottom: 32 },
  workshopWrap: { flex: 1, padding: 20, gap: 16 },
  workshopHero: {
    padding: 18,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(20,18,36,0.85)",
  },
  workshopKicker: { color: "rgba(220,220,235,0.7)", letterSpacing: 4, fontSize: 12 },
  workshopTitle: { color: "#F2F2F2", fontSize: 30, fontWeight: "900", marginTop: 6 },
  workshopDesc: { color: "rgba(220,220,230,0.7)", marginTop: 6, lineHeight: 18 },
  workshopMetaRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  workshopMetaPill: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  workshopMetaTxt: { color: "rgba(220,220,230,0.7)", fontSize: 11, fontWeight: "800" },
  workshopMetaVal: { color: "#F2F2F2", fontWeight: "900", marginTop: 2 },
  workshopHeroActions: { marginTop: 12, alignItems: "flex-start" },
  workshopMain: { flex: 1, gap: 14 },
  workshopSection: { padding: 14, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(12,12,20,0.8)" },
  sectionTitle: { color: "#F2F2F2", fontWeight: "900", marginBottom: 10 },
  cardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  itemCard: {
    width: "48%",
    minHeight: 120,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    backgroundColor: "rgba(16,16,26,0.85)",
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
  loadoutRow: { flexDirection: "row", gap: 12 },
  loadoutCard: { flex: 1, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.05)" },

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
  selectTitleAlt: { fontSize: 28, fontWeight: "900", color: "#F2F2F2", letterSpacing: 1 },
  selectSubAlt: { marginTop: 4, color: "rgba(220,220,230,0.7)" },
  selectLayout: { flex: 1, flexDirection: "row", gap: 12, padding: 14 },
  selectGridCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "rgba(12,12,16,0.85)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  selectSide: {
    width: 200,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(12,12,16,0.85)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sideTitle: { color: "rgba(230,230,240,0.8)", fontWeight: "900", marginBottom: 6 },
  sideMeta: { color: "rgba(220,220,230,0.7)", marginTop: 4 },
  infoCard: {
    marginTop: 6,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
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

  charTile: {
    width: "16.6%",
    aspectRatio: 1,
    padding: 6,
  },
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

  // PLAY
  hud: { paddingHorizontal: 12, paddingTop: 10 },
  hudTop: { flexDirection: "row", gap: 10, alignItems: "center" },
  hudPill: {
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(15,15,20,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  hudKey: { color: "rgba(220,220,230,0.70)", fontSize: 12, fontWeight: "800" },
  hudVal: { color: "#F2F2F2", fontSize: 16, fontWeight: "900", marginTop: 2 },

  bars: {
    marginTop: 10,
    borderRadius: 22,
    padding: 12,
    backgroundColor: "rgba(15,15,20,0.60)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  barRow: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  barLabel: { width: 62, color: "rgba(235,235,245,0.80)", fontWeight: "800" },
  barTrack: { flex: 1, height: 12, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.10)", overflow: "hidden" },
  barFill: { height: 12, borderRadius: 10 },
  barVal: { width: 70, textAlign: "right", color: "rgba(235,235,245,0.80)", fontWeight: "900" },

  statusRow: { marginTop: 8, flexDirection: "row", gap: 8, flexWrap: "wrap" },
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
  statusKey: { color: "rgba(220,220,230,0.7)", fontSize: 11, fontWeight: "800" },
  statusVal: { color: "#F2F2F2", fontWeight: "900", marginTop: 2 },
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
  overlayStrong: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.72)" },
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
  dockRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  softBtn: {
    flexGrow: 1,
    flexBasis: 124,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  softBtnPressed: { transform: [{ scale: 0.98 }] },
  softBtnTitle: { color: "#F3F3F3", fontWeight: "900", fontSize: 14 },
  softBtnSub: { marginTop: 4, color: "rgba(230,230,240,0.65)", fontWeight: "700", fontSize: 11 },

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
