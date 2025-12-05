import { useState, useRef, useEffect } from 'react'
import {
  Pencil,
  Highlighter,
  Square,
  Circle,
  ArrowUpRight,
  Minus,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Sun,
  Eye,
  Settings,
  Minimize2,
  GripVertical,
} from 'lucide-react'
import { Button, Separator, Slider, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui'
import { useToolStore, useCanvasStore, useShortcutStore, shortcutToString } from '@/stores'
import { COLOR_PRESETS, DEFAULTS } from '@shared/constants'
import type { ToolType } from '@shared/types'
import { cn } from '@/lib/utils'

interface ToolButtonProps {
  tool: ToolType
  icon: React.ReactNode
  label: string
}

function ToolButton({ tool, icon, label }: ToolButtonProps) {
  const { currentTool, setTool } = useToolStore()
  const { shortcuts } = useShortcutStore()
  const shortcut = shortcuts[`tool-${tool}` as keyof typeof shortcuts]
  const shortcutStr = shortcutToString(shortcut)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={currentTool === tool ? 'toolActive' : 'tool'}
          size="tool"
          onClick={() => setTool(tool)}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label} {shortcutStr !== '-' && `(${shortcutStr})`}</p>
      </TooltipContent>
    </Tooltip>
  )
}

interface ColorButtonProps {
  color: string
  name: string
}

function ColorButton({ color, name }: ColorButtonProps) {
  const { currentColor, setColor } = useToolStore()
  const isActive = currentColor === color

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            'w-6 h-6 rounded-full transition-all duration-200 hover:scale-110',
            isActive && 'ring-2 ring-white ring-offset-2 ring-offset-transparent'
          )}
          style={{ backgroundColor: color, border: color === '#FFFFFF' ? '1px solid #666' : 'none' }}
          onClick={() => setColor(color)}
        />
      </TooltipTrigger>
      <TooltipContent>
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  )
}

interface ToolbarProps {
  onOpenSettings: () => void
}

export function Toolbar({ onOpenSettings }: ToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const { strokeSize, setStrokeSize, isDrawingMode, isSpotlightMode, toggleSpotlight } = useToolStore()
  const { undo, redo, clear, history, redoStack } = useCanvasStore()

  // Center toolbar on mount
  useEffect(() => {
    if (toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect()
      setPosition({ x: (window.innerWidth - rect.width) / 2, y: 20 })
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect()
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      setIsDragging(true)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleMinimize = () => {
    window.electronAPI?.minimizeToTray()
  }

  const handleToggleDrawing = () => {
    window.electronAPI?.toggleDrawingMode()
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={toolbarRef}
        className={cn(
          'fixed z-[9999] flex items-center gap-2 px-3 py-2 rounded-xl',
          'bg-zinc-900/95 backdrop-blur-md border border-white/10',
          'shadow-lg shadow-black/40 animate-slide-in',
          !isDrawingMode && 'opacity-60'
        )}
        style={{ left: position.x, top: position.y }}
      >
        {/* Drag handle */}
        <div
          className="cursor-move p-1 text-zinc-500 hover:text-white transition-colors"
          onMouseDown={handleMouseDown}
        >
          <GripVertical size={16} />
        </div>

        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          <ToolButton tool="pen" icon={<Pencil size={18} />} label="Caneta" />
          <ToolButton tool="highlighter" icon={<Highlighter size={18} />} label="Marcador" />
          <ToolButton tool="rectangle" icon={<Square size={18} />} label="Retângulo" />
          <ToolButton tool="circle" icon={<Circle size={18} />} label="Círculo" />
          <ToolButton tool="arrow" icon={<ArrowUpRight size={18} />} label="Seta" />
          <ToolButton tool="line" icon={<Minus size={18} />} label="Linha" />
          <ToolButton tool="text" icon={<Type size={18} />} label="Texto" />
          <ToolButton tool="eraser" icon={<Eraser size={18} />} label="Borracha" />
        </div>

        <Separator orientation="vertical" className="h-7" />

        {/* Colors */}
        <div className="flex items-center gap-1">
          {COLOR_PRESETS.slice(0, 8).map((preset) => (
            <ColorButton key={preset.value} color={preset.value} name={preset.name} />
          ))}
          <input
            type="color"
            className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-2 border-white/30"
            onChange={(e) => useToolStore.getState().setColor(e.target.value)}
          />
        </div>

        <Separator orientation="vertical" className="h-7" />

        {/* Stroke Size */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Tamanho:</span>
          <Slider
            value={[strokeSize]}
            onValueChange={([value]) => setStrokeSize(value)}
            min={DEFAULTS.minStrokeSize}
            max={DEFAULTS.maxStrokeSize}
            step={1}
            className="w-20"
          />
          <span className="text-xs text-white w-5 text-center">{strokeSize}</span>
        </div>

        <Separator orientation="vertical" className="h-7" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="tool"
                size="tool"
                onClick={undo}
                disabled={history.length === 0}
              >
                <Undo2 size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Desfazer (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="tool"
                size="tool"
                onClick={redo}
                disabled={redoStack.length === 0}
              >
                <Redo2 size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refazer (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="tool"
                size="tool"
                onClick={clear}
                disabled={history.length === 0}
              >
                <Trash2 size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Limpar Tudo</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isSpotlightMode ? 'toolActive' : 'tool'}
                size="tool"
                onClick={toggleSpotlight}
                className={isSpotlightMode ? 'bg-orange-500 hover:bg-orange-600' : ''}
              >
                <Sun size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Spotlight</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-7" />

        {/* Window Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={!isDrawingMode ? 'destructive' : 'tool'}
                size="tool"
                onClick={handleToggleDrawing}
              >
                <Eye size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Modo Desenho (Ctrl+Shift+D)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="tool" size="tool" onClick={onOpenSettings}>
                <Settings size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Configurar Atalhos</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="tool" size="tool" onClick={handleMinimize}>
                <Minimize2 size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Minimizar (Ctrl+Shift+A)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
