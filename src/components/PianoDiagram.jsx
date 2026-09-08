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

const WHITE_W = 34
const WHITE_H = 120
const BLACK_W = 20
const BLACK_H = 74

export default function PianoDiagram({ chordName, highlighted = false }) {
  const notes = chordToNotes(chordName)
  const fingering = getFingering(chordName)
  const pcSet = new Set(notes.map((n) => NOTE_NAMES_SHARP.indexOf(n)))
  const fingerByPc = {}
  notes.forEach((n, i) => {
    fingerByPc[NOTE_NAMES_SHARP.indexOf(n)] = fingering[i]
  })

  const width = WHITE_W * 7

  return (
    <svg
      viewBox={`0 0 ${width} ${WHITE_H}`}
      width={width}
      height={WHITE_H}
      className="overflow-visible"
    >
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
                y={WHITE_H - 14}
                textAnchor="middle"
                className={highlighted ? 'fill-ink' : 'fill-ink/70'}
                fontSize="12"
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
                y={BLACK_H - 10}
                textAnchor="middle"
                className="fill-paper"
                fontSize="10"
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
