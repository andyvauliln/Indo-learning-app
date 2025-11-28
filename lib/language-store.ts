'use client'

import { create, StateCreator } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { DEFAULT_ORIGINAL_LANGUAGE, DEFAULT_LEARNING_LANGUAGE, LanguageCode } from "@/types/language"

interface LanguageStore {
    originalLanguage: LanguageCode
    learningLanguage: LanguageCode
    setOriginalLanguage: (code: LanguageCode) => void
    setLearningLanguage: (code: LanguageCode) => void
    setLanguages: (original: LanguageCode, learning: LanguageCode) => void
}

const createLanguageStore: StateCreator<LanguageStore> = (set) => ({
    originalLanguage: DEFAULT_ORIGINAL_LANGUAGE,
    learningLanguage: DEFAULT_LEARNING_LANGUAGE,
    
    setOriginalLanguage: (code: LanguageCode) => {
        set({ originalLanguage: code })
    },
    
    setLearningLanguage: (code: LanguageCode) => {
        set({ learningLanguage: code })
    },
    
    setLanguages: (original: LanguageCode, learning: LanguageCode) => {
        set({ originalLanguage: original, learningLanguage: learning })
    },
})

export const useLanguageStore = create<LanguageStore>()(
    persist(createLanguageStore, {
        name: "langotron_languages",
        version: 1,
        storage: typeof window === "undefined" ? undefined : createJSONStorage(() => localStorage),
    })
)
