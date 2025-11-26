import { Mod } from "./mod";
import { TreeName } from "./talent_tree_types";
import { Skill } from "./offense";
import { EquipmentType } from "./gear_affix_data/types";

export interface Affix {
  mods: Mod[];
  maxDivinity?: number;
  src?: string;
  raw?: string;
}

export interface DmgRange {
  // inclusive on both ends
  min: number;
  max: number;
}

export interface Configuration {
  fervor: {
    enabled: boolean;
    points: number;
  };
}

export interface DivinitySlate {
  affixes: Affix[];
}

export interface Gear {
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
  affixes: Affix[];
}

export interface TalentPage {
  affixes: Affix[];
}

export interface DivinityPage {
  slates: DivinitySlate[];
}

export interface GearPage {
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

export interface Loadout {
  equipmentPage: GearPage;
  talentPage: TalentPage;
  divinityPage: DivinityPage;
  customConfiguration: Affix[];
}

export interface RawAllocatedTalentNode {
  x: number;
  y: number;
  points: number;
}

export interface RawTalentTree {
  name: string;
  allocatedNodes: RawAllocatedTalentNode[];
}

export interface RawTalentPage {
  tree1: RawTalentTree;
  tree2: RawTalentTree;
  tree3: RawTalentTree;
  tree4: RawTalentTree;
}

export interface TalentNodeData {
  nodeType: "micro" | "medium" | "legendary";
  rawAffix: string;
  position: { x: number; y: number };
  prerequisite?: { x: number; y: number };
  maxPoints: number;
  iconName: string;
}

export interface TalentTreeData {
  name: TreeName;
  nodes: TalentNodeData[];
}

export interface RawGear {
  id: string;
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
  affixes: string[];
  equipmentType?: EquipmentType;
}

export interface RawGearPage {
  helmet?: RawGear;
  chest?: RawGear;
  neck?: RawGear;
  gloves?: RawGear;
  belt?: RawGear;
  boots?: RawGear;
  leftRing?: RawGear;
  rightRing?: RawGear;
  mainHand?: RawGear;
  offHand?: RawGear;
}

export interface RawSkill {
  skill: Skill;
  enabled: boolean;
}

export interface RawSkillPage {
  skills: RawSkill[];
}

export interface RawLoadout {
  equipmentPage: RawGearPage;
  talentPage: RawTalentPage;
  skillPage: RawSkillPage;
  itemsList: RawGear[];
}
