"use client"

import { use, useEffect, useState } from "react"
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

export default function ReflectionStepPage({
  params,
}: {
  params: Promise<{ step: string }>
}) {
  const { step: stepParam } = use(params)
  const stepNumber = parseInt(stepParam, 10)
  const router = useRouter()

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

  const currentStep = REFLECTION_STEPS.find((s) => s.step === stepNumber)

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkScreen()
    window.addEventListener("resize", checkScreen)

    return () => window.removeEventListener("resize", checkScreen)
  }, [])

  useEffect(() => {
    const shouldFadeOnEnter = stepNumber === 1 || stepNumber >= 4

    setPageFadingOut(false)
    setBackgroundFadingOut(false)
    setInputVisible(false)

    // Page 2 and 3 should appear immediately
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

    const existingReflection = reflections.find((r) => r.step === stepNumber)

    if (existingReflection) {
      setUserInput(existingReflection.input)
      setReflection(existingReflection.response)
      setBackgroundVisible(true)
      setPageVisible(true)
      setInputVisible(true)
      setIsReloaded(true)
      updateCurrentStep(stepNumber)
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

    updateCurrentStep(stepNumber)

    return () => {
      if (bgTimer) clearTimeout(bgTimer)
      if (contentTimer) clearTimeout(contentTimer)
    }
  }, [stepNumber, router])

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
          stepNumber,
          input,
        }),
      })

      const data = await res.json()
      setReflection(data.reflection)

      if (sessionId) {
        saveReflection(sessionId, stepNumber, input, data.reflection)
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
      saveReflection(sessionId, stepNumber, userInput, reflection)

      const nextStep = stepNumber < TOTAL_STEPS ? stepNumber + 1 : stepNumber
      persistSessionState(sessionId, nextStep, reflections, false)
    }

    const shouldFade = stepNumber >= 3

    if (stepNumber < TOTAL_STEPS) {
      if (shouldFade) {
        setPageFadingOut(true)
        setBackgroundFadingOut(true)

        setTimeout(() => {
          router.push(`/reflect/${stepNumber + 1}`)
        }, 2000)
      } else {
        router.push(`/reflect/${stepNumber + 1}`)
      }
    } else {
      setPageFadingOut(true)
      setBackgroundFadingOut(true)

      setTimeout(() => {
        router.push("/reorientation")
      }, 2000)
    }
  }

  function handleBack() {
    const { sessionId, reflections } = restoreSessionState()

    if (sessionId && reflection && userInput) {
      saveReflection(sessionId, stepNumber, userInput, reflection)
      persistSessionState(sessionId, stepNumber, reflections, false)
    }

    const shouldFade = stepNumber >= 4

    if (stepNumber > 1) {
      if (shouldFade) {
        setPageFadingOut(true)
        setBackgroundFadingOut(true)

        setTimeout(() => {
          router.push(`/reflect/${stepNumber - 1}`)
        }, 2000)
      } else {
        router.push(`/reflect/${stepNumber - 1}`)
      }
    }
  }

  if (!currentStep) {
    router.push("/")
    return null
  }

  const backgroundIsShown = backgroundVisible && !backgroundFadingOut
  const shouldUseContentTransition = stepNumber === 1 || stepNumber >= 4 || pageFadingOut

  return (
    <>
      <Header />

      <LayoutContainer
        className="reflection-page"
        style={{
          backgroundImage: isMobile
            ? `url(${REFLECTION_STEPS[stepNumber - 1].background_mobile})`
            : `url(${REFLECTION_STEPS[stepNumber - 1].background_desktop})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundAttachment: isMobile ? "scroll" : "fixed",
          filter: backgroundIsShown ? "blur(0px)" : "blur(20px)",
          opacity: backgroundIsShown ? 1 : 0,
          transition: shouldUseContentTransition
            ? "filter 2000ms ease-out, opacity 2000ms ease-out"
            : "none",
        }}
      >
        <div
          className="absolute bottom-0 left-0 w-full h-[45%] sm:h-[50%] pointer-events-none"
          style={{
            zIndex:-1,
            background: `linear-gradient(to top, rgba(0,0,0,${
              (90 - (stepNumber - 1) * 5) / 100
            }), transparent)`,
          }}
        />

        <div
          className={`flex flex-col pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-6 sm:pb-8 ${
            shouldUseContentTransition ? "transition-opacity duration-2000" : ""
          } ${pageVisible && !pageFadingOut ? "opacity-100" : "opacity-0"}`}
        >
          <StepPrompt
            label={currentStep.label}
            prompt={currentStep.prompt}
            onPromptComplete={handlePromptComplete}
            isReloaded={isReloaded}
          />

          <ReflectionInput
            onSubmit={handleSubmitReflection}
            isLoading={isLoading}
            placeholder="You can write here… or simply sit for a moment"
            stepNumber={stepNumber}
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