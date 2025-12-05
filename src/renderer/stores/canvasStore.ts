import { create } from 'zustand'
import type { Drawing } from '@shared/types'

interface CanvasState {
  // Drawing history
  history: Drawing[]
  redoStack: Drawing[]

  // Actions
  addDrawing: (drawing: Drawing) => void
  undo: () => void
  redo: () => void
  clear: () => void

  // Current drawing (while drawing)
  currentDrawing: Drawing | null
  setCurrentDrawing: (drawing: Drawing | null) => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  history: [],
  redoStack: [],
  currentDrawing: null,

  addDrawing: (drawing) =>
    set((state) => ({
      history: [...state.history, drawing],
      redoStack: [],
      currentDrawing: null,
    })),

  undo: () => {
    const { history, redoStack } = get()
    if (history.length > 0) {
      const lastItem = history[history.length - 1]
      set({
        history: history.slice(0, -1),
        redoStack: [...redoStack, lastItem],
      })
    }
  },

  redo: () => {
    const { history, redoStack } = get()
    if (redoStack.length > 0) {
      const lastItem = redoStack[redoStack.length - 1]
      set({
        history: [...history, lastItem],
        redoStack: redoStack.slice(0, -1),
      })
    }
  },

  clear: () => {
    const { history } = get()
    if (history.length > 0) {
      set({
        redoStack: [...history],
        history: [],
      })
    }
  },

  setCurrentDrawing: (drawing) => set({ currentDrawing: drawing }),
}))
