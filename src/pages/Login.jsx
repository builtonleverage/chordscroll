import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Login() {
  const { signIn, signUp, configured } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        setNotice('Check your email to confirm your account, then sign in.')
        setMode('signin')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <h1 className="font-serif text-3xl text-center mb-1 text-paper">ChordScroll</h1>
        <p className="text-center text-paper-faint text-sm mb-8">
          Lyrics and chords, hands-free.
        </p>

        {!configured && (
          <div className="mb-6 text-xs text-accent-bright bg-accent/10 border border-accent/30 rounded-lg px-4 py-3">
            Supabase isn't configured yet (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
            Add them to your environment to enable sign-in and cloud sync.
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-ink-soft border border-ink-border rounded-lg px-4 py-3 text-paper placeholder:text-paper-faint focus:outline-none focus:border-accent transition-colors"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-ink-soft border border-ink-border rounded-lg px-4 py-3 text-paper placeholder:text-paper-faint focus:outline-none focus:border-accent transition-colors"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}
          {notice && <p className="text-sm text-accent-bright">{notice}</p>}

          <button
            type="submit"
            disabled={busy || !configured}
            className="w-full bg-accent hover:bg-accent-bright disabled:opacity-50 text-ink font-medium rounded-lg py-3 transition-colors"
          >
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="w-full text-center text-sm text-paper-faint hover:text-paper mt-6 transition-colors"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </motion.div>
    </div>
  )
}
