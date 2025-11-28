"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
    ChevronLeft, 
    ChevronRight, 
    Volume2, 
    VolumeX,
    Mic, 
    Check, 
    RotateCcw,
    BookOpen,
    Sparkles,
    GraduationCap,
    Loader2,
    AlertCircle
} from "lucide-react"
import { useTTS, usePronunciationCheck } from "@/hooks/use-speech"
import { cn } from "@/lib/utils"
import type { WordEntry, WordExample } from "@/types/word"
import { useWordStore } from "@/lib/word-store"
import { storage } from "@/lib/storage"
import { DEFAULT_MEME_TEXT_MODEL, DEFAULT_IMAGE_MODEL } from "@/lib/models"
import Image from "next/image"
import { ImageIcon } from "lucide-react"

interface WordReviewSliderProps {
    onComplete?: () => void
    content?: string
    learnedParagraphs?: Record<string, boolean>
}

// Fetch words from sentences
async function fetchWordsFromSentences(content: string, learnedParagraphs: Record<string, boolean>): Promise<{
    words: WordEntry[]
    sentenceRange: { start: number; end: number }
    totalSentences: number
    message?: string
}> {
    const response = await fetch('/api/words/from-sentences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, learnedParagraphs })
    })
    if (!response.ok) {
        throw new Error('Failed to fetch words from sentences')
    }
    return response.json()
}

// Fallback: Fetch words from API (Level 1)
async function fetchLevel1Words(): Promise<WordEntry[]> {
    const response = await fetch('/api/words?level=1&limit=20')
    if (!response.ok) {
        throw new Error('Failed to fetch words')
    }
    return response.json()
}

