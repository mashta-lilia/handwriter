import { useState } from 'react'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import HandwritingCanvas from '../components/canvas/HandwritingCanvas'
import RichEditor from '../components/ui/RichEditor'

const PEN_COLORS = [
  { label: 'Blue', value: '#2563eb' },
  { label: 'Black', value: '#1a1a1a' },
  { label: 'Red', value: '#dc2626' },
]

const PAPER_TYPES = [
  { label: 'Grid', value: 'grid' },
  { label: 'Lined', value: 'lined' },
  { label: 'Blank', value: 'blank' },
]

const HANDWRITING_STYLES = [
  { label: 'Anna', value: 'anna' },
  { label: 'Boris', value: 'boris' },
  { label: 'Kate', value: 'kate' },
  { label: 'Max', value: 'max' },
  { label: 'Oleh', value: 'oleh' },
  { label: 'Daria', value: 'daria' },
]

export default function EditorPage() {
  const [text, setText] = useState('')
  const [penColor, setPenColor] = useState('#2563eb')
  const [paperType, setPaperType] = useState('lined')
  const [sloppiness, setSloppiness] = useState(5)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [generating, setGenerating] = useState(false)
  const [handwriting, setHandwriting] = useState('anna')
  const [mistakes, setMistakes] = useState(3)
  const [tilt, setTilt] = useState(5)
  const [fontSize, setFontSize] = useState(16)
  const [letterSpacing, setLetterSpacing] = useState(5)
  const [wordSpacing, setWordSpacing] = useState(5)
  const [lineHeight, setLineHeight] = useState(5)

  const handleGenerate = async () => {
    if (!text.trim()) return
    setGenerating(true)
    setProgress(0)
    setStatus('Initializing...')
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 200))
      setProgress(i)
      setStatus(i < 100 ? `Rendering... ${i}%` : 'Done!')
    }
    setGenerating(false)
  }

  const handleReset = () => {
    setPenColor('#2563eb')
    setPaperType('lined')
    setSloppiness(5)
    setHandwriting('anna')
    setMistakes(3)
    setTilt(5)
    setFontSize(16)
    setLetterSpacing(5)
    setWordSpacing(5)
    setLineHeight(5)
  }

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col">
      {/* Top bar */}
      <header className="border-b border-cyber-muted px-6 py-3 flex items-center justify-between">
        <span className="font-display text-lg font-black text-cyber-cyan uppercase tracking-widest animate-glitch">
          HANDWRITTER
        </span>
        
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Settings */}
        <aside className="w-64 border-r border-cyber-muted p-6 flex flex-col gap-6 overflow-y-auto shrink-0">

          {/* BACKGROUNDS */}
          <section>
            <p className="font-mono text-xs text-cyber-cyan uppercase tracking-widest mb-3">Backgrounds</p>
            <div className="grid grid-cols-3 gap-2">
              {PAPER_TYPES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPaperType(p.value)}
                  className={`aspect-square clip-cyber-sm flex items-end p-1 text-[9px] font-mono uppercase tracking-wider transition-all
                    ${paperType === p.value
                      ? 'bg-cyber-cyan text-cyber-bg'
                      : 'bg-cyber-muted text-cyber-text hover:border-cyber-cyan border border-transparent'
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          {/* HANDWRITING */}
          <section>
            <p className="font-mono text-xs text-cyber-cyan uppercase tracking-widest mb-3">Handwriting</p>
            <div className="grid grid-cols-2 gap-2">
              {HANDWRITING_STYLES.map((h) => (
                <button
                  key={h.value}
                  onClick={() => setHandwriting(h.value)}
                  className={`py-2 px-3 text-xs font-mono uppercase tracking-wider clip-cyber-sm transition-all
                    ${handwriting === h.value
                      ? 'bg-cyber-cyan text-cyber-bg'
                      : 'bg-cyber-muted text-cyber-text border border-transparent hover:border-cyber-cyan'
                    }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </section>

          {/* PEN COLOR */}
          <section>
            <p className="font-mono text-xs text-cyber-cyan uppercase tracking-widest mb-3">Pen Color</p>
            <div className="flex gap-3">
              {PEN_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setPenColor(c.value)}
                  title={c.label}
                  className={`w-8 h-8 rounded-full border-2 transition-all
                    ${penColor === c.value ? 'border-cyber-cyan scale-110 shadow-cyber-cyan' : 'border-cyber-muted'}`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </section>

          {/* EFFECTS */}
          <section>
            <p className="font-mono text-xs text-cyber-cyan uppercase tracking-widest mb-3">Effects</p>
            <div className="flex flex-col gap-4">

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-xs text-cyber-text uppercase">Sloppiness</span>
                  <span className="font-mono text-xs text-cyber-cyan">{sloppiness}</span>
                </div>
                <input type="range" min={1} max={10} value={sloppiness}
                  onChange={(e) => setSloppiness(Number(e.target.value))}
                  className="w-full accent-cyber-cyan cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-xs text-cyber-text uppercase">Mistakes</span>
                  <span className="font-mono text-xs text-cyber-cyan">{mistakes}</span>
                </div>
                <input type="range" min={0} max={10} value={mistakes}
                  onChange={(e) => setMistakes(Number(e.target.value))}
                  className="w-full accent-cyber-cyan cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-xs text-cyber-text uppercase">Letter Tilt</span>
                  <span className="font-mono text-xs text-cyber-cyan">{tilt}</span>
                </div>
                <input type="range" min={0} max={10} value={tilt}
                  onChange={(e) => setTilt(Number(e.target.value))}
                  className="w-full accent-cyber-cyan cursor-pointer" />
              </div>

            </div>
          </section>

          {/* TYPOGRAPHY */}
          <section>
            <p className="font-mono text-xs text-cyber-cyan uppercase tracking-widest mb-3">Typography</p>
            <div className="flex flex-col gap-4">

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-xs text-cyber-text uppercase">Font Size</span>
                  <span className="font-mono text-xs text-cyber-cyan">{fontSize}px</span>
                </div>
                <input type="range" min={10} max={32} value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-cyber-cyan cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-xs text-cyber-text uppercase">Letter Spacing</span>
                  <span className="font-mono text-xs text-cyber-cyan">{letterSpacing}</span>
                </div>
                <input type="range" min={0} max={10} value={letterSpacing}
                  onChange={(e) => setLetterSpacing(Number(e.target.value))}
                  className="w-full accent-cyber-cyan cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-xs text-cyber-text uppercase">Word Spacing</span>
                  <span className="font-mono text-xs text-cyber-cyan">{wordSpacing}</span>
                </div>
                <input type="range" min={0} max={10} value={wordSpacing}
                  onChange={(e) => setWordSpacing(Number(e.target.value))}
                  className="w-full accent-cyber-cyan cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-xs text-cyber-text uppercase">Line Height</span>
                  <span className="font-mono text-xs text-cyber-cyan">{lineHeight}</span>
                </div>
                <input type="range" min={0} max={10} value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                  className="w-full accent-cyber-cyan cursor-pointer" />
              </div>

            </div>
          </section>

          <button
            onClick={handleReset}
            className="mt-auto font-mono text-xs text-cyber-muted hover:text-cyber-pink transition-colors uppercase tracking-widest"
          >
            Reset Settings
          </button>

        </aside>

        {/* Center: Text Input */}
        <main className="flex-1 flex flex-col p-6 gap-4 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-cyber-cyan uppercase tracking-widest">Convert to Handwriting</span>
            <div className="flex-1 h-px bg-cyber-muted" />
          </div>

          <RichEditor onChange={(html) => setText(html)} />

          <div className="flex flex-col gap-2">
            {(generating || progress > 0) && (
              <ProgressBar value={progress} label={status} />
            )}
            <div className="flex gap-3">
              <Button onClick={handleGenerate} loading={generating} className="flex-1">
                Generate
              </Button>
              <Button variant="secondary">
                Export / Download
              </Button>
            </div>
          </div>
        </main>

        {/* Right: Canvas Preview */}
        <aside className="w-80 border-l border-cyber-muted p-6 flex flex-col gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-cyber-cyan uppercase tracking-widest">Example</span>
            <div className="flex-1 h-px bg-cyber-muted" />
          </div>
            <div className="flex-1 bg-cyber-surface border border-cyber-muted flex items-center justify-center overflow-visible" style={{ minHeight: 400 }}>
            <HandwritingCanvas words={[]} background={paperType} />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1 text-xs">Download PNG</Button>
            <Button variant="ghost" className="flex-1 text-xs">Download PDF</Button>
          </div>
        </aside>
      </div>
    </div>
  )
}