# Live Check Automation Plugin

A modular, reusable automation system for verifying if Google Reviews are live and visible.

## 🎯 Features

- **Automated Review Verification**: Headless browser automation using Playwright
- **Concurrent Processing**: Queue system with configurable concurrency (default: 3 threads)
- **Screenshot Capture**: Automatically saves proof of live reviews
- **Status Tracking**: Real-time status updates with database persistence
- **Modular Architecture**: Plugin-like design, easy to enable/disable

## 📦 Installation

### 1. Install Playwright

```bash
npm install playwright
npx playwright install chromium
```

### 2. Run Database Migration

```bash
npx prisma db push
# or
npx prisma migrate dev --name add-live-check-fields
```

### 3. Create Screenshots Directory

```bash
mkdir -p public/screenshots
```

## 🚀 Usage

### From UI

1. Navigate to **Reviews** page
2. Select reviews or choose "Check All"
3. Click **Live Check** dropdown
4. System will process reviews in background
5. Status updates appear automatically

### From API

```typescript
// POST /api/automation/check
{
  "reviewIds": ["review-id-1", "review-id-2"]
}

// GET /api/automation/status
// Returns: { pending: 2, processing: 1 }
```

### Programmatically

```typescript
import { automationService } from "@/lib/automation";

// Start checks
await automationService.startChecks(["review-id-1", "review-id-2"]);

// Get queue stats
const stats = automationService.getQueueStats();
```

## 🏗️ Architecture

```
src/lib/automation/
├── index.ts          # Public API exports
├── types.ts          # TypeScript definitions
├── queue.ts          # In-memory queue manager
├── checker.ts        # Playwright automation engine
├── service.ts        # Orchestration service
└── README.md         # This file
```

## ⚙️ Configuration

Edit `src/lib/automation/checker.ts`:

```typescript
const config = {
  maxConcurrency: 3,        // Concurrent checks
  timeout: 30000,           // 30 seconds
  screenshotDir: "./public/screenshots",
  headless: true,           // Set false for debugging
};
```

## 🔍 How It Works

1. **Queue**: Reviews added to in-memory queue
2. **Concurrency**: Max 3 concurrent browser instances
3. **Check Process**:
   - Launch headless Chrome
   - Navigate to review link
   - Handle cookie consent
   - Verify review presence (multiple strategies)
   - Take screenshot if live
4. **Database Update**: Status saved with timestamp
5. **UI Refresh**: Real-time updates via polling

## 📊 Check Status Values

- `CHECKING` - In progress
- `LIVE` - Review found and visible
- `MISSING` - Review not found
- `ERROR` - Check failed

## 🧪 Testing

### Manual Test

1. Add a review with live link
2. Click "Live Check" → "Check Selected"
3. Watch server logs for progress
4. Verify status updates to "LIVE"
5. Check screenshot in `public/screenshots`

### Test Error Case

1. Add review with fake link
2. Run check
3. Status should update to "MISSING"

## 🎨 Customization

### Add Custom Verification Logic

Edit `src/lib/automation/checker.ts`:

```typescript
private async verifyReviewPresence(page: Page): Promise<boolean> {
  // Add your custom selectors here
  const myCustomSelector = '[data-my-review]';
  const element = await page.locator(myCustomSelector).first();
  if (await element.isVisible({ timeout: 3000 })) {
    return true;
  }
  // ...existing strategies
}
```

### Change Queue Concurrency

Edit `src/lib/automation/service.ts`:

```typescript
this.queue = new AutomationQueue(5); // Change from 3 to 5
```

## 🚨 Important Notes

### Deployment

- **VPS/Local**: Works perfectly ✅
- **Serverless (Vercel)**: Long tasks (>10s) will timeout ❌
  - Solution: Use external queue service (Bull, BullMQ)
  - Or use dedicated background worker

### Rate Limiting

Google may rate-limit automated requests. Recommendations:

- Keep concurrency ≤ 3
- Add delays between checks (already implemented)
- Use residential proxies for large batches

### Browser Dependencies

Playwright downloads Chromium (~100MB). Ensure sufficient disk space.

## 🔌 Enable/Disable Plugin

### Disable

1. Remove `LiveCheckButton` from `reviews/page.tsx`
2. Hide check status badges
3. Keep database fields for historical data

### Re-enable

1. Add components back to UI
2. Ensure Playwright installed
3. Ready to use!

## 📝 Database Schema

```prisma
model Review {
  // ... existing fields
  lastCheckedAt  DateTime? @map("last_checked_at")
  checkStatus    String?   @map("check_status")
  screenshotPath String?   @map("screenshot_path")
}
```

## 🛠️ Troubleshooting

### "Browser not found"

```bash
npx playwright install chromium
```

### Screenshots not saving

```bash
mkdir -p public/screenshots
chmod 755 public/screenshots
```

### Checks never complete

Check server logs for errors. Common causes:

- Timeout too short
- Network issues
- Invalid review links

### Memory issues

Reduce concurrency in `service.ts`:

```typescript
this.queue = new AutomationQueue(1); // One at a time
```

## 📚 API Reference

### `automationService.startChecks(reviewIds: string[])`

Adds reviews to queue and starts processing.

**Returns**: `Promise<{ success: boolean; message: string }>`

### `automationService.getQueueStats()`

Returns current queue statistics.

**Returns**: `{ pending: number; processing: number }`

## 🎯 Future Enhancements

- [ ] Webhook notifications on completion
- [ ] Scheduled checks (cron jobs)
- [ ] Bulk export of screenshots
- [ ] Advanced verification strategies
- [ ] Proxy rotation support
- [ ] Redis-based queue for serverless

## 📄 License

Part of ClientFlow GMB Review Manager
