import { contextBridge, ipcRenderer } from 'electron'
import type { ShortcutMap, ToolType } from '../shared/types'

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Send events to main process
  setIgnoreMouse: (ignore: boolean): void => ipcRenderer.send('set-ignore-mouse', ignore),
  minimizeToTray: (): void => ipcRenderer.send('minimize-to-tray'),
  toggleDrawingMode: (): void => ipcRenderer.send('toggle-drawing-mode'),
  updateShortcuts: (shortcuts: ShortcutMap): void => ipcRenderer.send('update-shortcuts', shortcuts),

  // Receive events from main process
  onClearCanvas: (callback: () => void): void => {
    ipcRenderer.on('clear-canvas', callback)
  },
  onUndo: (callback: () => void): void => {
    ipcRenderer.on('undo', callback)
  },
  onRedo: (callback: () => void): void => {
    ipcRenderer.on('redo', callback)
  },
  onSetTool: (callback: (tool: ToolType) => void): void => {
    ipcRenderer.on('set-tool', (_event, tool: ToolType) => callback(tool))
  },
  onToggleSpotlight: (callback: () => void): void => {
    ipcRenderer.on('toggle-spotlight', callback)
  },
  onDrawingModeChanged: (callback: (isDrawing: boolean) => void): void => {
    ipcRenderer.on('drawing-mode-changed', (_event, isDrawing: boolean) => callback(isDrawing))
  },
  onOpenSettings: (callback: () => void): void => {
    ipcRenderer.on('open-settings', callback)
  },
})
