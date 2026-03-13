"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { LayoutContainer } from "@/components/LayoutContainer"
import { PrimaryButton } from "@/components/PrimaryButton"

export default function ArrivalPage() {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  async function handleBegin() {
    setIsStarting(true)
    try {
      const res = await fetch("/api/start-session", { method: "POST" })
      const data = await res.json()
      console.log(data.sessionId)
      if (data.sessionId) {
        localStorage.setItem("evoke-session-id", data.sessionId)
        router.push("/reflect/1")
      }
    } catch {
      setIsStarting(false)
    }
  }

  return (
    <LayoutContainer className="arrival-page">
      <div className="flex flex-col items-center text-center">
        <p className="mb-8 text-4xl font-light tracking-wide text-accent" style={{ fontFamily: "Times New Roman" , fontSize: "6rem"}}>
          Evoke
        </p>
        <h1 className="mb-6 font-serif text-3xl leading-tight text-foreground md:text-4xl text-balance">
          Take a moment to arrive.
        </h1>
        <p className="mb-14 max-w-md text-base leading-relaxed text-muted-foreground">
          This is a contained reflective experience.
          <br />
          There is no urgency here.
        </p>
        <PrimaryButton onClick={handleBegin} disabled={isStarting}>
          {isStarting ? "Arriving..." : "Begin"}
        </PrimaryButton>
      </div>
    </LayoutContainer>
  )
}
