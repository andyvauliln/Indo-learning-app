# Meme Generation Setup Guide

## Overview
The meme generation feature uses AI to create memorable visual aids for learning Indonesian vocabulary through **OpenRouter API**:
- **Text models** (Grok, Claude, etc.) - Generate creative meme concepts
- **Image models** (Grok Image, FLUX, DALL-E) - Generate the actual images

## Required API Key

### OpenRouter API Key
One key for everything! OpenRouter provides access to multiple AI models including text and image generation.

- **Get your key**: [https://openrouter.ai/keys](https://openrouter.ai/keys)
- **Environment variable**: `NEXT_PUBLIC_OPENROUTER_API_KEY` or `OPENROUTER_API_KEY`

## Setup Instructions

1. Create a `.env.local` file in the project root if it doesn't exist:

```bash
touch .env.local
```

2. Add your OpenRouter API key to `.env.local`:

```env
# OpenRouter API Key (for both text and image generation)
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here

# Site configuration (optional)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Restart your development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

## Troubleshooting

### Error: "OpenRouter API key not configured"
- Make sure you've added `NEXT_PUBLIC_OPENROUTER_API_KEY` to your `.env.local` file
- Restart your development server after adding the key

### Error: "Failed to generate meme image"
- Check that you have credits in your OpenRouter account
- Try switching to a different image model in Settings
- Check the console logs for more specific error messages

### Using the FREE Grok Image Model
- The default image model is **Grok 2 Image** which is **FREE**!
- Perfect for testing and learning without costs
- Other paid models available if you want higher quality

## How It Works

1. **User clicks "Generate Meme"** in Word Review
2. **Step 1**: Text model (Grok) creates a creative meme concept via OpenRouter
   - Generates a scenario description
   - Creates a detailed image prompt
   - Explains why it's memorable/funny
3. **Step 2**: Image model (Grok Image) generates the image from the concept via OpenRouter
4. **Result**: Image is saved to `/public/memes/` and displayed to the user

## Model Options

You can configure which models to use in **Settings**:

### Meme Concept Models (Text)
- **Grok 3 Mini Beta** (default) - Fast and creative
- Grok 2 - More sophisticated
- Claude models - Detailed concepts
- Gemini models - Good balance

### Image Generation Models
- **Grok 2 Image** (default) - FREE! Great for learning 🎉
- FLUX 1.1 Pro - High quality, fast ($0.04/image)
- FLUX Pro - Professional quality ($0.05/image)
- DALL-E 3 - Premium quality ($0.08/image)

## Cost Estimates

Per meme generation (with default models):
- Text concept (Grok 3 Mini): ~$0.001
- Image (Grok 2 Image): **FREE** ✨
- **Total**: ~$0.001 per meme (basically free!)

Tips:
1. **Use Grok 2 Image (default) - it's FREE!**
2. Upgrade to FLUX or DALL-E only if you need higher quality
3. Generate memes for difficult words to boost memory retention

