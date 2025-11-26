'use client'

import { create, StateCreator } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import level1 from "@/data/words/level-1.json"
import level2 from "@/data/words/level-2.json"
import level3 from "@/data/words/level-3.json"
import level4 from "@/data/words/level-4.json"
import { WordEntry, WordExample, WordLevel, WordQA, WORD_LEVELS } from "@/types/word"
import { generateExampleAI, generateWordEntryAI, askWordQuestionAI } from "@/lib/word-ai"
import { cleanWordToken, normalizeToken, stripAffixes } from "@/lib/word-utils"

type WordMap = Record<string, WordEntry>

function toWordLevel(value: string): WordLevel {
    return WORD_LEVELS.includes(value as WordLevel) ? (value as WordLevel) : "2"
}

// Type for raw word entry from JSON files (level is string, not WordLevel)
interface RawWordEntry {
    word: string
    translation: string
    level?: string
    learned?: boolean
    examples?: { example: string; translation: string }[]
    alternative_translations?: { word: string; examples: { example: string; translation: string }[] }[]
    similar_words?: { word: string; level: string; examples: { example: string; translation: string }[] }[]
    other_forms?: { word: string; examples: { example: string; translation: string }[] }[]
    notes?: string
    type?: string
    category?: string
    "q&a"?: { qestions: string; answer: string }[]
}

function normalizeWordEntry(entry: RawWordEntry): WordEntry {
    return {
        word: entry.word,
        translation: entry.translation,
        level: toWordLevel(entry.level ?? "2"),
        learned: Boolean(entry.learned),
        examples: entry.examples ?? [],
        alternative_translations: entry.alternative_translations ?? [],
        similar_words: (entry.similar_words ?? []).map((similar) => ({
            word: similar.word,
            level: toWordLevel(similar.level),
            examples: similar.examples ?? [],
        })),
        other_forms: entry.other_forms ?? [],
        notes: entry.notes ?? "",
        type: entry.type ?? "Vocabulary",
        category: entry.category ?? "",
        "q&a": entry["q&a"] ?? [],
    }
}

const DEFAULT_WORDS: WordEntry[] = [...level1, ...level2, ...level3, ...level4].map(normalizeWordEntry)

function buildWordMap(entries: WordEntry[]): WordMap {
    return entries.reduce<WordMap>((map, entry) => {
        const key = normalizeToken(entry.word)
        if (key) {
            map[key] = entry
        }
        return map
    }, {})
}

const DEFAULT_WORD_MAP = buildWordMap(DEFAULT_WORDS)

const inFlightRequests: Record<string, Promise<WordEntry>> = {}

interface WordStore {
    words: WordMap
    _hasHydrated: boolean
    findWord: (token: string) => WordEntry | undefined
    ensureWord: (token: string, context?: string) => Promise<WordEntry>
    upsertWord: (entry: WordEntry) => void
    addExample: (token: string, example: WordExample) => void
    addAlternative: (token: string, altWord: string, example: WordExample) => void
    addOtherForm: (token: string, formWord: string, example: WordExample) => void
    toggleLearned: (token: string) => void
    setLevel: (token: string, level: WordLevel) => void
    updateNotes: (token: string, notes: string) => void
    askAI: (token: string, question: string) => Promise<string>
    addQA: (token: string, qa: WordQA) => void
    generateAIExample: (token: string) => Promise<WordExample>
    getLearnedWords: () => WordEntry[]
    getAllWords: () => WordEntry[]
}

