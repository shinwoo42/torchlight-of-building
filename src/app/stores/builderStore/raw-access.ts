"use client";

import type { SaveData } from "../../lib/save-data";
import { internalStore } from "./internal";

type RawAccessReason = "debug" | "export";

/**
 * Explicitly-reasoned access to raw SaveData.
 * Use this ONLY for:
 * - "debug": Debug panel display
 * - "export": Build code export/import
 * - "hero-memory-list": Raw memory list for inventory UI (create/copy/delete)
 *
 * For normal UI rendering, use useLoadout() instead.
 */
export const useSaveDataRaw = (_reason: RawAccessReason): SaveData => {
  return internalStore((state) => state.saveData);
};
