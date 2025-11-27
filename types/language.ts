// Supported languages for the Langotron app

export interface Language {
    code: string       // ISO 639-1 language code
    name: string       // Display name in English
    nativeName: string // Display name in native language
    greeting: string   // A greeting in the language
}

export const SUPPORTED_LANGUAGES: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', greeting: 'Hello' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', greeting: 'Halo' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', greeting: 'Hola' },
    { code: 'fr', name: 'French', nativeName: 'Français', greeting: 'Bonjour' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', greeting: 'Hallo' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', greeting: 'こんにちは' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', greeting: '안녕하세요' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', greeting: '你好' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', greeting: 'Olá' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', greeting: 'Ciao' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', greeting: 'Hallo' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', greeting: 'Привет' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', greeting: 'مرحبا' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', greeting: 'नमस्ते' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', greeting: 'สวัสดี' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', greeting: 'Xin chào' },
]

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']

// Default languages
export const DEFAULT_ORIGINAL_LANGUAGE: LanguageCode = 'en'
export const DEFAULT_LEARNING_LANGUAGE: LanguageCode = 'id'

export function getLanguageByCode(code: string): Language | undefined {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)
}

export function getLanguageName(code: string): string {
    return getLanguageByCode(code)?.name || code
}

export function getLanguageNativeName(code: string): string {
    return getLanguageByCode(code)?.nativeName || code
}

export function getLanguageGreeting(code: string): string {
    return getLanguageByCode(code)?.greeting || 'Hello'
}
