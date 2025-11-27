# Component Inventory - Indo Learning App

**Generated:** 2025-11-27T06:01:12+08:00  
**Total Components:** 24  
**Component Library:** shadcn/ui (New York style) + Custom Features

## Component Categories

- [UI Components](#ui-components) (17 files)
- [Feature Components](#feature-components) (7 files)
- [Layout Components](#layout-components) (3 files)
- [Shared Components](#shared-components) (2 files)

---

## UI Components

### Design System Components (`components/ui/`)

These are reusable, accessible UI primitives based on Radix UI and shadcn/ui.

| Component | File | Purpose | Radix Primitive |
|-----------|------|---------|-----------------|
| **Button** | `button.tsx` | Clickable button with variants | `@radix-ui/react-slot` |
| **Card** | `card.tsx` | Content container with header/footer | Native |
| **Collapsible** | `collapsible.tsx` | Expandable/collapsible content | `@radix-ui/react-collapsible` |
| **Dialog** | `dialog.tsx` | Modal dialog overlay | `@radix-ui/react-dialog` |
| **Fun Loading** | `fun-loading.tsx` | Custom animated loading indicator | Native |
| **Input** | `input.tsx` | Text input field | Native |
| **Label** | `label.tsx` | Form label | `@radix-ui/react-label` |
| **Progress** | `progress.tsx` | Progress bar indicator | `@radix-ui/react-progress` |
| **Scroll Area** | `scroll-area.tsx` | Custom scrollable container | `@radix-ui/react-scroll-area` |
| **Select** | `select.tsx` | Dropdown select menu | `@radix-ui/react-select` |
| **Separator** | `separator.tsx` | Visual divider line | `@radix-ui/react-separator` |
| **Sheet** | `sheet.tsx` | Slide-out panel (drawer) | `@radix-ui/react-dialog` |
| **Sidebar** | `sidebar.tsx` | Collapsible navigation sidebar | `@radix-ui/react-collapsible` |
| **Skeleton** | `skeleton.tsx` | Loading skeleton placeholder | Native |
| **Textarea** | `textarea.tsx` | Multi-line text input | Native |
| **Tooltip** | `tooltip.tsx` | Hover tooltip | `@radix-ui/react-tooltip` |
| **Voice Input Button** | `voice-input-button.tsx` | Speech-to-text button | Web Speech API |

### Component Variants

#### Button Variants
- `default` - Primary button (aqua)
- `destructive` - Danger button (red)
- `outline` - Outlined button
- `secondary` - Secondary style
- `ghost` - Transparent button
- `link` - Link-styled button

#### Button Sizes
- `default` - Standard size
- `sm` - Small
- `lg` - Large
- `icon` - Icon-only (square)

---

## Feature Components

### Main Features (`components/features/`)

| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| **Enhanced Reading Text** | `enhanced-reading-text.tsx` | Main learning interface | Day grouping, paragraph management, statistics |
| **Reading Text** | `reading-text.tsx` | Alternative reading view | Simpler reading interface |
| **Task View** | `task-view.tsx` | Task execution container | Settings, content generation, model selection |
| **Settings View** | `settings-view.tsx` | Task settings panel | Learning days, prompts, model selection |
| **Word** | `word.tsx` | Individual word display | Translations, examples, Q&A |
| **Word Review Slider** | `word-review-slider.tsx` | Word carousel/slider | Review multiple words |

### Reading Text Subcomponents (`components/features/reading-text/`)

| Component | File | Purpose | Parent |
|-----------|------|---------|--------|
| **Day Group** | `day-group.tsx` | Groups paragraphs by learning day | EnhancedReadingText |
| **Paragraph Item** | `paragraph-item.tsx` | Individual paragraph with controls | DayGroup |
| **Statistics Panel** | `statistics-panel.tsx` | Learning progress stats | EnhancedReadingText |
| **Display Format Tabs** | `display-format-tabs.tsx` | Format selection tabs | EnhancedReadingText |
| **Custom Format Input** | `custom-format-input.tsx` | Custom format text area | EnhancedReadingText |
| **Index** | `index.ts` | Barrel export for subcomponents | - |

---

## Layout Components

### Application Layout (`components/`)

| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| **App Header** | `app-header.tsx` | Top navigation bar | Theme toggle, user name display |
| **App Sidebar** | `app-sidebar.tsx` | Left sidebar navigation | Task list, collapsible, scroll area |
| **Main View** | `main-view.tsx` | Main content container | Renders active task view |

---

## Shared Components

### Global Components (`components/`)

| Component | File | Purpose | Provider |
|-----------|------|---------|----------|
| **Login Screen** | `login-screen.tsx` | User authentication | Dialog-based name input |
| **Theme Provider** | `theme-provider.tsx` | Dark mode management | next-themes |

---

## Component Hierarchy

### Application Structure
```
App Layout (layout.tsx)
├── Theme Provider
│   ├── App Header
│   │   ├── Theme Toggle
│   │   └── User Name Display
│   │
│   ├── App Sidebar (Sheet)
│   │   ├── Task List (Collapsible)
│   │   │   ├── Task Items (Buttons)
│   │   │   └── Subtask Items (Buttons)
│   │   └── Scroll Area
│   │
│   └── Main View
│       ├── Login Screen (Dialog)
│       └── Task Views
│           ├── Task View
│           │   ├── Settings View
│           │   │   ├── Input (Days)
│           │   │   ├── Select (Model)
│           │   │   ├── Textarea (Prompts)
│           │   │   └── Button (Generate)
│           │   │
│           │   └── Enhanced Reading Text
│           │       ├── Display Format Tabs
│           │       ├── Custom Format Input
│           │       ├── Statistics Panel
│           │       │   └── Cards (Stats)
│           │       │
│           │       └── Day Groups
│           │           └── Paragraph Items
│           │               ├── Card (Container)
│           │               ├── Button (Regenerate)
│           │               ├── Button (Mark Learned)
│           │               └── Textarea (Prompt)
│           │
│           └── Word Review Slider
│               └── Word Components
│                   ├── Card
│                   ├── Collapsible (Examples)
│                   ├── Collapsible (Q&A)
│                   └── Buttons
```

---

## Component Design Patterns

### 1. Composition Pattern
Components are composed rather than monolithic:
```tsx
<EnhancedReadingText>
  <DisplayFormatTabs />
  <StatisticsPanel />
  <DayGroup>
    <ParagraphItem />
  </DayGroup>
</EnhancedReadingText>
```

### 2. Render Props / Children
Components accept children for flexibility:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### 3. Controlled Components
State managed by parent:
```tsx
<Button onClick={handleClick} />
<Input value={value} onChange={handleChange} />
```

### 4. Variant-Based Styling
Using `class-variance-authority`:
```tsx
<Button variant="outline" size="sm" />
```

---

## Reusability Matrix

| Category | Reusability | Examples |
|----------|-------------|----------|
| **UI Components** | High | Button, Input, Card, Dialog |
| **Feature Components** | Medium | Word, ParagraphItem |
| **Layout Components** | Low | App Header, Sidebar |
| **Shared Components** | Medium | Login Screen, Theme Provider |

---

## Component Props Overview

### Common Patterns

#### Standard Props
```typescript
interface ComponentProps {
  className?: string        // For style overrides
  children?: React.ReactNode  // For composition
}
```

#### Event Handlers
```typescript
interface InteractiveProps {
  onClick?: () => void
  onChange?: (value: string) => void
  onSubmit?: (data: FormData) => void
}
```

#### Data Props
```typescript
interface DataProps {
  title: string
  content: string
  items: Array<Item>
}
```

---

## Styling Approach

### Tailwind Utilities
All components use Tailwind CSS utility classes:
```tsx
<div className="flex items-center gap-4 p-4 rounded-lg bg-card">
```

### CSS Variables
Theme colors defined in `globals.css`:
```css
--background: 240 10% 3.9%;
--foreground: 0 0% 98%;
--primary: 180 100% 50%;  /* Aqua */
--card: 240 10% 5%;
```

### Conditional Classes
Using `cn()` utility from `lib/utils.ts`:
```tsx
className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}
```

---

## Component State Management

### Local State
- **useState:** Component-level state
- **useEffect:** Side effects and lifecycle

### Custom Hooks
- **useParagraphState:** Paragraph management logic
- **useContentFormatting:** Content formatting logic
- **useSpeech:** Text-to-speech integration
- **useMobile:** Mobile detection

### Global State
- **Zustand Store:** User name, regenerate functions
- **localStorage:** Settings, progress, paragraph states

---

## Accessibility Features

### Radix UI Primitives
- **Keyboard Navigation:** All interactive elements
- **ARIA Labels:** Proper semantic markup
- **Focus Management:** Logical tab order
- **Screen Reader Support:** Descriptive labels

### Custom Enhancements
- **Voice Input:** Speech-to-text button
- **Text-to-Speech:** Pronunciation support
- **High Contrast:** Dark theme with sufficient contrast
- **Focus Indicators:** Visible focus rings

---

## Component Testing Strategy

### Manual Testing
1. **Visual Inspection:** Check render in browser
2. **Interaction Testing:** Click, type, navigate
3. **Responsive Testing:** Mobile, tablet, desktop
4. **Dark Mode Testing:** Verify theme switching

### Type Safety
- **TypeScript:** Compile-time type checking
- **Props Validation:** Interface definitions

---

## Future Component Additions

### Planned Components
- [ ] **Data Table** - Sortable vocabulary table
- [ ] **Chart** - Progress visualization
- [ ] **Calendar** - Learning streak calendar
- [ ] **Notification Toast** - Action feedback
- [ ] **Command Palette** - Keyboard shortcuts
- [ ] **Audio Player** - Pronunciation playback

---

## Component Dependencies

### External Libraries
- **Radix UI:** 9 primitive components
- **Lucide React:** Icon system
- **next-themes:** Theme switching
- **class-variance-authority:** Variant management
- **tailwind-merge:** Class merging

### Internal Dependencies
- **lib/utils.ts:** `cn()` utility
- **lib/store.ts:** Global state
- **hooks/**: Custom React hooks

---

**Related Documentation:**
- [Architecture](./architecture.md) - Component relationships
- [Development Guide](./development-guide.md) - Building components
- [Technology Stack](./technology-stack.md) - UI framework details
