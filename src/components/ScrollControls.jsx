import { motion } from 'framer-motion'

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 3.5v13l11-6.5-11-6.5z" />
    </svg>
  )
}
function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <rect x="4" y="3.5" width="4" height="13" rx="1" />
      <rect x="12" y="3.5" width="4" height="13" rx="1" />
    </svg>
  )
}
function RestartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 10a6 6 0 1 1 1.76 4.24" strokeLinecap="round" />
      <path d="M4 14v-4h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ScrollControls({
  isPlaying,
  onPlay,
  onPause,
  onRestart,
  speed,
  onSpeedChange,
  onTap,
  bpm,
  progress,
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-20">
      <div className="h-[2px] bg-ink-border/60">
        <motion.div
          className="h-full bg-accent"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.15, ease: 'linear' }}
        />
      </div>
      <div className="bg-ink/90 backdrop-blur border-t border-ink-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-6">
          <button
            onClick={onRestart}
            className="text-paper-dim hover:text-paper transition-colors p-2"
            aria-label="Restart"
          >
            <RestartIcon />
          </button>

          <button
            onClick={isPlaying ? onPause : onPlay}
            className="bg-accent text-ink rounded-full w-14 h-14 flex items-center justify-center shrink-0 shadow-soft hover:bg-accent-bright transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <div className="flex-1 flex items-center gap-3">
            <span className="text-paper-faint text-xs font-sans w-10">
              {speed.toFixed(0)}
            </span>
            <input
              type="range"
              min={5}
              max={120}
              step={1}
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="w-full accent-accent"
              aria-label="Scroll speed"
            />
          </div>

          <button
            onClick={onTap}
            className="text-xs font-sans text-paper-dim hover:text-paper border border-ink-border rounded-full px-3 py-2 transition-colors shrink-0"
          >
            {bpm ? `${bpm} bpm` : 'Tap tempo'}
          </button>
        </div>
      </div>
    </div>
  )
}
