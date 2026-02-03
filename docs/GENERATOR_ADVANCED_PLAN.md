# Generator Advanced Plan - Better AI Output

## 🎯 Goal
Improve AI-generated reviews to be more natural, diverse, and undetectable.

---

## Phase 1: Multi-Persona System

### 1.1 Customer Personas
Create diverse customer profiles that influence writing style:

| Persona | Characteristics | Example Pattern |
|---------|-----------------|-----------------|
| **Young Professional** | Casual, emoji use, brief | "Super impressed! The team was 🔥" |
| **Senior Customer** | Formal, detailed, traditional | "I have been a customer for many years..." |
| **Busy Parent** | Practical, time-focused | "Quick service, kid-friendly, will return" |
| **Tech Enthusiast** | Feature-focused, comparative | "Better than X, loved the Y feature" |
| **First-Time Visitor** | Discovery tone, surprise | "Just discovered this place and wow..." |

### 1.2 Emotion Spectrum
- Very Happy → Happy → Satisfied → Neutral
- Vary enthusiasm levels to avoid all reviews sounding identical

---

## Phase 2: Anti-AI Detection Techniques

### 2.1 Human Imperfection Patterns
```
- Occasional minor typos (1 in 10 reviews)
- Incomplete sentences sometimes
- Varying capitalization
- Natural filler words ("um", "like", "honestly")
- Regional expressions based on location
```

### 2.2 Sentence Structure Variation
- Mix short and long sentences
- Vary paragraph lengths (1-3 sentences)
- Different opening styles:
  - Question: "Looking for a great...?"
  - Statement: "Amazing experience."
  - Time reference: "Visited last week..."

### 2.3 Authenticity Markers
- Reference specific details (staff names, dishes, features)
- Include minor criticisms (2-star to 5-star feel more real)
- Mention weather, time of day, occasion
- Local references (nearby landmarks, events)

---

## Phase 3: Keyword Optimization

### 3.1 SEO Keywords for GMB
- Primary keyword (business type)
- Location keywords (city, neighborhood)
- Service keywords (specific offerings)
- Emotion keywords (helpful, friendly, professional)

### 3.2 Keyword Density
- 1-2 keywords per review naturally
- Avoid keyword stuffing
- Use synonyms and related terms

---

## Phase 4: Template Intelligence

### 4.1 Dynamic Template Selection
```
Input: Business Category + Rating + Persona
Output: Best matching template

Example:
- Restaurant + 5-star + Young Professional → Casual food enthusiast template
- Law Office + 5-star + Senior → Formal professional template
```

### 4.2 Template Scoring
Score templates based on:
- Usage frequency (avoid overuse)
- Success rate (reviews that stayed live)
- Category match strength
- Length appropriateness

---

## Phase 5: Context Learning

### 5.1 Business Context Extraction
From GMB profile:
- Business hours → "Great that they're open late!"
- Photos → Reference specific visual elements
- Menu/Services → Mention specific offerings
- Existing reviews → Avoid duplicating points

### 5.2 Competitor Analysis
- What successful reviews in the category include
- Common praise points
- Unique differentiators to highlight

---

## Phase 6: Quality Assurance

### 6.1 AI Detection Check
Before saving, run through:
- Perplexity check (word predictability)
- Burstiness check (sentence variation)
- Common AI phrase detection

### 6.2 Similarity Prevention
- Track generated phrases per profile
- Prevent similar reviews for same business
- Cross-reference with existing reviews

### 6.3 Readability Metrics
- Grade level: 6-10 (general audience)
- Sentence length: 8-25 words average
- Flesch reading score: 60-80

---

## Implementation Priority

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| P1 | Multi-Persona System | Medium | High |
| P1 | Template Intelligence | Medium | High |
| P2 | Anti-AI Detection | High | Critical |
| P2 | Quality Assurance | Medium | High |
| P3 | Keyword Optimization | Low | Medium |
| P3 | Context Learning | High | Medium |

---

## Technical Implementation

### 6.1 New API Endpoints
```
POST /api/reviews/generate/advanced
- persona: string (optional)
- antiAI: boolean (default: true)
- keywords: string[] (optional)
- emotion: string (optional)
```

### 6.2 Database Schema Updates
```prisma
model ReviewPersona {
  id          String   @id @default(cuid())
  name        String
  description String
  patterns    Json     // Writing patterns
  phrases     Json     // Common phrases
  
  @@map("review_personas")
}

model GeneratedReview {
  id          String   @id @default(cuid())
  reviewId    String?
  profileId   String
  
  // Quality metrics
  perplexity  Float?
  burstiness  Float?
  aiScore     Float?   // 0-1, lower = more human
  
  // Tracking
  persona     String?
  template    String?
  
  @@map("generated_reviews")
}
```

### 6.3 Prompt Engineering
```
System: You are a {persona} customer writing a review.
Context: {business_context}
Requirements: 
- Sound natural with slight imperfections
- Include: {keywords}
- Vary sentence lengths
- Maximum {lines} sentences
- Emotion level: {emotion}

Write a review that would pass AI detection.
```

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| AI Detection Pass Rate | >95% | Unknown |
| Review Diversity Score | >0.8 | Unknown |
| User Satisfaction | >4.5/5 | Unknown |
| Live Rate | >90% | Unknown |

---

## Next Steps

1. **Research**: Test current reviews with AI detectors
2. **Prototype**: Build multi-persona system
3. **Test**: A/B test with real reviews
4. **Iterate**: Refine based on detection rates
