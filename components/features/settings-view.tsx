"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { storage, type Settings } from "@/lib/storage"
import { AVAILABLE_MODELS, DEFAULT_MODEL, DEFAULT_PROMPT, MEME_TEXT_MODELS, IMAGE_MODELS, DEFAULT_MEME_TEXT_MODEL, DEFAULT_IMAGE_MODEL } from "@/lib/models"
import { Settings as SettingsIcon, Save } from "lucide-react"

interface SettingsViewProps {
    onClose: () => void
}

export function SettingsView({ onClose }: SettingsViewProps) {
    // Initialize with default values to match server-side rendering
    const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
    const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT)
    const [learningDays, setLearningDays] = useState(3)
    const [memeTextModel, setMemeTextModel] = useState(DEFAULT_MEME_TEXT_MODEL)
    const [memeImageModel, setMemeImageModel] = useState(DEFAULT_IMAGE_MODEL)
    const [isSaved, setIsSaved] = useState(false)

    // Load saved settings on client-side only
    useEffect(() => {
        const savedSettings = storage.getSettings()
        if (savedSettings) {
            setSelectedModel(savedSettings.selectedModel ?? DEFAULT_MODEL)
            setCustomPrompt(savedSettings.customPrompt ?? DEFAULT_PROMPT)
            setLearningDays(savedSettings.learningDays ?? 3)
            setMemeTextModel(savedSettings.memeTextModel ?? DEFAULT_MEME_TEXT_MODEL)
            setMemeImageModel(savedSettings.memeImageModel ?? DEFAULT_IMAGE_MODEL)
        }
    }, [])

    const handleSave = () => {
        const settings: Settings = {
            selectedModel,
            customPrompt,
            learningDays,
            memeTextModel,
            memeImageModel
        }
        storage.saveSettings(settings)
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 2000)
    }

    // Group models by provider
    const modelsByProvider = AVAILABLE_MODELS.reduce((acc, model) => {
        if (!acc[model.provider]) {
            acc[model.provider] = []
        }
        acc[model.provider].push(model)
        return acc
    }, {} as Record<string, typeof AVAILABLE_MODELS>)

    return (
        <div className="w-full max-w-3xl mx-auto mt-8 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <SettingsIcon className="h-6 w-6 text-primary" />
                        <CardTitle className="text-2xl">Translation Settings</CardTitle>
                    </div>
                    <CardDescription>
                        Configure the AI model and prompt for Indonesian translations
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Model Selection */}
                    <div className="space-y-3">
                        <Label htmlFor="model-select" className="text-base font-semibold">
                            Select Translation Model
                        </Label>
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                            <SelectTrigger id="model-select" className="w-full">
                                <SelectValue placeholder="Choose a model" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(modelsByProvider).map(([provider, models]) => (
                                    <div key={provider}>
                                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                            {provider}
                                        </div>
                                        {models.map((model) => (
                                            <SelectItem key={model.id} value={model.id}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{model.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {model.description}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </div>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                            Selected: {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
                        </p>
                    </div>

                    {/* Custom Prompt */}
                    <div className="space-y-3">
                        <Label htmlFor="custom-prompt" className="text-base font-semibold">
                            Custom Translation Prompt
                        </Label>
                        <Textarea
                            id="custom-prompt"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Enter your custom prompt for translations..."
                            className="min-h-[120px] text-base"
                        />
                        <p className="text-sm text-muted-foreground">
                            This prompt will be used to guide the AI when translating your text to Indonesian.
                        </p>
                    </div>

                    {/* Learning Days */}
                    <div className="space-y-3">
                        <Label htmlFor="learning-days" className="text-base font-semibold">
                            Learning Days Split
                        </Label>
                        <div className="flex items-center gap-3">
                            <input
                                id="learning-days"
                                type="number"
                                min={1}
                                max={30}
                                value={learningDays}
                                onChange={(e) => {
                                    const value = Number(e.target.value)
                                    setLearningDays(Number.isNaN(value) ? 1 : Math.min(Math.max(value, 1), 30))
                                }}
                                className="w-24 rounded-md border border-input bg-background px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            />
                            <p className="text-sm text-muted-foreground">
                                Number of days to distribute study paragraphs.
                            </p>
                        </div>
                    </div>

                    {/* Meme Generation Settings */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="text-lg font-semibold text-primary">🎨 Meme Generation Settings</h3>
                        
                        {/* Meme Concept Model */}
                        <div className="space-y-3">
                            <Label htmlFor="meme-text-model" className="text-base font-semibold">
                                Meme Concept Model (Text)
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                This model generates creative meme ideas and scenarios for your words.
                            </p>
                            <Select value={memeTextModel} onValueChange={setMemeTextModel}>
                                <SelectTrigger id="meme-text-model" className="w-full">
                                    <SelectValue placeholder="Choose a model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MEME_TEXT_MODELS.map((model) => (
                                        <SelectItem key={model.id} value={model.id}>
                                            <div className="flex items-center justify-between w-full gap-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{model.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {model.provider} • {model.description}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-mono text-emerald-500 whitespace-nowrap">
                                                    {model.price}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Selected: {MEME_TEXT_MODELS.find(m => m.id === memeTextModel)?.name} ({MEME_TEXT_MODELS.find(m => m.id === memeTextModel)?.price})
                            </p>
                        </div>

                        {/* Image Generation Model */}
                        <div className="space-y-3">
                            <Label htmlFor="meme-image-model" className="text-base font-semibold">
                                Image Generation Model
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                This model generates the actual meme image from the concept.
                            </p>
                            <Select value={memeImageModel} onValueChange={setMemeImageModel}>
                                <SelectTrigger id="meme-image-model" className="w-full">
                                    <SelectValue placeholder="Choose an image model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {IMAGE_MODELS.map((model) => (
                                        <SelectItem key={model.id} value={model.id}>
                                            <div className="flex items-center justify-between w-full gap-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{model.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {model.provider} • {model.description}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-mono text-emerald-500 whitespace-nowrap">
                                                    {model.price}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Selected: {IMAGE_MODELS.find(m => m.id === memeImageModel)?.name} ({IMAGE_MODELS.find(m => m.id === memeImageModel)?.price})
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button onClick={handleSave} className="flex-1" size="lg">
                            <Save className="mr-2 h-4 w-4" />
                            {isSaved ? "Saved!" : "Save Settings"}
                        </Button>
                        <Button onClick={onClose} variant="outline" size="lg">
                            Close
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Model Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Available Models</CardTitle>
                    <CardDescription>
                        Top models from leading AI providers via OpenRouter
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(modelsByProvider).map(([provider, models]) => (
                            <div key={provider} className="space-y-2">
                                <h3 className="font-semibold text-primary">{provider}</h3>
                                <ul className="space-y-1 ml-4">
                                    {models.map((model) => (
                                        <li key={model.id} className="text-sm">
                                            <span className="font-medium">{model.name}</span>
                                            <span className="text-muted-foreground"> - {model.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
