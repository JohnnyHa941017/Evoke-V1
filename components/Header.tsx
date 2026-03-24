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
    <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-2 py-2 md:px-10">
      <Link
        href="/"
        onClick={handleEvokeClick}
        className="flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
        aria-label="Return to home"
      >
        <Image
          src="/logo.png"
          alt="Evoke Logo"
          width={40}
          height={40}
          priority
          className="w-20 h-20 object-contain"
        />
      </Link>
      {/* <div className="h-px w-12 bg-border" aria-hidden="true" /> */}
    </header>
  )
}
