'use client'

import { create } from 'zustand'
import type { PactspiritSlotIndex, RingSlotKey } from '../lib/types'

interface PactspiritUIState {
  // Destiny selection modal state
  isDestinyModalOpen: boolean
  destinyModalSlotIndex: PactspiritSlotIndex | undefined
  destinyModalRingSlot: RingSlotKey | undefined

  // Actions
  openDestinyModal: (
    slotIndex: PactspiritSlotIndex,
    ringSlot: RingSlotKey,
  ) => void
  closeDestinyModal: () => void
}

export const usePactspiritUIStore = create<PactspiritUIState>((set) => ({
  // Initial state
  isDestinyModalOpen: false,
  destinyModalSlotIndex: undefined,
  destinyModalRingSlot: undefined,

  // Actions
  openDestinyModal: (slotIndex, ringSlot) =>
    set({
      isDestinyModalOpen: true,
      destinyModalSlotIndex: slotIndex,
      destinyModalRingSlot: ringSlot,
    }),

  closeDestinyModal: () =>
    set({
      isDestinyModalOpen: false,
      destinyModalSlotIndex: undefined,
      destinyModalRingSlot: undefined,
    }),
}))
