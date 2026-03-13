"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface ReflectionInputProps {
  onSubmit: (text: string) => void
  isLoading?: boolean
  placeholder?: string
  stepNumber: number
}

export function ReflectionInput({
  onSubmit,
  stepNumber,
  isLoading = false,
  placeholder = "Write here...",
}: ReflectionInputProps) {
  const router = useRouter()
  const [text, setText] = useState("")

  function handleSubmit() {
    if (!text.trim() || isLoading) return
    onSubmit(text.trim())
  }

  function handleBack() {
    if (stepNumber > 1) {
      router.push(`/reflect/${stepNumber - 1}`)
    } else {
    //  router.push("/")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        rows={6}
        className="w-full resize-none rounded-lg border border-border bg-card px-5 py-4 font-sans text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
        aria-label="Reflection input"
      />
      <div>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          className="rounded-lg mr-3 bg-primary px-8 py-3 text-sm font-medium tracking-wide text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {isLoading ? "Reflecting..." : "Reflect"}
        </button>
        <button
          onClick={handleBack}
          disabled={stepNumber === 1}
          className="rounded-lg bg-primary px-8 py-3 text-sm font-medium tracking-wide text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Back
        </button>
      </div>
    </div>
  )
}
