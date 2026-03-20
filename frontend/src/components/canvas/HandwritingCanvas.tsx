import { useEffect, useRef } from 'react'

interface WordObject {
  imageUrl: string
  x: number
  y: number
  angle: number
}

interface HandwritingCanvasProps {
  words: WordObject[]
  background: string
}

export default function HandwritingCanvas({ words, background }: HandwritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //const fabricRef = useRef<any>(null)

  useEffect(() => {
    // Fabric.js init — will be implemented in feat/ui-fabric-canvas
    // import { Canvas } from 'fabric' and initialize here
    // For now render placeholder
  }, [])

  useEffect(() => {
    // Re-render when words or background changes
  }, [words, background])


  // const exportCanvas = () => {
  //   if (!fabricRef.current) return
  //   const dataUrl = fabricRef.current.toDataURL({ format: 'jpeg', quality: 0.9 })
  //   const a = document.createElement('a')
  //   a.href = dataUrl
  //   a.download = 'handwriting.jpg'
  //   a.click()
  // }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
      {/* Placeholder until Fabric.js is wired up */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-mono text-xs text-cyber-muted uppercase tracking-widest opacity-50">
          Canvas Preview
        </span>
      </div>
    </div>
  )
}