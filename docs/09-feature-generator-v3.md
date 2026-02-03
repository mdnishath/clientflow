# Feature: Generator V3 (Advanced Workflow)

**Implemented:** Jan 31, 2026
**Status:** Complete

## Features Implemented

### 1. Multi-Profile Selection
- Checkbox list to select multiple profiles at once.
- "Select All" / "Deselect All" toggle.
- Generates reviews for each selected profile.

### 2. Dual Language Output
- **French (🇫🇷)**: Primary output for clients.
- **Bangla (🇧🇩)**: Translation for user understanding.
- Toggle button on each card to show/hide Bangla.

### 3. Sequential Queue with Progress
- Large batches processed one-by-one.
- Progress bar shows `X/Y (Z%)`.
- Reviews appear as they complete.

### 4. Approve → Save Workflow
- **Approve & Save** button on each card.
- Saves directly to Review table for that profile.
- Card smoothly removed from list after approve.
- **Discard** button to remove without saving.

### 5. Magic Wand in Review Form
- "AI Generate" button next to Review Text field.
- Uses notes as hint if provided.
- Generates French text inline.

## Files Modified/Created
- `src/lib/gemini.ts`: Added `generateDualLanguage()`, `generateBatchDualLanguage()`.
- `src/app/api/reviews/generate/dual/route.ts`: New API for dual-language generation.
- `src/app/(dashboard)/generator/page.tsx`: Complete V3 UI.
- `src/components/reviews/review-form.tsx`: Added Magic Wand button.
- `src/components/ui/checkbox.tsx`: New shadcn component.
- `src/components/ui/progress.tsx`: New shadcn component.

## How to Use
1. Go to **Generator** in sidebar.
2. Select profiles (single or multiple).
3. Set quantity per profile.
4. Optional: Add hint in Notes field.
5. Click **Generate**.
6. View French text, toggle Bangla for translation.
7. Click **Approve & Save** for good reviews.
8. Click ❌ to discard bad ones.
