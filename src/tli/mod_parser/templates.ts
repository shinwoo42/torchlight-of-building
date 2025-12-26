import type { PerStackable, ResPenType } from "../mod";
import { StatWordMapping } from "./enums";
import { multi, spec, t } from "./template";

// ============= Damage =============

// +9% [additional] [fire] damage
export const DmgPct = t(
  "{value:dec%} [additional] [{modType:DmgModType}] damage",
).output("DmgPct", (c) => ({
  value: c.value,
  modType: c.modType ?? "global",
  addn: c.additional !== undefined,
}));

// +7% Spell Damage for every 100 Mana consumed recently, up to 432%
export const DmgPctPerMana = t(
  "{value:dec%} {modType:DmgModType} damage for every {amt:int} mana consumed recently, up to {limit:dec%}",
).output("DmgPct", (c) => {
  const per: PerStackable = {
    stackable: "mana_consumed_recently",
    amt: c.amt,
    valueLimit: c.limit,
  };
  return {
    value: c.value,
    modType: c.modType,
    addn: false,
    per,
  };
});

// Adds 9 - 15 Fire Damage to Attacks
export const FlatDmgToAtks = t(
  "adds {min:int} - {max:int} {dmgType:DmgChunkType} damage to attacks",
).output("FlatDmgToAtks", (c) => ({
  value: { min: c.min, max: c.max },
  dmgType: c.dmgType,
}));

// Adds 9 - 15 Fire Damage to Spells
export const FlatDmgToSpells = t(
  "adds {min:int} - {max:int} {dmgType:DmgChunkType} damage to spells",
).output("FlatDmgToSpells", (c) => ({
  value: { min: c.min, max: c.max },
  dmgType: c.dmgType,
}));

// Adds 9 - 15 Fire Damage to Attacks and Spells
export const FlatDmgToAtksAndSpells = t(
  "adds {min:int} - {max:int} {dmgType:DmgChunkType} damage to attacks and spells",
).outputMany([
  spec("FlatDmgToAtks", (c) => ({
    value: { min: c.min, max: c.max },
    dmgType: c.dmgType,
  })),
  spec("FlatDmgToSpells", (c) => ({
    value: { min: c.min, max: c.max },
    dmgType: c.dmgType,
  })),
]);

// Adds 22 - 27 Physical Damage to Attacks and Spells for every 1034 Mana consumed recently. Stacks up to 200 time(s)
export const FlatDmgToAtksAndSpellsPer = t(
  "adds {min:int} - {max:int} {dmgType:DmgChunkType} damage to attacks and spells for every {amt:int} mana consumed recently. stacks up to {limit:int} time\\(s\\)",
).outputMany([
  spec("FlatDmgToAtks", (c) => {
    const per: PerStackable = {
      stackable: "mana_consumed_recently",
      amt: c.amt,
      limit: c.limit,
    };
    return {
      value: { min: c.min, max: c.max },
      dmgType: c.dmgType,
      per,
    };
  }),
  spec("FlatDmgToSpells", (c) => {
    const per: PerStackable = {
      stackable: "mana_consumed_recently",
      amt: c.amt,
      limit: c.limit,
    };
    return {
      value: { min: c.min, max: c.max },
      dmgType: c.dmgType,
      per,
    };
  }),
]);

// Adds 18% of Physical Damage to/as Cold Damage
export const AddsDmgAs = t(
  "adds {value:dec%} of {from:DmgChunkType} damage (to|as) {to:DmgChunkType} damage",
).output("AddsDmgAs", (c) => ({
  from: c.from,
  to: c.to,
  value: c.value,
}));

// +57% Gear Attack Speed. -12% additional Attack Damage
export const GearAspdWithDmgPenalty = t(
  "{aspd:dec%} gear attack speed. {dmg:dec%} additional attack damage",
).outputMany([
  spec("GearAspdPct", (c) => ({ value: c.aspd })),
  spec("DmgPct", (c) => ({
    value: c.dmg,
    addn: true,
    modType: "attack" as const,
  })),
]);

