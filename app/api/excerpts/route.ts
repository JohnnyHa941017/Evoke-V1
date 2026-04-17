import { NextResponse } from "next/server"
import { generateExcerpts } from "@/lib/ai/openai"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { reflections } = body

    if (!reflections || !Array.isArray(reflections) || reflections.length === 0) {
      return NextResponse.json(
        { error: "Reflections are required" },
        { status: 400 }
      )
    }

    const excerpts = await generateExcerpts(reflections)

    return NextResponse.json({ excerpts })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Excerpt generation failed" },
      { status: 500 }
    )
  }
}
