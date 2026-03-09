"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import { LayoutContainer } from "@/components/LayoutContainer"
import { ReflectionDisplay } from "@/components/ReflectionDisplay"
import { SecondaryLink } from "@/components/SecondaryLink"

interface ReviewReflection {
  step: number
  input: string
  response: string
}

export default function ReviewPage() {
  const [reflections, setReflections] = useState<ReviewReflection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchReflections() {
      const sessionId = localStorage.getItem("evoke-session-id")
      if (!sessionId) {
        setIsLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/reflections?sessionId=${sessionId}`)
        const data = await res.json()
        setReflections(data.reflections || [])
      } catch {
        // silently handle
      } finally {
        setIsLoading(false)
      }
    }
    fetchReflections()
  }, [])

  return (
    <>
      <Header />
      <LayoutContainer>
        <div className="flex flex-col">
          <h1 className="mb-2 font-serif text-2xl text-foreground md:text-3xl">
            Your Reflections
          </h1>
          <p className="mb-12 text-sm text-muted-foreground">
            A quiet record of what surfaced.
          </p>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Gathering...</p>
          ) : reflections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reflections found for this session.
            </p>
          ) : (
            <div className="flex flex-col gap-10">
              {reflections.map((r) => (
                <div key={r.step}>
                  <p className="mb-1 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    Step {r.step}
                  </p>
                  <p className="mb-3 text-sm leading-relaxed text-foreground/80">
                    {r.input}
                  </p>
                  <ReflectionDisplay reflection={r.response} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-14">
            <SecondaryLink href="/">Return to the beginning</SecondaryLink>
          </div>
        </div>
      </LayoutContainer>
    </>
  )
}
