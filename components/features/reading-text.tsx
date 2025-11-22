"use client"

import { useState } from "react"

interface ReadingTextProps {
    content: string
    language?: "en" | "id"
    className?: string
}

export function ReadingText({ content, language = "id", className = "" }: ReadingTextProps) {
    const [hoveredWord, setHoveredWord] = useState<string | null>(null)

    // Split content into paragraphs (by double newlines or single newlines)
    const paragraphs = content.split(/\n\n+|\n/).filter(p => p.trim())

    // Split text into words while preserving punctuation
    const tokenizeText = (text: string) => {
        // Match words with optional punctuation
        return text.match(/[\w']+|[.,!?;:]/g) || []
    }

    const handleWordHover = (word: string) => {
        // Remove punctuation for hover state
        const cleanWord = word.replace(/[.,!?;:]/g, '')
        if (cleanWord) {
            setHoveredWord(cleanWord)
        }
    }

    const handleWordLeave = () => {
        setHoveredWord(null)
    }

    return (
        <div className={`reading-text-container ${className}`}>
            {/* Professional reading area */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 max-w-4xl mx-auto">
                <article className="prose prose-lg max-w-none">
                    {paragraphs.map((paragraph, pIndex) => {
                        const tokens = tokenizeText(paragraph)

                        return (
                            <p
                                key={pIndex}
                                className="mb-6 last:mb-0 leading-relaxed text-gray-800"
                                style={{
                                    fontFamily: language === 'id'
                                        ? "'Merriweather', 'Georgia', serif"
                                        : "'Inter', 'system-ui', sans-serif",
                                    fontSize: '1.125rem',
                                    lineHeight: '1.8',
                                    textAlign: 'justify'
                                }}
                            >
                                {tokens.map((token, tIndex) => {
                                    const isPunctuation = /^[.,!?;:]$/.test(token)

                                    if (isPunctuation) {
                                        return <span key={tIndex}>{token}</span>
                                    }

                                    return (
                                        <span
                                            key={tIndex}
                                            className="reading-word inline-block transition-colors duration-150 cursor-pointer hover:bg-blue-50 hover:text-blue-700 rounded px-0.5"
                                            onMouseEnter={() => handleWordHover(token)}
                                            onMouseLeave={handleWordLeave}
                                            data-word={token.toLowerCase()}
                                        >
                                            {token}
                                        </span>
                                    )
                                })}
                            </p>
                        )
                    })}
                </article>
            </div>

            {/* Hover tooltip placeholder - for future word translation feature */}
            {hoveredWord && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm opacity-0 pointer-events-none">
                    {/* Future: Show translation for {hoveredWord} */}
                </div>
            )}

            <style jsx>{`
                .reading-word {
                    margin-right: 0.25rem;
                }
                
                /* Future: Add classes for known words */
                .reading-word.known {
                    /* Will be styled differently for known words */
                }
                
                .reading-word.learning {
                    /* Will be styled for words being learned */
                }
            `}</style>
        </div>
    )
}
