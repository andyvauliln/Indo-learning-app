# Langotron

A futuristic multi-language learning application built with Next.js. Learn any language through personalized content, AI-powered translations, and interactive vocabulary building.

## Features

- **Multi-Language Support**: Learn any language from any source language
  - Default: English → Indonesian
  - Easily switch between 16+ supported languages
- **Personalized Learning**: Write your own content and get AI-translated learning materials
- **Vocabulary Building**: Track words, examples, and progress
- **AI-Powered**: Generate word entries, examples, memes, and more
- **Interactive Reading**: Multiple display formats (clean, word-translation, partial-reveal)

## Getting Started

First, install dependencies:

```bash
npm install
```

Set up your environment variables in `.env.local`:

```bash
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supported Languages

- English, Indonesian, Spanish, French, German
- Japanese, Korean, Chinese, Portuguese, Italian
- Dutch, Russian, Arabic, Hindi, Thai, Vietnamese

## Data Structure

Word data is organized by language:
```
data/words/
├── en/          # English words
│   ├── level-1.json
│   ├── level-2.json
│   ├── level-3.json
│   └── level-4.json
├── id/          # Indonesian words
│   └── ...
└── [lang]/      # Other languages
    └── ...
```

## Tech Stack

- **Next.js 16** - React framework
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **OpenRouter API** - AI translations and word generation

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
