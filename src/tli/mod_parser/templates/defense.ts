import { t } from "../template";

// +4% Attack Block Chance
export const AttackBlockChancePct = t`{value:dec%} attack block chance`.output(
  "AttackBlockChancePct",
  (c) => ({ value: c.value as number }),
);

// +4% Spell Block Chance
export const SpellBlockChancePct = t`{value:dec%} spell block chance`.output(
  "SpellBlockChancePct",
  (c) => ({ value: c.value as number }),
);

// +3% Max Life
export const MaxLifePct = t`{value:dec%} max life`.output(
  "MaxLifePct",
  (c) => ({
    value: c.value as number,
  }),
);

// +3% Max Energy Shield
export const MaxEnergyShieldPct = t`{value:dec%} max energy shield`.output(
  "MaxEnergyShieldPct",
  (c) => ({ value: c.value as number }),
);

// +5% Armor
export const ArmorPct = t`{value:dec%} armor`.output("ArmorPct", (c) => ({
  value: c.value as number,
}));

// +5% Evasion
export const EvasionPct = t`{value:dec%} evasion`.output("EvasionPct", (c) => ({
  value: c.value as number,
}));

// 1.5% Life Regain
export const LifeRegainPct = t`{value:dec%} life regain`.output(
  "LifeRegainPct",
  (c) => ({ value: c.value as number }),
);

// 1.5% Energy Shield Regain
export const EnergyShieldRegainPct =
  t`{value:dec%} energy shield regain`.output("EnergyShieldRegainPct", (c) => ({
    value: c.value as number,
  }));
