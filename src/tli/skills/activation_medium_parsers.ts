import { template } from "@/src/scripts/skills/template-compiler";
import type { ActivationMediumMod } from "../core";
import type { Mod } from "../mod";

/**
 * Parser function for activation medium skill affixes.
 * Takes an array of affix texts and returns parsed mods for each.
 * Returns undefined if any affix cannot be parsed.
 */
export type ActivationMediumAffixParser = (
  affixes: string[],
) => ActivationMediumMod[][] | undefined;

// ============================================
// Template Matchers
// ============================================

const autoUsedDmgMatcher = template(
  "Auto-used supported skills {value:int}% additional damage",
);

// ============================================
// Individual Skill Parsers
// ============================================

const motionlessParser: ActivationMediumAffixParser = (affixes) => {
  const result: ActivationMediumMod[][] = [];

  for (const affixText of affixes) {
    const affixMods: ActivationMediumMod[] = [];

    // Pattern: "Auto-used supported skills +X% additional damage"
    const autoUsedDmg = autoUsedDmgMatcher.tryMatch(affixText);
    if (autoUsedDmg !== undefined) {
      const mod: Mod = {
        type: "DmgPct",
        value: autoUsedDmg.value,
        dmgModType: "global",
        addn: true,
      };
      affixMods.push({ mod });
    }

    // Non-damage affixes (trigger conditions) don't produce mods
    result.push(affixMods);
  }

  return result;
};

// ============================================
// Parser Registry
// ============================================

const ACTIVATION_MEDIUM_PARSERS: Record<string, ActivationMediumAffixParser> = {
  "Activation Medium: Motionless": motionlessParser,
};

/**
 * Get the parser for an activation medium skill.
 * Returns undefined if no parser exists for the skill.
 */
export const getActivationMediumParser = (
  skillName: string,
): ActivationMediumAffixParser | undefined => {
  return ACTIVATION_MEDIUM_PARSERS[skillName];
};

/**
 * Parse activation medium affixes for a skill.
 * Returns undefined if no parser exists for the skill.
 */
export const parseActivationMediumAffixes = (
  skillName: string,
  affixes: string[],
): ActivationMediumMod[][] | undefined => {
  const parser = getActivationMediumParser(skillName);
  if (parser === undefined) {
    return undefined;
  }
  return parser(affixes);
};
