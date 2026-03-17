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

  const currentStep = REFLECTION_STEPS.find((s) => s.step === stepNumber)

  useEffect(() => {
    setPageVisible(true)

    // Restore session state and user input for this step
    const { sessionId, reflections, completed } = restoreSessionState()
    
    if (!sessionId) {
      router.push("/")
      return
    }

    // Check if user has already completed this step
    const existingReflection = reflections.find((r) => r.step === stepNumber)
    if (existingReflection) {
      setUserInput(existingReflection.input)
      setReflection(existingReflection.response)
    }

    // Update current step in localStorage
    updateCurrentStep(stepNumber)
  }, [stepNumber, router])

  useEffect(() => {
    // Calculate when to show the input field based on the current step's prompt
    if (currentStep) {
      const lines = currentStep.prompt
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
      
      // Show input after all prompt lines have finished fading in
      // Last line starts appearing at (lines.length - 1) * 800ms
      // Last line finishes fading in at (lines.length - 1) * 800 + 2000ms
      // Add extra 200ms for safety
      const delayMs = (lines.length - 1) * 800 + 2000 + 200
      
      const timer = setTimeout(() => {
        setInputVisible(true)
      }, delayMs)

      return () => clearTimeout(timer)
    }
  }, [currentStep])

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
    
    if (stepNumber < TOTAL_STEPS) {
      setTimeout(() => {
        router.push(`/reflect/${stepNumber + 1}`)
      }, 3000)
    } else {
      router.push("/reorientation")
    }
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
      <LayoutContainer className="reflection-page">
      <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
        <div className={`flex flex-col transition-opacity duration-1000 ${pageVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Step indicator */}
          <div className="mb-8 flex items-center gap-3">
            {REFLECTION_STEPS.map((s) => (
              <div
                key={s.step}
                className={`h-px flex-1 ${
                  s.step <= stepNumber ? "bg-foreground/30" : "bg-border"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          <StepPrompt
            label={`${currentStep.label} — Step ${stepNumber} of ${TOTAL_STEPS}`}
            prompt={currentStep.prompt}
          />

          <ReflectionInput
            onSubmit={handleSubmitReflection}
            isLoading={isLoading}
            placeholder="Let the words come without direction..."
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
