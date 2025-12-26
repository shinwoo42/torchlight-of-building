import type { StatType } from "../../mod";
import { StatWordMapping } from "../enums";
import { t } from "../template";

// +6 Strength/Dexterity/Intelligence
export const Stat = t`{value:dec} {statType:StatWord}`
  .enum("StatWord", StatWordMapping)
  .output("Stat", (c) => ({
    value: c.value as number,
    statType: c.statType as StatType,
  }));

// +4% Strength/Dexterity/Intelligence
export const StatPct = t`{value:dec%} {statType:StatWord}`
  .enum("StatWord", StatWordMapping)
  .output("StatPct", (c) => ({
    value: c.value as number,
    statType: c.statType as StatType,
  }));
