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
      // Echo and reflection fade in together
      const timer = setTimeout(() => {
        setEchoVisible(true)
        setReflectionVisible(true)
      }, delay)
      return () => clearTimeout(timer)
    } else {
      setReflectionVisible(false)
      setEchoVisible(false)
      setInputFadingOut(false)
      echoRef.current = ""
    }
  }, [reflection])

  function handleSubmit() {
    if (!userInput.trim() || isLoading) return
    echoRef.current = userInput
    setInputFadingOut(true)
    submitTimeRef.current = Date.now()
    onSubmit(userInput.trim())
  }

  function handleInputChange(value: string) {
    onInputChange?.(value)
  }

  function handleBack() {
    if (onBack) {
      onBack()
      return
    }
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
              className="border-accent/40"
              style={{ opacity: reflectionVisible ? 1 : 0, transition: 'opacity 2000ms ease-out' }}
            >
              <div
                className="w-full rounded-xl border border-white/40 bg-white/25 px-4 py-4 sm:px-6 sm:py-6 md:px-7 md:py-8 font-sans text-base sm:text-lg md:text-xl leading-relaxed text-black h-[240px] sm:h-[260px] md:h-[280px] overflow-y-auto"
                style={{
                  textShadow:
                    "0 0 1px rgba(255,255,255,1), 0 0 2px rgba(255,255,255,1), 0 0 3px rgba(255,255,255,1), 0 0 5px rgba(255,255,255,1), 0 0 8px rgba(255,255,255,1), 0 0 14px rgba(255,255,255,0.95), 0 0 20px rgba(255,255,255,0.9)",
                }}
                aria-label="Reflection display"
              >
                {echoRef.current && (
                  <p
                    className="block max-w-full font-sans text-base sm:text-lg md:text-xl text-black tracking-wide truncate"
                    style={{ opacity: echoVisible ? 1 : 0, transition: 'opacity 2000ms ease-out' }}
                    title={echoRef.current}
                  >
                    {echoRef.current}
                  </p>
                )}
                {echoRef.current && (
                  <div
                    className="my-3 sm:my-4 border-t border-black/20"
                    style={{ opacity: echoVisible ? 1 : 0, transition: 'opacity 2000ms ease-out' }}
                  />
                )}
                <p
                  className="whitespace-pre-wrap"
                  style={{ opacity: reflectionVisible ? 1 : 0, transition: 'opacity 2000ms ease-out' }}
                >
                  {reflection}
                </p>
              </div>
            </div>
          ) : (
            <div
              className="border-accent/50"
              // style={{  }}
            >
              <textarea
                value={userInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={placeholder}
                disabled={isLoading}
                className="w-full resize-none rounded-xl border border-white/40 bg-white/25 px-4 py-4 sm:px-6 sm:py-6 md:px-7 md:py-8 font-sans text-base sm:text-lg md:text-xl leading-relaxed text-black placeholder:italic placeholder:text-black/75 placeholder:font-light focus:outline-none focus:border-white/60 focus:bg-white/30 focus:ring-0 h-[240px] sm:h-[260px] md:h-[280px]"
                style={{
                  color: inputFadingOut ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,1)',
                  textShadow: inputFadingOut
                    ? "0 0 1px rgba(255,255,255,0), 0 0 2px rgba(255,255,255,0), 0 0 3px rgba(255,255,255,0), 0 0 5px rgba(255,255,255,0), 0 0 8px rgba(255,255,255,0), 0 0 14px rgba(255,255,255,0), 0 0 20px rgba(255,255,255,0)"
                    : "0 0 1px rgba(255,255,255,1), 0 0 2px rgba(255,255,255,1), 0 0 3px rgba(255,255,255,1), 0 0 5px rgba(255,255,255,1), 0 0 8px rgba(255,255,255,1), 0 0 14px rgba(255,255,255,0.95), 0 0 20px rgba(255,255,255,0.9)",
                  transition: 'color 2000ms ease-out, text-shadow 2000ms ease-out',
                }}
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
