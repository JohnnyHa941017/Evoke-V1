import { NextResponse } from "next/server"
import { generateSoftEcho } from "@/lib/ai/openai"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { reflections } = body

    if (!reflections || !Array.isArray(reflections) || reflections.length === 0) {
      return NextResponse.json({ error: "Reflections are required" }, { status: 400 })
    }

    const echo = await generateSoftEcho(reflections)

    return NextResponse.json({ echo })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Soft echo generation failed" }, { status: 500 })
  }
}
