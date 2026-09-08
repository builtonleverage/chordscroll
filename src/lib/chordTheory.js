// Core music theory: chord name parsing, note math, semitone transposition.

export const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const NOTE_TO_SEMITONE = {
  C: 0, 'B#': 0,
  'C#': 1, Db: 1,
  D: 2,
  'D#': 3, Eb: 3,
  E: 4, Fb: 4,
  F: 5, 'E#': 5,
  'F#': 6, Gb: 6,
  G: 7,
  'G#': 8, Ab: 8,
  A: 9,
  'A#': 10, Bb: 10,
  B: 11, Cb: 11,
}

// Quality -> interval pattern (semitones from root)
export const QUALITY_INTERVALS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  '7': [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
}

// Fingering suggestion (basic triad = 5-3-1, extended chords add a finger)
export const QUALITY_FINGERING = {
  major: [1, 3, 5],
  minor: [1, 3, 5],
  '7': [1, 3, 5, 4],
  maj7: [1, 3, 5, 4],
  min7: [1, 3, 5, 4],
  sus2: [1, 2, 5],
  sus4: [1, 4, 5],
}

const CHORD_RE = /^([A-G])([#b]?)(maj7|min7|m7|sus2|sus4|maj|m|min|7)?/i

/**
 * Parse a chord name like "Am7", "C#sus4", "Bb" into { root, quality, semitone }.
 * quality is one of the keys in QUALITY_INTERVALS. Defaults to 'major'.
 */
export function parseChordName(name) {
  if (!name) return null
  const match = CHORD_RE.exec(name.trim())
  if (!match) return null
  const [, letter, accidental, rawQuality] = match
  const root = letter.toUpperCase() + accidental
  const semitone = NOTE_TO_SEMITONE[root]
  if (semitone === undefined) return null

  let quality = 'major'
  switch ((rawQuality || '').toLowerCase()) {
    case 'm':
    case 'min':
      quality = 'minor'
      break
    case 'maj7':
      quality = 'maj7'
      break
    case 'min7':
    case 'm7':
      quality = 'min7'
      break
    case 'sus2':
      quality = 'sus2'
      break
    case 'sus4':
      quality = 'sus4'
      break
    case '7':
      quality = '7'
      break
    case 'maj':
    case '':
    default:
      quality = 'major'
  }

  return { root, semitone, quality }
}

/**
 * Return the note names (with octave-free pitch classes) making up a chord.
 * e.g. chordToNotes('Am7') -> ['A', 'C', 'E', 'G']
 */
export function chordToNotes(chordName, { preferFlats = false } = {}) {
  const parsed = parseChordName(chordName)
  if (!parsed) return []
  const names = preferFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP
  const intervals = QUALITY_INTERVALS[parsed.quality] || QUALITY_INTERVALS.major
  return intervals.map((interval) => names[(parsed.semitone + interval) % 12])
}

export function getFingering(chordName) {
  const parsed = parseChordName(chordName)
  if (!parsed) return []
  return QUALITY_FINGERING[parsed.quality] || QUALITY_FINGERING.major
}

/** Transpose a chord name by N semitones, preserving quality/suffix formatting. */
export function transposeChordName(chordName, semitones, { preferFlats = false } = {}) {
  const parsed = parseChordName(chordName)
  if (!parsed) return chordName
  const names = preferFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP
  const newSemitone = ((parsed.semitone + semitones) % 12 + 12) % 12
  const newRoot = names[newSemitone]
  const suffix = chordName.trim().slice(parsed.root.length)
  return newRoot + suffix
}
