import { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Line, Rect, Ellipse, Arrow, Text } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { useToolStore, useCanvasStore } from '@/stores'
import type { Drawing, Point, PathDrawing, ShapeDrawing, LineDrawing, TextDrawing } from '@shared/types'
import { TOOL_CONFIG } from '@shared/constants'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function DrawingCanvas() {
  const stageRef = useRef<any>(null)
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 })

  const { currentTool, currentColor, strokeSize, isDrawingMode, isSpotlightMode } = useToolStore()
  const { history, currentDrawing, setCurrentDrawing, addDrawing } = useCanvasStore()

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setStageSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getPointerPosition = useCallback((e: KonvaEventObject<MouseEvent>): Point => {
    const stage = e.target.getStage()
    const pos = stage?.getPointerPosition()
    return pos || { x: 0, y: 0 }
  }, [])

  const handleMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!isDrawingMode || isSpotlightMode) return

      const pos = getPointerPosition(e)
      setIsDrawing(true)
      setStartPoint(pos)

      const toolConfig = TOOL_CONFIG[currentTool]

      if (currentTool === 'pen' || currentTool === 'highlighter' || currentTool === 'eraser') {
        const drawing: PathDrawing = {
          id: generateId(),
          type: currentTool === 'eraser' ? 'eraser' : 'path',
          color: currentColor,
          size: strokeSize * toolConfig.sizeMultiplier,
          alpha: toolConfig.alpha,
          points: [pos],
        }
        setCurrentDrawing(drawing)
      }
    },
    [isDrawingMode, isSpotlightMode, currentTool, currentColor, strokeSize, getPointerPosition, setCurrentDrawing]
  )

  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!isDrawing || !isDrawingMode) return

      const pos = getPointerPosition(e)
      const toolConfig = TOOL_CONFIG[currentTool]

      if (currentTool === 'pen' || currentTool === 'highlighter' || currentTool === 'eraser') {
        if (currentDrawing && 'points' in currentDrawing) {
          const updated: PathDrawing = {
            ...(currentDrawing as PathDrawing),
            points: [...(currentDrawing as PathDrawing).points, pos],
          }
          setCurrentDrawing(updated)
        }
      } else if (currentTool === 'rectangle') {
        const drawing: ShapeDrawing = {
          id: generateId(),
          type: 'rectangle',
          color: currentColor,
          size: strokeSize,
          alpha: toolConfig.alpha,
          x: Math.min(startPoint.x, pos.x),
          y: Math.min(startPoint.y, pos.y),
          width: Math.abs(pos.x - startPoint.x),
          height: Math.abs(pos.y - startPoint.y),
        }
        setCurrentDrawing(drawing)
      } else if (currentTool === 'circle') {
        const drawing: ShapeDrawing = {
          id: generateId(),
          type: 'circle',
          color: currentColor,
          size: strokeSize,
          alpha: toolConfig.alpha,
          x: Math.min(startPoint.x, pos.x),
          y: Math.min(startPoint.y, pos.y),
          width: Math.abs(pos.x - startPoint.x),
          height: Math.abs(pos.y - startPoint.y),
        }
        setCurrentDrawing(drawing)
      } else if (currentTool === 'line' || currentTool === 'arrow') {
        const drawing: LineDrawing = {
          id: generateId(),
          type: currentTool,
          color: currentColor,
          size: strokeSize,
          alpha: toolConfig.alpha,
          startX: startPoint.x,
          startY: startPoint.y,
          endX: pos.x,
          endY: pos.y,
        }
        setCurrentDrawing(drawing)
      }
    },
    [isDrawing, isDrawingMode, currentTool, currentColor, strokeSize, startPoint, currentDrawing, getPointerPosition, setCurrentDrawing]
  )

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return
    setIsDrawing(false)

    if (currentDrawing) {
      addDrawing(currentDrawing)
    }
  }, [isDrawing, currentDrawing, addDrawing])

  const renderDrawing = (drawing: Drawing, key: string) => {
    switch (drawing.type) {
      case 'path':
        return (
          <Line
            key={key}
            points={(drawing as PathDrawing).points.flatMap((p) => [p.x, p.y])}
            stroke={drawing.color}
            strokeWidth={drawing.size}
            opacity={drawing.alpha}
            lineCap="round"
            lineJoin="round"
            tension={0.5}
          />
        )
      case 'eraser':
        return (
          <Line
            key={key}
            points={(drawing as PathDrawing).points.flatMap((p) => [p.x, p.y])}
            stroke="#000000"
            strokeWidth={drawing.size}
            globalCompositeOperation="destination-out"
            lineCap="round"
            lineJoin="round"
            tension={0.5}
          />
        )
      case 'rectangle':
        return (
          <Rect
            key={key}
            x={(drawing as ShapeDrawing).x}
            y={(drawing as ShapeDrawing).y}
            width={(drawing as ShapeDrawing).width}
            height={(drawing as ShapeDrawing).height}
            stroke={drawing.color}
            strokeWidth={drawing.size}
            opacity={drawing.alpha}
          />
        )
      case 'circle':
        return (
          <Ellipse
            key={key}
            x={(drawing as ShapeDrawing).x + (drawing as ShapeDrawing).width / 2}
            y={(drawing as ShapeDrawing).y + (drawing as ShapeDrawing).height / 2}
            radiusX={Math.abs((drawing as ShapeDrawing).width / 2)}
            radiusY={Math.abs((drawing as ShapeDrawing).height / 2)}
            stroke={drawing.color}
            strokeWidth={drawing.size}
            opacity={drawing.alpha}
          />
        )
      case 'line':
        return (
          <Line
            key={key}
            points={[
              (drawing as LineDrawing).startX,
              (drawing as LineDrawing).startY,
              (drawing as LineDrawing).endX,
              (drawing as LineDrawing).endY,
            ]}
            stroke={drawing.color}
            strokeWidth={drawing.size}
            opacity={drawing.alpha}
            lineCap="round"
          />
        )
      case 'arrow':
        return (
          <Arrow
            key={key}
            points={[
              (drawing as LineDrawing).startX,
              (drawing as LineDrawing).startY,
              (drawing as LineDrawing).endX,
              (drawing as LineDrawing).endY,
            ]}
            stroke={drawing.color}
            fill={drawing.color}
            strokeWidth={drawing.size}
            opacity={drawing.alpha}
            pointerLength={drawing.size * 4}
            pointerWidth={drawing.size * 4}
          />
        )
      case 'text':
        return (
          <Text
            key={key}
            x={(drawing as TextDrawing).x}
            y={(drawing as TextDrawing).y}
            text={(drawing as TextDrawing).text}
            fill={drawing.color}
            fontSize={drawing.size * 5}
            opacity={drawing.alpha}
          />
        )
      default:
        return null
    }
  }

  return (
    <Stage
      ref={stageRef}
      width={stageSize.width}
      height={stageSize.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={isDrawingMode ? 'cursor-crosshair' : 'pointer-events-none'}
    >
      <Layer>
        {/* Render history */}
        {history.map((drawing) => renderDrawing(drawing, drawing.id))}

        {/* Render current drawing */}
        {currentDrawing && renderDrawing(currentDrawing, 'current')}
      </Layer>
    </Stage>
  )
}
