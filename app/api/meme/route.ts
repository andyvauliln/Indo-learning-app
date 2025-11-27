import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_IMAGE_URL = "https://openrouter.ai/api/v1/images/generations"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
const SITE_NAME = "Indo Learning App"

const DEFAULT_TEXT_MODEL = "x-ai/grok-3-mini-beta"
const DEFAULT_IMAGE_MODEL = "google/imagen-3"

interface MemeConceptResponse {
    scenario: string
    imagePrompt: string
    humor: string
}

export async function POST(request: NextRequest) {
    try {
        if (!OPENROUTER_API_KEY) {
            return NextResponse.json(
                { error: 'OpenRouter API key not configured' },
                { status: 500 }
            )
        }

        const body = await request.json()
        const { word, translation, textModel, imageModel } = body

        if (!word || !translation) {
            return NextResponse.json(
                { error: 'Word and translation are required' },
                { status: 400 }
            )
        }

        const selectedTextModel = textModel || DEFAULT_TEXT_MODEL
        const selectedImageModel = imageModel || DEFAULT_IMAGE_MODEL

        // STEP 1: Generate meme concept using text model (Grok or other)
        console.log(`Generating meme concept with ${selectedTextModel}...`)
        
        const conceptResponse = await fetch(OPENROUTER_CHAT_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': SITE_URL,
                'X-Title': SITE_NAME,
            },
            body: JSON.stringify({
                model: selectedTextModel,
                temperature: 0.8,
                messages: [
                    {
                        role: 'system',
                        content: `You are a creative meme designer who helps people learn Indonesian vocabulary through memorable, funny images. You create meme concepts that make words stick in memory through humor and visual association.`
                    },
                    {
                        role: 'user',
                        content: `Create a meme concept for learning the Indonesian word "${word}" which means "${translation}" in English.

Return a JSON object with:
1. "scenario": A brief description of a funny, memorable scenario that represents the word (1-2 sentences)
2. "imagePrompt": A detailed prompt for an AI image generator to create this meme (focus on visual elements, style, colors, composition - NO TEXT in the image)
3. "humor": Why this is funny/memorable (1 sentence)

Make it:
- Visually striking and colorful
- Humorous but not offensive  
- Easy to remember and associate with the word
- Clear visual storytelling without needing text

Return ONLY valid JSON, no markdown or explanations.`
                    }
                ]
            }),
        })

        if (!conceptResponse.ok) {
            const errorData = await conceptResponse.json().catch(() => ({}))
            console.error('Text model API error:', errorData)
            return NextResponse.json(
                { error: errorData?.error?.message || 'Failed to generate meme concept' },
                { status: conceptResponse.status }
            )
        }

        const conceptData = await conceptResponse.json()
        const conceptContent = conceptData.choices?.[0]?.message?.content

        if (!conceptContent) {
            return NextResponse.json(
                { error: 'No concept received from text model' },
                { status: 500 }
            )
        }

        // Parse the concept JSON
        let memeConcept: MemeConceptResponse
        try {
            // Clean up the response - remove markdown code blocks if present
            const cleanedContent = conceptContent
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim()
            memeConcept = JSON.parse(cleanedContent)
        } catch {
            console.error('Failed to parse meme concept:', conceptContent)
            // Fallback: use the response as a simple prompt
            memeConcept = {
                scenario: conceptContent,
                imagePrompt: `A colorful, funny meme-style illustration for learning the word "${word}" (${translation}). ${conceptContent}. No text in image.`,
                humor: 'Visual learning aid'
            }
        }

        console.log('Meme concept:', memeConcept)

        // STEP 2: Generate image using image model (Google Imagen or other)
        console.log(`Generating image with ${selectedImageModel}...`)

        const imageResponse = await fetch(OPENROUTER_IMAGE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': SITE_URL,
                'X-Title': SITE_NAME,
            },
            body: JSON.stringify({
                model: selectedImageModel,
                prompt: memeConcept.imagePrompt,
                n: 1,
                size: '1024x1024',
                response_format: 'b64_json',
            }),
        })

        if (!imageResponse.ok) {
            const errorData = await imageResponse.json().catch(() => ({}))
            console.error('Image model API error:', errorData)
            return NextResponse.json(
                { error: errorData?.error?.message || 'Failed to generate meme image' },
                { status: imageResponse.status }
            )
        }

        const imageData = await imageResponse.json()
        const imageBase64 = imageData.data?.[0]?.b64_json

        if (!imageBase64) {
            return NextResponse.json(
                { error: 'No image data received from image model' },
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

        // Return the public URL path with concept info
        const imageUrl = `/memes/${filename}`

        return NextResponse.json({
            success: true,
            imageUrl,
            word,
            concept: memeConcept,
            models: {
                textModel: selectedTextModel,
                imageModel: selectedImageModel
            }
        })
    } catch (error) {
        console.error('Error generating meme:', error)
        return NextResponse.json(
            { error: 'Failed to generate meme image' },
            { status: 500 }
        )
    }
}
