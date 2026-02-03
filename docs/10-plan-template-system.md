# Generator V3.1 - Template System

## Problem
- Current: Every review mentions business name explicitly
- Current: All reviews are similar length (2-3 sentences)
- Need: More variety to look natural

## Solution: Template Library

### 10 Review Templates

| # | Style | Length | Business Name | Example Pattern |
|---|-------|--------|---------------|-----------------|
| 1 | Quick praise | 1 line | ❌ None | "Great service, very satisfied." |
| 2 | Name mention | 1 line | ✅ Start | "{Name} is amazing! Loved it." |
| 3 | End credit | 2 lines | ✅ End | "Perfect experience... Thanks to {Name}!" |
| 4 | Casual chat | 2 lines | ❌ None | "Went there last week, really nice." |
| 5 | Detailed review | 3 lines | ✅ Start | "{Name} exceeded expectations..." |
| 6 | Story style | 3 lines | ❌ None | "Was looking for... found this place..." |
| 7 | Enthusiastic | 2 lines | ✅ Middle | "Absolutely love {Name}! Will return." |
| 8 | Professional | 2 lines | ❌ None | "Quality service, professional staff." |
| 9 | Question hook | 2 lines | ✅ Start | "Looking for X? Try {Name}. Highly recommend." |
| 10 | Short & sweet | 1 line | ❌ None | "Excellent. 👍" |

### Implementation Plan

1. **Create Template Registry** (`src/lib/review-templates.ts`)
   - Define 10 templates with: id, name, length (1-3), useBusinessName (boolean|position)
   - Each template has prompt instructions

2. **Update Gemini Service**
   - Add `generateFromTemplate()` function
   - Randomly select template per review
   - Follow template's length/name rules

3. **UI Improvements**
   - Progress bar matches theme (indigo/purple gradient)
   - Optional: Template preview selector

## Workflow
1. User clicks Generate
2. For each review:
   - Pick random template (1-10)
   - Generate according to template rules
   - Return with template info
