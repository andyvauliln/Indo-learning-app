"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCw, Check } from "lucide-react"
import { generateTranslation } from "@/lib/api"
import { FORMAT_PROMPT } from "@/lib/models"
import { useTaskStore } from "@/lib/store"
import { FunLoading } from "@/components/ui/fun-loading"

interface ParagraphData {
    id: string
    content: string
    isLearned: boolean
}

interface EnhancedReadingTextProps {
    content: string
    language?: "en" | "id"
    model: string
    onContentUpdate?: (newContent: string) => void
    basePrompt: string
    onUpdateBasePrompt: (prompt: string) => void
    onRegenerateBase: () => Promise<void>
}

type DisplayFormat = "clean" | "word-translation" | "partial-reveal" | "custom"

export function EnhancedReadingText({
    content,
    language = "id",
    model,
    onContentUpdate,
    basePrompt,
    onUpdateBasePrompt,
    onRegenerateBase
}: EnhancedReadingTextProps) {
    const [activeTab, setActiveTab] = useState<DisplayFormat>("clean")
    const [formattedContent, setFormattedContent] = useState<Record<DisplayFormat, string>>({
        clean: content,
        "word-translation": "",
        "partial-reveal": "",
        custom: ""
    })
    const [customFormatPrompt, setCustomFormatPrompt] = useState("")
    const [isFormatting, setIsFormatting] = useState(false)

    const { regenerateFn, isGenerating, activePrompt, setActivePrompt, setRegenerateFn } = useTaskStore()

    // Reset formatted content when main content changes
    useEffect(() => {
        setFormattedContent({
            clean: content,
            "word-translation": "",
            "partial-reveal": "",
            custom: ""
        })
        setActiveTab("clean")
        setActivePrompt(basePrompt)
    }, [content])

    // Handle activePrompt updates from user input
    useEffect(() => {
        if (activeTab === 'clean') {
            onUpdateBasePrompt(activePrompt)
        } else if (activeTab === 'custom') {
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
                    // Use the current activePrompt for regeneration
                    const formatted = await generateTranslation(content, activePrompt, model)
                    setFormattedContent(prev => ({ ...prev, [activeTab]: formatted }))
                } catch (error) {
                    console.error("Regenerate error:", error)
                } finally {
                    setIsFormatting(false)
                }
            }
        }
        setRegenerateFn(handleRegenerate)
        return () => setRegenerateFn(null)
    }, [activeTab, content, activePrompt, model, onRegenerateBase])

    // Split content into paragraphs
    const paragraphs: ParagraphData[] = content.split(/\n\n+/).filter(p => p.trim()).map((p, i) => ({
        id: `para-${i}`,
        content: p.trim(),
        isLearned: false
    }))

    const [paragraphStates, setParagraphStates] = useState<Record<string, boolean>>({})

    // Format content for different display modes
    const formatContent = async (format: DisplayFormat, promptToUse: string) => {
        if (format === "clean") return content

        // Check if already formatted (unless we are forcing regeneration, which is handled by handleRegenerate)
        // This function is called on tab switch, so we check cache.
        if (formattedContent[format] && format !== "custom") {
            return formattedContent[format]
        }

        setIsFormatting(true)
        try {
            const formatted = await generateTranslation(
                content,
                promptToUse,
                model
            )

            setFormattedContent(prev => ({ ...prev, [format]: formatted }))
            return formatted
        } catch (error) {
            console.error("Format error:", error)
            return content
        } finally {
            setIsFormatting(false)
        }
    }

    const handleTabChange = async (tab: DisplayFormat) => {
        setActiveTab(tab)

        let newPrompt = ""
        if (tab === 'clean') {
            newPrompt = basePrompt
        } else if (tab === 'word-translation') {
            newPrompt = `${FORMAT_PROMPT}\n\nFormat type: word-translation`
        } else if (tab === 'partial-reveal') {
            newPrompt = `${FORMAT_PROMPT}\n\nFormat type: partial-reveal`
        } else if (tab === 'custom') {
            newPrompt = customFormatPrompt || `custom: ${customFormatPrompt}`
        }

        // Update store immediately so UI reflects it
        setActivePrompt(newPrompt)

        if (tab !== "clean" && !formattedContent[tab]) {
            await formatContent(tab, newPrompt)
        }
    }

    const handleCustomFormat = async () => {
        if (!customFormatPrompt.trim()) return
        await formatContent("custom", customFormatPrompt)
    }



    const handleMarkAsLearned = (paragraphId: string) => {
        setParagraphStates(prev => ({ ...prev, [paragraphId]: !prev[paragraphId] }))
    }

    const displayContent = activeTab === "clean" ? content : (formattedContent[activeTab] || "")
    const displayParagraphs = displayContent ? displayContent.split(/\n\n+/).filter(p => p.trim()) : []

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={activeTab === "clean" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTabChange("clean")}
                    >
                        Clean Text
                    </Button>
                    <Button
                        variant={activeTab === "word-translation" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTabChange("word-translation")}
                        disabled={isFormatting}
                    >
                        Word Translation
                    </Button>
                    <Button
                        variant={activeTab === "partial-reveal" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTabChange("partial-reveal")}
                        disabled={isFormatting}
                    >
                        Partial Reveal
                    </Button>
                    <Button
                        variant={activeTab === "custom" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab("custom")}
                    >
                        Custom
                    </Button>
                </div>

                {regenerateFn && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => regenerateFn()}
                        disabled={isGenerating}
                    >
                        <RefreshCw className={`h-3 w-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                        Regenerate
                    </Button>
                )}
            </div>

            {/* Custom Format Input */}
            {activeTab === "custom" && (
                <div className="space-y-2 p-4 bg-muted rounded-lg animate-in slide-in-from-top-2">
                    <Textarea
                        placeholder="Enter custom format instructions (e.g., 'Add pronunciation hints', 'Highlight verbs', etc.)"
                        value={customFormatPrompt}
                        onChange={(e) => setCustomFormatPrompt(e.target.value)}
                        className="min-h-[80px]"
                    />
                    <Button onClick={handleCustomFormat} disabled={isFormatting || !customFormatPrompt.trim()}>
                        {isFormatting ? "Formatting..." : "Apply Custom Format"}
                    </Button>
                </div>
            )}

            {/* Content Area */}
            {isFormatting ? (
                <div className="py-12">
                    <FunLoading message="Transforming text..." />
                </div>
            ) : (
                <div className="space-y-6">
                    {displayParagraphs.length > 0 ? (
                        displayParagraphs.map((para, index) => {
                            const paraId = `para-${index}`
                            const isLearned = paragraphStates[paraId] || false

                            return (
                                <div key={paraId} className="relative animate-in fade-in duration-500">
                                    {/* Paragraph Content */}
                                    <div className={`bg-white rounded-lg shadow-sm border ${isLearned ? 'border-green-300 bg-green-50' : 'border-gray-200'} p-6 md:p-8 transition-colors`}>
                                        <div
                                            className="prose prose-lg max-w-none"
                                            style={{
                                                fontFamily: language === 'id'
                                                    ? "'Merriweather', 'Georgia', serif"
                                                    : "'Inter', 'system-ui', sans-serif",
                                                fontSize: '1.125rem',
                                                lineHeight: '1.8',
                                                textAlign: 'justify',
                                                color: '#1f2937'
                                            }}
                                        >
                                            {para}
                                        </div>

                                    </div>

                                    {/* Paragraph Controls */}
                                    <div className="flex justify-end gap-2 mt-2">

                                        <Button
                                            variant={isLearned ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleMarkAsLearned(paraId)}
                                        >
                                            <Check className="h-3 w-3 mr-1" />
                                            {isLearned ? "Learned" : "Mark as Learned"}
                                        </Button>
                                    </div>
                                </div>
                            )
                        })
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


