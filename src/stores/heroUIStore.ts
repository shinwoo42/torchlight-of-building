"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { DEFAULT_QUALITY } from "../lib/constants";
import type { HeroMemoryType } from "../lib/save-data";

interface MemoryAffixSlotState {
  effectIndex: number | undefined;
  quality: number;
}

interface HeroUIState {
  // Memory craft modal state
  isMemoryCraftModalOpen: boolean;

  // Memory crafting state
  craftingMemoryType: HeroMemoryType | undefined;
  craftingBaseStat: string | undefined;
  fixedAffixSlots: MemoryAffixSlotState[];
  randomAffixSlots: MemoryAffixSlotState[];

  // Actions
  openMemoryCraftModal: () => void;
  closeMemoryCraftModal: () => void;
  setCraftingMemoryType: (type: HeroMemoryType | undefined) => void;
  setCraftingBaseStat: (stat: string | undefined) => void;
  setFixedAffixSlot: (
    index: number,
    update: Partial<MemoryAffixSlotState>,
  ) => void;
  setRandomAffixSlot: (
    index: number,
    update: Partial<MemoryAffixSlotState>,
  ) => void;
  resetMemoryCrafting: () => void;
}

const createEmptyAffixSlots = (count: number): MemoryAffixSlotState[] =>
  Array(count)
    .fill(null)
    .map(() => ({ effectIndex: undefined, quality: DEFAULT_QUALITY }));

export const useHeroUIStore = create<HeroUIState>()(
  immer((set) => ({
    // Initial state
    isMemoryCraftModalOpen: false,
    craftingMemoryType: undefined,
    craftingBaseStat: undefined,
    fixedAffixSlots: createEmptyAffixSlots(2),
    randomAffixSlots: createEmptyAffixSlots(4),

    // Actions
    openMemoryCraftModal: () =>
      set((state) => {
        state.isMemoryCraftModalOpen = true;
      }),

    closeMemoryCraftModal: () =>
      set((state) => {
        state.isMemoryCraftModalOpen = false;
        state.craftingMemoryType = undefined;
        state.craftingBaseStat = undefined;
        state.fixedAffixSlots = createEmptyAffixSlots(2);
        state.randomAffixSlots = createEmptyAffixSlots(4);
      }),

    setCraftingMemoryType: (type) =>
      set((state) => {
        state.craftingMemoryType = type;
        state.craftingBaseStat = undefined;
        state.fixedAffixSlots = createEmptyAffixSlots(2);
        state.randomAffixSlots = createEmptyAffixSlots(4);
      }),

    setCraftingBaseStat: (stat) =>
      set((state) => {
        state.craftingBaseStat = stat;
      }),

    setFixedAffixSlot: (index, update) =>
      set((state) => {
        Object.assign(state.fixedAffixSlots[index], update);
      }),

    setRandomAffixSlot: (index, update) =>
      set((state) => {
        Object.assign(state.randomAffixSlots[index], update);
      }),

    resetMemoryCrafting: () =>
      set((state) => {
        state.craftingMemoryType = undefined;
        state.craftingBaseStat = undefined;
        state.fixedAffixSlots = createEmptyAffixSlots(2);
        state.randomAffixSlots = createEmptyAffixSlots(4);
      }),
  })),
);
