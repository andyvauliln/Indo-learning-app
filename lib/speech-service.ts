/**
 * Speech Services - Voice Recognition and Text-to-Speech
 * 
 * This module provides reusable services for:
 * 1. Speech-to-Text (voice recognition) using Web Speech API
 * 2. Text-to-Speech (audio synthesis) using Web Speech API
 */

// Types for Speech Recognition
export interface SpeechRecognitionResult {
    transcript: string
    confidence: number
    isFinal: boolean
}

export interface SpeechRecognitionOptions {
    language?: string
    continuous?: boolean
    interimResults?: boolean
    maxAlternatives?: number
}

// Types for Text-to-Speech
export interface TTSOptions {
    language?: string
    rate?: number
    pitch?: number
    volume?: number
    voice?: SpeechSynthesisVoice | null
}

export interface PronunciationCheckResult {
    isCorrect: boolean
    similarity: number
    userTranscript: string
    expectedWord: string
    feedback: string
}

// Default options
const DEFAULT_RECOGNITION_OPTIONS: SpeechRecognitionOptions = {
    language: 'id-ID', // Indonesian
    continuous: false,
    interimResults: true,
    maxAlternatives: 3,
}

const DEFAULT_TTS_OPTIONS: TTSOptions = {
    language: 'id-ID',
    rate: 0.9,
    pitch: 1,
    volume: 1,
}

/**
 * Check if Speech Recognition is available in the browser
 */
export function isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false
    return !!(
        window.SpeechRecognition ||
        (window as Window & { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    )
}

/**
 * Check if Speech Synthesis is available in the browser
 */
export function isSpeechSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false
    return 'speechSynthesis' in window
}

/**
 * Get the SpeechRecognition constructor (cross-browser)
 */
function getSpeechRecognition(): typeof SpeechRecognition | null {
    if (typeof window === 'undefined') return null
    return (
        window.SpeechRecognition ||
        (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition ||
        null
    )
}

/**
 * Create and configure a speech recognition instance
 */
export function createSpeechRecognition(
    options: SpeechRecognitionOptions = {}
): SpeechRecognition | null {
    const SpeechRecognitionClass = getSpeechRecognition()
    if (!SpeechRecognitionClass) return null

    const recognition = new SpeechRecognitionClass()
    const mergedOptions = { ...DEFAULT_RECOGNITION_OPTIONS, ...options }

    recognition.lang = mergedOptions.language || 'id-ID'
    recognition.continuous = mergedOptions.continuous || false
    recognition.interimResults = mergedOptions.interimResults || true
    recognition.maxAlternatives = mergedOptions.maxAlternatives || 3

    return recognition
}

/**
 * Start speech recognition and return a promise with the result
 */
export function recognizeSpeech(
    options: SpeechRecognitionOptions = {}
): Promise<SpeechRecognitionResult> {
    return new Promise((resolve, reject) => {
        const recognition = createSpeechRecognition(options)
        if (!recognition) {
            reject(new Error('Speech recognition is not supported in this browser'))
            return
        }

        let finalTranscript = ''
        let bestConfidence = 0

        recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i]
                if (result.isFinal) {
                    finalTranscript += result[0].transcript
                    bestConfidence = Math.max(bestConfidence, result[0].confidence)
                }
            }
        }

        recognition.onend = () => {
            resolve({
                transcript: finalTranscript.trim(),
                confidence: bestConfidence,
                isFinal: true,
            })
        }

        recognition.onerror = (event) => {
            reject(new Error(`Speech recognition error: ${event.error}`))
        }

        recognition.start()
    })
}

/**
 * Get available voices for a specific language
 */
export function getVoicesForLanguage(language: string): SpeechSynthesisVoice[] {
    if (!isSpeechSynthesisSupported()) return []
    
    const voices = speechSynthesis.getVoices()
    return voices.filter(voice => voice.lang.startsWith(language.split('-')[0]))
}

/**
 * Get Indonesian voices
 */
export function getIndonesianVoices(): SpeechSynthesisVoice[] {
    return getVoicesForLanguage('id')
}

/**
 * Speak text using Text-to-Speech
 */
export function speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!isSpeechSynthesisSupported()) {
            reject(new Error('Speech synthesis is not supported in this browser'))
            return
        }

        // Cancel any ongoing speech
        speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        const mergedOptions = { ...DEFAULT_TTS_OPTIONS, ...options }

        utterance.lang = mergedOptions.language || 'id-ID'
        utterance.rate = mergedOptions.rate || 0.9
        utterance.pitch = mergedOptions.pitch || 1
        utterance.volume = mergedOptions.volume || 1

        if (mergedOptions.voice) {
            utterance.voice = mergedOptions.voice
        } else {
            // Try to find an Indonesian voice
            const indonesianVoices = getIndonesianVoices()
            if (indonesianVoices.length > 0) {
                utterance.voice = indonesianVoices[0]
            }
        }

        utterance.onend = () => resolve()
        utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`))

        speechSynthesis.speak(utterance)
    })
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
    if (isSpeechSynthesisSupported()) {
        speechSynthesis.cancel()
    }
}

/**
 * Calculate similarity between two strings (Levenshtein distance based)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim()
    const s2 = str2.toLowerCase().trim()

    if (s1 === s2) return 1

    const len1 = s1.length
    const len2 = s2.length

    if (len1 === 0) return len2 === 0 ? 1 : 0
    if (len2 === 0) return 0

    // Create matrix
    const matrix: number[][] = []
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i]
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            )
        }
    }

    const distance = matrix[len1][len2]
    const maxLen = Math.max(len1, len2)
    return 1 - distance / maxLen
}

/**
 * Check if user's pronunciation matches the expected word
 */
export async function checkPronunciation(
    expectedWord: string,
    options: SpeechRecognitionOptions = {}
): Promise<PronunciationCheckResult> {
    const result = await recognizeSpeech({
        ...options,
        language: options.language || 'id-ID',
    })

    const userTranscript = result.transcript.toLowerCase().trim()
    const expected = expectedWord.toLowerCase().trim()
    
    const similarity = calculateStringSimilarity(userTranscript, expected)
    const isCorrect = similarity >= 0.8 // 80% similarity threshold

    let feedback: string
    if (similarity >= 0.95) {
        feedback = 'Excellent! Perfect pronunciation! 🎉'
    } else if (similarity >= 0.8) {
        feedback = 'Good job! Your pronunciation is clear. 👍'
    } else if (similarity >= 0.6) {
        feedback = 'Almost there! Try speaking more clearly. 🔄'
    } else if (similarity >= 0.4) {
        feedback = 'Keep practicing! Listen to the word again. 🎧'
    } else {
        feedback = 'Let\'s try again. Click the speaker to hear the correct pronunciation. 🔊'
    }

    return {
        isCorrect,
        similarity,
        userTranscript,
        expectedWord,
        feedback,
    }
}

/**
 * Speak a word slowly for learning purposes
 */
export function speakSlowly(text: string, options: TTSOptions = {}): Promise<void> {
    return speak(text, {
        ...options,
        rate: 0.7, // Slower rate for learning
    })
}

/**
 * Speak an example sentence
 */
export function speakSentence(text: string, options: TTSOptions = {}): Promise<void> {
    return speak(text, {
        ...options,
        rate: 0.85, // Slightly slower for sentences
    })
}
