export const DMG_MOD_TYPES = [
  "global",
  "melee",
  "area",
  "attack",
  "spell",
  "physical",
  "cold",
  "lightning",
  "fire",
  "erosion",
  "elemental",
] as const;

export type DmgModType = (typeof DMG_MOD_TYPES)[number];

export type CritRatingModType = "global" | "attack" | "spell";
export type CritDmgModType = "global" | "attack" | "spell";
