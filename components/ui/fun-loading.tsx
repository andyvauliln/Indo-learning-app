import { Loader2 } from "lucide-react"

export function FunLoading({ message = "Generating magic..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in duration-300">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
            </div>
            <p className="text-lg font-medium text-muted-foreground animate-pulse">
                {message}
            </p>
            <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            </div>
        </div>
    )
}
