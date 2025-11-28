"use client"

import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Trash2, ArrowRight } from "lucide-react"
import { storage, type User, type Task } from "@/lib/storage"
import { useLanguageStore } from "@/lib/language-store"
import { SUPPORTED_LANGUAGES, getLanguageGreeting } from "@/types/language"

interface AppHeaderProps {
    user: User
    tasks: Task[]
    currentTaskId?: string | null
    onOpenSettings?: () => void
    onCleanDatabase?: () => void
}

export function AppHeader({ user, tasks, currentTaskId, onOpenSettings, onCleanDatabase }: AppHeaderProps) {
    const { originalLanguage, learningLanguage, setOriginalLanguage, setLearningLanguage } = useLanguageStore()
    
    const handleCleanDatabase = () => {
        if (window.confirm("Are you sure you want to clean all database? This will delete all your progress, tasks, and settings. This action cannot be undone.")) {
            storage.resetProgress()
            if (onCleanDatabase) {
                onCleanDatabase()
            }
        }
    }
    // Calculate progress
    const totalSubtasks = tasks.reduce((acc, task) => acc + task.subtasks.length, 0)
    const completedSubtasks = tasks.reduce(
        (acc, task) => acc + task.subtasks.filter((s) => s.status === "completed").length,
        0
    )
    const progress = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100

    // Get current task name
    const currentTask = tasks.find(t => t.id === currentTaskId)
    const currentTaskName = currentTask?.title

    // Get greeting in learning language
    const greeting = getLanguageGreeting(learningLanguage)

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 bg-background/50 px-4 backdrop-blur-sm transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-semibold text-foreground">
                        {greeting}, <span className="text-primary">{user.name}</span>
                    </h1>
                    {currentTaskName && (
                        <>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="text-sm text-muted-foreground">
                                Current: <span className="font-medium text-foreground">{currentTaskName}</span>
                            </span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {/* Language Selection */}
                    <div className="flex items-center gap-2">
                        <Select value={originalLanguage} onValueChange={setOriginalLanguage}>
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                                <SelectValue placeholder="From" />
                            </SelectTrigger>
                            <SelectContent>
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <SelectItem 
                                        key={lang.code} 
                                        value={lang.code}
                                        disabled={lang.code === learningLanguage}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>{lang.nativeName}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Select value={learningLanguage} onValueChange={setLearningLanguage}>
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                                <SelectValue placeholder="To" />
                            </SelectTrigger>
                            <SelectContent>
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <SelectItem 
                                        key={lang.code} 
                                        value={lang.code}
                                        disabled={lang.code === originalLanguage}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>{lang.nativeName}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground">Overall Progress</span>
                        <div className="flex items-center gap-2">
                            <Progress value={progress} className="h-2 w-24" />
                            <span className="text-xs font-medium">{Math.round(progress)}%</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                        <span className="text-xs text-muted-foreground">Words Learned</span>
                        <span className="text-sm font-bold text-primary">{user.wordsLearned}</span>
                    </div>
                    {onOpenSettings && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onOpenSettings}
                            className="h-9 w-9"
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                    )}
                    {onCleanDatabase && (
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={handleCleanDatabase}
                            className="h-9 w-9"
                            title="Clean Database"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
