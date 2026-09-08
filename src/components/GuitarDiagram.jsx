import ChordBoxDiagram from './ChordBoxDiagram.jsx'
import { getGuitarShape } from '../lib/chordShapes/guitar.js'

export default function GuitarDiagram({ chordName, highlighted = false }) {
  const shape = getGuitarShape(chordName)
  return <ChordBoxDiagram shape={shape} highlighted={highlighted} />
}
