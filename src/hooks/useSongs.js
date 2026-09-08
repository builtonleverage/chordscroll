import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getCachedSongs,
  setCachedSongs,
  fetchRemoteSongs,
  upsertRemoteSong,
  deleteRemoteSong,
} from '../lib/songsApi.js'
import { supabaseConfigured } from '../lib/supabaseClient.js'

/**
 * Cloud-backed song library with instant local cache and optimistic writes.
 * `syncState` is 'idle' | 'saving' | 'saved' | 'error', for a subtle indicator.
 */
export function useSongs(userId) {
  const [songs, setSongs] = useState(() => (userId ? getCachedSongs(userId) : []))
  const [loading, setLoading] = useState(true)
  const [syncState, setSyncState] = useState('idle')
  const savedTimerRef = useRef(null)

  useEffect(() => {
    if (!userId) {
      setSongs([])
      setLoading(false)
      return
    }
    setSongs(getCachedSongs(userId))
    setLoading(true)
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }
    fetchRemoteSongs(userId)
      .then((remote) => {
        setSongs(remote)
        setCachedSongs(userId, remote)
      })
      .catch(() => {
        // offline or misconfigured: keep serving the cache
      })
      .finally(() => setLoading(false))
  }, [userId])

  const flashSaved = () => {
    setSyncState('saved')
    clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(() => setSyncState('idle'), 1800)
  }

  const saveSong = useCallback(
    async (song) => {
      const optimistic = { ...song, updated_at: new Date().toISOString() }
      setSongs((prev) => {
        const next = [optimistic, ...prev.filter((s) => s.id !== song.id)]
        setCachedSongs(userId, next)
        return next
      })
      setSyncState('saving')
      try {
        const saved = await upsertRemoteSong(song)
        setSongs((prev) => {
          const next = [saved, ...prev.filter((s) => s.id !== saved.id)]
          setCachedSongs(userId, next)
          return next
        })
        flashSaved()
        return saved
      } catch (err) {
        setSyncState('error')
        throw err
      }
    },
    [userId]
  )

  const removeSong = useCallback(
    async (id) => {
      const prevSongs = songs
      setSongs((prev) => {
        const next = prev.filter((s) => s.id !== id)
        setCachedSongs(userId, next)
        return next
      })
      try {
        await deleteRemoteSong(id)
      } catch (err) {
        setSongs(prevSongs)
        setCachedSongs(userId, prevSongs)
        throw err
      }
    },
    [songs, userId]
  )

  return { songs, loading, syncState, saveSong, removeSong }
}
