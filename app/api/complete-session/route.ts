import { NextRequest, NextResponse } from "next/server"
import { completeSession, getSession } from "@/lib/sessions/sessionManager"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("body: ", body);
    const { sessionId } = body

    console.log("sessionId :", sessionId);

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      )
    }

    const session = getSession(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    completeSession(sessionId)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
