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
  const [backgroundFadingOut, setBackgroundFadingOut] = useState(false)
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
      
      // First, fade out content (2 seconds)
      setTimeout(() => {
        setButtonFadingOut(true)
      }, 2000)
      
      // Then, fade out background (after content is done, for 2 more seconds)
      setTimeout(() => {
        setBackgroundFadingOut(true)
      }, 4000)
      
      // Finally, navigate (after background is done fading)
      setTimeout(() => {
        router.push("/reflect/1")
      }, 6000)
    } catch (error) {
      console.error("Failed to begin session:", error)
      setIsStarting(false)
    }
  }

  return (
    <LayoutContainer className={`arrival-page`} style={{ filter: backgroundVisible && !backgroundFadingOut ? 'blur(0px)' : 'blur(20px)', opacity: backgroundVisible && !backgroundFadingOut ? 1 : 0, transition: 'filter 2000ms ease-out, opacity 2000ms ease-out' }}>
      <div className="absolute bottom-0 left-0 w-full h-[40%] sm:h-[50%] bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
      <div className={`flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center transition-opacity duration-2000 ${contentVisible && !buttonFadingOut ? 'opacity-100' : 'opacity-0'}`}>
        <p className={`mb-6 sm:mb-4 md:mb-8 lg:mb-10 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-wide text-accent transition-opacity duration-1000 ${titleVisible ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: "Goudy Old Style", filter: titleVisible ? 'blur(0px)' : 'blur(20px)', transition: 'filter 2000ms ease-out' }} suppressHydrationWarning>
          EVOKE
        </p>
        
        <div className={`mb-2 sm:mb-2 md:mb-6 lg:mb-10 space-y-1 sm:space-y-2 min-h-[120px] sm:min-h-[140px] md:min-h-[160px] lg:min-h-[180px] text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-relaxed sm:leading-loose md:leading-relaxed text-foreground text-balance font-light transition-opacity duration-2000 ${visibleWordCounts.some((count) => count > 0) ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: "Goudy Old Style", maxWidth: '100%', wordWrap: 'break-word' }}>
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
