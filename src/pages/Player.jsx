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

const PX_PER_BEAT = 6

export default function Player() {
  const { id } = useParams()
  const { user } = useAuth()
  const { songs, saveSong } = useSongs(user?.id)
  const navigate = useNavigate()

  const song = songs.find((s) => s.id === id)
  const containerRef = useRef(null)
  const [speed, setSpeed] = useState(30)
  const [fontSize, setFontSize] = useState(28)
  const [currentChord, setCurrentChord] = useState(null)
  const saveTimerRef = useRef(null)

  const parsed = useMemo(() => (song ? parseSong(song.raw_text) : null), [song])
  const { isPlaying, progress, play, pause, restart } = useAutoScroll(containerRef, speed)
  const { bpm, tap } = useTapTempo()

  useEffect(() => {
    if (!song) return
    setSpeed(song.last_speed ?? 30)
    setFontSize(song.last_font_size ?? 28)
  }, [song?.id])

  useEffect(() => {
    if (bpm) setSpeed(Math.round(bpm * (PX_PER_BEAT / 60) * 10))
  }, [bpm])

  useEffect(() => {
    if (!song) return
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveSong({ ...song, last_speed: speed, last_font_size: fontSize })
    }, 1200)
    return () => clearTimeout(saveTimerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed, fontSize])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const nodes = Array.from(el.querySelectorAll('[data-chord]'))
    if (!nodes.length) return
    const containerRect = el.getBoundingClientRect()
    const focusY = el.scrollTop + el.clientHeight * 0.35
    let current = null
    for (const node of nodes) {
      const rect = node.getBoundingClientRect()
      const relTop = rect.top - containerRect.top + el.scrollTop
      if (relTop <= focusY) current = node.dataset.chord
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
        speed={speed}
        onSpeedChange={setSpeed}
        onTap={tap}
        bpm={bpm}
        progress={progress}
      />
    </div>
  )
}
