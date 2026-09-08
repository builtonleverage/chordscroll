import ChordBoxDiagram from './ChordBoxDiagram.jsx'
import { getUkuleleShape } from '../lib/chordShapes/ukulele.js'

export default function UkuleleDiagram({ chordName, highlighted = false }) {
  const shape = getUkuleleShape(chordName)
  return <ChordBoxDiagram shape={shape} highlighted={highlighted} />
}
