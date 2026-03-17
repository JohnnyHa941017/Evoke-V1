"use client"

import Link from "next/link"
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
    <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-5 md:px-10">
      <Link
        href="/"
        onClick={handleEvokeClick}
        className="w-10 h-10 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
        aria-label="Return to home"
      >
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          className="w-10 h-10"
        >
          {/* Outer circle representing the whole self */}
          <circle cx="50" cy="50" r="45" strokeWidth="1.5" opacity="0.6" />

          {/* Inner circle representing inner reflection */}
          <circle cx="50" cy="50" r="30" strokeWidth="1.5" opacity="0.8" />

          {/* Vertical line of reflection/symmetry */}
          <line x1="50" y1="20" x2="50" y2="80" strokeWidth="1" opacity="0.5" />

          {/* Left arc - representing introspection */}
          <path
            d="M 50 30 Q 35 50 50 70"
            strokeWidth="1.5"
            opacity="0.7"
          />

          {/* Right arc - representing reflection */}
          <path
            d="M 50 30 Q 65 50 50 70"
            strokeWidth="1.5"
            opacity="0.7"
          />
        </svg>
      </Link>
      <div className="h-px w-12 bg-border" aria-hidden="true" />
    </header>
  )
}
