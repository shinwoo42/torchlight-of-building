'use client'

import { DivinitySlate } from '@/src/app/lib/save-data'
import { SlateInventoryItem } from './SlateInventoryItem'

interface SlateInventoryProps {
  slates: DivinitySlate[]
  placedSlateIds: string[]
  onPlace: (slateId: string) => void
  onEdit: (slate: DivinitySlate) => void
  onCopy: (slate: DivinitySlate) => void
  onDelete: (slateId: string) => void
}

export const SlateInventory: React.FC<SlateInventoryProps> = ({
  slates,
  placedSlateIds,
  onPlace,
  onEdit,
  onCopy,
  onDelete,
}) => {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
      <h3 className="mb-4 text-lg font-medium text-zinc-200">
        Slate Inventory ({slates.length})
      </h3>

      {slates.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No slates crafted yet. Create one above!
        </p>
      ) : (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {slates.map((slate) => (
            <SlateInventoryItem
              key={slate.id}
              slate={slate}
              isPlaced={placedSlateIds.includes(slate.id)}
              onPlace={() => onPlace(slate.id)}
              onEdit={() => onEdit(slate)}
              onCopy={() => onCopy(slate)}
              onDelete={() => onDelete(slate.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
