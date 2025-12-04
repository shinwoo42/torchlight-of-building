'use client'

import type { HeroMemory, HeroPage } from '@/src/app/lib/save-data'
import { HeroMemoryItem } from './HeroMemoryItem'

interface MemoryInventoryProps {
  heroPage: HeroPage
  heroMemoryList: HeroMemory[]
  onMemoryCopy: (memory: HeroMemory) => void
  onMemoryDelete: (id: string) => void
}

export const MemoryInventory = ({
  heroPage,
  heroMemoryList,
  onMemoryCopy,
  onMemoryDelete,
}: MemoryInventoryProps) => {
  const isMemoryEquipped = (memoryId: string): boolean => {
    return (
      heroPage.memorySlots.slot45?.id === memoryId ||
      heroPage.memorySlots.slot60?.id === memoryId ||
      heroPage.memorySlots.slot75?.id === memoryId
    )
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700">
      <h2 className="text-xl font-semibold mb-4 text-zinc-50">
        Memory Inventory ({heroMemoryList.length} items)
      </h2>
      {heroMemoryList.length === 0 ? (
        <p className="text-zinc-500 italic text-center py-4">
          No memories in inventory. Craft memories above to add them here.
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {heroMemoryList.map((memory) => (
            <HeroMemoryItem
              key={memory.id}
              memory={memory}
              isEquipped={isMemoryEquipped(memory.id)}
              onCopy={onMemoryCopy}
              onDelete={onMemoryDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
