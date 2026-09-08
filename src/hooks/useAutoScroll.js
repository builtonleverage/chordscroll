import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * requestAnimationFrame-driven smooth auto-scroll for a scrollable container.
 * speedPxPerSec controls how fast the container scrolls. Manual scroll/touch
 * input pauses playback automatically; resume only happens via play().
 */
export function useAutoScroll(containerRef, speedPxPerSec) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const rafRef = useRef(null)
  const lastTsRef = useRef(null)
  const speedRef = useRef(speedPxPerSec)
  const programmaticRef = useRef(false)
  const suppressUntilRef = useRef(0)

  useEffect(() => {
    speedRef.current = speedPxPerSec
  }, [speedPxPerSec])

  const updateProgress = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    setProgress(max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0)
  }, [containerRef])

  const step = useCallback(
    (ts) => {
      const el = containerRef.current
      if (!el) return
      if (lastTsRef.current == null) lastTsRef.current = ts
      const dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts

      const max = el.scrollHeight - el.clientHeight
      const next = el.scrollTop + speedRef.current * dt

      if (max <= 0 || next >= max) {
        el.scrollTop = Math.max(0, max)
        updateProgress()
        setIsPlaying(false)
        return
      }

      programmaticRef.current = true
      suppressUntilRef.current = performance.now() + 50
      el.scrollTop = next
      updateProgress()
      rafRef.current = requestAnimationFrame(step)
    },
    [containerRef, updateProgress]
  )

  const play = useCallback(() => {
    lastTsRef.current = null
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const restart = useCallback(() => {
    const el = containerRef.current
    if (el) el.scrollTop = 0
    lastTsRef.current = null
    updateProgress()
  }, [containerRef, updateProgress])

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, step])

  // Manual interaction pauses playback. We ignore scroll events for a brief
  // window after our own programmatic writes so they aren't mistaken for
  // manual input.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleUserGesture = () => {
      if (performance.now() < suppressUntilRef.current) return
      setIsPlaying(false)
    }
    const handleScroll = () => {
      if (performance.now() < suppressUntilRef.current) {
        updateProgress()
        return
      }
      updateProgress()
      setIsPlaying(false)
    }

    el.addEventListener('wheel', handleUserGesture, { passive: true })
    el.addEventListener('touchstart', handleUserGesture, { passive: true })
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      el.removeEventListener('wheel', handleUserGesture)
      el.removeEventListener('touchstart', handleUserGesture)
      el.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef, updateProgress])

  return { isPlaying, progress, play, pause, restart }
}
