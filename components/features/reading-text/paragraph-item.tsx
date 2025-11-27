"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCw, Check, Languages, BookOpen, ChevronDown, ChevronUp, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { Word } from "@/components/features/word"
import { INDONESIAN_FONT_FAMILY, ENGLISH_FONT_FAMILY, PARAGRAPH_STYLE } from "@/lib/reading-text-constants"
import { isWordLikeToken, tokenizeSentence } from "@/lib/word-utils"
import { useSentenceStore, generateSentenceId, SentenceData } from "@/lib/sentence-store"
import { cn } from "@/lib/utils"

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

// API call to generate sentence data
async function generateSentenceDataAI(sentence: string): Promise<Omit<SentenceData, 'id' | 'originalText' | 'generatedAt'>> {
    const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    
    if (!OPENROUTER_API_KEY) {
        throw new Error("Missing OpenRouter API Key")
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": SITE_URL,
            "X-Title": "Langotron",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "openrouter/auto",
            temperature: 0.3,
            messages: [
                {
                    role: "system",
                    content: "You are an Indonesian language tutor. Analyze Indonesian sentences and provide detailed learning notes."
                },
                {
                    role: "user",
                    content: `Analyze this Indonesian sentence and return a JSON object with:
{
  "translation": "English translation of the sentence",
  "notes": "Detailed explanation of the sentence structure, word usage, and any cultural context",
  "grammarRules": ["List of grammar rules applied in this sentence with examples"]
}

Sentence: "${sentence}"

Return ONLY valid JSON, no other text.`
                }
            ]
        })
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error?.message || "Failed to generate sentence data")
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
        throw new Error("Empty response from AI")
    }

    // Clean and parse JSON
    let cleaned = content.trim()
    if (cleaned.startsWith("```")) {
        const parts = cleaned.split("```")
        cleaned = parts[1]?.replace(/^json\n?/i, "") || parts[2] || cleaned
    }

    try {
        return JSON.parse(cleaned)
    } catch {
        throw new Error("Failed to parse AI response as JSON")
    }
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
    const [showSentenceData, setShowSentenceData] = useState(false)
    const [isGeneratingData, setIsGeneratingData] = useState(false)
    const [generationError, setGenerationError] = useState<string | null>(null)

    // Get sentence ID and stored data
    const sentenceId = useMemo(() => generateSentenceId(content), [content])
    const sentenceData = useSentenceStore(
        useCallback(state => state.getSentence(sentenceId), [sentenceId])
    )
    const setSentence = useSentenceStore(state => state.setSentence)
    const hasSentenceData = !!sentenceData

    // Generate sentence data
    const handleGenerateSentenceData = async () => {
        setIsGeneratingData(true)
        setGenerationError(null)
        
        try {
            const data = await generateSentenceDataAI(content)
            setSentence({
                id: sentenceId,
                originalText: content,
                translation: data.translation,
                notes: data.notes,
                grammarRules: data.grammarRules || [],
                generatedAt: new Date().toISOString()
            })
        } catch (err) {
            setGenerationError(err instanceof Error ? err.message : "Failed to generate")
        } finally {
            setIsGeneratingData(false)
        }
    }

    const renderContent = () => {
        if (language !== 'id') {
            return content
        }
        const tokens = tokenizeSentence(content)
        return tokens.map((token, index) => {
            if (isWordLikeToken(token)) {
                return (
                    <Word
                        key={`${paragraphId}-word-${index}`}
                        text={token}
                        sentence={content}
                    />
                )
            }
            return (
                <span key={`${paragraphId}-text-${index}`}>
                    {token}
                </span>
            )
        })
    }

    return (
        <div className="relative animate-in fade-in duration-500">
            {/* Paragraph Content */}
            <div className={cn(
                "rounded-xl shadow-sm border-2 transition-all duration-300 overflow-hidden",
                isLearned 
                    ? "bg-emerald-500/5 border-emerald-500/30" 
                    : "bg-card/80 border-border/50 hover:border-border"
            )}>
                {/* Main Content */}
                <div className="p-5 md:p-6">
                    <div
                        className="prose prose-lg max-w-none text-foreground [&>*]:text-foreground"
                        style={{
                            fontFamily,
                            ...PARAGRAPH_STYLE,
                            color: 'var(--foreground)',
                            whiteSpace: 'pre-wrap'
                        }}
                    >
                        {renderContent()}
                    </div>
                </div>

                {/* Sentence Data Section */}
                {(hasSentenceData || showSentenceData) && (
                    <div className={cn(
                        "border-t border-border/30 bg-muted/10",
                        showSentenceData && "animate-in slide-in-from-top-2"
                    )}>
                        {hasSentenceData && sentenceData ? (
                            <div className="p-4 space-y-3">
                                {/* Translation */}
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Languages className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-medium text-muted-foreground mb-1">Translation</div>
                                        <div className="text-sm text-foreground">{sentenceData.translation}</div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {sentenceData.notes && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="h-4 w-4 text-amber-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-medium text-muted-foreground mb-1">Notes</div>
                                            <div className="text-sm text-muted-foreground leading-relaxed">{sentenceData.notes}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Grammar Rules */}
                                {sentenceData.grammarRules && sentenceData.grammarRules.length > 0 && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-medium text-muted-foreground mb-2">Grammar Rules</div>
                                            <div className="space-y-1.5">
                                                {sentenceData.grammarRules.map((rule, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className="text-xs text-muted-foreground bg-muted/30 rounded-md px-2.5 py-1.5 flex items-start gap-2"
                                                    >
                                                        <span className="text-primary font-medium">{idx + 1}.</span>
                                                        <span>{rule}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : showSentenceData && !hasSentenceData && (
                            <div className="p-4 flex flex-col items-center justify-center gap-3 text-center">
                                {generationError ? (
                                    <>
                                        <AlertCircle className="h-5 w-5 text-destructive" />
                                        <p className="text-sm text-destructive">{generationError}</p>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={handleGenerateSentenceData}
                                            disabled={isGeneratingData}
                                        >
                                            Retry
                                        </Button>
                                    </>
                                ) : isGeneratingData ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                        <p className="text-sm text-muted-foreground">Generating sentence analysis...</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-muted-foreground">
                                            Generate translation, notes, and grammar rules for this sentence
                                        </p>
                                        <Button 
                                            size="sm" 
                                            onClick={handleGenerateSentenceData}
                                            className="bg-gradient-to-r from-primary to-primary/80"
                                        >
                                            <Sparkles className="mr-2 h-3 w-3" />
                                            Generate Analysis
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Paragraph Controls */}
            <div className="mt-3 space-y-2">
                <div className="flex flex-wrap gap-2 justify-end">
                    {/* Sentence Data Toggle */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSentenceData(!showSentenceData)}
                        className="text-xs"
                    >
                        {showSentenceData ? (
                            <ChevronUp className="h-3 w-3 mr-1" />
                        ) : (
                            <ChevronDown className="h-3 w-3 mr-1" />
                        )}
                        {hasSentenceData ? "Less" : "More"}
                        {hasSentenceData && <Check className="ml-1 h-3 w-3" />}
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onTogglePromptInput}
                        disabled={isRegenerating}
                        className="text-xs"
                    >
                        <RefreshCw className={cn("h-3 w-3 mr-1", isRegenerating && "animate-spin")} />
                        Regenerate
                    </Button>
                    
                    <Button
                        variant={isLearned ? "default" : "outline"}
                        size="sm"
                        onClick={onMarkAsLearned}
                        className="text-xs"
                    >
                        <Check className="h-3 w-3 mr-1" />
                        {isLearned ? "Learned" : "Mark as Learned"}
                    </Button>
                </div>

                {/* Prompt Input (conditional) */}
                {showPromptInput && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 p-3 bg-muted/20 rounded-lg border border-border/30">
                        <Textarea
                            placeholder="Enter regeneration prompt (e.g., 'Make it simpler', 'Use different words', etc.)"
                            value={promptValue}
                            onChange={(e) => onPromptChange(e.target.value)}
                            className="min-h-[60px] text-sm resize-none bg-background border-2 border-border focus:border-primary"
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
                                {isRegenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                        Regenerating...
                                    </>
                                ) : (
                                    "Apply"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
