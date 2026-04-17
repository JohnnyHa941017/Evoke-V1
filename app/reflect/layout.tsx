"use client"

import { useEffect, useState } from "react"

export default function ReflectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768)
    checkScreen()
    window.addEventListener("resize", checkScreen)
    return () => window.removeEventListener("resize", checkScreen)
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
        }}
      />
      {children}
    </>
  )
}
