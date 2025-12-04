'use client'

import { create } from 'zustand'

type SkillSlotType = 'active' | 'passive'
type SkillSlotNumber = 1 | 2 | 3 | 4

interface SkillsUIState {
  // Expanded skill slots (for showing support skills)
  expandedSlots: Set<string>

  // Actions
  toggleSlotExpanded: (type: SkillSlotType, slot: SkillSlotNumber) => void
  setSlotExpanded: (
    type: SkillSlotType,
    slot: SkillSlotNumber,
    expanded: boolean,
  ) => void
  isSlotExpanded: (type: SkillSlotType, slot: SkillSlotNumber) => boolean
  collapseAllSlots: () => void
}

const getSlotKey = (type: SkillSlotType, slot: SkillSlotNumber): string =>
  `${type}-${slot}`

export const useSkillsUIStore = create<SkillsUIState>((set, get) => ({
  // Initial state
  expandedSlots: new Set<string>(),

  // Actions
  toggleSlotExpanded: (type, slot) =>
    set((state) => {
      const key = getSlotKey(type, slot)
      const newSet = new Set(state.expandedSlots)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return { expandedSlots: newSet }
    }),

  setSlotExpanded: (type, slot, expanded) =>
    set((state) => {
      const key = getSlotKey(type, slot)
      const newSet = new Set(state.expandedSlots)
      if (expanded) {
        newSet.add(key)
      } else {
        newSet.delete(key)
      }
      return { expandedSlots: newSet }
    }),

  isSlotExpanded: (type, slot) => {
    const key = getSlotKey(type, slot)
    return get().expandedSlots.has(key)
  },

  collapseAllSlots: () => set({ expandedSlots: new Set() }),
}))
