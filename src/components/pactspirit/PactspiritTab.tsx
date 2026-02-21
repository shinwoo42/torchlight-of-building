import type { PactspiritPage } from "@/src/tli/core";
import type {
  InstalledDestinyResult,
  PactspiritSlotIndex,
  RingSlotKey,
} from "../../lib/types";
import { PactspiritColumn } from "./PactspiritColumn";

interface PactspiritTabProps {
  pactspiritPage: PactspiritPage;
  onPactspiritSelect: (
    slotIndex: PactspiritSlotIndex,
    pactspiritName: string | undefined,
  ) => void;
  onLevelChange: (slotIndex: PactspiritSlotIndex, level: number) => void;
  onInstallDestiny: (
    slotIndex: PactspiritSlotIndex,
    ringSlot: RingSlotKey,
    destiny: InstalledDestinyResult,
  ) => void;
  onRevertRing: (slotIndex: PactspiritSlotIndex, ringSlot: RingSlotKey) => void;
  onInstallUndeterminedFate: (
    slotIndex: PactspiritSlotIndex,
    numMicro: number,
    numMedium: number,
  ) => void;
  onRemoveUndeterminedFate: (slotIndex: PactspiritSlotIndex) => void;
  onInstallFateDestiny: (
    slotIndex: PactspiritSlotIndex,
    slotType: "micro" | "medium",
    slotIdx: number,
    destiny: InstalledDestinyResult,
  ) => void;
  onClearFateDestiny: (
    slotIndex: PactspiritSlotIndex,
    slotType: "micro" | "medium",
    slotIdx: number,
  ) => void;
}

export const PactspiritTab: React.FC<PactspiritTabProps> = ({
  pactspiritPage,
  onPactspiritSelect,
  onLevelChange,
  onInstallDestiny,
  onRevertRing,
  onInstallUndeterminedFate,
  onRemoveUndeterminedFate,
  onInstallFateDestiny,
  onClearFateDestiny,
}) => {
  const slotIndices: PactspiritSlotIndex[] = [1, 2, 3];

  return (
    <div className="flex gap-4">
      {slotIndices.map((slotIndex) => {
        const slotKey = `slot${slotIndex}` as keyof PactspiritPage;
        const slot = pactspiritPage[slotKey];

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
            onInstallUndeterminedFate={(numMicro, numMedium) =>
              onInstallUndeterminedFate(slotIndex, numMicro, numMedium)
            }
            onRemoveUndeterminedFate={() => onRemoveUndeterminedFate(slotIndex)}
            onInstallFateDestiny={(slotType, slotIdx, destiny) =>
              onInstallFateDestiny(slotIndex, slotType, slotIdx, destiny)
            }
            onClearFateDestiny={(slotType, slotIdx) =>
              onClearFateDestiny(slotIndex, slotType, slotIdx)
            }
          />
        );
      })}
    </div>
  );
};
