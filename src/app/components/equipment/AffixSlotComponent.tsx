import { BaseGearAffix } from "@/src/tli/gear_data_types";
import { craft } from "@/src/tli/crafting/craft";
import { AffixSlotState } from "../../lib/types";
import { formatAffixOption } from "../../lib/affix-utils";
import { SearchableSelect } from "@/src/app/components/ui/SearchableSelect";

interface AffixSlotProps {
  slotIndex: number;
  affixType: "Prefix" | "Suffix";
  affixes: BaseGearAffix[];
  selection: AffixSlotState;
  onAffixSelect: (slotIndex: number, value: string) => void;
  onSliderChange: (slotIndex: number, value: string) => void;
  onClear: (slotIndex: number) => void;
}

export const AffixSlotComponent: React.FC<AffixSlotProps> = ({
  slotIndex,
  affixType,
  affixes,
  selection,
  onAffixSelect,
  onSliderChange,
  onClear,
}) => {
  const selectedAffix =
    selection.affixIndex !== null ? affixes[selection.affixIndex] : null;
  const craftedText = selectedAffix
    ? craft(selectedAffix, selection.percentage)
    : "";

  return (
    <div className="bg-zinc-800 p-4 rounded-lg">
      {/* Affix Dropdown */}
      <SearchableSelect
        value={selection.affixIndex ?? undefined}
        onChange={(value) => onAffixSelect(slotIndex, value?.toString() ?? "")}
        options={affixes.map((affix, idx) => ({
          value: idx,
          label: formatAffixOption(affix),
        }))}
        placeholder={`<Select ${affixType}>`}
        className="mb-3"
      />

      {/* Slider and Preview (only show if affix selected) */}
      {selectedAffix && (
        <>
          {/* Quality Slider */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-zinc-500">Quality</label>
              <span className="text-xs font-medium text-zinc-50">
                {selection.percentage}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={selection.percentage}
              onChange={(e) => onSliderChange(slotIndex, e.target.value)}
              className="w-full"
            />
          </div>

          {/* Crafted Preview */}
          <div className="bg-zinc-900 p-3 rounded border border-zinc-700">
            <div className="text-sm font-medium text-amber-400 mb-1">
              {craftedText}
            </div>
            <div className="text-xs text-zinc-500">
              Tier {selectedAffix.tier}
              {selectedAffix.craftingPool && ` | ${selectedAffix.craftingPool}`}
            </div>
          </div>

          {/* Clear Button */}
          <button
            onClick={() => onClear(slotIndex)}
            className="mt-2 text-xs text-red-500 hover:text-red-400 font-medium"
          >
            Clear
          </button>
        </>
      )}
    </div>
  );
};
