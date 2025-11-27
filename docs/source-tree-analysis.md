# Source Tree Analysis - Indo Learning App

**Generated:** 2025-11-27T06:01:12+08:00  
**Total Files:** 87 (excluding node_modules, .next, .git)  
**Total Directories:** 16

## Complete Directory Structure

```
indo-learning-app/
│
├── 📁 app/                           # Next.js App Router (v13+)
│   ├── 📁 api/                       # API Routes (Serverless Functions)
│   │   └── 📁 words/                 # Word search endpoint
│   │       └── route.ts              # GET /api/words
│   ├── favicon.ico                   # Site favicon
│   ├── globals.css                   # Global styles & CSS variables
│   ├── layout.tsx                    # Root layout (providers, fonts)
│   └── page.tsx                      # Home page (main entry)
│
├── 📁 components/                    # React Components
│   │
│   ├── 📁 features/                  # Feature-Specific Components
│   │   ├── 📁 reading-text/          # Reading Interface Subcomponents
│   │   │   ├── custom-format-input.tsx    # Custom format text area
│   │   │   ├── day-group.tsx              # Day-based paragraph grouping
│   │   │   ├── display-format-tabs.tsx    # Format selection tabs
│   │   │   ├── index.ts                   # Barrel export
│   │   │   ├── paragraph-item.tsx         # Individual paragraph component
│   │   │   └── statistics-panel.tsx       # Progress statistics display
│   │   │
│   │   ├── enhanced-reading-text.tsx      # Main learning interface
│   │   ├── reading-text.tsx               # Alternative reading view
│   │   ├── settings-view.tsx              # Task settings panel
│   │   ├── task-view.tsx                  # Task execution container
│   │   ├── word-review-slider.tsx         # Word carousel
│   │   └── word.tsx                       # Individual word display
│   │
│   ├── 📁 ui/                        # Design System Components (shadcn/ui)
│   │   ├── button.tsx                # Button with variants
│   │   ├── card.tsx                  # Content card container
│   │   ├── collapsible.tsx           # Expandable content
│   │   ├── dialog.tsx                # Modal dialog
│   │   ├── fun-loading.tsx           # Custom loading animation
│   │   ├── input.tsx                 # Text input field
│   │   ├── label.tsx                 # Form label
│   │   ├── progress.tsx              # Progress bar
│   │   ├── scroll-area.tsx           # Custom scrollbar
│   │   ├── select.tsx                # Dropdown select
│   │   ├── separator.tsx             # Visual divider
│   │   ├── sheet.tsx                 # Slide-out panel
│   │   ├── sidebar.tsx               # Collapsible sidebar
│   │   ├── skeleton.tsx              # Loading placeholder
│   │   ├── textarea.tsx              # Multi-line text input
│   │   ├── tooltip.tsx               # Hover tooltip
│   │   └── voice-input-button.tsx    # Speech-to-text button
│   │
│   ├── app-header.tsx                # Top navigation bar
│   ├── app-sidebar.tsx               # Left sidebar with tasks
│   ├── login-screen.tsx              # User authentication dialog
│   ├── main-view.tsx                 # Main content container
│   └── theme-provider.tsx            # Dark mode provider
│
├── 📁 data/                          # Static Data Files
│   └── 📁 words/                     # Vocabulary JSON Database
│       ├── level-1.json              # Beginner words (500-1000)
│       ├── level-2.json              # Elementary words (1000-2000)
│       ├── level-3.json              # Intermediate words (2000-3000)
│       └── level-4.json              # Advanced words (1000-1500)
│
├── 📁 docs/                          # Documentation (Generated)
│   ├── 📁 sprint-artifacts/          # Sprint tracking (empty)
│   ├── api-documentation.md          # API reference
│   ├── component-inventory.md        # Component catalog
│   ├── data-models.md                # Data structures
│   ├── development-guide.md          # Developer setup
│   ├── project-overview.md           # Project summary
│   ├── project-scan-report.json      # Workflow state
│   └── technology-stack.md           # Tech stack details
│
├── 📁 hooks/                         # Custom React Hooks
│   ├── index.ts                      # Barrel export for hooks
│   ├── use-content-formatting.ts     # Content formatting logic
│   ├── use-mobile.ts                 # Mobile detection hook
│   ├── use-paragraph-state.ts        # Paragraph state management
│   └── use-speech.ts                 # Text-to-speech integration
│
├── 📁 lib/                           # Business Logic & Utilities
│   ├── api.ts                        # OpenRouter API client
│   ├── day-grouping.ts               # Learning day calculations
│   ├── models.ts                     # OpenRouter model definitions
│   ├── prompt-utils.ts               # AI prompt management
│   ├── reading-text-constants.ts     # Reading text constants
│   ├── sentence-store.ts             # Sentence progress store
│   ├── speech-service.ts             # Text-to-speech service
│   ├── storage.ts                    # localStorage wrapper
│   ├── store.ts                      # Zustand global state
│   ├── text-utils.ts                 # Text processing helpers
│   ├── utils.ts                      # General utilities
│   ├── word-ai.ts                    # AI word generation
│   ├── word-service.ts               # Vocabulary CRUD operations
│   ├── word-store.ts                 # Word state management
│   └── word-utils.ts                 # Word manipulation helpers
│
├── 📁 public/                        # Static Assets
│   ├── file.svg                      # Icon asset
│   ├── globe.svg                     # Icon asset
│   ├── next.svg                      # Next.js logo
│   ├── vercel.svg                    # Vercel logo
│   └── window.svg                    # Icon asset
│
├── 📁 types/                         # TypeScript Type Definitions
│   ├── reading-text.ts               # Reading interface types
│   ├── speech.d.ts                   # Web Speech API types
│   └── word.ts                       # Word data model types
│
├── 📄 ARCHITECTURE.md                # Architecture documentation
├── 📄 README.md                      # Project README
├── 📄 README_REFACTORING.md          # Refactoring notes
├── 📄 REFACTORING_CHECKLIST.md       # Refactoring progress
├── 📄 REFACTORING_GUIDE.md           # Refactoring guide
├── 📄 REFACTORING_SUMMARY.md         # Refactoring summary
├── 📄 TRANSLATION_MODELS.md          # Translation models doc
│
├── ⚙️ components.json                # shadcn/ui configuration
├── ⚙️ eslint.config.mjs              # ESLint configuration
├── ⚙️ next-env.d.ts                  # Next.js type definitions
├── ⚙️ next.config.ts                 # Next.js configuration
├── ⚙️ package.json                   # NPM dependencies
├── ⚙️ package-lock.json              # Dependency lock file
├── ⚙️ postcss.config.mjs             # PostCSS configuration
├── ⚙️ tsconfig.json                  # TypeScript configuration
└── ⚙️ tsconfig.tsbuildinfo           # TypeScript build cache
```

