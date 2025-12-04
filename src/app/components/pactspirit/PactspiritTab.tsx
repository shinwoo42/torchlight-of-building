'use client'

import type { PactspiritPage } from '@/src/app/lib/save-data'
import type {
  RingSlotKey,
  PactspiritSlotIndex,
  InstalledDestinyResult,
} from '../../lib/types'
import { PactspiritColumn } from './PactspiritColumn'

interface PactspiritTabProps {
  pactspiritPage: PactspiritPage
  onPactspiritSelect: (
    slotIndex: PactspiritSlotIndex,
    pactspiritName: string | undefined,
  ) => void
  onLevelChange: (slotIndex: PactspiritSlotIndex, level: number) => void
  onInstallDestiny: (
    slotIndex: PactspiritSlotIndex,
    ringSlot: RingSlotKey,
    destiny: InstalledDestinyResult,
  ) => void
  onRevertRing: (slotIndex: PactspiritSlotIndex, ringSlot: RingSlotKey) => void
}

export const PactspiritTab: React.FC<PactspiritTabProps> = ({
  pactspiritPage,
  onPactspiritSelect,
  onLevelChange,
  onInstallDestiny,
  onRevertRing,
}) => {
  const slotIndices: PactspiritSlotIndex[] = [1, 2, 3]

  return (
    <div className="flex gap-4">
      {slotIndices.map((slotIndex) => {
        const slotKey = `slot${slotIndex}` as keyof PactspiritPage
        const slot = pactspiritPage[slotKey]

        return (
          <PactspiritColumn
            key={slotIndex}
            slotIndex={slotIndex}
            slot={slot}
            onPactspiritSelect={(name) => onPactspiritSelect(slotIndex, name)}
            onLevelChange={(level) => onLevelChange(slotIndex, level)}
            onInstallDestiny={(ringSlot, destiny) =>
              onInstallDestiny(slotIndex, ringSlot, destiny)
            }
            onRevertRing={(ringSlot) => onRevertRing(slotIndex, ringSlot)}
          />
        )
      })}
    </div>
  )
}
