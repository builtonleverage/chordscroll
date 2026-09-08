// Shared fretboard-diagram renderer for guitar (6 strings) and ukulele (4 strings).

const FRET_COUNT = 5
const STRING_GAP = 22
const FRET_GAP = 24
const TOP_PAD = 26
const SIDE_PAD = 14

export default function ChordBoxDiagram({ shape, highlighted = false }) {
  if (!shape) return null
  const { frets, fingers = [], baseFret = 1 } = shape
  const stringCount = frets.length
  const width = SIDE_PAD * 2 + STRING_GAP * (stringCount - 1)
  const height = TOP_PAD + FRET_GAP * FRET_COUNT + 10

  const activeStroke = highlighted ? 'stroke-accent-bright' : 'stroke-ink-border'
  const dotFill = highlighted ? 'fill-accent' : 'fill-accent/45'
  const nutOrBar = highlighted ? 'stroke-accent-bright' : 'stroke-paper-dim'

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="overflow-visible">
      {/* nut / base-fret label */}
      {baseFret > 1 ? (
        <text x={0} y={TOP_PAD - 8} className="fill-paper-dim" fontSize="11">
          {baseFret}fr
        </text>
      ) : (
        <rect x={SIDE_PAD - 2} y={TOP_PAD - 4} width={width - SIDE_PAD * 2 + 4} height={3} className={highlighted ? 'fill-accent-bright' : 'fill-paper-dim'} />
      )}

      {/* frets (horizontal lines) */}
      {Array.from({ length: FRET_COUNT + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={SIDE_PAD}
          x2={width - SIDE_PAD}
          y1={TOP_PAD + i * FRET_GAP}
          y2={TOP_PAD + i * FRET_GAP}
          className={i === 0 ? nutOrBar : 'stroke-ink-border'}
          strokeWidth={i === 0 && baseFret === 1 ? 0 : 1}
        />
      ))}

      {/* strings (vertical lines) */}
      {Array.from({ length: stringCount }).map((_, i) => (
        <line
          key={`string-${i}`}
          x1={SIDE_PAD + i * STRING_GAP}
          x2={SIDE_PAD + i * STRING_GAP}
          y1={TOP_PAD}
          y2={TOP_PAD + FRET_GAP * FRET_COUNT}
          className={activeStroke}
          strokeWidth={1}
        />
      ))}

      {/* open / muted markers above the nut */}
      {frets.map((f, i) => {
        const x = SIDE_PAD + i * STRING_GAP
        if (f === 'x') {
          return (
            <text key={`marker-${i}`} x={x} y={TOP_PAD - 10} textAnchor="middle" className="fill-paper-dim" fontSize="12">
              &times;
            </text>
          )
        }
        if (f === 0) {
          return (
            <circle
              key={`marker-${i}`}
              cx={x}
              cy={TOP_PAD - 10}
              r={4}
              className={highlighted ? 'fill-none stroke-accent-bright' : 'fill-none stroke-paper-dim'}
              strokeWidth={1.5}
            />
          )
        }
        return null
      })}

      {/* fingered dots */}
      {frets.map((f, i) => {
        if (f === 'x' || f === 0) return null
        const relFret = f - baseFret + 1
        const x = SIDE_PAD + i * STRING_GAP
        const y = TOP_PAD + FRET_GAP * (relFret - 0.5)
        return (
          <g key={`dot-${i}`}>
            <circle cx={x} cy={y} r={8} className={dotFill} />
            {fingers[i] && (
              <text x={x} y={y + 4} textAnchor="middle" className="fill-ink" fontSize="10" fontWeight="700">
                {fingers[i]}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
