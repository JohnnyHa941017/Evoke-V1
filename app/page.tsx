"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LayoutContainer } from "@/components/LayoutContainer"
import { PrimaryButton } from "@/components/PrimaryButton"
import { restoreSessionState, persistSessionState } from "@/lib/persistence"

export default function ArrivalPage() {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)
  const [buttonFadingOut, setButtonFadingOut] = useState(false)
  const [backgroundVisible, setBackgroundVisible] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const [titleVisible, setTitleVisible] = useState(false)
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [buttonVisible, setButtonVisible] = useState(false)
  const [buttonAnimating, setButtonAnimating] = useState(false)
  useEffect(() => {
    // Check if there's an existing uncompleted session
    const { sessionId, currentStep, completed } = restoreSessionState()
    if (sessionId && currentStep && !completed) {
      // Resume existing session
      router.push(`/reflect/${currentStep}`)
      return
    }

    const bgTimer = setTimeout(() => setBackgroundVisible(true), 100)
    const contentTimer = setTimeout(() => {
      setContentVisible(true)
      setTitleVisible(true)
    }, 2100)
    
    // Lines appear 1 second after title fades (3 seconds after content visible)
    // and then appear one by one with 800ms between each
    const lineTimers = [
      setTimeout(() => setVisibleLines((prev) => [...prev, 0]), 4100),
      setTimeout(() => setVisibleLines((prev) => [...prev, 1]), 5100),
      setTimeout(() => setVisibleLines((prev) => [...prev, 2]), 6100),
      setTimeout(() => setVisibleLines((prev) => [...prev, 3]), 7100),
    ]
    
    // Button appears 2 seconds after the last line
    const buttonTimer = setTimeout(() => {
      setButtonVisible(true)
      setButtonAnimating(true)
    }, 9100)
    
    // Stop animation after 2 seconds (matches the fade-in duration)
    const buttonAnimationEndTimer = setTimeout(() => setButtonAnimating(false), 11100)

    return () => {
      clearTimeout(bgTimer)
      clearTimeout(contentTimer)
      clearTimeout(buttonTimer)
      clearTimeout(buttonAnimationEndTimer)
      lineTimers.forEach(timer => clearTimeout(timer))
    }
  }, [router])

  async function handleBegin() {
    setIsStarting(true)
    try {
      // Create a new session
      const res = await fetch("/api/start-session", { method: "POST" })
      const { sessionId } = await res.json()
      
      // Save session state to localStorage
      persistSessionState(sessionId, 1, [], false)
      
      setTimeout(() => {
        setButtonFadingOut(true)
        setTimeout(() => {
          router.push("/reflect/1")
        }, 2000)
      }, 2000)
    } catch (error) {
      console.error("Failed to begin session:", error)
      setIsStarting(false)
    }
  }

  return (
    <LayoutContainer className={`arrival-page transition-opacity duration-2000 ${backgroundVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
      <div className={`flex flex-col items-center text-center transition-opacity duration-1000 ${contentVisible && !buttonFadingOut ? 'opacity-100' : 'opacity-0'}`}>
        <p className={`mb-20 text-4xl font-light tracking-wide text-accent transition-opacity duration-1000 ${titleVisible ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: "Goudy Old Style" , fontSize: "6rem", filter: titleVisible ? 'blur(0px)' : 'blur(20px)', transition: 'filter 2000ms ease-out' }}>
          EVOKE
        </p>
        
        <div className={`mb-20 space-y-1 min-h-[160px] text-2xl leading-relaxed text-foreground md:text-3xl text-balance font-light transition-opacity duration-2000 ${visibleLines.length > 0 ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: "Gabriola" }}>
          {[
            "This space is different.",
            "You are not here to perform or complete something.",
            "You are here to arrive exactly as you are.",
            "This space will be here.",
          ].map((line, idx) => (
            <p
              key={idx}
              className={`transition-opacity duration-2000 ${
                visibleLines.includes(idx) ? "opacity-100" : "opacity-0"
              }`}
            >
              {line}
            </p>
          ))}
        </div>

        <div className={`transition-opacity duration-2000 ${buttonVisible && !buttonFadingOut ? 'opacity-100' : 'opacity-0'}`}>
          <style>{`
            @keyframes buttonBrighten {
              0% { filter: brightness(1); }
              50% { filter: brightness(1.4); }
              100% { filter: brightness(1); }
            }
            .button-animate {
              animation: buttonBrighten 2s ease-in-out forwards;
            }
          `}</style>
          <PrimaryButton onClick={handleBegin} disabled={isStarting} className={buttonAnimating ? 'button-animate' : ''}>
            {isStarting ? "Entering..." : "Enter the space"}
          </PrimaryButton>
        </div>
      </div>
    </LayoutContainer>
  )
}
