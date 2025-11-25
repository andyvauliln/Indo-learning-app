"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCw, Check } from "lucide-react"
import { INDONESIAN_FONT_FAMILY, ENGLISH_FONT_FAMILY, PARAGRAPH_STYLE } from "@/lib/reading-text-constants"

interface ParagraphItemProps {
    paragraphId: string
    content: string
    isLearned: boolean
    language: "en" | "id"
    isRegenerating: boolean
    showPromptInput: boolean
    promptValue: string
    onMarkAsLearned: () => void
    onTogglePromptInput: () => void
    onPromptChange: (value: string) => void
    onRegenerate: () => void
}

export function ParagraphItem({
    paragraphId,
    content,
    isLearned,
    language,
    isRegenerating,
    showPromptInput,
    promptValue,
    onMarkAsLearned,
    onTogglePromptInput,
    onPromptChange,
    onRegenerate
}: ParagraphItemProps) {
    const fontFamily = language === 'id' ? INDONESIAN_FONT_FAMILY : ENGLISH_FONT_FAMILY

    return (
        <div className="relative animate-in fade-in duration-500">
            {/* Paragraph Content */}
            <div className={`rounded-lg shadow-sm border-2 transition-all duration-300 p-6 md:p-8 ${isLearned ? 'bg-secondary/30 border-primary/40' : 'bg-card/80 border-border'}`}>
                <div
                    className="prose prose-lg max-w-none text-foreground [&>*]:text-foreground"
                    style={{
                        fontFamily,
                        ...PARAGRAPH_STYLE,
                        color: 'var(--foreground)'
                    }}
                >
                    {content}
                </div>
            </div>

            {/* Paragraph Controls */}
            <div className="space-y-2 mt-2">
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onTogglePromptInput}
                        disabled={isRegenerating}
                    >
                        <RefreshCw className={`h-3 w-3 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                        Regenerate
                    </Button>
                    <Button
                        variant={isLearned ? "default" : "outline"}
                        size="sm"
                        onClick={onMarkAsLearned}
                    >
                        <Check className="h-3 w-3 mr-1" />
                        {isLearned ? "Learned" : "Mark as Learned"}
                    </Button>
                </div>

                {/* Prompt Input (conditional) */}
                {showPromptInput && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                        <Textarea
                            placeholder="Enter regeneration prompt (e.g., 'Make it simpler', 'Use different words', etc.)"
                            value={promptValue}
                            onChange={(e) => onPromptChange(e.target.value)}
                            className="min-h-[60px] text-sm"
                        />
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onTogglePromptInput}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={onRegenerate}
                                disabled={isRegenerating}
                            >
                                {isRegenerating ? "Regenerating..." : "Apply"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
