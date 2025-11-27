# Project Overview - Indo Learning App

**Generated:** 2025-11-27T06:01:12+08:00  
**Project Name:** indo-learning-app  
**Version:** 0.1.0  
**Type:** Web Application  
**Status:** Active Development

## Executive Summary

The Indo Learning App is a **Next.js-based web application** designed to help users learn Indonesian through interactive reading exercises, vocabulary building, and AI-powered translations. The app provides a modern, dark-themed interface with personalized learning paths and progress tracking.

## Purpose & Goals

### Primary Purpose
Provide an engaging, self-paced platform for learning Indonesian language through:
- Interactive reading comprehension
- Vocabulary building with difficulty levels
- AI-assisted translations and explanations
- Progress tracking and learning analytics

### Key Features
1. **Learning Tasks** - Structured learning activities (autobiography, reading exercises)
2. **Enhanced Reading Interface** - Smart text display with word-by-word learning
3. **Vocabulary System** - 4-level word difficulty system with rich metadata
4. **AI Translation** - Integration with OpenRouter for intelligent translations
5. **Progress Tracking** - Day-based learning cadence with statistics
6. **Dark Theme** - Modern, eye-friendly "Dark Aqua" design system

## Technology Summary

| Aspect | Technology |
|--------|-----------|
| **Framework** | Next.js 16.0.3 (App Router) |
| **Language** | TypeScript 5.x |
| **UI Library** | React 19.2.0 |
| **Styling** | Tailwind CSS v4 + Radix UI |
| **State** | Zustand + localStorage |
| **AI Service** | OpenRouter API |

## Architecture Classification

- **Repository Type:** Monolith (single cohesive codebase)
- **Architecture Pattern:** Component-based with layered architecture
- **Rendering:** Client-side with SSR capabilities (Next.js)
- **Data Flow:** Unidirectional (React pattern)

## Project Structure

```
indo-learning-app/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (word search, AI)
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles & CSS variables
│
├── components/             # React components
│   ├── ui/                 # Design system components (17 files)
│   ├── features/           # Feature components (reading, tasks, words)
│   ├── app-header.tsx      # Main navigation header
│   ├── app-sidebar.tsx     # Collapsible sidebar with tasks
│   ├── login-screen.tsx    # User authentication
│   └── main-view.tsx       # Main content area
│
├── lib/                    # Business logic & utilities
│   ├── store.ts            # Zustand state management
│   ├── storage.ts          # localStorage utilities
│   ├── word-service.ts     # Vocabulary CRUD & search
│   ├── word-ai.ts          # AI word generation
│   ├── speech-service.ts   # Text-to-speech
│   ├── text-utils.ts       # Text processing
│   ├── day-grouping.ts     # Learning day calculations
│   └── [13 more utilities]
│
├── hooks/                  # Custom React hooks
│   ├── use-paragraph-state.ts
│   ├── use-content-formatting.ts
│   ├── use-speech.ts
│   ├── use-mobile.ts
│   └── index.ts
│
├── types/                  # TypeScript definitions
│   ├── word.ts             # Word data model
│   ├── reading-text.ts     # Reading interface types
│   └── speech.d.ts         # Speech API types
│
├── data/                   # Static data
│   └── words/              # Vocabulary JSON files
│       ├── level-1.json    # Beginner words
│       ├── level-2.json    # Elementary
│       ├── level-3.json    # Intermediate
│       └── level-4.json    # Advanced
│
└── docs/                   # Documentation (this folder)
```

## Key Components

### Core Features
1. **Enhanced Reading Text** (`components/features/enhanced-reading-text.tsx`)
   - Main learning interface
   - Paragraph-based reading
   - AI regeneration
   - Progress tracking

2. **Word Management** (`lib/word-service.ts`)
   - CRUD operations for vocabulary
   - Search with morphology awareness
   - AI-powered word generation

3. **Task System** (`components/features/task-view.tsx`)
   - Structured learning activities
   - Settings management
   - Content generation

### UI Framework
- **Design System:** shadcn/ui (New York style)
- **Base Color:** Neutral
- **Theme:** Dark mode with aqua accents
- **Icons:** Lucide React
- **Components:** 17 reusable UI components

### Data Model
- **Words:** 4 difficulty levels with rich metadata
- **Progress:** localStorage-based tracking
- **Settings:** Per-task and global configuration
- **Learning Days:** Spaced repetition system

## Recent Refactoring

The project underwent a major refactoring (documented in `REFACTORING_*.md` files):

### Before
- Monolithic 513-line component
- Mixed concerns (UI + logic + utilities)
- Difficult to maintain and test

### After
- **Layered architecture:**
  - Presentation Layer (UI components)
  - Logic Layer (custom hooks)
  - Utility Layer (pure functions)
  - Data Layer (types & constants)
- **Modular components:**
  - `DayGroup`, `ParagraphItem`, `StatisticsPanel`
  - `DisplayFormatTabs`, `CustomFormatInput`
- **Reusable hooks:**
  - `useParagraphState`, `useContentFormatting`
- **Clean separation of concerns**

## External Integrations

### OpenRouter API
- **Purpose:** AI-powered translations and word generation
- **Models Supported:** Multiple LLM providers
- **Authentication:** API key (NEXT_PUBLIC_OPENROUTER_API_KEY)
- **Usage:** Document translation, word enrichment

### Browser APIs
- **localStorage:** Persisting user data and progress
- **Web Speech API:** Text-to-speech for pronunciation
- **Fetch API:** API requests to OpenRouter

## Development Status

### Completed
✅ Core learning interface with enhanced reading  
✅ Vocabulary system with 4 difficulty levels  
✅ AI-powered translations via OpenRouter  
✅ Progress tracking and statistics  
✅ Dark theme with modern UI  
✅ Component refactoring and modularization  
✅ Day-based learning cadence  

### In Progress
🔄 Additional learning tasks and exercises  
🔄 Enhanced word search and filtering  
🔄 Mobile responsiveness improvements  

## User Workflow

1. **Login** - User enters their name
2. **Select Task** - Choose from sidebar (e.g., "Learn Your Autobiography")
3. **Configure Settings** - Set learning days, translation model, custom prompts
4. **Generate Content** - AI creates personalized learning material
5. **Read & Learn** - Enhanced interface with day-based progression
6. **Track Progress** - Statistics panel shows sentences learned, words, days passed

## Data Flow Architecture

```
User Input → Task View → Content Generation (AI)
                ↓
        Enhanced Reading Text
                ↓
        ┌───────┴────────┐
        ↓                ↓
  Paragraph State    Formatting
        ↓                ↓
   localStorage    Display Components
        ↓                ↓
    Statistics ←────────┘
```

## Getting Started

See [Development Guide](./development-guide.md) for:
- Prerequisites and installation
- Running the dev server
- Building for production
- Configuration

See [Architecture](./architecture.md) for:
- Detailed component hierarchy
- State management patterns
- File dependencies

---

**Generated Documentation:**
- [Technology Stack](./technology-stack.md)
- [Architecture](./architecture.md) _(To be generated)_
- [Component Inventory](./component-inventory.md) _(To be generated)_
- [Development Guide](./development-guide.md) _(To be generated)_
- [API Documentation](./api-documentation.md) _(To be generated)_
- [Data Models](./data-models.md) _(To be generated)_
