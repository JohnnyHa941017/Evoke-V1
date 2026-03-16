"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { LayoutContainer } from "@/components/LayoutContainer"
import { PrimaryButton } from "@/components/PrimaryButton"
import { SecondaryLink } from "@/components/SecondaryLink"

export default function CompletePage() {
  const router = useRouter()

  function handleLeave() {
    localStorage.removeItem("evoke-session-id")
    router.push("/")
  }

  return (
    <>
      <Header />
      <LayoutContainer className="complete-page">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 h-px w-16 bg-accent" aria-hidden="true" />
          <h1 className="mb-4 font-serif text-3xl text-foreground md:text-4xl">
            Complete
          </h1>
          <p className="mb-14 text-base leading-relaxed text-muted-foreground">
            Your journey is now complete.
          </p>
          <div className="flex flex-col items-center gap-5">
            {/* <SecondaryLink href="/review">
              Stay & Review Reflections
            </SecondaryLink> */}
            <PrimaryButton onClick={handleLeave}>Leave Space</PrimaryButton>
          </div>
        </div>
      </LayoutContainer>
    </>
  )
}
