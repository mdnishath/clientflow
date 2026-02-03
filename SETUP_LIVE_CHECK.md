# Live Check Feature - Setup Guide

## 🎯 Overview

This guide will help you set up the **Live Check** automation feature for verifying Google Reviews.

## ✅ Pre-requisites

- Node.js installed
- PostgreSQL database running
- Project already set up

## 📋 Installation Steps

### Step 1: Install Playwright

```bash
# Install playwright package
npm install playwright

# Install Chromium browser (required)
npx playwright install chromium
```

**Note**: Playwright will download Chromium (~100MB). This only needs to be done once.

### Step 2: Database Migration

Run the Prisma migration to add new fields:

```bash
# Push schema changes to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

This adds the following fields to the `Review` model:

- `lastCheckedAt` - When the review was last checked
- `checkStatus` - Current check status (LIVE/MISSING/ERROR/CHECKING)
- `screenshotPath` - Path to screenshot (if live)

### Step 3: Create Screenshots Directory

```bash
# Create directory for screenshots
mkdir public/screenshots

# On Windows (PowerShell)
New-Item -ItemType Directory -Force -Path "public/screenshots"
```

### Step 4: Verify Installation

Start the development server:

```bash
npm run dev
```

Navigate to `http://localhost:3000/reviews` and look for the **Live Check** button.

## 🚀 Usage

### Basic Usage

1. Go to **Reviews** page
2. Select one or more reviews (or use "Check All")
3. Click **Live Check** dropdown
4. Choose:
   - **Check Selected** - Only selected reviews
   - **Check All** - All reviews on current page
5. Watch status updates in real-time

### Status Indicators

Reviews will show a badge with their check status:

- **Live ✓** (Green) - Review is live and visible
- **Missing** (Red) - Review not found
- **Checking...** (Blue) - Check in progress
- **Error** (Orange) - Check failed

Click on the status badge to see:

- Last check timestamp
- Screenshot (if available)

## ⚙️ Configuration

### Adjust Concurrency

Edit `src/lib/automation/service.ts`:

```typescript
// Line 12 - Change from 3 to your desired value
this.queue = new AutomationQueue(3); // 3 concurrent checks
```

**Recommendations:**

- Local development: 3-5
- Production: 2-3 (to avoid rate limiting)

### Adjust Timeout

Edit `src/lib/automation/checker.ts`:

```typescript
// Line 16 - Timeout in milliseconds
timeout: 30000, // 30 seconds
```

### Enable Debug Mode (See Browser)

Edit `src/lib/automation/checker.ts`:

```typescript
// Line 18 - Set to false to see browser
headless: false,
```

## 🧪 Testing

### Test with Known Live Review

1. Add a review with a valid Google Review link
2. Click **Live Check** → **Check Selected**
3. Wait 10-30 seconds
4. Status should update to **Live ✓**
5. Click badge to see screenshot

### Test with Invalid Link

1. Add a review with a fake/invalid link
2. Run check
3. Status should update to **Missing** or **Error**

## 🔍 Troubleshooting

### Issue: "Cannot find module 'playwright'"

**Solution:**

```bash
npm install playwright
```

### Issue: "Browser not found"

**Solution:**

```bash
npx playwright install chromium
```

### Issue: Screenshots not saving

**Solution:**

```bash
# Check directory exists
ls public/screenshots

# Check permissions (Linux/Mac)
chmod 755 public/screenshots

# On Windows, ensure directory is not read-only
```

### Issue: Checks stuck at "Checking..."

**Possible causes:**

1. **Timeout too short** - Increase in `checker.ts`
2. **Network issues** - Check internet connection
3. **Invalid links** - Verify review links are correct
4. **Server logs** - Check console for errors

**Debug:**

```bash
# Run with logs visible
npm run dev

# Check server console for error messages
```

### Issue: High memory usage

**Solution:**

Reduce concurrency to 1 or 2 in `service.ts`:

```typescript
this.queue = new AutomationQueue(1);
```

## 🌐 Deployment

### VPS / Local Node.js Server

✅ **Works perfectly!** No changes needed.

### Vercel Serverless

⚠️ **Not recommended** - Long-running tasks (>10s) will timeout.

**Alternatives:**

1. Use external service (Puppeteer on Cloud Run)
2. Use background jobs (Vercel Cron + Queue)
3. Deploy to VPS instead

## 🎨 Customization

### Add More Verification Strategies

Edit `src/lib/automation/checker.ts` → `verifyReviewPresence()` method:

```typescript
// Add custom selector
const customIndicator = '[data-my-custom-selector]';
const element = await page.locator(customIndicator).first();
if (await element.isVisible({ timeout: 3000 })) {
  return true;
}
```

### Change Screenshot Quality

Edit `src/lib/automation/checker.ts` → `takeScreenshot()` method:

```typescript
await page.screenshot({
  path: filepath,
  fullPage: true, // Capture entire page
  quality: 90, // For JPEG format
});
```

### Disable Feature (Keep Code)

Remove from `reviews/page.tsx`:

```typescript
// Comment out or remove this line
<LiveCheckButton ... />

// Comment out badge
<CheckStatusBadge ... />
```

Database fields remain for historical data.

## 📊 Understanding the Queue

The system uses an **in-memory queue** with concurrency control:

```
Reviews → Queue → [Worker 1] → Browser → Check → DB Update
                  [Worker 2] → Browser → Check → DB Update
                  [Worker 3] → Browser → Check → DB Update
```

- Max 3 concurrent checks (configurable)
- Failed checks retry up to 2 times
- Status updates in real-time

## 🔒 Security Notes

### Rate Limiting

Google may block automated requests if too aggressive:

- Keep concurrency ≤ 3
- Don't run on 100+ reviews at once
- Add delays between batches

### Proxies (Optional)

For large batches, consider using proxies in `checker.ts`:

```typescript
this.browser = await chromium.launch({
  headless: true,
  proxy: {
    server: 'http://your-proxy:8080',
  },
});
```

## 📚 Architecture

```
UI (LiveCheckButton)
    ↓
API (/api/automation/check)
    ↓
AutomationService
    ↓
Queue (concurrency control)
    ↓
LiveChecker (Playwright)
    ↓
Database (status updates)
```

## ✨ Features

- ✅ Modular & reusable
- ✅ Real-time status updates
- ✅ Screenshot capture
- ✅ Retry logic
- ✅ Concurrent processing
- ✅ Error handling
- ✅ Database persistence

## 🎯 Next Steps

1. Complete installation steps above
2. Test with 1-2 reviews first
3. Verify screenshots are saving
4. Scale up to more reviews
5. Monitor server logs

## 💡 Tips

- Start with small batches (5-10 reviews)
- Check screenshots directory regularly
- Monitor server memory usage
- Use debug mode for troubleshooting
- Keep Playwright updated

## 📞 Support

Check the main automation README for more details:

```
src/lib/automation/README.md
```

---

**Happy automating! 🚀**
