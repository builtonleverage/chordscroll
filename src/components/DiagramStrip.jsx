import { motion } from 'framer-motion'
import PianoDiagram from './PianoDiagram.jsx'
import GuitarDiagram from './GuitarDiagram.jsx'
import UkuleleDiagram from './UkuleleDiagram.jsx'

const RENDERERS = {
  piano: PianoDiagram,
  guitar: GuitarDiagram,
  ukulele: UkuleleDiagram,
}

export default function DiagramStrip({ chords, instrument, currentChord }) {
  const Renderer = RENDERERS[instrument]
  if (!Renderer || !chords?.length) return null

  return (
    <div className="flex gap-6 overflow-x-auto scrollbar-none px-6 py-4">
      {chords.map((chord) => {
        const active = chord === currentChord
        return (
          <motion.div
            key={chord}
            initial={false}
            animate={{ opacity: active ? 1 : 0.45, scale: active ? 1.05 : 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col items-center gap-2 shrink-0"
          >
            <Renderer chordName={chord} highlighted={active} />
            <span
              className={`font-serif text-sm tracking-wide ${
                active ? 'text-accent-bright' : 'text-paper-faint'
              }`}
            >
              {chord}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
