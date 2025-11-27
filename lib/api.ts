import { getLanguageName } from "@/types/language"

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
const SITE_NAME = "Langotron"

export interface TranslationOptions {
    text: string
    prompt: string
    model: string
    originalLanguage?: string // Language code e.g. 'en'
    learningLanguage?: string // Language code e.g. 'id'
}

export async function generateTranslation(options: TranslationOptions): Promise<string>
export async function generateTranslation(text: string, prompt: string, model: string): Promise<string>
export async function generateTranslation(
    textOrOptions: string | TranslationOptions, 
    promptArg?: string, 
    modelArg?: string
): Promise<string> {
    // Handle both function signatures for backward compatibility
    const options: TranslationOptions = typeof textOrOptions === 'string'
        ? { 
            text: textOrOptions, 
            prompt: promptArg!, 
            model: modelArg!,
            originalLanguage: 'en',
            learningLanguage: 'id'
        }
        : textOrOptions
    
    const { text, prompt, model, originalLanguage = 'en', learningLanguage = 'id' } = options
    
    if (!OPENROUTER_API_KEY) {
        throw new Error("Missing OpenRouter API Key")
    }

    const originalLangName = getLanguageName(originalLanguage)
    const learningLangName = getLanguageName(learningLanguage)

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
                        "content": `You are a helpful ${learningLangName} language tutor. Translate the user's text from ${originalLangName} to ${learningLangName} based on their instructions. Provide ONLY the translation unless asked otherwise.`
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
