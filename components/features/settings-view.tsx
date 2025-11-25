"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { storage, type Settings } from "@/lib/storage"
import { AVAILABLE_MODELS, DEFAULT_MODEL, DEFAULT_PROMPT } from "@/lib/models"
import { Settings as SettingsIcon, Save } from "lucide-react"

interface SettingsViewProps {
    onClose: () => void
}

export function SettingsView({ onClose }: SettingsViewProps) {
    const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
    const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT)
    const [learningDays, setLearningDays] = useState(3)
    const [isSaved, setIsSaved] = useState(false)

    useEffect(() => {
        // Load saved settings
        const savedSettings = storage.getSettings()
        if (savedSettings) {
            setSelectedModel(savedSettings.selectedModel)
            setCustomPrompt(savedSettings.customPrompt)
            setLearningDays(savedSettings.learningDays ?? 3)
        }
    }, [])

    const handleSave = () => {
        const settings: Settings = {
            selectedModel,
            customPrompt,
            learningDays
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
