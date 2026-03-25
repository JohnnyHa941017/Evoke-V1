"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import { LayoutContainer } from "@/components/LayoutContainer"
import { PrimaryButton } from "@/components/PrimaryButton"
import { SecondaryLink } from "@/components/SecondaryLink"
import { clearSessionData, markSessionCompleted } from "@/lib/persistence"

export default function CompletePage() {
  const router = useRouter()
  const [backgroundVisible, setBackgroundVisible] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const [buttonVisible, setButtonVisible] = useState(false)
  const [buttonAnimating, setButtonAnimating] = useState(false)

  useEffect(() => {
    const bgTimer = setTimeout(() => setBackgroundVisible(true), 100)
    const contentTimer = setTimeout(() => {
      setContentVisible(true)
    }, 2100)
    
    // Button appears 2 seconds after content is displayed
    const buttonTimer = setTimeout(() => {
      setButtonVisible(true)
      setButtonAnimating(true)
    }, 4100)
    
    // Stop animation after 2 seconds (matches the fade-in duration)
    const buttonAnimationEndTimer = setTimeout(() => setButtonAnimating(false), 6100)

    return () => {
      clearTimeout(bgTimer)
      clearTimeout(contentTimer)
      clearTimeout(buttonTimer)
      clearTimeout(buttonAnimationEndTimer)
    }
  }, [router])

  function handleLeave() {
    // Mark session as completed before clearing
    const sessionId = localStorage.getItem("evoke-session-id")
    if (sessionId) {
      markSessionCompleted(sessionId)
    }
    
    // Clear session data
    clearSessionData()
    router.push("/")
  }

  return (
    <>
      <Header />
      <LayoutContainer className={`complete-page transition-opacity duration-2000 ${backgroundVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute bottom-0 left-0 w-full h-[40%] sm:h-[50%] bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
        <div className={`flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center`} style={{ filter: contentVisible ? 'blur(0px)' : 'blur(20px)', opacity: contentVisible ? 1 : 0, transition: 'filter 2000ms ease-out, opacity 2000ms ease-out' }} suppressHydrationWarning>
          {/* <div className="mb-8 h-px w-16 bg-accent" aria-hidden="true" /> */}
          <p className={`mb-8 sm:mb-10 md:mb-12 lg:mb-16 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-wide text-accent`} style={{ fontFamily: "Goudy Old Style" }}>
            EVOKE
          </p>
          
          <div className={`mb-12 sm:mb-4 md:mb-6 lg:mb-8 space-y-2 sm:space-y-3 md:space-y-4`}>
            {[
              "This moment doesn’t end here.",
"It may unfold quietly…",
"in the days ahead.",
"This space remains.",
            ].map((line, idx) => (
              <p
                key={idx}
                className={`font-serif leading-relaxed text-foreground text-[16px] sm:text-lg md:text-[20px] lg:text-[24px]`}
              >
                {line}
              </p>
            ))}
          </div>
          
          <div className={`transition-opacity duration-2000 mt-8 sm:mt-10 md:mt-12 lg:mt-16 ${buttonVisible ? 'opacity-100' : 'opacity-0'}`}>
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
            <div className={buttonAnimating ? 'button-animate' : ''}>
              <PrimaryButton onClick={handleLeave}>Leave Space</PrimaryButton>
            </div>
          </div>
        </div>
      </LayoutContainer>
    </>
  )
}
