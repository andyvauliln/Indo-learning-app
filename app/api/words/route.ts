import { NextRequest, NextResponse } from 'next/server'
import { getWords } from '@/lib/word-service'
import type { WordLevel } from '@/types/word'
import { DEFAULT_LEARNING_LANGUAGE } from '@/types/language'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const level = (searchParams.get('level') || '1') as WordLevel
        const limitParam = searchParams.get('limit')
        const limit = limitParam ? parseInt(limitParam, 10) : undefined
        const languageCode = searchParams.get('lang') || DEFAULT_LEARNING_LANGUAGE

        // Validate level
        if (!['1', '2', '3', '4'].includes(level)) {
            return NextResponse.json(
                { error: 'Invalid level. Must be 1, 2, 3, or 4.' },
                { status: 400 }
            )
        }

        const words = await getWords(level, languageCode)
        
        // Shuffle and limit words for review
        const shuffled = [...words].sort(() => Math.random() - 0.5)
        const result = limit ? shuffled.slice(0, limit) : shuffled

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error fetching words:', error)
        return NextResponse.json(
            { error: 'Failed to fetch words' },
            { status: 500 }
        )
    }
}
