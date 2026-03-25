"use client"

import { useState, useEffect } from "react"

interface StepPromptProps {
  label: string
  prompt: string
  onPromptComplete?: () => void
  isReloaded?: boolean
}

export function StepPrompt({ label, prompt, onPromptComplete, isReloaded }: StepPromptProps) {
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  
  const lines = prompt
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
  
  useEffect(() => {
    // If this is a reload, show all lines immediately
    if (isReloaded) {
      const allLineIndices = lines.map((_, idx) => idx)
      setVisibleLines(allLineIndices)
      if (onPromptComplete) {
        onPromptComplete()
      }
      return
    }

    // Display each line with fade-in animation
    // Each line appears after previous line finishes fading (2000ms) + unique random 1-2s delay
    // Ensure all intervals on this page render are different from each other
    const timers: ReturnType<typeof setTimeout>[] = []
    // First line starts 1 second after page load
    let cumulativeDelay = 3000

    // Generate unique random intervals for all statements (except first)
    const intervals: number[] = []
    for (let i = 1; i < lines.length; i++) {
      let randomInterval: number
      // Ensure this interval is not equal to any previous interval
      do {
        randomInterval = 1000 + Math.random() * 1000
      } while (intervals.some(interval => Math.abs(interval - randomInterval) < 1)) // tolerance of 1ms
      intervals.push(randomInterval)
    }

    let maxDelay = 0

    lines.forEach((_, idx) => {
      if (idx > 0) {
        // Add fade duration + unique random interval between 1-2 seconds
        cumulativeDelay += 2000 + intervals[idx - 1]
      }
      
      maxDelay = cumulativeDelay

      timers.push(
        setTimeout(() => {
          setVisibleLines((prev) => [...prev, idx])
        }, cumulativeDelay)
      )
    })

    // Fire callback after all lines are fully displayed (last line finishes fading in)
    if (onPromptComplete) {
      timers.push(
        setTimeout(() => {
          onPromptComplete()
        }, maxDelay + 2000)
      )
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [lines.length, onPromptComplete, isReloaded])

  return (
    <div className="mb-8 flex flex-col justify-start">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {/* {label} */}
      </p>
      <div className="text-left font-serif text-xl leading-relaxed text-foreground md:text-2xl">
        {lines.map((line, idx) => (
          <p
            key={idx}
            className={`transition-all duration-1000 ${
              visibleLines.includes(idx) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[15px]"
            }`}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
 