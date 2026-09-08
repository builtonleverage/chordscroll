// Guitar chord-shape lookup: standard tuning (E A D G B e), low to high.
// Frets: 'x' = muted, 0 = open, N = fretted at N (relative to baseFret).
// Explicit, well-known open-position voicings are hardcoded for natural-note
// roots; everything else (sharps/flats, and qualities without a common open
// form) falls back to a movable E-shape or A-shape barre template, picking
// whichever lands on the lower fret.

import { NOTE_NAMES_SHARP, parseChordName } from '../chordTheory.js'

const X = 'x'

// key: `${root}_${quality}` using sharp-note spelling, root as in NOTE_NAMES_SHARP
const OPEN_SHAPES = {
  C_major: { frets: [X, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], baseFret: 1 },
  'C_7': { frets: [X, 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], baseFret: 1 },
  C_maj7: { frets: [X, 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null], baseFret: 1 },
  C_sus4: { frets: [X, 3, 3, 0, 1, 0], fingers: [null, 3, 4, null, 1, null], baseFret: 1 },

  D_major: { frets: [X, X, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], baseFret: 1 },
  D_minor: { frets: [X, X, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], baseFret: 1 },
  'D_7': { frets: [X, X, 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], baseFret: 1 },
  D_maj7: { frets: [X, X, 0, 2, 2, 2], fingers: [null, null, null, 1, 1, 1], baseFret: 1 },
  D_min7: { frets: [X, X, 0, 2, 1, 1], fingers: [null, null, null, 3, 1, 1], baseFret: 1 },
  D_sus2: { frets: [X, X, 0, 2, 3, 0], fingers: [null, null, null, 1, 3, null], baseFret: 1 },
  D_sus4: { frets: [X, X, 0, 2, 3, 3], fingers: [null, null, null, 1, 3, 4], baseFret: 1 },

  E_major: { frets: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], baseFret: 1 },
  E_minor: { frets: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], baseFret: 1 },
  'E_7': { frets: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], baseFret: 1 },
  E_maj7: { frets: [0, 2, 1, 1, 0, 0], fingers: [null, 3, 1, 2, null, null], baseFret: 1 },
  E_min7: { frets: [0, 2, 0, 0, 0, 0], fingers: [null, 2, null, null, null, null], baseFret: 1 },
  E_sus4: { frets: [0, 2, 2, 2, 0, 0], fingers: [null, 2, 3, 4, null, null], baseFret: 1 },

  F_maj7: { frets: [X, X, 3, 2, 1, 0], fingers: [null, null, 4, 2, 1, null], baseFret: 1 },

  G_major: { frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], baseFret: 1 },
  'G_7': { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1], baseFret: 1 },

  A_major: { frets: [X, 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], baseFret: 1 },
  A_minor: { frets: [X, 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], baseFret: 1 },
  'A_7': { frets: [X, 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], baseFret: 1 },
  A_maj7: { frets: [X, 0, 2, 1, 2, 0], fingers: [null, null, 3, 1, 2, null], baseFret: 1 },
  A_min7: { frets: [X, 0, 2, 0, 1, 0], fingers: [null, null, 2, null, 1, null], baseFret: 1 },
  A_sus2: { frets: [X, 0, 2, 2, 0, 0], fingers: [null, null, 1, 2, null, null], baseFret: 1 },
  A_sus4: { frets: [X, 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 3, null], baseFret: 1 },
}

// Movable barre templates. offsets are relative to the barre fret; the barre
// (finger 1) covers every string that isn't muted.
const E_SHAPE = {
  major: { offsets: [0, 2, 2, 1, 0, 0], fingers: [1, 3, 4, 2, 1, 1] },
  minor: { offsets: [0, 2, 2, 0, 0, 0], fingers: [1, 3, 4, 1, 1, 1] },
  '7': { offsets: [0, 2, 0, 1, 0, 0], fingers: [1, 3, 1, 2, 1, 1] },
  maj7: { offsets: [0, 2, 1, 1, 0, 0], fingers: [1, 4, 2, 3, 1, 1] },
  min7: { offsets: [0, 2, 0, 0, 0, 0], fingers: [1, 3, 1, 1, 1, 1] },
}

const A_SHAPE = {
  major: { offsets: [X, 0, 2, 2, 2, 0], fingers: [null, 1, 3, 4, 2, 1] },
  minor: { offsets: [X, 0, 2, 2, 1, 0], fingers: [null, 1, 3, 4, 2, 1] },
  '7': { offsets: [X, 0, 2, 0, 2, 0], fingers: [null, 1, 3, 1, 4, 1] },
  maj7: { offsets: [X, 0, 2, 1, 2, 0], fingers: [null, 1, 3, 2, 4, 1] },
  min7: { offsets: [X, 0, 2, 0, 1, 0], fingers: [null, 1, 3, 1, 2, 1] },
  sus2: { offsets: [X, 0, 2, 2, 0, 0], fingers: [null, 1, 3, 4, 1, 1] },
  sus4: { offsets: [X, 0, 2, 2, 3, 0], fingers: [null, 1, 2, 3, 4, 1] },
}

const E_ROOT_SEMITONE = 4
const A_ROOT_SEMITONE = 9

function buildBarre(template, fret) {
  const frets = template.offsets.map((o) => (o === X ? X : o + fret))
  return { frets, fingers: template.fingers, baseFret: fret > 1 ? fret : 1 }
}

export function getGuitarShape(chordName) {
  const parsed = parseChordName(chordName)
  if (!parsed) return null
  const rootName = NOTE_NAMES_SHARP[parsed.semitone]
  const key = `${rootName}_${parsed.quality}`

  if (OPEN_SHAPES[key]) return OPEN_SHAPES[key]

  const eFret = ((parsed.semitone - E_ROOT_SEMITONE) % 12 + 12) % 12
  const aFret = ((parsed.semitone - A_ROOT_SEMITONE) % 12 + 12) % 12

  const eTemplate = E_SHAPE[parsed.quality]
  const aTemplate = A_SHAPE[parsed.quality]

  const candidates = []
  if (eTemplate && eFret > 0) candidates.push(buildBarre(eTemplate, eFret))
  if (aTemplate && aFret > 0) candidates.push(buildBarre(aTemplate, aFret))
  // sus2/sus4 have no E-shape template; if root lands on fret 0 for A-shape
  // (i.e. root is A) fall through to the open A table instead.
  if (!candidates.length && aTemplate) candidates.push(buildBarre(aTemplate, aFret || 12))

  if (!candidates.length) return null
  candidates.sort((a, b) => a.baseFret - b.baseFret)
  return candidates[0]
}
