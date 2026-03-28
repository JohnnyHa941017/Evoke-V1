"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { clearSessionData } from "@/lib/persistence"

export function Header() {
  const router = useRouter()

  function handleEvokeClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    // Clear session data when clicking logo
    clearSessionData()
    // Navigate to home
    router.push("/")
  }

  return (
    <header className="fixed top-6 left-1/2 z-50 -translate-x-1/2 text-[12px] uppercase tracking-[0.25em] text-white/70 opacity-35" 
      style={{
            fontFamily: "Goudy Old Style",
            transition: "filter 2000ms ease-out",
          }}>
      <Link
        href="/"
        onClick={handleEvokeClick}
        className="flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
        aria-label="Return to home"
      >
        Evoke
      </Link>
      {/* <div className="h-px w-12 bg-border" aria-hidden="true" /> */}
    </header>
  )
}
