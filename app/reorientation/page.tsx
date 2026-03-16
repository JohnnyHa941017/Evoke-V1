"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { LayoutContainer } from "@/components/LayoutContainer"
import { StepPrompt } from "@/components/StepPrompt"
import { ReflectionInput } from "@/components/ReflectionInput"
import { REFLECTION_STEPS, TOTAL_STEPS } from "@/lib/prompts/reflectionPrompts"

export default function ReorientationPage() {
  const router = useRouter()

  const [reflection, setReflection] = useState<string | null>(null)
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageVisible, setPageVisible] = useState(false)

  useEffect(() => {
    setPageVisible(true)
  }, [])

  async function handleSubmitReflection(input: string) {
    setInputText(input)
    setIsLoading(true)
    try {
      const sessionId = localStorage.getItem("evoke-session-id")
      const res = await fetch("/api/reorientation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          step: 0,
          input,
        }),
      })
      const data = await res.json()
      setReflection(data.reorientation)
    } catch {
      setReflection("A moment of stillness occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleContinue() {
    setIsSubmitting(true)
    setTimeout(async () => {
      try {
        const sessionId = localStorage.getItem("evoke-session-id")
        await fetch("/api/complete-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, reorientation: inputText }),
        })
        router.push("/complete")
      } catch {
        setIsSubmitting(false)
      }
    }, 3000)
  }

  function handleBack() {
    router.push(`/reflect/${TOTAL_STEPS}`)
  }

  return (
    <>
      <Header />
      <LayoutContainer className="complete-page">
        <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
        <div className={`flex flex-col transition-opacity duration-1000 ${pageVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Step indicator */}
          <div className="mb-8 flex items-center gap-3">
            {[...Array(TOTAL_STEPS + 1)].map((_, i) => (
              <div
                key={i}
                className={`h-px flex-1 ${
                  i < TOTAL_STEPS + 1 ? "bg-foreground/30" : "bg-border"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          <StepPrompt
            label="Reorientation"
            prompt="Reading your words again — what feels quieter now?"
          />

          <ReflectionInput
            onSubmit={handleSubmitReflection}
            isLoading={isLoading}
            placeholder="What has settled..."
            stepNumber={TOTAL_STEPS + 1}
            reflection={reflection}
            onContinue={handleContinue}
            onBack={handleBack}
            isSubmitting={isSubmitting}
            totalSteps={TOTAL_STEPS + 1}
            continueButtonText="Complete"
          />
        </div>
      </LayoutContainer>
    </>
  )
}
