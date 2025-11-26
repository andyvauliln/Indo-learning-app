'use client'

import { create, StateCreator } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface SentenceData {
    id: string // sentence hash or index-based id
    originalText: string
    translation: string
    notes: string
    grammarRules: string[]
    generatedAt: string
}

interface SentenceStore {
    sentences: Record<string, SentenceData>
    getSentence: (id: string) => SentenceData | undefined
    setSentence: (data: SentenceData) => void
    updateSentence: (id: string, updates: Partial<SentenceData>) => void
    hasSentence: (id: string) => boolean
}

const createSentenceStore: StateCreator<SentenceStore> = (set, get) => ({
    sentences: {},
    
    getSentence: (id: string) => {
        return get().sentences[id]
    },
    
    setSentence: (data: SentenceData) => {
        set((state) => ({
            sentences: {
                ...state.sentences,
                [data.id]: data,
            },
        }))
    },
    
    updateSentence: (id: string, updates: Partial<SentenceData>) => {
        const existing = get().sentences[id]
        if (existing) {
            set((state) => ({
                sentences: {
                    ...state.sentences,
                    [id]: { ...existing, ...updates },
                },
            }))
        }
    },
    
    hasSentence: (id: string) => {
        return !!get().sentences[id]
    },
})

export const useSentenceStore = create<SentenceStore>()(
    persist(createSentenceStore, {
        name: "indo_app_sentences",
        version: 1,
        storage: typeof window === "undefined" ? undefined : createJSONStorage(() => localStorage),
    })
)

// Helper to generate a consistent sentence ID
export function generateSentenceId(text: string): string {
    // Simple hash function for consistent IDs
    let hash = 0
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
    }
    return `sent-${Math.abs(hash).toString(36)}`
}
