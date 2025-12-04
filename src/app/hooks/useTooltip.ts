'use client'

import { useState, useCallback } from 'react'

interface MousePosition {
  x: number
  y: number
}

interface UseTooltipReturn {
  isHovered: boolean
  mousePos: MousePosition
  handlers: {
    onMouseEnter: () => void
    onMouseLeave: () => void
    onMouseMove: (e: React.MouseEvent) => void
  }
}

export const useTooltip = (): UseTooltipReturn => {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 })

  const onMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const onMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }, [])

  return {
    isHovered,
    mousePos,
    handlers: {
      onMouseEnter,
      onMouseLeave,
      onMouseMove,
    },
  }
}