export function WordReviewSlider({ onComplete, content, learnedParagraphs = {} }: WordReviewSliderProps) {
    const [words, setWords] = useState<WordEntry[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showPronunciationCheck, setShowPronunciationCheck] = useState(false)
    const [pronunciationAttempts, setPronunciationAttempts] = useState<Record<string, { correct: boolean; attempts: number }>>({})
    const [sentenceInfo, setSentenceInfo] = useState<{ start: number; end: number; total: number } | null>(null)
    const [memeLoading, setMemeLoading] = useState(false)
    
    const { speak, speakSlowly, speakSentence, isSpeaking, stop, isSupported: ttsSupported } = useTTS()
    const { 
        checkPronunciation, 
        isChecking, 
        result: pronunciationResult, 
        reset: resetPronunciation,
        isSupported: pronunciationSupported 
    } = usePronunciationCheck()
    
    const generateMemeImage = useWordStore(state => state.generateMemeImage)
    const storeWords = useWordStore(state => state.words)

    // Get current word and merge with store data to get meme updates
    const baseWord = words[currentIndex]
    const storeWord = baseWord ? storeWords[baseWord.word] : undefined
    const currentWord = baseWord && storeWord 
        ? { ...baseWord, memeImage: storeWord.memeImage, memeConcept: storeWord.memeConcept }
        : baseWord
    
    const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0

    // Load words on mount
    useEffect(() => {
        let mounted = true
        
        async function loadWords() {
            try {
                setIsLoading(true)
                setError(null)
                
                // If content is provided, fetch words from sentences
                if (content) {
                    const result = await fetchWordsFromSentences(content, learnedParagraphs)
                    if (mounted) {
                        setWords(result.words)
                        setSentenceInfo({
                            start: result.sentenceRange.start + 1, // Convert to 1-based
                            end: result.sentenceRange.end,
                            total: result.totalSentences
                        })
                        if (result.words.length === 0 && result.message) {
                            setError(result.message)
                        }
                    }
                } else {
                    // Fallback to Level 1 words
                    const data = await fetchLevel1Words()
                    if (mounted) {
                        setWords(data)
                    }
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load words')
                }
            } finally {
                if (mounted) {
                    setIsLoading(false)
                }
            }
        }
        
        loadWords()
        return () => { mounted = false }
    }, [content, learnedParagraphs])

    // Reset pronunciation check when word changes
    useEffect(() => {
        resetPronunciation()
        setShowPronunciationCheck(false)
    }, [currentIndex, resetPronunciation])

    const handleNext = useCallback(() => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1)
        } else {
            onComplete?.()
        }
    }, [currentIndex, words.length, onComplete])

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
        }
    }, [currentIndex])

    const handlePlayWord = useCallback(async () => {
        if (currentWord) {
            stop()
            await speakSlowly(currentWord.word)
        }
    }, [currentWord, speakSlowly, stop])

    const handlePlayExample = useCallback(async (example: string) => {
        stop()
        await speakSentence(example)
    }, [speakSentence, stop])

    const handleStartPronunciationCheck = useCallback(() => {
        setShowPronunciationCheck(true)
        resetPronunciation()
    }, [resetPronunciation])

    const handleCheckPronunciation = useCallback(async () => {
        if (currentWord) {
            await checkPronunciation(currentWord.word)
        }
    }, [currentWord, checkPronunciation])

    const handleGenerateMeme = useCallback(async () => {
        if (!currentWord) return
        
        setMemeLoading(true)
        try {
            const settings = storage.getSettings()
            const options = {
                textModel: settings?.memeTextModel || DEFAULT_MEME_TEXT_MODEL,
                imageModel: settings?.memeImageModel || DEFAULT_IMAGE_MODEL,
            }
            await generateMemeImage(currentWord.word, options)
        } catch (err) {
            console.error("Failed to generate meme:", err)
        } finally {
            setMemeLoading(false)
        }
    }, [currentWord, generateMemeImage])

    // Track pronunciation attempts
    useEffect(() => {
        if (pronunciationResult && currentWord) {
            setPronunciationAttempts(prev => {
                const current = prev[currentWord.word] || { correct: false, attempts: 0 }
                return {
                    ...prev,
                    [currentWord.word]: {
                        correct: pronunciationResult.isCorrect || current.correct,
                        attempts: current.attempts + 1,
                    }
                }
            })
        }
    }, [pronunciationResult, currentWord])

    if (isLoading) {
        return (
            <Card className="w-full max-w-4xl mx-auto">
                <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading vocabulary words...</p>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="w-full max-w-4xl mx-auto">
                <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p className="text-destructive">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (words.length === 0) {
        return (
            <Card className="w-full max-w-4xl mx-auto">
                <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No words available for review.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Sentence Range Info */}
            {sentenceInfo && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <span className="text-muted-foreground">
                                    Learning from sentences <strong className="text-foreground">{sentenceInfo.start} - {sentenceInfo.end}</strong>
                                </span>
                            </div>
                            <span className="text-muted-foreground text-xs">
                                of {sentenceInfo.total} total sentences
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {/* Progress Header */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Word {currentIndex + 1} of {words.length}
                    </span>
                    <span className="font-medium text-primary">
                        {Math.round(progress)}% Complete
                    </span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Main Word Card */}
            <Card className="overflow-hidden border-2 border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-4xl font-bold tracking-tight">
                                {currentWord.word}
                            </CardTitle>
                            <CardDescription className="text-lg">
                                {currentWord.translation}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handlePlayWord}
                                disabled={isSpeaking || !ttsSupported}
                                className="h-12 w-12"
                            >
                                {isSpeaking ? (
                                    <VolumeX className="h-6 w-6" />
                                ) : (
                                    <Volume2 className="h-6 w-6" />
                                )}
                            </Button>
                        </div>
                    </div>
                    
                    {/* Word Meta */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            Level {currentWord.level}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                            {currentWord.type}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            {currentWord.category}
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                    {/* Examples Section */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Examples
                        </h3>
                        <div className="space-y-3">
                            {currentWord.examples.slice(0, 3).map((example, idx) => (
                                <ExampleCard 
                                    key={idx} 
                                    example={example} 
                                    onPlay={() => handlePlayExample(example.example)}
                                    isSpeaking={isSpeaking}
                                    ttsSupported={ttsSupported}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Similar Words */}
                    {currentWord.similar_words.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-amber-500" />
                                Similar Words
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {currentWord.similar_words.map((similar, idx) => (
                                    <Button
                                        key={idx}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => speak(similar.word)}
                                        disabled={isSpeaking}
                                        className="group"
                                    >
                                        <Volume2 className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {similar.word}
                                        <span className="ml-1 text-xs text-muted-foreground">
                                            (L{similar.level})
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Other Forms */}
                    {currentWord.other_forms.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg">Other Forms</h3>
                            <div className="flex flex-wrap gap-2">
                                {currentWord.other_forms.map((form, idx) => (
                                    <Button
                                        key={idx}
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => speak(form.word)}
                                        disabled={isSpeaking}
                                    >
                                        <Volume2 className="h-3 w-3 mr-2" />
                                        {form.word}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {currentWord.notes && (
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                <strong>Note:</strong> {currentWord.notes}
                            </p>
                        </div>
                    )}

                    {/* Meme Image Section */}
                    <div className="border-t pt-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5 text-purple-500" />
                                    Visual Memory Aid
                                </h3>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={handleGenerateMeme} 
                                    disabled={memeLoading}
                                >
                                    {memeLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Meme...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            {currentWord.memeImage ? 'Regenerate Meme' : 'Generate Meme'}
                                        </>
                                    )}
                                </Button>
                            </div>

                            {memeLoading ? (
                                <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-lg border border-border/50 bg-muted/20">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                        <Loader2 className="h-8 w-8 animate-spin text-primary relative" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Creating a memorable meme for &ldquo;{currentWord.word}&rdquo;...</p>
                                </div>
                            ) : currentWord.memeImage ? (
                                <div className="rounded-lg border border-border/50 bg-muted/20 p-4 overflow-hidden space-y-4">
                                    {/* Meme Concept Info */}
                                    {currentWord.memeConcept && (
                                        <div className="space-y-2 pb-3 border-b border-border/30">
                                            <div className="flex items-start gap-2">
                                                <span className="text-lg">💡</span>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{currentWord.memeConcept.scenario}</p>
                                                    <p className="text-xs text-muted-foreground mt-1 italic">😄 {currentWord.memeConcept.humor}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Meme Image */}
                                    <div className="relative w-full max-w-md mx-auto aspect-square">
                                        <Image 
                                            src={currentWord.memeImage} 
                                            alt={`Visual mnemonic meme for learning the Indonesian word ${currentWord.word} meaning ${currentWord.translation}`}
                                            fill
                                            className="rounded-lg shadow-lg object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <p className="text-center text-xs text-muted-foreground">
                                        Visual mnemonic for &ldquo;{currentWord.word}&rdquo; ({currentWord.translation})
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 py-6 px-4 rounded-lg border border-dashed border-border/50 bg-muted/10">
                                    <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                                    <div className="text-center space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            Generate a fun meme to help remember this word!
                                        </p>
                                        <p className="text-xs text-muted-foreground/70">
                                            Visual aids can improve memory retention
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pronunciation Check Section */}
                    <div className="border-t pt-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Mic className="h-5 w-5 text-green-500" />
                                Pronunciation Practice
                            </h3>
                            
                            {!showPronunciationCheck ? (
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <p className="text-center text-muted-foreground">
                                        Ready to practice saying &quot;{currentWord.word}&quot;?
                                    </p>
                                    <Button 
                                        onClick={handleStartPronunciationCheck}
                                        size="lg"
                                        disabled={!pronunciationSupported}
                                    >
                                        <Mic className="mr-2 h-5 w-5" />
                                        Start Pronunciation Check
                                    </Button>
                                    {!pronunciationSupported && (
                                        <p className="text-sm text-destructive">
                                            Speech recognition is not supported in your browser.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <PronunciationCheckPanel
                                    word={currentWord.word}
                                    isChecking={isChecking}
                                    result={pronunciationResult}
                                    onCheck={handleCheckPronunciation}
                                    onPlayWord={handlePlayWord}
                                    isSpeaking={isSpeaking}
                                    onReset={resetPronunciation}
                                    attempts={pronunciationAttempts[currentWord.word]}
                                />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>

                <div className="flex gap-1">
                    {words.slice(
                        Math.max(0, currentIndex - 2),
                        Math.min(words.length, currentIndex + 3)
                    ).map((_, idx) => {
                        const actualIndex = Math.max(0, currentIndex - 2) + idx
                        return (
                            <button
                                key={actualIndex}
                                onClick={() => setCurrentIndex(actualIndex)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    actualIndex === currentIndex
                                        ? "bg-primary w-6"
                                        : "bg-muted hover:bg-muted-foreground/50"
                                )}
                            />
                        )
                    })}
                </div>

                <Button
                    onClick={handleNext}
                    disabled={currentIndex === words.length - 1 && !onComplete}
                >
                    {currentIndex === words.length - 1 ? "Complete" : "Next"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

// Example Card Component
function ExampleCard({ 
    example, 
    onPlay, 
    isSpeaking,
    ttsSupported 
}: { 
    example: WordExample
    onPlay: () => void
    isSpeaking: boolean
    ttsSupported: boolean
}) {
    return (
        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
            <Button
                variant="ghost"
                size="icon"
                onClick={onPlay}
                disabled={isSpeaking || !ttsSupported}
                className="shrink-0 h-8 w-8"
            >
                <Volume2 className="h-4 w-4" />
            </Button>
            <div className="space-y-1 flex-1">
                <p className="font-medium text-foreground">{example.example}</p>
                <p className="text-sm text-muted-foreground">{example.translation}</p>
            </div>
        </div>
    )
}

// Pronunciation Check Panel Component
function PronunciationCheckPanel({
    word,
    isChecking,
    result,
    onCheck,
    onPlayWord,
    isSpeaking,
    onReset,
    attempts,
}: {
    word: string
    isChecking: boolean
    result: { isCorrect: boolean; similarity: number; userTranscript: string; feedback: string } | null
    onCheck: () => void
    onPlayWord: () => void
    isSpeaking: boolean
    onReset: () => void
    attempts?: { correct: boolean; attempts: number }
}) {
    return (
        <div className="space-y-4 p-4 bg-gradient-to-br from-green-500/5 to-emerald-500/10 rounded-lg border border-green-500/20">
            {!result ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={onPlayWord}
                            disabled={isSpeaking}
                        >
                            <Volume2 className="mr-2 h-4 w-4" />
                            Listen First
                        </Button>
                        <Button
                            onClick={onCheck}
                            disabled={isChecking}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isChecking ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Listening...
                                </>
                            ) : (
                                <>
                                    <Mic className="mr-2 h-4 w-4" />
                                    Speak Now
                                </>
                            )}
                        </Button>
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                        Click &quot;Speak Now&quot; and say: <strong className="text-foreground">&quot;{word}&quot;</strong>
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Result Header */}
                    <div className={cn(
                        "flex items-center gap-3 p-4 rounded-lg",
                        result.isCorrect 
                            ? "bg-green-500/20 text-green-700 dark:text-green-400" 
                            : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                    )}>
                        {result.isCorrect ? (
                            <Check className="h-6 w-6" />
                        ) : (
                            <RotateCcw className="h-6 w-6" />
                        )}
                        <div className="flex-1">
                            <p className="font-semibold">{result.feedback}</p>
                            <p className="text-sm opacity-80">
                                Similarity: {Math.round(result.similarity * 100)}%
                            </p>
                        </div>
                    </div>

                    {/* What was heard */}
                    <div className="p-3 bg-muted/50 rounded">
                        <p className="text-sm text-muted-foreground">
                            <strong>You said:</strong> &quot;{result.userTranscript || "(nothing detected)"}&quot;
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <strong>Expected:</strong> &quot;{word}&quot;
                        </p>
                    </div>

                    {/* Attempts tracking */}
                    {attempts && (
                        <div className="text-sm text-muted-foreground text-center">
                            Attempts: {attempts.attempts} | 
                            {attempts.correct ? (
                                <span className="text-green-600 ml-1">✓ Correct at least once</span>
                            ) : (
                                <span className="text-amber-600 ml-1">Keep practicing!</span>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-center gap-3">
                        <Button variant="outline" onClick={onPlayWord} disabled={isSpeaking}>
                            <Volume2 className="mr-2 h-4 w-4" />
                            Listen Again
                        </Button>
                        <Button onClick={onReset} variant="secondary">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
