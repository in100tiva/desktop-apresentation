import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Shortcut, ShortcutAction, ShortcutMap } from '@shared/types'
import { DEFAULT_SHORTCUTS } from '@shared/constants'

interface ShortcutState {
  shortcuts: ShortcutMap
  tempShortcuts: ShortcutMap
  isRecording: boolean
  recordingAction: ShortcutAction | null

  // Actions
  setShortcut: (action: ShortcutAction, shortcut: Shortcut) => void
  setTempShortcut: (action: ShortcutAction, shortcut: Shortcut) => void
  startRecording: (action: ShortcutAction) => void
  stopRecording: () => void
  saveShortcuts: () => void
  resetToDefaults: () => void
  initTempShortcuts: () => void
}

export const useShortcutStore = create<ShortcutState>()(
  persist(
    (set, get) => ({
      shortcuts: { ...DEFAULT_SHORTCUTS },
      tempShortcuts: { ...DEFAULT_SHORTCUTS },
      isRecording: false,
      recordingAction: null,

      setShortcut: (action, shortcut) =>
        set((state) => ({
          shortcuts: { ...state.shortcuts, [action]: shortcut },
        })),

      setTempShortcut: (action, shortcut) =>
        set((state) => ({
          tempShortcuts: { ...state.tempShortcuts, [action]: shortcut },
        })),

      startRecording: (action) =>
        set({ isRecording: true, recordingAction: action }),

      stopRecording: () =>
        set({ isRecording: false, recordingAction: null }),

      saveShortcuts: () => {
        const { tempShortcuts } = get()
        set({ shortcuts: { ...tempShortcuts } })

        // Notify Electron main process
        if (window.electronAPI?.updateShortcuts) {
          window.electronAPI.updateShortcuts(tempShortcuts)
        }
      },

      resetToDefaults: () =>
        set({
          tempShortcuts: { ...DEFAULT_SHORTCUTS },
        }),

      initTempShortcuts: () => {
        const { shortcuts } = get()
        set({ tempShortcuts: { ...shortcuts } })
      },
    }),
    {
      name: 'screen-annotator-shortcuts',
      partialize: (state) => ({ shortcuts: state.shortcuts }),
    }
  )
)

// Helper function to convert shortcut to display string
export function shortcutToString(shortcut: Shortcut): string {
  if (!shortcut || (!shortcut.key && shortcut.mouse === null)) {
    return '-'
  }

  const parts: string[] = []

  if (shortcut.ctrl) parts.push('Ctrl')
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.alt) parts.push('Alt')

  if (shortcut.mouse !== null) {
    const mouseNames: Record<number, string> = {
      0: 'Mouse Esq',
      1: 'Mouse Meio',
      2: 'Mouse Dir',
      3: 'Mouse 4',
      4: 'Mouse 5',
    }
    parts.push(mouseNames[shortcut.mouse] || `Mouse ${shortcut.mouse}`)
  } else if (shortcut.key) {
    const keyNames: Record<string, string> = {
      ' ': 'Espaço',
      arrowup: 'Seta Cima',
      arrowdown: 'Seta Baixo',
      arrowleft: 'Seta Esq',
      arrowright: 'Seta Dir',
      escape: 'Esc',
      enter: 'Enter',
      tab: 'Tab',
      backspace: 'Backspace',
      delete: 'Delete',
    }

    const keyLower = shortcut.key.toLowerCase()
    const keyDisplay = keyNames[keyLower] || shortcut.key.toUpperCase()
    parts.push(keyDisplay)
  }

  return parts.join('+') || '-'
}

// Helper to match shortcut with event
export function matchesShortcut(
  shortcut: Shortcut,
  event: KeyboardEvent | MouseEvent,
  isMouse = false
): boolean {
  if (!shortcut || (!shortcut.key && shortcut.mouse === null)) return false

  if (isMouse) {
    const mouseEvent = event as MouseEvent
    return (
      shortcut.mouse === mouseEvent.button &&
      shortcut.ctrl === mouseEvent.ctrlKey &&
      shortcut.shift === mouseEvent.shiftKey &&
      shortcut.alt === mouseEvent.altKey
    )
  }

  const keyEvent = event as KeyboardEvent
  return (
    shortcut.key === keyEvent.key.toLowerCase() &&
    shortcut.ctrl === keyEvent.ctrlKey &&
    shortcut.shift === keyEvent.shiftKey &&
    shortcut.alt === keyEvent.altKey
  )
}
