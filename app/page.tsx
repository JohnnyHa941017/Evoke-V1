"use client"

import { useRouter } from "next/navigation"
import { Fragment, useEffect, useState } from "react"
import { LayoutContainer } from "@/components/LayoutContainer"
import { PrimaryButton } from "@/components/PrimaryButton"
import { restoreSessionState, persistSessionState } from "@/lib/persistence"

const sentences = [
  "This space is different.",
  "You are not here to perform or complete something.",
  "You are here to arrive exactly as you are.",
  "This space will be here.",
]

export default function ArrivalPage() {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)
  const [buttonFadingOut, setButtonFadingOut] = useState(false)
  const [backgroundVisible, setBackgroundVisible] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const [titleVisible, setTitleVisible] = useState(false)
  const [visibleWordCounts, setVisibleWordCounts] = useState<number[]>(() =>
    sentences.map(() => 0)
  )
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

    // Words appear 1 second after title fades (3 seconds after content visible).
    // Each word fades in over 0.8s, with 0.3s between words.
    // After an entire sentence is displayed, the next sentence begins after a random delay between 2-3 seconds.
    const timers: ReturnType<typeof setTimeout>[] = []
    let nextTimerDelay = 4100
    let lastWordRevealTime = nextTimerDelay

    sentences.forEach((sentence, sentenceIndex) => {
      const words = sentence.split(" ")
      words.forEach((_, wordIndex) => {
        timers.push(
          setTimeout(() => {
            setVisibleWordCounts((prev) => {
              const next = [...prev]
              if (next[sentenceIndex] >= wordIndex + 1) return prev
              next[sentenceIndex] = wordIndex + 1
              return next
            })
          }, nextTimerDelay)
        )
        lastWordRevealTime = nextTimerDelay
        nextTimerDelay += 300
      })
      nextTimerDelay += 2000 + Math.random() * 1000
    })

    const buttonTimer = setTimeout(() => {
      setButtonVisible(true)
      setButtonAnimating(true)
    }, lastWordRevealTime + 2000)

    const buttonAnimationEndTimer = setTimeout(() => setButtonAnimating(false), lastWordRevealTime + 4000)

    return () => {
      clearTimeout(bgTimer)
      clearTimeout(contentTimer)
      clearTimeout(buttonTimer)
      clearTimeout(buttonAnimationEndTimer)
      timers.forEach((timer) => clearTimeout(timer))
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
    <LayoutContainer className={`arrival-page`} style={{ filter: backgroundVisible ? 'blur(0px)' : 'blur(20px)', opacity: backgroundVisible ? 1 : 0, transition: 'filter 2000ms ease-out, opacity 2000ms ease-out' }}>
      <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
      <div className={`flex flex-col items-center text-center transition-opacity duration-1000 ${contentVisible && !buttonFadingOut ? 'opacity-100' : 'opacity-0'}`}>
        <p className={`mb-20 text-4xl font-light tracking-wide text-accent transition-opacity duration-1000 ${titleVisible ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: "Goudy Old Style" , fontSize: "6rem", filter: titleVisible ? 'blur(0px)' : 'blur(20px)', transition: 'filter 2000ms ease-out' }} suppressHydrationWarning>
          EVOKE
        </p>
        
        <div className={`mb-20 space-y-1 min-h-[160px] text-3xl leading-relaxed text-foreground md:text-4xl text-balance font-light transition-opacity duration-2000 ${visibleWordCounts.some((count) => count > 0) ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: "Gabriola" }}>
          {sentences.map((sentence, sentenceIndex) => {
            const words = sentence.split(" ")
            const visibleCount = visibleWordCounts[sentenceIndex] ?? 0

            return (
              <p key={sentenceIndex} className="transition-opacity duration-800">
                {words.map((word, wordIndex) => (
                  <Fragment key={wordIndex}>
                    <span
                      className={`inline-block transition-opacity duration-800 ${
                        wordIndex < visibleCount ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {word}
                    </span>
                    {wordIndex < words.length - 1 ? (
                      <span className="inline-block opacity-100">&nbsp;</span>
                    ) : null}
                  </Fragment>
                ))}
              </p>
            )
          })}
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
