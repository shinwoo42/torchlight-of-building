'use client'

import type {
  HeroPage,
  HeroMemory,
  HeroMemorySlot,
} from '@/src/app/lib/save-data'
import { HeroSelector } from './HeroSelector'
import { TraitSelector } from './TraitSelector'
import { MemoryCrafter } from './MemoryCrafter'
import { MemoryInventory } from './MemoryInventory'

interface HeroTabProps {
  heroPage: HeroPage
  heroMemoryList: HeroMemory[]
  onHeroChange: (hero: string | undefined) => void
  onTraitSelect: (level: 45 | 60 | 75, traitName: string | undefined) => void
  onMemoryEquip: (slot: HeroMemorySlot, memoryId: string | undefined) => void
  onMemorySave: (memory: HeroMemory) => void
  onMemoryCopy: (memory: HeroMemory) => void
  onMemoryDelete: (id: string) => void
}

export const HeroTab = ({
  heroPage,
  heroMemoryList,
  onHeroChange,
  onTraitSelect,
  onMemoryEquip,
  onMemorySave,
  onMemoryCopy,
  onMemoryDelete,
}: HeroTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Hero Selection & Traits */}
      <div className="space-y-6">
        <HeroSelector
          selectedHero={heroPage.selectedHero}
          onHeroChange={onHeroChange}
        />
        <TraitSelector
          heroPage={heroPage}
          heroMemoryList={heroMemoryList}
          onTraitSelect={onTraitSelect}
          onMemoryEquip={onMemoryEquip}
        />
      </div>

      {/* Right Column: Memory Crafting & Inventory */}
      <div className="space-y-6">
        <MemoryCrafter onMemorySave={onMemorySave} />
        <MemoryInventory
          heroPage={heroPage}
          heroMemoryList={heroMemoryList}
          onMemoryCopy={onMemoryCopy}
          onMemoryDelete={onMemoryDelete}
        />
      </div>
    </div>
  )
}
