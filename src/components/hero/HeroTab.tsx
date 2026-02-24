import type {
  HeroMemorySlot,
  HeroMemory as SaveDataHeroMemory,
} from "@/src/lib/save-data";
import type { HeroMemory, HeroPage } from "@/src/tli/core";
import { EditMemoryModal } from "./EditMemoryModal";
import { HeroSelector } from "./HeroSelector";
import { MemoryInventory } from "./MemoryInventory";
import { TraitSelector } from "./TraitSelector";

interface HeroTabProps {
  heroPage: HeroPage;
  heroMemoryList: HeroMemory[];
  onHeroChange: (hero: string | undefined) => void;
  onTraitSelect: (
    level: 45 | 60 | 75,
    group: "a" | "b",
    traitName: string | undefined,
  ) => void;
  onMemoryEquip: (slot: HeroMemorySlot, memoryId: string | undefined) => void;
  onMemorySave: (memory: SaveDataHeroMemory) => void;
  onMemoryCopy: (memoryId: string) => void;
  onMemoryDelete: (id: string) => void;
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

      {/* Right Column: Memory Inventory */}
      <div className="space-y-6">
        <MemoryInventory
          heroPage={heroPage}
          heroMemoryList={heroMemoryList}
          onMemoryCopy={onMemoryCopy}
          onMemoryDelete={onMemoryDelete}
        />
      </div>

      <EditMemoryModal onMemorySave={onMemorySave} />
    </div>
  );
};
