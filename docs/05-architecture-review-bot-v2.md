# Architecture: Review Bot V2 (Advanced AI)

**Goal:** diverse, human-like, multi-language review generation at scale (50-100 texts).

## Core Concepts

### 1. Context Engine (The "Brain")
Instead of one static prompt, we will have a **Context Library** of 100+ distinct "Personas" or "Scenarios".
*   **Structure:** A large JSON/Object collection categorized by business type (Restaurant, Service, Retail, Medical, etc.).
*   **Randomization:** When generating N reviews, the system explicitly picks N *unique* contexts from the library to ensure no two reviews look alike.
*   **Variables:** Contexts will have placeholders like `{businessName}`, `{city}`, `{service}`, `{day_of_week}`.

### 2. Multi-Language Support
*   **System Instruction:** "You are a native French speaker living in France." (for client output).
*   **User Interface:** Labels in English (or Bangla via translation layer if needed), but the *generated content* is strictly French as requested.
*   **Logic:**
    *   Input: "Pizza Shop" (English/Bangla)
    *   Processing: AI thinks in concepts.
    *   Output: "La meilleure pizza de Paris !" (French).

### 3. Scalable Generation
*   **Slider UI:** Allow selecting 1 to 50 (or 100) reviews.
*   **Batching:**
    *   To avoid timeouts, we can't generate 100 in one request.
    *   **Strategy:** Parallel requests of 5-10 reviews each, or a streaming response.
    *   **Display:** Reviews appear card-by-card as they are generated.

### 4. Single-Use Mode
*   A simplified "Quick Generate" box for manual tasks.
*   User types "Fast service, good food" -> AI converts to "Service rapide et nourriture délicieuse, je recommande !"

## Data Flow

```mermaid
graph TD
    User[User Input] -->|Selects Profile, Count, Language| UI[Review Generator UI]
    UI -->|Request| API[API Route /api/gen-ai]
    API -->|Get Random Contexts| ContextLib[Context Library (100+ Prompts)]
    ContextLib -->|Selected Prompts| Gemini[Google Gemini AI]
    Gemini -->|Generated French Text| API
    API -->|List of Reviews| UI
    UI -->|User Edits/Saves| DB[Database]
```

## Prompt Engineering Strategy
We will use **Few-Shot Prompting** with **Persona Injection**.
*   *Persona A:* "Busy mom, quick lunch."
*   *Persona B:* "Food critic, detailed analysis."
*   *Persona C:* "Tourist, excited about location."
*   *Persona D:* "Local regular, concise."

## Database Changes
No schema changes required. Generated text is stored in `Review` model as `reviewText`.
