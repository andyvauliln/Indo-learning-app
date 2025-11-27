import { NextRequest, NextResponse } from "next/server"
import { searchWords } from "@/lib/word-service"
import { tokenizeSentence, isWordLikeToken, normalizeToken, cleanWordToken } from "@/lib/word-utils"
import { WordEntry } from "@/types/word"

export async function POST(request: NextRequest) {
    try {
        const { content, learnedParagraphs } = await request.json()

        if (!content || typeof content !== 'string') {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        // Split content into sentences (paragraphs)
        const sentences = content
            .split(/\.\s+|\.\n+/)
            .filter((s: string) => s.trim())
            .map((s: string) => s.trim() + '.')

        // Find the last learned sentence index
        let lastLearnedIndex = -1
        if (learnedParagraphs && typeof learnedParagraphs === 'object') {
            const learnedIndices = Object.entries(learnedParagraphs)
                .filter(([_, learned]) => learned === true)
                .map(([key, _]) => {
                    const match = key.match(/para-(\d+)/)
                    return match ? parseInt(match[1], 10) : -1
                })
                .filter(index => index !== -1)
            
            if (learnedIndices.length > 0) {
                lastLearnedIndex = Math.max(...learnedIndices)
            }
        }

        // Get the next 10 sentences after the last learned one
        const startIndex = lastLearnedIndex + 1
        const nextSentences = sentences.slice(startIndex, startIndex + 10)

        if (nextSentences.length === 0) {
            return NextResponse.json({ 
                words: [], 
                message: 'No more sentences to learn',
                sentenceRange: { start: startIndex, end: startIndex }
            })
        }

        // Extract unique words from these sentences
        const uniqueWords = new Set<string>()
        for (const sentence of nextSentences) {
            const tokens = tokenizeSentence(sentence)
            for (const token of tokens) {
                if (isWordLikeToken(token)) {
                    const cleaned = cleanWordToken(token)
                    if (cleaned && cleaned.length > 1) {
                        uniqueWords.add(cleaned.toLowerCase())
                    }
                }
            }
        }

        // Search for these words in the word database
        const foundWords = new Map<string, WordEntry>()
        const searchPromises = Array.from(uniqueWords).map(async (word) => {
            try {
                const results = await searchWords(word, {
                    levels: ["1", "2", "3", "4"],
                    includeForms: true,
                    includeLearned: true,
                    limit: 1,
                    exact: false
                })
                if (results.length > 0) {
                    // Use normalized word as key to avoid duplicates
                    const normalized = normalizeToken(results[0].word)
                    if (!foundWords.has(normalized)) {
                        foundWords.set(normalized, results[0])
                    }
                }
            } catch (error) {
                console.error(`Error searching for word "${word}":`, error)
            }
        })

        await Promise.all(searchPromises)

        const words = Array.from(foundWords.values())

        return NextResponse.json({
            words,
            sentenceRange: {
                start: startIndex,
                end: startIndex + nextSentences.length
            },
            totalSentences: sentences.length,
            nextSentencesCount: nextSentences.length,
            uniqueWordsFound: words.length,
            totalUniqueTokens: uniqueWords.size
        })

    } catch (error) {
        console.error('Error extracting words from sentences:', error)
        return NextResponse.json(
            { error: 'Failed to extract words from sentences' },
            { status: 500 }
        )
    }
}

