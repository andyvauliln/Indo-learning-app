"use client"

import { CheckCircle2, Circle, Lock, BookOpen } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { Task, Subtask } from "@/lib/storage"

interface AppSidebarProps {
    tasks: Task[]
    currentSubtaskId: string | null
    onSelectSubtask: (taskId: string, subtaskId: string) => void
}

export function AppSidebar({ tasks, currentSubtaskId, onSelectSubtask }: AppSidebarProps) {
    return (
        <Sidebar className="border-r border-border/50 bg-sidebar/50 backdrop-blur-sm">
            <SidebarHeader className="border-b border-border/50 p-4">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                    <BookOpen className="h-6 w-6" />
                    Langotron
                </h2>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Your Journey</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {tasks.map((task) => (
                                <Collapsible key={task.id} defaultOpen={task.status === "active" || task.status === "completed"} className="group/collapsible">
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton className="font-semibold text-foreground hover:text-primary">
                                                {task.status === "completed" ? (
                                                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                                ) : task.status === "locked" ? (
                                                    <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Circle className="mr-2 h-4 w-4 text-primary" />
                                                )}
                                                {task.title}
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {task.subtasks.map((subtask) => (
                                                    <SidebarMenuSubItem
                                                        key={subtask.id}
                                                        subtask={subtask}
                                                        isActive={currentSubtaskId === subtask.id}
                                                        isLocked={task.status === "locked"}
                                                        onClick={() => {
                                                            if (task.status !== "locked") {
                                                                onSelectSubtask(task.id, subtask.id)
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}

function SidebarMenuSub({ children }: { children: React.ReactNode }) {
    return <div className="ml-6 mt-1 flex flex-col space-y-1 border-l border-border/50 pl-2">{children}</div>
}

function SidebarMenuSubItem({
    subtask,
    isActive,
    isLocked,
    onClick,
}: {
    subtask: Subtask
    isActive: boolean
    isLocked: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            disabled={isLocked}
            className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-left",
                isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isLocked && "cursor-not-allowed opacity-50"
            )}
        >
            {subtask.status === "completed" ? (
                <CheckCircle2 className="h-3 w-3 text-primary" />
            ) : (
                <Circle className="h-3 w-3" />
            )}
            {subtask.title}
        </button>
    )
}
