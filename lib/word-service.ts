import path from "node:path"
import { readFile, writeFile } from "node:fs/promises"

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

const WORD_DATA_DIR = path.join(process.cwd(), "data", "words")
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_DEFAULT_MODEL = "openrouter/auto"
const OPENROUTER_TITLE = "Indo Learning App"

function getWordFilePath(level: WordLevel) {
    return path.join(WORD_DATA_DIR, `level-${level}.json`)
}

async function readWordFile(level: WordLevel): Promise<WordEntry[]> {
    const filePath = getWordFilePath(level)
    const fileContents = await readFile(filePath, "utf8")
    return JSON.parse(fileContents) as WordEntry[]
}

async function writeWordFile(level: WordLevel, words: WordEntry[]) {
    const filePath = getWordFilePath(level)
    const sorted = [...words].sort((a, b) => a.word.localeCompare(b.word, "id-ID"))
    await writeFile(filePath, JSON.stringify(sorted, null, 2) + "\n", "utf8")
}

function ensureLevels(levels?: WordLevel[]): WordLevel[] {
    if (!levels || !levels.length) return WORD_LEVELS
    return Array.from(new Set(levels.filter((level): level is WordLevel => WORD_LEVELS.includes(level))))
}

export async function getWords(level: WordLevel): Promise<WordEntry[]> {
    return readWordFile(level)
}

export async function getWord(level: WordLevel, word: string): Promise<WordEntry | undefined> {
    const normalized = normalizeToken(word)
    const words = await readWordFile(level)
    return words.find(entry => normalizeToken(entry.word) === normalized)
}

export async function createWord(level: WordLevel, payload: WordCreateInput): Promise<WordEntry> {
    const words = await readWordFile(level)
    const normalized = normalizeToken(payload.word)
    if (words.some(entry => normalizeToken(entry.word) === normalized)) {
        throw new Error(`Word "${payload.word}" already exists in level ${level}`)
    }
    const word: WordEntry = {
        ...payload,
        learned: payload.learned ?? false,
    }
    await writeWordFile(level, [...words, word])
    return word
}

export async function updateWord(level: WordLevel, targetWord: string, updates: WordUpdateInput): Promise<WordEntry> {
    const words = await readWordFile(level)
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
    await writeWordFile(level, words)
    return nextWord
}

export async function deleteWord(level: WordLevel, targetWord: string): Promise<void> {
    const words = await readWordFile(level)
    const normalized = normalizeToken(targetWord)
    const filtered = words.filter(entry => normalizeToken(entry.word) !== normalized)
    if (filtered.length === words.length) {
        throw new Error(`Word "${targetWord}" was not found in level ${level}`)
    }
    await writeWordFile(level, filtered)
}

export async function searchWords(query: string, options?: WordSearchOptions): Promise<WordEntry[]> {
    const trimmed = query.trim()
    if (!trimmed) return []

    const normalizedQuery = normalizeToken(trimmed)
    const searchTokens = new Set([normalizedQuery, stripAffixes(normalizedQuery)])
    const targetLevels = ensureLevels(options?.levels)
    const includeForms = options?.includeForms ?? true
    const includeLearned = options?.includeLearned ?? true
    const limit = options?.limit ?? Infinity
    const exact = options?.exact ?? false

    const matches: WordEntry[] = []

    for (const level of targetLevels) {
        const words = await readWordFile(level)
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

export async function generateWordWithAI(args: WordGenerationArgs): Promise<WordEntry> {
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
    } = args

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
        "Do not add commentary. Use proper Indonesian in the examples and supply English translations.",
    ]

    const userPrompt = [
        `Base word: ${baseWord}`,
        `Desired level: ${level}`,
        `Category: ${category}`,
        `Type: ${type}`,
        translationHint ? `English meaning hint: ${translationHint}` : null,
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
                    content: "You are an Indonesian language coach who produces structured vocabulary entries for learners.",
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
