"use client"

import { Fragment, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { LayoutContainer } from "@/components/LayoutContainer"
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
  const [leaveButtonVisible, setLeaveButtonVisible] = useState(false)
  const [leaveButtonReady, setLeaveButtonReady] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [buttonFadingOut, setButtonFadingOut] = useState(false)
  const [backgroundFadingOut, setBackgroundFadingOut] = useState(false)
  const [visibleWordCounts, setVisibleWordCounts] = useState<number[]>(() =>
    sentences.map(() => 0)
  )

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    timers.push(setTimeout(() => setBackgroundVisible(true), 100))
    timers.push(setTimeout(() => setTitleVisible(true), 1000))

    let nextTimerDelay = 2500
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

    timers.push(setTimeout(() => setLeaveButtonVisible(true), lastWordRevealTime + 2000))
    timers.push(setTimeout(() => setLeaveButtonReady(true), lastWordRevealTime + 4000))

    return () => timers.forEach((t) => clearTimeout(t))
  }, [])

  function handleLeaveClick() {
    if (leaving) return
    setLeaving(true)
    const sessionId = localStorage.getItem("evoke-session-id")
    if (sessionId) {
      markSessionCompleted(sessionId)
    }
    clearSessionData()
    setTimeout(() => setButtonFadingOut(true), 2000)
    setTimeout(() => setBackgroundFadingOut(true), 4000)
    setTimeout(() => router.push("/"), 6000)
  }

  return (
    <LayoutContainer
      className="complete-page"
      style={{
        filter: backgroundVisible && !backgroundFadingOut ? "blur(0px)" : "blur(20px)",
        opacity: backgroundVisible && !backgroundFadingOut ? 1 : 0,
        transition: "filter 2000ms ease-out, opacity 2000ms ease-out",
      }}
    >
      <Header />
      <div className="absolute bottom-0 left-0 w-full h-[40%] sm:h-[50%] bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

      <div
        className={`flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center transition-opacity duration-2000 ${
          !buttonFadingOut ? "opacity-100" : "opacity-0"
        }`}
      >
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
          className={`mb-2 sm:mb-2 md:mb-6 lg:mb-10 space-y-1 sm:space-y-2 min-h-[120px] sm:min-h-[140px] md:min-h-[160px] lg:min-h-[180px] text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-relaxed sm:leading-loose text-black text-balance font-light transition-opacity duration-2000 ${
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

        <button
          onClick={handleLeaveClick}
          disabled={leaving || !leaveButtonVisible}
          aria-label={leaving ? "Leaving the space" : "Leave Space"}
          className={`mt-6 sm:mt-8 md:mt-10 whitespace-nowrap rounded-full border-2 border-[#b8a88a] bg-[#b8a88a]/15 px-8 sm:px-12 py-3.5 sm:py-4 tracking-wide text-white disabled:cursor-default ${
            leaveButtonReady && !leaving
              ? "hover:bg-[#b8a88a]/30 hover:border-[#c4b89a]"
              : ""
          }`}
          style={{
            fontFamily: "ITC Bradley Hand",
            fontSize: "clamp(14px, 3.2vw, 22px)",
            opacity: leaveButtonVisible ? 1 : 0,
            pointerEvents: leaveButtonReady && !leaving ? "auto" : "none",
            willChange: "opacity",
            transform: "translateZ(0)",
            transition:
              "opacity 2000ms ease-out, background-color 300ms ease-out, border-color 300ms ease-out",
          }}
        >
          {leaving ? "Leaving the space." : "Leave Space"}
        </button>
      </div>
    </LayoutContainer>
  )
}
