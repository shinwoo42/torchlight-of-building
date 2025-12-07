"use client";

import { useMemo, useRef, useState } from "react";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/src/app/components/ui/SearchableSelect";
import { Tooltip, TooltipTitle } from "@/src/app/components/ui/Tooltip";
import { type Gear, getAllAffixes } from "@/src/tli/core";
import type { GearSlot } from "../../lib/types";

const GearTooltipContent: React.FC<{ item: Gear }> = ({ item }) => {
  const isLegendary = item.rarity === "legendary";
  const affixes = getAllAffixes(item);

  return (
    <>
      <TooltipTitle>{item.legendaryName ?? item.equipmentType}</TooltipTitle>
      {isLegendary && (
        <div className="text-xs text-zinc-500 mb-2">{item.equipmentType}</div>
      )}
      {item.baseStats && (
        <div className="text-xs text-amber-300 mb-2">
          <div>{item.baseStats.text}</div>
        </div>
      )}
      {affixes.length > 0 ? (
        <ul className="space-y-1">
          {affixes.map((affix, affixIdx) =>
            affix.affixLines.map((line, lineIdx) => (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: affixes can have duplicate text, index is stable
                key={`${affixIdx}-${lineIdx}`}
                className="text-xs text-zinc-400"
              >
                {line.text}
              </li>
            )),
          )}
        </ul>
      ) : (
        <p className="text-xs text-zinc-500 italic">No affixes</p>
      )}
    </>
  );
};

interface OptionWithTooltipProps {
  item: Gear;
  selected: boolean;
}

const OptionWithTooltip: React.FC<OptionWithTooltipProps> = ({
  item,
  selected,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [rect, setRect] = useState<DOMRect | undefined>(undefined);
  const ref = useRef<HTMLDivElement>(null);

  const isLegendary = item.rarity === "legendary";
  const affixes = getAllAffixes(item);

  return (
    <div
      ref={ref}
      onMouseEnter={() => {
        setIsHovered(true);
        if (ref.current) {
          setRect(ref.current.getBoundingClientRect());
        }
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={selected ? "text-amber-400" : ""}>
        {item.legendaryName ?? item.equipmentType}
      </span>
      {isLegendary && (
        <span className="text-amber-400 ml-2 text-xs">Legendary</span>
      )}
      <span className="text-zinc-500 ml-2 text-xs">
        ({affixes.length} affixes)
      </span>

      <Tooltip
        isVisible={isHovered}
        triggerRect={rect}
        variant={isLegendary ? "legendary" : "default"}
      >
        <GearTooltipContent item={item} />
      </Tooltip>
    </div>
  );
};

interface EquipmentSlotDropdownProps {
  slot: GearSlot;
  label: string;
  selectedItemId: string | null;
  compatibleItems: Gear[];
  onSelectItem: (slot: GearSlot, itemId: string | null) => void;
}

export const EquipmentSlotDropdown: React.FC<EquipmentSlotDropdownProps> = ({
  slot,
  label,
  selectedItemId,
  compatibleItems,
  onSelectItem,
}) => {
  const itemsById = useMemo(() => {
    const map = new Map<string, Gear>();
    for (const item of compatibleItems) {
      if (item.id) {
        map.set(item.id, item);
      }
    }
    return map;
  }, [compatibleItems]);

  const renderOption = (
    option: SearchableSelectOption<string>,
    { selected }: { active: boolean; selected: boolean },
  ) => {
    const item = itemsById.get(option.value);
    if (!item) return null;
    return <OptionWithTooltip item={item} selected={selected} />;
  };

  const renderSelectedTooltip = (
    option: SearchableSelectOption<string>,
    triggerRect: DOMRect,
  ) => {
    const item = itemsById.get(option.value);
    if (!item) return null;
    const isLegendary = item.rarity === "legendary";
    return (
      <Tooltip
        isVisible={true}
        triggerRect={triggerRect}
        variant={isLegendary ? "legendary" : "default"}
      >
        <GearTooltipContent item={item} />
      </Tooltip>
    );
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <label className="w-24 font-medium text-zinc-400 text-sm">{label}:</label>
      <SearchableSelect
        value={selectedItemId ?? undefined}
        onChange={(value) => onSelectItem(slot, value ?? null)}
        options={compatibleItems.map((item) => ({
          value: item.id!,
          label: item.legendaryName ?? item.equipmentType,
          sublabel: `${getAllAffixes(item).length} affixes`,
        }))}
        placeholder="-- None --"
        className="flex-1"
        renderOption={renderOption}
        renderSelectedTooltip={renderSelectedTooltip}
      />
    </div>
  );
};
