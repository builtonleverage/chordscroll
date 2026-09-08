import { chordToNotes, getFingering, NOTE_NAMES_SHARP } from '../lib/chordTheory.js'

const WHITE_KEYS = [
  { name: 'C', pc: 0 },
  { name: 'D', pc: 2 },
  { name: 'E', pc: 4 },
  { name: 'F', pc: 5 },
  { name: 'G', pc: 7 },
  { name: 'A', pc: 9 },
  { name: 'B', pc: 11 },
]

// black key pitch class -> x position (fraction between white index i and i+1)
const BLACK_KEYS = [
  { pc: 1, afterWhite: 0 },
  { pc: 3, afterWhite: 1 },
  { pc: 6, afterWhite: 3 },
  { pc: 8, afterWhite: 4 },
  { pc: 10, afterWhite: 5 },
]

const WHITE_W = 30
const WHITE_H = 84
const BLACK_W = 18
const BLACK_H = 52
const WIDTH = WHITE_W * 7

function MiniKeyboard({ pcSet, fingerByPc, highlighted }) {
  return (
    <svg viewBox={`0 0 ${WIDTH} ${WHITE_H}`} width={WIDTH} height={WHITE_H} className="overflow-visible">
      {WHITE_KEYS.map((key, i) => {
        const active = pcSet.has(key.pc)
        return (
          <g key={key.name}>
            <rect
              x={i * WHITE_W}
              y={0}
              width={WHITE_W - 1}
              height={WHITE_H}
              rx={3}
              className={
                active
                  ? highlighted
                    ? 'fill-accent stroke-accent-bright transition-colors duration-300'
                    : 'fill-accent/40 stroke-accent-dim transition-colors duration-300'
                  : 'fill-paper stroke-ink-border transition-colors duration-300'
              }
              strokeWidth={1}
            />
            {active && fingerByPc[key.pc] && (
              <text
                x={i * WHITE_W + WHITE_W / 2}
                y={WHITE_H - 12}
                textAnchor="middle"
                className={highlighted ? 'fill-ink' : 'fill-ink/70'}
                fontSize="11"
                fontWeight="600"
              >
                {fingerByPc[key.pc]}
              </text>
            )}
          </g>
        )
      })}
      {BLACK_KEYS.map((key) => {
        const active = pcSet.has(key.pc)
        const x = (key.afterWhite + 1) * WHITE_W - BLACK_W / 2
        return (
          <g key={key.pc}>
            <rect
              x={x}
              y={0}
              width={BLACK_W}
              height={BLACK_H}
              rx={2}
              className={
                active
                  ? highlighted
                    ? 'fill-accent stroke-accent-bright transition-colors duration-300'
                    : 'fill-accent/50 stroke-accent-dim transition-colors duration-300'
                  : 'fill-ink stroke-ink-border transition-colors duration-300'
              }
              strokeWidth={1}
            />
            {active && fingerByPc[key.pc] && (
              <text
                x={x + BLACK_W / 2}
                y={BLACK_H - 8}
                textAnchor="middle"
                className="fill-paper"
                fontSize="9"
                fontWeight="600"
              >
                {fingerByPc[key.pc]}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function HandLabel({ children, highlighted }) {
  return (
    <span
      className={`text-[0.6rem] font-sans font-semibold tracking-wider uppercase ${
        highlighted ? 'text-accent-bright' : 'text-paper-faint'
      }`}
    >
      {children}
    </span>
  )
}

/**
 * Shows both hands separately, matching standard lead-sheet piano technique:
 * the left hand plays the bass root, the right hand plays the full chord
 * voicing. Each hand gets its own mini keyboard and finger number so the
 * two movements read independently at a glance.
 */
export default function PianoDiagram({ chordName, highlighted = false }) {
  const notes = chordToNotes(chordName)
  const fingering = getFingering(chordName)
  if (!notes.length) return null

  const rightPcSet = new Set(notes.map((n) => NOTE_NAMES_SHARP.indexOf(n)))
  const rightFingerByPc = {}
  notes.forEach((n, i) => {
    rightFingerByPc[NOTE_NAMES_SHARP.indexOf(n)] = fingering[i]
  })

  const rootPc = NOTE_NAMES_SHARP.indexOf(notes[0])
  const leftPcSet = new Set([rootPc])
  const leftFingerByPc = { [rootPc]: 5 }

  return (
    <div className="flex flex-col gap-1 items-start">
      <div className="flex items-center gap-2">
        <HandLabel highlighted={highlighted}>L</HandLabel>
        <MiniKeyboard pcSet={leftPcSet} fingerByPc={leftFingerByPc} highlighted={highlighted} />
      </div>
      <div className="flex items-center gap-2">
        <HandLabel highlighted={highlighted}>R</HandLabel>
        <MiniKeyboard pcSet={rightPcSet} fingerByPc={rightFingerByPc} highlighted={highlighted} />
      </div>
    </div>
  )
}
