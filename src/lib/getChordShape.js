import { chordToNotes, getFingering } from './chordTheory.js'
import { getGuitarShape } from './chordShapes/guitar.js'
import { getUkuleleShape } from './chordShapes/ukulele.js'

/**
 * Shared interface consumed by all three diagram renderers.
 * getChordShape('Am7', 'guitar') -> instrument-specific shape data, or null
 * if the chord name couldn't be parsed.
 */
export function getChordShape(chordName, instrument) {
  switch (instrument) {
    case 'piano': {
      const notes = chordToNotes(chordName)
      if (!notes.length) return null
      const fingering = getFingering(chordName)
      return { instrument, notes, fingering }
    }
    case 'guitar': {
      const shape = getGuitarShape(chordName)
      if (!shape) return null
      return { instrument, ...shape }
    }
    case 'ukulele': {
      const shape = getUkuleleShape(chordName)
      if (!shape) return null
      return { instrument, ...shape }
    }
    default:
      return null
  }
}
