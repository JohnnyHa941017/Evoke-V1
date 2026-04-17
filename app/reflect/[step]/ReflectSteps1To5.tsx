"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { LayoutContainer } from "@/components/LayoutContainer"
import { StepPrompt } from "@/components/StepPrompt"
import { ReflectionInput } from "@/components/ReflectionInput"
import { REFLECTION_STEPS, TOTAL_STEPS } from "@/lib/prompts/reflectionPrompts"
import {
  persistSessionState,
  restoreSessionState,
  saveReflection,
  updateCurrentStep,
} from "@/lib/persistence"

interface Props {
  initialStep: number
}

export function ReflectSteps1To5({ initialStep }: Props) {
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(initialStep)
  const [reflection, setReflection] = useState<string | null>(null)
  const [userInput, setUserInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageVisible, setPageVisible] = useState(false)
  const [inputVisible, setInputVisible] = useState(false)
  const [isReloaded, setIsReloaded] = useState(false)
  const [backgroundVisible, setBackgroundVisible] = useState(false)
  const [pageFadingOut, setPageFadingOut] = useState(false)
  const [backgroundFadingOut, setBackgroundFadingOut] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const stepMeta = REFLECTION_STEPS.find((s) => s.step === currentStep)

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkScreen()
    window.addEventListener("resize", checkScreen)

    return () => window.removeEventListener("resize", checkScreen)
  }, [])

  // Initial mount only: match the current page's entry behavior for `initialStep`.
  useEffect(() => {
    const shouldFadeOnEnter = initialStep === 1

    setPageFadingOut(false)
    setBackgroundFadingOut(false)
    setInputVisible(false)

    if (shouldFadeOnEnter) {
      setPageVisible(false)
      setBackgroundVisible(false)
    } else {
      setPageVisible(true)
      setBackgroundVisible(true)
    }

    const { sessionId, reflections } = restoreSessionState()

    if (!sessionId) {
      router.push("/")
      return
    }

    const existingReflection = reflections.find((r) => r.step === initialStep)

    if (existingReflection) {
      setUserInput(existingReflection.input)
      setReflection(existingReflection.response)
      setBackgroundVisible(true)
      setPageVisible(true)
      setInputVisible(true)
      setIsReloaded(true)
      updateCurrentStep(initialStep)
      return
    }

    setReflection(null)
    setUserInput("")
    setIsReloaded(false)

    let bgTimer: ReturnType<typeof setTimeout> | undefined
    let contentTimer: ReturnType<typeof setTimeout> | undefined

    if (shouldFadeOnEnter) {
      bgTimer = setTimeout(() => {
        setBackgroundVisible(true)
      }, 100)

      contentTimer = setTimeout(() => {
        setPageVisible(true)
      }, 2000)
    }

    updateCurrentStep(initialStep)

    return () => {
      if (bgTimer) clearTimeout(bgTimer)
      if (contentTimer) clearTimeout(contentTimer)
    }
  }, [initialStep, router])

  function loadStepIntoState(targetStep: number) {
    const { reflections } = restoreSessionState()
    const existing = reflections.find((r) => r.step === targetStep)

    if (existing) {
      setUserInput(existing.input)
      setReflection(existing.response)
      setInputVisible(true)
      setIsReloaded(true)
    } else {
      setUserInput("")
      setReflection(null)
      setInputVisible(false)
      setIsReloaded(false)
    }
  }

  function swapToStep(targetStep: number) {
    window.history.replaceState(null, "", `/reflect/${targetStep}`)
    updateCurrentStep(targetStep)
    loadStepIntoState(targetStep)
    setCurrentStep(targetStep)
    setPageFadingOut(false)
    setBackgroundFadingOut(false)
    setPageVisible(true)
    setBackgroundVisible(true)
    setIsSubmitting(false)
  }

  function handlePromptComplete() {
    setInputVisible(true)
  }

  async function handleSubmitReflection(input: string) {
    setIsLoading(true)
    setUserInput(input)

    try {
      const { sessionId } = restoreSessionState()

      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          stepNumber: currentStep,
          input,
        }),
      })

      const data = await res.json()
      setReflection(data.reflection)

      if (sessionId) {
        saveReflection(sessionId, currentStep, input, data.reflection)
      }
    } catch {
      setReflection("A moment of stillness occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleContinue() {
    setIsSubmitting(true)

    const { sessionId, reflections } = restoreSessionState()

    if (sessionId && reflection) {
      saveReflection(sessionId, currentStep, userInput, reflection)

      const nextStep = currentStep < TOTAL_STEPS ? currentStep + 1 : currentStep
      persistSessionState(sessionId, nextStep, reflections, false)
    }

    if (currentStep === 5) {
      // 5 → 6: fade both content and background, then hand off to /reflect/6
      setPageFadingOut(true)
      setBackgroundFadingOut(true)

      setTimeout(() => {
        router.push("/reflect/6")
      }, 2000)
      return
    }

    // 1→2, 2→3, 3→4, 4→5: fade content only, background stays
    setPageFadingOut(true)

    setTimeout(() => {
      swapToStep(currentStep + 1)
    }, 2000)
  }

  function handleBack() {
    const { sessionId, reflections } = restoreSessionState()

    if (sessionId && reflection && userInput) {
      saveReflection(sessionId, currentStep, userInput, reflection)
      persistSessionState(sessionId, currentStep, reflections, false)
    }

    if (currentStep > 1) {
      // 2→1, 3→2, 4→3, 5→4: instant, no fade
      swapToStep(currentStep - 1)
    }
  }

  if (!stepMeta) {
    router.push("/")
    return null
  }

  const backgroundIsShown = backgroundVisible && !backgroundFadingOut
  const shouldUseTransition = currentStep === 1 || pageFadingOut || backgroundFadingOut

  return (
    <>
      <Header />

      <LayoutContainer
        className="reflection-page"
        style={{
          backgroundImage: isMobile
            ? `url(${stepMeta.background_mobile})`
            : `url(${stepMeta.background_desktop})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundAttachment: isMobile ? "scroll" : "fixed",
          filter: backgroundIsShown ? "blur(0px)" : "blur(20px)",
          opacity: backgroundIsShown ? 1 : 0,
          transition: shouldUseTransition
            ? "filter 2000ms ease-out, opacity 2000ms ease-out"
            : "none",
        }}
      >
        <div
          className="absolute bottom-0 left-0 w-full h-[45%] sm:h-[50%] pointer-events-none"
          style={{
            zIndex: -1,
            background: `linear-gradient(to top, rgba(0,0,0,${
              (90 - (currentStep - 1) * 5) / 100
            }), transparent)`,
          }}
        />

        <div
          className={`flex flex-col pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-6 sm:pb-8 ${
            shouldUseTransition ? "transition-opacity duration-2000" : ""
          } ${pageVisible && !pageFadingOut ? "opacity-100" : "opacity-0"}`}
        >
          <StepPrompt
            key={`prompt-${currentStep}`}
            label={stepMeta.label}
            prompt={stepMeta.prompt}
            onPromptComplete={handlePromptComplete}
            isReloaded={isReloaded}
          />

          <ReflectionInput
            key={`input-${currentStep}`}
            onSubmit={handleSubmitReflection}
            isLoading={isLoading}
            placeholder="You can write here… or simply sit for a moment"
            stepNumber={currentStep}
            reflection={reflection}
            onContinue={handleContinue}
            onBack={handleBack}
            isSubmitting={isSubmitting}
            totalSteps={TOTAL_STEPS}
            userInput={userInput}
            onInputChange={setUserInput}
            isVisible={inputVisible}
          />
        </div>
      </LayoutContainer>
    </>
  )
}
