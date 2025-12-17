import { parseNumericValue, validateAllLevels } from "./progression_table";
import type { SupportLevelParser } from "./types";

export const preciseCrueltyParser: SupportLevelParser = (input) => {
  const { skillName, progressionTable } = input;

  // levelBuffMods: DmgPct attack additional damage from Descript column (values[0])
  const buffDmgPctLevels: Record<number, number> = {};

  for (const [levelStr, values] of Object.entries(progressionTable.values)) {
    const level = Number(levelStr);
    const descript = values[0];

    if (descript !== undefined && descript !== "") {
      // Match "+12.5% additional Attack Damage" or "12.5% additional Attack Damage"
      const match = descript.match(
        /[+]?([\d.]+)%\s+additional\s+Attack\s+Damage/i,
      );
      if (match !== null) {
        buffDmgPctLevels[level] = parseNumericValue(match[1], {
          asPercentage: true,
        });
      }
    }
  }

  validateAllLevels(buffDmgPctLevels, skillName);

  // Return array matching template order:
  // levelBuffMods: [DmgPct attack]
  return [buffDmgPctLevels];
};
