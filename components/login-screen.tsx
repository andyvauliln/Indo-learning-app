"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { storage, type User } from "@/lib/storage"

interface LoginScreenProps {
    onLogin: (user: User) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
    const [name, setName] = useState("")

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        const user: User = {
            name: name.trim(),
            wordsLearned: 0,
        }
        storage.saveUser(user)
        onLogin(user)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-primary">Selamat Datang!</CardTitle>
                    <CardDescription>Enter your name to start learning Indonesian</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border-primary/20 bg-background/50 text-center text-lg"
                                autoFocus
                            />
                        </div>
                        <Button type="submit" className="w-full text-lg font-semibold" disabled={!name.trim()}>
                            Start Journey
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
