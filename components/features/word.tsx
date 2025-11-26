"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Brain, Check, Info, Loader2, MessageCircle, Plus, Sparkles, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

const LEVEL_COLORS: Record<WordLevel, { text: string; hover: string; border: string; badge: string }> = {
    "1": {
        text: "text-emerald-700",
        hover: "hover:bg-emerald-100",
        border: "border-emerald-300",
        badge: "bg-emerald-100 text-emerald-800",
    },
    "2": {
        text: "text-sky-700",
        hover: "hover:bg-sky-100",
        border: "border-sky-300",
        badge: "bg-sky-100 text-sky-800",
    },
    "3": {
        text: "text-amber-700",
        hover: "hover:bg-amber-100",
        border: "border-amber-300",
        badge: "bg-amber-100 text-amber-800",
    },
    "4": {
        text: "text-rose-700",
        hover: "hover:bg-rose-100",
        border: "border-rose-300",
        badge: "bg-rose-100 text-rose-900",
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
    const baseClasses = cn(
        "inline-flex items-center cursor-pointer transition-colors duration-150 px-1 rounded-sm border border-transparent",
        wordEntry?.learned
            ? cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                levelStyles.badge,
                levelStyles.border
            )
            : cn(
                "border-b-2 pb-0.5 text-sm font-medium",
                levelStyles.text,
                levelStyles.border,
                levelStyles.hover
            ),
        !wordEntry && "text-muted-foreground border-muted"
    )

    const renderTooltipContent = () => {
        if (!wordEntry) {
            return (
                <div className="space-y-1">
                    <p className="text-sm font-medium">{error || "Generating entry..."}</p>
                </div>
            )
        }

        const firstExample = wordEntry.examples[0]
        const hasAlternatives = wordEntry.alternative_translations.length > 0
        const hasForms = wordEntry.other_forms.length > 0

        return (
            <div className="space-y-2.5 py-1">
                {/* Header with translation and level */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-base font-bold tracking-tight">{wordEntry.word}</p>
                        <p className="text-sm text-cyan-200">{wordEntry.translation}</p>
                    </div>
                    <span className={cn(
                        "shrink-0 px-2 py-0.5 rounded text-xs font-bold",
                        "bg-cyan-500/30 text-cyan-100 border border-cyan-400/50"
                    )}>
                        L{wordEntry.level}
                    </span>
                </div>

                {/* Example */}
                {firstExample && (
                    <div className="space-y-0.5 pt-1 border-t border-white/10">
                        <p className="text-[10px] uppercase tracking-wider text-cyan-300/70 font-semibold">Example:</p>
                        <p className="text-sm italic text-cyan-100">&ldquo;{firstExample.example}&rdquo;</p>
                        <p className="text-xs text-cyan-200/80">→ {firstExample.translation}</p>
                    </div>
                )}

                {/* Alternative translations */}
                {hasAlternatives && (
                    <div className="space-y-1 pt-1 border-t border-white/10">
                        <p className="text-[10px] uppercase tracking-wider text-cyan-300/70 font-semibold">Also means:</p>
                        <div className="flex flex-wrap gap-1">
                            {wordEntry.alternative_translations.slice(0, 3).map((alt, idx) => (
                                <span 
                                    key={idx}
                                    className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-500/40 text-teal-100 border border-teal-400/40"
                                >
                                    {alt.word}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Other forms */}
                {hasForms && (
                    <div className="space-y-1 pt-1 border-t border-white/10">
                        <p className="text-[10px] uppercase tracking-wider text-cyan-300/70 font-semibold">Forms:</p>
                        <div className="flex flex-wrap gap-1">
                            {wordEntry.other_forms.slice(0, 4).map((form, idx) => (
                                <span 
                                    key={idx}
                                    className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500/40 text-sky-100 border border-sky-400/40"
                                >
                                    {form.word}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Click for details hint */}
                <p className="text-[10px] text-center text-cyan-300/60 pt-1 border-t border-white/10">
                    Click for full details
                </p>
            </div>
        )
    }

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

    const renderExamples = (entry: WordEntry) => (
        <div className="space-y-2">
            {entry.examples.map((example, idx) => (
                <div key={`example-${idx}`} className="rounded-md border bg-muted/30 p-2 text-sm">
                    <p className="font-medium text-foreground">{example.example}</p>
                    <p className="text-muted-foreground">{example.translation}</p>
                </div>
            ))}
            {!entry.examples.length && <p className="text-sm text-muted-foreground">No examples yet.</p>}
        </div>
    )

    const renderVariantList = (title: string, variants: WordVariant[]) => (
        <div className="space-y-2">
            {variants.map((variant, idx) => (
                <div key={`${title}-${idx}`} className="rounded-md border bg-muted/30 p-2 text-sm">
                    <p className="font-semibold text-foreground">{variant.word}</p>
                    {variant.examples?.[0] && (
                        <p className="text-muted-foreground text-xs">{variant.examples[0].example} — {variant.examples[0].translation}</p>
                    )}
                </div>
            ))}
            {!variants.length && <p className="text-sm text-muted-foreground">No {title.toLowerCase()} yet.</p>}
        </div>
    )

    const renderQA = (entry: WordEntry) => (
        <div className="space-y-2">
            {entry["q&a"].map((item, idx) => (
                <div key={`qa-${idx}`} className="rounded-md border bg-muted/20 p-2 text-sm">
                    <p className="font-semibold text-foreground">Q: {item.qestions}</p>
                    <p className="text-muted-foreground">A: {item.answer}</p>
                </div>
            ))}
            {!entry["q&a"].length && <p className="text-sm text-muted-foreground">No Q&A entries yet.</p>}
        </div>
    )

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <TooltipProvider>
                <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <span className={baseClasses}>
                                {isEnsuring && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                                {displayLabel}
                                {wordEntry?.learned && <Tag className="ml-1 h-3 w-3" />}
                            </span>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[280px] p-3 bg-slate-900/95 backdrop-blur-sm border border-cyan-500/30 shadow-xl shadow-cyan-500/10">
                        {renderTooltipContent()}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        {displayLabel}
                    </DialogTitle>
                    <DialogDescription className="space-y-1">
                        <p>{wordEntry?.translation || "We will generate this entry shortly."}</p>
                        {wordEntry && (
                            <div className="flex flex-wrap gap-2 text-xs uppercase">
                                <span className={cn("px-2 py-0.5 rounded-full font-semibold", levelStyles.badge)}>
                                    Level {wordEntry.level}
                                </span>
                                {wordEntry.type && <span className="px-2 py-0.5 rounded-full bg-muted text-foreground">{wordEntry.type}</span>}
                                {wordEntry.category && <span className="px-2 py-0.5 rounded-full bg-muted text-foreground">{wordEntry.category}</span>}
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {!wordEntry ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center text-muted-foreground">
                        {isEnsuring ? (
                            <>
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <p>Generating vocabulary entry...</p>
                            </>
                        ) : (
                            <>
                                <p>Unable to load data for this word. Click the token again to retry.</p>
                                {error && <p className="text-sm text-destructive">{error}</p>}
                            </>
                        )}
                    </div>
                ) : (
                    <ScrollArea className="max-h-[70vh] pr-4">
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-3">
                                <Button size="sm" variant={wordEntry.learned ? "default" : "outline"} onClick={handleToggleLearned}>
                                    <Check className="mr-2 h-3 w-3" />
                                    {wordEntry.learned ? "Marked as Learned" : "Mark as Learned"}
                                </Button>

                                <Select value={wordEntry.level} onValueChange={(value) => setLevel(cleanedToken, value as WordLevel)}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Level 1 • Green (Basic)</SelectItem>
                                        <SelectItem value="2">Level 2 • Blue (Common)</SelectItem>
                                        <SelectItem value="3">Level 3 • Yellow (Occasional)</SelectItem>
                                        <SelectItem value="4">Level 4 • Red (Rare)</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button size="sm" variant="outline" onClick={handleAIExample} disabled={aiExampleLoading}>
                                    {aiExampleLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                            Generating example...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-3 w-3" />
                                            AI Example
                                        </>
                                    )}
                                </Button>
                            </div>

                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4 text-primary" />
                                    <h3 className="font-semibold text-lg">Examples</h3>
                                </div>
                                {renderExamples(wordEntry)}
                                <div className="grid gap-2 md:grid-cols-2">
                                    <div>
                                        <Label>Example (ID)</Label>
                                        <Textarea
                                            value={exampleForm.example}
                                            onChange={(e) => setExampleForm(prev => ({ ...prev, example: e.target.value }))}
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <Label>Translation (EN)</Label>
                                        <Textarea
                                            value={exampleForm.translation}
                                            onChange={(e) => setExampleForm(prev => ({ ...prev, translation: e.target.value }))}
                                            rows={2}
                                        />
                                    </div>
                                </div>
                                <Button size="sm" onClick={handleAddExample}>
                                    <Plus className="mr-2 h-3 w-3" />
                                    Add Example
                                </Button>
                            </section>

                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <h3 className="font-semibold text-lg">Alternative Translations</h3>
                                </div>
                                {renderVariantList("Alternative Translations", wordEntry.alternative_translations)}
                                <div className="grid gap-2 md:grid-cols-3">
                                    <div>
                                        <Label>Alternative Word</Label>
                                        <Input value={altForm.label} onChange={(e) => setAltForm(prev => ({ ...prev, label: e.target.value }))} />
                                    </div>
                                    <div>
                                        <Label>Example (ID)</Label>
                                        <Input value={altForm.example} onChange={(e) => setAltForm(prev => ({ ...prev, example: e.target.value }))} />
                                    </div>
                                    <div>
                                        <Label>Translation (EN)</Label>
                                        <Input value={altForm.translation} onChange={(e) => setAltForm(prev => ({ ...prev, translation: e.target.value }))} />
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" onClick={handleAddAlternative}>
                                    <Plus className="mr-2 h-3 w-3" />
                                    Add Alternative
                                </Button>
                            </section>

                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-primary" />
                                    <h3 className="font-semibold text-lg">Other Forms</h3>
                                </div>
                                {renderVariantList("Other Forms", wordEntry.other_forms)}
                                <div className="grid gap-2 md:grid-cols-3">
                                    <div>
                                        <Label>Form</Label>
                                        <Input value={otherForm.label} onChange={(e) => setOtherForm(prev => ({ ...prev, label: e.target.value }))} />
                                    </div>
                                    <div>
                                        <Label>Example (ID)</Label>
                                        <Input value={otherForm.example} onChange={(e) => setOtherForm(prev => ({ ...prev, example: e.target.value }))} />
                                    </div>
                                    <div>
                                        <Label>Translation (EN)</Label>
                                        <Input value={otherForm.translation} onChange={(e) => setOtherForm(prev => ({ ...prev, translation: e.target.value }))} />
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" onClick={handleAddOtherForm}>
                                    <Plus className="mr-2 h-3 w-3" />
                                    Add Form
                                </Button>
                            </section>

                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Info className="h-4 w-4 text-primary" />
                                    <h3 className="font-semibold text-lg">Similar Words</h3>
                                </div>
                                <div className="space-y-2">
                                    {wordEntry.similar_words.map((similar, idx) => (
                                        <div key={`similar-${idx}`} className="rounded-md border bg-muted/20 p-2 text-sm">
                                            <p className="font-semibold text-foreground flex items-center gap-2">
                                                {similar.word}
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                    Level {similar.level}
                                                </span>
                                            </p>
                                            {similar.examples?.[0] && (
                                                <p className="text-muted-foreground text-xs">
                                                    {similar.examples[0].example} — {similar.examples[0].translation}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                    {!wordEntry.similar_words.length && (
                                        <p className="text-sm text-muted-foreground">No similar words recorded yet.</p>
                                    )}
                                </div>
                            </section>

                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Brain className="h-4 w-4 text-primary" />
                                    <h3 className="font-semibold text-lg">Ask AI</h3>
                                </div>
                                <Textarea
                                    placeholder="Ask about nuance, usage, cultural context..."
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                />
                                <Button onClick={handleAskAI} disabled={askLoading}>
                                    {askLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Asking AI...
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="mr-2 h-4 w-4" />
                                            Ask AI & Save Answer
                                        </>
                                    )}
                                </Button>
                                {renderQA(wordEntry)}
                            </section>

                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Info className="h-4 w-4 text-primary" />
                                    <h3 className="font-semibold text-lg">Notes</h3>
                                </div>
                                <Textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} rows={3} />
                                <Button size="sm" variant="outline" onClick={handleSaveNotes}>
                                    Save Notes
                                </Button>
                            </section>

                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    )
}
