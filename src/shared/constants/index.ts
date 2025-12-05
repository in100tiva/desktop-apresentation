import type { ColorPreset, ShortcutMap } from '../types'

// ========== Color Presets ==========
export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Vermelho', value: '#FF0000' },
  { name: 'Verde', value: '#00FF00' },
  { name: 'Azul', value: '#0000FF' },
  { name: 'Amarelo', value: '#FFFF00' },
  { name: 'Magenta', value: '#FF00FF' },
  { name: 'Ciano', value: '#00FFFF' },
  { name: 'Branco', value: '#FFFFFF' },
  { name: 'Preto', value: '#000000' },
  { name: 'Laranja', value: '#FF9500' },
]

// ========== Default Shortcuts ==========
export const DEFAULT_SHORTCUTS: ShortcutMap = {
  // Tools
  'tool-pen': { key: '1', ctrl: true, shift: false, alt: false, mouse: null },
  'tool-highlighter': { key: '2', ctrl: true, shift: false, alt: false, mouse: null },
  'tool-rectangle': { key: '3', ctrl: true, shift: false, alt: false, mouse: null },
  'tool-circle': { key: '4', ctrl: true, shift: false, alt: false, mouse: null },
  'tool-arrow': { key: '5', ctrl: true, shift: false, alt: false, mouse: null },
  'tool-line': { key: '6', ctrl: true, shift: false, alt: false, mouse: null },
  'tool-text': { key: 't', ctrl: false, shift: false, alt: false, mouse: null },
  'tool-eraser': { key: 'e', ctrl: true, shift: false, alt: false, mouse: null },

  // Colors
  'color-red': { key: null, ctrl: false, shift: false, alt: false, mouse: null },
  'color-green': { key: null, ctrl: false, shift: false, alt: false, mouse: null },
  'color-blue': { key: null, ctrl: false, shift: false, alt: false, mouse: null },
  'color-yellow': { key: null, ctrl: false, shift: false, alt: false, mouse: null },
  'color-magenta': { key: null, ctrl: false, shift: false, alt: false, mouse: null },
  'color-cyan': { key: null, ctrl: false, shift: false, alt: false, mouse: null },
  'color-white': { key: null, ctrl: false, shift: false, alt: false, mouse: null },
  'color-black': { key: null, ctrl: false, shift: false, alt: false, mouse: null },

  // Actions
  'undo': { key: 'z', ctrl: true, shift: false, alt: false, mouse: null },
  'redo': { key: 'y', ctrl: true, shift: false, alt: false, mouse: null },
  'clear': { key: 'c', ctrl: true, shift: true, alt: false, mouse: null },
  'spotlight': { key: 's', ctrl: true, shift: true, alt: false, mouse: null },
  'toggle-drawing': { key: 'd', ctrl: true, shift: true, alt: false, mouse: null },
  'toggle-visibility': { key: 'a', ctrl: true, shift: true, alt: false, mouse: null },
}

// ========== Tool Config ==========
export const TOOL_CONFIG = {
  pen: { alpha: 1, sizeMultiplier: 1 },
  highlighter: { alpha: 0.4, sizeMultiplier: 3 },
  rectangle: { alpha: 1, sizeMultiplier: 1 },
  circle: { alpha: 1, sizeMultiplier: 1 },
  arrow: { alpha: 1, sizeMultiplier: 1 },
  line: { alpha: 1, sizeMultiplier: 1 },
  text: { alpha: 1, sizeMultiplier: 5 },
  eraser: { alpha: 1, sizeMultiplier: 3 },
} as const

// ========== Default Values ==========
export const DEFAULTS = {
  strokeSize: 3,
  minStrokeSize: 1,
  maxStrokeSize: 50,
  spotlightSize: 200,
  minSpotlightSize: 100,
  maxSpotlightSize: 500,
  color: '#FF0000',
  tool: 'pen',
} as const
