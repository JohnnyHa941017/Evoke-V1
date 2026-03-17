"use client"

import { useState, useEffect } from "react"

interface StepPromptProps {
  label: string
  prompt: string
}

export function StepPrompt({ label, prompt }: StepPromptProps) {
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  
  const lines = prompt
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
  
  useEffect(() => {
    // Display each line with fade-in animation
    const timers = lines.map((_, idx) => {
      return setTimeout(() => {
        setVisibleLines((prev) => [...prev, idx])
      }, idx * 800)
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [lines.length])

  return (
    <div className="mb-8 flex flex-col justify-start">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {/* {label} */}
      </p>
      <div className="text-left font-serif text-xl leading-relaxed text-foreground md:text-2xl">
        {lines.map((line, idx) => (
          <p
            key={idx}
            className={`transition-opacity duration-2000 ${
              visibleLines.includes(idx) ? "opacity-100" : "opacity-0"
            }`}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
