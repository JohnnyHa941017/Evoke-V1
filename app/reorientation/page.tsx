"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { LayoutContainer } from "@/components/LayoutContainer"
import { StepPrompt } from "@/components/StepPrompt"
import { ReflectionInput } from "@/components/ReflectionInput"
import { REFLECTION_STEPS, TOTAL_STEPS } from "@/lib/prompts/reflectionPrompts"
import { restoreSessionState, persistSessionState } from "@/lib/persistence"

export default function ReorientationPage() {
  const router = useRouter()

  const [reflection, setReflection] = useState<string | null>(null)
  const [userInput, setUserInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageVisible, setPageVisible] = useState(false)
  const [backgroundVisible, setBackgroundVisible] = useState(false)
  const [inputVisible, setInputVisible] = useState(false)

  useEffect(() => {
    // Fade in background at 0ms
    const bgTimer = setTimeout(() => setBackgroundVisible(true), 100)
    // Fade in content at 2000ms (after reflect page finishes fading out)
    const contentTimer = setTimeout(() => setPageVisible(true), 2000)
    // Fade in first element at 4000ms (2s delay + 2s for content fade)
    const inputTimer = setTimeout(() => setInputVisible(true), 4000)
    
    return () => {
      clearTimeout(bgTimer)
      clearTimeout(contentTimer)
      clearTimeout(inputTimer)
    }
  }, [])

  async function handleSubmitReflection(input: string) {
    setUserInput(input)
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
    const { sessionId, reflections } = restoreSessionState()
    
    // Save reorientation to session
    if (sessionId) {
      persistSessionState(sessionId, TOTAL_STEPS + 1, reflections, true)
    }
    
    setTimeout(async () => {
      try {
        const sessionId = localStorage.getItem("evoke-session-id")
        await fetch("/api/complete-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, reorientation: userInput }),
        })
        router.push("/complete")
      } catch {
        setIsSubmitting(false)
      }
    }, 4000)
  }

  function handlePromptComplete() {
    setInputVisible(true)
  }

  function handleBack() {
    router.push(`/reflect/${TOTAL_STEPS}`)
  }

  return (
    <>
      <Header />
      <LayoutContainer className="reorientation-page" style={{ filter: backgroundVisible ? 'blur(0px)' : 'blur(20px)', opacity: backgroundVisible ? 1 : 0, transition: 'filter 2000ms ease-out, opacity 2000ms ease-out' }}>
        <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
        <div className={`flex flex-col transition-opacity duration-2000 ${pageVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Step indicator */}
          {/* <div className="mb-8 flex items-center gap-3">
            {[...Array(TOTAL_STEPS + 1)].map((_, i) => (
              <div
                key={i}
                className={`h-px flex-1 ${
                  i < TOTAL_STEPS + 1 ? "bg-foreground/30" : "bg-border"
                }`}
                aria-hidden="true"
              />
            ))}
          </div> */}

          <StepPrompt
            label="Reorientation"
            prompt="Reading your words again — what feels quieter now?"
            onPromptComplete={handlePromptComplete}
            isReloaded={false}
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
            userInput={userInput}
            onInputChange={setUserInput}
            isVisible={inputVisible}
          />
        </div>
      </LayoutContainer>
    </>
  )
}
