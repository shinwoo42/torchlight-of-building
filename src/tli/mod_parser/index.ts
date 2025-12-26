import type { Mod } from "../mod";
import { multi } from "./template";
import * as crit from "./templates/crit";
import * as damage from "./templates/damage";
// Import all templates
import * as defense from "./templates/defense";
import * as misc from "./templates/misc";
import * as speed from "./templates/speed";
import * as stats from "./templates/stats";
import type { ModParser } from "./types";

// Collect all parsers in priority order
// Multi-mod parsers first (more specific patterns)
// Then single-mod parsers

const allParsers: ModParser[] = [
  // Multi-mod parsers (order matters - more specific first)
  damage.DamageMultiModParsers,
  crit.CritMultiModParsers,

  // Stackable/per parsers (more specific than base)
  damage.DmgPctPerMana,

  // Single-mod parsers
  // Offense - damage
  damage.DmgPct,
  crit.CritRatingPct,
  crit.CritDmgPct,

  // Speed
  speed.MinionAspdAndCspdPct,
  speed.AspdAndCspdPct,
  speed.AspdPct,
  speed.CspdPct,
  speed.GearAspdPct,

  // Misc offense
  misc.FervorEff,
  misc.SteepStrikeChance,
  misc.ShadowQuant,
  misc.ShadowDmgPct,
  damage.AddsDmgAs,
  misc.ResPenPct,
  misc.ArmorPenPct,
  misc.DoubleDmgChancePct,
  damage.FlatDmgToAtks,
  damage.FlatDmgToSpells,

  // Resource
  misc.MaxMana,
  misc.MaxManaPct,

  // Defense
  defense.AttackBlockChancePct,
  defense.SpellBlockChancePct,
  defense.MaxLifePct,
  defense.MaxEnergyShieldPct,
  defense.ArmorPct,
  defense.EvasionPct,
  defense.EnergyShieldRegainPct,
  defense.LifeRegainPct,

  // Attributes
  stats.Stat,
  stats.StatPct,
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
