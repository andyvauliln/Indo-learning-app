# Architecture Diagram

## Component Hierarchy

```
EnhancedReadingText (Main Orchestrator)
├── DisplayFormatTabs
│   └── Regenerate Button
├── CustomFormatInput (conditional)
├── StatisticsPanel
│   └── StatCard (×4)
└── DayGroup (×N days)
    └── ParagraphItem (×N paragraphs)
        ├── Paragraph Content
        └── Paragraph Controls
            ├── Regenerate Button
            ├── Mark as Learned Button
            └── Prompt Input (conditional)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    EnhancedReadingText                       │
│                    (Main Component)                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Custom Hooks                                       │    │
│  │  ├── useParagraphState() - Paragraph management    │    │
│  │  └── useContentFormatting() - Format management    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Utility Functions                                  │    │
│  │  ├── text-utils - Text processing                  │    │
│  │  ├── day-grouping - Day calculations               │    │
│  │  └── prompt-utils - Prompt management              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Child Components                                   │    │
│  │  ├── DisplayFormatTabs                             │    │
│  │  ├── CustomFormatInput                             │    │
│  │  ├── StatisticsPanel                               │    │
│  │  ├── DayGroup                                       │    │
│  │  └── ParagraphItem                                  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
Parent Component (TaskView)
        ↓
    Props ↓
        ↓
EnhancedReadingText
        ↓
    ┌───┴───────────────────┐
    ↓                       ↓
useParagraphState    useContentFormatting
    ↓                       ↓
    ├─ paragraphStates     ├─ formattedContent
    ├─ regeneratingPara    ├─ isFormatting
    └─ handlers            └─ formatContent()
        ↓                       ↓
    ┌───┴───────────────────────┴───┐
    ↓                               ↓
Child Components             Utility Functions
(DayGroup, ParagraphItem)   (text-utils, etc.)
```

## File Dependencies

```
enhanced-reading-text.tsx
├── imports hooks/
│   ├── useParagraphState
│   └── useContentFormatting
├── imports lib/
│   ├── text-utils
│   ├── day-grouping
│   ├── prompt-utils
│   └── reading-text-constants
├── imports types/
│   └── reading-text
└── imports components/reading-text/
    ├── DisplayFormatTabs
    ├── CustomFormatInput
    ├── StatisticsPanel
    ├── DayGroup
    └── ParagraphItem (used by DayGroup)
```

## Module Interaction

```
┌──────────────────┐
│   Constants      │  ← Shared by all modules
│  (constants.ts)  │
└──────────────────┘
        ↑
        │
┌───────┴──────────┐
│   Type Defs      │  ← Used by all TypeScript files
│ (reading-text.ts)│
└──────────────────┘
        ↑
        │
┌───────┴──────────┐
│   Utilities      │  ← Pure functions, no dependencies
│  (text-utils,    │
│   day-grouping,  │
│   prompt-utils)  │
└──────────────────┘
        ↑
        │
┌───────┴──────────┐
│  Custom Hooks    │  ← Use utilities + React hooks
│ (use-paragraph-  │
│  state, use-     │
│  content-format) │
└──────────────────┘
        ↑
        │
┌───────┴──────────┐
│  UI Components   │  ← Use hooks + utilities
│ (ParagraphItem,  │
│  DayGroup,       │
│  StatPanel, etc) │
└──────────────────┘
        ↑
        │
┌───────┴──────────┐
│ Main Component   │  ← Orchestrates everything
│ (EnhancedReading │
│      Text)       │
└──────────────────┘
```

## Responsibility Matrix

| Module | UI | State | Logic | Data |
|--------|----|----|-------|------|
| **EnhancedReadingText** | ✓ | ✓ | ✓ | - |
| **DisplayFormatTabs** | ✓ | - | - | - |
| **CustomFormatInput** | ✓ | - | - | - |
| **StatisticsPanel** | ✓ | - | - | ✓ |
| **DayGroup** | ✓ | - | - | - |
| **ParagraphItem** | ✓ | - | - | - |
| **useParagraphState** | - | ✓ | ✓ | - |
| **useContentFormatting** | - | ✓ | ✓ | - |
| **text-utils** | - | - | ✓ | ✓ |
| **day-grouping** | - | - | ✓ | ✓ |
| **prompt-utils** | - | - | ✓ | - |
| **constants** | - | - | - | ✓ |
| **types** | - | - | - | ✓ |

