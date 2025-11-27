# Development Guide - Indo Learning App

**Last Updated:** 2025-11-27T06:01:12+08:00  
**Target Audience:** Developers setting up and working on the project

## Prerequisites

### Required Software
- **Node.js:** v20.x or higher
- **npm:** v10.x or higher (comes with Node.js)
- **Git:** For version control

### Recommended Tools
- **VS Code:** With TypeScript and ESLint extensions
- **Browser:** Chrome/Edge with React DevTools extension

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd indo-learning-app
```

### 2. Install Dependencies
```bash
npm install
```

This will install all dependencies listed in `package.json`.

### 3. Environment Setup

Create a `.env` file in the project root:

```bash
NEXT_PUBLIC_OPENROUTER_API_KEY=your-openrouter-api-key-here
```

**⚠️ Security Note:** Never commit `.env` file to version control.

### 4. Verify Installation
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to verify the app runs.

## Development Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run dev` | Start development server | Daily development |
| `npm run build` | Build production bundle | Before deployment |
| `npm start` | Run production server | Testing prod build locally |
| `npm run lint` | Run ESLint | Before committing code |

## Project Structure Explained

```
indo-learning-app/
│
├── app/                    # Next.js App Router (v13+)
│   ├── api/                # API routes (serverless functions)
│   │   └── words/route.ts  # Word search endpoint
│   ├── layout.tsx          # Root layout (providers, fonts)
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles & CSS variables
│
├── components/             # React Components
│   ├── ui/                 # Reusable UI components (17 files)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── features/           # Feature-specific components
│   │   ├── reading-text/   # Reading interface subcomponents
│   │   ├── enhanced-reading-text.tsx
│   │   ├── task-view.tsx
│   │   ├── settings-view.tsx
│   │   ├── word.tsx
│   │   └── word-review-slider.tsx
│   │
│   ├── app-header.tsx      # Main navigation
│   ├── app-sidebar.tsx     # Task list sidebar
│   ├── login-screen.tsx    # Authentication
│   ├── main-view.tsx       # Content container
│   └── theme-provider.tsx  # Dark mode provider
│
├── lib/                    # Business Logic & Utilities
│   ├── store.ts            # Zustand global state
│   ├── storage.ts          # localStorage wrapper
│   ├── word-service.ts     # Vocabulary CRUD
│   ├── word-ai.ts          # AI word generation
│   ├── word-store.ts       # Word state management
│   ├── speech-service.ts   # Text-to-speech
│   ├── text-utils.ts       # Text processing helpers
│   ├── day-grouping.ts     # Learning day calculations
│   ├── prompt-utils.ts     # AI prompt management
│   ├── reading-text-constants.ts  # Constants
│   ├── sentence-store.ts   # Sentence progress
│   ├── models.ts           # OpenRouter model definitions
│   ├── word-utils.ts       # Word manipulation
│   ├── api.ts              # API client
│   └── utils.ts            # General utilities
│
├── hooks/                  # Custom React Hooks
│   ├── use-paragraph-state.ts      # Paragraph management
│   ├── use-content-formatting.ts   # Content formatting
│   ├── use-speech.ts               # Speech synthesis
│   ├── use-mobile.ts               # Mobile detection
│   └── index.ts                    # Hook exports
│
├── types/                  # TypeScript Type Definitions
│   ├── word.ts             # Word data model
│   ├── reading-text.ts     # Reading interface types
│   └── speech.d.ts         # Web Speech API types
│
├── data/                   # Static Data Files
│   └── words/
│       ├── level-1.json    # Beginner vocabulary
│       ├── level-2.json    # Elementary
│       ├── level-3.json    # Intermediate
│       └── level-4.json    # Advanced
│
├── public/                 # Static Assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
└── docs/                   # Documentation
    └── (this file and others)
```

## Development Workflow

### 1. Starting Development
```bash
# Start dev server with hot-reload
npm run dev

# Server starts on http://localhost:3000
# Changes auto-reload in browser
```

### 2. Making Changes

#### Adding a New Component
1. Create file in `components/ui/` or `components/features/`
2. Use TypeScript for type safety
3. Follow existing naming conventions
4. Export from appropriate `index.ts` if needed

Example:
```typescript
// components/ui/my-component.tsx
import { cn } from "@/lib/utils"

export function MyComponent({ className, ...props }) {
  return (
    <div className={cn("base-styles", className)} {...props}>
      {/* Component content */}
    </div>
  )
}
```

#### Adding a New API Route
1. Create `route.ts` in `app/api/[route-name]/`
2. Export `GET`, `POST`, etc. handlers
3. Use Next.js 13+ App Router conventions

Example:
```typescript
// app/api/my-route/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  return NextResponse.json({ data: 'Hello' })
}
```

