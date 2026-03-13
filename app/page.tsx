"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LayoutContainer } from "@/components/LayoutContainer"
import { PrimaryButton } from "@/components/PrimaryButton"

export default function ArrivalPage() {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)
  const [buttonFadingOut, setButtonFadingOut] = useState(false)
  const [backgroundVisible, setBackgroundVisible] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)

  useEffect(() => {
    const bgTimer = setTimeout(() => setBackgroundVisible(true), 100)
    const contentTimer = setTimeout(() => setContentVisible(true), 2100)
    return () => {
      clearTimeout(bgTimer)
      clearTimeout(contentTimer)
    }
  }, [])

  async function handleBegin() {
    setIsStarting(true)
    try {
      const res = await fetch("/api/start-session", { method: "POST" })
      const data = await res.json()
      console.log(data.sessionId)
      if (data.sessionId) {
        localStorage.setItem("evoke-session-id", data.sessionId)
        // Wait 2 seconds with "Arriving...", then fade out button for 2 seconds, then navigate
        setTimeout(() => {
          setButtonFadingOut(true)
          setTimeout(() => {
            router.push("/reflect/1")
          }, 2000)
        }, 2000)
      }
    } catch {
      setIsStarting(false)
    }
  }

  return (
    <LayoutContainer className={`arrival-page transition-opacity duration-2000 ${backgroundVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
      <div className={`flex flex-col items-center text-center transition-opacity duration-2000 ${contentVisible && !buttonFadingOut ? 'opacity-100' : 'opacity-0'}`}>
        <p className="mb-6 text-4xl font-light tracking-wide text-accent" style={{ fontFamily: "Goudy Old Style" , fontSize: "6rem"}}>
          EVOKE
        </p>
        <h1 className="mb-10 font-serif text-3xl leading-tight text-foreground md:text-4xl text-balance">
          Relax your mind and begin your journey.
        </h1>
        <div className={`transition-opacity duration-2000 ${buttonFadingOut ? 'opacity-0' : 'opacity-100'}`}>
          <PrimaryButton onClick={handleBegin} disabled={isStarting}>
            {isStarting ? "Arriving..." : "Begin Journey"}
          </PrimaryButton>
        </div>
      </div>
    </LayoutContainer>
  )
}
