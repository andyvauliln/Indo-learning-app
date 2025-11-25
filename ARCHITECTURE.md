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
