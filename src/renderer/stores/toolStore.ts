import { create } from 'zustand'
import type { ToolType } from '@shared/types'
import { DEFAULTS, COLOR_PRESETS } from '@shared/constants'

interface ToolState {
  // Current tool
  currentTool: ToolType
  setTool: (tool: ToolType) => void

  // Color
  currentColor: string
  setColor: (color: string) => void

  // Stroke size
  strokeSize: number
  setStrokeSize: (size: number) => void

  // Drawing mode
  isDrawingMode: boolean
  setDrawingMode: (isDrawing: boolean) => void
  toggleDrawingMode: () => void

  // Spotlight
  isSpotlightMode: boolean
  spotlightSize: number
  toggleSpotlight: () => void
  setSpotlightSize: (size: number) => void
}

export const useToolStore = create<ToolState>((set) => ({
  // Tool
  currentTool: DEFAULTS.tool as ToolType,
  setTool: (tool) => set({ currentTool: tool }),

  // Color
  currentColor: DEFAULTS.color,
  setColor: (color) => set({ currentColor: color }),

  // Stroke size
  strokeSize: DEFAULTS.strokeSize,
  setStrokeSize: (size) => set({ strokeSize: size }),

  // Drawing mode
  isDrawingMode: true,
  setDrawingMode: (isDrawing) => set({ isDrawingMode: isDrawing }),
  toggleDrawingMode: () => set((state) => ({ isDrawingMode: !state.isDrawingMode })),

  // Spotlight
  isSpotlightMode: false,
  spotlightSize: DEFAULTS.spotlightSize,
  toggleSpotlight: () => set((state) => ({ isSpotlightMode: !state.isSpotlightMode })),
  setSpotlightSize: (size) => set({ spotlightSize: size }),
}))
