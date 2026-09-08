import { supabase, supabaseConfigured } from './supabaseClient.js'

const cacheKey = (userId) => `chordscroll:songs:${userId}`

export function getCachedSongs(userId) {
  try {
    const raw = localStorage.getItem(cacheKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function setCachedSongs(userId, songs) {
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(songs))
  } catch {
    // storage unavailable (private mode, quota) - cache is best-effort
  }
}

export async function fetchRemoteSongs(userId) {
  if (!supabaseConfigured) return []
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function upsertRemoteSong(song) {
  if (!supabaseConfigured) return song
  const { data, error } = await supabase
    .from('songs')
    .upsert({ ...song, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRemoteSong(id) {
  if (!supabaseConfigured) return
  const { error } = await supabase.from('songs').delete().eq('id', id)
  if (error) throw error
}
