"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface ReflectionInputProps {
  onSubmit: (text: string) => void
  isLoading?: boolean
  placeholder?: string
  stepNumber: number
  reflection?: string | null
  onContinue?: () => void
  onBack?: () => void
  isSubmitting?: boolean
  totalSteps: number
  continueButtonText?: string
  onInputChange?: (text: string) => void
  userInput?: string
  isVisible?: boolean
}

// Distil user's text into a soft 1-2 phrase echo — feels held, not replayed
function distilEcho(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ")
  // Try to find a natural pause point (comma, semicolon, em-dash, newline) within first 60 chars
  const excerpt = trimmed.slice(0, 70)
  const breakMatch = excerpt.match(/^([^,;—\n]{12,55})[,;—\n]/)
  if (breakMatch) return breakMatch[1].trim() + "…"
  // Otherwise take first 6 words
  const words = trimmed.split(" ")
  if (words.length <= 6) return trimmed
  return words.slice(0, 6).join(" ") + "…"
}

export function ReflectionInput({
  onSubmit,
  stepNumber,
  isLoading = false,
  placeholder = "You can write here… or simply sit for a moment",
  reflection,
  onContinue,
  onBack,
  isSubmitting = false,
  totalSteps,
  continueButtonText,
  userInput = "",
  onInputChange,
  isVisible = true,
}: ReflectionInputProps) {
  const router = useRouter()
  const [inputFadingOut, setInputFadingOut] = useState(false)
  const [reflectionVisible, setReflectionVisible] = useState(false)
  const [echoVisible, setEchoVisible] = useState(false)
  const submitTimeRef = useRef<number | null>(null)
  const echoRef = useRef<string>("")

  useEffect(() => {
    if (reflection) {
      const elapsed = submitTimeRef.current ? Date.now() - submitTimeRef.current : 2000
      const delay = Math.max(50, 2000 - elapsed)
      // Echo appears slightly before the reflection
      const echoTimer = setTimeout(() => setEchoVisible(true), Math.max(50, delay - 400))
      const refTimer = setTimeout(() => setReflectionVisible(true), delay)
      return () => { clearTimeout(echoTimer); clearTimeout(refTimer) }
    } else {
      setReflectionVisible(false)
      setEchoVisible(false)
      setInputFadingOut(false)
      echoRef.current = ""
    }
  }, [reflection])

  function handleSubmit() {
    if (!userInput.trim() || isLoading) return
    echoRef.current = distilEcho(userInput)
    setInputFadingOut(true)
    submitTimeRef.current = Date.now()
    onSubmit(userInput.trim())
  }

  function handleInputChange(value: string) {
    onInputChange?.(value)
  }

  function handleBack() {
    if (stepNumber > 1) {
      router.push(`/reflect/${stepNumber - 1}`)
    }
  }

  return (
    <div className="mt-2">
      <div style={{ opacity: isVisible ? 1 : 0, pointerEvents: isVisible ? 'auto' : 'none', transition: 'opacity 2000ms ease-out' }}>
        <div className="flex flex-col gap-4 sm:gap-5">

          {reflection ? (
            <div
              className="border-l border-accent/40 pl-3 sm:pl-4"
              style={{ opacity: reflectionVisible ? 1 : 0, transition: 'opacity 2000ms ease-out' }}
            >
              <div
                className="w-full rounded-xl border border-white/20 bg-white/[0.05] px-4 py-4 sm:px-6 sm:py-6 md:px-7 md:py-8 font-sans text-base sm:text-lg md:text-xl leading-relaxed text-black h-[240px] sm:h-[260px] md:h-[280px] overflow-y-auto"
                aria-label="Reflection display"
              >
                {echoRef.current && (
                  <p
                    className="font-sans text-base sm:text-lg md:text-xl italic text-black/60 tracking-wide"
                    style={{ opacity: echoVisible ? 1 : 0, transition: 'opacity 1500ms ease-out' }}
                  >
                    {echoRef.current}
                  </p>
                )}
                {echoRef.current && (
                  <div
                    className="my-3 sm:my-4 border-t border-black/20"
                    style={{ opacity: echoVisible ? 1 : 0, transition: 'opacity 1500ms ease-out' }}
                  />
                )}
                <p className="whitespace-pre-wrap">{reflection}</p>
              </div>
            </div>
          ) : (
            <div
              className="border-l-2 border-accent/50 pl-3 sm:pl-4"
              style={{ opacity: inputFadingOut ? 0 : 1, transition: 'opacity 2000ms ease-out' }}
            >
              <textarea
                value={userInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={placeholder}
                disabled={isLoading}
                className="w-full resize-none rounded-xl border border-white/30 bg-white/[0.06] px-4 py-4 sm:px-6 sm:py-6 md:px-7 md:py-8 font-sans text-base sm:text-lg md:text-xl leading-relaxed text-black placeholder:italic placeholder:text-black/55 placeholder:font-light focus:outline-none focus:border-white/50 focus:bg-white/[0.09] focus:ring-0 disabled:opacity-50 transition-all duration-500 h-[240px] sm:h-[260px] md:h-[280px]"
                aria-label="Reflection input"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3 mt-4 sm:mt-6" style={{ opacity: isVisible ? 1 : 0, pointerEvents: isVisible ? 'auto' : 'none', transition: 'opacity 800ms ease-out 2000ms' }}>
        {reflection ? (
          <>
            <button
              onClick={onBack}
              disabled={stepNumber === 1}
              className="flex-1 rounded-lg border border-white/60 bg-transparent py-3 sm:py-3.5 text-xs sm:text-sm font-medium tracking-wide text-primary-foreground hover:opacity-90 disabled:opacity-40 min-h-[44px]"
            >
              Back
            </button>
            <button
              onClick={onContinue}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-primary py-3 sm:py-3.5 text-xs sm:text-sm font-medium tracking-wide text-primary-foreground hover:opacity-90 disabled:opacity-40 min-h-[44px]"
            >
              {continueButtonText || (stepNumber < totalSteps ? "Continue" : "Move to closing")}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleBack}
              disabled={stepNumber === 1}
              className="flex-1 rounded-lg border border-white/60 bg-transparent py-3 sm:py-3.5 text-xs sm:text-sm font-medium tracking-wide text-primary-foreground hover:opacity-90 disabled:opacity-40 min-h-[44px]"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!userInput.trim() || isLoading}
              className="flex-1 rounded-lg bg-primary py-3 sm:py-3.5 text-xs sm:text-sm font-medium tracking-wide text-primary-foreground hover:opacity-90 disabled:opacity-40 min-h-[44px]"
            >
              {isLoading ? "Reflecting…" : "Reflect"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
