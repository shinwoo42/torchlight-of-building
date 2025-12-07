"use client";

import { Tooltip, TooltipTitle } from "@/src/app/components/ui/Tooltip";
import { useTooltip } from "@/src/app/hooks/useTooltip";
import { getAffixText, type HeroMemory } from "@/src/tli/core";

interface HeroMemoryItemProps {
  memory: HeroMemory;
  isEquipped: boolean;
  onCopy: (memoryId: string) => void;
  onDelete: (id: string) => void;
}

export const HeroMemoryItem: React.FC<HeroMemoryItemProps> = ({
  memory,
  isEquipped,
  onCopy,
  onDelete,
}) => {
  const { isVisible, triggerRef, triggerRect, tooltipHandlers } = useTooltip();

  return (
    <div
      className="group relative flex items-center justify-between p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
      ref={triggerRef}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-zinc-50 text-sm">
          {memory.memoryType}
        </span>
        <span className="text-xs text-zinc-500">
          ({memory.affixes.length} affixes)
        </span>
        {isEquipped && (
          <span className="text-xs text-green-500 font-medium">Equipped</span>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onCopy(memory.id)}
          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded text-xs"
          title="Copy memory"
        >
          Copy
        </button>
        <button
          type="button"
          onClick={() => onDelete(memory.id)}
          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
          title="Delete memory"
        >
          Delete
        </button>
      </div>

      <Tooltip
        isVisible={isVisible}
        triggerRect={triggerRect}
        {...tooltipHandlers}
      >
        <TooltipTitle>{memory.memoryType}</TooltipTitle>
        {memory.affixes.length > 0 ? (
          <ul className="space-y-1">
            {memory.affixes.map((affix, idx) => (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: affixes can have duplicate text, index is stable
                key={idx}
                className="text-xs text-zinc-400 whitespace-pre-wrap"
              >
                {getAffixText(affix)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-500 italic">No affixes</p>
        )}
      </Tooltip>
    </div>
  );
};
