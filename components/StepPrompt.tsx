"use client"

import { useState, useEffect, useRef } from "react"

interface StepPromptProps {
  label: string
  prompt: string
  onPromptComplete?: () => void
  isReloaded?: boolean
  startDelay?: number
}

// Parse prompt into flat word list, tagging the last word of each paragraph
function parseWords(prompt: string): { text: string; afterParagraph: boolean }[] {
  const paragraphs = prompt
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const words: { text: string; afterParagraph: boolean }[] = []
  paragraphs.forEach((para, pIdx) => {
    const paraWords = para.split(" ").filter((w) => w.length > 0)
    paraWords.forEach((word, wIdx) => {
      words.push({
        text: word,
        afterParagraph: wIdx === paraWords.length - 1 && pIdx < paragraphs.length - 1,
      })
    })
  })
  return words
}

export function StepPrompt({ label, prompt, onPromptComplete, isReloaded, startDelay = 2200 }: StepPromptProps) {
  const words = parseWords(prompt)
  const paragraphs = prompt.split("\n").map((l) => l.trim()).filter((l) => l.length > 0)

  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [lineGroups, setLineGroups] = useState<number[][]>([])
  const [visibleGroups, setVisibleGroups] = useState<Set<number>>(new Set())
  const onCompleteRef = useRef(onPromptComplete)
  useEffect(() => { onCompleteRef.current = onPromptComplete }, [onPromptComplete])

  // Phase 1: measure visual lines after fonts + layout are ready
  useEffect(() => {
    if (isReloaded) {
      onCompleteRef.current?.()
      return
    }

    const measure = () => {
      const groups: number[][] = []
      let currentGroup: number[] = []
      let currentTop: number | null = null

      for (let i = 0; i < words.length; i++) {
        const ref = wordRefs.current[i]
        if (!ref) continue
        const top = Math.round(ref.getBoundingClientRect().top)
        if (currentTop === null || Math.abs(top - currentTop) <= 3) {
          if (currentTop === null) currentTop = top
          currentGroup.push(i)
        } else {
          if (currentGroup.length) groups.push([...currentGroup])
          currentGroup = [i]
          currentTop = top
        }
      }
      if (currentGroup.length) groups.push(currentGroup)
      setLineGroups(groups)
    }

    let cleanup: (() => void) | undefined
    if (typeof document !== "undefined" && document.fonts) {
      let timer: ReturnType<typeof setTimeout>
      document.fonts.ready.then(() => { timer = setTimeout(measure, 50) })
      cleanup = () => clearTimeout(timer)
    } else {
      const timer = setTimeout(measure, 200)
      cleanup = () => clearTimeout(timer)
    }
    return cleanup
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReloaded, words.length])

  // Phase 2: animate groups once measured
  useEffect(() => {
    if (isReloaded || lineGroups.length === 0) return

    const timers: ReturnType<typeof setTimeout>[] = []

    // Unique random gaps between lines: 1000–2000ms
    const gaps: number[] = []
    for (let i = 1; i < lineGroups.length; i++) {
      let gap: number
      do { gap = 1000 + Math.random() * 1000 }
      while (gaps.some((g) => Math.abs(g - gap) < 1))
      gaps.push(gap)
    }

    let delay = startDelay
    lineGroups.forEach((_, groupIdx) => {
      if (groupIdx > 0) delay += 1000 + gaps[groupIdx - 1]
      timers.push(setTimeout(() => {
        setVisibleGroups((prev) => new Set([...prev, groupIdx]))
      }, delay))
    })

    timers.push(setTimeout(() => onCompleteRef.current?.(), delay + 1000))

    return () => timers.forEach((t) => clearTimeout(t))
  }, [lineGroups, isReloaded, startDelay])

  return (
    <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col justify-start">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {/* {label} */}
      </p>
      <div
        className="text-left font-serif text-lg sm:text-xl md:text-2xl leading-relaxed text-black"
        style={{
          textShadow:
            "0 0 1px rgba(255,255,255,1), 0 0 2px rgba(255,255,255,1), 0 0 4px rgba(255,255,255,0.95), 0 0 10px rgba(255,255,255,0.85)",
        }}
      >
        {isReloaded ? (
          paragraphs.map((para, idx) => <p key={idx}>{para}</p>)
        ) : (
          <p>
            {words.map(({ text, afterParagraph }, wordIdx) => {
              const groupIdx = lineGroups.findIndex((g) => g.includes(wordIdx))
              const visible = groupIdx !== -1 && visibleGroups.has(groupIdx)
              return (
                <span key={wordIdx}>
                  <span
                    ref={(el) => { wordRefs.current[wordIdx] = el }}
                    className={`inline-block transition-all duration-1000 ${
                      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[10px] md:translate-y-[15px]"
                    }`}
                  >
                    {text}
                  </span>
                  {" "}
                  {afterParagraph && <br />}
                </span>
              )
            })}
          </p>
        )}
      </div>
    </div>
  )
}
