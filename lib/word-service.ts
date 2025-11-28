import path from "node:path"
import { readFile, writeFile, mkdir } from "node:fs/promises"

import {
    WordCreateInput,
    WordEntry,
    WordGenerationArgs,
    WordLevel,
    WordSearchOptions,
    WordUpdateInput,
    WORD_LEVELS,
} from "@/types/word"
import { buildWordTokens, normalizeToken, sanitizeWordJSON, stripAffixes, validateWordEntry } from "@/lib/word-utils"
import { getLanguageName, DEFAULT_LEARNING_LANGUAGE } from "@/types/language"

const WORD_DATA_BASE_DIR = path.join(process.cwd(), "data", "words")
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_DEFAULT_MODEL = "openrouter/auto"
const OPENROUTER_TITLE = "Langotron"

function getWordDataDir(languageCode: string = DEFAULT_LEARNING_LANGUAGE) {
    return path.join(WORD_DATA_BASE_DIR, languageCode)
}

function getWordFilePath(level: WordLevel, languageCode: string = DEFAULT_LEARNING_LANGUAGE) {
    return path.join(getWordDataDir(languageCode), `level-${level}.json`)
}

async function readWordFile(level: WordLevel, languageCode: string = DEFAULT_LEARNING_LANGUAGE): Promise<WordEntry[]> {
    const filePath = getWordFilePath(level, languageCode)
    try {
        const fileContents = await readFile(filePath, "utf8")
        return JSON.parse(fileContents) as WordEntry[]
    } catch (error: unknown) {
        // If file doesn't exist, return empty array
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
            return []
        }
        throw error
    }
}

async function writeWordFile(level: WordLevel, words: WordEntry[], languageCode: string = DEFAULT_LEARNING_LANGUAGE) {
    const dataDir = getWordDataDir(languageCode)
    await mkdir(dataDir, { recursive: true })
    const filePath = getWordFilePath(level, languageCode)
    // Use appropriate locale for sorting based on language
    const sorted = [...words].sort((a, b) => a.word.localeCompare(b.word, languageCode))
    await writeFile(filePath, JSON.stringify(sorted, null, 2) + "\n", "utf8")
}

function ensureLevels(levels?: WordLevel[]): WordLevel[] {
    if (!levels || !levels.length) return WORD_LEVELS
    return Array.from(new Set(levels.filter((level): level is WordLevel => WORD_LEVELS.includes(level))))
}

export async function getWords(level: WordLevel, languageCode: string = DEFAULT_LEARNING_LANGUAGE): Promise<WordEntry[]> {
    return readWordFile(level, languageCode)
}

export async function getWord(level: WordLevel, word: string, languageCode: string = DEFAULT_LEARNING_LANGUAGE): Promise<WordEntry | undefined> {
    const normalized = normalizeToken(word)
    const words = await readWordFile(level, languageCode)
    return words.find(entry => normalizeToken(entry.word) === normalized)
}

export async function createWord(level: WordLevel, payload: WordCreateInput, languageCode: string = DEFAULT_LEARNING_LANGUAGE): Promise<WordEntry> {
    const words = await readWordFile(level, languageCode)
    const normalized = normalizeToken(payload.word)
    if (words.some(entry => normalizeToken(entry.word) === normalized)) {
        throw new Error(`Word "${payload.word}" already exists in level ${level}`)
    }
    const word: WordEntry = {
        ...payload,
        learned: payload.learned ?? false,
    }
    await writeWordFile(level, [...words, word], languageCode)
    return word
}

export async function updateWord(level: WordLevel, targetWord: string, updates: WordUpdateInput, languageCode: string = DEFAULT_LEARNING_LANGUAGE): Promise<WordEntry> {
    const words = await readWordFile(level, languageCode)
    const normalized = normalizeToken(targetWord)
    const index = words.findIndex(entry => normalizeToken(entry.word) === normalized)
    if (index === -1) {
        throw new Error(`Word "${targetWord}" was not found in level ${level}`)
    }
    const nextWord = {
        ...words[index],
        ...updates,
    } as WordEntry
    words[index] = nextWord
    await writeWordFile(level, words, languageCode)
    return nextWord
}

