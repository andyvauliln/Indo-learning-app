import { WordEntry, WordExample, WordGenerationArgs } from "@/types/word"
import { sanitizeWordJSON, validateWordEntry } from "@/lib/word-utils"
import { getLanguageName } from "@/types/language"

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
const SITE_NAME = "Langotron"
const DEFAULT_MODEL = "openrouter/auto"

async function callOpenRouter<T>(body: Record<string, unknown>): Promise<T> {
    if (!OPENROUTER_API_KEY) {
        throw new Error("Missing OpenRouter API Key")
    }

    const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": SITE_URL,
            "X-Title": SITE_NAME,
        },
        body: JSON.stringify(body),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error?.message || "OpenRouter request failed")
    }

    return response.json()
}

export interface GenerateWordEntryOptions extends WordGenerationArgs {
    originalLanguage?: string
    learningLanguage?: string
}

export async function generateWordEntryAI(args: GenerateWordEntryOptions): Promise<WordEntry> {
    const {
        baseWord,
        level,
        category = "General",
        type = "Vocabulary",
        translationHint,
        additionalContext,
        model = DEFAULT_MODEL,
        temperature = 0.2,
        originalLanguage = 'en',
        learningLanguage = 'id',
    } = args

    const originalLangName = getLanguageName(originalLanguage)
    const learningLangName = getLanguageName(learningLanguage)

    const schemaInstructions = [
        "Return a single JSON object that matches this schema:",
        "{",
        '  "word": string,',
        '  "translation": string,',
        '  "examples": [{"example": string, "translation": string}] // 3-5 entries,',
        '  "alternative_translations": [{"word": string, "examples": [{"example": string, "translation": string}]}] // exactly 2 entries,',
        '  "similar_words": [{"word": string, "examples": [{"example": string, "translation": string}], "level": "1|2|3|4"}] // exactly 2 entries,',
        '  "other_forms": [{"word": string, "examples": [{"example": string, "translation": string}]}] // 2 entries,',
        '  "level": "1|2|3|4",',
        '  "learned": boolean,',
        '  "type": string,',
        '  "category": string,',
        '  "notes": string,',
        '  "q&a": [{"qestions": string, "answer": string}]',
        "}",
        `Use ${learningLangName} for example sentences and ${originalLangName} for their translations.`,
        "Do not add commentary outside of the JSON object.",
    ]

    const userContext = [
        `Base word: ${baseWord}`,
        `Desired level: ${level}`,
        `Category: ${category}`,
        `Type: ${type}`,
        translationHint ? `${originalLangName} meaning hint: ${translationHint}` : null,
        additionalContext ? `Extra context: ${additionalContext}` : null,
    ]
        .filter(Boolean)
        .join("\n")

    const data = await callOpenRouter<{
        choices: { message: { content: string } }[]
    }>({
        model,
        temperature,
        messages: [
            {
                role: "system",
                content: `You are a ${learningLangName} language tutor who produces structured vocabulary entries for learners who speak ${originalLangName}.`,
            },
            {
                role: "user",
                content: `${schemaInstructions.join("\n")}\n\n${userContext}`,
            },
        ],
    })

    const content = data.choices?.[0]?.message?.content
    if (!content) {
        throw new Error("Model returned an empty response.")
    }

    const cleaned = sanitizeWordJSON(content)
    const parsed = JSON.parse(cleaned)
    return validateWordEntry(parsed)
}

export interface AskWordQuestionOptions {
    word: WordEntry
    question: string
    originalLanguage?: string
    learningLanguage?: string
}

export async function askWordQuestionAI(options: AskWordQuestionOptions): Promise<string>
export async function askWordQuestionAI(word: WordEntry, question: string): Promise<string>
export async function askWordQuestionAI(
    wordOrOptions: WordEntry | AskWordQuestionOptions, 
    questionArg?: string
): Promise<string> {
    const options: AskWordQuestionOptions = 'word' in wordOrOptions && 'question' in wordOrOptions
        ? wordOrOptions as AskWordQuestionOptions
        : { word: wordOrOptions as WordEntry, question: questionArg!, originalLanguage: 'en', learningLanguage: 'id' }
    
    const { word, question, originalLanguage = 'en', learningLanguage = 'id' } = options
    const originalLangName = getLanguageName(originalLanguage)
    const learningLangName = getLanguageName(learningLanguage)
    
    const data = await callOpenRouter<{
        choices: { message: { content: string } }[]
    }>({
        model: DEFAULT_MODEL,
        temperature: 0.4,
        messages: [
            {
                role: "system",
                content: `You are a ${learningLangName} language tutor. Provide concise bilingual answers (${learningLangName} first, ${originalLangName} second).`,
            },
            {
                role: "user",
                content: [
                    "Here is the vocabulary entry in JSON format:",
                    JSON.stringify(word, null, 2),
                    "",
                    `Question: ${question}`,
                    "Answer in 2-3 sentences. Mention cultural or usage notes if relevant.",
                ].join("\n"),
            },
        ],
    })

    const content = data.choices?.[0]?.message?.content
    if (!content) {
        throw new Error("AI response was empty.")
    }
    return content.trim()
}

export interface GenerateExampleOptions {
    word: WordEntry
    originalLanguage?: string
    learningLanguage?: string
}

export async function generateExampleAI(options: GenerateExampleOptions): Promise<WordExample>
export async function generateExampleAI(word: WordEntry): Promise<WordExample>
export async function generateExampleAI(
    wordOrOptions: WordEntry | GenerateExampleOptions
): Promise<WordExample> {
    const options: GenerateExampleOptions = 'word' in wordOrOptions && !('examples' in wordOrOptions)
        ? wordOrOptions as GenerateExampleOptions
        : { word: wordOrOptions as WordEntry, originalLanguage: 'en', learningLanguage: 'id' }
    
    const { word, originalLanguage = 'en', learningLanguage = 'id' } = options
    const originalLangName = getLanguageName(originalLanguage)
    const learningLangName = getLanguageName(learningLanguage)
    
    const data = await callOpenRouter<{
        choices: { message: { content: string } }[]
    }>({
        model: DEFAULT_MODEL,
        temperature: 0.4,
        messages: [
            {
                role: "system",
                content: `You create short ${learningLangName} example sentences with ${originalLangName} translations.`,
            },
            {
                role: "user",
                content: [
                    "Produce exactly one JSON object {\"example\": string, \"translation\": string}.",
                    `Word: ${word.word}`,
                    `Meaning: ${word.translation}`,
                    "Keep it simple and relevant to daily life.",
                    "No commentary outside JSON.",
                ].join("\n"),
            },
        ],
    })

    const content = data.choices?.[0]?.message?.content
    if (!content) {
        throw new Error("AI example response was empty.")
    }

    const cleaned = sanitizeWordJSON(content)
    return JSON.parse(cleaned) as WordExample
}

export interface MemeGenerationOptions {
    textModel?: string
    imageModel?: string
}

export interface MemeGenerationResult {
    imageUrl: string
    concept?: {
        scenario: string
        imagePrompt: string
        humor: string
    }
}

export async function generateMemeImageAI(word: WordEntry, options?: MemeGenerationOptions): Promise<MemeGenerationResult> {
    const response = await fetch('/api/meme', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            word: word.word,
            translation: word.translation,
            textModel: options?.textModel,
            imageModel: options?.imageModel,
        }),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error || 'Failed to generate meme image')
    }

    const data = await response.json()
    return {
        imageUrl: data.imageUrl,
        concept: data.concept,
    }
}
