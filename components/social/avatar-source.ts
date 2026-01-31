import type { ImageSourcePropType } from "react-native";

const ASSETS: Record<string, ImageSourcePropType> = {
  alecsandri: require("../../assets/characters/alecsandri.jpg"),
  andra: require("../../assets/characters/andra.jpg"),
  antonia: require("../../assets/characters/antonia.jpg"),
  arghezi: require("../../assets/characters/arghezi.jpg"),
  blaga: require("../../assets/characters/blaga.jpg"),
  bromania: require("../../assets/characters/bromania.webp"),
  caragiale: require("../../assets/characters/caragiale.jpg"),
  carol1: require("../../assets/characters/carol1.jpg"),
  ciolacu: require("../../assets/characters/ciolacu.jpg"),
  cojocaru: require("../../assets/characters/cojocaru.jpg"),
  cosbuc: require("../../assets/characters/cosbuc.jpg"),
  creanga: require("../../assets/characters/creanga.jpg"),
  crinantonescu: require("../../assets/characters/crinantonescu.jpg"),
  cuzavoda: require("../../assets/characters/cuzavoda.jpg"),
  decebal: require("../../assets/characters/decebal.jpg"),
  delia: require("../../assets/characters/delia.jpg"),
  dorianpopa: require("../../assets/characters/dorianpopa.jpg"),
  drula: require("../../assets/characters/drula.png"),
  eliade: require("../../assets/characters/eliade.jpg"),
  eminescu: require("../../assets/characters/eminescu.jpg"),
  eugenionescu: require("../../assets/characters/eugenionescu.webp"),
  fantomaarhivei: require("../../assets/characters/fantomaarhivei.webp"),
  ferdinand: require("../../assets/characters/ferdinand.jpg"),
  gabrielafirea: require("../../assets/characters/gabrielafirea.jpg"),
  georgesimion: require("../../assets/characters/georgesimion.jpg"),
  iliebolojan: require("../../assets/characters/iliebolojan.jpg"),
  inna: require("../../assets/characters/inna.jpg"),
  iohannis: require("../../assets/characters/iohannis.jpg"),
  irinrimes: require("../../assets/characters/irinrimes.webp"),
  kelemen: require("../../assets/characters/kelemen.jpg"),
  marinpreda: require("../../assets/characters/marinpreda.jpg"),
  micutzu: require("../../assets/characters/micutzu.jpg"),
  mihaiviteazul: require("../../assets/characters/mihaiviteazul.png"),
  mirceacelbatran: require("../../assets/characters/mirceacelbatran.jpg"),
  nichitastanescu: require("../../assets/characters/nichitastanescu.jpg"),
  nicusordan: require("../../assets/characters/nicusordan.png"),
  pazniculliftului: require("../../assets/characters/pazniculliftului.jpg"),
  puya: require("../../assets/characters/puya.jpg"),
  reginamaria: require("../../assets/characters/reginamaria.jpg"),
  selly: require("../../assets/characters/selly.jpg"),
  selly2: require("../../assets/characters/selly2.jpg"),
  smiley: require("../../assets/characters/smiley.jpg"),
  stefancelmare: require("../../assets/characters/stefancelmare.webp"),
  tehnicianul: require("../../assets/characters/tehnicianul.jpg"),
  theorose: require("../../assets/characters/theorose.jpg"),
  traian: require("../../assets/characters/traian.jpg"),
  umbraplenului: require("../../assets/characters/umbraplenului.jpg"),
  victorponta: require("../../assets/characters/victorponta.jpg"),
  vladtepes: require("../../assets/characters/vladtepes.jpg"),
  default: require("../../assets/characters/default.png"),
};

export const CHARACTER_CHOICES = Object.keys(ASSETS)
  .filter((k) => k !== "default")
  .map((id) => ({ id, source: ASSETS[id] }));

export const resolveAvatarSource = (avatar?: string): ImageSourcePropType => {
  if (!avatar) return ASSETS.default;
  if (avatar.startsWith("local:")) {
    const key = avatar.replace("local:", "");
    return ASSETS[key] || ASSETS.default;
  }
  return { uri: avatar };
};
