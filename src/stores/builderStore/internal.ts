"use client";

import { create } from "zustand";
import { combine, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { getBaseTraitForHero } from "../../lib/hero-utils";
import type {
  AllocatedTalentNode,
  ConfigurationPage,
  CraftedInverseImage,
  CraftedPrism,
  DivinitySlate,
  Gear,
  HeroMemory,
  HeroMemorySlot,
  PactspiritSlot,
  ReflectedAllocatedNode,
  RingSlotState,
  SaveData,
} from "../../lib/save-data";
import type { SavesIndex } from "../../lib/saves";
import {
  loadSaveData,
  loadSavesIndex,
  saveSaveData,
  saveSavesIndex,
} from "../../lib/saves";
import {
  createEmptyConfigurationPage,
  createEmptyHeroPage,
  createEmptyPactspiritSlot,
  createEmptySaveData,
  generateItemId,
} from "../../lib/storage";
import type {
  GearSlot,
  InstalledDestinyResult,
  PactspiritSlotIndex,
  RingSlotKey,
  TreeSlot,
} from "../../lib/types";
import {
  type DivinitySlate as CoreDivinitySlate,
  getAffixText,
} from "../../tli/core";

export interface InternalBuilderState {
  saveData: SaveData;
  hasUnsavedChanges: boolean;
  currentSaveId: string | undefined;
  currentSaveName: string | undefined;
  savesIndex: SavesIndex;
}

const initialState: InternalBuilderState = {
  saveData: createEmptySaveData(),
  hasUnsavedChanges: false,
  currentSaveId: undefined,
  currentSaveName: undefined,
  savesIndex: { currentSaveId: undefined, saves: [] },
};

// Convert core DivinitySlate to save-data format
const toSaveDataSlate = (slate: CoreDivinitySlate): DivinitySlate => ({
  id: slate.id,
  god: slate.god,
  shape: slate.shape,
  rotation: slate.rotation,
  flippedH: slate.flippedH,
  flippedV: slate.flippedV,
  affixes: slate.affixes.map(getAffixText),
  metaAffixes: slate.metaAffixes,
  isLegendary: slate.isLegendary,
  legendaryName: slate.legendaryName,
});

export const internalStore = create(
  immer(
    persist(
      combine(initialState, (set, get) => ({
        // Core actions
        setSaveData: (saveData: SaveData) => {
          set((state) => {
            state.saveData = saveData;
            state.hasUnsavedChanges = false;
          });
        },

        loadFromSave: (saveId: string) => {
          const index = loadSavesIndex();
          const saveMeta = index.saves.find((s) => s.id === saveId);
          if (!saveMeta) return false;

          const data = loadSaveData(saveId);
          if (!data) return false;

          const updatedIndex = { ...index, currentSaveId: saveId };
          saveSavesIndex(updatedIndex);

          set((state) => {
            state.saveData = data;
            state.currentSaveId = saveId;
            state.currentSaveName = saveMeta.name;
            state.savesIndex = updatedIndex;
            state.hasUnsavedChanges = false;
          });
          return true;
        },

        save: () => {
          const { currentSaveId, saveData, savesIndex } = get();
          if (!currentSaveId) return false;

          const success = saveSaveData(currentSaveId, saveData);
          if (success) {
            const now = Date.now();
            const saveIndex = savesIndex.saves.findIndex(
              (s) => s.id === currentSaveId,
            );
            set((state) => {
              if (saveIndex >= 0) {
                state.savesIndex.saves[saveIndex].updatedAt = now;
              }
              state.hasUnsavedChanges = false;
            });
            saveSavesIndex(get().savesIndex);
          }
          return success;
        },

        resetUnsavedChanges: () => {
          set((state) => {
            state.hasUnsavedChanges = false;
          });
        },

        // Equipment actions
        addItemToInventory: (item: Gear) => {
          set((state) => {
            state.saveData.equipmentPage.inventory.push(item);
            state.hasUnsavedChanges = true;
          });
        },

        copyItem: (itemId: string) => {
          const item = get().saveData.equipmentPage.inventory.find(
            (i) => i.id === itemId,
          );
          if (!item) return;
          const newItem: Gear = { ...item, id: generateItemId() };
          set((state) => {
            state.saveData.equipmentPage.inventory.push(newItem);
            state.hasUnsavedChanges = true;
          });
        },

        deleteItem: (itemId: string) => {
          set((state) => {
            state.saveData.equipmentPage.inventory =
              state.saveData.equipmentPage.inventory.filter(
                (item) => item.id !== itemId,
              );
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
            for (const slot of slots) {
              if (
                state.saveData.equipmentPage.equippedGear[slot]?.id === itemId
              ) {
                delete state.saveData.equipmentPage.equippedGear[slot];
              }
            }
            state.hasUnsavedChanges = true;
          });
        },

        selectItemForSlot: (slot: GearSlot, itemId: string | undefined) => {
          set((state) => {
            if (!itemId) {
              delete state.saveData.equipmentPage.equippedGear[slot];
              state.hasUnsavedChanges = true;
              return;
            }
            const item = state.saveData.equipmentPage.inventory.find(
              (i) => i.id === itemId,
            );
            if (!item) return;
            state.saveData.equipmentPage.equippedGear[slot] = item;
            state.hasUnsavedChanges = true;
          });
        },

        isItemEquipped: (itemId: string) => {
          const { saveData } = get();
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
          return slots.some(
            (slot) => saveData.equipmentPage.equippedGear[slot]?.id === itemId,
          );
        },

        // Talent actions
        setTreeName: (slot: TreeSlot, treeName: string) => {
          set((state) => {
            state.saveData.talentPage.talentTrees[slot] = {
              name: treeName,
              allocatedNodes: [],
              selectedCoreTalents: [],
            };
            state.hasUnsavedChanges = true;
          });
        },

        clearTree: (slot: TreeSlot) => {
          set((state) => {
            delete state.saveData.talentPage.talentTrees[slot];
            state.hasUnsavedChanges = true;
          });
        },

        setAllocatedNodes: (slot: TreeSlot, nodes: AllocatedTalentNode[]) => {
          set((state) => {
            const tree = state.saveData.talentPage.talentTrees[slot];
            if (!tree) return;
            tree.allocatedNodes = nodes;
            state.hasUnsavedChanges = true;
          });
        },

        setCoreTalents: (slot: TreeSlot, talents: string[]) => {
          set((state) => {
            const tree = state.saveData.talentPage.talentTrees[slot];
            if (!tree) return;
            tree.selectedCoreTalents = talents;
            state.hasUnsavedChanges = true;
          });
        },

        addPrismToInventory: (prism: CraftedPrism) => {
          set((state) => {
            state.saveData.talentPage.inventory.prismList.push(prism);
            state.hasUnsavedChanges = true;
          });
        },

        deletePrism: (prismId: string) => {
          set((state) => {
            state.saveData.talentPage.inventory.prismList =
              state.saveData.talentPage.inventory.prismList.filter(
                (p) => p.id !== prismId,
              );
            if (
              state.saveData.talentPage.talentTrees.placedPrism?.prism.id ===
              prismId
            ) {
              delete state.saveData.talentPage.talentTrees.placedPrism;
            }
            state.hasUnsavedChanges = true;
          });
        },

        placePrism: (
          prism: CraftedPrism,
          treeSlot: TreeSlot,
          position: { x: number; y: number },
        ) => {
          set((state) => {
            state.saveData.talentPage.talentTrees.placedPrism = {
              prism,
              treeSlot,
              position,
            };
            state.hasUnsavedChanges = true;
          });
        },

        removePlacedPrism: () => {
          set((state) => {
            delete state.saveData.talentPage.talentTrees.placedPrism;
            state.hasUnsavedChanges = true;
          });
        },

        addInverseImageToInventory: (inverseImage: CraftedInverseImage) => {
          set((state) => {
            state.saveData.talentPage.inventory.inverseImageList.push(
              inverseImage,
            );
            state.hasUnsavedChanges = true;
          });
        },

        deleteInverseImage: (inverseImageId: string) => {
          set((state) => {
            state.saveData.talentPage.inventory.inverseImageList =
              state.saveData.talentPage.inventory.inverseImageList.filter(
                (ii) => ii.id !== inverseImageId,
              );
            if (
              state.saveData.talentPage.talentTrees.placedInverseImage
                ?.inverseImage.id === inverseImageId
            ) {
              delete state.saveData.talentPage.talentTrees.placedInverseImage;
            }
            state.hasUnsavedChanges = true;
          });
        },

        placeInverseImage: (
          inverseImage: CraftedInverseImage,
          treeSlot: "tree2" | "tree3" | "tree4",
          position: { x: number; y: number },
        ) => {
          set((state) => {
            state.saveData.talentPage.inventory.inverseImageList =
              state.saveData.talentPage.inventory.inverseImageList.filter(
                (ii) => ii.id !== inverseImage.id,
              );
            state.saveData.talentPage.talentTrees.placedInverseImage = {
              inverseImage,
              treeSlot,
              position,
              reflectedAllocatedNodes: [],
            };
            state.hasUnsavedChanges = true;
          });
        },

        removePlacedInverseImage: () => {
          set((state) => {
            const placedInverseImage =
              state.saveData.talentPage.talentTrees.placedInverseImage;
            if (!placedInverseImage) return;
            state.saveData.talentPage.inventory.inverseImageList.push(
              placedInverseImage.inverseImage,
            );
            delete state.saveData.talentPage.talentTrees.placedInverseImage;
            state.hasUnsavedChanges = true;
          });
        },

        allocateReflectedNode: (
          x: number,
          y: number,
          sourceX: number,
          sourceY: number,
        ) => {
          set((state) => {
            const placedInverseImage =
              state.saveData.talentPage.talentTrees.placedInverseImage;
            if (!placedInverseImage) return;

            const existingNode =
              placedInverseImage.reflectedAllocatedNodes.find(
                (n) => n.x === x && n.y === y,
              );

            if (existingNode) {
              existingNode.points += 1;
            } else {
              placedInverseImage.reflectedAllocatedNodes.push({
                x,
                y,
                sourceX,
                sourceY,
                points: 1,
              });
            }
            state.hasUnsavedChanges = true;
          });
        },

        deallocateReflectedNode: (x: number, y: number) => {
          set((state) => {
            const placedInverseImage =
              state.saveData.talentPage.talentTrees.placedInverseImage;
            if (!placedInverseImage) return;

            const existing = placedInverseImage.reflectedAllocatedNodes.find(
              (n) => n.x === x && n.y === y,
            );
            if (!existing) return;

            if (existing.points > 1) {
              existing.points -= 1;
            } else {
              placedInverseImage.reflectedAllocatedNodes =
                placedInverseImage.reflectedAllocatedNodes.filter(
                  (n) => !(n.x === x && n.y === y),
                );
            }
            state.hasUnsavedChanges = true;
          });
        },

        setReflectedAllocatedNodes: (nodes: ReflectedAllocatedNode[]) => {
          set((state) => {
            const placedInverseImage =
              state.saveData.talentPage.talentTrees.placedInverseImage;
            if (!placedInverseImage) return;
            placedInverseImage.reflectedAllocatedNodes = nodes;
            state.hasUnsavedChanges = true;
          });
        },

        // Hero actions
        setHero: (hero: string | undefined) => {
          set((state) => {
            state.saveData.heroPage.selectedHero = hero;
            state.hasUnsavedChanges = true;
          });
        },

        setTrait: (
          level: "level1" | "level45" | "level60" | "level75",
          trait: string | undefined,
        ) => {
          set((state) => {
            state.saveData.heroPage.traits[level] = trait;
            state.hasUnsavedChanges = true;
          });
        },

        addHeroMemory: (memory: HeroMemory) => {
          set((state) => {
            state.saveData.heroPage.memoryInventory.push(memory);
            state.hasUnsavedChanges = true;
          });
        },

        deleteHeroMemory: (memoryId: string) => {
          set((state) => {
            state.saveData.heroPage.memoryInventory =
              state.saveData.heroPage.memoryInventory.filter(
                (m) => m.id !== memoryId,
              );
            (["slot45", "slot60", "slot75"] as HeroMemorySlot[]).forEach(
              (slot) => {
                if (
                  state.saveData.heroPage.memorySlots[slot]?.id === memoryId
                ) {
                  state.saveData.heroPage.memorySlots[slot] = undefined;
                }
              },
            );
            state.hasUnsavedChanges = true;
          });
        },

        equipHeroMemory: (
          slot: HeroMemorySlot,
          memory: HeroMemory | undefined,
        ) => {
          set((state) => {
            state.saveData.heroPage.memorySlots[slot] = memory;
            state.hasUnsavedChanges = true;
          });
        },

        copyHeroMemory: (memoryId: string) => {
          const memory = get().saveData.heroPage.memoryInventory.find(
            (m) => m.id === memoryId,
          );
          if (!memory) return;
          const newMemory = { ...memory, id: generateItemId() };
          set((state) => {
            state.saveData.heroPage.memoryInventory.push(newMemory);
            state.hasUnsavedChanges = true;
          });
        },

        // Pactspirit actions
        setPactspirit: (
          slotIndex: PactspiritSlotIndex,
          name: string | undefined,
        ) => {
          set((state) => {
            const slotKey =
              `slot${slotIndex}` as keyof typeof state.saveData.pactspiritPage;
            state.saveData.pactspiritPage[slotKey].pactspiritName = name;
            state.hasUnsavedChanges = true;
          });
        },

        setPactspiritLevel: (slotIndex: PactspiritSlotIndex, level: number) => {
          set((state) => {
            const slotKey =
              `slot${slotIndex}` as keyof typeof state.saveData.pactspiritPage;
            state.saveData.pactspiritPage[slotKey].level = level;
            state.hasUnsavedChanges = true;
          });
        },

        setRingDestiny: (
          slotIndex: PactspiritSlotIndex,
          ringSlot: RingSlotKey,
          destiny: RingSlotState["installedDestiny"],
        ) => {
          set((state) => {
            const slotKey =
              `slot${slotIndex}` as keyof typeof state.saveData.pactspiritPage;
            state.saveData.pactspiritPage[slotKey].rings[ringSlot] = {
              installedDestiny: destiny,
            };
            state.hasUnsavedChanges = true;
          });
        },

        updatePactspiritSlot: (
          slotIndex: PactspiritSlotIndex,
          slot: PactspiritSlot,
        ) => {
          set((state) => {
            const slotKey =
              `slot${slotIndex}` as keyof typeof state.saveData.pactspiritPage;
            state.saveData.pactspiritPage[slotKey] = slot;
            state.hasUnsavedChanges = true;
          });
        },

        // Divinity actions
        addSlateToInventory: (slate: CoreDivinitySlate) => {
          const saveDataSlate = toSaveDataSlate(slate);
          set((state) => {
            state.saveData.divinityPage.inventory.push(saveDataSlate);
            state.hasUnsavedChanges = true;
          });
        },

        deleteSlate: (slateId: string) => {
          set((state) => {
            state.saveData.divinityPage.inventory =
              state.saveData.divinityPage.inventory.filter(
                (s) => s.id !== slateId,
              );
            state.saveData.divinityPage.placedSlates =
              state.saveData.divinityPage.placedSlates.filter(
                (p) => p.slateId !== slateId,
              );
            state.hasUnsavedChanges = true;
          });
        },

        placeSlate: (
          slateId: string,
          position: { row: number; col: number },
        ) => {
          set((state) => {
            const existing = state.saveData.divinityPage.placedSlates.find(
              (p) => p.slateId === slateId,
            );
            if (existing) {
              existing.position = position;
            } else {
              state.saveData.divinityPage.placedSlates.push({
                slateId,
                position,
              });
            }
            state.hasUnsavedChanges = true;
          });
        },

        removeSlate: (slateId: string) => {
          set((state) => {
            state.saveData.divinityPage.placedSlates =
              state.saveData.divinityPage.placedSlates.filter(
                (p) => p.slateId !== slateId,
              );
            state.hasUnsavedChanges = true;
          });
        },

        updateSlate: (slateId: string, updates: Partial<DivinitySlate>) => {
          set((state) => {
            const slate = state.saveData.divinityPage.inventory.find(
              (s) => s.id === slateId,
            );
            if (slate) {
              Object.assign(slate, updates);
            }
            state.hasUnsavedChanges = true;
          });
        },

        // Skills actions
        setActiveSkill: (
          slot: 1 | 2 | 3 | 4,
          skillName: string | undefined,
        ) => {
          set((state) => {
            if (skillName === undefined) {
              state.saveData.skillPage.activeSkills[slot] = undefined;
            } else {
              state.saveData.skillPage.activeSkills[slot] = {
                skillName,
                enabled: true,
                supportSkills: {},
              };
            }
            state.hasUnsavedChanges = true;
          });
        },

        setPassiveSkill: (
          slot: 1 | 2 | 3 | 4,
          skillName: string | undefined,
        ) => {
          set((state) => {
            if (skillName === undefined) {
              state.saveData.skillPage.passiveSkills[slot] = undefined;
            } else {
              state.saveData.skillPage.passiveSkills[slot] = {
                skillName,
                enabled: true,
                supportSkills: {},
              };
            }
            state.hasUnsavedChanges = true;
          });
        },

        setSupportSkill: (
          skillType: "active" | "passive",
          skillSlot: 1 | 2 | 3 | 4,
          supportSlot: 1 | 2 | 3 | 4 | 5,
          supportName: string | undefined,
        ) => {
          set((state) => {
            const skillSlots =
              skillType === "active"
                ? state.saveData.skillPage.activeSkills
                : state.saveData.skillPage.passiveSkills;
            const skill = skillSlots[skillSlot];
            if (skill === undefined) return;
            skill.supportSkills[supportSlot] =
              supportName !== undefined ? { name: supportName } : undefined;
            state.hasUnsavedChanges = true;
          });
        },

        toggleSkillEnabled: (
          skillType: "active" | "passive",
          slot: 1 | 2 | 3 | 4,
        ) => {
          set((state) => {
            const skillSlots =
              skillType === "active"
                ? state.saveData.skillPage.activeSkills
                : state.saveData.skillPage.passiveSkills;
            const skill = skillSlots[slot];
            if (skill === undefined) return;
            skill.enabled = !skill.enabled;
            state.hasUnsavedChanges = true;
          });
        },

        setSkillLevel: (
          skillType: "active" | "passive",
          slot: 1 | 2 | 3 | 4,
          level: number,
        ) => {
          set((state) => {
            const skillSlots =
              skillType === "active"
                ? state.saveData.skillPage.activeSkills
                : state.saveData.skillPage.passiveSkills;
            const skill = skillSlots[slot];
            if (skill === undefined) return;
            skill.level = level;
            state.hasUnsavedChanges = true;
          });
        },

        setSupportSkillLevel: (
          skillType: "active" | "passive",
          skillSlot: 1 | 2 | 3 | 4,
          supportSlot: 1 | 2 | 3 | 4 | 5,
          level: number,
        ) => {
          set((state) => {
            const skillSlots =
              skillType === "active"
                ? state.saveData.skillPage.activeSkills
                : state.saveData.skillPage.passiveSkills;
            const skill = skillSlots[skillSlot];
            if (skill === undefined) return;
            const support = skill.supportSkills[supportSlot];
            if (support === undefined) return;
            support.level = level;
            state.hasUnsavedChanges = true;
          });
        },

        // Divinity actions (additional)
        copySlate: (slateId: string) => {
          const slate = get().saveData.divinityPage.inventory.find(
            (s) => s.id === slateId,
          );
          if (!slate) return;
          const newSlate = { ...slate, id: generateItemId() };
          set((state) => {
            state.saveData.divinityPage.inventory.push(newSlate);
            state.hasUnsavedChanges = true;
          });
        },

        // Hero actions (additional)
        resetHeroPage: (hero?: string) => {
          set((state) => {
            if (!hero) {
              state.saveData.heroPage = {
                ...createEmptyHeroPage(),
                memoryInventory: state.saveData.heroPage.memoryInventory,
              };
            } else {
              const baseTrait = getBaseTraitForHero(hero);
              state.saveData.heroPage = {
                selectedHero: hero,
                traits: {
                  level1: baseTrait?.name,
                  level45: undefined,
                  level60: undefined,
                  level75: undefined,
                },
                memorySlots: {
                  slot45: undefined,
                  slot60: undefined,
                  slot75: undefined,
                },
                memoryInventory: state.saveData.heroPage.memoryInventory,
              };
            }
            state.hasUnsavedChanges = true;
          });
        },

        equipHeroMemoryById: (
          slot: HeroMemorySlot,
          memoryId: string | undefined,
        ) => {
          set((state) => {
            const memory = memoryId
              ? state.saveData.heroPage.memoryInventory.find(
                  (m) => m.id === memoryId,
                )
              : undefined;
            state.saveData.heroPage.memorySlots[slot] = memory;
            state.hasUnsavedChanges = true;
          });
        },

        // Configuration actions
        updateConfiguration: (updates: Partial<ConfigurationPage>) => {
          set((state) => {
            state.saveData.configurationPage = {
              ...(state.saveData.configurationPage ??
                createEmptyConfigurationPage()),
              ...updates,
            };
            state.hasUnsavedChanges = true;
          });
        },

        // Pactspirit actions (additional)
        resetPactspiritSlot: (
          slotIndex: PactspiritSlotIndex,
          pactspiritName: string | undefined,
        ) => {
          set((state) => {
            const slotKey =
              `slot${slotIndex}` as keyof typeof state.saveData.pactspiritPage;
            state.saveData.pactspiritPage[slotKey] = {
              ...createEmptyPactspiritSlot(),
              pactspiritName,
            };
            state.hasUnsavedChanges = true;
          });
        },

        clearRingDestiny: (
          slotIndex: PactspiritSlotIndex,
          ringSlot: RingSlotKey,
        ) => {
          set((state) => {
            const slotKey =
              `slot${slotIndex}` as keyof typeof state.saveData.pactspiritPage;
            state.saveData.pactspiritPage[slotKey].rings[ringSlot] = {};
            state.hasUnsavedChanges = true;
          });
        },

        installDestiny: (
          slotIndex: PactspiritSlotIndex,
          ringSlot: RingSlotKey,
          destiny: InstalledDestinyResult,
        ) => {
          set((state) => {
            const slotKey =
              `slot${slotIndex}` as keyof typeof state.saveData.pactspiritPage;
            state.saveData.pactspiritPage[slotKey].rings[ringSlot] = {
              installedDestiny: destiny,
            };
            state.hasUnsavedChanges = true;
          });
        },

        // Talent actions (additional)
        allocateNode: (
          treeSlot: TreeSlot,
          x: number,
          y: number,
          maxPoints: number,
        ) => {
          set((state) => {
            const tree = state.saveData.talentPage.talentTrees[treeSlot];
            if (!tree) return;
            const existing = tree.allocatedNodes.find(
              (n) => n.x === x && n.y === y,
            );

            if (existing) {
              if (existing.points >= maxPoints) return;
              existing.points += 1;
            } else {
              tree.allocatedNodes.push({ x, y, points: 1 });
            }
            state.hasUnsavedChanges = true;
          });
        },

        deallocateNode: (treeSlot: TreeSlot, x: number, y: number) => {
          set((state) => {
            const tree = state.saveData.talentPage.talentTrees[treeSlot];
            if (!tree) return;
            const existing = tree.allocatedNodes.find(
              (n) => n.x === x && n.y === y,
            );
            if (!existing) return;

            if (existing.points > 1) {
              existing.points -= 1;
            } else {
              tree.allocatedNodes = tree.allocatedNodes.filter(
                (n) => !(n.x === x && n.y === y),
              );
            }
            state.hasUnsavedChanges = true;
          });
        },

        selectCoreTalent: (
          treeSlot: TreeSlot,
          slotIndex: number,
          talentName: string | undefined,
        ) => {
          set((state) => {
            const tree = state.saveData.talentPage.talentTrees[treeSlot];
            if (!tree) return;

            const newSelected = [...(tree.selectedCoreTalents ?? [])];
            if (talentName) {
              newSelected[slotIndex] = talentName;
            } else {
              newSelected.splice(slotIndex, 1);
            }
            tree.selectedCoreTalents = newSelected.filter(Boolean);
            state.hasUnsavedChanges = true;
          });
        },

        updatePrism: (prism: CraftedPrism) => {
          set((state) => {
            state.saveData.talentPage.inventory.prismList =
              state.saveData.talentPage.inventory.prismList.map((p) =>
                p.id === prism.id ? prism : p,
              );
            state.hasUnsavedChanges = true;
          });
        },

        copyPrism: (prismId: string) => {
          const prism = get().saveData.talentPage.inventory.prismList.find(
            (p) => p.id === prismId,
          );
          if (!prism) return;
          const newPrism = { ...prism, id: generateItemId() };
          set((state) => {
            state.saveData.talentPage.inventory.prismList.push(newPrism);
            state.hasUnsavedChanges = true;
          });
        },

        returnPrismToInventory: () => {
          set((state) => {
            const placed = state.saveData.talentPage.talentTrees.placedPrism;
            if (!placed) return;
            state.saveData.talentPage.inventory.prismList.push(placed.prism);
            delete state.saveData.talentPage.talentTrees.placedPrism;
            state.hasUnsavedChanges = true;
          });
        },

        updateInverseImage: (inverseImage: CraftedInverseImage) => {
          set((state) => {
            state.saveData.talentPage.inventory.inverseImageList =
              state.saveData.talentPage.inventory.inverseImageList.map((ii) =>
                ii.id === inverseImage.id ? inverseImage : ii,
              );
            state.hasUnsavedChanges = true;
          });
        },

        copyInverseImage: (inverseImageId: string) => {
          const inverseImage =
            get().saveData.talentPage.inventory.inverseImageList.find(
              (ii) => ii.id === inverseImageId,
            );
          if (!inverseImage) return;
          const newInverseImage = { ...inverseImage, id: generateItemId() };
          set((state) => {
            state.saveData.talentPage.inventory.inverseImageList.push(
              newInverseImage,
            );
            state.hasUnsavedChanges = true;
          });
        },

        setTreeOrClear: (
          treeSlot: TreeSlot,
          treeName: string,
          clearCoreTalents?: boolean,
        ) => {
          set((state) => {
            if (treeName === "") {
              delete state.saveData.talentPage.talentTrees[treeSlot];
            } else {
              state.saveData.talentPage.talentTrees[treeSlot] = {
                name: treeName,
                allocatedNodes: [],
                selectedCoreTalents: clearCoreTalents
                  ? []
                  : (state.saveData.talentPage.talentTrees[treeSlot]
                      ?.selectedCoreTalents ?? []),
              };
            }
            state.hasUnsavedChanges = true;
          });
        },

        resetTree: (treeSlot: TreeSlot) => {
          set((state) => {
            const tree = state.saveData.talentPage.talentTrees[treeSlot];
            if (!tree) return;
            tree.allocatedNodes = [];

            // Also clear reflected nodes if inverse image is placed on this tree
            const placedInverseImage =
              state.saveData.talentPage.talentTrees.placedInverseImage;
            if (placedInverseImage?.treeSlot === treeSlot) {
              placedInverseImage.reflectedAllocatedNodes = [];
            }
            state.hasUnsavedChanges = true;
          });
        },

        // Calculations actions
        setCalculationsSelectedSkill: (skillName: string | undefined) => {
          set((state) => {
            if (!state.saveData.calculationsPage) {
              state.saveData.calculationsPage = {
                selectedSkillName: skillName,
              };
            } else {
              state.saveData.calculationsPage.selectedSkillName = skillName;
            }
            state.hasUnsavedChanges = true;
          });
        },
      })),
      {
        name: "torchlight-builder-storage",
        partialize: (state) => ({
          saveData: state.saveData,
          currentSaveId: state.currentSaveId,
        }),
      },
    ),
  ),
);
