import type { PassiveSkillName } from "@/src/data/skill";
import type { ModWithoutValue } from "./support_templates";

export type PassiveSkillTemplate = {
  levelBuffMods?: ModWithoutValue[];
};

export const passiveSkillTemplates: Partial<
  Record<PassiveSkillName, PassiveSkillTemplate>
> = {
  "Precise: Cruelty": {
    levelBuffMods: [{ type: "DmgPct", addn: true, modType: "attack" }],
  },
};
