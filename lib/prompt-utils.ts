/**
 * Utility functions for prompt management
 */

import { DisplayFormat } from "@/types/reading-text"
import { FORMAT_PROMPT } from "./models"

/**
 * Gets the appropriate prompt for a given display format
 * @param format - The display format
 * @param basePrompt - The base prompt for clean format
 * @param customPrompt - Custom prompt if format is custom
 * @returns The prompt string
 */
export function getPromptForFormat(
    format: DisplayFormat,
    basePrompt: string,
    customPrompt?: string
): string {
    switch (format) {
        case 'clean':
            return basePrompt
        case 'word-translation':
            return `${FORMAT_PROMPT}\n\nFormat type: word-translation`
        case 'partial-reveal':
            return `${FORMAT_PROMPT}\n\nFormat type: partial-reveal`
        case 'custom':
            return customPrompt || `custom: ${customPrompt}`
        default:
            return basePrompt
    }
}

/**
 * Gets format-specific regeneration prompt for a paragraph
 * @param format - The display format
 * @param regeneratedContent - The regenerated content
 * @returns The format-specific prompt or empty string
 */
export function getFormatRegenerationPrompt(
    format: DisplayFormat,
    regeneratedContent: string
): string {
    switch (format) {
        case 'word-translation':
            return `${FORMAT_PROMPT}\n\nFormat type: word-translation\n\nApply this format to: ${regeneratedContent}`
        case 'partial-reveal':
            return `${FORMAT_PROMPT}\n\nFormat type: partial-reveal\n\nApply this format to: ${regeneratedContent}`
        default:
            return ""
    }
}
