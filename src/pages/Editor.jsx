import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth.jsx'
import { useSongs } from '../hooks/useSongs.js'
import { parseSong } from '../lib/chordParser.js'

const PLACEHOLDER = `## Verse 1
[C]What would I [Em]do without your [Am]smart [F]mouth
[C]Drawing me in, and you [Em]kicking me [Am]out [F]

## Chorus
[F]'Cause you're [C]hot then you're [G]cold
[F]You're yes then you're [C]no`

const INSTRUMENTS = [
  { id: 'piano', label: 'Piano' },
  { id: 'guitar', label: 'Guitar' },
  { id: 'ukulele', label: 'Ukulele' },
]

export default function Editor() {
  const { id } = useParams()
  const isNew = id === 'new'
  const { user } = useAuth()
  const { songs, saveSong } = useSongs(user?.id)
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [instrument, setInstrument] = useState('guitar')
  const [rawText, setRawText] = useState('')
  const [saving, setSaving] = useState(false)
  const [songId] = useState(() => (isNew ? crypto.randomUUID() : id))

  useEffect(() => {
    if (isNew) return
    const existing = songs.find((s) => s.id === id)
    if (existing) {
      setTitle(existing.title)
      setInstrument(existing.instrument)
      setRawText(existing.raw_text)
    }
  }, [isNew, id, songs])

  const parsed = parseSong(rawText)

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await saveSong({
        id: songId,
        user_id: user.id,
        title: title.trim(),
        instrument,
        raw_text: rawText,
      })
      navigate(`/play/${songId}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-screen px-6 md:px-10 py-8 max-w-3xl mx-auto"
    >
      <button
        onClick={() => navigate('/')}
        className="text-paper-faint hover:text-paper text-sm mb-6 transition-colors"
      >
        ← Back to library
      </button>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Song title"
        className="w-full bg-transparent font-serif text-3xl text-paper placeholder:text-paper-faint focus:outline-none mb-4 border-b border-ink-border focus:border-accent transition-colors pb-2"
      />

      <div className="flex gap-2 mb-6">
        {INSTRUMENTS.map((inst) => (
          <button
            key={inst.id}
            onClick={() => setInstrument(inst.id)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              instrument === inst.id
                ? 'bg-accent text-ink border-accent'
                : 'border-ink-border text-paper-dim hover:text-paper'
            }`}
          >
            {inst.label}
          </button>
        ))}
      </div>

      <textarea
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={16}
        className="w-full bg-ink-soft border border-ink-border rounded-lg px-4 py-3 text-paper font-mono text-sm placeholder:text-paper-faint/60 focus:outline-none focus:border-accent transition-colors resize-y"
      />

      {parsed.uniqueChords.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {parsed.uniqueChords.map((c) => (
            <span
              key={c}
              className="text-xs font-serif text-accent-bright border border-accent/30 rounded-full px-3 py-1"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !title.trim()}
        className="mt-8 bg-accent hover:bg-accent-bright disabled:opacity-50 text-ink font-medium rounded-lg px-6 py-3 transition-colors"
      >
        {saving ? 'Saving…' : 'Save song'}
      </button>
    </motion.div>
  )
}
