import { useMemo } from "react";
import { SearchableSelect } from "@/src/components/ui/SearchableSelect";
import type { HeroMemory, HeroMemoryType } from "@/src/lib/save-data";
import { HERO_MEMORY_TYPES } from "@/src/lib/save-data";
import { useHeroUIStore } from "@/src/stores/heroUIStore";
import { DEFAULT_QUALITY } from "../../lib/constants";
import {
  craftHeroMemoryAffix,
  getBaseStatsForMemoryType,
  getFixedAffixesForMemoryType,
  getRandomAffixesForMemoryType,
} from "../../lib/hero-utils";
import { generateItemId } from "../../lib/storage";
import { Modal, ModalActions, ModalButton } from "../ui/Modal";

interface EditMemoryModalProps {
  onMemorySave: (memory: HeroMemory) => void;
}

interface AffixSlotProps {
  slotIndex: number;
  type: "fixed" | "random";
  affixes: string[];
  effectIndex: number | undefined;
  quality: number;
  onSelect: (effectIndex: number | undefined) => void;
  onQuality: (quality: number) => void;
}

const AffixSlot = ({
  slotIndex,
  type,
  affixes,
  effectIndex,
  quality,
  onSelect,
  onQuality,
}: AffixSlotProps) => {
  const hasSelection = effectIndex !== undefined;

  return (
    <div className="bg-zinc-800 p-3 rounded-lg">
      <SearchableSelect
        value={effectIndex}
        onChange={onSelect}
        options={affixes.map((affix, idx) => {
          const normalized = affix.replace(/\n/g, " ");
          const truncated = normalized.length > 50;
          return {
            value: idx,
            label: truncated ? `${normalized.substring(0, 50)}...` : normalized,
          };
        })}
        placeholder={`Select ${type === "fixed" ? "Fixed" : "Random"} Affix ${slotIndex + 1}`}
        size="sm"
        className="mb-2"
      />

      {hasSelection && (
        <>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-zinc-500">Quality</label>
            <span className="text-xs font-medium text-zinc-50">{quality}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={quality}
            onChange={(e) => onQuality(parseInt(e.target.value, 10))}
            className="w-full mb-2"
          />
        </>
      )}
    </div>
  );
};

interface PreviewLine {
  text: string;
  label: string;
}

