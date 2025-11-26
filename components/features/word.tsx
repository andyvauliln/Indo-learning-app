"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { BookOpen, Brain, Check, ChevronDown, ChevronUp, GraduationCap, Info, Loader2, MessageCircle, Plus, Sparkles, Trash2, Volume2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useWordStore } from "@/lib/word-store"
import { cleanWordToken } from "@/lib/word-utils"
import { cn } from "@/lib/utils"
import { WordEntry, WordLevel, WordVariant } from "@/types/word"

const LEVEL_COLORS: Record<WordLevel, { bg: string; text: string; hover: string; border: string; badge: string; glow: string }> = {
    "1": {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        hover: "hover:bg-emerald-500/20",
        border: "border-emerald-500/30",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        glow: "shadow-emerald-500/20",
    },
    "2": {
        bg: "bg-sky-500/10",
        text: "text-sky-400",
        hover: "hover:bg-sky-500/20",
        border: "border-sky-500/30",
        badge: "bg-sky-500/20 text-sky-300 border-sky-500/40",
        glow: "shadow-sky-500/20",
    },
    "3": {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        hover: "hover:bg-amber-500/20",
        border: "border-amber-500/30",
        badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        glow: "shadow-amber-500/20",
    },
    "4": {
        bg: "bg-rose-500/10",
        text: "text-rose-400",
        hover: "hover:bg-rose-500/20",
        border: "border-rose-500/30",
        badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        glow: "shadow-rose-500/20",
    },
}

interface WordProps {
    text: string
    sentence: string
}

interface ExampleFormState {
    example: string
    translation: string
}

interface VariantFormState extends ExampleFormState {
    label: string
}

