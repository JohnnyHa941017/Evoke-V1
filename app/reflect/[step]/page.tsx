"use client"

import { useState, use, useEffect } from "react"
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
  const [userInput, setUserInput] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageVisible, setPageVisible] = useState(false)
  const [inputVisible, setInputVisible] = useState(false)
  const [isReloaded, setIsReloaded] = useState(false)
  const [backgroundVisible, setBackgroundVisible] = useState(stepNumber > 1)
  const [pageFadingOut, setPageFadingOut] = useState(false)

  const currentStep = REFLECTION_STEPS.find((s) => s.step === stepNumber)

  useEffect(() => {
    // Restore session state and user input for this step
    const { sessionId, reflections, completed } = restoreSessionState()
    
    if (!sessionId) {
      router.push("/")
      return
    }

    // Check if user has already completed this step
    const existingReflection = reflections.find((r) => r.step === stepNumber)
    const isReloadedStep = !!existingReflection
    
    if (existingReflection) {
      setUserInput(existingReflection.input)
      setReflection(existingReflection.response)
      // If reflection exists (reloaded), show everything immediately
      setBackgroundVisible(true)
      setPageVisible(true)
      setInputVisible(true)
      setIsReloaded(true)
    } else {
      // Navigation within reflection pages - apply 2s fade-in to all steps
      const bgTimer = setTimeout(() => setBackgroundVisible(true), 100)
      const contentTimer = setTimeout(() => setPageVisible(true), 2000)
      
      return () => {
        clearTimeout(bgTimer)
        clearTimeout(contentTimer)
      }
    }

    // Update current step in localStorage
    updateCurrentStep(stepNumber)
  }, [stepNumber, router])

  function handlePromptComplete() {
    setInputVisible(true)
  }

  if (!currentStep) {
    router.push("/")
    return null
  }
/*
  async function handleSubmitReflection(input: string) {
    setIsLoading(true);

    const response = await fetch("/api/reflect", {
      method: "POST",
      body: JSON.stringify({
        text: input,
        stepNumber: stepNumber
      }),
    });

    const data = await response.json();

    setReflection(data.reflection);
    setIsLoading(false);
  }
*/
  async function handleSubmitReflection(input: string) {
    setIsLoading(true)
    setUserInput(input) // Store user input
    try {
      const { sessionId } = restoreSessionState()
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          stepNumber: stepNumber,
          input,
        }),
      })
      const data = await res.json()
      setReflection(data.reflection)
      
      // Save this reflection immediately
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
      // Ensure this reflection is saved
      saveReflection(sessionId, stepNumber, userInput, reflection)
      
      // Update current step
      const nextStep = stepNumber < TOTAL_STEPS ? stepNumber + 1 : stepNumber
      persistSessionState(sessionId, nextStep, reflections, false)
    }
    
    setPageFadingOut(true)
    setTimeout(() => {
      if (stepNumber === TOTAL_STEPS) {
        router.push("/reorientation")
      } else {
        router.push(`/reflect/${stepNumber + 1}`)
      }
    }, 2000)
  }

  function handleBack() {
    const { sessionId, reflections } = restoreSessionState()
    
    // Save current reflection before going back
    if (sessionId && reflection && userInput) {
      saveReflection(sessionId, stepNumber, userInput, reflection)
      persistSessionState(sessionId, stepNumber, reflections, false)
    }
    
    if (stepNumber > 1) {
      router.push(`/reflect/${stepNumber - 1}`)
    }
  }

  return (
    <>
      <Header />
        <LayoutContainer className="reflection-page" style={{ filter: backgroundVisible ? 'blur(0px)' : 'blur(20px)', opacity: backgroundVisible ? 1 : 0, transition: stepNumber === 1 ? 'filter 2000ms ease-out, opacity 2000ms ease-out' : 'none' }}>
      <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
        <div className={`flex flex-col transition-opacity duration-2000 ${pageVisible && !pageFadingOut ? 'opacity-100' : 'opacity-0'}`}>
          {/* Step indicator */}
          {/* <div className="mb-8 flex items-center gap-3">
            {REFLECTION_STEPS.map((s) => (
              <div
                key={s.step}
                className={`h-px flex-1 ${
                  s.step <= stepNumber ? "bg-foreground/30" : "bg-border"
                }`}
                aria-hidden="true"
              />
            ))}
          </div> */}

          <StepPrompt
            label={`${currentStep.label} — Step ${stepNumber} of ${TOTAL_STEPS}`}
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
