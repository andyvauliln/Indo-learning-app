"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface CustomFormatInputProps {
    value: string
    onChange: (value: string) => void
    onApply: () => void
    isFormatting: boolean
}

export function CustomFormatInput({
    value,
    onChange,
    onApply,
    isFormatting
}: CustomFormatInputProps) {
    return (
        <div className="space-y-2 p-4 bg-muted rounded-lg animate-in slide-in-from-top-2">
            <Textarea
                placeholder="Enter custom format instructions (e.g., 'Add pronunciation hints', 'Highlight verbs', etc.)"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="min-h-[80px]"
            />
            <Button
                onClick={onApply}
                disabled={isFormatting || !value.trim()}
            >
                {isFormatting ? "Formatting..." : "Apply Custom Format"}
            </Button>
        </div>
    )
}
