"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { LayoutContainer } from "@/components/LayoutContainer"
import { StepPrompt } from "@/components/StepPrompt"
import { ReflectionInput } from "@/components/ReflectionInput"
import { REFLECTION_STEPS, TOTAL_STEPS } from "@/lib/prompts/reflectionPrompts"
import { restoreSessionState, persistSessionState, getSavedReflections } from "@/lib/persistence"

export default function ReorientationPage() {
  const router = useRouter()

  const [reflection, setReflection] = useState<string | null>(null)
  const [userInput, setUserInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageVisible, setPageVisible] = useState(false)
  const [backgroundVisible, setBackgroundVisible] = useState(false)
  const [inputVisible, setInputVisible] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)
  const [excerpts, setExcerpts] = useState<string[]>([])
  const [excerptsVisible, setExcerptsVisible] = useState(false)

  useEffect(() => {
    const reflections = getSavedReflections()
    if (reflections.length === 0) return

    fetch("/api/excerpts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reflections }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.excerpts) setExcerpts(data.excerpts)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (excerpts.length === 0 || !pageVisible) return
    const timer = setTimeout(() => setExcerptsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [excerpts, pageVisible])

  useEffect(() => {
    // Fade in background immediately (image preloaded from previous page)
    setBackgroundVisible(true)
    // Fade in content at 2000ms (after reflect page finishes fading out)
    const contentTimer = setTimeout(() => setPageVisible(true), 2000)
    // Fade in input fields at 8000ms (2s later than before)
    const inputTimer = setTimeout(() => setInputVisible(true), 8000)

    return () => {
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
    setFadingOut(true)
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
      <LayoutContainer className="reorientation-page" style={{ filter: backgroundVisible && !fadingOut ? 'blur(0px)' : 'blur(20px)', opacity: backgroundVisible && !fadingOut ? 1 : 0, transition: 'filter 2000ms ease-out, opacity 2000ms ease-out' }}>
        <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black/40 to-transparent pointer-events-none relative z-0"></div>
        <div className={`flex flex-col transition-opacity duration-2000 ${pageVisible && !fadingOut ? 'opacity-100' : 'opacity-0'}`}>
          {/* Step indicator */}
          <div className="mb-8 flex items-center gap-3 text-lg" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
            Feeling your words again
          </div>
          <div className="mb-16 flex flex-col gap-4">
            {excerpts.map((excerpt, i) => (
              <div
                key={i}
                className="text-lg italic"
                style={{
                  textShadow: '0 0 10px rgba(255,255,255,0.5)',
                  opacity: excerptsVisible ? 1 : 0,
                  transition: `opacity 2000ms ease-in-out ${2000+i * 2000}ms`,
                }}
              >
                {excerpt}
              </div>
            ))}
          </div>
          <StepPrompt
            label="Reorientation"
            prompt="What feels quieter now?"
            onPromptComplete={handlePromptComplete}
            isReloaded={false}
            startDelay={12200}
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
            continueButtonText="Move to closing"
            userInput={userInput}
            onInputChange={setUserInput}
            isVisible={inputVisible}
          />
        </div>
      </LayoutContainer>
    </>
  )
}
