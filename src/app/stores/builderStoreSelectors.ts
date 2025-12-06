import { useRef, useMemo } from "react";
import type { Loadout, TalentTree } from "@/src/tli/core";
import { loadSave } from "@/src/tli/storage/load-save";
import { useBuilderStore } from "./builderStore";
import type { TreeSlot } from "../lib/types";

export const useLoadout = (): Loadout => {
  const saveData = useBuilderStore((state) => state.loadout);

  const saveDataJsonRef = useRef<string>("");
  const loadoutRef = useRef<Loadout | undefined>(undefined);

  return useMemo(() => {
    const saveDataJson = JSON.stringify(saveData);

    if (saveDataJson !== saveDataJsonRef.current || !loadoutRef.current) {
      saveDataJsonRef.current = saveDataJson;
      loadoutRef.current = loadSave(saveData);
    }

    return loadoutRef.current;
  }, [saveData]);
};

export const useTalentTree = (slot: TreeSlot): TalentTree | undefined => {
  const loadout = useLoadout();
  return loadout.talentPage.talentTrees[slot];
};
