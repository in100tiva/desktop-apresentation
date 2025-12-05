import { useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@/components/ui'
import { useShortcutStore, shortcutToString } from '@/stores'
import type { Shortcut, ShortcutAction } from '@shared/types'
import { cn } from '@/lib/utils'

interface ShortcutInputProps {
  action: ShortcutAction
  label: string
  colorDot?: string
}

function ShortcutInput({ action, label, colorDot }: ShortcutInputProps) {
  const { tempShortcuts, isRecording, recordingAction, setTempShortcut, startRecording, stopRecording } =
    useShortcutStore()

  const shortcut = tempShortcuts[action]
  const isActive = isRecording && recordingAction === action

  const handleClick = () => {
    if (isActive) {
      stopRecording()
    } else {
      startRecording(action)
    }
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive) return

      e.preventDefault()
      e.stopPropagation()

      // Ignore modifier keys alone
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        return
      }

      // Escape cancels recording
      if (e.key === 'Escape' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        stopRecording()
        return
      }

      // Delete/Backspace removes shortcut
      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        setTempShortcut(action, { key: null, ctrl: false, shift: false, alt: false, mouse: null })
        stopRecording()
        return
      }

      const newShortcut: Shortcut = {
        key: e.key.toLowerCase(),
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        mouse: null,
      }

      setTempShortcut(action, newShortcut)
      stopRecording()
    },
    [isActive, action, setTempShortcut, stopRecording]
  )

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!isActive) return

      // Ignore left click without modifiers
      if (e.button === 0 && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        return
      }

      e.preventDefault()
      e.stopPropagation()

      const newShortcut: Shortcut = {
        key: null,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        mouse: e.button,
      }

      setTempShortcut(action, newShortcut)
      stopRecording()
    },
    [isActive, action, setTempShortcut, stopRecording]
  )

  useEffect(() => {
    if (isActive) {
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('mousedown', handleMouseDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [isActive, handleKeyDown, handleMouseDown])

  return (
    <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
      <label className="text-sm text-zinc-300 flex items-center gap-2">
        {colorDot && (
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colorDot, border: colorDot === '#FFFFFF' ? '1px solid #666' : 'none' }}
          />
        )}
        {label}
      </label>
      <button
        onClick={handleClick}
        className={cn(
          'min-w-[100px] px-3 py-1.5 rounded-md text-xs font-mono',
          'bg-black/30 border-2 transition-all text-center',
          isActive
            ? 'border-primary bg-primary/10 animate-pulse-ring'
            : 'border-transparent hover:border-white/20'
        )}
      >
        {isActive ? 'Pressione...' : shortcutToString(shortcut)}
      </button>
    </div>
  )
}

interface ShortcutSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShortcutSettings({ open, onOpenChange }: ShortcutSettingsProps) {
  const { saveShortcuts, resetToDefaults, initTempShortcuts, stopRecording } = useShortcutStore()

  useEffect(() => {
    if (open) {
      initTempShortcuts()
    } else {
      stopRecording()
    }
  }, [open, initTempShortcuts, stopRecording])

  const handleSave = () => {
    saveShortcuts()
    onOpenChange(false)
  }

  const handleReset = () => {
    resetToDefaults()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle>Configurar Atalhos</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Clique em um campo e pressione a combinação de teclas desejada (ou botão do mouse)
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[50vh] space-y-6 pr-2">
          {/* Tools */}
          <section>
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
              Ferramentas
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ShortcutInput action="tool-pen" label="Caneta" />
              <ShortcutInput action="tool-highlighter" label="Marcador" />
              <ShortcutInput action="tool-rectangle" label="Retângulo" />
              <ShortcutInput action="tool-circle" label="Círculo" />
              <ShortcutInput action="tool-arrow" label="Seta" />
              <ShortcutInput action="tool-line" label="Linha" />
              <ShortcutInput action="tool-text" label="Texto" />
              <ShortcutInput action="tool-eraser" label="Borracha" />
            </div>
          </section>

          {/* Colors */}
          <section>
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
              Cores
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ShortcutInput action="color-red" label="Vermelho" colorDot="#FF0000" />
              <ShortcutInput action="color-green" label="Verde" colorDot="#00FF00" />
              <ShortcutInput action="color-blue" label="Azul" colorDot="#0000FF" />
              <ShortcutInput action="color-yellow" label="Amarelo" colorDot="#FFFF00" />
              <ShortcutInput action="color-magenta" label="Magenta" colorDot="#FF00FF" />
              <ShortcutInput action="color-cyan" label="Ciano" colorDot="#00FFFF" />
              <ShortcutInput action="color-white" label="Branco" colorDot="#FFFFFF" />
              <ShortcutInput action="color-black" label="Preto" colorDot="#000000" />
            </div>
          </section>

          {/* Actions */}
          <section>
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
              Ações
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ShortcutInput action="undo" label="Desfazer" />
              <ShortcutInput action="redo" label="Refazer" />
              <ShortcutInput action="clear" label="Limpar Tela" />
              <ShortcutInput action="spotlight" label="Spotlight" />
              <ShortcutInput action="toggle-drawing" label="Modo Desenho" />
              <ShortcutInput action="toggle-visibility" label="Mostrar/Ocultar" />
            </div>
          </section>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={handleReset}>
            Restaurar Padrão
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
