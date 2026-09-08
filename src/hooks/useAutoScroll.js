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
  const suppressUntilRef = useRef(0)
  // The browser rounds el.scrollTop to the nearest integer pixel, so reading
  // it back as the basis for the next frame's increment would round away any
  // sub-pixel movement every frame - at slower speeds (speed/60fps < 0.5px)
  // that means the scroll never advances at all. This ref tracks the true
  // fractional position independently of what the browser reports back.
  const posRef = useRef(0)

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
      const next = posRef.current + speedRef.current * dt

      if (max <= 0 || next >= max) {
        posRef.current = Math.max(0, max)
        el.scrollTop = posRef.current
        updateProgress()
        setIsPlaying(false)
        return
      }

      posRef.current = next
      suppressUntilRef.current = performance.now() + 50
      el.scrollTop = next
      updateProgress()
      rafRef.current = requestAnimationFrame(step)
    },
    [containerRef, updateProgress]
  )

  const play = useCallback(() => {
    const el = containerRef.current
    // Pick up from wherever the container actually is (e.g. after a manual
    // scroll) rather than the last position we remember writing.
    posRef.current = el ? el.scrollTop : 0
    lastTsRef.current = null
    setIsPlaying(true)
  }, [containerRef])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const restart = useCallback(() => {
    const el = containerRef.current
    if (el) el.scrollTop = 0
    posRef.current = 0
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
