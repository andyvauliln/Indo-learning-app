"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2, AlertCircle } from "lucide-react"
import { useVoiceRecording } from "@/hooks/use-speech"
import { cn } from "@/lib/utils"

interface VoiceInputButtonProps {
    onTranscript: (transcript: string) => void
    language?: string
    className?: string
    disabled?: boolean
    variant?: "default" | "outline" | "ghost" | "secondary"
    size?: "default" | "sm" | "lg" | "icon"
    continuous?: boolean
}

export function VoiceInputButton({
    onTranscript,
    language = "id-ID",
    className,
    disabled = false,
    variant = "outline",
    size = "default",
    continuous = true,
}: VoiceInputButtonProps) {
    // Use a ref to track if component is mounted
    const mountedRef = useRef(false)
    
    const {
        isListening,
        isSupported,
        transcript,
        interimTranscript,
        error,
        startListening,
        stopListening,
        resetTranscript,
    } = useVoiceRecording({
        language,
        continuous,
        onResult: (result) => {
            if (result.transcript) {
                onTranscript(result.transcript)
            }
        },
    })

    // Track mounted state without triggering re-render
    useEffect(() => {
        mountedRef.current = true
        return () => { mountedRef.current = false }
    }, [])

    // Also send final transcript when stopping
    useEffect(() => {
        if (!isListening && transcript) {
            onTranscript(transcript)
            resetTranscript()
        }
    }, [isListening, transcript, onTranscript, resetTranscript])

    const handleToggle = () => {
        if (isListening) {
            stopListening()
        } else {
            resetTranscript()
            startListening()
        }
    }

    if (!isSupported) {
        return (
            <Button variant={variant} size={size} disabled className={cn("opacity-50", className)}>
                <AlertCircle className="h-4 w-4" />
                {size !== "icon" && <span className="ml-2">Voice not supported</span>}
            </Button>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            <Button
                variant={isListening ? "destructive" : variant}
                size={size}
                onClick={handleToggle}
                disabled={disabled}
                className={cn(
                    "transition-all duration-200",
                    isListening && "animate-pulse",
                    className
                )}
            >
                {isListening ? (
                    <>
                        <MicOff className="h-4 w-4" />
                        {size !== "icon" && <span className="ml-2">Stop Recording</span>}
                    </>
                ) : (
                    <>
                        <Mic className="h-4 w-4" />
                        {size !== "icon" && <span className="ml-2">Start Voice Input</span>}
                    </>
                )}
            </Button>
            
            {/* Show interim transcript while recording */}
            {isListening && interimTranscript && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="italic">{interimTranscript}</span>
                </div>
            )}

            {/* Show error if any */}
            {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error.message}
                </p>
            )}
        </div>
    )
}
