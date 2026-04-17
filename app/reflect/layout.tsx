"use client"

import { useEffect, useState } from "react"

export default function ReflectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [bgVisible, setBgVisible] = useState(false)

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

  return (
    <>
      {/* Persistent background — stays mounted across step transitions to prevent flicker */}
      <div
        className="fixed inset-0 -z-20"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          opacity: bgVisible ? 1 : 0,
          filter: bgVisible ? "blur(0px)" : "blur(20px)",
          transition: "opacity 2000ms ease-out, filter 2000ms ease-out",
          willChange: "opacity",
        }}
      />
      {children}
    </>
  )
}