const MemoryPreview = ({
  memoryType,
  baseStat,
  previewLines,
}: {
  memoryType: string | undefined;
  baseStat: string | undefined;
  previewLines: PreviewLine[];
}): React.ReactElement => {
  const hasContent =
    memoryType !== undefined ||
    baseStat !== undefined ||
    previewLines.length > 0;

  if (!hasContent) {
    return (
      <p className="text-xs italic text-zinc-500">
        Select a memory type to preview
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {memoryType !== undefined && (
        <div className="text-sm font-semibold text-amber-400">{memoryType}</div>
      )}

      {baseStat !== undefined && (
        <div className="pt-1 border-t border-zinc-700">
          <div className="text-xs text-zinc-500 mb-0.5">Base Stat</div>
          <div className="text-xs text-zinc-300 whitespace-pre-wrap">
            {baseStat}
          </div>
        </div>
      )}

      {previewLines.length > 0 && (
        <div className="space-y-1.5">
          {previewLines.map((line, idx) => (
            <div
              key={idx}
              className={
                idx > 0 || baseStat !== undefined
                  ? "pt-1.5 border-t border-zinc-700"
                  : ""
              }
            >
              <div className="text-xs text-zinc-500 mb-0.5">{line.label}</div>
              <div className="text-xs text-zinc-300 whitespace-pre-wrap">
                {line.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const EditMemoryModal = ({
  onMemorySave,
}: EditMemoryModalProps): React.ReactElement => {
  const isOpen = useHeroUIStore((s) => s.isMemoryCraftModalOpen);
  const closeModal = useHeroUIStore((s) => s.closeMemoryCraftModal);
  const craftingMemoryType = useHeroUIStore((s) => s.craftingMemoryType);
  const craftingBaseStat = useHeroUIStore((s) => s.craftingBaseStat);
  const fixedAffixSlots = useHeroUIStore((s) => s.fixedAffixSlots);
  const randomAffixSlots = useHeroUIStore((s) => s.randomAffixSlots);
  const setCraftingMemoryType = useHeroUIStore((s) => s.setCraftingMemoryType);
  const setCraftingBaseStat = useHeroUIStore((s) => s.setCraftingBaseStat);
  const setFixedAffixSlot = useHeroUIStore((s) => s.setFixedAffixSlot);
  const setRandomAffixSlot = useHeroUIStore((s) => s.setRandomAffixSlot);

  const baseStats = useMemo(
    () =>
      craftingMemoryType ? getBaseStatsForMemoryType(craftingMemoryType) : [],
    [craftingMemoryType],
  );

  const fixedAffixes = useMemo(
    () =>
      craftingMemoryType
        ? getFixedAffixesForMemoryType(craftingMemoryType)
        : [],
    [craftingMemoryType],
  );

  const randomAffixes = useMemo(
    () =>
      craftingMemoryType
        ? getRandomAffixesForMemoryType(craftingMemoryType)
        : [],
    [craftingMemoryType],
  );

  // Build preview lines from current crafting state
  const previewLines = useMemo((): PreviewLine[] => {
    const lines: PreviewLine[] = [];

    for (const [idx, slot] of fixedAffixSlots.entries()) {
      if (slot.effectIndex !== undefined) {
        lines.push({
          label: `Fixed Affix ${idx + 1}`,
          text: craftHeroMemoryAffix(
            fixedAffixes[slot.effectIndex],
            slot.quality,
          ),
        });
      }
    }

    for (const [idx, slot] of randomAffixSlots.slice(0, 2).entries()) {
      if (slot.effectIndex !== undefined) {
        lines.push({
          label: `Random Affix ${idx + 1}`,
          text: craftHeroMemoryAffix(
            randomAffixes[slot.effectIndex],
            slot.quality,
          ),
        });
      }
    }

    return lines;
  }, [fixedAffixSlots, randomAffixSlots, fixedAffixes, randomAffixes]);

  const handleSaveMemory = (): void => {
    if (craftingMemoryType === undefined || craftingBaseStat === undefined)
      return;

    const fixedAffixesData: string[] = fixedAffixSlots
      .filter((slot) => slot.effectIndex !== undefined)
      .map((slot) =>
        // biome-ignore lint/style/noNonNullAssertion: filtered for defined effectIndex above
        craftHeroMemoryAffix(fixedAffixes[slot.effectIndex!], slot.quality),
      );

    const randomAffixesData: string[] = randomAffixSlots
      .filter((slot) => slot.effectIndex !== undefined)
      .map((slot) =>
        // biome-ignore lint/style/noNonNullAssertion: filtered for defined effectIndex above
        craftHeroMemoryAffix(randomAffixes[slot.effectIndex!], slot.quality),
      );

    const newMemory: HeroMemory = {
      id: generateItemId(),
      memoryType: craftingMemoryType,
      baseStat: craftingBaseStat,
      fixedAffixes: fixedAffixesData,
      randomAffixes: randomAffixesData,
    };

    onMemorySave(newMemory);
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Craft Hero Memory"
      maxWidth="3xl"
      dismissible={false}
    >
      <div className="flex h-[70vh] gap-4">
        {/* Left panel: Crafting controls */}
        <div className="min-w-0 flex-1 space-y-3 overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-50">
              Memory Type
            </label>
            <SearchableSelect
              value={craftingMemoryType}
              onChange={(value) =>
                setCraftingMemoryType(value as HeroMemoryType | undefined)
              }
              options={HERO_MEMORY_TYPES.map((type) => ({
                value: type,
                label: type,
              }))}
              placeholder="Select memory type..."
              size="lg"
            />
          </div>

          {craftingMemoryType !== undefined && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-50">
                  Base Stat
                </label>
                <SearchableSelect
                  value={craftingBaseStat}
                  onChange={setCraftingBaseStat}
                  options={baseStats.map((stat) => ({
                    value: stat,
                    label: stat,
                  }))}
                  placeholder="Select base stat..."
                  size="lg"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 text-zinc-50">
                  Fixed Affixes (2 max)
                </h3>
                <div className="space-y-3">
                  {fixedAffixSlots.map((slot, idx) => (
                    <AffixSlot
                      key={`fixed-${idx}`}
                      slotIndex={idx}
                      type="fixed"
                      affixes={fixedAffixes}
                      effectIndex={slot.effectIndex}
                      quality={slot.quality}
                      onSelect={(effectIndex) =>
                        setFixedAffixSlot(idx, {
                          effectIndex,
                          quality:
                            effectIndex === undefined
                              ? DEFAULT_QUALITY
                              : slot.quality,
                        })
                      }
                      onQuality={(quality) =>
                        setFixedAffixSlot(idx, { quality })
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 text-zinc-50">
                  Random Affixes (2 max)
                </h3>
                <div className="space-y-3">
                  {randomAffixSlots.slice(0, 2).map((slot, idx) => (
                    <AffixSlot
                      key={`random-${idx}`}
                      slotIndex={idx}
                      type="random"
                      affixes={randomAffixes}
                      effectIndex={slot.effectIndex}
                      quality={slot.quality}
                      onSelect={(effectIndex) =>
                        setRandomAffixSlot(idx, {
                          effectIndex,
                          quality:
                            effectIndex === undefined
                              ? DEFAULT_QUALITY
                              : slot.quality,
                        })
                      }
                      onQuality={(quality) =>
                        setRandomAffixSlot(idx, { quality })
                      }
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right panel: Memory preview */}
        <div className="w-64 shrink-0 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-800 p-3">
          <MemoryPreview
            memoryType={craftingMemoryType}
            baseStat={craftingBaseStat}
            previewLines={previewLines}
          />
        </div>
      </div>

      <ModalActions>
        <ModalButton variant="secondary" onClick={closeModal} fullWidth>
          Cancel
        </ModalButton>
        <ModalButton
          onClick={handleSaveMemory}
          fullWidth
          disabled={
            craftingMemoryType === undefined || craftingBaseStat === undefined
          }
        >
          Save to Inventory
        </ModalButton>
      </ModalActions>
    </Modal>
  );
};
