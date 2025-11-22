"use client"

import { useEffect, useState } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { LoginScreen } from "@/components/login-screen"
import { storage, type User, type Task } from "@/lib/storage"
import { TaskView } from "@/components/features/task-view"
import { SettingsView } from "@/components/features/settings-view"

export function MainView() {
    const [user, setUser] = useState<User | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
    const [currentSubtaskId, setCurrentSubtaskId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showSettings, setShowSettings] = useState(false)

    useEffect(() => {
        // Load initial data
        const loadedUser = storage.getUser()
        const loadedTasks = storage.getTasks()
        const savedView = storage.getCurrentView()

        setUser(loadedUser)
        setTasks(loadedTasks)

        // Restore saved view if available
        if (savedView && loadedTasks.length > 0) {
            const savedTask = loadedTasks.find(t => t.id === savedView.taskId)
            if (savedTask) {
                const savedSubtask = savedTask.subtasks.find(s => s.id === savedView.subtaskId)
                if (savedSubtask) {
                    setCurrentTaskId(savedView.taskId)
                    setCurrentSubtaskId(savedView.subtaskId)
                    setIsLoading(false)
                    return
                }
            }
        }

        // Set initial active task if available (fallback)
        if (loadedTasks.length > 0) {
            const activeTask = loadedTasks.find(t => t.status === "active") || loadedTasks[0]
            if (activeTask) {
                setCurrentTaskId(activeTask.id)
                // Find first pending subtask or just the first one
                const activeSubtask = activeTask.subtasks.find(s => s.status === "pending") || activeTask.subtasks[0]
                setCurrentSubtaskId(activeSubtask.id)
            }
        }

        setIsLoading(false)
    }, [])

    const handleLogin = (newUser: User) => {
        setUser(newUser)
        // Reload tasks to ensure fresh state
        const loadedTasks = storage.getTasks()
        setTasks(loadedTasks)
        if (loadedTasks.length > 0) {
            setCurrentTaskId(loadedTasks[0].id)
            setCurrentSubtaskId(loadedTasks[0].subtasks[0].id)
        }
    }

    const handleTaskUpdate = (updatedTasks: Task[]) => {
        setTasks(updatedTasks)
        storage.saveTasks(updatedTasks)
    }

    const handleSelectSubtask = (taskId: string, subtaskId: string) => {
        setCurrentTaskId(taskId)
        setCurrentSubtaskId(subtaskId)
        // Save current view
        storage.saveCurrentView({ taskId, subtaskId })
    }

    // Save current view whenever it changes
    useEffect(() => {
        if (currentTaskId && currentSubtaskId) {
            storage.saveCurrentView({ taskId: currentTaskId, subtaskId: currentSubtaskId })
        }
    }, [currentTaskId, currentSubtaskId])

    const handleCleanDatabase = () => {
        // Reset user state and reload
        setUser(null)
        setTasks([])
        setCurrentTaskId(null)
        setCurrentSubtaskId(null)
        // Reload the page to ensure clean state
        window.location.reload()
    }

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    if (!user) {
        return <LoginScreen onLogin={handleLogin} />
    }

    const currentTask = tasks.find(t => t.id === currentTaskId)
    const currentSubtask = currentTask?.subtasks.find(s => s.id === currentSubtaskId)

    return (
        <SidebarProvider>
            <AppSidebar
                tasks={tasks}
                currentSubtaskId={currentSubtaskId}
                onSelectSubtask={handleSelectSubtask}
            />
            <SidebarInset>
                <AppHeader
                    user={user}
                    tasks={tasks}
                    currentTaskId={currentTaskId}
                    onOpenSettings={() => setShowSettings(!showSettings)}
                    onCleanDatabase={handleCleanDatabase}
                />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {showSettings ? (
                        <SettingsView onClose={() => setShowSettings(false)} />
                    ) : currentTask && currentSubtask ? (
                        <TaskView
                            task={currentTask}
                            subtask={currentSubtask}
                            tasks={tasks}
                            onUpdateTasks={handleTaskUpdate}
                            onNextTask={() => {
                                // Logic to move to next subtask
                                const subtaskIndex = currentTask.subtasks.findIndex(s => s.id === currentSubtask.id)
                                if (subtaskIndex < currentTask.subtasks.length - 1) {
                                    setCurrentSubtaskId(currentTask.subtasks[subtaskIndex + 1].id)
                                } else {
                                    // Unlock next task if available
                                    // For now just alert
                                    alert("Task Completed! Great job!")
                                }
                            }}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Select a task to begin
                        </div>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
