import { NextResponse } from "next/server"
import { createSession } from "@/lib/sessions/sessionManager"

export async function POST() {
  const session = createSession()
  return NextResponse.json({ sessionId: session.id })
}
