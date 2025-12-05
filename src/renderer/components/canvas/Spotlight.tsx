import { useState, useEffect } from 'react'
import { useToolStore } from '@/stores'

export function Spotlight() {
  const { isSpotlightMode, spotlightSize } = useToolStore()
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    if (isSpotlightMode) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isSpotlightMode])

  if (!isSpotlightMode) return null

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      <div
        className="absolute rounded-full transition-all duration-100 ease-out"
        style={{
          left: position.x - spotlightSize / 2,
          top: position.y - spotlightSize / 2,
          width: spotlightSize,
          height: spotlightSize,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
        }}
      />
    </div>
  )
}
