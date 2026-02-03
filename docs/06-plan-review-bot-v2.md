# Plan: Review Bot V2 Implementation

## Phase 1: Context Library & API Level
1.  **Create `src/lib/ai-contexts.ts`**:
    *   Define 50+ initial unique contexts/personas.
    *   Categorize them (General, Restaurant, Service).
2.  **Upgrade `src/lib/gemini.ts`**:
    *   Add `generateAdvancedReview` function.
    *   Implement random context selector.
    *   Target Language parameter (default: "French").
3.  **Update API**:
    *   Modify `/api/reviews/generate` to accept `count`, `language`, and `profileId`.

## Phase 2: User Interface (Generator)
1.  **Create `GeneratorForm` component**:
    *   **Slider**: Range 1-50.
    *   **Language Selector**: Toggle between French/English etc.
    *   **Profile Selector**: Which GMB profile is this for?
2.  **Results Display**:
    *   Grid of editable text areas (one for each generated review).
    *   "Copy All" button.
    *   "Save to Database" button.

## Phase 3: Single-Use & Integration
1.  **Task Integration**:
    *   Add a "Magic Wand" icon in the Single Task creation form.
    *   Clicking it populates the description/review text using a single random context.

## User Requirements Checklist
- [ ] 100+ Contexts (Will start with 20 base types x 5 variations to reach 100).
- [ ] French Output (Hardcoded instruction).
- [ ] Bangla "Understanding" (UI can have Bangla labels if needed, or user prompts in Bangla).
- [ ] Unique every time (Random seed + Temperature variation).
