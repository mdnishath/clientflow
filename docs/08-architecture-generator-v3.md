# Architecture: Generator V3 (Enhanced Workflow)

**Date:** Jan 31, 2026

## User Requirements Summary

### 1. Dual Language Output
- **French**: For client/production use.
- **Bangla**: For user understanding (side-by-side).
- UX Decision: Show French as primary, Bangla as expandable/tooltip.

### 2. One-Click Approve → Review
- Generated review card has **"Approve"** button.
- Click → Saves to `Review` model for that profile.
- Card smoothly animates out of the list.
- No manual copy-paste needed.

### 3. Multi-Profile Selection
- UI shows checkboxes to select multiple profiles.
- Generate for all selected profiles at once.
- Each profile gets its own batch of reviews.

### 4. Queue System with Progress
- Large batches go to a queue.
- Progress bar shows completion.
- Toast notification when all done.

### 5. Inline AI in Add Review Form
- Existing "Add Review" modal has a textarea.
- Add "Magic Wand" icon next to it.
- Click → AI generates text inline.
- User can edit before saving.

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     GENERATOR PAGE                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐     │
│  │ Profile List │   │ Quantity: 10 │   │ Language: FR │     │
│  │ ☑ Pizza A    │   │ ────●─────── │   │ + Bangla ✓   │     │
│  │ ☑ Pizza B    │   │     1    50  │   └──────────────┘     │
│  │ ☐ Salon C    │   └──────────────┘                        │
│  └──────────────┘                                           │
│                    [  GENERATE  ]                           │
├─────────────────────────────────────────────────────────────┤
│  Progress: ████████░░░░ 65%  (13/20)                        │
├─────────────────────────────────────────────────────────────┤
│                     RESULTS                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Profile: Pizza A                                       │ │
│  │ ──────────────────────────────────────────────────────│ │
│  │ 🇫🇷 "Très bon pizza, service rapide..."               │ │
│  │ 🇧🇩 "খুব ভালো পিৎজা, দ্রুত সার্ভিস..."                   │ │
│  │                              [Approve ✓]  [Discard ✗] │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Phase 1: Bangla Translation
- Add `generateWithTranslation()` in `gemini.ts`.
- Returns `{ french: string, bangla: string }`.

### Phase 2: Approve Button
- Add `POST /api/reviews` to create review from approved text.
- Generator page calls this on approve.
- Animate card removal.

### Phase 3: Multi-Profile
- Change UI to show profile checkboxes.
- Generate loop per profile.

### Phase 4: Queue & Progress
- Track `{ total, completed }` state.
- Update progress bar as each completes.

### Phase 5: Inline Magic Wand
- Find existing Review Form component.
- Add "Wand" icon next to textarea.
- On click, call `quickGenerateFromHint()` or full generate.
