"use client"

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
  userInput?: string
  onInputChange?: (text: string) => void
  isVisible?: boolean
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

  function handleSubmit() {
    if (!userInput.trim() || isLoading) return
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
        <div className="flex flex-col gap-6">
          {reflection ? (
            <textarea
              value={reflection}
              readOnly
              rows={8}
              className="w-full resize-none rounded-2xl border border-white/10 bg-transparent backdrop-blur-sm px-7 py-8 font-sans text-xl leading-relaxed text-foreground placeholder:italic placeholder:text-white/20 placeholder:font-light focus:outline-none focus:border-white/25 focus:ring-0 disabled:opacity-50 transition-colors duration-500"
              aria-label="Reflection display"
            />
          ) : (
            <textarea
              value={userInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholder}
              disabled={isLoading}
              rows={8}
              className="w-full resize-none rounded-2xl border border-white/10 bg-transparent backdrop-blur-sm px-7 py-8 font-sans text-xl leading-relaxed text-foreground placeholder:italic placeholder:text-white/20 placeholder:font-light focus:outline-none focus:border-white/25 focus:ring-0 disabled:opacity-50 transition-colors duration-500"
              aria-label="Reflection input"
            />
          )}
        </div>
      </div>
      <div className="flex gap-3 mt-6" style={{ opacity: isVisible ? 1 : 0, pointerEvents: isVisible ? 'auto' : 'none', transition: 'opacity 800ms ease-out 2000ms' }}>
        {reflection ? (
          <>
            <button
              onClick={onBack}
              disabled={stepNumber === 1}
              className="flex-1 rounded-lg border border-white bg-transparent py-3 text-sm font-medium tracking-wide text-primary-foreground hover:opacity-90 disabled:opacity-40"
            >
              Back
            </button>
            <button
              onClick={onContinue}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-primary py-3 text-sm font-medium tracking-wide text-primary-foreground hover:opacity-90 disabled:opacity-40"
            >
              {continueButtonText || (stepNumber < totalSteps ? "Continue" : "Move to closing")}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleBack}
              disabled={stepNumber === 1}
              className="flex-1 rounded-lg border border-white bg-transparent py-3 text-sm font-medium tracking-wide text-primary-foreground hover:opacity-90 disabled:opacity-40"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!userInput.trim() || isLoading}
              className="flex-1 rounded-lg bg-primary py-3 text-sm font-medium tracking-wide text-primary-foreground hover:opacity-90 disabled:opacity-40"
            >
              {isLoading ? "Reflecting..." : "Reflect"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