#### Adding a New Utility Function
1. Add to appropriate file in `lib/`
2. Keep functions pure (no side effects)
3. Add TypeScript types
4. Export for use in components

### 3. Working with State

#### Global State (Zustand)
```typescript
// Accessing store
import { useStore } from '@/lib/store'

function MyComponent() {
  const userName = useStore((state) => state.userName)
  const setUserName = useStore((state) => state.setUserName)
  
  // Use state...
}
```

#### Local Storage
```typescript
// Using storage utilities
import { getSettings, saveSettings } from '@/lib/storage'

const settings = getSettings()
saveSettings({ ...settings, newKey: 'value' })
```

### 4. Styling Components

#### Tailwind CSS
```tsx
// Use utility classes
<div className="flex items-center gap-4 p-4 bg-background">
  <Button variant="outline">Click me</Button>
</div>
```

#### CSS Variables
```css
/* Defined in app/globals.css */
--background: 240 10% 3.9%;
--foreground: 0 0% 98%;
--primary: 180 100% 50%;  /* Aqua theme */
```

#### Conditional Classes
```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}>
```

### 5. Adding Vocabulary Data

Edit JSON files in `data/words/`:

```json
// data/words/level-1.json
{
  "word": "halo",
  "translation": "hello",
  "examples": [
    { "indonesian": "Halo, apa kabar?", "english": "Hello, how are you?" }
  ],
  "alternative_translations": ["hi", "greetings"],
  "similar_words": ["hai", "selamat pagi"],
  "other_forms": ["halo-halo"],
  "level": 1,
  "learned": false,
  "type": "greeting",
  "category": "common",
  "notes": "Common informal greeting",
  "qa": []
}
```

### 6. Testing

#### Manual Testing
1. Run `npm run dev`
2. Test in browser with React DevTools
3. Check console for errors
4. Test dark mode toggle
5. Verify localStorage persistence

#### Type Checking
```bash
# TypeScript will check types during development
# Fix any type errors shown in IDE
```

#### Linting
```bash
npm run lint

# Fix issues before committing
```

### 7. Code Quality Standards

#### TypeScript
- Always add types for function parameters and return values
- Use interfaces for object shapes
- Avoid `any` type

#### Component Structure
```tsx
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types
interface MyComponentProps {
  title: string
  onAction?: () => void
}

// 3. Component
export function MyComponent({ title, onAction }: MyComponentProps) {
  // 4. State and hooks
  const [state, setState] = useState(false)
  
  // 5. Handlers
  const handleClick = () => {
    setState(true)
    onAction?.()
  }
  
  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Action</Button>
    </div>
  )
}
```

#### File Naming
- **Components:** `kebab-case.tsx` (e.g., `app-header.tsx`)
- **Utilities:** `kebab-case.ts` (e.g., `text-utils.ts`)
- **Types:** `kebab-case.ts` (e.g., `reading-text.ts`)
- **Hooks:** `use-name.ts` (e.g., `use-mobile.ts`)

## Common Development Tasks

### Adding a New Learning Task
1. Update `TASK_CONFIG` in relevant file
2. Add task to sidebar (`components/app-sidebar.tsx`)
3. Implement task view if custom UI needed
4. Add task-specific settings if required

### Modifying AI Prompts
1. Edit `lib/prompt-utils.ts`
2. Update prompt templates
3. Test with OpenRouter API
4. Verify output quality

### Adding Supported Translation Model
1. Edit `lib/models.ts`
2. Add model to relevant provider list
3. Update UI to show new model
4. Test translation quality

### Debugging Tips

#### React DevTools
- Install React DevTools browser extension
- Inspect component hierarchy
- View props and state

#### Console Logging
```typescript
console.log('Debug:', { variable, anotherVar })
```

#### Network Tab
- Monitor API calls to OpenRouter
- Check request/response payloads
- Verify API key is included

#### localStorage Inspection
```javascript
// Browser console
localStorage.getItem('settings')
localStorage.getItem('paragraphStates')
```

## Build & Deployment

### Production Build
```bash
npm run build

# Creates optimized build in .next/ folder
# Check for build errors
```

### Local Production Test
```bash
npm run build
npm start

# Test production build locally
# Open http://localhost:3000
```

### Environment Variables for Production
Ensure `.env` or environment variables are set:
```
NEXT_PUBLIC_OPENROUTER_API_KEY=<your-key>
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Type Errors
```bash
# Check TypeScript config
cat tsconfig.json

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### API Not Working
- Verify `.env` file exists and has API key
- Check OpenRouter API status
- Verify API key is valid
- Check browser console for CORS errors

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Next Steps:**
- Review [Architecture](./architecture.md) for system design
- Check [Component Inventory](./component-inventory.md) for UI components
- See [API Documentation](./api-documentation.md) for API routes
