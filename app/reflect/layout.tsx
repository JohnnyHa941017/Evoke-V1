"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { REFLECTION_STEPS } from "@/lib/prompts/reflectionPrompts"

export default function ReflectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [bgVisible, setBgVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768)
    checkScreen()
    window.addEventListener("resize", checkScreen)
    return () => window.removeEventListener("resize", checkScreen)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setBgVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const bgImage = isMobile ? "/reflection-mobile.png" : "/reflection.png"

  const stepMatch = pathname?.match(/^\/reflect\/(\d+)/)
  const currentStep = stepMatch ? parseInt(stepMatch[1], 10) : null
  const stepMeta = currentStep
    ? REFLECTION_STEPS.find((s) => s.step === currentStep)
    : null
  const stepBg = stepMeta
    ? isMobile
      ? stepMeta.background_mobile
      : stepMeta.background_desktop
    : null
  const backdropMatchesStep = !stepBg || stepBg === bgImage
  const showBackdrop = bgVisible && backdropMatchesStep

  return (
    <>
      {/* Persistent background — stays mounted across step transitions to prevent flicker.
          Hidden when the active step uses a different bg image so it doesn't leak through
          during that step's fade transitions. */}
      <div
        className="fixed inset-0 -z-20"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          opacity: showBackdrop ? 1 : 0,
          filter: showBackdrop ? "blur(0px)" : "blur(20px)",
          transition: "opacity 2000ms ease-out, filter 2000ms ease-out",
          willChange: "opacity",
        }}
      />
      {children}
    </>
  )
}
