# Translation Model Selection - Implementation Summary

## Overview
I've successfully implemented model selection and custom prompt functionality for the Indonesian Learning App. Users can now choose from 8 top-tier AI models from leading providers via OpenRouter.

## Available Models

### Moonshot AI (2 models)
1. **Kimi K2** (`moonshotai/kimi-k2`)
   - Advanced reasoning model

2. **Kimi K2 Thinking** (`moonshotai/kimi-k2-thinking`)
   - Enhanced reasoning with thinking process

### OpenAI (1 model)
3. **GPT-5.1** (`openai/gpt-5.1`)
   - Latest GPT model

### Anthropic (2 models)
4. **Claude Haiku 4.5** (`anthropic/claude-haiku-4.5`)
   - Fast and efficient Claude model

5. **Claude Sonnet 4.5** (`anthropic/claude-sonnet-4.5`)
   - Balanced performance Claude model

### Google (3 models)
6. **Gemini 3 Pro Preview** (`google/gemini-3-pro-preview`)
   - Advanced Gemini model

7. **Gemini 2.5 Flash Preview** (`google/gemini-2.5-flash-preview-09-2025`)
   - Fast Gemini model

8. **Gemini 2.5 Flash Lite Preview** (`google/gemini-2.5-flash-lite-preview-09-2025`)
   - Lightweight Gemini model

## Implementation Details

### Files Created/Modified

1. **`lib/models.ts`** (NEW)
   - Model configuration with all 8 models
   - Default model and prompt settings

2. **`lib/storage.ts`** (MODIFIED)
   - Added `Settings` interface
   - Added `getSettings()` and `saveSettings()` functions
   - Stores user's selected model and custom prompt

3. **`lib/api.ts`** (MODIFIED)
   - Updated `generateTranslation()` to accept model parameter
   - Now uses dynamic model selection instead of hardcoded model

4. **`components/features/settings-view.tsx`** (NEW)
   - Settings UI component
   - Model selection dropdown (grouped by provider)
   - Custom prompt textarea
   - Save/load functionality

5. **`components/ui/select.tsx`** (NEW)
   - Select component using Radix UI primitives
   - Required for the model selection dropdown

6. **`components/features/task-view.tsx`** (MODIFIED)
   - Loads user settings when generating translations
   - Uses selected model and custom prompt

7. **`components/app-header.tsx`** (MODIFIED)
   - Added settings button with icon
   - Positioned next to progress indicators

8. **`components/main-view.tsx`** (MODIFIED)
   - Added settings view state
   - Toggle between task view and settings view

9. **`components/app-sidebar.tsx`** (MODIFIED)
   - Fixed import path for `cn` utility function

## How to Use

### Global Settings (Default for All Tasks)

1. **Access Settings**
   - Click the settings icon (⚙️) in the top-right corner of the header

2. **Select a Model**
   - Choose from the dropdown menu
   - Models are grouped by provider (Moonshot AI, OpenAI, Anthropic, Google)

3. **Customize Prompt** (Optional)
   - Edit the translation prompt to customize how the AI translates
   - Default: "Translate the following text to Indonesian. Keep it simple and natural for a beginner to learn."

4. **Save Settings**
   - Click "Save Settings" button
   - Settings are stored in browser localStorage

### Per-Task Settings (Override for Individual Tasks)

1. **Open a Translation Task**
   - Navigate to any "Generate" type task

2. **Show Translation Settings**
   - Click the "Show Translation Settings" button (with gear icon)
   - This reveals a collapsible panel with task-specific settings

3. **Select Model for This Task**
   - Choose from the dropdown menu
   - Defaults to global setting if not changed

4. **Customize Prompt for This Task**
   - Edit the prompt in the textarea
   - Defaults to global setting or task's default prompt

5. **Generate Translation**
   - Click "Generate Translation" button
   - The task will use your selected model and prompt
   - Settings are specific to this translation session

### Clean Database

- Click the red trash icon (🗑️) in the header
- Confirms before deleting all data (user, tasks, settings)
- Reloads the page to login screen

## Priority Order

When generating translations, the system uses settings in this order:
1. **Per-task settings** (if modified in the task view)
2. **Global settings** (from the settings page)
3. **Default values** (Kimi K2 model and default prompt)


## Default Configuration

- **Default Model**: `moonshotai/kimi-k2`
- **Default Prompt**: "Translate the following text to Indonesian. Keep it simple and natural for a beginner to learn."

## Technical Notes

- Settings are persisted in browser localStorage
- Model selection is applied globally to all translation tasks
- The custom prompt can be overridden per-task if needed
- All models are accessed via OpenRouter API
- Requires `NEXT_PUBLIC_OPENROUTER_API_KEY` environment variable

## Dependencies Added

- `@radix-ui/react-select` - For the model selection dropdown component
