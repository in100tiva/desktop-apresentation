import { useState, useEffect } from 'react'
import { DrawingCanvas, Spotlight } from '@/components/canvas'
import { Toolbar } from '@/components/toolbar'
import { ShortcutSettings } from '@/components/settings'
import { useToolStore, useCanvasStore, useShortcutStore, matchesShortcut } from '@/stores'
import { COLOR_PRESETS } from '@shared/constants'
import type { ToolType } from '@shared/types'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { setTool, setColor, setDrawingMode, toggleSpotlight } = useToolStore()
  const { undo, redo, clear } = useCanvasStore()
  const { shortcuts, isRecording } = useShortcutStore()

  // Listen for IPC events from main process
  useEffect(() => {
    const api = window.electronAPI

    api?.onClearCanvas(() => clear())
    api?.onUndo(() => undo())
    api?.onRedo(() => redo())
    api?.onSetTool((tool: ToolType) => setTool(tool))
    api?.onToggleSpotlight(() => toggleSpotlight())
    api?.onDrawingModeChanged((isDrawing: boolean) => setDrawingMode(isDrawing))
    api?.onOpenSettings(() => setSettingsOpen(true))
  }, [clear, undo, redo, setTool, toggleSpotlight, setDrawingMode])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isRecording) return
      if (settingsOpen) {
        if (e.key === 'Escape') {
          setSettingsOpen(false)
        }
        return
      }

      // Check custom shortcuts
      for (const [action, shortcut] of Object.entries(shortcuts)) {
        if (matchesShortcut(shortcut, e, false)) {
          e.preventDefault()
          executeAction(action)
          return
        }
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (isRecording || settingsOpen) return
      if ((e.target as HTMLElement).closest('[data-toolbar]')) return

      // Check mouse shortcuts
      for (const [action, shortcut] of Object.entries(shortcuts)) {
        if (shortcut.mouse !== null && matchesShortcut(shortcut, e, true)) {
          e.preventDefault()
          executeAction(action)
          return
        }
      }
    }

    const executeAction = (action: string) => {
      if (action.startsWith('tool-')) {
        const tool = action.replace('tool-', '') as ToolType
        setTool(tool)
      } else if (action.startsWith('color-')) {
        const colorName = action.replace('color-', '')
        const colorPreset = COLOR_PRESETS.find(
          (p) => p.name.toLowerCase() === colorName || p.value.toLowerCase() === `#${colorName}`
        )
        if (colorPreset) {
          setColor(colorPreset.value)
        }
      } else {
        switch (action) {
          case 'undo':
            undo()
            break
          case 'redo':
            redo()
            break
          case 'clear':
            clear()
            break
          case 'spotlight':
            toggleSpotlight()
            break
          case 'toggle-drawing':
            window.electronAPI?.toggleDrawingMode()
            break
          case 'toggle-visibility':
            window.electronAPI?.minimizeToTray()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleMouseDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [shortcuts, isRecording, settingsOpen, setTool, setColor, undo, redo, clear, toggleSpotlight])

  return (
    <div className="w-screen h-screen overflow-hidden">
      {/* Drawing Canvas */}
      <DrawingCanvas />

      {/* Spotlight Overlay */}
      <Spotlight />

      {/* Toolbar */}
      <Toolbar onOpenSettings={() => setSettingsOpen(true)} />

      {/* Settings Modal */}
      <ShortcutSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