Legend: ✓ = Primary Responsibility, - = Not Responsible

## Before vs After Architecture

### BEFORE: Monolithic
```
┌─────────────────────────────────────┐
│                                     │
│   enhanced-reading-text.tsx         │
│   (513 lines)                       │
│                                     │
│   Everything mixed together:        │
│   - UI rendering                    │
│   - State management                │
│   - Business logic                  │
│   - Utility functions               │
│   - Constants                       │
│   - Type definitions                │
│                                     │
└─────────────────────────────────────┘
```

### AFTER: Modular
```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Tabs      │ │Custom    │ │Stats     │ │Day/Para  │  │
│  │Component │ │Input     │ │Panel     │ │Components│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                     Logic Layer                          │
│  ┌──────────────────┐ ┌────────────────────────┐       │
│  │ useParagraphState│ │ useContentFormatting   │       │
│  └──────────────────┘ └────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                   Utility Layer                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │text-utils│ │day-group │ │prompt-   │               │
│  │          │ │          │ │utils     │               │
│  └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│  ┌──────────────┐ ┌────────────────────┐               │
│  │ constants    │ │ type definitions   │               │
│  └──────────────┘ └────────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

---

## Key Architectural Principles

1. **Layered Architecture**: Clear separation between presentation, logic, utility, and data layers
2. **Single Responsibility**: Each module has one clear purpose
3. **Dependency Direction**: Dependencies flow downward (UI → Logic → Utilities → Data)
4. **Composition**: Small, composable components over large monoliths
5. **Encapsulation**: State and logic encapsulated in custom hooks
6. **Reusability**: Shared utilities and components across the application

---

This architecture ensures:
- ✅ **Scalability**: Easy to add new features
- ✅ **Maintainability**: Easy to locate and fix issues  
- ✅ **Testability**: Each layer can be tested independently
- ✅ **Clarity**: Clear understanding of system structure

## Vocabulary Data Model & Service

- **Data layout**: the legacy `basic-words.json` was flattened into `data/words/level-{1..4}.json`. Each file now contains only one difficulty tier, which lets any feature stream the appropriate words without filtering on the client.
- **Word schema**: every record follows the enriched contract from the brief (`word`, `translation`, `examples`, `alternative_translations`, `similar_words`, `other_forms`, `level`, `learned`, `type`, `category`, `notes`, `q&a`). Lists satisfy the requested cardinalities (3–5 examples, 2 alternative translations/forms/similar words).
- **Service**: `lib/word-service.ts` centralizes CRUD helpers, the morphology-aware `searchWords`, and `generateWordWithAI` which sends a schema-locked prompt to OpenRouter so the UI can request brand-new entries or richer examples as needed.

### Handling Derived Forms

- **Option 1 – store every inflected form as its own root entry**
  - ✅ direct lookup without extra parsing
  - ❌ duplicated notes/examples/AI output
  - ❌ “learned” state drifts across records for the same lemma
- **Option 2 – keep one lemma and describe the rest in `other_forms`**
  - ✅ single source of truth for meaning, notes, and examples
  - ✅ much easier to regenerate/update via AI
  - ✅ `searchWords` can expand into `other_forms` plus apply affix normalization (`-nya`, `-kan`, `me-`, etc.) so queries like `bukanya` still match `buka`
  - ❌ search layer must normalize both lemmas and derived forms

**Decision**: Option 2. Lemmas remain unique at the root while `other_forms` carries suffix/prefix variations. The search service compensates by indexing both the lemma and every recorded form and also stripping common affixes. This keeps the dataset compact, ensures updates stay consistent, and still surfaces all known spellings to the UI.
