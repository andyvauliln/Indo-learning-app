/**
 * React hooks for Speech Services
 * 
 * Provides easy-to-use hooks for voice recognition and text-to-speech
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import {
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
    createSpeechRecognition,
    speak,
    speakSlowly,
    speakSentence,
    stopSpeaking,
    checkPronunciation,
    getIndonesianVoices,
    type SpeechRecognitionResult,
    type TTSOptions,
    type PronunciationCheckResult,
} from '@/lib/speech-service'

// Voice Recording Hook
export interface UseVoiceRecordingOptions {
    language?: string
    continuous?: boolean
    onResult?: (result: SpeechRecognitionResult) => void
    onInterimResult?: (transcript: string) => void
    onError?: (error: Error) => void
}

export interface UseVoiceRecordingReturn {
    isListening: boolean
    isSupported: boolean
    transcript: string
    interimTranscript: string
    confidence: number
    error: Error | null
    startListening: () => void
    stopListening: () => void
    resetTranscript: () => void
}

// Helper to check support (safe for SSR)
function checkSpeechRecognitionSupport(): boolean {
    if (typeof window === 'undefined') return false
    return isSpeechRecognitionSupported()
}

function checkSpeechSynthesisSupport(): boolean {
    if (typeof window === 'undefined') return false
    return isSpeechSynthesisSupported()
}

export function useVoiceRecording(
    options: UseVoiceRecordingOptions = {}
): UseVoiceRecordingReturn {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [interimTranscript, setInterimTranscript] = useState('')
    const [confidence, setConfidence] = useState(0)
    const [error, setError] = useState<Error | null>(null)
    
    // Check support directly - this is safe because it's a simple boolean check
    const isSupported = checkSpeechRecognitionSupport()

    const recognitionRef = useRef<SpeechRecognition | null>(null)

    const startListening = useCallback(() => {
        if (!isSpeechRecognitionSupported()) {
            setError(new Error('Speech recognition is not supported'))
            return
        }

        setError(null)
        setInterimTranscript('')

        const recognition = createSpeechRecognition({
            language: options.language || 'id-ID',
            continuous: options.continuous ?? true,
            interimResults: true,
            maxAlternatives: 1,
        })

        if (!recognition) {
            setError(new Error('Failed to create speech recognition'))
            return
        }

        recognition.onstart = () => {
            setIsListening(true)
        }

        recognition.onresult = (event) => {
            let interim = ''
            let final = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i]
                if (result.isFinal) {
                    final += result[0].transcript
                    setConfidence(result[0].confidence)
                    options.onResult?.({
                        transcript: result[0].transcript,
                        confidence: result[0].confidence,
                        isFinal: true,
                    })
                } else {
                    interim += result[0].transcript
                }
            }

            if (final) {
                setTranscript(prev => prev + ' ' + final)
            }
            setInterimTranscript(interim)
            options.onInterimResult?.(interim)
        }

        recognition.onerror = (event) => {
            const err = new Error(`Speech recognition error: ${event.error}`)
            setError(err)
            options.onError?.(err)
            setIsListening(false)
        }

        recognition.onend = () => {
            setIsListening(false)
            setInterimTranscript('')
            
            // Auto-restart if continuous mode
            if (options.continuous && recognitionRef.current) {
                try {
                    recognitionRef.current.start()
                } catch {
                    // Recognition might have been stopped intentionally
                }
            }
        }

        recognitionRef.current = recognition
        recognition.start()
    }, [options])

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            recognitionRef.current = null
        }
        setIsListening(false)
        setInterimTranscript('')
    }, [])

    const resetTranscript = useCallback(() => {
        setTranscript('')
        setInterimTranscript('')
        setConfidence(0)
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [])

    return {
        isListening,
        isSupported,
        transcript: transcript.trim(),
        interimTranscript,
        confidence,
        error,
        startListening,
        stopListening,
        resetTranscript,
    }
}

// Text-to-Speech Hook
export interface UseTTSOptions extends TTSOptions {
    onStart?: () => void
    onEnd?: () => void
    onError?: (error: Error) => void
}

export interface UseTTSReturn {
    isSpeaking: boolean
    isSupported: boolean
    error: Error | null
    speak: (text: string) => Promise<void>
    speakSlowly: (text: string) => Promise<void>
    speakSentence: (text: string) => Promise<void>
    stop: () => void
    voices: SpeechSynthesisVoice[]
}

export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
    
    // Check support directly
    const isSupported = checkSpeechSynthesisSupport()

    useEffect(() => {
        // Load voices - this is a subscription to an external system (speechSynthesis)
        const loadVoices = () => {
            const indonesianVoices = getIndonesianVoices()
            setVoices(indonesianVoices)
        }

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            loadVoices()
            speechSynthesis.onvoiceschanged = loadVoices
        }

        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                speechSynthesis.onvoiceschanged = null
            }
        }
    }, [])

    const speakText = useCallback(async (text: string) => {
        if (!isSpeechSynthesisSupported()) {
            setError(new Error('Speech synthesis is not supported'))
            return
        }

        setError(null)
        setIsSpeaking(true)
        options.onStart?.()

        try {
            await speak(text, options)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Speech synthesis failed')
            setError(error)
            options.onError?.(error)
        } finally {
            setIsSpeaking(false)
            options.onEnd?.()
        }
    }, [options])

    const speakTextSlowly = useCallback(async (text: string) => {
        if (!isSpeechSynthesisSupported()) {
            setError(new Error('Speech synthesis is not supported'))
            return
        }

        setError(null)
        setIsSpeaking(true)
        options.onStart?.()

        try {
            await speakSlowly(text, options)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Speech synthesis failed')
            setError(error)
            options.onError?.(error)
        } finally {
            setIsSpeaking(false)
            options.onEnd?.()
        }
    }, [options])

    const speakSentenceText = useCallback(async (text: string) => {
        if (!isSpeechSynthesisSupported()) {
            setError(new Error('Speech synthesis is not supported'))
            return
        }

        setError(null)
        setIsSpeaking(true)
        options.onStart?.()

        try {
            await speakSentence(text, options)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Speech synthesis failed')
            setError(error)
            options.onError?.(error)
        } finally {
            setIsSpeaking(false)
            options.onEnd?.()
        }
    }, [options])

    const stop = useCallback(() => {
        stopSpeaking()
        setIsSpeaking(false)
    }, [])

    return {
        isSpeaking,
        isSupported,
        error,
        speak: speakText,
        speakSlowly: speakTextSlowly,
        speakSentence: speakSentenceText,
        stop,
        voices,
    }
}

// Pronunciation Check Hook
export interface UsePronunciationCheckOptions {
    language?: string
    onResult?: (result: PronunciationCheckResult) => void
    onError?: (error: Error) => void
}

export interface UsePronunciationCheckReturn {
    isChecking: boolean
    isSupported: boolean
    result: PronunciationCheckResult | null
    error: Error | null
    checkPronunciation: (expectedWord: string) => Promise<void>
    reset: () => void
}

export function usePronunciationCheck(
    options: UsePronunciationCheckOptions = {}
): UsePronunciationCheckReturn {
    const [isChecking, setIsChecking] = useState(false)
    const [result, setResult] = useState<PronunciationCheckResult | null>(null)
    const [error, setError] = useState<Error | null>(null)
    
    // Check support directly
    const isSupported = checkSpeechRecognitionSupport()

    const check = useCallback(async (expectedWord: string) => {
        if (!isSpeechRecognitionSupported()) {
            setError(new Error('Speech recognition is not supported'))
            return
        }

        setError(null)
        setResult(null)
        setIsChecking(true)

        try {
            const checkResult = await checkPronunciation(expectedWord, {
                language: options.language || 'id-ID',
            })
            setResult(checkResult)
            options.onResult?.(checkResult)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Pronunciation check failed')
            setError(error)
            options.onError?.(error)
        } finally {
            setIsChecking(false)
        }
    }, [options])

    const reset = useCallback(() => {
        setResult(null)
        setError(null)
    }, [])

    return {
        isChecking,
        isSupported,
        result,
        error,
        checkPronunciation: check,
        reset,
    }
}
