"use client"

import { useState, use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { LayoutContainer } from "@/components/LayoutContainer"
import { StepPrompt } from "@/components/StepPrompt"
import { ReflectionInput } from "@/components/ReflectionInput"
import { REFLECTION_STEPS, TOTAL_STEPS } from "@/lib/prompts/reflectionPrompts"

export default function ReflectionStepPage({
  params,
}: {
  params: Promise<{ step: string }>
}) {
  const { step: stepParam } = use(params)
  const stepNumber = parseInt(stepParam, 10)
  const router = useRouter()

  const [reflection, setReflection] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageVisible, setPageVisible] = useState(false)

  useEffect(() => {
    setPageVisible(true)
  }, [])

  const currentStep = REFLECTION_STEPS.find((s) => s.step === stepNumber)

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
    try {
      const sessionId = localStorage.getItem("evoke-session-id")
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
    } catch {
      setReflection("A moment of stillness occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleContinue() {
    setIsSubmitting(true)
    if (stepNumber < TOTAL_STEPS) {
      setTimeout(() => {
        router.push(`/reflect/${stepNumber + 1}`)
      }, 3000);
    } else {
      router.push("/reorientation")
    }
  }

  function handleBack() {
    if (stepNumber > 1) {
      router.push(`/reflect/${stepNumber - 1}`)
    } else if(!stepNumber) {
    //  router.push("/")
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
          />
        </div>
      </LayoutContainer>
    </>
  )
}
