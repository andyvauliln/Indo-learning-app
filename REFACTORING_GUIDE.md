# Enhanced Reading Text - Refactored Architecture

## Overview
This document describes the refactored architecture of the Enhanced Reading Text feature. The refactoring focused on modularity, reusability, and maintainability.

## Structure

### 📁 Directory Organization

```
components/features/
├── enhanced-reading-text.tsx         # Main component (orchestrator)
└── reading-text/
    ├── index.ts                      # Barrel exports
    ├── display-format-tabs.tsx       # Tab navigation component
    ├── custom-format-input.tsx       # Custom format input UI
    ├── statistics-panel.tsx          # Statistics display
    ├── paragraph-item.tsx            # Individual paragraph component
    └── day-group.tsx                 # Day grouping component

hooks/
├── index.ts                          # Barrel exports
├── use-paragraph-state.ts            # Paragraph state management hook
└── use-content-formatting.ts         # Content formatting logic hook

lib/
├── text-utils.ts                     # Text processing utilities
├── day-grouping.ts                   # Day grouping logic
├── prompt-utils.ts                   # Prompt management utilities
└── reading-text-constants.ts         # Constants and configuration

types/
└── reading-text.ts                   # TypeScript type definitions
```

## Components

### 1. **EnhancedReadingText** (Main Component)
**File:** `components/features/enhanced-reading-text.tsx`

The main orchestrator component that:
- Coordinates all sub-components
- Manages high-level state
- Handles tab switching and regeneration
- Delegates rendering to specialized components

**Key Responsibilities:**
- Tab management
- Content regeneration orchestration
- State synchronization with parent components

---

### 2. **DisplayFormatTabs**
**File:** `components/features/reading-text/display-format-tabs.tsx`

Renders the tab navigation bar with regenerate button.

**Props:**
- `activeTab`: Current active tab
- `isFormatting`: Loading state
- `onTabChange`: Tab change handler
- `regenerateFn`: Optional regenerate function
- `isGenerating`: Regeneration state

---

### 3. **CustomFormatInput**
**File:** `components/features/reading-text/custom-format-input.tsx`

Handles custom format prompt input.

**Props:**
- `value`: Current prompt value
- `onChange`: Change handler
- `onApply`: Apply format handler
- `isFormatting`: Loading state

---

### 4. **StatisticsPanel**
**File:** `components/features/reading-text/statistics-panel.tsx`

Displays learning statistics in a grid layout.

**Props:**
- `statistics`: Statistics data object containing:
  - `learnedCount`: Number of learned sentences
  - `totalSentences`: Total sentences
  - `wordCount`: Total words
  - `learnedPercentage`: Learning progress percentage
  - `daysPassed`: Days since start
  - `totalDaysGoal`: Target learning days

**Internal Components:**
- `StatCard`: Reusable stat display card

---

### 5. **ParagraphItem**
**File:** `components/features/reading-text/paragraph-item.tsx`

Renders a single paragraph with controls.

**Props:**
- `paragraphId`: Unique identifier
- `content`: Paragraph text
- `isLearned`: Learned state
- `language`: Display language (affects font)
- `isRegenerating`: Regeneration state
- `showPromptInput`: Prompt input visibility
- `promptValue`: Current prompt value
- `onMarkAsLearned`: Mark as learned handler
- `onTogglePromptInput`: Toggle prompt input
- `onPromptChange`: Prompt change handler
- `onRegenerate`: Regenerate handler

---

### 6. **DayGroup**
**File:** `components/features/reading-text/day-group.tsx`

Groups and renders paragraphs for a specific learning day.

**Props:**
- `dayGroup`: Day group data (day number and paragraphs)
- `language`: Display language
- `paragraphStates`: Learned states map
- `regeneratingParagraph`: Currently regenerating paragraph ID
- `showPromptInput`: Prompt input visibility map
- `paragraphPrompts`: Paragraph prompts map
- Event handlers for paragraph operations

---

## Custom Hooks

### 1. **useParagraphState**
**File:** `hooks/use-paragraph-state.ts`

Manages all paragraph-related state:
- Learned/unlearned states
- Regeneration states
- Prompt input visibility
- Custom prompts

**Returns:**
- State values
- Handler functions for state updates

---

### 2. **useContentFormatting**
**File:** `hooks/use-content-formatting.ts`

Handles content formatting logic:
- Manages formatted content cache
- Formatting loading states
- Format generation

**Returns:**
- Current formatted content
- Formatting state
- Format function
- Update functions

---

## Utility Functions

### 1. **text-utils.ts**
General text processing utilities:
- `splitIntoParagraphs()` - Splits content into paragraphs
- `updateParagraphInContent()` - Updates a specific paragraph
- `calculateDaysPassed()` - Calculates days since start
- `countWords()` - Counts words in text
- `calculatePercentage()` - Calculates percentages

---

### 2. **day-grouping.ts**
Day grouping logic:
- `groupParagraphsByDay()` - Groups paragraphs by learning days
- `calculateEffectiveLearningDays()` - Calculates learning days

---

### 3. **prompt-utils.ts**
Prompt management:
- `getPromptForFormat()` - Gets appropriate prompt for format
- `getFormatRegenerationPrompt()` - Gets regeneration prompt for format

---

### 4. **reading-text-constants.ts**
Application constants:
- `DEFAULT_LEARNING_DAYS` - Default learning period
- `DEFAULT_REGENERATE_PROMPT` - Default regeneration prompt
- Font families and styling constants

---

## Type Definitions

**File:** `types/reading-text.ts`

Centralized TypeScript types:
- `ParagraphData` - Paragraph data structure
- `DisplayFormat` - Display format types
- `EnhancedReadingTextProps` - Main component props
- `DayGroup` - Day group structure
- `StatisticsData` - Statistics data structure

---

## Benefits of Refactoring

### ✅ **Modularity**
- Each component has a single, well-defined responsibility
- Easy to understand and maintain
- Components can be tested independently

### ✅ **Reusability**
- Components like `StatCard` and `ParagraphItem` can be reused
- Utility functions centralize common logic
- Custom hooks encapsulate reusable state logic

### ✅ **Maintainability**
- Clear separation of concerns
- Constants in one place for easy updates
- Type safety with TypeScript

### ✅ **Readability**
- Main component is now ~200 lines instead of 513
- Self-documenting code with clear naming
- Logical file organization

### ✅ **Testability**
- Small, focused functions are easier to test
- Mocked dependencies through props
- Pure utility functions for unit testing

---

## Migration Notes

This refactoring is **backward compatible**. The component API remains unchanged:
- Same props interface
- Same behavior
- Same functionality

No changes required in parent components!

---

## Future Improvements

1. **Memoization**: Add `useMemo` and `useCallback` for performance
2. **Error Boundaries**: Add error handling components
3. **Accessibility**: Enhance ARIA labels and keyboard navigation
4. **Testing**: Add unit and integration tests
5. **Storybook**: Create component stories for documentation

---

## Development Guidelines

### Adding New Features
1. Create new components in `components/features/reading-text/`
2. Add utility functions to appropriate files in `lib/`
3. Update types in `types/reading-text.ts`
4. Export from barrel files (`index.ts`)

### Naming Conventions
- **Components**: PascalCase (e.g., `ParagraphItem`)
- **Hooks**: camelCase with `use` prefix (e.g., `useParagraphState`)
- **Utilities**: camelCase (e.g., `splitIntoParagraphs`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_LEARNING_DAYS`)

### File Organization
- One component per file
- Related utilities grouped by domain
- Keep files under 200 lines when possible

---

## Questions?

For questions or suggestions about this architecture, please refer to the codebase or create an issue.
