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
  const [savedInputs, setSavedInputs] = useState<string[]>([])
  const [currentInputIndex, setCurrentInputIndex] = useState(0)
  const [inputTextVisible, setInputTextVisible] = useState(false)

  useEffect(() => {
    const reflections = getSavedReflections()
    const inputs = reflections
      .sort((a, b) => a.step - b.step)
      .map((r) => r.input)
      .filter(Boolean)
    setSavedInputs(inputs)
  }, [])

  useEffect(() => {
    if (savedInputs.length === 0 || !pageVisible) return

    const fadeIn = 2000
    const hold = 3000
    const fadeOut = 2000

    setInputTextVisible(true)

    const interval = setInterval(() => {
      setInputTextVisible(false)
      setTimeout(() => {
        setCurrentInputIndex((prev) => (prev + 1) % savedInputs.length)
        setInputTextVisible(true)
      }, fadeOut)
    }, fadeIn + hold)

    return () => clearInterval(interval)
  }, [savedInputs, pageVisible])

  useEffect(() => {
    // Fade in background at 0ms
    const bgTimer = setTimeout(() => setBackgroundVisible(true), 100)
    // Fade in content at 2000ms (after reflect page finishes fading out)
    const contentTimer = setTimeout(() => setPageVisible(true), 2000)
    // Fade in first element at 6000ms (2s delay + 2s content fade + 2s extra)
    const inputTimer = setTimeout(() => setInputVisible(true), 6000)
    
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
          <div className="relative mb-8 h-[3.5rem]">
            <div
              className="absolute inset-0 flex items-center gap-3 text-lg italic"
              style={{
                textShadow: '0 0 10px rgba(255,255,255,0.5)',
                opacity: inputTextVisible ? 1 : 0,
                transition: 'opacity 2000ms ease-in-out',
              }}
            >
              {savedInputs[currentInputIndex] || ''}
            </div>
          </div>
          <StepPrompt
            label="Reorientation"
            prompt="What feels quieter now?"
            onPromptComplete={handlePromptComplete}
            isReloaded={false}
            startDelay={4200}
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
