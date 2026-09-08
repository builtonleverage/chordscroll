import { useCallback, useRef, useState } from 'react'

const MAX_TAPS = 8
const RESET_GAP_MS = 2000

/** Tap tempo: average the intervals between the last several taps into a BPM. */
export function useTapTempo() {
  const [bpm, setBpm] = useState(null)
  const tapsRef = useRef([])

  const tap = useCallback(() => {
    const now = performance.now()
    const taps = tapsRef.current
    if (taps.length && now - taps[taps.length - 1] > RESET_GAP_MS) {
      taps.length = 0
    }
    taps.push(now)
    if (taps.length > MAX_TAPS) taps.shift()

    if (taps.length >= 2) {
      const intervals = []
      for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1])
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
      setBpm(Math.round(60000 / avg))
    }
  }, [])

  const reset = useCallback(() => {
    tapsRef.current = []
    setBpm(null)
  }, [])

  return { bpm, tap, reset }
}
