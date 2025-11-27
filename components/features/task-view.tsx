"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { generateTranslation } from "@/lib/api"
import { storage, type Task, type Subtask } from "@/lib/storage"
import { AVAILABLE_MODELS, DEFAULT_MODEL, DEFAULT_PROMPT, DEFAULT_LEARNING_DAYS } from "@/lib/models"
import { Loader2, CheckCircle2, ArrowRight, Settings2, Edit, Trash2, Mic } from "lucide-react"
import { VoiceInputButton } from "@/components/ui/voice-input-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { EnhancedReadingText } from "@/components/features/enhanced-reading-text"
import { WordReviewSlider } from "@/components/features/word-review-slider"
import { useTaskStore } from "@/lib/store"

interface TaskViewProps {
    task: Task
    subtask: Subtask
    tasks: Task[]
    onUpdateTasks: (tasks: Task[]) => void
    onNextTask: () => void
}

export function TaskView({ task, subtask, tasks, onUpdateTasks, onNextTask }: TaskViewProps) {
    const [input, setInput] = useState(subtask.content || "")
    const { isGenerating, setIsGenerating, setRegenerateFn, activePrompt, setActivePrompt } = useTaskStore()
    const [error, setError] = useState<string | null>(null)
    const [showTaskSettings, setShowTaskSettings] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    // Per-task settings
    const settings = storage.getSettings()
    const [taskModel, setTaskModel] = useState(settings?.selectedModel || DEFAULT_MODEL)
    const [taskPrompt, setTaskPrompt] = useState(settings?.customPrompt || subtask.prompt || DEFAULT_PROMPT)
    const [learningDays, setLearningDays] = useState(settings?.learningDays || DEFAULT_LEARNING_DAYS)

    // Reset state when subtask changes
    useEffect(() => {
        setInput(subtask.content || "")
        const initialPrompt = settings?.customPrompt || subtask.prompt || DEFAULT_PROMPT
        setTaskPrompt(initialPrompt)
        setActivePrompt(initialPrompt)
    }, [subtask.id, subtask.content, subtask.prompt, settings?.customPrompt, setActivePrompt])

    const handleSaveWrite = () => {
        if (!input.trim()) return
        updateSubtask({ content: input, status: "completed" })
        setIsEditing(false)
    }

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleDeleteTaskHistory = () => {
        if (window.confirm("Are you sure you want to delete this task's history? This will reset all subtasks in this task.")) {
            // Reset all subtasks in current task
            const updatedSubtasks = task.subtasks.map(s => ({
                ...s,
                content: undefined,
                status: "pending" as const,
                formattedContent: undefined,
                learnedParagraphs: undefined
            }))
            const updatedTask = { ...task, subtasks: updatedSubtasks, status: "active" as const }
            const updatedTasks = tasks.map(t => t.id === task.id ? updatedTask : t)
            onUpdateTasks(updatedTasks)
            // Reset local state
            setInput("")
            setIsEditing(false)
        }
    }

    const updateSubtask = useCallback((updates: Partial<Subtask>) => {
        const updatedSubtasks = task.subtasks.map(s =>
            s.id === subtask.id ? { ...s, ...updates } : s
        )

        const updatedTask = { ...task, subtasks: updatedSubtasks }
        const allCompleted = updatedSubtasks.every(s => s.status === "completed")
        if (allCompleted) {
            updatedTask.status = "completed"
        }

        const updatedTasks = tasks.map(t => t.id === task.id ? updatedTask : t)
        onUpdateTasks(updatedTasks)
    }, [task, subtask.id, tasks, onUpdateTasks])

    const handleGenerate = useCallback(async () => {
        setIsGenerating(true)
        setError(null)
        try {
            // Find the previous subtask content to translate
            const subtaskIndex = task.subtasks.findIndex(s => s.id === subtask.id)
            const previousContent = subtaskIndex > 0 ? task.subtasks[subtaskIndex - 1].content : ""

            if (!previousContent) {
                throw new Error("No content to translate found from previous task.")
            }

            // Use activePrompt for generation to ensure latest edits are used
            const translation = await generateTranslation(previousContent, activePrompt, taskModel)
            // Clear formatted content AND learned paragraphs when regenerating main translation
            // Set startDate if this is the first time completing, preserve it on regeneration
            const updates: Partial<Subtask> = {
                content: translation,
                status: "completed",
                formattedContent: {},
                learnedParagraphs: {}
            }
            if (!subtask.startDate) {
                updates.startDate = new Date().toISOString()
            } else {
                // Preserve existing startDate on regeneration
                updates.startDate = subtask.startDate
            }
            updateSubtask(updates)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate translation")
        } finally {
            setIsGenerating(false)
        }
    }, [task.subtasks, subtask.id, subtask.startDate, activePrompt, taskModel, setIsGenerating, updateSubtask])

    // Register regenerate function only if not completed (EnhancedReadingText takes over when completed)
    useEffect(() => {
        if (subtask.type === "generate" && subtask.status !== "completed") {
            setRegenerateFn(handleGenerate)
        } else if (subtask.type !== "generate") {
            setRegenerateFn(null)
        }
        return () => setRegenerateFn(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subtask.type, subtask.status, setRegenerateFn])

    const handleCompleteRead = () => {
        updateSubtask({ content: subtask.content, status: "completed" })
    }



    const handleUpdateFormattedContent = useCallback((newFormats: Record<string, string>) => {
        updateSubtask({
            formattedContent: {
                ...(subtask.formattedContent || {}),
                ...newFormats
            }
        })
    }, [subtask.formattedContent, updateSubtask])

    const handleUpdateLearnedParagraphs = useCallback((learnedParagraphs: Record<string, boolean>) => {
        updateSubtask({ learnedParagraphs })
    }, [updateSubtask])

    return (
        <Card className="w-full max-w-5xl mx-auto mt-8">
            <CardHeader>
                <CardTitle className="text-2xl">{subtask.title}</CardTitle>
                <CardDescription>
                    {subtask.type === "write" && "Write your response below."}
                    {subtask.type === "generate" && "Generate the Indonesian translation."}
                    {subtask.type === "read" && "Read and study the text below."}
                    {subtask.type === "word-review" && "Review vocabulary words with audio and pronunciation practice."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {subtask.type === "write" && (
                    <>
                        <Textarea
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                            placeholder="Type here or use voice input..."
                            className="min-h-[200px] text-lg p-4 border-2 border-primary/30 focus:border-primary bg-background"
                            disabled={subtask.status === "completed" && !isEditing}
                        />
                        
                        {/* Voice Input Section */}
                        {(subtask.status !== "completed" || isEditing) && (
                            <div className="flex flex-col gap-3 p-4 border border-primary/20 rounded-lg bg-primary/5">
                                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                    <Mic className="h-4 w-4" />
                                    Voice Input
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Click the button below and speak your autobiography. Your speech will be converted to text.
                                </p>
                                <VoiceInputButton
                                    onTranscript={(transcript) => {
                                        setInput(prev => prev ? `${prev} ${transcript}` : transcript)
                                    }}
                                    language="en-US"
                                    variant="default"
                                    continuous={true}
                                />
                            </div>
                        )}

                        {subtask.status !== "completed" || isEditing ? (
                            <Button onClick={handleSaveWrite} className="w-full" disabled={!input.trim()}>
                                Save & Continue
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="flex-1 flex items-center justify-center gap-2 text-primary font-medium p-2 bg-primary/10 rounded-md">
                                    <CheckCircle2 className="h-5 w-5" /> Saved
                                </div>
                                <Button onClick={handleEdit} variant="outline" size="icon">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {subtask.type === "generate" && (
                    <div className="space-y-4">
                        {/* Action Buttons Row */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDeleteTaskHistory}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Task Data
                            </Button>
                            <Collapsible open={showTaskSettings} onOpenChange={setShowTaskSettings} className="flex-1">
                                <CollapsibleTrigger asChild>
                                    <Button variant="outline" className="w-full" size="sm">
                                        <Settings2 className="mr-2 h-4 w-4" />
                                        {showTaskSettings ? "Hide" : "Show"} Translation Settings
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-4 pt-4">
                                    {/* Model Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="task-model" className="text-sm font-medium">
                                        Translation Model
                                    </Label>
                                    <Select value={taskModel} onValueChange={(value) => {
                                        setTaskModel(value)
                                        // Save to localStorage
                                        const currentSettings = storage.getSettings() || {
                                            selectedModel: DEFAULT_MODEL,
                                            customPrompt: DEFAULT_PROMPT,
                                            learningDays: DEFAULT_LEARNING_DAYS
                                        }
                                        storage.saveSettings({ ...currentSettings, selectedModel: value })
                                    }}>
                                        <SelectTrigger id="task-model" className="border-2 border-primary/30 focus:border-primary bg-background">
                                            <SelectValue placeholder="Choose a model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {AVAILABLE_MODELS.map((model) => (
                                                <SelectItem key={model.id} value={model.id}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{model.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {model.provider}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Prompt Customization */}
                                <div className="space-y-2">
                                    <Label htmlFor="task-prompt" className="text-sm font-medium">
                                        Custom Prompt
                                    </Label>
                                    <Textarea
                                        id="task-prompt"
                                        value={activePrompt}
                                        onChange={(e) => {
                                            const newPrompt = e.target.value
                                            setActivePrompt(newPrompt)
                                            // Update local task prompt if we are in base mode or clean tab
                                            // Note: EnhancedReadingText will handle updating taskPrompt if on Clean tab
                                            if (subtask.status !== 'completed') {
                                                setTaskPrompt(newPrompt)
                                            }
                                            // Save to localStorage
                                            const currentSettings = storage.getSettings() || {
                                                selectedModel: DEFAULT_MODEL,
                                                customPrompt: DEFAULT_PROMPT,
                                                learningDays: DEFAULT_LEARNING_DAYS
                                            }
                                            storage.saveSettings({ ...currentSettings, customPrompt: newPrompt })
                                        }}
                                        placeholder="Enter custom prompt..."
                                        className="min-h-[80px] text-sm border-2 border-primary/30 focus:border-primary bg-background"
                                    />
                                </div>

                                {/* Learning Days */}
                                <div className="space-y-2">
                                    <Label htmlFor="learning-days" className="text-sm font-medium">
                                        Learning Days
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            id="learning-days"
                                            min="1"
                                            max="30"
                                            value={learningDays}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value) || 1
                                                setLearningDays(value)
                                                const currentSettings = storage.getSettings() || {
                                                    selectedModel: DEFAULT_MODEL,
                                                    customPrompt: DEFAULT_PROMPT,
                                                    learningDays: DEFAULT_LEARNING_DAYS
                                                }
                                                storage.saveSettings({ ...currentSettings, learningDays: value })
                                            }}
                                            className="w-20 px-3 py-2 border-2 border-primary/30 focus:border-primary rounded-md bg-background text-sm"
                                        />
                                        <span className="text-sm text-muted-foreground">days to split content equally</span>
                                    </div>
                                </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>

                        {/* Translation Result */}
                        {subtask.status === "completed" && subtask.content && (
                            <EnhancedReadingText
                                content={subtask.content}
                                language="id"
                                model={taskModel}
                                basePrompt={taskPrompt}
                                onUpdateBasePrompt={setTaskPrompt}
                                onRegenerateBase={handleGenerate}
                                formattedContent={subtask.formattedContent}
                                onUpdateFormattedContent={handleUpdateFormattedContent}
                                learnedParagraphs={subtask.learnedParagraphs}
                                onUpdateLearnedParagraphs={handleUpdateLearnedParagraphs}
                                learningDays={learningDays}
                                startDate={subtask.startDate}
                            />
                        )}

                        {/* Generate/Regenerate Button */}
                        <div className="flex flex-col items-center gap-4 py-4">
                            {subtask.status !== "completed" && (
                                <>
                                    <p className="text-muted-foreground text-center">
                                        Ready to translate your autobiography to Indonesian?
                                    </p>
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        size="lg"
                                        className="w-full max-w-md"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Translating...
                                            </>
                                        ) : (
                                            "Generate Translation"
                                        )}
                                    </Button>
                                </>
                            )}
                            {error && <p className="text-destructive text-sm">{error}</p>}
                        </div>
                    </div>
                )}

                {subtask.type === "read" && (
                    <div className="space-y-6">
                        {(() => {
                            // Find previous subtask content
                            const subtaskIndex = task.subtasks.findIndex(s => s.id === subtask.id)
                            const contentToRead = subtask.content || (subtaskIndex > 0 ? task.subtasks[subtaskIndex - 1].content : "")

                            return contentToRead ? (
                                <EnhancedReadingText
                                    content={contentToRead}
                                    language="id"
                                    model={taskModel}
                                    basePrompt=""
                                    onUpdateBasePrompt={() => { }}
                                    onRegenerateBase={async () => { }}
                                    formattedContent={subtask.formattedContent}
                                    onUpdateFormattedContent={handleUpdateFormattedContent}
                                    learnedParagraphs={subtask.learnedParagraphs}
                                    onUpdateLearnedParagraphs={handleUpdateLearnedParagraphs}
                                    learningDays={learningDays}
                                    startDate={subtask.startDate}
                                />
                            ) : (
                                <div className="p-6 bg-card border border-border rounded-lg shadow-sm text-center text-muted-foreground">
                                    No content to read yet.
                                </div>
                            )
                        })()}
                        {subtask.status !== "completed" && (
                            <Button onClick={handleCompleteRead} className="w-full" size="lg">
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                I have read this
                            </Button>
                        )}
                    </div>
                )}

                {subtask.type === "word-review" && (
                    <div className="space-y-6">
                        <div className="text-center space-y-2 py-4">
                            <h3 className="text-xl font-semibold">Vocabulary Review & Pronunciation</h3>
                            <p className="text-muted-foreground">
                                Practice Indonesian words from your learning content with audio and pronunciation checks.
                            </p>
                        </div>
                        {(() => {
                            // Find the previous subtask's content (usually the "read" or "generate" task)
                            const subtaskIndex = task.subtasks.findIndex(s => s.id === subtask.id)
                            let contentToReview = ""
                            let learnedParagraphs = {}
                            
                            // Look backwards for content and learned state
                            for (let i = subtaskIndex - 1; i >= 0; i--) {
                                const prevSubtask = task.subtasks[i]
                                if (prevSubtask.content && (prevSubtask.type === "read" || prevSubtask.type === "generate")) {
                                    contentToReview = prevSubtask.content
                                    learnedParagraphs = prevSubtask.learnedParagraphs || {}
                                    break
                                }
                            }
                            
                            return (
                                <WordReviewSlider 
                                    content={contentToReview}
                                    learnedParagraphs={learnedParagraphs}
                                    onComplete={() => {
                                        updateSubtask({ status: "completed" })
                                    }}
                                />
                            )
                        })()}
                        {subtask.status !== "completed" && (
                            <Button 
                                onClick={() => updateSubtask({ status: "completed" })} 
                                className="w-full" 
                                size="lg"
                                variant="secondary"
                            >
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                Mark as Complete
                            </Button>
                        )}
                    </div>
                )}

                {subtask.status === "completed" && (
                    <Button onClick={onNextTask} variant="outline" className="w-full mt-4">
                        Next Task <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
