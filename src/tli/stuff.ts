import * as R from "remeda";
import { match } from "ts-pattern";

type Tag = "physical" | "spell";

let dummy40Armor = 0.11;
let dummy85Armor = 0.44;

interface DamageRange {
  // inclusive on both ends
  min: number;
  max: number;
}

const addDR = (dr1: DamageRange, dr2: DamageRange): DamageRange => {
  return {
    min: dr1.min + dr2.min,
    max: dr1.max + dr2.max,
  };
};

const multDR = (dr: DamageRange, multiplier: number): DamageRange => {
  return {
    min: dr.min * multiplier,
    max: dr.max * multiplier,
  };
};

const emptyDamageRange = (): DamageRange => {
  return { min: 0, max: 0 };
};

interface TalentPage {
  affixes: Affix.Affix[];
  coreTalents: Affix.Affix[];
}

interface DivinitySlate {
  affixes: Affix.Affix[];
}

interface DivinityPage {
  slates: DivinitySlate[];
}

interface Gear {
  gearType:
    | "helmet"
    | "chest"
    | "neck"
    | "gloves"
    | "belt"
    | "boots"
    | "ring"
    | "sword"
    | "shield";
  affixes: Affix.Affix[];
}

interface GearPage {
  helmet?: Gear;
  chest?: Gear;
  neck?: Gear;
  gloves?: Gear;
  belt?: Gear;
  boots?: Gear;
  leftRing?: Gear;
  rightRing?: Gear;
  mainHand?: Gear;
  offHand?: Gear;
}

interface Loadout {
  equipmentPage: GearPage;
  talentPage: TalentPage;
  divinityPage: DivinityPage;
  customConfiguration: Affix.Affix[];
}

type DmgModType =
  | "global"
  | "attack"
  | "spell"
  | "physical"
  | "cold"
  | "lightning"
  | "fire"
  | "erosion";

namespace Affix {
  export interface Affix {
    src?: string;

    toStat(): BStat.IBStat[];
  }

  export class DmgPct implements Affix {
    constructor(
      readonly value: number,
      readonly modType: DmgModType,
      readonly addn: boolean,
      readonly src?: string
    ) {}

    toStat(): BStat.IBStat[] {
      return [
        new BStat.DamagePct(this.value, this.addn, this.modType, this.src),
      ];
    }
  }

  export class CritRatingPct implements Affix {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}

