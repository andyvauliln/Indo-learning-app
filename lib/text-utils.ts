/**
 * Utility functions for text processing and paragraph management
 */

import { ParagraphData } from "@/types/reading-text"

/**
 * Splits content into paragraphs by sentences
 * @param content - The text content to split
 * @returns Array of paragraph data objects
 */
export function splitIntoParagraphs(content: string): ParagraphData[] {
    return content
        .split(/\.\s+|\.\n+/)  // Split by period followed by space(s) or newline(s)
        .filter((p: string) => p.trim())
        .map((p: string, i: number) => ({
            id: `para-${i}`,
            content: p.trim() + '.', // Add period back
            isLearned: false
        }))
}

/**
 * Updates a specific paragraph in content string
 * @param currentContent - The full content string
 * @param paragraphIndex - Index of the paragraph to update
 * @param newParagraphContent - New content for the paragraph
 * @returns Updated content string
 */
export function updateParagraphInContent(
    currentContent: string,
    paragraphIndex: number,
    newParagraphContent: string
): string {
    const paragraphs = currentContent
        .split(/\.\s+|\.\n+/)
        .filter(p => p.trim())
        .map(p => p.trim() + '.')

    return paragraphs.map((p, i) =>
        i === paragraphIndex ? newParagraphContent : p
    ).join(' ')
}

/**
 * Calculates days passed since a start date
 * @param startDate - ISO date string
 * @returns Number of days passed
 */
export function calculateDaysPassed(startDate: string | undefined): number {
    if (!startDate) return 0

    const today = new Date()
    const start = new Date(startDate)
    const daysPassed = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    return Math.max(0, daysPassed)
}

/**
 * Counts words in text content
 * @param content - The text content
 * @returns Number of words
 */
export function countWords(content: string): number {
    return content.split(/\s+/).filter(w => w.trim()).length
}

/**
 * Calculates learned percentage
 * @param learnedCount - Number of learned items
 * @param totalCount - Total number of items
 * @returns Percentage (0-100)
 */
export function calculatePercentage(learnedCount: number, totalCount: number): number {
    return totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0
}
