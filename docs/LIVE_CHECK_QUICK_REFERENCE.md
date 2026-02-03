# Live Check - Quick Reference Card

## 🚀 Installation (One-Time)

```bash
# Option 1: Automated (Recommended)
npm run setup:live-check

# Option 2: Manual
npm install playwright
npx playwright install chromium
npx prisma db push
mkdir public/screenshots
```

## 📱 Usage

### From UI

1. Go to **Reviews** page
2. Select reviews (optional)
3. Click **Live Check** button
4. Choose **Check Selected** or **Check All**

### From Code

```typescript
import { automationService } from "@/lib/automation";

await automationService.startChecks(["review-id-1", "review-id-2"]);
```

### From API

```bash
# Start check
curl -X POST http://localhost:3000/api/automation/check \
  -H "Content-Type: application/json" \
  -d '{"reviewIds": ["review-id-1"]}'

# Check status
curl http://localhost:3000/api/automation/status
```

## 📊 Status Values

| Status | Meaning | Color |
|--------|---------|-------|
| `CHECKING` | In progress | Blue |
| `LIVE` | Found & visible | Green |
| `MISSING` | Not found | Red |
| `ERROR` | Check failed | Orange |

## ⚙️ Configuration

### File Locations

```
src/lib/automation/
├── service.ts    - Change concurrency (line 12)
├── checker.ts    - Change timeout (line 16)
└── README.md     - Full documentation
```

### Common Changes

**Increase concurrency:**
```typescript
// src/lib/automation/service.ts:12
this.queue = new AutomationQueue(5); // Default: 3
```

**Increase timeout:**
```typescript
// src/lib/automation/checker.ts:16
timeout: 60000, // Default: 30000 (30s)
```

**Debug mode (see browser):**
```typescript
// src/lib/automation/checker.ts:18
headless: false, // Default: true
```

## 🔍 Debugging

### Check Logs

```bash
# Start dev server with logs
npm run dev

# Watch for:
✓ Review xxx: LIVE
✗ Review xxx: ERROR
```

### Test Commands

```bash
# Verify Playwright
npx playwright --version

# Test browser
npx playwright test --headed

# Check screenshots
ls public/screenshots
```

### Common Issues

| Problem | Solution |
|---------|----------|
| "Browser not found" | `npx playwright install chromium` |
| Screenshots not saving | `mkdir public/screenshots` |
| High memory usage | Reduce concurrency to 1-2 |
| Timeout errors | Increase timeout value |

## 📐 Architecture

```
User clicks "Live Check"
    ↓
API: /api/automation/check
    ↓
AutomationService (orchestrator)
    ↓
Queue (max 3 concurrent)
    ↓
LiveChecker (Playwright)
    ↓
Database (status update)
    ↓
UI (refresh)
```

## 🎯 Best Practices

✅ **DO:**
- Start with 5-10 reviews
- Check server logs first time
- Keep concurrency ≤ 3
- Monitor memory usage

❌ **DON'T:**
- Run 100+ reviews at once
- Deploy to serverless (use VPS)
- Set concurrency > 5
- Ignore timeout errors

## 📚 Documentation

| File | Content |
|------|---------|
| `SETUP_LIVE_CHECK.md` | Full setup guide |
| `src/lib/automation/README.md` | API documentation |
| `docs/LIVE_CHECK_QUICK_REFERENCE.md` | This file |

## 🛠️ Troubleshooting

### 1. Checks Stuck

```bash
# Check queue status
curl http://localhost:3000/api/automation/status

# Restart server
npm run dev
```

### 2. No Screenshots

```bash
# Check directory
ls public/screenshots

# Check permissions (Linux/Mac)
chmod 755 public/screenshots
```

### 3. Rate Limited

```typescript
// Reduce concurrency
this.queue = new AutomationQueue(1);

// Add delays
await page.waitForTimeout(5000);
```

## 💡 Tips

- **First run**: Test with 1 review
- **Production**: Use VPS, not serverless
- **Large batches**: Split into groups of 10
- **Screenshots**: Check size, delete old ones
- **Monitoring**: Watch server memory

## 🎨 Customization

### Add Custom Selectors

```typescript
// src/lib/automation/checker.ts
private async verifyReviewPresence(page: Page) {
  // Add your selector
  const mySelector = '[data-my-review]';
  if (await page.locator(mySelector).isVisible()) {
    return true;
  }
  // ...existing code
}
```

### Change Screenshot Path

```typescript
// src/lib/automation/checker.ts:14
screenshotDir: "./public/my-screenshots",
```

### Webhook on Complete

```typescript
// src/lib/automation/service.ts
private async updateReviewResult(result: CheckResult) {
  await prisma.review.update({...});

  // Add webhook
  await fetch('https://your-webhook.com', {
    method: 'POST',
    body: JSON.stringify(result),
  });
}
```

## 🔒 Security

- Never expose API routes publicly
- Use authentication (already implemented)
- Don't log review content
- Rotate proxies for large batches
- Monitor for rate limiting

## 📊 Performance

| Metric | Value |
|--------|-------|
| Concurrency | 3 (configurable) |
| Timeout | 30s (configurable) |
| Retry | 2 attempts |
| Memory | ~100MB per browser |
| Speed | ~10-30s per review |

## 🎯 Deployment

| Platform | Status | Notes |
|----------|--------|-------|
| Local Node.js | ✅ Works | Perfect |
| VPS (Digital Ocean, AWS) | ✅ Works | Recommended |
| Vercel Serverless | ❌ No | Timeout issues |
| Heroku | ⚠️ Maybe | Check timeout limits |

---

**Need help?** Check `SETUP_LIVE_CHECK.md` or `src/lib/automation/README.md`
