# AI Review Template System - Architecture

**Version:** 1.0  
**Goal:** Scalable, editable template system for human-like review generation

---

## 1. Overview

A database-backed template management system that allows:
- ✏️ **CRUD Operations** - Create, Edit, Delete templates from UI
- 📈 **Continuous Improvement** - Refine prompts day by day
- 🎭 **Rich Context** - Huge persona/scenario library
- 🤖 **AI Optimization** - Best prompting practices built-in

---

## 2. Database Schema

### ReviewTemplate
```prisma
model ReviewTemplate {
  id          String   @id @default(cuid())
  name        String   // "Quick Praise", "Story Style"
  lines       Int      @default(2) // 1, 2, or 3
  
  // Prompt Engineering
  promptInstruction  String   @db.Text // The actual AI instruction
  exampleOutput      String?  @db.Text // Example for preview
  
  // Business Name Handling
  namePosition       String   @default("none") // none, start, middle, end
  
  // Categorization
  category    String?  // "short", "detailed", "casual", "professional"
  tags        String[] // ["friendly", "formal", "emoji"]
  
  // Quality Control
  usageCount  Int      @default(0)
  successRate Float?   // Track which templates work best
  isActive    Boolean  @default(true)
  
  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  user        User     @relation(fields: [userId], references: [id])
}
```

### ReviewContext (Personas & Scenarios)
```prisma
model ReviewContext {
  id          String   @id @default(cuid())
  type        String   // "persona" or "scenario"
  
  // Content
  title       String   // "Busy Mom", "First Time Visitor"
  content     String   @db.Text // The actual context text
  tone        String?  // "friendly", "professional", "casual"
  
  // Categorization
  category    String?  // "RESTAURANT", "SERVICE", "RETAIL"
  tags        String[]
  
  // Control
  isActive    Boolean  @default(true)
  usageCount  Int      @default(0)
  
  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  user        User     @relation(fields: [userId], references: [id])
}
```

---

## 3. Prompt Engineering Best Practices

### Template Structure
```
[PERSONA] - Who is writing?
[SCENARIO] - What happened?
[TEMPLATE RULES] - Length, name usage, style
[USER HINT] - Optional specific request
```

### Good Prompt Examples

**Template: Ultra Short (1 line, no name)**
```
Write just 2-5 words. Very minimal.
DO NOT mention any business name.
Can include ONE emoji.
Examples: "Excellent." | "Perfect! 👍" | "Love it."
```

**Template: Story Style (3 lines, no name)**
```
Write 3 sentences in story style.
DO NOT mention any business name.
Start with "Was looking for..." or "Needed...".
Feel like sharing an experience with a friend.
```

**Template: Enthusiastic Middle (2 lines, name in middle)**
```
Write 2 enthusiastic sentences.
Mention "{businessName}" in the MIDDLE of your review.
Use excitement but stay authentic.
```

### Context Examples

**Persona: Busy Professional**
```
You are a busy professional with limited time.
You value efficiency and quality.
You don't write long reviews, prefer concise feedback.
```

**Scenario: After Hours Visit**
```
You visited after a long work day.
The experience was a pleasant surprise.
You want to share appreciation briefly.
```

---

## 4. UI Components

### Templates Admin Page (`/admin/templates`)
- Grid view of all templates
- Create/Edit modal with:
  - Name, Lines (1-3), Category
  - Prompt instruction textarea
  - Example output preview
  - Name position selector
  - Tags input
- Delete with confirmation
- Test button (generate sample)
- Usage stats display

### Contexts Admin Page (`/admin/contexts`)
- Tab view: Personas | Scenarios
- Create/Edit modal
- Category filter
- Bulk import option

---

## 5. API Endpoints

```
GET    /api/templates         - List all templates
POST   /api/templates         - Create template
GET    /api/templates/:id     - Get single
PUT    /api/templates/:id     - Update template
DELETE /api/templates/:id     - Delete template

GET    /api/contexts          - List contexts
POST   /api/contexts          - Create context
PUT    /api/contexts/:id      - Update context
DELETE /api/contexts/:id      - Delete context
```

---

## 6. Generator Integration

```typescript
// 1. Fetch active templates from DB
const templates = await prisma.reviewTemplate.findMany({
  where: { isActive: true }
});

// 2. Select template (random or specific)
const template = selectedId 
  ? templates.find(t => t.id === selectedId)
  : templates[Math.floor(Math.random() * templates.length)];

// 3. Fetch random context
const persona = await getRandomContext("persona");
const scenario = await getRandomContext("scenario");

// 4. Build prompt
const prompt = buildPrompt({ template, persona, scenario, businessName, userHint });

// 5. Generate & track usage
await prisma.reviewTemplate.update({
  where: { id: template.id },
  data: { usageCount: { increment: 1 } }
});
```

---

## 7. Future Improvements

- [ ] **A/B Testing** - Compare template performance
- [ ] **AI Suggestions** - Auto-improve underperforming templates
- [ ] **Import/Export** - Share template packs
- [ ] **Versioning** - Track template changes
- [ ] **Language-Specific** - Templates per language
- [ ] **Category Matching** - Auto-select by business type

---

## 8. Migration Plan

1. Create Prisma schema
2. Run migration
3. Seed with existing 10 templates + 100 contexts
4. Build Admin UI
5. Update Generator to use DB
6. Deprecate hardcoded files