export function Word({ text, sentence }: WordProps) {
    const cleanedToken = useMemo(() => cleanWordToken(text), [text])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [question, setQuestion] = useState("")
    const [notesDraft, setNotesDraft] = useState("")
    const [exampleForm, setExampleForm] = useState<ExampleFormState>({ example: "", translation: "" })
    const [altForm, setAltForm] = useState<VariantFormState>({ label: "", example: "", translation: "" })
    const [otherForm, setOtherForm] = useState<VariantFormState>({ label: "", example: "", translation: "" })
    const [isEnsuring, setIsEnsuring] = useState(false)
    const [aiExampleLoading, setAiExampleLoading] = useState(false)
    const [askLoading, setAskLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showAllMeanings, setShowAllMeanings] = useState(false)
    const [showAllForms, setShowAllForms] = useState(false)
    const [showExamplesSection, setShowExamplesSection] = useState(true)
    const [showAlternativesSection, setShowAlternativesSection] = useState(true)
    const [showFormsSection, setShowFormsSection] = useState(true)
    const [showSimilarSection, setShowSimilarSection] = useState(true)
    const [showAskAISection, setShowAskAISection] = useState(true)
    const [showNotesSection, setShowNotesSection] = useState(true)

    const wordEntry = useWordStore(
        useCallback(state => (cleanedToken ? state.findWord(cleanedToken) : undefined), [cleanedToken])
    )
    const ensureWord = useWordStore(state => state.ensureWord)
    const addExample = useWordStore(state => state.addExample)
    const addAlternative = useWordStore(state => state.addAlternative)
    const addOtherForm = useWordStore(state => state.addOtherForm)
    const toggleLearned = useWordStore(state => state.toggleLearned)
    const setLevel = useWordStore(state => state.setLevel)
    const updateNotes = useWordStore(state => state.updateNotes)
    const askAI = useWordStore(state => state.askAI)
    const generateAIExample = useWordStore(state => state.generateAIExample)

    const levelStyles = LEVEL_COLORS[wordEntry?.level || "2"]

    useEffect(() => {
        let ignore = false
        if (!wordEntry && cleanedToken) {
            setIsEnsuring(true)
            ensureWord(cleanedToken, sentence)
                .catch(err => {
                    if (!ignore) setError(err instanceof Error ? err.message : "Failed to load word data")
                })
                .finally(() => {
                    if (!ignore) setIsEnsuring(false)
                })
        } else if (wordEntry) {
            // Word exists, ensure loader is off
            setIsEnsuring(false)
        }
        return () => {
            ignore = true
        }
    }, [wordEntry, cleanedToken, ensureWord, sentence])

    useEffect(() => {
        if (wordEntry) {
            setNotesDraft(wordEntry.notes || "")
        }
    }, [wordEntry])

    if (!cleanedToken) {
        return <span>{text}</span>
    }

    const displayLabel = wordEntry?.word || text
    const hasData = !!wordEntry
    const isLoading = isEnsuring && !hasData
    const isLearned = wordEntry?.learned || false

    // Styling: only learned words get badge/tag style, others are normal text
    const baseClasses = cn(
        "inline-flex items-center cursor-pointer transition-all duration-200",
        hasData && isLearned ? (
            // Learned word - elegant badge style with subtle shadow
                cn(
                "rounded-md px-2 py-0.5 text-sm font-medium border shadow-[0_2px_4px_rgba(0,0,0,0.1)]",
                    levelStyles.badge,
                "hover:shadow-[0_3px_6px_rgba(0,0,0,0.15)]",
                "transition-shadow"
            )
        ) : (
            // Not learned or unknown - subtle hover only
            "text-foreground hover:text-foreground/80 hover:underline decoration-dotted underline-offset-2"
        )
    )

    // Build tooltip content with safe JSON handling
    const buildTooltipContent = () => {
        if (isLoading) {
            return { summary: "Loading...", hasError: false }
        }
        if (error) {
            return { summary: error, hasError: true }
        }
        if (!wordEntry) {
            return { summary: "Click to generate entry", hasError: false }
        }
        return {
            summary: wordEntry.translation,
            level: wordEntry.level,
            example: wordEntry.examples?.[0],
            meanings: wordEntry.alternative_translations?.slice(0, 2),
            forms: wordEntry.other_forms?.slice(0, 3),
            hasError: false
        }
    }

    const tooltipData = buildTooltipContent()

    const handleAddExample = () => {
        if (!exampleForm.example.trim() || !exampleForm.translation.trim()) {
            setError("Please add both the Indonesian example and its translation.")
            return
        }
        addExample(cleanedToken, {
            example: exampleForm.example.trim(),
            translation: exampleForm.translation.trim(),
        })
        setExampleForm({ example: "", translation: "" })
        setError(null)
    }

    const handleAddAlternative = () => {
        if (!altForm.label.trim() || !altForm.example.trim() || !altForm.translation.trim()) {
            setError("Complete alternative word, example, and translation.")
            return
        }
        addAlternative(cleanedToken, altForm.label.trim(), {
            example: altForm.example.trim(),
            translation: altForm.translation.trim(),
        })
        setAltForm({ label: "", example: "", translation: "" })
        setError(null)
    }

    const handleAddOtherForm = () => {
        if (!otherForm.label.trim() || !otherForm.example.trim() || !otherForm.translation.trim()) {
            setError("Complete form word, example, and translation.")
            return
        }
        addOtherForm(cleanedToken, otherForm.label.trim(), {
            example: otherForm.example.trim(),
            translation: otherForm.translation.trim(),
        })
        setOtherForm({ label: "", example: "", translation: "" })
        setError(null)
    }

    const handleToggleLearned = () => {
        toggleLearned(cleanedToken)
    }

    const handleAskAI = async () => {
        if (!question.trim()) {
            setError("Enter a question for the AI.")
            return
        }
        setAskLoading(true)
        setError(null)
        try {
            await askAI(cleanedToken, question.trim())
            setQuestion("")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to ask AI")
        } finally {
            setAskLoading(false)
        }
    }

    const handleAIExample = async () => {
        setAiExampleLoading(true)
        setError(null)
        try {
            await generateAIExample(cleanedToken)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate example")
        } finally {
            setAiExampleLoading(false)
        }
    }

    const handleSaveNotes = () => {
        updateNotes(cleanedToken, notesDraft)
    }

    const handleCleanAllInfo = () => {
        if (window.confirm("Are you sure you want to delete all custom data (examples, notes, Q&A) for this word? The base word data will remain.")) {
            // Reset examples, notes, Q&A by regenerating with force
            setIsEnsuring(true)
            setError(null)
            ensureWord(cleanedToken, sentence, true)
                .catch(err => setError(err instanceof Error ? err.message : "Failed to clean word"))
                .finally(() => setIsEnsuring(false))
        }
    }

    const renderExamples = (entry: WordEntry) => (
        <div className="space-y-2">
            {entry.examples.map((example, idx) => (
                <div key={`example-${idx}`} className="rounded-lg border border-border/50 bg-muted/20 p-3 text-sm backdrop-blur-sm">
                    <p className="font-medium text-foreground">{example.example}</p>
                    <p className="text-muted-foreground mt-1 text-xs italic">{example.translation}</p>
                </div>
            ))}
            {!entry.examples.length && <p className="text-sm text-muted-foreground italic">No examples yet.</p>}
        </div>
    )

    const renderVariantList = (title: string, variants: WordVariant[]) => (
        <div className="space-y-2">
            {variants.map((variant, idx) => (
                <div key={`${title}-${idx}`} className="rounded-lg border border-border/50 bg-muted/20 p-3 text-sm backdrop-blur-sm">
                    <p className="font-semibold text-foreground">{variant.word}</p>
                    {variant.examples?.[0] && (
                        <p className="text-muted-foreground text-xs mt-1">
                            <span className="italic">{variant.examples[0].example}</span>
                            <span className="mx-2">—</span>
                            <span>{variant.examples[0].translation}</span>
                        </p>
                    )}
                </div>
            ))}
            {!variants.length && <p className="text-sm text-muted-foreground italic">No {title.toLowerCase()} yet.</p>}
        </div>
    )

    const renderQA = (entry: WordEntry) => (
        <div className="space-y-2">
            {entry["q&a"].map((item, idx) => (
                <div key={`qa-${idx}`} className="rounded-lg border border-border/50 bg-gradient-to-r from-primary/5 to-transparent p-3 text-sm">
                    <p className="font-semibold text-foreground">Q: {item.qestions}</p>
                    <p className="text-muted-foreground mt-2">A: {item.answer}</p>
                </div>
            ))}
            {!entry["q&a"].length && <p className="text-sm text-muted-foreground italic">No Q&A entries yet.</p>}
        </div>
    )

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <TooltipProvider>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <span className={baseClasses}>
                                {isLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                                {displayLabel}
                                {isLearned && <GraduationCap className="ml-1 h-3 w-3" />}
                            </span>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent 
                        className="max-w-sm p-0 overflow-hidden border-border/50 bg-popover/95 backdrop-blur-md shadow-xl"
                        sideOffset={8}
                    >
                        <div className="p-3 space-y-2">
                            {/* Header with word and level */}
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-bold text-foreground text-base">{displayLabel}</span>
                                {wordEntry && (
                                    <span className={cn(
                                        "text-xs px-2 py-0.5 rounded-full border font-medium",
                                        levelStyles.badge
                                    )}>
                                        L{wordEntry.level}
                                    </span>
                                )}
                            </div>
                            
                            {/* Translation */}
                            <div className="text-sm text-primary font-medium">
                                {tooltipData.summary}
                            </div>
                            
                            {tooltipData.hasError && (
                                <div className="text-xs text-destructive">{tooltipData.summary}</div>
                            )}

                            {/* First example with translation */}
                            {wordEntry?.examples?.[0] && (
                                <div className="pt-2 border-t border-border/30">
                                    <div className="text-xs text-muted-foreground mb-1">Example:</div>
                                    <div className="text-sm italic text-foreground/90">
                                        &ldquo;{wordEntry.examples[0].example}&rdquo;
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        → {wordEntry.examples[0].translation}
                                    </div>
                                </div>
                            )}

                            {/* Alternative meanings */}
                            {wordEntry?.alternative_translations && wordEntry.alternative_translations.length > 0 && (
                                <div className="pt-2 border-t border-border/30">
                                    <div className="text-xs text-muted-foreground mb-1">Also means:</div>
                                    <div className="flex flex-wrap gap-1">
                                        {wordEntry.alternative_translations.slice(0, 3).map((alt, i) => (
                                            <span key={i} className="text-xs bg-primary/20 text-foreground px-2 py-0.5 rounded-full border border-primary/30">
                                                {alt.word}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Word forms */}
                            {wordEntry?.other_forms && wordEntry.other_forms.length > 0 && (
                                <div className="pt-2 border-t border-border/30">
                                    <div className="text-xs text-muted-foreground mb-1">Forms:</div>
                                    <div className="flex flex-wrap gap-1">
                                        {wordEntry.other_forms.slice(0, 4).map((form, i) => (
                                            <span key={i} className="text-xs bg-secondary/70 text-foreground px-2 py-0.5 rounded-full border border-border/40 font-mono">
                                                {form.word}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Click hint */}
                            <div className="text-xs text-muted-foreground/60 pt-1 text-center">
                                Click for full details
                            </div>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden bg-popover/95 backdrop-blur-xl border-border/50">
                <DialogHeader className="pb-3">
                    <DialogTitle className="space-y-2">
                        {/* Word and level badge */}
                        <div className="flex items-center justify-between gap-3">
                            <span className="font-bold text-foreground text-2xl">{displayLabel}</span>
                            {wordEntry && (
                                <span className={cn(
                                    "text-xs px-2.5 py-1 rounded-full border font-semibold",
                                    levelStyles.badge
                                )}>
                                    L{wordEntry.level}
                                </span>
                            )}
                        </div>
                        
                        {/* Translation */}
                        {wordEntry && (
                            <div className="text-base text-primary font-medium">
                                {wordEntry.translation}
                            </div>
                        )}
                        
                        {/* Type and Category badges */}
                        {wordEntry && (wordEntry.type || wordEntry.category || isLearned) && (
                            <div className="flex flex-wrap gap-2">
                                {wordEntry.type && (
                                    <span className="px-2 py-0.5 rounded-full bg-muted/50 text-xs text-muted-foreground border border-border/30">
                                        {wordEntry.type}
                                    </span>
                                )}
                                {wordEntry.category && (
                                    <span className="px-2 py-0.5 rounded-full bg-muted/50 text-xs text-muted-foreground border border-border/30">
                                        {wordEntry.category}
                                    </span>
                                )}
                                {isLearned && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/40 flex items-center gap-1">
                                        <GraduationCap className="h-3 w-3" />
                                        Learned
                                    </span>
                                )}
                            </div>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {!wordEntry ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-muted-foreground">
                        {isLoading ? (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                    <Loader2 className="h-8 w-8 animate-spin text-primary relative" />
                                </div>
                                <p className="text-sm">Generating vocabulary entry...</p>
                            </>
                        ) : (
                            <>
                                <div className="p-4 rounded-full bg-muted/30">
                                    <Info className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <p>Unable to load data for this word.</p>
                                {error && <p className="text-sm text-destructive">{error}</p>}
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setError(null)
                                        setIsEnsuring(true)
                                        ensureWord(cleanedToken, sentence)
                                            .catch(err => setError(err instanceof Error ? err.message : "Failed"))
                                            .finally(() => setIsEnsuring(false))
                                    }}
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Retry Generation
                                </Button>
                            </>
                        )}
                    </div>
                ) : (
                    <ScrollArea className="max-h-[60vh] pr-4">
                        <div className="space-y-4 py-3">
                            {/* Action Buttons - Improved Layout */}
                            <div className="p-4 bg-gradient-to-r from-muted/20 to-muted/5 rounded-lg border border-border/30 space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                <Button 
                                        size="default" 
                                    variant={isLearned ? "default" : "outline"} 
                                    onClick={handleToggleLearned}
                                        className="h-10"
                                >
                                        <Check className="mr-2 h-4 w-4" />
                                    {isLearned ? "Learned" : "Mark as Learned"}
                                </Button>

                                <Select value={wordEntry.level} onValueChange={(value) => setLevel(cleanedToken, value as WordLevel)}>
                                        <SelectTrigger className="w-[200px] h-10 border-2 border-primary/30 focus:border-primary bg-background">
                                        <SelectValue placeholder="Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                Level 1 • Basic
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="2">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-sky-500" />
                                                Level 2 • Common
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="3">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                                Level 3 • Occasional
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="4">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                                Level 4 • Rare
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                    <Button size="default" variant="outline" onClick={handleAIExample} disabled={aiExampleLoading} className="h-10">
                                    {aiExampleLoading ? (
                                        <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                                <Sparkles className="mr-2 h-4 w-4" />
                                            AI Example
                                        </>
                                    )}
                                </Button>

                                    <Button 
                                        size="default" 
                                        variant="outline" 
                                        onClick={() => {
                                            setError(null)
                                            setIsEnsuring(true)
                                            ensureWord(cleanedToken, sentence, true)
                                                .catch(err => setError(err instanceof Error ? err.message : "Failed"))
                                                .finally(() => setIsEnsuring(false))
                                        }}
                                        disabled={isEnsuring}
                                        className="h-10"
                                    >
                                        <Loader2 className={cn("mr-2 h-4 w-4", isEnsuring && "animate-spin")} />
                                        Regenerate Word
                                    </Button>

                                    <Button 
                                        size="default" 
                                        variant="outline" 
                                        onClick={handleCleanAllInfo}
                                        disabled={isEnsuring}
                                        className="h-10"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Clean All Info
                                    </Button>
                                </div>

                                {/* Accordion Toggle Buttons - Horizontal */}
                                <div className="flex flex-wrap gap-1.5 border-t border-border/30 pt-3">
                                    <Button size="sm" variant="ghost" onClick={() => setShowExamplesSection(!showExamplesSection)} className="text-xs">
                                        {showExamplesSection ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}
                                        Examples
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setShowAlternativesSection(!showAlternativesSection)} className="text-xs">
                                        {showAlternativesSection ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}
                                        Alternatives
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setShowFormsSection(!showFormsSection)} className="text-xs">
                                        {showFormsSection ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}
                                        Forms
                                    </Button>
                                    {wordEntry.similar_words.length > 0 && (
                                        <Button size="sm" variant="ghost" onClick={() => setShowSimilarSection(!showSimilarSection)} className="text-xs">
                                            {showSimilarSection ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}
                                            Similar
                                        </Button>
                                    )}
                                    <Button size="sm" variant="ghost" onClick={() => setShowAskAISection(!showAskAISection)} className="text-xs">
                                        {showAskAISection ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}
                                        Ask AI
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setShowNotesSection(!showNotesSection)} className="text-xs">
                                        {showNotesSection ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}
                                        Notes
                                    </Button>
                                </div>
                            </div>

                            {/* Examples Section */}
                            {showExamplesSection && (
                                <div className="rounded-lg border border-border/30 bg-muted/10 overflow-hidden animate-in fade-in duration-200">
                                    <div className="p-3 border-b border-border/30 bg-muted/20">
                                        <div className="flex items-center gap-2">
                                            <MessageCircle className={cn("h-4 w-4", levelStyles.text)} />
                                            <h3 className="font-semibold text-sm">Examples {wordEntry.examples.length > 0 && `(${wordEntry.examples.length})`}</h3>
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-3">
                                            {renderExamples(wordEntry)}
                                            <div className="grid gap-2 md:grid-cols-2 mt-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Indonesian</Label>
                                                    <Textarea
                                                        value={exampleForm.example}
                                                        onChange={(e) => setExampleForm(prev => ({ ...prev, example: e.target.value }))}
                                                        rows={2}
                                                        placeholder="Saya suka makan..."
                                                        className="resize-none text-sm border-2 border-primary/30 focus:border-primary bg-background"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground">English Translation</Label>
                                                    <Textarea
                                                        value={exampleForm.translation}
                                                        onChange={(e) => setExampleForm(prev => ({ ...prev, translation: e.target.value }))}
                                                        rows={2}
                                                        placeholder="I like to eat..."
                                                        className="resize-none text-sm border-2 border-primary/30 focus:border-primary bg-background"
                                                    />
                                                </div>
                                            </div>
                                            <Button size="sm" onClick={handleAddExample} className="w-full">
                                                <Plus className="mr-2 h-3 w-3" />
                                                Add Example
                                            </Button>
                                        </div>
                                </div>
                            )}

                            {/* Alternative Translations */}
                            {showAlternativesSection && (
                                <div className="rounded-lg border border-border/30 bg-muted/10 overflow-hidden animate-in fade-in duration-200">
                                    <div className="p-3 border-b border-border/30 bg-muted/20">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className={cn("h-4 w-4", levelStyles.text)} />
                                            <h3 className="font-semibold text-sm">Alternative Translations {wordEntry.alternative_translations.length > 0 && `(${wordEntry.alternative_translations.length})`}</h3>
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-3">
                                            {renderVariantList("Alternative Translations", wordEntry.alternative_translations)}
                                            <div className="grid gap-2 md:grid-cols-3">
                                                <div>
                                                    <Label className="text-xs">Alternative Word</Label>
                                                    <Input value={altForm.label} onChange={(e) => setAltForm(prev => ({ ...prev, label: e.target.value }))} className="text-sm border-2 border-primary/30 focus:border-primary bg-background" />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Example (ID)</Label>
                                                    <Input value={altForm.example} onChange={(e) => setAltForm(prev => ({ ...prev, example: e.target.value }))} className="text-sm border-2 border-primary/30 focus:border-primary bg-background" />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Translation (EN)</Label>
                                                    <Input value={altForm.translation} onChange={(e) => setAltForm(prev => ({ ...prev, translation: e.target.value }))} className="text-sm border-2 border-primary/30 focus:border-primary bg-background" />
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline" onClick={handleAddAlternative} className="w-full">
                                                <Plus className="mr-2 h-3 w-3" />
                                                Add Alternative
                                            </Button>
                                        </div>
                                </div>
                            )}

                            {/* Other Forms */}
                            {showFormsSection && (
                                <div className="rounded-lg border border-border/30 bg-muted/10 overflow-hidden animate-in fade-in duration-200">
                                    <div className="p-3 border-b border-border/30 bg-muted/20">
                                        <div className="flex items-center gap-2">
                                            <Volume2 className={cn("h-4 w-4", levelStyles.text)} />
                                            <h3 className="font-semibold text-sm">Word Forms {wordEntry.other_forms.length > 0 && `(${wordEntry.other_forms.length})`}</h3>
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-3">
                                            {renderVariantList("Other Forms", wordEntry.other_forms)}
                                            <div className="grid gap-2 md:grid-cols-3">
                                                <div>
                                                    <Label className="text-xs">Form</Label>
                                                    <Input value={otherForm.label} onChange={(e) => setOtherForm(prev => ({ ...prev, label: e.target.value }))} className="text-sm border-2 border-primary/30 focus:border-primary bg-background" />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Example (ID)</Label>
                                                    <Input value={otherForm.example} onChange={(e) => setOtherForm(prev => ({ ...prev, example: e.target.value }))} className="text-sm border-2 border-primary/30 focus:border-primary bg-background" />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Translation (EN)</Label>
                                                    <Input value={otherForm.translation} onChange={(e) => setOtherForm(prev => ({ ...prev, translation: e.target.value }))} className="text-sm border-2 border-primary/30 focus:border-primary bg-background" />
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline" onClick={handleAddOtherForm} className="w-full">
                                                <Plus className="mr-2 h-3 w-3" />
                                                Add Form
                                            </Button>
                                        </div>
                                </div>
                            )}

                            {/* Similar Words */}
                            {wordEntry.similar_words.length > 0 && showSimilarSection && (
                                <div className="rounded-lg border border-border/30 bg-muted/10 overflow-hidden animate-in fade-in duration-200">
                                    <div className="p-3 border-b border-border/30 bg-muted/20">
                                            <div className="flex items-center gap-2">
                                                <Info className={cn("h-4 w-4", levelStyles.text)} />
                                                <h3 className="font-semibold text-sm">Similar Words ({wordEntry.similar_words.length})</h3>
                                            </div>
                                    </div>
                                    <div className="p-3">
                                                <div className="grid gap-2 md:grid-cols-2">
                                                    {wordEntry.similar_words.map((similar, idx) => (
                                                        <div key={`similar-${idx}`} className="rounded-lg border border-border/50 bg-muted/20 p-3 text-sm">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-semibold text-foreground">{similar.word}</span>
                                                                <span className={cn(
                                                                    "text-xs px-2 py-0.5 rounded-full border",
                                                                    LEVEL_COLORS[similar.level].badge
                                                                )}>
                                                                    L{similar.level}
                                                                </span>
                                                            </div>
                                                            {similar.examples?.[0] && (
                                                                <p className="text-muted-foreground text-xs mt-2 italic">
                                                                    {similar.examples[0].example}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                    </div>
                            )}

                            {/* Ask AI */}
                            {showAskAISection && (
                                <div className="rounded-lg border border-primary/30 bg-primary/5 overflow-hidden animate-in fade-in duration-200">
                                    <div className="p-3 border-b border-primary/20 bg-primary/10">
                                        <div className="flex items-center gap-2">
                                            <Brain className="h-4 w-4 text-primary" />
                                            <h3 className="font-semibold text-sm">Ask AI {wordEntry["q&a"].length > 0 && `(${wordEntry["q&a"].length})`}</h3>
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-3">
                                            <Textarea
                                                placeholder="Ask about nuance, usage, cultural context..."
                                                value={question}
                                                onChange={(e) => setQuestion(e.target.value)}
                                                className="min-h-[60px] text-sm border-2 border-primary/30 focus:border-primary bg-background"
                                            />
                                            <Button onClick={handleAskAI} disabled={askLoading} className="w-full" size="sm">
                                                {askLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                        Asking AI...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Brain className="mr-2 h-3 w-3" />
                                                        Ask AI & Save
                                                    </>
                                                )}
                                            </Button>
                                            {wordEntry["q&a"].length > 0 && (
                                                <div className="mt-3">
                                                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Previous Q&A</h4>
                                                    {renderQA(wordEntry)}
                                                </div>
                                            )}
                                        </div>
                                </div>
                            )}

                            {/* Notes */}
                            {showNotesSection && (
                                <div className="rounded-lg border border-border/30 bg-muted/10 overflow-hidden animate-in fade-in duration-200">
                                    <div className="p-3 border-b border-border/30 bg-muted/20">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className={cn("h-4 w-4", levelStyles.text)} />
                                            <h3 className="font-semibold text-sm">Personal Notes</h3>
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-3">
                                            <Textarea 
                                                value={notesDraft} 
                                                onChange={(e) => setNotesDraft(e.target.value)} 
                                                rows={3}
                                                placeholder="Add your personal notes about this word..."
                                                className="resize-none text-sm border-2 border-primary/30 focus:border-primary bg-background"
                                            />
                                            <Button size="sm" variant="outline" onClick={handleSaveNotes} className="w-full">
                                                Save Notes
                                            </Button>
                                        </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                                    {error}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    )
}
