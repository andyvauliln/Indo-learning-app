// OpenRouter Model Configuration

export interface ModelConfig {
    id: string
    name: string
    provider: string
    description: string
    price?: string // Price per 1M tokens or per image
}

export const AVAILABLE_MODELS: ModelConfig[] = [
    {
        id: "moonshotai/kimi-k2",
        name: "Kimi K2",
        provider: "Moonshot AI",
        description: "Advanced reasoning model",
        price: "$0.60/1M"
    },
    {
        id: "moonshotai/kimi-k2-thinking",
        name: "Kimi K2 Thinking",
        provider: "Moonshot AI",
        description: "Enhanced reasoning with thinking process",
        price: "$0.60/1M"
    },
    {
        id: "openai/gpt-5.1",
        name: "GPT-5.1",
        provider: "OpenAI",
        description: "Latest GPT model",
        price: "$2.50/1M"
    },
    {
        id: "anthropic/claude-haiku-4.5",
        name: "Claude Haiku 4.5",
        provider: "Anthropic",
        description: "Fast and efficient Claude model",
        price: "$0.25/1M"
    },
    {
        id: "anthropic/claude-sonnet-4.5",
        name: "Claude Sonnet 4.5",
        provider: "Anthropic",
        description: "Balanced performance Claude model",
        price: "$3.00/1M"
    },
    {
        id: "google/gemini-3-pro-preview",
        name: "Gemini 3 Pro Preview",
        provider: "Google",
        description: "Advanced Gemini model",
        price: "$1.25/1M"
    },
    {
        id: "google/gemini-2.5-flash-preview-09-2025",
        name: "Gemini 2.5 Flash Preview",
        provider: "Google",
        description: "Fast Gemini model",
        price: "$0.15/1M"
    },
    {
        id: "google/gemini-2.5-flash-lite-preview-09-2025",
        name: "Gemini 2.5 Flash Lite Preview",
        provider: "Google",
        description: "Lightweight Gemini model",
        price: "$0.075/1M"
    }
]

// Models for meme scenario/concept generation (text models)
export const MEME_TEXT_MODELS: ModelConfig[] = [
    {
        id: "x-ai/grok-3-mini-beta",
        name: "Grok 3 Mini",
        provider: "xAI",
        description: "Fast, creative Grok model - great for memes",
        price: "$0.30/1M"
    },
    {
        id: "x-ai/grok-3-beta",
        name: "Grok 3",
        provider: "xAI",
        description: "Full Grok model - more creative",
        price: "$3.00/1M"
    },
    {
        id: "google/gemini-2.5-flash-preview-09-2025",
        name: "Gemini 2.5 Flash",
        provider: "Google",
        description: "Fast and cheap",
        price: "$0.15/1M"
    },
    {
        id: "anthropic/claude-haiku-4.5",
        name: "Claude Haiku 4.5",
        provider: "Anthropic",
        description: "Fast and efficient",
        price: "$0.25/1M"
    },
]

// Models for image generation
export const IMAGE_MODELS: ModelConfig[] = [
    {
        id: "google/imagen-3",
        name: "Imagen 3",
        provider: "Google",
        description: "High quality, cost-effective image generation",
        price: "$0.04/image"
    },
    {
        id: "google/imagen-3-fast",
        name: "Imagen 3 Fast",
        provider: "Google",
        description: "Faster, cheaper image generation",
        price: "$0.02/image"
    },
    {
        id: "openai/dall-e-3",
        name: "DALL-E 3",
        provider: "OpenAI",
        description: "High quality but more expensive",
        price: "$0.08/image"
    },
    {
        id: "stabilityai/stable-diffusion-3",
        name: "Stable Diffusion 3",
        provider: "Stability AI",
        description: "Open-source, good quality",
        price: "$0.035/image"
    },
]

export const DEFAULT_MEME_TEXT_MODEL = MEME_TEXT_MODELS[0].id
export const DEFAULT_IMAGE_MODEL = IMAGE_MODELS[0].id

export const DEFAULT_MODEL = AVAILABLE_MODELS[0].id
export const DEFAULT_LEARNING_DAYS = 3 // Default sentences per day for calculation
export const DEFAULT_PROMPT = `Translate the following text to Indonesian for language learning purposes. Follow these guidelines:

1. Keep the translation simple and natural for beginners
2. Use varied vocabulary - if a word appears multiple times, try to use synonyms or alternative expressions where natural
3. Use common, everyday Indonesian words
4. Maintain the original meaning while making it accessible for learners

Provide ONLY the Indonesian translation.`

export const FORMAT_PROMPT = `You are a language learning assistant. You have Indonesian text and need to format it for learning.

The user will provide:
1. Indonesian text
2. Desired format type

Format types:
- "word-translation": Add English translation in parentheses after each Indonesian word. Example: "Aku(I) pergi(go) ke(to) sekolah(school)"
- "partial-reveal": Replace middle letters with dots, keeping first and last letters. Example: "Aku p..gi ke s....ah"
- "custom": Follow custom instructions provided by the user

Provide ONLY the formatted text without any explanations.`
