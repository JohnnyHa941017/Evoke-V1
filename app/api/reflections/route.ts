import { NextRequest, NextResponse } from "next/server"
import { getReflections } from "@/lib/sessions/sessionManager"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("sessionId")

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing sessionId" },
      { status: 400 }
    )
  }

  const reflections = getReflections(sessionId)
  return NextResponse.json({ reflections })
}
