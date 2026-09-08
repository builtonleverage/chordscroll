export default function LyricsView({ song, fontSize = 28 }) {
  if (!song) return null

  return (
    <div className="max-w-3xl mx-auto px-8 pb-[50vh] pt-8" style={{ fontSize }}>
      {song.sections.map((section, sIdx) => (
        <div key={sIdx} className="mb-12">
          {section.label && (
            <div className="text-paper-faint text-xs uppercase tracking-[0.2em] font-sans mb-4">
              {section.label}
            </div>
          )}
          {section.lines.map((line, lIdx) =>
            line.isBlank ? (
              <div key={lIdx} className="h-6" />
            ) : (
              <div key={lIdx} className="flex flex-wrap leading-[2.6] font-sans">
                {line.words.map((word, wIdx) =>
                  word.isSpace ? (
                    <span key={wIdx}>&nbsp;</span>
                  ) : (
                    <span key={wIdx} className="relative inline-block mr-1">
                      {word.chord && (
                        <span
                          data-chord={word.chord}
                          className="absolute -top-6 left-0 text-accent font-serif font-medium text-[0.6em] whitespace-nowrap"
                        >
                          {word.chord}
                        </span>
                      )}
                      {word.text}
                    </span>
                  )
                )}
              </div>
            )
          )}
        </div>
      ))}
    </div>
  )
}
