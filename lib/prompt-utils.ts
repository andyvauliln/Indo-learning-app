/**
 * Utility functions for prompt management
 */

import { DisplayFormat } from "@/types/reading-text"
import { FORMAT_PROMPT, getFormatPrompt } from "./models"

export interface LanguageOptions {
    originalLanguage?: string
    learningLanguage?: string
}

/**
 * Gets the appropriate prompt for a given display format
 * @param format - The display format
 * @param basePrompt - The base prompt for clean format
 * @param customPrompt - Custom prompt if format is custom
 * @param languageOptions - Optional language settings
 * @returns The prompt string
 */
export function getPromptForFormat(
    format: DisplayFormat,
    basePrompt: string,
    customPrompt?: string,
    languageOptions?: LanguageOptions
): string {
    const formatPrompt = languageOptions?.originalLanguage && languageOptions?.learningLanguage
        ? getFormatPrompt(languageOptions.originalLanguage, languageOptions.learningLanguage)
        : FORMAT_PROMPT
    
    switch (format) {
        case 'clean':
            return basePrompt
        case 'word-translation':
            return `${formatPrompt}\n\nFormat type: word-translation`
        case 'partial-reveal':
            return `${formatPrompt}\n\nFormat type: partial-reveal`
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
 * @param languageOptions - Optional language settings
 * @returns The format-specific prompt or empty string
 */
export function getFormatRegenerationPrompt(
    format: DisplayFormat,
    regeneratedContent: string,
    languageOptions?: LanguageOptions
): string {
    const formatPrompt = languageOptions?.originalLanguage && languageOptions?.learningLanguage
        ? getFormatPrompt(languageOptions.originalLanguage, languageOptions.learningLanguage)
        : FORMAT_PROMPT
    
    switch (format) {
        case 'word-translation':
            return `${formatPrompt}\n\nFormat type: word-translation\n\nApply this format to: ${regeneratedContent}`
        case 'partial-reveal':
            return `${formatPrompt}\n\nFormat type: partial-reveal\n\nApply this format to: ${regeneratedContent}`
        default:
            return ""
    }
}
