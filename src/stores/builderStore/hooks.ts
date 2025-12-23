"use client";

import { type InternalBuilderState, internalStore } from "./internal";

// Extract actions from store state (actions are stable, won't cause re-renders)
type StoreState = ReturnType<typeof internalStore.getState>;
type StoreActions = Omit<StoreState, keyof InternalBuilderState>;

// Cache actions on first call - they never change
let cachedActions: StoreActions | undefined;

// Hook for actions only - stable reference
export const useBuilderActions = (): StoreActions => {
  if (!cachedActions) {
    const state = internalStore.getState();
    // Filter to only include functions (actions)
    cachedActions = Object.fromEntries(
      Object.entries(state).filter(([_, value]) => typeof value === "function"),
    ) as StoreActions;
  }
  return cachedActions;
};
