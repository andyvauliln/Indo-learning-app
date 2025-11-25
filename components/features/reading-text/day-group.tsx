"use client"

import { DayGroup as DayGroupType } from "@/types/reading-text"
import { ParagraphItem } from "./paragraph-item"

interface DayGroupProps {
    dayGroup: DayGroupType
    language: "en" | "id"
    paragraphStates: Record<string, boolean>
    regeneratingParagraph: string | null
    showPromptInput: Record<string, boolean>
    paragraphPrompts: Record<string, string>
    onMarkAsLearned: (paragraphId: string) => void
    onTogglePromptInput: (paragraphId: string) => void
    onPromptChange: (paragraphId: string, value: string) => void
    onRegenerate: (paragraphId: string, content: string) => void
}

export function DayGroup({
    dayGroup,
    language,
    paragraphStates,
    regeneratingParagraph,
    showPromptInput,
    paragraphPrompts,
    onMarkAsLearned,
    onTogglePromptInput,
    onPromptChange,
    onRegenerate
}: DayGroupProps) {
    const { day, paragraphs } = dayGroup

    return (
        <div className="relative pl-20" style={{ marginLeft: '0' }}>
            {/* Day Indicator with Vertical Line */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col items-start gap-2" style={{ width: '80px' }}>
                <div className="px-3 py-2 bg-primary text-primary-foreground rounded-md font-semibold text-sm min-w-[60px] text-center flex-shrink-0">
                    Day {day}
                </div>
                <div className="w-px bg-primary flex-grow ml-7"></div>
            </div>

            {/* Sentences for this day */}
            <div className="space-y-6">
                {paragraphs.map(({ para, index }) => {
                    const paraId = `para-${index}`
                    const isLearned = paragraphStates[paraId] || false

                    return (
                        <ParagraphItem
                            key={paraId}
                            paragraphId={paraId}
                            content={para}
                            isLearned={isLearned}
                            language={language}
                            isRegenerating={regeneratingParagraph === paraId}
                            showPromptInput={showPromptInput[paraId] || false}
                            promptValue={paragraphPrompts[paraId] || ""}
                            onMarkAsLearned={() => onMarkAsLearned(paraId)}
                            onTogglePromptInput={() => onTogglePromptInput(paraId)}
                            onPromptChange={(value) => onPromptChange(paraId, value)}
                            onRegenerate={() => onRegenerate(paraId, para)}
                        />
                    )
                })}
            </div>
        </div>
    )
}
