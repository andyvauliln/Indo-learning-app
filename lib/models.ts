// OpenRouter Model Configuration

export interface ModelConfig {
    id: string
    name: string
    provider: string
    description: string
}

export const AVAILABLE_MODELS: ModelConfig[] = [
    {
        id: "moonshotai/kimi-k2",
        name: "Kimi K2",
        provider: "Moonshot AI",
        description: "Advanced reasoning model"
    },
    {
        id: "moonshotai/kimi-k2-thinking",
        name: "Kimi K2 Thinking",
        provider: "Moonshot AI",
        description: "Enhanced reasoning with thinking process"
    },
    {
        id: "openai/gpt-5.1",
        name: "GPT-5.1",
        provider: "OpenAI",
        description: "Latest GPT model"
    },
    {
        id: "anthropic/claude-haiku-4.5",
        name: "Claude Haiku 4.5",
        provider: "Anthropic",
        description: "Fast and efficient Claude model"
    },
    {
        id: "anthropic/claude-sonnet-4.5",
        name: "Claude Sonnet 4.5",
        provider: "Anthropic",
        description: "Balanced performance Claude model"
    },
    {
        id: "google/gemini-3-pro-preview",
        name: "Gemini 3 Pro Preview",
        provider: "Google",
        description: "Advanced Gemini model"
    },
    {
        id: "google/gemini-2.5-flash-preview-09-2025",
        name: "Gemini 2.5 Flash Preview",
        provider: "Google",
        description: "Fast Gemini model"
    },
    {
        id: "google/gemini-2.5-flash-lite-preview-09-2025",
        name: "Gemini 2.5 Flash Lite Preview",
        provider: "Google",
        description: "Lightweight Gemini model"
    }
]

export const DEFAULT_MODEL = AVAILABLE_MODELS[0].id

export const DEFAULT_PROMPT = `Translate the following text to Indonesian for language learning purposes. Follow these guidelines:

1. Keep the translation simple and natural for beginners
2. Use varied vocabulary - if a word appears multiple times, try to use synonyms or alternative expressions where natural
3. Split the text into paragraphs of approximately 3 sentences each
4. Separate each paragraph with a double newline (\\n\\n)
5. Use common, everyday Indonesian words
6. Maintain the original meaning while making it accessible for learners

Provide ONLY the Indonesian translation, formatted as described above.`

export const FORMAT_PROMPT = `You are a language learning assistant. You have Indonesian text and need to format it for learning.

The user will provide:
1. Indonesian text
2. Desired format type

Format types:
- "word-translation": Add English translation in parentheses after each Indonesian word. Example: "Aku(I) pergi(go) ke(to) sekolah(school)"
- "partial-reveal": Replace middle letters with dots, keeping first and last letters. Example: "Aku p..gi ke s....ah"
- "custom": Follow custom instructions provided by the user

Provide ONLY the formatted text without any explanations.`
