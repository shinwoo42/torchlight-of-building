import React from 'react'
import type { PlacedPrism } from '@/src/app/lib/save-data'
import type { TreeSlot } from '@/src/app/lib/types'
import {
  getPrismCoreTalentEffect,
  getPrismReplacedCoreTalent,
} from '@/src/app/lib/prism-utils'

interface PrismCoreTalentEffectProps {
  placedPrism: PlacedPrism | undefined
  activeTreeSlot: TreeSlot
}

const PrismIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="currentColor" opacity="0.3" />
    <path
      d="M12 2L2 12L12 22L22 12L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const PrismCoreTalentEffect: React.FC<PrismCoreTalentEffectProps> = ({
  placedPrism,
  activeTreeSlot,
}) => {
  if (!placedPrism || placedPrism.treeSlot !== activeTreeSlot) {
    return null
  }

  // Check for "Adds" effect (rare prisms)
  const addedEffect = getPrismCoreTalentEffect(placedPrism.prism)

  // Check for "Replaces" effect (legendary prisms)
  const replacedTalent = getPrismReplacedCoreTalent(placedPrism.prism)

  // Display "Adds" effect
  if (addedEffect) {
    return (
      <div className="mb-4 rounded-lg border border-purple-500/50 bg-purple-500/10 p-4">
        <div className="mb-2 flex items-center gap-2">
          <PrismIcon className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-400">
            Prism Core Talent Effect
          </span>
        </div>
        <div className="whitespace-pre-line text-sm text-blue-400">
          {addedEffect}
        </div>
      </div>
    )
  }

  // Display "Replaces" ethereal talent
  if (replacedTalent) {
    return (
      <div className="mb-4 rounded-lg border border-purple-500/50 bg-purple-500/10 p-4">
        <div className="mb-2 flex items-center gap-2">
          <PrismIcon className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-400">
            Prism Ethereal Talent
          </span>
        </div>
        <div className="text-sm font-medium text-amber-400">
          {replacedTalent}
        </div>
      </div>
    )
  }

  return null
}
