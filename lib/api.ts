const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
const SITE_NAME = "Indo Learning App"

export async function generateTranslation(text: string, prompt: string, model: string): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        throw new Error("Missing OpenRouter API Key")
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful Indonesian language tutor. Translate the user's text to Indonesian based on their instructions. Provide ONLY the translation unless asked otherwise."
                    },
                    {
                        "role": "user",
                        "content": `${prompt}:\n\n"${text}"`
                    }
                ]
            })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || "Failed to generate translation")
        }

        const data = await response.json()
        return data.choices[0].message.content || ""
    } catch (error) {
        console.error("API Error:", error)
        throw error
    }
}