export async function deleteWord(level: WordLevel, targetWord: string, languageCode: string = DEFAULT_LEARNING_LANGUAGE): Promise<void> {
    const words = await readWordFile(level, languageCode)
    const normalized = normalizeToken(targetWord)
    const filtered = words.filter(entry => normalizeToken(entry.word) !== normalized)
    if (filtered.length === words.length) {
        throw new Error(`Word "${targetWord}" was not found in level ${level}`)
    }
    await writeWordFile(level, filtered, languageCode)
}

export interface WordSearchOptionsWithLanguage extends WordSearchOptions {
    languageCode?: string
}

export async function searchWords(query: string, options?: WordSearchOptionsWithLanguage): Promise<WordEntry[]> {
    const trimmed = query.trim()
    if (!trimmed) return []

    const normalizedQuery = normalizeToken(trimmed)
    const searchTokens = new Set([normalizedQuery, stripAffixes(normalizedQuery)])
    const targetLevels = ensureLevels(options?.levels)
    const includeForms = options?.includeForms ?? true
    const includeLearned = options?.includeLearned ?? true
    const limit = options?.limit ?? Infinity
    const exact = options?.exact ?? false
    const languageCode = options?.languageCode ?? DEFAULT_LEARNING_LANGUAGE

    const matches: WordEntry[] = []

    for (const level of targetLevels) {
        const words = await readWordFile(level, languageCode)
        for (const word of words) {
            if (!includeLearned && word.learned) continue
            const tokens = buildWordTokens(word, includeForms)
            const hasMatch = exact
                ? Array.from(searchTokens).some(token => tokens.has(token))
                : Array.from(searchTokens).some(token => {
                      for (const wordToken of tokens) {
                          if (wordToken.includes(token) || token.includes(wordToken)) {
                              return true
                          }
                      }
                      return false
                  })
            if (hasMatch) {
                matches.push(word)
                if (matches.length >= limit) {
                    return matches
                }
            }
        }
    }

    return matches
}

export interface GenerateWordWithAIArgs extends WordGenerationArgs {
    originalLanguage?: string
    learningLanguage?: string
}

export async function generateWordWithAI(args: GenerateWordWithAIArgs): Promise<WordEntry> {
    if (!OPENROUTER_API_KEY) {
        throw new Error("Missing OpenRouter API key.")
    }

    const {
        baseWord,
        level,
        category = "General",
        type = "Vocabulary",
        translationHint,
        additionalContext,
        model = OPENROUTER_DEFAULT_MODEL,
        temperature = 0.2,
        originalLanguage = 'en',
        learningLanguage = 'id',
    } = args

    const originalLangName = getLanguageName(originalLanguage)
    const learningLangName = getLanguageName(learningLanguage)

    const instructions = [
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
        `Do not add commentary. Use proper ${learningLangName} in the examples and supply ${originalLangName} translations.`,
    ]

    const userPrompt = [
        `Base word: ${baseWord}`,
        `Desired level: ${level}`,
        `Category: ${category}`,
        `Type: ${type}`,
        translationHint ? `${originalLangName} meaning hint: ${translationHint}` : null,
        additionalContext ? `Extra context: ${additionalContext}` : null,
    ]
        .filter(Boolean)
        .join("\n")

    const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
            "X-Title": OPENROUTER_TITLE,
        },
        body: JSON.stringify({
            model,
            temperature,
            messages: [
                {
                    role: "system",
                    content: `You are a ${learningLangName} language coach who produces structured vocabulary entries for learners who speak ${originalLangName}.`,
                },
                {
                    role: "user",
                    content: `${instructions.join("\n")}\n\n${userPrompt}`,
                },
            ],
        }),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error?.message || "Failed to generate vocabulary entry")
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) {
        throw new Error("Model returned an empty response.")
    }

    const cleaned = sanitizeWordJSON(content)
    const parsed = JSON.parse(cleaned)
    return validateWordEntry(parsed)
}
