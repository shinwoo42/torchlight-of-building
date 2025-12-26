import type { Mod } from "../mod";
import { multi } from "./template";

export { multi, spec, t } from "./template";

import {
  AddsDmgAs,
  ArmorPct,
  ArmorPenPct,
  AspdAndCspdPct,
  AspdPct,
  AttackBlockChancePct,
  CritDmgPct,
  CritMultiModParsers,
  CritRatingPct,
  CspdPct,
  DamageMultiModParsers,
  DmgPct,
  DmgPctPerMana,
  DoubleDmgChancePct,
  EnergyShieldRegainPct,
  EvasionPct,
  FervorEff,
  FlatDmgToAtks,
  FlatDmgToSpells,
  GearAspdPct,
  LifeRegainPct,
  MaxEnergyShieldPct,
  MaxLifePct,
  MaxMana,
  MaxManaPct,
  MinionAspdAndCspdPct,
  ResPenPct,
  ShadowDmgPct,
  ShadowQuant,
  SpellBlockChancePct,
  Stat,
  StatPct,
  SteepStrikeChance,
} from "./templates";
import type { ModParser } from "./types";

// Collect all parsers in priority order
// Multi-mod parsers first (more specific patterns)
// Then single-mod parsers

const allParsers: ModParser[] = [
  // Multi-mod parsers (order matters - more specific first)
  DamageMultiModParsers,
  CritMultiModParsers,

  // Stackable/per parsers (more specific than base)
  DmgPctPerMana,

  // Single-mod parsers
  // Offense - damage
  DmgPct,
  CritRatingPct,
  CritDmgPct,

  // Speed
  MinionAspdAndCspdPct,
  AspdAndCspdPct,
  AspdPct,
  CspdPct,
  GearAspdPct,

  // Misc offense
  FervorEff,
  SteepStrikeChance,
  ShadowQuant,
  ShadowDmgPct,
  AddsDmgAs,
  ResPenPct,
  ArmorPenPct,
  DoubleDmgChancePct,
  FlatDmgToAtks,
  FlatDmgToSpells,

  // Resource
  MaxMana,
  MaxManaPct,

  // Defense
  AttackBlockChancePct,
  SpellBlockChancePct,
  MaxLifePct,
  MaxEnergyShieldPct,
  ArmorPct,
  EvasionPct,
  EnergyShieldRegainPct,
  LifeRegainPct,

  // Attributes
  Stat,
  StatPct,
];

// Combined parser
const combinedParser = multi(allParsers);

/**
 * Parses an affix line string and returns extracted mods.
 *
 * Return value semantics:
 * - `undefined`: No parser matched the input (parse failure)
 * - `[]`: Successfully parsed, but no mods to extract (intentional no-op)
 * - `[...mods]`: Successfully parsed with one or more extracted mods
 */
export const parseMod = (input: string): Mod[] | undefined => {
  const normalized = input.trim().toLowerCase();
  return combinedParser.parse(normalized);
};
