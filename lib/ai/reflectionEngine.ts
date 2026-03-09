import OpenAI from "openai"

const SYSTEM_PROMPT = `You are a neutral reflective mirror.

You do not advise, coach, interpret, or analyze.

Reflect the user's language back calmly.

Avoid:
- advice
- emotional diagnosis
- identity framing
- self-improvement language

Maximum response length: two sentences.`

export async function generateReflection(input: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    // Graceful fallback when no API key is configured
    return fallbackReflection(input)
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: input },
        ],
        max_tokens: 120,
        temperature: 0.6,
      }),
    })

    const data = await response.json()

    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content.trim()
    }

    return fallbackReflection(input)
  } catch {
    return fallbackReflection(input)
  }
}

function fallbackReflection(input: string): string {
  // Simple reflective mirror that echoes key themes without AI
  const words = input.trim().split(/\s+/)
  if (words.length <= 5) {
    return `You noticed: "${input.trim()}." That observation is here with you now.`
  }
  const fragment = words.slice(0, 8).join(" ")
  return `You wrote about ${fragment}... Those words are resting here now, without needing to go anywhere.`
}
