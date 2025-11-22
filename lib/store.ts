import { create } from 'zustand'

interface TaskState {
    isGenerating: boolean
    setIsGenerating: (isGenerating: boolean) => void
    regenerateFn: (() => Promise<void>) | null
    setRegenerateFn: (fn: (() => Promise<void>) | null) => void
    activePrompt: string
    setActivePrompt: (prompt: string) => void
}

export const useTaskStore = create<TaskState>((set) => ({
    isGenerating: false,
    setIsGenerating: (isGenerating) => set({ isGenerating }),
    regenerateFn: null,
    setRegenerateFn: (regenerateFn) => set({ regenerateFn }),
    activePrompt: "",
    setActivePrompt: (activePrompt) => set({ activePrompt }),
}))
