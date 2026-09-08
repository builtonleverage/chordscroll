import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth.jsx'
import { useSongs } from '../hooks/useSongs.js'

const INSTRUMENT_LABEL = { piano: 'Piano', guitar: 'Guitar', ukulele: 'Ukulele' }

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export default function Library() {
  const { user, signOut } = useAuth()
  const { songs, loading, syncState, removeSong } = useSongs(user?.id)
  const [query, setQuery] = useState('')
  const [instrumentFilter, setInstrumentFilter] = useState('all')
  const [confirmId, setConfirmId] = useState(null)
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    return songs.filter((s) => {
      const matchesQuery = s.title.toLowerCase().includes(query.toLowerCase())
      const matchesInstrument = instrumentFilter === 'all' || s.instrument === instrumentFilter
      return matchesQuery && matchesInstrument
    })
  }, [songs, query, instrumentFilter])

  return (
    <div className="min-h-screen px-6 md:px-10 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-paper">My Songs</h1>
          {syncState === 'saving' && <span className="text-xs text-paper-faint">syncing…</span>}
          {syncState === 'saved' && <span className="text-xs text-accent-bright">saved</span>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/song/new')}
            className="bg-accent hover:bg-accent-bright text-ink font-medium rounded-lg px-4 py-2 text-sm transition-colors"
          >
            New song
          </button>
          <button
            onClick={signOut}
            className="text-paper-faint hover:text-paper text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs…"
          className="flex-1 bg-ink-soft border border-ink-border rounded-lg px-4 py-2.5 text-paper placeholder:text-paper-faint focus:outline-none focus:border-accent transition-colors"
        />
        <select
          value={instrumentFilter}
          onChange={(e) => setInstrumentFilter(e.target.value)}
          className="bg-ink-soft border border-ink-border rounded-lg px-4 py-2.5 text-paper focus:outline-none focus:border-accent transition-colors"
        >
          <option value="all">All instruments</option>
          <option value="piano">Piano</option>
          <option value="guitar">Guitar</option>
          <option value="ukulele">Ukulele</option>
        </select>
      </div>

      {loading && songs.length === 0 && (
        <p className="text-paper-faint text-sm">Loading your songs…</p>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-paper-faint text-sm">No songs yet. Create your first one.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((song) => (
            <motion.div
              key={song.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-ink-soft border border-ink-border rounded-xl p-5 hover:border-accent/40 transition-colors group"
            >
              <button className="text-left w-full" onClick={() => navigate(`/play/${song.id}`)}>
                <h3 className="font-serif text-lg text-paper mb-1 truncate">{song.title}</h3>
                <p className="text-xs text-paper-faint uppercase tracking-wide">
                  {INSTRUMENT_LABEL[song.instrument]} · {timeAgo(song.updated_at)}
                </p>
              </button>
              <div className="flex items-center gap-4 mt-4 text-xs">
                <button
                  onClick={() => navigate(`/song/${song.id}`)}
                  className="text-paper-faint hover:text-accent-bright transition-colors"
                >
                  Edit
                </button>
                {confirmId === song.id ? (
                  <span className="flex items-center gap-2">
                    <span className="text-paper-faint">Delete?</span>
                    <button
                      onClick={() => {
                        removeSong(song.id)
                        setConfirmId(null)
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      Yes
                    </button>
                    <button onClick={() => setConfirmId(null)} className="text-paper-faint hover:text-paper">
                      No
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmId(song.id)}
                    className="text-paper-faint hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
