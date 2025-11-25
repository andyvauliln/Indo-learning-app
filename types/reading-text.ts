/**
 * Type definitions for reading text components
 */

export interface ParagraphData {
    id: string
    content: string
    isLearned: boolean
}

export type DisplayFormat = "clean" | "word-translation" | "partial-reveal" | "custom"

export interface EnhancedReadingTextProps {
    content: string
    language?: "en" | "id"
    model: string
    onContentUpdate?: (newContent: string) => void
    basePrompt: string
    onUpdateBasePrompt?: (prompt: string) => void
    onRegenerateBase: () => Promise<void>
    formattedContent?: Record<string, string>
    onUpdateFormattedContent?: (newFormattedContent: Record<string, string>) => void
    learnedParagraphs?: Record<string, boolean>
    onUpdateLearnedParagraphs?: (learnedParagraphs: Record<string, boolean>) => void
    learningDays?: number
    startDate?: string
}

export interface DayGroup {
    day: number
    paragraphs: { para: string; index: number }[]
}

export interface StatisticsData {
    learnedCount: number
    totalSentences: number
    wordCount: number
    learnedPercentage: number
    daysPassed: number
    totalDaysGoal: number
}