// Combined damage multi-mod parsers (more specific first)
export const DamageMultiModParsers = multi([
  GearAspdWithDmgPenalty,
  FlatDmgToAtksAndSpellsPer,
  FlatDmgToAtksAndSpells,
]);

// ============= Critical Strike =============

// +10% [Attack] Critical Strike Rating
export const CritRatingPct = t(
  "{value:dec%} [{modType:CritRatingModType}] critical strike rating",
).output("CritRatingPct", (c) => ({
  value: c.value,
  modType: c.modType ?? "global",
}));

// +5% [additional] [Attack] Critical Strike Damage
export const CritDmgPct = t(
  "{value:dec%} [additional] [{modType:CritDmgModType}] critical strike damage",
).output("CritDmgPct", (c) => ({
  value: c.value,
  addn: c.additional !== undefined,
  modType: c.modType ?? "global",
}));

// +5% Critical Strike Rating and Critical Strike Damage
export const CritRatingAndCritDmgPct = t(
  "{value:dec%} critical strike rating and critical strike damage",
).outputMany([
  spec("CritRatingPct", (c) => ({
    value: c.value,
    modType: "global" as const,
  })),
  spec("CritDmgPct", (c) => ({
    value: c.value,
    modType: "global" as const,
    addn: false,
  })),
]);

// +5% Critical Strike Rating and Critical Strike Damage for every 720 Mana consumed recently
export const CritRatingAndCritDmgPctPerMana = t(
  "{value:dec%} critical strike rating and critical strike damage for every {amt:int} mana consumed recently",
).outputMany([
  spec("CritRatingPct", (c) => {
    const per: PerStackable = {
      stackable: "mana_consumed_recently",
      amt: c.amt,
    };
    return {
      value: c.value,
      modType: "global" as const,
      per,
    };
  }),
  spec("CritDmgPct", (c) => {
    const per: PerStackable = {
      stackable: "mana_consumed_recently",
      amt: c.amt,
    };
    return {
      value: c.value,
      modType: "global" as const,
      addn: false,
      per,
    };
  }),
]);

// Combined multi-mod parsers (more specific first)
export const CritMultiModParsers = multi([
  CritRatingAndCritDmgPctPerMana,
  CritRatingAndCritDmgPct,
]);

// ============= Speed =============

// +6% [additional] attack speed
export const AspdPct = t("{value:dec%} [additional] attack speed").output(
  "AspdPct",
  (c) => ({
    value: c.value,
    addn: c.additional !== undefined,
  }),
);

// +6% [additional] cast speed
export const CspdPct = t("{value:dec%} [additional] cast speed").output(
  "CspdPct",
  (c) => ({
    value: c.value,
    addn: c.additional !== undefined,
  }),
);

// +6% [additional] attack and cast speed
export const AspdAndCspdPct = t(
  "{value:dec%} [additional] attack and cast speed",
).output("AspdAndCspdPct", (c) => ({
  value: c.value,
  addn: c.additional !== undefined,
}));

// +6% [additional] minion attack and cast speed
export const MinionAspdAndCspdPct = t(
  "{value:dec%} [additional] minion attack and cast speed",
).output("MinionAspdAndCspdPct", (c) => ({
  value: c.value,
  addn: c.additional !== undefined,
}));

// +8% gear Attack Speed
export const GearAspdPct = t("{value:dec%} gear attack speed").output(
  "GearAspdPct",
  (c) => ({ value: c.value }),
);

// ============= Defense =============

// +4% Attack Block Chance
export const AttackBlockChancePct = t(
  "{value:dec%} attack block chance",
).output("AttackBlockChancePct", (c) => ({ value: c.value }));

// +4% Spell Block Chance
export const SpellBlockChancePct = t("{value:dec%} spell block chance").output(
  "SpellBlockChancePct",
  (c) => ({ value: c.value }),
);

// +3% Max Life
export const MaxLifePct = t("{value:dec%} max life").output(
  "MaxLifePct",
  (c) => ({
    value: c.value,
  }),
);

