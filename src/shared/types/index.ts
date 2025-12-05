// ========== Tool Types ==========
export type ToolType =
  | 'pen'
  | 'highlighter'
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'line'
  | 'text'
  | 'eraser'

// ========== Drawing Types ==========
export interface Point {
  x: number
  y: number
}

export interface BaseDrawing {
  id: string
  color: string
  size: number
  alpha: number
}

export interface PathDrawing extends BaseDrawing {
  type: 'path' | 'eraser'
  points: Point[]
}

export interface ShapeDrawing extends BaseDrawing {
  type: 'rectangle' | 'circle'
  x: number
  y: number
  width: number
  height: number
}

export interface LineDrawing extends BaseDrawing {
  type: 'line' | 'arrow'
  startX: number
  startY: number
  endX: number
  endY: number
}

export interface TextDrawing extends BaseDrawing {
  type: 'text'
  x: number
  y: number
  text: string
}

export type Drawing = PathDrawing | ShapeDrawing | LineDrawing | TextDrawing

// ========== Shortcut Types ==========
export interface Shortcut {
  key: string | null
  ctrl: boolean
  shift: boolean
  alt: boolean
  mouse: number | null
}

export type ShortcutAction =
  | `tool-${ToolType}`
  | `color-${string}`
  | 'undo'
  | 'redo'
  | 'clear'
  | 'spotlight'
  | 'toggle-drawing'
  | 'toggle-visibility'

export type ShortcutMap = Record<ShortcutAction, Shortcut>

// ========== Color Types ==========
export interface ColorPreset {
  name: string
  value: string
}

// ========== App State Types ==========
export interface AppState {
  isDrawingMode: boolean
  isSpotlightMode: boolean
  spotlightSize: number
}

// ========== IPC Types ==========
export interface ElectronAPI {
  setIgnoreMouse: (ignore: boolean) => void
  minimizeToTray: () => void
  toggleDrawingMode: () => void
  updateShortcuts: (shortcuts: ShortcutMap) => void
  onClearCanvas: (callback: () => void) => void
  onUndo: (callback: () => void) => void
  onRedo: (callback: () => void) => void
  onSetTool: (callback: (tool: ToolType) => void) => void
  onToggleSpotlight: (callback: () => void) => void
  onDrawingModeChanged: (callback: (isDrawing: boolean) => void) => void
  onOpenSettings: (callback: () => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
