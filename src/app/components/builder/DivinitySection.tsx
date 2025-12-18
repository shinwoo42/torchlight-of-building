"use client";

import { useCallback } from "react";
import {
  type DivinitySlate,
  getAffixText,
  type PlacedSlate,
} from "@/src/tli/core";
import type { DivinitySlate as SaveDataDivinitySlate } from "../../lib/save-data";
import { generateItemId } from "../../lib/storage";
import { useBuilderActions, useLoadout } from "../../stores/builderStore";
import { DivinityTab } from "../divinity/DivinityTab";

const toSaveDataSlate = (slate: DivinitySlate): SaveDataDivinitySlate => ({
  ...slate,
  affixes: slate.affixes.map(getAffixText),
});

export const DivinitySection = () => {
  const loadout = useLoadout();
  const { updateSaveData } = useBuilderActions();

  const handleSaveSlate = useCallback(
    (slate: DivinitySlate) => {
      const saveDataSlate = toSaveDataSlate(slate);
      updateSaveData((prev) => ({
        ...prev,
        divinitySlateList: [...prev.divinitySlateList, saveDataSlate],
      }));
    },
    [updateSaveData],
  );

  const handleCopySlate = useCallback(
    (slate: DivinitySlate) => {
      const saveDataSlate = toSaveDataSlate(slate);
      const newSlate = { ...saveDataSlate, id: generateItemId() };
      updateSaveData((prev) => ({
        ...prev,
        divinitySlateList: [...prev.divinitySlateList, newSlate],
      }));
    },
    [updateSaveData],
  );

  const handleDeleteSlate = useCallback(
    (slateId: string) => {
      updateSaveData((prev) => ({
        ...prev,
        divinitySlateList: prev.divinitySlateList.filter(
          (s) => s.id !== slateId,
        ),
        divinityPage: {
          ...prev.divinityPage,
          placedSlates: prev.divinityPage.placedSlates.filter(
            (p) => p.slateId !== slateId,
          ),
        },
      }));
    },
    [updateSaveData],
  );

  const handlePlaceSlate = useCallback(
    (placement: PlacedSlate) => {
      updateSaveData((prev) => ({
        ...prev,
        divinityPage: {
          ...prev.divinityPage,
          placedSlates: [...prev.divinityPage.placedSlates, placement],
        },
      }));
    },
    [updateSaveData],
  );

  const handleMoveSlate = useCallback(
    (slateId: string, position: { row: number; col: number }) => {
      updateSaveData((prev) => ({
        ...prev,
        divinityPage: {
          ...prev.divinityPage,
          placedSlates: prev.divinityPage.placedSlates.map((p) =>
            p.slateId === slateId ? { ...p, position } : p,
          ),
        },
      }));
    },
    [updateSaveData],
  );

  return (
    <DivinityTab
      divinityPage={loadout.divinityPage}
      onSaveSlate={handleSaveSlate}
      onCopySlate={handleCopySlate}
      onDeleteSlate={handleDeleteSlate}
      onPlaceSlate={handlePlaceSlate}
      onMoveSlate={handleMoveSlate}
    />
  );
};