// +3% Max Energy Shield
export const MaxEnergyShieldPct = t("{value:dec%} max energy shield").output(
  "MaxEnergyShieldPct",
  (c) => ({ value: c.value }),
);

// +5% Armor
export const ArmorPct = t("{value:dec%} armor").output("ArmorPct", (c) => ({
  value: c.value,
}));

// +5% Evasion
export const EvasionPct = t("{value:dec%} evasion").output(
  "EvasionPct",
  (c) => ({
    value: c.value,
  }),
);

// 1.5% Life Regain
export const LifeRegainPct = t("{value:dec%} life regain").output(
  "LifeRegainPct",
  (c) => ({ value: c.value }),
);

// 1.5% Energy Shield Regain
export const EnergyShieldRegainPct = t(
  "{value:dec%} energy shield regain",
).output("EnergyShieldRegainPct", (c) => ({
  value: c.value,
}));

// ============= Stats =============

// +6 Strength/Dexterity/Intelligence
export const Stat = t("{value:dec} {statType:StatWord}")
  .enum("StatWord", StatWordMapping)
  .output("Stat", (c) => ({
    value: c.value,
    statType: c.statType,
  }));

// +4% Strength/Dexterity/Intelligence
export const StatPct = t("{value:dec%} {statType:StatWord}")
  .enum("StatWord", StatWordMapping)
  .output("StatPct", (c) => ({
    value: c.value,
    statType: c.statType,
  }));

// ============= Misc =============

// +4% Fervor effect
export const FervorEff = t("{value:dec%} fervor effect").output(
  "FervorEff",
  (c) => ({
    value: c.value,
  }),
);

// +12% Steep Strike chance
export const SteepStrikeChance = t("{value:dec%} steep strike chance").output(
  "SteepStrikeChance",
  (c) => ({ value: c.value }),
);

// "+2 Shadow Quantity" or "Shadow Quantity +2"
export const ShadowQuant = multi([
  t("{value:int} shadow quantity").output("ShadowQuant", (c) => ({
    value: c.value,
  })),
  t("shadow quantity {value:int}").output("ShadowQuant", (c) => ({
    value: c.value,
  })),
]);

// [+/-]<value>% [additional] Shadow Damage
export const ShadowDmgPct = t("{value:dec%} [additional] shadow damage").output(
  "ShadowDmgPct",
  (c) => ({
    value: c.value,
    addn: c.additional !== undefined,
  }),
);

// +8% Armor DMG Mitigation Penetration
export const ArmorPenPct = t(
  "{value:dec%} armor dmg mitigation penetration",
).output("ArmorPenPct", (c) => ({
  value: c.value,
}));

// +31% chance to deal Double Damage
export const DoubleDmgChancePct = t(
  "{value:dec%} chance to deal double damage",
).output("DoubleDmgChancePct", (c) => ({ value: c.value }));

// +166 Max Mana
export const MaxMana = t("{value:dec} max mana").output("MaxMana", (c) => ({
  value: c.value,
}));

// +90% [additional] Max Mana
export const MaxManaPct = t("{value:dec%} [additional] max mana").output(
  "MaxManaPct",
  (c) => ({
    value: c.value,
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
  t("{value:dec%} elemental and erosion resistance penetration").output(
    "ResPenPct",
    (c) => ({
      value: c.value,
      penType: "all" as const,
    }),
  ),
  t("{value:dec%} (elemental|erosion) resistance penetration")
    .capture("penType", (m) => m[2].toLowerCase() as "elemental" | "erosion")
    .output("ResPenPct", (c) => ({
      value: c.value,
      penType: c.penType as ResPenType,
    })),
  t("{value:dec%} (cold|lightning|fire) penetration")
    .capture(
      "penType",
      (m) => m[2].toLowerCase() as "cold" | "lightning" | "fire",
    )
    .output("ResPenPct", (c) => ({
      value: c.value,
      penType: c.penType as ResPenType,
    })),
]);
