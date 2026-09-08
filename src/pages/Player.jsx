import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useSongs } from '../hooks/useSongs.js'
import { useAutoScroll } from '../hooks/useAutoScroll.js'
import { useTapTempo } from '../hooks/useTapTempo.js'
import { parseSong } from '../lib/chordParser.js'
import LyricsView from '../components/LyricsView.jsx'
import DiagramStrip from '../components/DiagramStrip.jsx'
import ScrollControls from '../components/ScrollControls.jsx'

// px/sec of scroll per BPM. Tuned so ~80 BPM feels like a natural reading pace.
const PX_PER_SEC_PER_BPM = 0.45

function bpmToSpeed(bpm) {
  return bpm * PX_PER_SEC_PER_BPM
}

export default function Player() {
  const { id } = useParams()
  const { user } = useAuth()
  const { songs, saveSong } = useSongs(user?.id)
  const navigate = useNavigate()

  const song = songs.find((s) => s.id === id)
  const containerRef = useRef(null)
  const [bpm, setBpm] = useState(80)
  const [fontSize, setFontSize] = useState(28)
  const [currentChord, setCurrentChord] = useState(null)
  const saveTimerRef = useRef(null)
  // Chord word positions, measured once per layout rather than every scroll
  // frame - re-reading getBoundingClientRect() on every animation frame
  // forces a synchronous layout recalculation each time, which is what was
  // causing the visible stutter during auto-scroll.
  const chordPositionsRef = useRef([])

  const parsed = useMemo(() => (song ? parseSong(song.raw_text) : null), [song])
  const speed = bpmToSpeed(bpm)
  const { isPlaying, progress, play, pause, restart } = useAutoScroll(containerRef, speed)
  const { bpm: tappedBpm, tap } = useTapTempo()

  useEffect(() => {
    if (!song) return
    setBpm(song.last_speed ?? 80)
    setFontSize(song.last_font_size ?? 28)
  }, [song?.id])

  useEffect(() => {
    if (tappedBpm) setBpm(tappedBpm)
  }, [tappedBpm])

  useEffect(() => {
    if (!song) return
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveSong({ ...song, last_speed: bpm, last_font_size: fontSize })
    }, 1200)
    return () => clearTimeout(saveTimerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm, fontSize])

  // Measure each chord word's position relative to the scroll content once,
  // whenever the layout could have changed (song, font size, or viewport
  // resize/orientation change) - not on every scroll tick.
  useEffect(() => {
    const el = containerRef.current
    if (!el || !parsed) return

    const measure = () => {
      const nodes = Array.from(el.querySelectorAll('[data-chord]'))
      const containerRect = el.getBoundingClientRect()
      chordPositionsRef.current = nodes.map((node) => {
        const rect = node.getBoundingClientRect()
        return { chord: node.dataset.chord, y: rect.top - containerRect.top + el.scrollTop }
      })
    }

    // Wait a frame so fonts/layout have settled before measuring.
    const raf = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [parsed, fontSize])

  // Cheap: just compares scrollTop against pre-measured positions, no DOM reads.
  useEffect(() => {
    const el = containerRef.current
    const positions = chordPositionsRef.current
    if (!el || !positions.length) return
    const focusY = el.scrollTop + el.clientHeight * 0.35
    let current = null
    for (const p of positions) {
      if (p.y <= focusY) current = p.chord
      else break
    }
    if (current) setCurrentChord(current)
  }, [progress])

  if (!song || !parsed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={() => navigate('/')} className="text-paper-faint hover:text-paper text-sm">
          ← Back to library
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="fixed top-0 inset-x-0 z-20 bg-gradient-to-b from-ink to-transparent px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-paper-faint hover:text-paper text-sm transition-colors">
          ← Library
        </button>
        <h2 className="font-serif text-paper text-lg truncate">{song.title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFontSize((f) => Math.max(16, f - 2))}
            className="text-paper-faint hover:text-paper text-sm px-2"
          >
            A-
          </button>
          <button
            onClick={() => setFontSize((f) => Math.min(48, f + 2))}
            className="text-paper-faint hover:text-paper text-sm px-2"
          >
            A+
          </button>
        </div>
      </div>

      <div className="sticky top-0 pt-16 z-10 bg-ink border-b border-ink-border">
        <DiagramStrip chords={parsed.uniqueChords} instrument={song.instrument} currentChord={currentChord} />
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto">
        <LyricsView song={parsed} fontSize={fontSize} />
      </div>

      <ScrollControls
        isPlaying={isPlaying}
        onPlay={play}
        onPause={pause}
        onRestart={restart}
        bpm={bpm}
        onBpmChange={setBpm}
        onTap={tap}
        progress={progress}
      />
    </div>
  )
}
