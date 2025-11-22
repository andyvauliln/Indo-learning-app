"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { generateTranslation } from "@/lib/api"
import { storage, type Task, type Subtask } from "@/lib/storage"
import { AVAILABLE_MODELS, DEFAULT_MODEL, DEFAULT_PROMPT } from "@/lib/models"
import { Loader2, CheckCircle2, ArrowRight, Settings2, Edit, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { EnhancedReadingText } from "@/components/features/enhanced-reading-text"
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

    // Sync taskPrompt to activePrompt on mount or when task changes
    useEffect(() => {
        setActivePrompt(taskPrompt)
    }, [taskPrompt, setActivePrompt])

    const handleSaveWrite = () => {
        if (!input.trim()) return
        updateSubtask(input, "completed")
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
                status: "pending" as const
            }))
            const updatedTask = { ...task, subtasks: updatedSubtasks, status: "active" as const }
            const updatedTasks = tasks.map(t => t.id === task.id ? updatedTask : t)
            onUpdateTasks(updatedTasks)
            // Reset local state
            setInput("")
            setIsEditing(false)
        }
    }

    const handleGenerate = async () => {
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
            updateSubtask(translation, "completed")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate translation")
        } finally {
            setIsGenerating(false)
        }
    }

    // Register regenerate function only if not completed (EnhancedReadingText takes over when completed)
    useEffect(() => {
        if (subtask.type === "generate" && subtask.status !== "completed") {
            setRegenerateFn(handleGenerate)
        } else if (subtask.type !== "generate") {
            setRegenerateFn(null)
        }
        // Cleanup is handled by next effect or component unmount
    }, [subtask.type, subtask.status, activePrompt, taskModel, task.subtasks])

    const handleCompleteRead = () => {
        updateSubtask(subtask.content, "completed")
    }

    const updateSubtask = (content: string | undefined, status: "pending" | "completed") => {
        const updatedSubtasks = task.subtasks.map(s =>
            s.id === subtask.id ? { ...s, content, status } : s
        )

        const updatedTask = { ...task, subtasks: updatedSubtasks }
        const allCompleted = updatedSubtasks.every(s => s.status === "completed")
        if (allCompleted) {
            updatedTask.status = "completed"
        }

        const updatedTasks = tasks.map(t => t.id === task.id ? updatedTask : t)
        onUpdateTasks(updatedTasks)
    }

    return (
        <Card className="w-full max-w-5xl mx-auto mt-8">
            <CardHeader>
                <CardTitle className="text-2xl">{subtask.title}</CardTitle>
                <CardDescription>
                    {subtask.type === "write" && "Write your response below."}
                    {subtask.type === "generate" && "Generate the Indonesian translation."}
                    {subtask.type === "read" && "Read and study the text below."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Delete Task History Button */}
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteTaskHistory}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Task History
                    </Button>
                </div>
                {subtask.type === "write" && (
                    <>
                        <Textarea
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                            placeholder="Type here..."
                            className="min-h-[200px] text-lg p-4"
                            disabled={subtask.status === "completed" && !isEditing}
                        />
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
                        {/* Task Settings - Always visible */}
                        <Collapsible open={showTaskSettings} onOpenChange={setShowTaskSettings}>
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
                                    <Select value={taskModel} onValueChange={setTaskModel}>
                                        <SelectTrigger id="task-model">
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
                                            setActivePrompt(e.target.value)
                                            // Update local task prompt if we are in base mode or clean tab
                                            // Note: EnhancedReadingText will handle updating taskPrompt if on Clean tab
                                            if (subtask.status !== 'completed') {
                                                setTaskPrompt(e.target.value)
                                            }
                                        }}
                                        placeholder="Enter custom prompt..."
                                        className="min-h-[80px] text-sm"
                                    />
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Translation Result */}
                        {subtask.status === "completed" && subtask.content && (
                            <EnhancedReadingText
                                content={subtask.content}
                                language="id"
                                model={taskModel}
                                basePrompt={taskPrompt}
                                onUpdateBasePrompt={setTaskPrompt}
                                onRegenerateBase={handleGenerate}
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

                {subtask.status === "completed" && (
                    <Button onClick={onNextTask} variant="outline" className="w-full mt-4">
                        Next Task <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
