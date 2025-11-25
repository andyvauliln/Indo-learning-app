"use client"

import { useState, useEffect, useCallback } from "react"
import { generateTranslation } from "@/lib/api"
import { useTaskStore } from "@/lib/store"
import { FunLoading } from "@/components/ui/fun-loading"
import { DisplayFormatTabs } from "./reading-text/display-format-tabs"
import { CustomFormatInput } from "./reading-text/custom-format-input"
import { StatisticsPanel } from "./reading-text/statistics-panel"
import { DayGroup } from "./reading-text/day-group"
import { useParagraphState } from "@/hooks/use-paragraph-state"
import { useContentFormatting } from "@/hooks/use-content-formatting"
import { getPromptForFormat, getFormatRegenerationPrompt } from "@/lib/prompt-utils"
import { groupParagraphsByDay, calculateEffectiveLearningDays } from "@/lib/day-grouping"
import { updateParagraphInContent, calculateDaysPassed, countWords, calculatePercentage } from "@/lib/text-utils"
import { EnhancedReadingTextProps, DisplayFormat, StatisticsData } from "@/types/reading-text"
import { DEFAULT_REGENERATE_PROMPT } from "@/lib/reading-text-constants"

export function EnhancedReadingText({
    content,
    language = "id",
    model,
    onContentUpdate,
    basePrompt,
    onUpdateBasePrompt,
    onRegenerateBase,
    formattedContent = {},
    onUpdateFormattedContent,
    learnedParagraphs = {},
    onUpdateLearnedParagraphs,
    learningDays,
    startDate
}: EnhancedReadingTextProps) {
    const [activeTab, setActiveTab] = useState<DisplayFormat>("clean")
    const [customFormatPrompt, setCustomFormatPrompt] = useState("")

    const { regenerateFn, isGenerating, activePrompt, setActivePrompt, setRegenerateFn } = useTaskStore()

    // Use custom hooks for state management
    const {
        paragraphStates,
        regeneratingParagraph,
        paragraphPrompts,
        showPromptInput,
        handleMarkAsLearned,
        togglePromptInput,
        updateParagraphPrompt,
        setRegeneratingParagraph,
        resetParagraphStates
    } = useParagraphState({
        initialLearnedParagraphs: learnedParagraphs,
        onUpdateLearnedParagraphs
    })

    const {
        currentFormattedContent,
        isFormatting,
        formatContent,
        updateFormattedContent,
        setIsFormatting
    } = useContentFormatting({
        content,
        model,
        formattedContent,
        onUpdateFormattedContent
    })

    // Reset active tab when main content changes
    useEffect(() => {
        setActiveTab("clean")
        setActivePrompt(basePrompt)
        resetParagraphStates(learnedParagraphs || {})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content])

    // Handle activePrompt updates from user input
    useEffect(() => {
        if (activeTab === 'custom') {
            setCustomFormatPrompt(activePrompt)
        }
    }, [activePrompt, activeTab])

    // Register regenerate function
    useEffect(() => {
        const handleRegenerate = async () => {
            if (activeTab === 'clean') {
                await onRegenerateBase()
            } else {
                setIsFormatting(true)
                try {
                    const formatted = await generateTranslation(content, activePrompt, model)
                    updateFormattedContent({ [activeTab]: formatted })
                } catch (error) {
                    console.error("Regenerate error:", error)
                } finally {
                    setIsFormatting(false)
                }
            }
        }
        setRegenerateFn(handleRegenerate)
        return () => setRegenerateFn(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, setRegenerateFn])

    const handleTabChange = async (tab: DisplayFormat) => {
        setActiveTab(tab)

        const newPrompt = getPromptForFormat(tab, basePrompt, customFormatPrompt)
        setActivePrompt(newPrompt)

        if (tab !== "clean" && !currentFormattedContent[tab]) {
            await formatContent(tab, newPrompt)
        }
    }

    const handleCustomFormat = async () => {
        if (!customFormatPrompt.trim()) return
        await formatContent("custom", customFormatPrompt)
    }

    const handleRegenerateParagraph = async (paragraphId: string, paragraphContent: string) => {
        const prompt = paragraphPrompts[paragraphId] || DEFAULT_REGENERATE_PROMPT
        setRegeneratingParagraph(paragraphId)

        try {
            const regenerated = await generateTranslation(paragraphContent, prompt, model)
            const paragraphIndex = parseInt(paragraphId.replace('para-', ''))

            // Update current tab
            if (activeTab === 'clean') {
                const newContent = updateParagraphInContent(content, paragraphIndex, regenerated)
                if (onContentUpdate) {
                    onContentUpdate(newContent)
                }
            } else {
                const currentContent = currentFormattedContent[activeTab] || ""
                const newContent = updateParagraphInContent(currentContent, paragraphIndex, regenerated)
                updateFormattedContent({ [activeTab]: newContent })
            }

            // Regenerate for other formatted tabs
            await regenerateForOtherTabs(paragraphIndex, regenerated)
        } catch (error) {
            console.error("Regenerate paragraph error:", error)
        } finally {
            setRegeneratingParagraph(null)
            togglePromptInput(paragraphId)
        }
    }

    const regenerateForOtherTabs = async (paragraphIndex: number, regeneratedContent: string) => {
        const tabsToUpdate: DisplayFormat[] = ['word-translation', 'partial-reveal']

        for (const tab of tabsToUpdate) {
            if (currentFormattedContent[tab]) {
                const tabPrompt = getFormatRegenerationPrompt(tab, regeneratedContent)

                if (tabPrompt) {
                    try {
                        const formattedRegenerated = await generateTranslation(regeneratedContent, tabPrompt, model)
                        const tabContent = currentFormattedContent[tab]
                        const updatedTabContent = updateParagraphInContent(tabContent, paragraphIndex, formattedRegenerated)
                        updateFormattedContent({ [tab]: updatedTabContent })
                    } catch (error) {
                        console.error(`Error regenerating for ${tab}:`, error)
                    }
                }
            }
        }
    }

    // Prepare display content and statistics
    const displayContent = activeTab === "clean" ? content : (currentFormattedContent[activeTab] || "")
    const displayParagraphs = displayContent
        ? displayContent
            .split(/\.\s+|\.\n+/)
            .filter(p => p.trim())
            .map(p => p.trim() + '.')
        : []

    const statistics: StatisticsData = {
        learnedCount: Object.values(paragraphStates).filter(Boolean).length,
        totalSentences: displayParagraphs.length,
        wordCount: countWords(displayContent),
        learnedPercentage: calculatePercentage(
            Object.values(paragraphStates).filter(Boolean).length,
            displayParagraphs.length
        ),
        daysPassed: calculateDaysPassed(startDate),
        totalDaysGoal: calculateEffectiveLearningDays(displayParagraphs.length, learningDays)
    }

    const dayGroups = groupParagraphsByDay(displayParagraphs, learningDays)

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <DisplayFormatTabs
                activeTab={activeTab}
                isFormatting={isFormatting}
                onTabChange={handleTabChange}
                regenerateFn={regenerateFn}
                isGenerating={isGenerating}
            />

            {/* Custom Format Input */}
            {activeTab === "custom" && (
                <CustomFormatInput
                    value={customFormatPrompt}
                    onChange={setCustomFormatPrompt}
                    onApply={handleCustomFormat}
                    isFormatting={isFormatting}
                />
            )}

            {/* Statistics Panel */}
            {displayParagraphs.length > 0 && (
                <StatisticsPanel statistics={statistics} />
            )}

            {/* Content Area */}
            {isFormatting ? (
                <div className="py-12">
                    <FunLoading message="Transforming text..." />
                </div>
            ) : (
                <div className="space-y-6">
                    {displayParagraphs.length > 0 ? (
                        dayGroups.map((dayGroup) => (
                            <DayGroup
                                key={`day-${dayGroup.day}`}
                                dayGroup={dayGroup}
                                language={language}
                                paragraphStates={paragraphStates}
                                regeneratingParagraph={regeneratingParagraph}
                                showPromptInput={showPromptInput}
                                paragraphPrompts={paragraphPrompts}
                                onMarkAsLearned={handleMarkAsLearned}
                                onTogglePromptInput={togglePromptInput}
                                onPromptChange={updateParagraphPrompt}
                                onRegenerate={handleRegenerateParagraph}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            {activeTab === "custom" && !formattedContent["custom"]
                                ? "Enter instructions above to generate custom format."
                                : "No content available."}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
