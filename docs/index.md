# Documentation Index - Indo Learning App

**Generated:** 2025-11-27T06:01:12+08:00  
**Documentation Version:** 1.0.0  
**Project Version:** 0.1.0

---

## 📋 Quick Navigation

👉 **Start Here:** [Project Overview](./project-overview.md)  
🏗️ **For Developers:** [Development Guide](./development-guide.md)  
📐 **System Design:** [Architecture](#architecture-documentation)  
🧩 **Component Reference:** [Component Inventory](./component-inventory.md)

---

## Project Information

### Overview

**Project Name:** Indo Learning App  
**Type:** Web Application (Next.js + React)  
**Purpose:** Interactive Indonesian language learning platform

**Key Features:**
- 📖 Enhanced reading interface with day-based learning
- 📚 4-level vocabulary system (5,000+ words)
- 🤖 AI-powered translations via OpenRouter
- 📊 Progress tracking and statistics
- 🎨 Modern dark theme with aqua accents

### Quick Reference

| Aspect | Details |
|--------|---------|
| **Framework** | Next.js 16.0.3 (App Router) |
| **Language** | TypeScript 5.x |
| **UI** | React 19.2.0 + Tailwind CSS v4 |
| **Components** | shadcn/ui + Radix UI |
| **State** | Zustand + localStorage |
| **AI Service** | OpenRouter API |

---

## 📚 Core Documentation

### Essential Reads

1. **[Project Overview](./project-overview.md)**
   - Executive summary
   - Features and goals
   - Technology summary
   - Project structure
   - Current status

2. **[Development Guide](./development-guide.md)**
   - Setup and installation
   - Development workflow
   - Coding standards
   - Common tasks
   - Troubleshooting

3. **[Technology Stack](./technology-stack.md)**
   - Framework details
   - UI & styling libraries
   - State management
   - External services
   - Build configuration

---

## 🏗️ Architecture Documentation

### System Design

4. **[Architecture](../ARCHITECTURE.md)** (Existing)
   - Component hierarchy
   - Data flow diagrams
   - State management patterns
   - File dependencies
   - Module interactions
   - Refactoring documentation

5. **[Source Tree Analysis](./source-tree-analysis.md)**
   - Complete directory structure
   - Critical directories explained
   - Entry points and file organization
   - Dependency flow
   - Path aliases

---

## 🧩 Component & API Reference

### Implementation Details

6. **[Component Inventory](./component-inventory.md)**
   - All 24 components cataloged
   - UI components (17 files)
   - Feature components (7 files)
   - Component hierarchy
   - Usage patterns
   - Props overview

7. **[API Documentation](./api-documentation.md)**
   - Internal API routes (/api/words)
   - OpenRouter integration
   - Word service functions
   - Error handling
   - Client-side API layer

8. **[Data Models](./data-models.md)**
   - Word data model (WordEntry)
   - Reading text models
   - Application state structure
   - localStorage schema
   - Data relationships

---

## 📖 Existing Documentation

### Legacy Documentation (Project Root)

9. **[README.md](../README.md)**
   - Standard Next.js project README
   - Getting started guide
   - Basic commands

10. **[TRANSLATION_MODELS.md](../TRANSLATION_MODELS.md)**
    - Supported translation models
    - Model selection guidance

### Refactoring Documentation

11. **[README_REFACTORING.md](../README_REFACTORING.md)**
    - Refactoring project summary
    
12. **[REFACTORING_GUIDE.md](../REFACTORING_GUIDE.md)**
    - Step-by-step refactoring process

13. **[REFACTORING_CHECKLIST.md](../REFACTORING_CHECKLIST.md)**
    - Task checklist and progress

14. **[REFACTORING_SUMMARY.md](../REFACTORING_SUMMARY.md)**
    - Results and improvements

---

## 🚀 Getting Started Paths

### For Different Roles

#### 👨‍💻 New Developer

**Recommended Reading Order:**
1. [Project Overview](./project-overview.md) - Understand the app
2. [Development Guide](./development-guide.md) - Setup environment
3. [Source Tree Analysis](./source-tree-analysis.md) - Navigate codebase
4. [Component Inventory](./component-inventory.md) - UI components
5. [API Documentation](./api-documentation.md) - API usage

**First Tasks:**
- Clone repo and run `npm install`
- Read `Development Guide` setup section
- Run `npm run dev` and explore app
- Review component hierarchy
- Make a small change to test workflow

---

#### 🎨 UI/UX Designer

**Recommended Reading:**
1. [Project Overview](./project-overview.md) - App features
2. [Component Inventory](./component-inventory.md) - UI components
3. [Technology Stack](./technology-stack.md) - Design system details

**Key Info:**
- Design System: shadcn/ui (New York style)
- Theme: Dark mode with aqua accents
- Icons: Lucide React
- CSS: Tailwind CSS v4 with custom variables

---

#### 📊 Product Manager / Analyst

**Recommended Reading:**
1. [Project Overview](./project-overview.md) - Features and status
2. [Data Models](./data-models.md) - Data structure
3. [ARCHITECTURE.md](../ARCHITECTURE.md) - System design

**Key Metrics:**
- 5,000+ words across 4 difficulty levels
- Day-based learning progression
- Progress tracking with statistics
- AI-powered content generation

---

#### 🔧 DevOps / Deployment

**Recommended Reading:**
1. [Development Guide](./development-guide.md) - Build commands
2. [Technology Stack](./technology-stack.md) - Runtime requirements
3. [API Documentation](./api-documentation.md) - External dependencies

**Deployment Checklist:**
- Node.js v20+ required
- Set `NEXT_PUBLIC_OPENROUTER_API_KEY` env var
- Run `npm run build`
- Deploy `.next/` output
- Configure CDN for `/public` assets

---

## 📂 Documentation Structure

```
docs/
├── index.md                      # This file (master index)
├── project-overview.md           # Project summary
├── development-guide.md          # Developer setup
├── technology-stack.md           # Tech stack details
├── component-inventory.md        # Component catalog
├── api-documentation.md          # API reference
├── data-models.md                # Data structures
├── source-tree-analysis.md       # Directory structure
└── project-scan-report.json      # Workflow state

../ (Project Root)
├── ARCHITECTURE.md               # Architecture diagrams
├── README.md                     # Project README
├── TRANSLATION_MODELS.md         # Translation models
├── REFACTORING_*.md              # Refactoring docs (4 files)
└── [source code]
```

---

## 🔍 Quick Lookups

### Find Information By Topic

| Topic | Document |
|-------|----------|
| **Installation** | [Development Guide § Installation](./development-guide.md#installation) |
| **Project Structure** | [Source Tree Analysis § Directory Structure](./source-tree-analysis.md#complete-directory-structure) |
| **Component List** | [Component Inventory § UI Components](./component-inventory.md#ui-components) |
| **API Endpoints** | [API Documentation § API Routes](./api-documentation.md#internal-api-routes) |
| **Word Schema** | [Data Models § Word Data Model](./data-models.md#word-data-model) |
| **Tech Stack** | [Technology Stack § Core Technologies](./technology-stack.md#core-technologies) |
| **State Management** | [Architecture § State Management Flow](../ARCHITECTURE.md#state-management-flow) |
| **Build Commands** | [Development Guide § Development Commands](./development-guide.md#development-commands) |
| **Refactoring Notes** | [ARCHITECTURE § Before vs After](../ARCHITECTURE.md#before-vs-after-architecture) |
| **Troubleshooting** | [Development Guide § Troubleshooting](./development-guide.md#troubleshooting) |

---

## 📖 Documentation by Feature

### Reading Interface
- **Overview:** [Project Overview § Key Features](./project-overview.md#key-features)
- **Components:** [Component Inventory § Feature Components](./component-inventory.md#feature-components)
- **Data Model:** [Data Models § Reading Text Data Model](./data-models.md#reading-text-data-model)
- **Architecture:** [ARCHITECTURE § Component Hierarchy](../ARCHITECTURE.md#component-hierarchy)

### Vocabulary System
- **Data Files:** [Source Tree § data/words](./source-tree-analysis.md#-data---static-data)
- **Word Model:** [Data Models § Word Data Model](./data-models.md#word-data-model)
- **API:** [API Documentation § Word Service](./api-documentation.md#word-service-libword-servicets)
- **Components:** [Component Inventory § Word](./component-inventory.md#feature-components)

### AI Integration
- **Service:** [API Documentation § OpenRouter API](./api-documentation.md#openrouter-api)
- **Models:** [Technology Stack § External Services](./technology-stack.md#external-services)
- **Prompts:** `lib/prompt-utils.ts` (see [Source Tree](./source-tree-analysis.md))
- **Word Generation:** [API Documentation § Word AI Service](./api-documentation.md#word-ai-service-libword-aits)

### State Management
- **Overview:** [Technology Stack § State Management](./technology-stack.md#state-management)
- **Store:** [Data Models § Application State](./data-models.md#application-state-model)
- **localStorage:** [Data Models § Storage Schema](./data-models.md#storage-schema)
- **Architecture:** [ARCHITECTURE § State Management Flow](../ARCHITECTURE.md#state-management-flow)

---

## 🎯 Common Use Cases

### "I want to add a new UI component"
1. Read: [Component Inventory § Component Design Patterns](./component-inventory.md#component-design-patterns)
2. Review: [Development Guide § Adding a New Component](./development-guide.md#adding-a-new-component)
3. Check: [Source Tree § components/](./source-tree-analysis.md#-components---react-components)
4. Follow: shadcn/ui conventions

### "I want to modify word data structure"
1. Read: [Data Models § Word Data Model](./data-models.md#word-data-model)
2. Update: `types/word.ts`
3. Migrate: `data/words/*.json` files
4. Update: `lib/word-service.ts` CRUD functions

### "I want to add a new AI model"
1. Read: [API Documentation § OpenRouter API](./api-documentation.md#openrouter-api)
2. Edit: `lib/models.ts`
3. Update: Model selection UI in `components/features/settings-view.tsx`
4. Test: Translation quality

### "I want to understand the architecture"
1. Read: [Project Overview](./project-overview.md)
2. Review: [ARCHITECTURE.md](../ARCHITECTURE.md)
3. Explore: [Source Tree Analysis](./source-tree-analysis.md)
4. Check: [Component Inventory § Component Hierarchy](./component-inventory.md#component-hierarchy)

---

## 🔄 Documentation Maintenance

### Generated Files

These files were auto-generated by the BMad `document-project` workflow:
- ✅ `project-overview.md`
- ✅ `technology-stack.md`
- ✅ `development-guide.md`
- ✅ `component-inventory.md`
- ✅ `api-documentation.md`
- ✅ `data-models.md`
- ✅ `source-tree-analysis.md`
- ✅ `index.md` (this file)

### Manual Files

These files should be maintained manually:
- 📝 `../ARCHITECTURE.md` - Update when architecture changes
- 📝 `../README.md` - Keep synchronized with project
- 📝 `../TRANSLATION_MODELS.md` - Update when adding models
- 📝 Refactoring docs - Archive when complete

### Regeneration

To regenerate this documentation:
```bash
# Run BMad analyst agent
/bmad-bmm-agents-analyst

# Select option 7: document-project
# Choose scan level (Quick/Deep/Exhaustive)
```

---

## 📊 Project Statistics

- **Total Files:** 87 (excluding node_modules, .next, .git)
- **Total Components:** 24 React components
- **UI Components:** 17 (shadcn/ui based)
- **Feature Components:** 7
- **Custom Hooks:** 4
- **Utility Files:** 15 in `/lib`
- **Type Definitions:** 3 files
- **Vocabulary Words:** ~5,000+ across 4 levels
- **API Routes:** 1 internal (/api/words)
- **Documentation Files:** 8 generated + 6 existing

---

## 🔗 External Resources

### Frameworks & Libraries
- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://docs.pmnd.rs/zustand)

### APIs
- [OpenRouter API](https://openrouter.ai/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

## 📝 Documentation Conventions

### Symbols
- 📁 Directory
- 📄 Markdown file
- ⚙️ Configuration file
- ✅ Completed
- 🔄 In progress
- ⚠️ Warning/note
- 👉 Important reference

### Links
- **Internal:** Relative links within docs folder
- **Project Root:** Links starting with `../`
- **External:** Full URLs to external resources

### Code Blocks
```typescript
// TypeScript code samples
interface Example {
  property: string
}
```

---

## ❓ Need Help?

### Can't Find What You're Looking For?

1. **Search this index** for keywords
2. **Check [Project Overview](./project-overview.md)** for high-level info
3. **Review [Development Guide](./development-guide.md)** for how-to
4. **Explore [Source Tree](./source-tree-analysis.md)** to locate files
5. **Read inline code comments** in source files

### Documentation Gaps?

If you find the documentation lacking:
1. Note the missing topic
2. Check existing source code for inline docs
3. Consider contributing documentation
4. Re-run `document-project` workflow for fresh scan

---

**Last Generated:** 2025-11-27T06:01:12+08:00  
**Workflow:** BMad Method - document-project (exhaustive scan)  
**Total Documentation Pages:** 8 generated + 6 existing
