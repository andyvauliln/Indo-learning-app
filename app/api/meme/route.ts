import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_URL = "https://api.openai.com/v1/images/generations"

export async function POST(request: NextRequest) {
    try {
        if (!OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            )
        }

        const body = await request.json()
        const { word, translation } = body

        if (!word || !translation) {
            return NextResponse.json(
                { error: 'Word and translation are required' },
                { status: 400 }
            )
        }

        // Create a meme-style prompt for DALL-E
        const memePrompt = `Create a funny, memorable meme image that helps learn the Indonesian word "${word}" which means "${translation}" in English. The image should be colorful, humorous, and visually represent the meaning in a memorable way. Make it simple, bold, and meme-like with clear visual storytelling. No text in the image.`

        // Call OpenAI DALL-E API
        const response = await fetch(OPENAI_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt: memePrompt,
                n: 1,
                size: '1024x1024',
                quality: 'standard',
                response_format: 'b64_json',
            }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('OpenAI API error:', errorData)
            return NextResponse.json(
                { error: errorData?.error?.message || 'Failed to generate meme image' },
                { status: response.status }
            )
        }

        const data = await response.json()
        const imageBase64 = data.data?.[0]?.b64_json

        if (!imageBase64) {
            return NextResponse.json(
                { error: 'No image data received from OpenAI' },
                { status: 500 }
            )
        }

        // Save the image to public/memes directory
        const sanitizedWord = word.toLowerCase().replace(/[^a-z0-9]/g, '-')
        const timestamp = Date.now()
        const filename = `${sanitizedWord}-${timestamp}.png`
        const memesDir = path.join(process.cwd(), 'public', 'memes')
        
        // Ensure directory exists
        await mkdir(memesDir, { recursive: true })
        
        const filePath = path.join(memesDir, filename)
        const imageBuffer = Buffer.from(imageBase64, 'base64')
        
        await writeFile(filePath, imageBuffer)

        // Return the public URL path
        const imageUrl = `/memes/${filename}`

        return NextResponse.json({
            success: true,
            imageUrl,
            word,
        })
    } catch (error) {
        console.error('Error generating meme:', error)
        return NextResponse.json(
            { error: 'Failed to generate meme image' },
            { status: 500 }
        )
    }
}