    toStat(): BStat.IBStat[] {
      return [new BStat.CritRatingPct(this.value, this.src)];
    }
  }

  export class CritDmgPct implements Affix {
    constructor(
      readonly value: number,
      readonly addn: boolean,
      readonly src?: string
    ) {}

    toStat(): BStat.IBStat[] {
      return [new BStat.CritDmgPct(this.value, this.addn, this.src)];
    }
  }

  export class AspdPct implements Affix {
    constructor(
      readonly value: number,
      readonly addn: boolean,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      return [new BStat.AspdPct(this.value, this.addn, this.src)];
    }
  }

  export class DblDmg implements Affix {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class Str implements Affix {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class StrPct implements Affix {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class Dex implements Affix {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class DexPct implements Affix {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class FervorEff implements Affix {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class SteepStrikeChance implements Affix {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class SteepStrikeDmg implements Affix {
    constructor(
      readonly value: number,
      readonly addn: boolean,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class SweepSlashDmg implements Affix {
    constructor(
      readonly value: number,
      readonly addn: boolean,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class Fervor implements Affix {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class CritDmgPerFervor implements Affix {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class AddnMainHandDmgPct implements Affix {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class GearBaseCritRating implements Affix {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class GearBaseAspd implements Affix {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class GearAspdPct implements Affix {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class GearBasePhysFlatDmg implements Affix {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class FlatGearDmg implements Affix {
    constructor(
      readonly value: DamageRange,
      readonly modType: "physical" | "cold" | "lightning" | "fire" | "erosion",
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class GearPhysDmgPct implements Affix {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class GearPlusEleMinusPhysDmg implements Affix {
    constructor(
      readonly value: DamageRange,
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }

  export class CoreTalent implements Affix {
    constructor(
      readonly name:
        | "Last Stand"
        | "Dirty Tricks"
        | "Centralize"
        | "Tenacity"
        | "Hidden Mastery"
        | "Formless"
        | "Tradeoff"
        | "Unmatched Valor",
      readonly src?: string
    ) {}
    toStat(): BStat.IBStat[] {
      throw new Error("Method not implemented.");
    }
  }
}

interface BasicStat {
  value: number;
  source: string;
}

namespace BStat {
  export interface IBStat {
    src?: string;
  }

  export class Str implements IBStat {
    constructor(
      readonly value: number,
      readonly mod: "pct" | "flat",
      readonly src?: string
    ) {}
  }

  export class Dex implements IBStat {
    constructor(
      readonly value: number,
      readonly mod: "pct" | "flat",
      readonly src?: string
    ) {}
  }

  export class Int implements IBStat {
    constructor(
      readonly value: number,
      readonly mod: "pct" | "flat",
      readonly src?: string
    ) {}
  }

  export class DamagePct implements IBStat {
    constructor(
      readonly value: number,
      readonly addn: boolean,
      readonly modType: DmgModType,
      readonly src?: string
    ) {}
  }

  export class CritRatingPct implements IBStat {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
  }

  export class CritDmgPct implements IBStat {
    constructor(
      readonly value: number,
      readonly addn: boolean,
      readonly src?: string
    ) {}
  }

  export class AspdPct implements IBStat {
    constructor(
      readonly value: number,
      readonly addn: boolean,
      readonly src?: string
    ) {}
  }

  export class FervorEffPct implements IBStat {
    constructor(
      readonly value: number,
      readonly src?: string
    ) {}
  }
}

interface StatBag {
  additionalMainHandDamage: BasicStat[];
  damage: BasicStat[];
  additionalDamage: BasicStat[];
  critRate: BasicStat[];
  critDamage: BasicStat[];
  additionalCritDamage: BasicStat[];
  attackSpeed: BasicStat[];
  additionalAttackSpeed: BasicStat[];
  doubleDamage: BasicStat[];
  str: BasicStat[];
  dex: BasicStat[];
  steepStrikeChance: BasicStat[];
  steepStrikeDamage: BasicStat[];
  additionalSweepSlashDamage: BasicStat[];
  additionalSteepStrikeDamage: BasicStat[];
  fervorEffect: BasicStat[];
}

const calculateBonusRaw = (bonuses: number[]) => {
  return R.pipe(
    bonuses,
    R.filter((b) => true),
    R.sum()
  );
};

const calculateBonus = (bonuses: BasicStat[]) => {
  return R.pipe(
    bonuses,
    R.filter((b) => true),
    R.sumBy((b) => b.value)
  );
};

const calculateAdditionalBonus = (bonuses: BasicStat[]) => {
  return R.pipe(
    bonuses,
    R.filter((b) => true),
    R.map((b) => b.value),
    R.reduce((b1, b2) => b1 * (1 + b2), 1)
  );
};

const collectAffixes = (loadout: Loadout): Affix.Affix[] => {
  return [
    ...loadout.divinityPage.slates.map((s) => s.affixes).flat(),
    ...loadout.talentPage.affixes,
    ...loadout.talentPage.coreTalents,
    ...(loadout.equipmentPage.helmet?.affixes || []),
    ...(loadout.equipmentPage.chest?.affixes || []),
    ...(loadout.equipmentPage.neck?.affixes || []),
    ...(loadout.equipmentPage.gloves?.affixes || []),
    ...(loadout.equipmentPage.belt?.affixes || []),
    ...(loadout.equipmentPage.boots?.affixes || []),
    ...(loadout.equipmentPage.leftRing?.affixes || []),
    ...(loadout.equipmentPage.rightRing?.affixes || []),
    ...(loadout.equipmentPage.mainHand?.affixes || []),
    ...(loadout.equipmentPage.offHand?.affixes || []),
  ];
};

interface OffenseSummary {
  averageHit: number;
  critRatePct: number;
  critDamagePct: number;
  aspdBonusPct: number;
  additionalAspdBonusPct: number;
  aspd: number;
  dmgBonus: number;
  additionalDmgBonus: number;
  dps: number;
}

interface GearDmg {
  mainHand: WeaponDmg;
  offHand?: WeaponDmg;
}

interface WeaponDmg {
  phys: DamageRange;
  cold: DamageRange;
  lightning: DamageRange;
  fire: DamageRange;
  erosion: DamageRange;
}

const emptyGearDmg = (): GearDmg => {
  return {
    mainHand: {
      phys: { min: 0, max: 0 },
      cold: { min: 0, max: 0 },
      lightning: { min: 0, max: 0 },
      fire: { min: 0, max: 0 },
      erosion: { min: 0, max: 0 },
    },
  };
};

const findAffix = <T extends new (...args: any[]) => Affix.Affix>(
  affixes: Affix.Affix[],
  type: T
): InstanceType<T> | undefined => {
  return affixes.find((a) => a instanceof type) as InstanceType<T> | undefined;
};

const filterAffix = <T extends new (...args: any[]) => Affix.Affix>(
  affixes: Affix.Affix[],
  type: T
): InstanceType<T>[] => {
  return affixes.filter((a) => a instanceof type) as InstanceType<T>[];
};

// currently only calculating mainhand
const calculateGearDmg = (
  loadout: Loadout,
  allAffixes: Affix.Affix[]
): GearDmg => {
  let mh = loadout.equipmentPage.mainHand;
  if (mh === undefined) {
    return emptyGearDmg();
  }
  let basePhysDmg = findAffix(mh.affixes, Affix.GearBasePhysFlatDmg);
  if (basePhysDmg === undefined) {
    return emptyGearDmg();
  }

  let phys = emptyDamageRange();
  let cold = emptyDamageRange();
  let lightning = emptyDamageRange();
  let fire = emptyDamageRange();
  let erosion = emptyDamageRange();

  phys.min += basePhysDmg.value;
  phys.max += basePhysDmg.value;
  let physBonusPct = 0;

  let gearEleMinusPhysDmg = findAffix(
    mh.affixes,
    Affix.GearPlusEleMinusPhysDmg
  );
  if (gearEleMinusPhysDmg !== undefined) {
    physBonusPct -= 1;

    let min = gearEleMinusPhysDmg.value.min;
    let max = gearEleMinusPhysDmg.value.max;
    cold.min += min;
    cold.max += max;
    lightning.min += min;
    lightning.max += max;
    fire.min += min;
    fire.max += max;
  }

  let gearPhysDmgPct = findAffix(mh.affixes, Affix.GearPhysDmgPct);
  if (gearPhysDmgPct !== undefined) {
    physBonusPct += gearPhysDmgPct.value;
  }

  filterAffix(mh.affixes, Affix.FlatGearDmg).forEach((a) => {
    match(a.modType)
      .with("physical", () => addDR(phys, a.value))
      .with("cold", () => addDR(cold, a.value))
      .with("lightning", () => addDR(lightning, a.value))
      .with("fire", () => addDR(fire, a.value))
      .with("erosion", () => addDR(erosion, a.value))
      .exhaustive();
  });

  let addnMHDmgMult = 1;
  filterAffix(allAffixes, Affix.AddnMainHandDmgPct).forEach((a) => {
    addnMHDmgMult *= 1 + a.value;
  });

  phys = multDR(phys, 1 + physBonusPct);
  phys = multDR(phys, addnMHDmgMult);
  cold = multDR(cold, addnMHDmgMult);
  lightning = multDR(lightning, addnMHDmgMult);
  fire = multDR(fire, addnMHDmgMult);
  erosion = multDR(erosion, addnMHDmgMult);
  return {
    mainHand: {
      phys: phys,
      cold: cold,
      lightning: lightning,
      fire: fire,
      erosion: erosion,
    },
  };
};

const calculateGearAspd = (
  loadout: Loadout,
  allAffixes: Affix.Affix[]
): number => {
  let mh = loadout.equipmentPage.mainHand;
  if (mh === undefined) {
    return 0;
  }
  let baseAspd = findAffix(mh.affixes, Affix.GearBaseAspd);
  if (baseAspd === undefined) {
    return 0;
  }
  let gearAspdPctBonus = calculateBonusRaw(
    filterAffix(mh.affixes, Affix.GearAspdPct).map((b) => b.value)
  );
  return baseAspd.value * (1 + gearAspdPctBonus);
};

interface DmgPcts {
  global: BStat.DamagePct[]
}

const calculateDmgPcts = (allAffixes: Affix.Affix[]) => {

}

const calculateOffense = (loadout: Loadout): OffenseSummary => {
  let allAffixes = collectAffixes(loadout);
  let gearDmg = calculateGearDmg(loadout, allAffixes);
  let gearAspd = calculateGearAspd(loadout, allAffixes);

  let dmgPcts = filterAffix(allAffixes, Affix.DmgPct);
  let globalDmgPcts = dmgPcts.filter((d) => d.modType === "global");
  let attackDmgPcts = dmgPcts.filter((d) => d.modType === "attack");
  let spellDmgPcts = dmgPcts.filter((d) => d.modType === "spell");
  let physDmgPcts = dmgPcts.filter((d) => d.modType === "physical");
  let coldDmgPcts = dmgPcts.filter((d) => d.modType === "cold");
  let lightningDmgPcts = dmgPcts.filter((d) => d.modType === "lightning");
  let fireDmgPcts = dmgPcts.filter((d) => d.modType === "fire");
  let erosionDmgPcts = dmgPcts.filter((d) => d.modType === "erosion");
};

const _calculateDps = (statBag: StatBag) => {
  // let weaponDamage = 178;
  //let weaponDamage = 209.5;
  let weaponDamage = ((20 + 107) / 2) * 2.1;
  let weaponAttackSpeed = 1.5;
  let weaponCritRate = 0.05;

  let additionalMainHandDamageBonus = calculateAdditionalBonus(
    statBag.additionalMainHandDamage
  );
  let dmgBonus = calculateBonus(statBag.damage);
  let additionalAttrDmgBonus = {
    value:
      0.005 *
      (R.sumBy(statBag.str, (b) => b.value) +
        R.sumBy(statBag.dex, (b) => b.value)),
    source: "main stats",
  };
  let additionalDmgBonus = calculateAdditionalBonus(
    R.concat(statBag.additionalDamage, [additionalAttrDmgBonus])
  );

  let critRateBonus = calculateBonus(statBag.critRate);

  let critDmgBonus = calculateBonus(statBag.critDamage);
  let additionalCritDamageBonus = calculateAdditionalBonus(
    statBag.additionalCritDamage
  );

  let aspdBonus = calculateBonus(statBag.attackSpeed);
  let additionalAspdBonus = calculateAdditionalBonus(
    statBag.additionalAttackSpeed
  );

  let doubleDamageBonus = calculateBonus(statBag.doubleDamage);

  let steepStrikeChance = calculateBonus(statBag.steepStrikeChance);
  let steepStrikeDamageBonus = calculateBonus(statBag.steepStrikeDamage);
  let additionalSweepSlashDamage = calculateAdditionalBonus(
    statBag.additionalSweepSlashDamage
  );
  let additionalSteepStrikeDamageBonus = calculateAdditionalBonus(
    statBag.additionalSteepStrikeDamage
  );
  let steepWeaponDamage =
    Math.min(1, steepStrikeChance) *
      4.21 *
      (1 + steepStrikeDamageBonus) *
      additionalSteepStrikeDamageBonus +
    Math.max(0, 1 - steepStrikeChance) * 2.1 * additionalSweepSlashDamage;

  console.log(`steepWeaponDamage: ${steepWeaponDamage.toLocaleString()}`);

  let trinityMult = 1;

  let damage =
    weaponDamage *
    (1 + dmgBonus) *
    additionalDmgBonus *
    steepWeaponDamage *
    additionalMainHandDamageBonus *
    trinityMult;
  let critRate = Math.min(1, weaponCritRate * (1 + critRateBonus));
  let critDamage = (1.5 + critDmgBonus) * additionalCritDamageBonus;
  let attackSpeed = Math.min(
    30,
    weaponAttackSpeed * (1 + aspdBonus) * additionalAspdBonus
  );
  let dph = damage * (1 + critRate * (critDamage - 1));
  let dps =
    damage *
    (1 + critRate * (critDamage - 1)) *
    attackSpeed *
    (1 + doubleDamageBonus);

  console.log(`dph: ${dph.toLocaleString()}`);
  console.log(`dph no crit: ${damage.toLocaleString()}`);
  console.log(`damage bonus: ${dmgBonus.toLocaleString()}`);
  console.log(`critRate: ${critRate}`);
  console.log(`critDamage: ${critDamage}`);
  console.log(`aspdBonus: ${aspdBonus}`);
  console.log(`additionalAspdBonus: ${additionalAspdBonus - 1}`);
  console.log(`attackSpeed: ${attackSpeed}`);
  console.log(`dps: ${dps.toLocaleString()}`);
};
let bag2: StatBag = {
  additionalMainHandDamage: [
    // { value: 0.08, source: "sword" },
    { value: 0.22, source: "left ring" },
    { value: 0.28, source: "right ring" },
    { value: 0.192, source: "trait 3" },
  ],
  damage: [
    // { value: 0.5, source: "sword" },
    { value: 0.91, source: "right ring" },
    { value: 0.27, source: "talent: god of might 0x3" },
    { value: 0.54, source: "talent: god of might 3x3" },
    { value: 0.27, source: "talent: god of might 12x1" },
    { value: 0.54, source: "talent: god of might 15x1" },
    { value: 0.27, source: "talent: god of might 12x5" },
    { value: 0.36 * 1.64, source: "talent: the brave 3x4" },
    { value: 0.54 * 1.64, source: "talent: the brave 3x5" },
    { value: 0.27, source: "talent: the brave 12x1" },
    { value: 0.54, source: "talent: the brave 15x1" },
    { value: 0.27, source: "talent: ronin 15x2" },
  ],
  additionalDamage: [
    // { value: -0.11, source: "lvl40 dummy armor" },
    { value: -0.066, source: "lvl40 dummy armor nonphys" },
    // { value: -.44, source: "lvl85 dummy armor"},
    { value: 0.25, source: "scorch res pen" },
    { value: 0.05, source: "numb 1 stack" },
    { value: 0.19, source: "dirty tricks (3 ailment)" },
    { value: 0.08, source: "agility blessing" },
    { value: 0.1, source: "motionless" },
    { value: 0.1, source: "boots: skill +1" },
    { value: 0.1, source: "talent: god of might 18x1: skill +1" },
    { value: 0.05, source: "attack aggression" },
    { value: 0.15, source: "hidden mastery" },
    { value: 0.25, source: "tradeoff" },
    { value: 0.08 * 1.44, source: "talent: the brave 0x5" },
    { value: 0.08, source: "talent: the brave 18x1" },
    { value: 0.1, source: "talent: ranger 18x4" },
    { value: 0.3, source: "trait 0" }, // ele only
    { value: 0.28, source: "trait 1" }, // flaky?
    { value: 0.4, source: "trait 2" }, // ele only
    { value: 0.1, source: "trait 3" }, // ele only
    { value: -0.2, source: "trait uptime" },
  ],
  critRate: [
    {
      value: 3 * (1 + 0.12 + 0.84 + 0.64 + 0.12 + 0.24 + 0.2 + 0.8),
      source: "fervor + eff",
    },
  ],
  critDamage: [
    { value: 0.63, source: "right ring" },
    { value: 0.225, source: "talent: ranger 3x2" },
    { value: 0.75, source: "talent: ranger 15x1" },
    { value: 0.58, source: "memory 1" },
    { value: 0.42, source: "memory 2" },
    { value: 0.58, source: "memory 2" },
  ],
  additionalCritDamage: [],
  attackSpeed: [
    { value: 0.06, source: "divinity" },
    { value: 0.16, source: "agility blessing" },
    { value: 0.15, source: "hidden mastery" },
    { value: 0.05, source: "boots" },
    { value: 0.09, source: "talent: the brave 3x2" },
    { value: 0.06, source: "talent: the brave 6x2" },
    { value: 0.09, source: "talent: ranger 6x1" },
    { value: 0.18, source: "talent: ranger 9x1" },
    { value: 0.09, source: "talent: ronin 3x2" },
    { value: 0.18, source: "talent: ronin 6x2" },
    { value: 0.14, source: "memory 3" },
    { value: 0.44, source: "memory 3" },
  ],
  additionalAttackSpeed: [
    { value: 0.05, source: "attack aggression" },
    { value: 0.08, source: "hasten" },
    { value: 0.2, source: "trait 0" },
    { value: 0.19, source: "weapon" },
  ],
  doubleDamage: [
    //{ value: 0.39, source: "sword" }
  ],
  str: [{ value: 162, source: "stat sheet" }],
  dex: [{ value: 152, source: "stat sheet" }],
  steepStrikeChance: [{ value: 1, source: "stat sheet" }],
  steepStrikeDamage: [],
  additionalSweepSlashDamage: [{ value: -0.15, source: "neck" }],
  additionalSteepStrikeDamage: [{ value: 1.4, source: "neck" }],
  fervorEffect: [],
};

// calculateDps(bag2);

let loadout: Loadout = {
  equipmentPage: {
    helmet: { gearType: "helmet", affixes: [] },
    chest: { gearType: "chest", affixes: [] },
    neck: { gearType: "neck", affixes: [] },
    gloves: { gearType: "gloves", affixes: [] },
    belt: { gearType: "belt", affixes: [] },
    boots: { gearType: "boots", affixes: [] },
    leftRing: { gearType: "ring", affixes: [] },
    rightRing: { gearType: "ring", affixes: [] },
    mainHand: { gearType: "sword", affixes: [] },
    offHand: { gearType: "shield", affixes: [] },
  },
  talentPage: { affixes: [], coreTalents: [] },
  divinityPage: { slates: [] },
  customConfiguration: [],
};
