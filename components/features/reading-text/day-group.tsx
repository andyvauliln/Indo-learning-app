"use client"

import { useState, useEffect, useCallback } from "react"
import { DayGroup as DayGroupType } from "@/types/reading-text"
import { ParagraphItem } from "./paragraph-item"
import { ChevronDown, ChevronRight, Calendar, CheckCircle2, Loader2, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

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
    defaultExpanded?: boolean
    isCurrentDay?: boolean
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
    onRegenerate,
    defaultExpanded = false,
    isCurrentDay = false
}: DayGroupProps) {
    const { day, paragraphs } = dayGroup
    const [isExpanded, setIsExpanded] = useState(defaultExpanded || isCurrentDay)
    const [loadedParagraphs, setLoadedParagraphs] = useState<typeof paragraphs>([])
    const [batchIndex, setBatchIndex] = useState(0)
    
    const BATCH_SIZE = 3 // Load 3 sentences at a time for smooth UX

    // Calculate progress
    const learnedCount = paragraphs.filter(({ index }) => 
        paragraphStates[`para-${index}`]
    ).length
    const totalCount = paragraphs.length
    const progressPercent = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0
    const isCompleted = learnedCount === totalCount && totalCount > 0

    // Lazy load paragraphs when expanded
    useEffect(() => {
        if (isExpanded && loadedParagraphs.length === 0) {
            // Simulate a small delay for smooth animation
            const timer = setTimeout(() => {
                const initialBatch = paragraphs.slice(0, BATCH_SIZE)
                setLoadedParagraphs(initialBatch)
                setBatchIndex(1)
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [isExpanded, paragraphs, loadedParagraphs.length])
    
    // Derive loading state from data - avoid setState in effect
    const isLoading = isExpanded && loadedParagraphs.length === 0

    // Load more paragraphs function
    const loadMoreParagraphs = useCallback(() => {
        const startIdx = batchIndex * BATCH_SIZE
        const endIdx = startIdx + BATCH_SIZE
        const nextBatch = paragraphs.slice(startIdx, endIdx)
        
        if (nextBatch.length > 0) {
            setLoadedParagraphs(prev => [...prev, ...nextBatch])
            setBatchIndex(prev => prev + 1)
        }
    }, [paragraphs, batchIndex])

    // Auto-load remaining when scrolled to bottom or when there are few items
    useEffect(() => {
        if (isExpanded && loadedParagraphs.length < paragraphs.length && loadedParagraphs.length > 0) {
            const timer = setTimeout(() => {
                loadMoreParagraphs()
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isExpanded, loadedParagraphs.length, paragraphs.length, loadMoreParagraphs])

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded)
    }

    return (
        <div className={cn(
            "rounded-xl border transition-all duration-300 overflow-hidden",
            isCurrentDay 
                ? "border-primary/50 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 shadow-lg shadow-primary/5" 
                : isCompleted 
                    ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent"
                    : "border-border/50 bg-card/50 backdrop-blur-sm",
            isExpanded && "shadow-xl"
        )}>
            {/* Accordion Header */}
            <button
                onClick={toggleExpanded}
                className={cn(
                    "w-full flex items-center gap-4 p-4 md:p-5 text-left transition-all duration-200",
                    "hover:bg-muted/30",
                    isExpanded && "border-b border-border/30"
                )}
            >
                {/* Expand Icon */}
                <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                    isCurrentDay 
                        ? "bg-primary text-primary-foreground" 
                        : isCompleted 
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-muted/50 text-muted-foreground"
                )}>
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </div>

                {/* Day Badge */}
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm",
                    isCurrentDay 
                        ? "bg-primary/20 text-primary border border-primary/30" 
                        : isCompleted 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-muted/50 text-muted-foreground border border-border/30"
                )}>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Day {day}</span>
                </div>

                {/* Progress Info */}
                <div className="flex-1 flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{totalCount} sentences</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="flex-1 max-w-[200px] h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div 
                            className={cn(
                                "h-full rounded-full transition-all duration-500",
                                isCompleted ? "bg-emerald-500" : "bg-primary"
                            )}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    
                    {/* Progress Text */}
                    <span className={cn(
                        "text-xs font-medium",
                        isCompleted ? "text-emerald-400" : "text-muted-foreground"
                    )}>
                        {learnedCount}/{totalCount}
                    </span>
                </div>

                {/* Completion Badge */}
                {isCompleted && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Completed</span>
                    </div>
                )}

                {/* Current Day Badge */}
                {isCurrentDay && !isCompleted && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium animate-pulse">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span>Today</span>
                    </div>
                )}
            </button>

            {/* Accordion Content */}
            {isExpanded && (
                <div className={cn(
                    "p-4 md:p-6 space-y-4 animate-in slide-in-from-top-2 duration-300"
                )}>
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading sentences...</span>
                        </div>
                    ) : (
                        <>
                            {loadedParagraphs.map(({ para, index }, idx) => {
                                const paraId = `para-${index}`
                                const isLearned = paragraphStates[paraId] || false

                                return (
                                    <div 
                                        key={paraId}
                                        className="animate-in fade-in-50 slide-in-from-bottom-2"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <ParagraphItem
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
                                    </div>
                                )
                            })}
                            
                            {/* Load More Button (if needed) */}
                            {loadedParagraphs.length < paragraphs.length && (
                                <button
                                    onClick={loadMoreParagraphs}
                                    className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 rounded-lg border border-dashed border-border/50 hover:border-primary/30 hover:bg-muted/20"
                                >
                                    <Loader2 className="h-4 w-4" />
                                    Load more sentences ({paragraphs.length - loadedParagraphs.length} remaining)
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
