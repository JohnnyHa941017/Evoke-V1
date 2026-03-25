"use client"

import { Fragment, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { LayoutContainer } from "@/components/LayoutContainer"
import { PrimaryButton } from "@/components/PrimaryButton"
import { clearSessionData, markSessionCompleted } from "@/lib/persistence"

const sentences = [
  "This moment doesn't end here.",
  "It may unfold quietly…",
  "in the days ahead.",
  "This space remains.",
]

export default function CompletePage() {
  const router = useRouter()
  const [backgroundVisible, setBackgroundVisible] = useState(false)
  const [titleVisible, setTitleVisible] = useState(false)
  const [visibleWordCounts, setVisibleWordCounts] = useState<number[]>(() =>
    sentences.map(() => 0)
  )
  const [buttonVisible, setButtonVisible] = useState(false)
  const [buttonAnimating, setButtonAnimating] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    timers.push(setTimeout(() => setBackgroundVisible(true), 100))
    timers.push(setTimeout(() => setTitleVisible(true), 4100))

    let nextTimerDelay = 8100
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

    timers.push(
      setTimeout(() => {
        setButtonVisible(true)
        setButtonAnimating(true)
      }, lastWordRevealTime + 2000)
    )

    timers.push(
      setTimeout(() => setButtonAnimating(false), lastWordRevealTime + 4000)
    )

    return () => timers.forEach((t) => clearTimeout(t))
  }, [])

  function handleLeave() {
    const sessionId = localStorage.getItem("evoke-session-id")
    if (sessionId) {
      markSessionCompleted(sessionId)
    }
    clearSessionData()
    router.push("/")
  }

  return (
    <LayoutContainer
      className="complete-page"
      style={{
        filter: backgroundVisible ? "blur(0px)" : "blur(20px)",
        opacity: backgroundVisible ? 1 : 0,
        transition: "filter 2000ms ease-out, opacity 2000ms ease-out",
      }}
    >
      <Header />
      <div className="absolute bottom-0 left-0 w-full h-[40%] sm:h-[50%] bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
        {/* <p
          className="mb-6 sm:mb-4 md:mb-8 lg:mb-10 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-wide text-accent"
          style={{
            fontFamily: "Goudy Old Style",
            opacity: titleVisible ? 1 : 0,
            filter: titleVisible ? "blur(0px)" : "blur(20px)",
            transition: "filter 2000ms ease-out, opacity 1000ms ease-out",
          }}
          suppressHydrationWarning
        >
          EVOKE
        </p> */}

        <div
          className={`mb-2 sm:mb-2 md:mb-6 lg:mb-10 space-y-1 sm:space-y-2 min-h-[120px] sm:min-h-[140px] md:min-h-[160px] lg:min-h-[180px] text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-relaxed sm:leading-loose text-foreground text-balance font-light transition-opacity duration-2000 ${
            visibleWordCounts.some((count) => count > 0) ? "opacity-100" : "opacity-0"
          }`}
          style={{ fontFamily: "Goudy Old Style", maxWidth: "100%", wordWrap: "break-word" }}
        >
          {sentences.map((sentence, sentenceIndex) => {
            const words = sentence.split(" ")
            const visibleCount = visibleWordCounts[sentenceIndex] ?? 0
            return (
              <p key={sentenceIndex} className="transition-opacity duration-200">
                {words.map((word, wordIndex) => (
                  <Fragment key={wordIndex}>
                    <span
                      className={`inline-block transition-opacity duration-2000 ${
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

        <div className={`transition-opacity duration-2000 ${buttonVisible ? "opacity-100" : "opacity-0"}`}>
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
          <div className={buttonAnimating ? "button-animate" : ""}>
            <PrimaryButton onClick={handleLeave}>Leave Space</PrimaryButton>
          </div>
        </div>
      </div>
    </LayoutContainer>
  )
}
