"use client"

import { useRouter } from "next/navigation"
import { Fragment, useEffect, useState, useRef } from "react"
import { LayoutContainer } from "@/components/LayoutContainer"
import { restoreSessionState, persistSessionState, clearSessionData } from "@/lib/persistence"

const sentences = [
  "This space is different.",
  "You are not here to perform or complete something.",
  "You are here to arrive exactly as you are.",
  "This space will be here.",
]

type ModalPhase = "settling" | "choosing" | "echo"

export default function ArrivalPage() {
  const router = useRouter()
  const [buttonFadingOut, setButtonFadingOut] = useState(false)
  const [backgroundVisible, setBackgroundVisible] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const [titleVisible, setTitleVisible] = useState(false)
  const [enterButtonVisible, setEnterButtonVisible] = useState(false)
  const [enterButtonReady, setEnterButtonReady] = useState(false)
  const [entering, setEntering] = useState(false)
  const [visibleWordCounts, setVisibleWordCounts] = useState<number[]>(() =>
    sentences.map(() => 0)
  )

  const [backgroundFadingOut, setBackgroundFadingOut] = useState(false)

  // Resume modal
  const [modalPhase, setModalPhase] = useState<ModalPhase | null>(null)
  const [modalContentVisible, setModalContentVisible] = useState(false)
  const [resumeStep, setResumeStep] = useState<number | null>(null)
  const [softEcho, setSoftEcho] = useState<string>("")

  const arrivalCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const { sessionId, currentStep, completed, reflections } = restoreSessionState()

    if (sessionId && currentStep && !completed) {
      setResumeStep(currentStep)
      setBackgroundVisible(true)
      // Phase 1: settling
      setModalPhase("settling")
      setTimeout(() => setModalContentVisible(true), 400)
      // Auto-advance to choosing after 2.5s
      setTimeout(() => {
        setModalContentVisible(false)
        setTimeout(() => {
          setModalPhase("choosing")
          setModalContentVisible(true)
        }, 800)
      }, 3200)
      return
    }

    const cleanup = startArrivalSequence()
    if (cleanup) arrivalCleanupRef.current = cleanup
    return cleanup
  }, [])

  function startArrivalSequence() {
    const bgTimer = setTimeout(() => setBackgroundVisible(true), 100)
    const contentTimer = setTimeout(() => {
      setContentVisible(true)
      setTitleVisible(true)
    }, 4100)

    const timers: ReturnType<typeof setTimeout>[] = []
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

    const buttonTimer = setTimeout(() => {
      setEnterButtonVisible(true)
    }, lastWordRevealTime + 2000)

    const buttonReadyTimer = setTimeout(() => {
      setEnterButtonReady(true)
    }, lastWordRevealTime + 2000 + 2000)

    return () => {
      clearTimeout(bgTimer)
      clearTimeout(contentTimer)
      clearTimeout(buttonTimer)
      clearTimeout(buttonReadyTimer)
      timers.forEach((t) => clearTimeout(t))
    }
  }

  async function handleResumeContinue() {
    const { reflections } = restoreSessionState()

    // Fade out choosing phase content (2s)
    setModalContentVisible(false)

    // Fetch soft echo while fading
    let echo = ""
    try {
      const res = await fetch("/api/soft-echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reflections: reflections.map((r) => ({ step: r.step, input: r.input })),
        }),
      })
      const data = await res.json()
      echo = data.echo || ""
    } catch {
      // proceed without echo
    }

    // After content fades out (2s), fade out background (2s)
    setTimeout(() => {
      setBackgroundFadingOut(true)

      // After background fades out (2s), show echo phase
      setTimeout(() => {
        setSoftEcho(echo)
        setModalPhase("echo")
        setModalContentVisible(true)
        // Navigate after holding the echo
        setTimeout(() => {
          setModalContentVisible(false)
          setTimeout(() => {
            router.push(`/reflect/${resumeStep}`)
          }, 1200)
        }, 3000)
      }, 2000)
    }, 2000)
  }

  function handleResumeBeginAgain() {
    clearSessionData()
    setModalContentVisible(false)
    setTimeout(() => {
      setModalPhase(null)
      setBackgroundVisible(false)
      setContentVisible(false)
      setTitleVisible(false)
      setEnterButtonVisible(false)
      setEnterButtonReady(false)
      setEntering(false)
      setButtonFadingOut(false)
      setVisibleWordCounts(sentences.map(() => 0))
      const cleanup = startArrivalSequence()
      if (cleanup) arrivalCleanupRef.current = cleanup
    }, 2000)
  }

  function handleEnterClick() {
    if (entering) return
    setEntering(true)
    handleBegin()
  }

  async function handleBegin() {
    try {
      const res = await fetch("/api/start-session", { method: "POST" })
      const { sessionId } = await res.json()

      persistSessionState(sessionId, 1, [], false)

      setTimeout(() => setButtonFadingOut(true), 2000)
      setTimeout(() => setBackgroundFadingOut(true), 4000)
      setTimeout(() => router.push("/reflect/1"), 6000)
    } catch (error) {
      console.error("Failed to begin session:", error)
    }
  }

  return (
    <LayoutContainer
      className="arrival-page"
      style={{
        filter: backgroundVisible && !backgroundFadingOut ? "blur(0px)" : "blur(20px)",
        opacity: backgroundVisible && !backgroundFadingOut ? 1 : 0,
        transition: "filter 2000ms ease-out, opacity 2000ms ease-out",
      }}
    >
      <div className="absolute bottom-0 left-0 w-full h-[40%] sm:h-[50%] bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

      {/* Re-entry modal */}
      {modalPhase !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-6">
          {/* settling */}
          {modalPhase === "settling" && (
            <div
              className="text-center px-4 sm:px-6"
              style={{
                opacity: modalContentVisible ? 1 : 0,
                transition: "opacity 2000ms ease-out",
              }}
            >
              <p
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-relaxed sm:leading-loose text-white"
                style={{ fontFamily: "Goudy Old Style" }}
              >
                You&#39;re here again.
                <br />
                <span className="text-[#d4c4a8]">Take a moment to settle.</span>
              </p>
            </div>
          )}

          {/* choosing */}
          {modalPhase === "choosing" && (
            <div
              className={`w-full max-w-[90vw] sm:max-w-md md:max-w-lg text-center transition-opacity duration-2000 ease-out ${
      modalContentVisible ? "opacity-100" : "opacity-0"
    }`}
            >
              <div className="flex flex-col gap-4 sm:gap-5">
                <button
                  onClick={handleResumeContinue}
                  className="w-full whitespace-nowrap rounded-full border-2 border-[#b8a88a] bg-[#b8a88a]/15 px-6 sm:px-10 py-3.5 sm:py-4 tracking-wide text-white hover:bg-[#b8a88a]/30 hover:border-[#c4b89a] transition-all duration-500"
                  style={{ fontFamily: "ITC Bradley Hand", fontSize: "clamp(14px, 3.2vw, 22px)" }}
                >
                  Continue from where you were
                </button>
                <button
                  onClick={handleResumeBeginAgain}
                  className="w-full whitespace-nowrap rounded-full border-2 border-white/60 bg-white/10 px-6 sm:px-10 py-3.5 sm:py-4 tracking-wide text-white/90 hover:bg-white/20 hover:border-white/80 transition-all duration-500"
                  style={{ fontFamily: "ITC Bradley Hand", fontSize: "clamp(14px, 3.2vw, 22px)" }}
                >
                  Begin again
                </button>
              </div>
            </div>
          )}

          {/* echo */}
          {modalPhase === "echo" && (
            <div
              className="text-center max-w-sm px-4"
              style={{
                opacity: modalContentVisible ? 1 : 0,
                transition: "opacity 2000ms ease-out",
              }}
            >
              <p
                className="text-lg sm:text-xl font-light leading-relaxed text-white/70 italic"
                style={{ fontFamily: "Goudy Old Style" }}
              >
                {softEcho}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Arrival content */}
      <div
        className={`flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center transition-opacity duration-2000 ${
          modalPhase === null && contentVisible && !buttonFadingOut ? "opacity-100" : "opacity-0"
        }`}
      >
        <p
          className={`mb-6 sm:mb-4 md:mb-8 lg:mb-10 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-wide text-accent transition-opacity duration-1000 ${
            titleVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{
            fontFamily: "Goudy Old Style",
            filter: titleVisible ? "blur(0px)" : "blur(20px)",
            transition: "filter 2000ms ease-out",
          }}
          suppressHydrationWarning
        >
          EVOKE
        </p>

        <div
          className={`mb-2 sm:mb-2 md:mb-6 lg:mb-10 space-y-1 sm:space-y-2 min-h-[120px] sm:min-h-[140px] md:min-h-[160px] lg:min-h-[180px] text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl leading-relaxed sm:leading-loose md:leading-relaxed text-black text-balance font-light transition-opacity duration-2000 ${
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
          onClick={handleEnterClick}
          disabled={entering || !enterButtonVisible}
          aria-label={entering ? "Entering the space" : "Enter the space"}
          className={`mt-6 sm:mt-8 md:mt-10 whitespace-nowrap rounded-full border-2 border-[#b8a88a] bg-[#b8a88a]/15 px-8 sm:px-12 py-3.5 sm:py-4 tracking-wide text-white disabled:cursor-default ${
            enterButtonReady && !entering
              ? "hover:bg-[#b8a88a]/30 hover:border-[#c4b89a]"
              : ""
          }`}
          style={{
            fontFamily: "ITC Bradley Hand",
            fontSize: "clamp(14px, 3.2vw, 22px)",
            opacity: enterButtonVisible ? 1 : 0,
            pointerEvents: enterButtonReady && !entering ? "auto" : "none",
            willChange: "opacity",
            transform: "translateZ(0)",
            transition:
              "opacity 2000ms ease-out, background-color 300ms ease-out, border-color 300ms ease-out",
          }}
        >
          {entering ? "Entering the space." : "Enter the space"}
        </button>
      </div>
    </LayoutContainer>
  )
}
