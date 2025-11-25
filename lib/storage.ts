// Storage Keys
const STORAGE_KEY_USER = "indo_app_user"
const STORAGE_KEY_TASKS = "indo_app_tasks"
const STORAGE_KEY_SETTINGS = "indo_app_settings"
const STORAGE_KEY_CURRENT_VIEW = "indo_app_current_view"

// Types
export interface User {
    name: string
    wordsLearned: number
}

export interface Settings {
    selectedModel: string
    customPrompt: string
    learningDays: number // Number of days to split learning content
}

export interface CurrentView {
    taskId: string
    subtaskId: string
}

export type SubtaskType = "write" | "generate" | "read"

export interface Subtask {
    id: string
    title: string
    type: SubtaskType
    status: "pending" | "completed"
    content?: string // For user input or generated text
    prompt?: string // For generation tasks
    formattedContent?: Record<string, string> // Cache for formatted versions
    learnedParagraphs?: Record<string, boolean> // Track which paragraphs are marked as learned
    startDate?: string // ISO date when learning started (when first completed)
}

export interface Task {
    id: string
    title: string
    status: "locked" | "active" | "completed"
    subtasks: Subtask[]
}

// Initial Data
const INITIAL_TASKS: Task[] = [
    {
        id: "task-1",
        title: "Learn Your Autobiography",
        status: "active",
        subtasks: [
            {
                id: "sub-1-1",
                title: "Write your autobiography",
                type: "write",
                status: "pending",
            },
            {
                id: "sub-1-2",
                title: "Generate Indonesian Translation",
                type: "generate",
                status: "pending",
                prompt: "Translate the following autobiography to Indonesian. Keep it simple and natural for a beginner to learn.",
            },
            {
                id: "sub-1-3",
                title: "Read and Verify",
                type: "read",
                status: "pending",
            },
        ],
    },
]

// Storage Functions
export const storage = {
    getUser: (): User | null => {
        if (typeof window === "undefined") return null
        const data = localStorage.getItem(STORAGE_KEY_USER)
        return data ? JSON.parse(data) : null
    },

    saveUser: (user: User) => {
        if (typeof window === "undefined") return
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
    },

    getTasks: (): Task[] => {
        if (typeof window === "undefined") return INITIAL_TASKS
        const data = localStorage.getItem(STORAGE_KEY_TASKS)
        if (!data) {
            // Initialize if empty
            localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(INITIAL_TASKS))
            return INITIAL_TASKS
        }
        return JSON.parse(data)
    },

    saveTasks: (tasks: Task[]) => {
        if (typeof window === "undefined") return
        localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks))
    },

    resetProgress: () => {
        if (typeof window === "undefined") return
        // Clear all localStorage to ensure complete cleanup
        localStorage.clear()
    },

    getSettings: (): Settings | null => {
        if (typeof window === "undefined") return null
        const data = localStorage.getItem(STORAGE_KEY_SETTINGS)
        return data ? JSON.parse(data) : null
    },

    saveSettings: (settings: Settings) => {
        if (typeof window === "undefined") return
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings))
    },

    getCurrentView: (): CurrentView | null => {
        if (typeof window === "undefined") return null
        const data = localStorage.getItem(STORAGE_KEY_CURRENT_VIEW)
        return data ? JSON.parse(data) : null
    },

    saveCurrentView: (view: CurrentView) => {
        if (typeof window === "undefined") return
        localStorage.setItem(STORAGE_KEY_CURRENT_VIEW, JSON.stringify(view))
    }
}
