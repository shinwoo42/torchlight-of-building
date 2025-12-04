'use client'

import { useState, useCallback } from 'react'

interface UseAffixSelectionReturn<T> {
  selectedAffixes: T[]
  addAffix: (affix: T) => boolean
  removeAffix: (index: number) => void
  clearAffixes: () => void
  isFull: boolean
  canAdd: boolean
}

export const useAffixSelection = <T>(
  maxAffixes: number,
  isDuplicate?: (existing: T[], newAffix: T) => boolean,
): UseAffixSelectionReturn<T> => {
  const [selectedAffixes, setSelectedAffixes] = useState<T[]>([])

  const isFull = selectedAffixes.length >= maxAffixes
  const canAdd = !isFull

  const addAffix = useCallback(
    (affix: T): boolean => {
      if (selectedAffixes.length >= maxAffixes) return false

      if (isDuplicate && isDuplicate(selectedAffixes, affix)) {
        return false
      }

      setSelectedAffixes((prev) => [...prev, affix])
      return true
    },
    [selectedAffixes, maxAffixes, isDuplicate],
  )

  const removeAffix = useCallback((index: number) => {
    setSelectedAffixes((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearAffixes = useCallback(() => {
    setSelectedAffixes([])
  }, [])

  return {
    selectedAffixes,
    addAffix,
    removeAffix,
    clearAffixes,
    isFull,
    canAdd,
  }
}
