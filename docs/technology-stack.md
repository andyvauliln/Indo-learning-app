# Technology Stack - Indo Learning App

**Generated:** 2025-11-27T06:01:12+08:00  
**Project Type:** Web Application (Next.js SPA)  
**Architecture Pattern:** Component-Based with App Router

## Core Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 16.0.3 | React framework with App Router |
| **Runtime** | React | 19.2.0 | UI library |
| **Runtime** | React DOM | 19.2.0 | React rendering |
| **Language** | TypeScript | ^5.x | Type-safe development |
| **Build Tool** | Next.js (Turbopack) | 16.0.3 | Build & bundling |

## UI & Styling

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **CSS Framework** | Tailwind CSS | ^4.x | Utility-first CSS |
| **PostCSS** | @tailwindcss/postcss | ^4 | CSS processing |
| **Component Library** | Radix UI | Various | Accessible UI primitives |
| **Icons** | Lucide React | ^0.554.0 | Icon system |
| **Design System** | shadcn/ui | Latest | Component collection (New York style) |
| **Theme** | next-themes | ^0.4.6 | Dark mode support |
| **Utilities** | clsx | ^2.1.1 | Conditional classnames |
| **Utilities** | tailwind-merge | ^3.4.0 | Tailwind class merging |
| **Utilities** | class-variance-authority | ^0.7.1 | Variant management |

### Radix UI Components

- @radix-ui/react-collapsible (^1.1.12)
- @radix-ui/react-dialog (^1.1.15)
- @radix-ui/react-label (^2.1.8)
- @radix-ui/react-progress (^1.1.8)
- @radix-ui/react-scroll-area (^1.2.10)
- @radix-ui/react-select (^2.2.6)
- @radix-ui/react-separator (^1.1.8)
- @radix-ui/react-slot (^1.2.4)
- @radix-ui/react-tooltip (^1.2.8)

## State Management

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Global State** | Zustand | ^5.0.8 | Lightweight state management |
| **Local Storage** | Browser localStorage | Native | Client-side persistence |
| **React State** | useState, useEffect | React 19 | Component-level state |

## External Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **OpenRouter API** | AI translation & content generation | API Key in .env |

## Development Tools

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Linter** | ESLint | ^9.x | Code quality |
| **ESLint Config** | eslint-config-next | 16.0.3 | Next.js specific rules |
| **Type Checking** | TypeScript | ^5.x | Static type analysis |

## Data Storage

| Type | Technology | Location | Purpose |
|------|-----------|----------|---------|
| **Vocabulary Data** | JSON files | `/data/words/level-{1-4}.json` | Word definitions by difficulty |
| **User Settings** | localStorage | Browser | User preferences & progress |
| **Paragraph States** | localStorage | Browser | Learning progress tracking |
| **Sentence Progress** | localStorage | Browser | Daily learning cadence |

## TypeScript Configuration

- **Target:** ES2017
- **Module System:** ESNext with bundler resolution
- **JSX:** react-jsx
- **Strict Mode:** Enabled
- **Path Aliases:** `@/*` maps to project root

## Build & Deployment

| Aspect | Configuration |
|--------|---------------|
| **Build Command** | `npm run build` |
| **Dev Server** | `npm run dev` |
| **Prod Server** | `npm start` |
| **Port** | 3000 (default) |
| **Output** | Static optimization where possible |

## Architecture Patterns

### Design System
- **Component Library Pattern:** shadcn/ui (New York style)
- **Base Color:** Neutral
- **CSS Variables:** Enabled for theme customization
- **Icon Library:** Lucide React

### File Organization
```
app/              # Next.js App Router
├── api/          # API routes
├── layout.tsx    # Root layout
└── page.tsx      # Home page

components/       # React components
├── ui/           # Design system components
├── features/     # Feature-specific components
└── [shared]      # Shared components

lib/              # Business logic & utilities
├── stores/       # Zustand stores
├── services/     # API & external services
└── utils/        # Helper functions

types/            # TypeScript definitions
hooks/            # Custom React hooks
data/             # Static data files
```

### State Management Strategy
1. **Zustand** for global app state (settings, regenerate functions)
2. **localStorage** for persistence across sessions
3. **React hooks** for component-local state
4. **Custom hooks** for reusable stateful logic

### API Integration
- **Pattern:** Server-side API routes (`/app/api`)
- **External API:** OpenRouter for AI-powered translations
- **Authentication:** API key-based (stored in .env)

## Browser Compatibility

- Modern browsers with ES2017+ support
- localStorage API required
- Web Speech API (optional, for voice features)

## Security Considerations

- API keys stored in `.env` file (not committed)
- Client-side only (no server-side secrets exposed)
- CORS handled by Next.js
- No sensitive data stored in localStorage (only learning progress)

## Performance Optimizations

- **React 19:** Concurrent rendering features
- **Next.js 16:** Turbopack for faster builds
- **Code Splitting:** Automatic via Next.js
- **Image Optimization:** Next.js Image component
- **Font Optimization:** next/font with Geist font family

---

**Next Steps:**
- Review [Architecture Documentation](./architecture.md) for component structure
- See [Component Inventory](./component-inventory.md) for UI component catalog
- Check [Development Guide](./development-guide.md) for setup instructions
