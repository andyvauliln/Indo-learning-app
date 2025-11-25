"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { DisplayFormat } from "@/types/reading-text"

interface DisplayFormatTabsProps {
    activeTab: DisplayFormat
    isFormatting: boolean
    onTabChange: (tab: DisplayFormat) => void
    regenerateFn?: (() => Promise<void>) | null
    isGenerating?: boolean
}

export function DisplayFormatTabs({
    activeTab,
    isFormatting,
    onTabChange,
    regenerateFn,
    isGenerating = false
}: DisplayFormatTabsProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={activeTab === "clean" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onTabChange("clean")}
                >
                    Clean Text
                </Button>
                <Button
                    variant={activeTab === "word-translation" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onTabChange("word-translation")}
                    disabled={isFormatting}
                >
                    Word Translation
                </Button>
                <Button
                    variant={activeTab === "partial-reveal" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onTabChange("partial-reveal")}
                    disabled={isFormatting}
                >
                    Partial Reveal
                </Button>
                <Button
                    variant={activeTab === "custom" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onTabChange("custom")}
                >
                    Custom
                </Button>
            </div>

            {regenerateFn && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => regenerateFn()}
                    disabled={isGenerating}
                >
                    <RefreshCw className={`h-3 w-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                    Regenerate
                </Button>
            )}
        </div>
    )
}
