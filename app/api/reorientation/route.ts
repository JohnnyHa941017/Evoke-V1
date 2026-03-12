import { NextResponse } from "next/server"
import { generateReorientation } from "@/lib/ai/openai"

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { input } = body;

        if(!input) {
            return NextResponse.json(
                { error: "Text is required" },
                { status: 400 }
            );
        }

        const reorientation = await generateReorientation(input);

        return NextResponse.json({
            reorientation,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Reflection generation failed" },
            { status: 500 }
        );
    }
}