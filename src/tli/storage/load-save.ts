import type {
  SaveData,
  Gear as SaveDataGear,
  GearPage as SaveDataGearPage,
  TalentPage as SaveDataTalentPage,
  TalentTree as SaveDataTalentTree,
  PlacedPrism as SaveDataPlacedPrism,
  CraftedPrism as SaveDataCraftedPrism,
} from "@/src/app/lib/save-data";
import type {
  Affix,
  EquippedGear,
  Gear,
  GearPage,
  Loadout,
  TalentPage,
  TalentTree,
  PlacedPrism,
  CraftedPrism,
  AllocatedTalents,
  TalentInventory,
} from "../core";
import type { Mod } from "../mod";
import { parseMod } from "../mod_parser";

type GearSlot = keyof SaveDataGearPage;

const getSrc = (gearSlot: GearSlot): string => {
  return `Gear#${gearSlot}`;
};

const convertAffix = (affixText: string, src: string | undefined): Affix => {
  const affixLines = affixText.split(/\n/);
  const mods: Mod[] = [];
  for (const affixLine of affixLines) {
    const mod = parseMod(affixLine);
    if (mod !== undefined) {
      mods.push({ ...mod, src });
    }
  }

  return {
    text: affixText,
    mods: mods.length > 0 ? mods : undefined,
    src,
  };
};

const convertAffixArray = (
  affixes: string[] | undefined,
  src: string | undefined,
): Affix[] | undefined => {
  if (!affixes || affixes.length === 0) return undefined;
  return affixes.map((text) => convertAffix(text, src));
};

const convertGear = (gear: SaveDataGear, src: string | undefined): Gear => {
  return {
    equipmentType: gear.equipmentType,
    id: gear.id,
    rarity: gear.rarity,
    legendaryName: gear.legendaryName,
    baseStats: gear.baseStats ? convertAffix(gear.baseStats, src) : undefined,
    base_affixes: convertAffixArray(gear.base_affixes, src),
    prefixes: convertAffixArray(gear.prefixes, src),
    suffixes: convertAffixArray(gear.suffixes, src),
    blend_affix: gear.blend_affix
      ? convertAffix(gear.blend_affix, src)
      : undefined,
    legendary_affixes: convertAffixArray(gear.legendary_affixes, src),
  };
};

const convertGearPage = (
  saveDataGearPage: SaveDataGearPage,
  gearInventory: SaveDataGear[],
): GearPage => {
  const slots: GearSlot[] = [
    "helmet",
    "chest",
    "neck",
    "gloves",
    "belt",
    "boots",
    "leftRing",
    "rightRing",
    "mainHand",
    "offHand",
  ];

  const equippedGear: EquippedGear = {};

  for (const slot of slots) {
    const gear = saveDataGearPage[slot];
    if (gear) {
      const src = getSrc(slot);
      equippedGear[slot] = convertGear(gear, src);
    }
  }

  return {
    equippedGear,
    inventory: gearInventory.map((gear) => {
      return convertGear(gear, undefined);
    }),
  };
};

type TreeSlot = "tree1" | "tree2" | "tree3" | "tree4";

const getTalentSrc = (treeSlot: TreeSlot): string => {
  return `Talent#${treeSlot}`;
};

const convertTalentTree = (
  tree: SaveDataTalentTree,
  src: string,
): TalentTree => {
  return {
    name: tree.name,
    allocatedNodes: tree.allocatedNodes,
    selectedCoreTalents: tree.selectedCoreTalents
      ? tree.selectedCoreTalents.map((text) => convertAffix(text, src))
      : undefined,
  };
};

const convertCraftedPrism = (
  prism: SaveDataCraftedPrism,
  src: string,
): CraftedPrism => {
  return {
    id: prism.id,
    rarity: prism.rarity,
    baseAffix: convertAffix(prism.baseAffix, src),
    gaugeAffixes: prism.gaugeAffixes.map((text) => convertAffix(text, src)),
  };
};

const convertPlacedPrism = (
  placedPrism: SaveDataPlacedPrism,
  src: string,
): PlacedPrism => {
  return {
    prism: convertCraftedPrism(placedPrism.prism, src),
    treeSlot: placedPrism.treeSlot,
    position: placedPrism.position,
  };
};

const convertTalentPage = (
  saveDataTalentPage: SaveDataTalentPage,
  prismList: SaveDataCraftedPrism[],
  inverseImageList: SaveData["inverseImageList"],
): TalentPage => {
  const treeSlots: TreeSlot[] = ["tree1", "tree2", "tree3", "tree4"];

  const allocatedTalents: AllocatedTalents = {};

  for (const slot of treeSlots) {
    const tree = saveDataTalentPage[slot];
    if (tree) {
      const src = getTalentSrc(slot);
      allocatedTalents[slot] = convertTalentTree(tree, src);
    }
  }

  if (saveDataTalentPage.placedPrism) {
    const src = getTalentSrc(saveDataTalentPage.placedPrism.treeSlot);
    allocatedTalents.placedPrism = convertPlacedPrism(
      saveDataTalentPage.placedPrism,
      src,
    );
  }

  if (saveDataTalentPage.placedInverseImage) {
    allocatedTalents.placedInverseImage = saveDataTalentPage.placedInverseImage;
  }

  const inventory: TalentInventory = {
    prismList,
    inverseImageList,
  };

  return {
    allocatedTalents,
    inventory,
  };
};

export const loadSave = (saveData: SaveData): Loadout => {
  return {
    gearPage: convertGearPage(saveData.equipmentPage, saveData.itemsList),
    talentPage: convertTalentPage(
      saveData.talentPage,
      saveData.prismList,
      saveData.inverseImageList,
    ),
    divinityPage: { slates: [] },
    customConfiguration: [],
  };
};