---

## Critical Directories

### 📁 app/ - Next.js App Router

**Purpose:** Application routes and layouts  
**Pattern:** File-system based routing  
**Entry Point:** `page.tsx` (mapped to `/`)

**Key Files:**
- `layout.tsx` - Root layout with providers (ThemeProvider, fonts)
- `page.tsx` - Homepage (renders main application)
- `globals.css` - Global styles, CSS variables, theme definitions
- `api/words/route.ts` - Word search API endpoint

**Router Convention:**
- Folders = route segments
- `page.tsx` = route handler
- `layout.tsx` = shared layouts
- `route.ts` = API endpoints

---

### 📁 components/ - React Components

**Purpose:** All React components organized by type  
**Pattern:** Feature-based + Design System separation

#### Subfolders:

**features/** - Domain-specific components
- Reading text components (enhanced reading interface)
- Task management (task view, settings)
- Word display and review

**ui/** - Reusable design system
- Based on shadcn/ui (New York style)
- Radix UI primitives
- 17 production-ready components

**Root Files:** Layout components (header, sidebar, login, theme)

---

### 📁 data/ - Static Data

**Purpose:** Vocabulary database (JSON files)  
**Format:** One file per difficulty level  
**Total Size:** ~5-10k words across 4 levels

**Structure:**
```
level-1.json → Beginner (basic greetings, common words)
level-2.json → Elementary (everyday conversation)
level-3.json → Intermediate (complex topics)
level-4.json → Advanced (specialized vocabulary)
```

**Access Pattern:**
- Loaded on-demand via `word-service.ts`
- Cached in memory after first load
- Modified via localStorage (progress tracking)

---

### 📁 lib/ - Business Logic

**Purpose:** Core application logic and utilities  
**Pattern:** Single-responsibility modules

**Categories:**

1. **State Management**
   - `store.ts` - Zustand global state
   - `storage.ts` - localStorage wrapper
   - `word-store.ts` - Word-specific state
   - `sentence-store.ts` - Sentence progress

2. **API Services**
   - `api.ts` - OpenRouter client
   - `word-service.ts` - Vocabulary CRUD
   - `word-ai.ts` - AI word generation
   - `speech-service.ts` - Text-to-speech

3. **Utilities**
   - `text-utils.ts` - Text processing
   - `word-utils.ts` - Word manipulation
   - `day-grouping.ts` - Learning day math
   - `prompt-utils.ts` - AI prompt templates
   - `utils.ts` - General helpers

4. **Constants & Config**
   - `models.ts` - OpenRouter model list
   - `reading-text-constants.ts` - Reading constants

---

### 📁 hooks/ - Custom React Hooks

**Purpose:** Reusable stateful logic  
**Pattern:** `use-*` naming convention

**Hooks:**
- `use-paragraph-state.ts` - Paragraph management
- `use-content-formatting.ts` - Content formatting
- `use-speech.ts` - Text-to-speech integration
- `use-mobile.ts` - Mobile detection
- `index.ts` - Barrel export

---

### 📁 types/ - TypeScript Definitions

**Purpose:** Centralized type definitions  
**Pattern:** Domain-specific type files

**Files:**
- `word.ts` - Word data model (WordEntry, WordLevel, etc.)
- `reading-text.ts` - Reading interface types
- `speech.d.ts` - Web Speech API declarations

---

### 📁 docs/ - Documentation

**Purpose:** Project documentation (auto-generated)  
**Generated By:** BMad document-project workflow

**Files:**
- `project-overview.md` - High-level project summary
- `technology-stack.md` - Tech stack details
- `architecture.md` - System architecture
- `component-inventory.md` - Component catalog
- `development-guide.md` - Developer setup
- `api-documentation.md` - API reference
- `data-models.md` - Data structures
- `source-tree-analysis.md` - This file
- `index.md` - Master navigation index

---

## File Naming Conventions

### Components
- **Format:** `kebab-case.tsx`
- **Examples:** `app-header.tsx`, `task-view.tsx`, `display-format-tabs.tsx`

### Utilities
- **Format:** `kebab-case.ts`
- **Examples:** `text-utils.ts`, `word-service.ts`, `day-grouping.ts`

### Hooks
- **Format:** `use-name.ts`
- **Examples:** `use-mobile.ts`, `use-speech.ts`, `use-paragraph-state.ts`

### Types
- **Format:** `domain-name.ts` or `domain.d.ts`
- **Examples:** `word.ts`, `reading-text.ts`, `speech.d.ts`

---

## Entry Points

### Application Entry
```
app/layout.tsx          → Root layout (providers)
  └── app/page.tsx      → Homepage (renders app)
      └── components/main-view.tsx  → Main content area
```

### Feature Entry Points

**Reading Interface:**
```
components/features/enhanced-reading-text.tsx
  ├── hooks/use-paragraph-state.ts
  ├── hooks/use-content-formatting.ts
  └── components/features/reading-text/*
```

**Word Management:**
```
lib/word-service.ts
  ├── lib/storage.ts
  └── data/words/*.json
```

**AI Integration:**
```
lib/api.ts
  ├── lib/prompt-utils.ts
  └── lib/models.ts
```

---

## Integration Points

### Component → Service
```typescript
// Components call services
import { searchWords } from '@/lib/word-service'
const words = await searchWords('buku')
```

### Service → Storage
```typescript
// Services access localStorage
import { getSettings, saveSettings } from '@/lib/storage'
const settings = getSettings()
```

### Component → Hook
```typescript
// Components use custom hooks
import { useParagraphState } from '@/hooks/use-paragraph-state'
const { paragraphStates, markLearned } = useParagraphState()
```

### Hook → Store
```typescript
// Hooks access Zustand store
import { useStore } from '@/lib/store'
const userName = useStore((state) => state.userName)
```

---

## Dependency Flow

```
┌─────────────────┐
│  App Router     │
│  (app/)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Components     │
│  (components/)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Hooks          │
│  (hooks/)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Services       │
│  (lib/)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Data & Types   │
│  (data/, types/)│
└─────────────────┘
```

**Rules:**
- Dependencies flow downward
- No circular dependencies
- Types can be imported anywhere
- Services don't import components/hooks

---

## Build Artifacts

**Generated Folders (excluded from git):**
- `.next/` - Next.js build output
- `node_modules/` - NPM dependencies
- `tsconfig.tsbuildinfo` - TypeScript build cache

---

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | NPM dependencies and scripts |
| `tsconfig.json` | TypeScript compiler options |
| `next.config.ts` | Next.js configuration |
| `components.json` | shadcn/ui settings |
| `postcss.config.mjs` | PostCSS plugins (Tailwind) |
| `eslint.config.mjs` | Linting rules |

---

## Path Aliases

Configured in `tsconfig.json`:

```typescript
{
  "paths": {
    "@/*": ["./*"]  // Root alias
  }
}
```

**Usage:**
```typescript
import { Button } from '@/components/ui/button'
import { searchWords } from '@/lib/word-service'
import { WordEntry } from '@/types/word'
```

---

## File Size Distribution

### Largest Components
- `enhanced-reading-text.tsx` - Refactored to ~300 lines (was 513)
- `task-view.tsx` - Task execution logic
- `word.tsx` - Detailed word display

### Largest Utilities
- `word-service.ts` - Vocabulary CRUD + search
- `storage.ts` - localStorage abstraction
- `text-utils.ts` - Text processing functions

### Data Files
- `level-{1-4}.json` - 500-3000 words each
- Total vocabulary: ~5-10k words

---

## Code Organization Principles

1. **Separation of Concerns:** UI, logic, data separate
2. **Single Responsibility:** One file, one purpose
3. **Feature Folders:** Group related components
4. **Barrel Exports:** `index.ts` for clean imports
5. **Type Safety:** Centralized type definitions
6. **Path Aliases:** Clean import paths

---

**Related Documentation:**
- [Project Overview](./project-overview.md) - Project summary
- [Architecture](./architecture.md) - System design
- [Development Guide](./development-guide.md) - Working with code
