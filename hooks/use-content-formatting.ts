/**
 * Custom hook for managing content formatting
 */

import { useState, useCallback, useMemo } from "react"
import { generateTranslation } from "@/lib/api"
import { DisplayFormat } from "@/types/reading-text"

interface UseContentFormattingProps {
    content: string
    model: string
    formattedContent?: Record<string, string>
    onUpdateFormattedContent?: (newFormattedContent: Record<string, string>) => void
}

export function useContentFormatting({
    content,
    model,
    formattedContent = {},
    onUpdateFormattedContent
}: UseContentFormattingProps) {
    const [localFormattedContent, setLocalFormattedContent] = useState<Record<string, string>>({})
    const [isFormatting, setIsFormatting] = useState(false)

    const currentFormattedContent: Record<string, string> = useMemo(() => ({
        clean: content,
        ...localFormattedContent,
        ...formattedContent
    }), [content, localFormattedContent, formattedContent])

    const updateFormattedContent = useCallback((newContent: Record<string, string>) => {
        if (onUpdateFormattedContent) {
            onUpdateFormattedContent(newContent)
        } else {
            setLocalFormattedContent(prev => ({ ...prev, ...newContent }))
        }
    }, [onUpdateFormattedContent])

    const formatContent = useCallback(async (format: DisplayFormat, promptToUse: string) => {
        if (format === "clean") return content

        // Check if already formatted
        if (currentFormattedContent[format] && format !== "custom") {
            return currentFormattedContent[format]
        }

        setIsFormatting(true)
        try {
            const formatted = await generateTranslation(
                content,
                promptToUse,
                model
            )

            updateFormattedContent({ [format]: formatted })
            return formatted
        } catch (error) {
            console.error("Format error:", error)
            return content
        } finally {
            setIsFormatting(false)
        }
    }, [content, model, currentFormattedContent, updateFormattedContent])

    return {
        currentFormattedContent,
        isFormatting,
        formatContent,
        updateFormattedContent,
        setIsFormatting
    }
}
