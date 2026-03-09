"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { LayoutContainer } from "@/components/LayoutContainer"
import { StepPrompt } from "@/components/StepPrompt"
import { PrimaryButton } from "@/components/PrimaryButton"
import { ReflectionDisplay } from "@/components/ReflectionDisplay"

export default function ReorientationPage() {
  const router = useRouter()
  const [text, setText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reflection, setReflection] = useState<string | null>(null)

  async function handleComplete() {

    const sessionId = localStorage.getItem("evoke-session-id")
    const res = await fetch("/api/reflect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        step: 0,
        input: text,
      }),
    })
    const data = await res.json()
    setReflection(data.reflection)

    //-------------------------

    if (!text.trim()) return
    setIsSubmitting(true)
    try {
      const sessionId = localStorage.getItem("evoke-session-id")
      await fetch("/api/complete-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, reorientation: text.trim() }),
      })
      setTimeout(() => {
        router.push("/complete")
      }, 5000);
    } catch {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <LayoutContainer>
        <div className="flex flex-col">
          <StepPrompt
            label="Reorientation"
            prompt="Reading your words again — what feels quieter now?"
          />
          <div className="flex flex-col gap-6">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What has settled..."
              rows={5}
              className="w-full resize-none rounded-lg border border-border bg-card px-5 py-4 font-sans text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              aria-label="Reorientation input"
            />
            <div>
              <PrimaryButton
                onClick={handleComplete}
                disabled={!text.trim() || isSubmitting}
              >
                {isSubmitting ? "Completing..." : "Complete"}
              </PrimaryButton>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <ReflectionDisplay reflection={reflection} />
          </div>
        </div>
      </LayoutContainer>
    </>
  )
}
