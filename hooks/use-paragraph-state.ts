/**
 * Custom hook for managing paragraph state
 */

import { useState, useCallback } from "react"

interface UseParagraphStateProps {
    initialLearnedParagraphs?: Record<string, boolean>
    onUpdateLearnedParagraphs?: (learnedParagraphs: Record<string, boolean>) => void
}

export function useParagraphState({
    initialLearnedParagraphs = {},
    onUpdateLearnedParagraphs
}: UseParagraphStateProps) {
    const [paragraphStates, setParagraphStates] = useState<Record<string, boolean>>(initialLearnedParagraphs)
    const [regeneratingParagraph, setRegeneratingParagraph] = useState<string | null>(null)
    const [paragraphPrompts, setParagraphPrompts] = useState<Record<string, string>>({})
    const [showPromptInput, setShowPromptInput] = useState<Record<string, boolean>>({})

    const handleMarkAsLearned = useCallback((paragraphId: string) => {
        const newState = { ...paragraphStates, [paragraphId]: !paragraphStates[paragraphId] }
        setParagraphStates(newState)

        if (onUpdateLearnedParagraphs) {
            onUpdateLearnedParagraphs(newState)
        }
    }, [paragraphStates, onUpdateLearnedParagraphs])

    const togglePromptInput = useCallback((paragraphId: string) => {
        setShowPromptInput(prev => ({ ...prev, [paragraphId]: !prev[paragraphId] }))
    }, [])

    const updateParagraphPrompt = useCallback((paragraphId: string, prompt: string) => {
        setParagraphPrompts(prev => ({ ...prev, [paragraphId]: prompt }))
    }, [])

    const resetParagraphStates = useCallback((newStates: Record<string, boolean>) => {
        setParagraphStates(newStates)
    }, [])

    return {
        paragraphStates,
        regeneratingParagraph,
        paragraphPrompts,
        showPromptInput,
        handleMarkAsLearned,
        togglePromptInput,
        updateParagraphPrompt,
        setRegeneratingParagraph,
        resetParagraphStates
    }
}
