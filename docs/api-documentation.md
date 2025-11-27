# API Documentation - Indo Learning App

**Generated:** 2025-11-27T06:01:12+08:00  
**API Type:** Next.js App Router API Routes + External APIs  
**Base URL:** `http://localhost:3000/api` (development)

## Table of Contents

- [Internal API Routes](#internal-api-routes)
- [External API Integration](#external-api-integration)
- [Client-Side API Layer](#client-side-api-layer)
- [Error Handling](#error-handling)

---

## Internal API Routes

### GET /api/words

Fetch words from vocabulary database with optional filtering.

#### Endpoint
```
GET /api/words?level={level}&limit={limit}
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `level` | `'1' \| '2' \| '3' \| '4'` | No | `'1'` | Word difficulty level |
| `limit` | `number` | No | All words | Number of words to return |

#### Response

**Success (200)**
```typescript
// Returns array of WordEntry objects
WordEntry[]
```

**Example Response:**
```json
[
  {
    "word": "halo",
    "translation": "hello",
    "examples": [
      {
        "example": "Halo, apa kabar?",
        "translation": "Hello, how are you?"
      }
    ],
    "alternative_translations": [
      {
        "word": "hi",
        "examples": [...]
      }
    ],
    "similar_words": [
      {
        "word": "hai",
        "level": "1",
        "examples": [...]
      }
    ],
    "other_forms": [
      {
        "word": "halo-halo",
        "examples": [...]
      }
    ],
    "level": "1",
    "learned": false,
    "type": "greeting",
    "category": "common",
    "notes": "Common informal greeting",
    "q&a": []
  }
]
```

**Error (400) - Invalid Level**
```json
{
  "error": "Invalid level. Must be 1, 2, 3, or 4."
}
```

**Error (500) - Server Error**
```json
{
  "error": "Failed to fetch words"
}
```

#### Implementation Details
- Words are shuffled randomly for review variety
- Reads from static JSON files in `data/words/level-{level}.json`
- Server-side only (no authentication required for MVP)

#### Usage Example
```typescript
// Fetch 10 beginner words
fetch('/api/words?level=1&limit=10')
  .then(res => res.json())
  .then(words => console.log(words))
```

---

## External API Integration

### OpenRouter API

The app integrates with OpenRouter for AI-powered translations and content generation.

#### Base URL
```
https://openrouter.ai/api/v1
```

#### Authentication
```typescript
headers: {
  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
  'HTTP-Referer': window.location.origin,
  'Content-Type': 'application/json'
}
```

#### Supported Endpoints

##### POST /chat/completions

Generate AI responses for translations and content.

**Request Body:**
```typescript
{
  model: string           // e.g., "anthropic/claude-3.5-sonnet"
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  temperature?: number    // 0-1, default varies by use case
  max_tokens?: number     // Optional token limit
}
```

**Response:**
```typescript
{
  id: string
  choices: Array<{
    message: {
      role: 'assistant'
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}
```

#### Use Cases

1. **Document Translation**
   - Convert user-provided text to formatted learning content
   - Controlled by prompts in `lib/prompt-utils.ts`

2. **Word Generation**
   - Create rich word entries with examples and Q&A
   - Uses specific schema-locked prompts

3. **Content Regeneration**
   - Regenerate individual paragraphs
   - Format-specific transformations

#### Supported Models

Configured in `lib/models.ts`:

**Anthropic**
- `claude-3.5-sonnet`
- `claude-3-opus`
- `claude-3-haiku`

**OpenAI**
- `gpt-4-turbo`
- `gpt-4o`
- `gpt-4o-mini`

**Google**
- `gemini-2.0-flash-exp`
- `gemini-exp-1206`

**Meta**
- `llama-3.3-70b-instruct`

---

## Client-Side API Layer

### Word Service (`lib/word-service.ts`)

High-level API for word operations.

#### Core Functions

```typescript
// Get all words from a level
getWords(level: WordLevel): Promise<WordEntry[]>

// Search words with morphology support
searchWords(query: string, options?: WordSearchOptions): Promise<WordEntry[]>

// Add a new word
addWord(word: WordCreateInput): Promise<void>

// Update existing word
updateWord(indonesianWord: string, updates: WordUpdateInput): Promise<void>

// Delete a word
deleteWord(indonesianWord: string): Promise<void>

// Get single word
getWord(indonesianWord: string): Promise<WordEntry | null>
```

#### Search Options

```typescript
interface WordSearchOptions {
  levels?: WordLevel[]      // Filter by difficulty
  includeLearned?: boolean  // Include learned words
  limit?: number            // Max results
  exact?: boolean           // Exact match only
  includeForms?: boolean    // Search other_forms
}
```

#### Search Features

1. **Case-Insensitive:** Matches regardless of case
2. **Morphology-Aware:** Strips common affixes (`-nya`, `-kan`, `me-`, etc.)
3. **Form Expansion:** Searches `other_forms` array
4. **Multi-Level:** Can search across difficulty levels

#### Example Usage

```typescript
// Search for a word
const results = await searchWords('buku', {
  levels: ['1', '2'],
  limit: 5,
  includeForms: true
})

// Get all beginner words
const beginnerWords = await getWords('1')

// Add custom word
await addWord({
  word: 'selamat',
  translation: 'congratulations',
  examples: [...],
  level: '1',
  type: 'greeting',
  category: 'common',
  notes: 'Common greeting',
  // ...other fields
})
```

### Word AI Service (`lib/word-ai.ts`)

AI-powered word generation.

```typescript
generateWordWithAI(args: WordGenerationArgs): Promise<WordEntry>
```

**Arguments:**
```typescript
interface WordGenerationArgs {
  baseWord: string              // Indonesian word to generate
  level: WordLevel              // Difficulty level
  category?: string             // Word category
  type?: string                 // Word type
  translationHint?: string      // Suggested translation
  additionalContext?: string    // Extra context
  model?: string                // OpenRouter model
  temperature?: number          // AI creativity (0-1)
}
```

**Features:**
- Schema-locked prompts for consistency
- Generates examples, Q&A, similar words
- Validates output structure
- Fallback handling for API errors

### Translation Service (`lib/api.ts`)

General-purpose translation function.

```typescript
translateText(args: TranslationArgs): Promise<string>
```

**Arguments:**
```typescript
interface TranslationArgs {
  text: string                  // Text to translate
  prompt: string                // System prompt
  model: string                 // OpenRouter model
  temperature?: number          // Default 0.2
}
```

---

## Error Handling

### API Route Errors

#### Client-Side Handling
```typescript
try {
  const response = await fetch('/api/words?level=1')
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }
  const data = await response.json()
} catch (error) {
  console.error('Failed to fetch words:', error)
  // Show user-friendly error message
}
```

#### Common Error Codes

| Code | Situation | Handling |
|------|-----------|----------|
| `400` | Invalid request parameters | Validate input before sending |
| `404` | Resource not found | Check if word exists |
| `500` | Server error | Retry or show generic error |

### OpenRouter API Errors

#### Typical Errors
- **401 Unauthorized:** Invalid API key
- **429 Too Many Requests:** Rate limit exceeded
- **500 Server Error:** OpenRouter service issue

#### Error Handling Pattern
```typescript
try {
  const response = await translateText(args)
  return response
} catch (error) {
  console.error('Translation failed:', error)
  // Fallback: return original text or retry
  return text
}
```

### localStorage Errors

```typescript
try {
  const data = localStorage.getItem('key')
  return JSON.parse(data || '{}')
} catch (error) {
  console.error('localStorage error:', error)
  return {} // Safe fallback
}
```

---

## Rate Limiting

### OpenRouter
- Varies by plan
- Default: ~60 requests/minute
- Implement request queuing if needed

### Internal APIs
- No rate limiting (local filesystem)
- Consider adding for production

---

## Caching Strategy

### Client-Side
```typescript
// Words cached in memory after first load
let cachedWords: Map<WordLevel, WordEntry[]> = new Map()

// Avoid re-fetching same level
if (cachedWords.has(level)) {
  return cachedWords.get(level)!
}
```

### OpenRouter Responses
- Not currently cached
- Consider caching common translations
- Use localStorage for session persistence

---

## API Security

### Current Implementation
✅ API keys in `.env` (not committed)  
✅ Client-side validation  
⚠️ No server-side auth (MVP)  
⚠️ API key exposed in client (NEXT_PUBLIC_*)  

### Production Recommendations
1. **Move OpenRouter calls to server-side API routes**
2. **Implement user authentication**
3. **Add rate limiting**
4. **Sanitize user inputs**
5. **Use server-only API keys**

---

## Testing APIs

### Manual Testing

#### cURL Example
```bash
# Fetch words
curl "http://localhost:3000/api/words?level=1&limit=5"
```

#### Browser DevTools
1. Open Network tab
2. Trigger word fetch
3. Inspect request/response
4. Check for errors

### Debugging

```typescript
// Enable API logging
console.log('API Request:', {
  url,
  method,
  headers,
  body
})

console.log('API Response:', {
  status,
  statusText,
  data
})
```

---

**Related Documentation:**
- [Data Models](./data-models.md) - Type definitions
- [Development Guide](./development-guide.md) - API usage
- [Technology Stack](./technology-stack.md) - External services
