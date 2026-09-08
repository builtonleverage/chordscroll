// Parses bracket-notation song text into a structured song for rendering.
//
// Input:
//   ## Verse 1
//   [C]What would I [Em]do without your [Am]smart [F]mouth
//
// Output shape:
//   {
//     sections: [
//       { label: 'Verse 1', lines: [ { words: [{ text, chord }] } ] }
//     ],
//     uniqueChords: ['C', 'Em', 'Am', 'F'],
//   }

const SECTION_RE = /^##\s*(.+)$/
const CHORD_TOKEN_RE = /\[([^\]]+)\]/g

function parseLine(line) {
  const words = []
  let lastIndex = 0
  let pendingChord = null
  let match

  CHORD_TOKEN_RE.lastIndex = 0
  const segments = []
  while ((match = CHORD_TOKEN_RE.exec(line)) !== null) {
    segments.push({ type: 'text', value: line.slice(lastIndex, match.index) })
    segments.push({ type: 'chord', value: match[1] })
    lastIndex = CHORD_TOKEN_RE.lastIndex
  }
  segments.push({ type: 'text', value: line.slice(lastIndex) })

  // Merge each chord with the text that follows it, splitting text on whitespace
  // so each word carries at most one leading chord.
  for (const segment of segments) {
    if (segment.type === 'chord') {
      pendingChord = segment.value
      continue
    }
    const chunks = segment.value.split(/(\s+)/).filter((s) => s.length)
    chunks.forEach((chunk, i) => {
      if (/^\s+$/.test(chunk)) {
        words.push({ text: ' ', chord: null, isSpace: true })
        return
      }
      words.push({
        text: chunk,
        chord: i === 0 ? pendingChord : null,
      })
      if (i === 0) pendingChord = null
    })
  }

  // Trailing chord with no following text (e.g. line ends "...mouth [G]")
  if (pendingChord) {
    words.push({ text: '', chord: pendingChord })
  }

  return { words, raw: line }
}

export function parseSong(rawText) {
  const lines = (rawText || '').replace(/\r\n/g, '\n').split('\n')
  const sections = []
  const uniqueChords = []
  const seen = new Set()

  let current = { label: null, lines: [] }
  let hasContent = false

  const pushCurrent = () => {
    if (current.lines.length || current.label) {
      sections.push(current)
    }
  }

  for (const rawLine of lines) {
    const sectionMatch = SECTION_RE.exec(rawLine.trim())
    if (sectionMatch) {
      if (hasContent || current.label) pushCurrent()
      current = { label: sectionMatch[1].trim(), lines: [] }
      hasContent = false
      continue
    }
    if (rawLine.trim() === '') {
      current.lines.push({ words: [], raw: '', isBlank: true })
      continue
    }
    hasContent = true
    const parsed = parseLine(rawLine)
    for (const word of parsed.words) {
      if (word.chord && !seen.has(word.chord)) {
        seen.add(word.chord)
        uniqueChords.push(word.chord)
      }
    }
    current.lines.push(parsed)
  }
  pushCurrent()

  return { sections, uniqueChords }
}
