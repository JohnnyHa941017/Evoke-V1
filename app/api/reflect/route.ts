import { NextResponse } from "next/server";
import { generateReflection } from "@/lib/ai/openai";

export async function POST(req: Request) {

  try {
    const body = await req.json();
    const { input, stepNumber } = body;

    if (!input) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const reflection = await generateReflection(input, stepNumber);

    return NextResponse.json({
      reflection,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Reflection generation failed" },
      { status: 500 }
    );
  }
}
