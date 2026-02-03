# Feature: AI Review Bot V2

**Implemented:** Jan 31, 2026
**Status:** Complete

## Overview
Advanced AI review generation system with 100+ unique personas for diverse, human-like output in French.

## Key Features
1.  **Context Library** (`src/lib/ai-contexts.ts`): 100 unique personas across 5 categories.
2.  **Advanced Generation** (`src/lib/gemini.ts`): Persona injection, multi-language, temperature variance.
3.  **Generator Page** (`/generator`): Slider (1-50), profile selector, language toggle, hint input.
4.  **API Upgrade** (`/api/reviews/generate`): Supports `useAdvanced`, `language`, `userHint` params.

## Technical Details
- **Personas**: Each persona has a scenario, tone, and focus points.
- **Randomization**: Fisher-Yates shuffle ensures unique contexts per review.
- **French Output**: System instruction forces native French writing.
- **Bangla Input**: UI labels include Bangla; hints can be in any language.

## How to Use
1.  Go to **Generator** in sidebar.
2.  Select a **Profile** (GMB business).
3.  Set **Quantity** (1-50).
4.  Choose **Language** (French default).
5.  Optionally add a **Hint** (e.g., "fast service").
6.  Click **Generate**.
7.  Copy individual reviews or use "Copy All".
