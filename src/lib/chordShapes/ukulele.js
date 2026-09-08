// Ukulele chord-shape lookup: standard GCEA reentrant tuning.
// A handful of iconic, universally-taught open shapes are hardcoded; every
// other chord (all 12 roots x the full quality set) is derived algorithmically
// by placing each string on the nearest fret that sounds a tone of the chord,
// which is always harmonically correct even where no standard "beginner"
// shape is commonly published.

import { QUALITY_INTERVALS, parseChordName, NOTE_NAMES_SHARP } from '../chordTheory.js'

const OPEN_SHAPES = {
  C_major: { frets: [0, 0, 0, 3], fingers: [null, null, null, 3], baseFret: 1 },
  'C_7': { frets: [0, 0, 0, 1], fingers: [null, null, null, 1], baseFret: 1 },
  C_maj7: { frets: [0, 0, 0, 2], fingers: [null, null, null, 2], baseFret: 1 },
  G_major: { frets: [0, 2, 3, 2], fingers: [null, 1, 3, 2], baseFret: 1 },
  'G_7': { frets: [0, 2, 1, 2], fingers: [null, 2, 1, 3], baseFret: 1 },
  F_major: { frets: [2, 0, 1, 0], fingers: [2, null, 1, null], baseFret: 1 },
  A_major: { frets: [2, 1, 0, 0], fingers: [2, 1, null, null], baseFret: 1 },
  A_minor: { frets: [2, 0, 0, 0], fingers: [2, null, null, null], baseFret: 1 },
  D_major: { frets: [2, 2, 2, 0], fingers: [1, 2, 3, null], baseFret: 1 },
  D_minor: { frets: [2, 2, 1, 0], fingers: [2, 3, 1, null], baseFret: 1 },
}

// GCEA open pitch classes (C = 0)
const OPEN_PITCH_CLASSES = [7, 0, 4, 9]

function generateShape(rootSemitone, quality) {
  const intervals = QUALITY_INTERVALS[quality] || QUALITY_INTERVALS.major
  const chordTones = intervals.map((i) => (rootSemitone + i) % 12)

  const baseFrets = OPEN_PITCH_CLASSES.map((openPc, idx) => {
    const tone = chordTones[idx % chordTones.length]
    return (tone - openPc + 12) % 12
  })

  // Each string's fret is only fixed modulo 12 (the same pitch class repeats
  // every octave), so before settling on a shape, try raising each fretted
  // (non-open) string by a full octave and keep whichever combination packs
  // the tightest onto the neck — otherwise voicings that land far apart in
  // 0-11 space would sprawl across more frets than the diagram can show.
  const options = baseFrets.map((f) => (f === 0 ? [0] : [f, f + 12]))
  let best = null
  for (let mask = 0; mask < 1 << options.length; mask++) {
    const combo = options.map((opts, i) => opts[(mask >> i) & 1] ?? opts[0])
    const nz = combo.filter((f) => f > 0)
    if (!nz.length) continue
    const spread = Math.max(...nz) - Math.min(...nz)
    if (!best || spread < best.spread) best = { combo, spread }
  }
  const frets = best ? best.combo : baseFrets

  const nonZero = frets.filter((f) => f > 0)
  const baseFret = nonZero.length ? Math.min(...nonZero) : 1

  const order = frets
    .map((f, i) => ({ f, i }))
    .filter((entry) => entry.f > 0)
    .sort((a, b) => a.f - b.f)

  const fingers = new Array(4).fill(null)
  order.forEach((entry, rank) => {
    fingers[entry.i] = rank + 1
  })

  return { frets, fingers, baseFret }
}

export function getUkuleleShape(chordName) {
  const parsed = parseChordName(chordName)
  if (!parsed) return null
  const rootName = NOTE_NAMES_SHARP[parsed.semitone]
  const key = `${rootName}_${parsed.quality}`
  if (OPEN_SHAPES[key]) return OPEN_SHAPES[key]
  return generateShape(parsed.semitone, parsed.quality)
}
