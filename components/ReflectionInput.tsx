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
  placeholder = "Write here...",
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
    <div className={`transition-opacity duration-2000 mt-2 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col gap-6">
      {reflection ? (
        <textarea
          value={reflection}
          readOnly
          rows={8}
          className="w-full resize-none rounded-lg border border-accent bg-transparent backdrop-blur-sm px-5 py-6 font-sans text-xl leading-relaxed text-foreground placeholder:italic placeholder:text-muted-foreground focus:outline-none focus:border-white focus:ring-1 focus:ring-white/40 disabled:opacity-50"
          aria-label="Reflection display"
        />
      ) : (
        <textarea
          value={userInput}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          rows={8}
          className="w-full resize-none rounded-lg border border-accent bg-transparent backdrop-blur-sm px-5 py-6 font-sans text-xl leading-relaxed text-foreground placeholder:italic placeholder:text-muted-foreground focus:outline-none focus:border-white focus:ring-1 focus:ring-white/40 disabled:opacity-50"
          aria-label="Reflection input"
        />
      )}
      <div className="flex gap-3">
        {reflection ? (
          <>
            <button
              onClick={onBack}
              disabled={stepNumber === 1}
              className="flex-1 rounded-lg border border-white bg-transparent py-3 text-sm font-medium tracking-wide text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Back
            </button>
            <button
              onClick={onContinue}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-primary py-3 text-sm font-medium tracking-wide text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {continueButtonText || (stepNumber < totalSteps ? "Continue" : "Move to closing")}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleBack}
              disabled={stepNumber === 1}
              className="flex-1 rounded-lg border border-white bg-transparent py-3 text-sm font-medium tracking-wide text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!userInput.trim() || isLoading}
              className="flex-1 rounded-lg bg-primary py-3 text-sm font-medium tracking-wide text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {isLoading ? "Reflecting..." : "Reflect"}
            </button>
          </>
        )}
      </div>
      </div>
    </div>
  )
}
