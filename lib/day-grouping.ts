/**
 * Utility functions for grouping paragraphs by learning days
 */

import { DayGroup } from "@/types/reading-text"
import { DEFAULT_LEARNING_DAYS } from "./reading-text-constants"

/**
 * Groups paragraphs into learning days
 * @param paragraphs - Array of paragraph strings
 * @param learningDays - Number of days to distribute paragraphs across
 * @returns Array of day groups with their paragraphs
 */
export function groupParagraphsByDay(
    paragraphs: string[],
    learningDays?: number
): DayGroup[] {
    const totalSentences = paragraphs.length
    const effectiveLearningDays = learningDays || Math.ceil(totalSentences / DEFAULT_LEARNING_DAYS)
    const sentencesPerDay = Math.ceil(totalSentences / effectiveLearningDays)

    const dayGroups: DayGroup[] = []

    for (let i = 0; i < effectiveLearningDays; i++) {
        const startIndex = i * sentencesPerDay
        const endIndex = Math.min((i + 1) * sentencesPerDay, totalSentences)
        const dayParagraphs = paragraphs
            .slice(startIndex, endIndex)
            .map((para, idx) => ({ para, index: startIndex + idx }))

        if (dayParagraphs.length > 0) {
            dayGroups.push({ day: i + 1, paragraphs: dayParagraphs })
        }
    }

    return dayGroups
}

/**
 * Calculates effective learning days
 * @param totalSentences - Total number of sentences
 * @param learningDays - Optional specified learning days
 * @returns Calculated or default learning days
 */
export function calculateEffectiveLearningDays(
    totalSentences: number,
    learningDays?: number
): number {
    return learningDays || Math.ceil(totalSentences / DEFAULT_LEARNING_DAYS)
}
