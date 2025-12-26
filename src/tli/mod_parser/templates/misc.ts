import type { ResPenType } from "../../mod";
import { multi, t } from "../template";

// +4% Fervor effect
export const FervorEff = t`{value:dec%} fervor effect`.output(
  "FervorEff",
  (c) => ({
    value: c.value as number,
  }),
);

// +12% Steep Strike chance
export const SteepStrikeChance = t`{value:dec%} steep strike chance`.output(
  "SteepStrikeChance",
  (c) => ({ value: c.value as number }),
);

// "+2 Shadow Quantity" or "Shadow Quantity +2"
export const ShadowQuant = multi([
  t`{value:int} shadow quantity`.output("ShadowQuant", (c) => ({
    value: c.value as number,
  })),
  t`shadow quantity {value:int}`.output("ShadowQuant", (c) => ({
    value: c.value as number,
  })),
]);

// [+/-]<value>% [additional] Shadow Damage
export const ShadowDmgPct = t`{value:dec%} [additional] shadow damage`.output(
  "ShadowDmgPct",
  (c) => ({
    value: c.value as number,
    addn: c.additional !== undefined,
  }),
);

// +8% Armor DMG Mitigation Penetration
export const ArmorPenPct =
  t`{value:dec%} armor dmg mitigation penetration`.output(
    "ArmorPenPct",
    (c) => ({
      value: c.value as number,
    }),
  );

// +31% chance to deal Double Damage
export const DoubleDmgChancePct =
  t`{value:dec%} chance to deal double damage`.output(
    "DoubleDmgChancePct",
    (c) => ({ value: c.value as number }),
  );

// +166 Max Mana
export const MaxMana = t`{value:dec} max mana`.output("MaxMana", (c) => ({
  value: c.value as number,
}));

// +90% [additional] Max Mana
export const MaxManaPct = t`{value:dec%} [additional] max mana`.output(
  "MaxManaPct",
  (c) => ({
    value: c.value as number,
    addn: c.additional !== undefined,
  }),
);

// ResPenPct has multiple patterns:
// "+23% Elemental and Erosion Resistance Penetration" --> penType: all
// "+10% Elemental Resistance Penetration" --> penType: elemental
// "+10% Erosion Resistance Penetration" --> penType: erosion
// "+8% Cold Penetration", "+8% Fire Penetration", "+8% Lightning Penetration"
export const ResPenPct = multi([
  // Most specific first
  t`{value:dec%} elemental and erosion resistance penetration`.output(
    "ResPenPct",
    (c) => ({
      value: c.value as number,
      penType: "all" as const,
    }),
  ),
  t`{value:dec%} (elemental|erosion) resistance penetration`
    .capture("penType", (m) => m[2].toLowerCase() as "elemental" | "erosion")
    .output("ResPenPct", (c) => ({
      value: c.value as number,
      penType: c.penType as ResPenType,
    })),
  t`{value:dec%} (cold|lightning|fire) penetration`
    .capture(
      "penType",
      (m) => m[2].toLowerCase() as "cold" | "lightning" | "fire",
    )
    .output("ResPenPct", (c) => ({
      value: c.value as number,
      penType: c.penType as ResPenType,
    })),
]);