const createWordStore: StateCreator<WordStore> = (set, get) => {
    const updateWord = (token: string, updater: (entry: WordEntry) => WordEntry) => {
        const entry = get().findWord(token)
        if (!entry) {
            throw new Error(`Word "${token}" not found`)
        }
        const key = normalizeToken(entry.word) || normalizeToken(token)
        const nextEntry = updater(entry)
        if (!key) return nextEntry
        set((state: WordStore) => ({
            words: {
                ...state.words,
                [key]: nextEntry,
            },
        }))
        return nextEntry
    }

    return {
        words: { ...DEFAULT_WORD_MAP },
        _hasHydrated: false,
        
        findWord: (token: string) => {
            const target = normalizeToken(token)
            if (!target) return undefined
            const { words } = get()
            if (words[target]) return words[target]
            const stripped = stripAffixes(target)
            if (words[stripped]) return words[stripped]
            return Object.values(words).find(word => {
                return word.other_forms.some(form => {
                    const formKey = normalizeToken(form.word)
                    return formKey === target || stripAffixes(formKey) === target
                })
            })
        },
        
        ensureWord: async (token: string, context?: string) => {
            const cleaned = cleanWordToken(token)
            if (!cleaned) {
                throw new Error("Cannot ensure empty token")
            }
            const existing = get().findWord(cleaned)
            if (existing) return existing

            const key = normalizeToken(cleaned)
            if (!key) {
                throw new Error("Unable to normalize token")
            }

            if (!inFlightRequests[key]) {
                inFlightRequests[key] = generateWordEntryAI({
                    baseWord: cleaned,
                    level: "2",
                    additionalContext: context,
                })
                    .then(entry => {
                        set((state: WordStore) => ({
                            words: {
                                ...state.words,
                                [normalizeToken(entry.word) || key]: entry,
                            },
                        }))
                        delete inFlightRequests[key]
                        return entry
                    })
                    .catch(error => {
                        delete inFlightRequests[key]
                        throw error
                    })
            }

            return inFlightRequests[key]
        },
        
        upsertWord: (entry: WordEntry) => {
            const key = normalizeToken(entry.word)
            if (!key) {
                throw new Error("Cannot upsert entry without a valid word")
            }
            set((state: WordStore) => ({
                words: {
                    ...state.words,
                    [key]: entry,
                },
            }))
        },
        
        addExample: (token: string, example: WordExample) => {
            updateWord(token, (entry) => ({
                ...entry,
                examples: [...entry.examples, example],
            }))
        },
        
        addAlternative: (token: string, altWord: string, example: WordExample) => {
            updateWord(token, (entry) => ({
                ...entry,
                alternative_translations: [
                    ...entry.alternative_translations,
                    {
                        word: altWord,
                        examples: [example],
                    },
                ],
            }))
        },
        
        addOtherForm: (token: string, formWord: string, example: WordExample) => {
            updateWord(token, (entry) => ({
                ...entry,
                other_forms: [
                    ...entry.other_forms,
                    {
                        word: formWord,
                        examples: [example],
                    },
                ],
            }))
        },
        
        toggleLearned: (token: string) => {
            updateWord(token, (entry) => ({
                ...entry,
                learned: !entry.learned,
            }))
        },
        
        setLevel: (token: string, level: WordLevel) => {
            updateWord(token, (entry) => ({
                ...entry,
                level,
            }))
        },
        
        updateNotes: (token: string, notes: string) => {
            updateWord(token, (entry) => ({
                ...entry,
                notes,
            }))
        },
        
        askAI: async (token: string, question: string) => {
            const entry = await get().ensureWord(token)
            const answer = await askWordQuestionAI(entry, question)
            get().addQA(token, { qestions: question, answer })
            return answer
        },
        
        addQA: (token: string, qa: WordQA) => {
            updateWord(token, (entry) => ({
                ...entry,
                "q&a": [...entry["q&a"], qa],
            }))
        },
        
        generateAIExample: async (token: string) => {
            const entry = await get().ensureWord(token)
            const example = await generateExampleAI(entry)
            get().addExample(token, example)
            return example
        },
        
        // Get all learned words from the store
        getLearnedWords: () => {
            const { words } = get()
            return Object.values(words).filter(word => word.learned)
        },
        
        // Get all words from the store
        getAllWords: () => {
            const { words } = get()
            return Object.values(words)
        },
    }
}

export const useWordStore = create<WordStore>()(
    persist(createWordStore, {
        name: "indo_app_word_entries",
        version: 1,
        storage: typeof window === "undefined" ? undefined : createJSONStorage(() => localStorage),
        // Merge persisted state with default state, preserving user's learned words
        merge: (persistedState, currentState) => {
            const persisted = persistedState as Partial<WordStore> | undefined
            if (!persisted || !persisted.words) {
                return currentState
            }
            
            // Merge: persisted words take priority over defaults
            // This ensures user's learned words and customizations are preserved
            const mergedWords: WordMap = { ...currentState.words }
            
            for (const [key, entry] of Object.entries(persisted.words)) {
                if (entry) {
                    // Normalize the entry to ensure all fields exist
                    // Cast to RawWordEntry since persisted data may have string levels
                    mergedWords[key] = normalizeWordEntry(entry as RawWordEntry)
                }
            }
            
            return {
                ...currentState,
                words: mergedWords,
                _hasHydrated: true,
            }
        },
        onRehydrateStorage: () => (state) => {
            if (state) {
                state._hasHydrated = true
            }
        },
    })
)

// Export a hook to check if the store has hydrated from localStorage
export function useWordStoreHydrated(): boolean {
    return useWordStore((state) => state._hasHydrated)
}
